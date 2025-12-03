/**
 * Twitter API v2 Client for Developer Birth Chart
 * Handles automated sharing, engagement tracking, and social media analytics
 */

import { TwitterApi } from 'twitter-api-v2';
import { TwitterConfig, ShareRequest, ShareResponse, DeveloperBirthChart } from '../../types';
import { logger } from '../monitoring/logger';
import { redisClient } from '../database/redis';

export class TwitterClient {
  private client: TwitterApi;
  private config: TwitterConfig;

  constructor(config: TwitterConfig) {
    this.config = config;
    this.client = new TwitterApi(config.bearerToken);
  }

  /**
   * Share developer birth chart to Twitter with viral messaging
   */
  async shareChart(chart: DeveloperBirthChart, request: ShareRequest): Promise<ShareResponse> {
    try {
      logger.info('Sharing chart to Twitter', { chartId: chart.id, username: chart.githubUsername });

      // Generate viral message template
      const message = await this.generateShareMessage(chart, request.message);

      // Generate shareable image if requested
      let mediaIds: string[] = [];
      if (request.image) {
        const imageUrl = await this.generateChartImage(chart);
        mediaIds = await this.uploadImage(imageUrl);
      }

      // Post tweet
      const tweet = await this.client.v2.tweet(message, {
        media: { media_ids: mediaIds }
      });

      // Track share analytics
      await this.trackShare(chart.id, 'twitter', tweet.data.id, message.length, mediaIds.length > 0);

      // Cache share data
      await this.cacheShareData(chart.id, {
        platform: 'twitter',
        postId: tweet.data.id,
        url: `https://twitter.com/user/status/${tweet.data.id}`,
        message,
        hasImage: mediaIds.length > 0,
        timestamp: new Date().toISOString()
      });

      logger.info('Successfully shared to Twitter', {
        chartId: chart.id,
        tweetId: tweet.data.id
      });

      return {
        success: true,
        url: `https://twitter.com/user/status/${tweet.data.id}`,
        postId: tweet.data.id
      };

    } catch (error) {
      logger.error('Failed to share to Twitter', {
        chartId: chart.id,
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to share to Twitter'
      };
    }
  }

  /**
   * Generate viral share message based on personality insights
   */
  private async generateShareMessage(chart: DeveloperBirthChart, customMessage?: string): Promise<string> {
    if (customMessage) {
      return customMessage;
    }

    const { personality, skills, career } = chart;
    const hashtags = [
      '#DeveloperBirthChart',
      '#TechAstrology',
      '#DeveloperPersonality',
      '#CodeAstrology',
      '#TechCommunity'
    ];

    const messageTemplates = [
      `🔮 My Developer Birth Chart is in! I'm a ${personality.zodiacSign} Developer with a ${personality.personalityType} personality type. My coding superpower? ${personality.traits[0]}! What's yours? ${hashtags.join(' ')}`,

      `🚀 Just discovered my tech destiny! As a ${personality.zodiacSign}, I'm naturally drawn to ${skills.languages[0]?.language || 'coding'}. My career trajectory points toward ${career.careerPath}. Find yours! ${hashtags.join(' ')}`,

      `💻✨ My Developer Birth Chart reveals I'm a ${personality.personalityType} with expertise in ${skills.languages.slice(0, 3).map(l => l.language).join(', ')}. My tech zodiac says I'm destined for ${career.potential.seniorDeveloper > 80 ? 'senior development greatness' : 'amazing things'}! ${hashtags.join(' ')}`,

      `🌟 Tech astrology is real! My Developer Birth Chart shows I'm a ${personality.zodiacSign} Developer with ${personality.traits.length} personality traits. My collaboration style is ${social?.collaboration?.style || 'amazing'}! Try it yourself ${hashtags.join(' ')}`,

      `⭐ The stars have aligned for my coding journey! As a ${personality.zodiacSign}, I'm wired for ${skills.languages[0]?.language || 'development'} with a ${personality.personalityType} mindset. My potential roles include ${Object.entries(career.potential).filter(([_, score]) => score > 70).map(([role]) => role).join(', ')}! ${hashtags.join(' ')}`
    ];

    const selectedTemplate = messageTemplates[Math.floor(Math.random() * messageTemplates.length)];

    // Ensure message is within Twitter's character limit
    if (selectedTemplate.length <= 280) {
      return selectedTemplate;
    }

    // Truncate if too long
    return selectedTemplate.substring(0, 277) + '...';
  }

  /**
   * Generate shareable chart image using Canvas API
   */
  private async generateChartImage(chart: DeveloperBirthChart): Promise<string> {
    try {
      // This would integrate with the image generation API
      const imageUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/social/chart-image/${chart.id}`;
      return imageUrl;
    } catch (error) {
      logger.error('Failed to generate chart image', { chartId: chart.id, error });
      throw new Error('Failed to generate chart image');
    }
  }

  /**
   * Upload image to Twitter
   */
  private async uploadImage(imageUrl: string): Promise<string[]> {
    try {
      // Download image
      const response = await fetch(imageUrl);
      const buffer = Buffer.from(await response.arrayBuffer());

      // Upload to Twitter
      const mediaId = await this.client.v1.uploadMedia(buffer, { type: 'png' });

      return [mediaId];
    } catch (error) {
      logger.error('Failed to upload image to Twitter', { imageUrl, error });
      return [];
    }
  }

  /**
   * Track share analytics
   */
  private async trackShare(chartId: string, platform: string, postId: string, messageLength: number, hasImage: boolean): Promise<void> {
    try {
      const analyticsData = {
        event: 'chart_shared',
        chartId,
        platform,
        postId,
        messageLength,
        hasImage,
        timestamp: new Date().toISOString()
      };

      // Send to analytics service
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/analytics/track`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(analyticsData)
      });

      logger.info('Share analytics tracked', { chartId, platform, postId });
    } catch (error) {
      logger.error('Failed to track share analytics', { chartId, error });
    }
  }

  /**
   * Cache share data for quick retrieval
   */
  private async cacheShareData(chartId: string, shareData: any): Promise<void> {
    try {
      const cacheKey = `share:twitter:${chartId}`;
      await redisClient.setex(cacheKey, 86400, JSON.stringify(shareData)); // Cache for 24 hours
    } catch (error) {
      logger.error('Failed to cache share data', { chartId, error });
    }
  }

  /**
   * Get engagement metrics for shared content
   */
  async getEngagementMetrics(postId: string): Promise<any> {
    try {
      const tweet = await this.client.v2.singleTweet(postId, {
        'tweet.fields': ['public_metrics', 'created_at']
      });

      const metrics = tweet.data.public_metrics;

      return {
        postId,
        likes: metrics.like_count,
        retweets: metrics.retweet_count,
        replies: metrics.reply_count,
        quotes: metrics.quote_count,
        impressions: metrics.impression_count,
        createdAt: tweet.data.created_at,
        engagementRate: this.calculateEngagementRate(metrics)
      };

    } catch (error) {
      logger.error('Failed to get engagement metrics', { postId, error });
      throw new Error('Failed to retrieve engagement metrics');
    }
  }

  /**
   * Calculate engagement rate
   */
  private calculateEngagementRate(metrics: any): number {
    const totalEngagements = metrics.like_count + metrics.retweet_count + metrics.reply_count;
    const impressions = metrics.impression_count || 1;
    return (totalEngagements / impressions) * 100;
  }

  /**
   * Monitor trending topics and hashtags for optimization
   */
  async getTrendingTopics(woeId: number = 1): Promise<any[]> {
    try {
      const trends = await this.client.v1.trends({
        id: woeId
      });

      return trends[0]?.trends || [];
    } catch (error) {
      logger.error('Failed to get trending topics', { error });
      return [];
    }
  }

  /**
   * Analyze viral potential of content
   */
  async analyzeViralPotential(message: string, hashtags: string[]): Promise<{
    score: number;
    factors: string[];
    recommendations: string[];
  }> {
    let score = 0;
    const factors: string[] = [];
    const recommendations: string[] = [];

    // Length analysis
    if (message.length < 200) {
      score += 20;
      factors.push('Optimal length for readability');
    } else {
      recommendations.push('Consider shorter message for better engagement');
    }

    // Hashtag analysis
    if (hashtags.length >= 3 && hashtags.length <= 5) {
      score += 15;
      factors.push('Good hashtag balance');
    } else if (hashtags.length > 5) {
      recommendations.push('Too many hashtags may reduce engagement');
    }

    // Emoji analysis
    const emojiCount = (message.match(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu) || []).length;
    if (emojiCount >= 2 && emojiCount <= 4) {
      score += 10;
      factors.push('Effective emoji usage');
    }

    // Question analysis
    if (message.includes('?')) {
      score += 15;
      factors.push('Engaging question format');
    }

    // Call-to-action analysis
    if (message.toLowerCase().includes('try') || message.toLowerCase().includes('find') || message.toLowerCase().includes('discover')) {
      score += 10;
      factors.push('Clear call-to-action');
    }

    // Viral keywords
    const viralKeywords = ['astrology', 'personality', 'developer', 'coding', 'tech', 'zodiac', 'stars', 'destiny'];
    const keywordMatches = viralKeywords.filter(keyword =>
      message.toLowerCase().includes(keyword.toLowerCase())
    ).length;

    if (keywordMatches >= 3) {
      score += 20;
      factors.push('Strong viral keyword usage');
    }

    return {
      score: Math.min(score, 100),
      factors,
      recommendations
    };
  }

  /**
   * Create Twitter thread for extended content
   */
  async createThread(chart: DeveloperBirthChart): Promise<ShareResponse> {
    try {
      const tweets = [
        `🔮 My Developer Birth Chart Thread 🧵\n\nPart 1: I'm a ${chart.personality.zodiacSign} Developer with a ${chart.personality.personalityType} personality type! #DeveloperBirthChart #TechAstrology`,

        `Part 2: My coding superpowers include ${chart.personality.traits.slice(0, 3).join(', ')}. My primary language is ${chart.skills.languages[0]?.language || 'coding'}! 💻✨`,

        `Part 3: Career-wise, the stars align for ${chart.career.careerPath}. My potential shows ${Math.max(...Object.values(chart.career.potential))}% likelihood for success! 🚀`,

        `Part 4: I work best in ${chart.social.collaboration.style} environments. My collaboration style is ${chart.social.collaboration.communication}! 👥`,

        `Part 5: Want to discover YOUR tech destiny? Generate your Developer Birth Chart and see what the stars have in store for your coding journey! 🌟 #CodeAstrology`
      ];

      const tweetIds: string[] = [];
      let previousTweetId: string | undefined;

      for (const tweetText of tweets) {
        const tweet = await this.client.v2.tweet(tweetText, {
          reply: previousTweetId ? { in_reply_to_tweet_id: previousTweetId } : undefined
        });

        tweetIds.push(tweet.data.id);
        previousTweetId = tweet.data.id;

        // Small delay between tweets
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      const threadUrl = `https://twitter.com/user/status/${tweetIds[0]}`;

      // Track thread analytics
      await this.trackShare(chart.id, 'twitter_thread', tweetIds[0], tweets.join(' ').length, false);

      return {
        success: true,
        url: threadUrl,
        postId: tweetIds[0]
      };

    } catch (error) {
      logger.error('Failed to create Twitter thread', { chartId: chart.id, error });
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create Twitter thread'
      };
    }
  }
}

export const twitterClient = new TwitterClient({
  apiKey: process.env.TWITTER_API_KEY!,
  apiSecret: process.env.TWITTER_API_SECRET!,
  accessToken: process.env.TWITTER_ACCESS_TOKEN!,
  accessTokenSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET!,
  bearerToken: process.env.TWITTER_BEARER_TOKEN!,
  clientId: process.env.TWITTER_CLIENT_ID!,
  clientSecret: process.env.TWITTER_CLIENT_SECRET!
});