/**
 * LinkedIn API Client for Professional Developer Birth Chart Sharing
 * Handles professional networking, career insights sharing, and B2B engagement
 */

import { LinkedInConfig, ShareRequest, ShareResponse, DeveloperBirthChart } from '../../types';
import { logger } from '../monitoring/logger';
import { redisClient } from '../database/redis';

export interface LinkedInProfile {
  id: string;
  firstName: string;
  lastName: string;
  headline: string;
  location: string;
  industry: string;
  summary: string;
  experience: LinkedInExperience[];
  skills: LinkedInSkill[];
  education: LinkedInEducation[];
}

export interface LinkedInExperience {
  id: string;
  title: string;
  company: string;
  location: string;
  startDate: string;
  endDate?: string;
  description: string;
}

export interface LinkedInSkill {
  id: string;
  name: string;
  endorsements: number;
}

export interface LinkedInEducation {
  id: string;
  school: string;
  degree: string;
  field: string;
  startDate: string;
  endDate?: string;
}

export class LinkedInClient {
  private config: LinkedInConfig;
  private accessToken: string | null = null;

  constructor(config: LinkedInConfig) {
    this.config = config;
  }

  /**
   * Authenticate with LinkedIn OAuth 2.0
   */
  async authenticate(code: string): Promise<string> {
    try {
      const response = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code,
          redirect_uri: this.config.redirectUri,
          client_id: this.config.clientId,
          client_secret: this.config.clientSecret,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(`LinkedIn auth failed: ${data.error_description || 'Unknown error'}`);
      }

      this.accessToken = data.access_token;
      return this.accessToken;
    } catch (error) {
      logger.error('LinkedIn authentication failed', { error });
      throw error;
    }
  }

  /**
   * Share developer birth chart as professional post
   */
  async shareChart(chart: DeveloperBirthChart, request: ShareRequest): Promise<ShareResponse> {
    try {
      logger.info('Sharing chart to LinkedIn', { chartId: chart.id, username: chart.githubUsername });

      const message = await this.generateProfessionalMessage(chart, request.message);

      const postData = {
        author: `urn:li:person:${await this.getProfileId()}`,
        lifecycleState: 'PUBLISHED',
        specificContent: {
          'com.linkedin.ugc.ShareContent': {
            shareCommentary: {
              text: message
            },
            shareMediaCategory: 'NONE'
          }
        },
        visibility: {
          'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
        }
      };

      // Add image if requested
      if (request.image) {
        const asset = await this.uploadChartImage(chart);
        postData.specificContent['com.linkedin.ugc.ShareContent'].shareMediaCategory = 'IMAGE';
        postData.specificContent['com.linkedin.ugc.ShareContent'].media = [
          {
            status: 'READY',
            description: {
              text: `Developer Birth Chart for @${chart.githubUsername}`
            },
            source: asset,
            title: {
              text: 'Developer Birth Chart Analysis'
            },
            id: await this.registerImageAsset(asset)
          }
        ];
      }

      const response = await fetch('https://api.linkedin.com/v2/ugcPosts', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(`LinkedIn share failed: ${data.message || 'Unknown error'}`);
      }

      // Track share analytics
      await this.trackShare(chart.id, 'linkedin', data.id, message.length, request.image || false);

      // Cache share data
      await this.cacheShareData(chart.id, {
        platform: 'linkedin',
        postId: data.id,
        url: `https://www.linkedin.com/feed/update/${data.id}`,
        message,
        hasImage: !!request.image,
        timestamp: new Date().toISOString()
      });

      logger.info('Successfully shared to LinkedIn', {
        chartId: chart.id,
        postId: data.id
      });

      return {
        success: true,
        url: `https://www.linkedin.com/feed/update/${data.id}`,
        postId: data.id
      };

    } catch (error) {
      logger.error('Failed to share to LinkedIn', {
        chartId: chart.id,
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to share to LinkedIn'
      };
    }
  }

  /**
   * Generate professional LinkedIn message
   */
  private async generateProfessionalMessage(chart: DeveloperBirthChart, customMessage?: string): Promise<string> {
    if (customMessage) {
      return customMessage;
    }

    const { personality, skills, career, social } = chart;

    const professionalTemplates = [
      `🚀 Excited to share my Developer Birth Chart analysis! As a ${personality.zodiacSign} Developer with a ${personality.personalityType} personality, I've discovered that my natural strengths in ${personality.traits.slice(0, 2).join(' and ')} make me particularly well-suited for ${career.careerPath}.

My technical expertise spans ${skills.languages.slice(0, 3).map(l => l.language).join(', ')} with a collaborative style that thrives in ${social.collaboration.style} environments.

The insights from this personality-driven approach to developer analytics are fascinating for team building and career development. Would love to connect with others interested in the intersection of personality and tech!

#DeveloperAnalytics #CareerDevelopment #TechLeadership #PersonalityAssessment #SoftwareEngineering`,

      `💡 Just completed my Developer Birth Chart analysis and the results are illuminating! The analysis revealed my ${personality.zodiacSign} developer personality shows strengths in ${personality.traits.slice(0, 3).join(', ')}, with career potential showing ${Math.max(...Object.values(career.potential))% for senior technical roles.

Key findings:
• Primary strengths: ${personality.traits.slice(0, 2).join(', ')}
• Technical expertise: ${skills.languages.slice(0, 2).map(l => l.language).join(' and ')}
• Ideal work environment: ${social.collaboration.style}
• Career trajectory: ${career.careerPath}

This personality-based approach to developer analytics could revolutionize how we build teams and plan career paths in tech. Thoughts from my network?

#TechTrends #DeveloperPersonality #CareerInsights #TeamBuilding #SoftwareDevelopment`,

      `🎯 New insights from my Developer Birth Chart! As someone who identifies as a ${personality.personalityType}, the analysis confirmed that my natural coding style aligns with ${skills.languages[0]?.language || 'development'}, with collaboration patterns that work best in ${social.collaboration.communication} team settings.

The career analysis suggests strong potential in ${Object.entries(career.potential).filter(([_, score]) => score > 75).map(([role]) => role.replace(/([A-Z])/g, ' $1').trim()).join(', ')} roles. This data-driven approach to understanding developer personality and career fit could be valuable for:

• Technical recruiters seeking better matches
• Engineering managers building balanced teams
• Developers planning career transitions
• HR professionals implementing personality-based team building

Would love to hear others' experiences with personality-based professional development tools!

#EngineeringManagement #TechRecruitment #ProfessionalDevelopment #DataDrivenHR #DeveloperTools`,

      `✨ Fascinating results from my Developer Birth Chart analysis! The system identified me as a ${personality.zodiacSign} Developer with ${personality.traits.length} key personality traits that influence my coding style and collaboration approach.

Notable insights:
🔧 Technical Strengths: ${skills.languages.slice(0, 3).map(l => `${l.language} (${l.experience})`).join(', ')}
👥 Collaboration Style: ${social.collaboration.style}
📈 Career Alignment: ${career.careerPath}
🎯 High-Potential Roles: ${Object.entries(career.potential).filter(([_, score]) => score > 70).map(([role]) => role.replace(/([A-Z])/g, ' $1').trim()).join(', ')}

This blend of astrological-inspired analysis and technical data provides a unique perspective on developer personality and career planning. Could this approach help build more effective engineering teams? Curious to hear from tech leaders and recruiters!

#InnovationInTech #DeveloperAnalytics #EngineeringExcellence #CareerGrowth #TechInnovation`
    ];

    const selectedTemplate = professionalTemplates[Math.floor(Math.random() * professionalTemplates.length)];
    return selectedTemplate;
  }

  /**
   * Upload chart image to LinkedIn
   */
  private async uploadChartImage(chart: DeveloperBirthChart): Promise<string> {
    try {
      // Generate chart image
      const imageUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/social/chart-image/${chart.id}`;

      // Download image
      const response = await fetch(imageUrl);
      const imageBuffer = Buffer.from(await response.arrayBuffer());

      // Register upload request
      const uploadResponse = await fetch('https://api.linkedin.com/v2/assets?action=registerUpload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          registerUploadRequest: {
            recipes: [
              'urn:li:digitalmediaRecipe:feedshare-image'
            ],
            owner: `urn:li:person:${await this.getProfileId()}`,
            serviceRelationships: [
              {
                relationshipType: 'OWNER',
                identifier: 'urn:li:userGeneratedContent'
              }
            ],
            supportedUploadMechanism: [
              'SYNCHRONOUS_UPLOAD'
            ]
          }
        }),
      });

      const uploadData = await uploadResponse.json();
      const uploadUrl = uploadData.value.uploadMechanism['com.linkedin.digitalmedia.mediauploadhandshake'].uploadUrl;
      const asset = uploadData.value.asset;

      // Upload image
      await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/octet-stream',
        },
        body: imageBuffer,
      });

      return asset;
    } catch (error) {
      logger.error('Failed to upload image to LinkedIn', { chartId: chart.id, error });
      throw new Error('Failed to upload image to LinkedIn');
    }
  }

  /**
   * Register image asset
   */
  private async registerImageAsset(asset: string): Promise<string> {
    return asset.split(':').pop() || asset;
  }

  /**
   * Get profile ID from LinkedIn
   */
  private async getProfileId(): Promise<string> {
    try {
      const response = await fetch('https://api.linkedin.com/v2/people/~:(id)', {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
        },
      });

      const data = await response.json();
      return data.id;
    } catch (error) {
      logger.error('Failed to get LinkedIn profile ID', { error });
      throw new Error('Failed to get LinkedIn profile ID');
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

      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/analytics/track`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(analyticsData)
      });

      logger.info('LinkedIn share analytics tracked', { chartId, postId });
    } catch (error) {
      logger.error('Failed to track LinkedIn share analytics', { chartId, error });
    }
  }

  /**
   * Cache share data
   */
  private async cacheShareData(chartId: string, shareData: any): Promise<void> {
    try {
      const cacheKey = `share:linkedin:${chartId}`;
      await redisClient.setex(cacheKey, 86400, JSON.stringify(shareData));
    } catch (error) {
      logger.error('Failed to cache LinkedIn share data', { chartId, error });
    }
  }

  /**
   * Get engagement metrics for LinkedIn posts
   */
  async getEngagementMetrics(postId: string): Promise<any> {
    try {
      const response = await fetch(`https://api.linkedin.com/v2/socialActions/${postId}`, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
        },
      });

      const data = await response.json();

      return {
        postId,
        likes: data.totalShares || 0,
        comments: data.totalComments || 0,
        shares: data.totalShares || 0,
        views: data.totalViews || 0,
        engagementRate: this.calculateEngagementRate(data)
      };
    } catch (error) {
      logger.error('Failed to get LinkedIn engagement metrics', { postId, error });
      throw new Error('Failed to retrieve LinkedIn engagement metrics');
    }
  }

  /**
   * Calculate engagement rate
   */
  private calculateEngagementRate(metrics: any): number {
    const totalEngagements = (metrics.totalShares || 0) + (metrics.totalComments || 0) + (metrics.totalLikes || 0);
    const views = metrics.totalViews || 1;
    return (totalEngagements / views) * 100;
  }

  /**
   * Generate professional article based on birth chart
   */
  async generateProfessionalArticle(chart: DeveloperBirthChart): Promise<ShareResponse> {
    try {
      const articleContent = `
# Developer Personality Analysis: The Intersection of Astrology and Technology

## Introduction

As technology continues to evolve, we're finding innovative ways to understand and optimize team dynamics and career development. One fascinating approach combines personality psychology with data analytics to provide insights into developer strengths and career trajectories.

## My Developer Birth Chart Analysis

Recently, I completed a comprehensive Developer Birth Chart analysis that revealed fascinating insights about my technical profile and career potential.

### Personality Profile

The analysis identified me as a ${chart.personality.zodiacSign} Developer with a ${chart.personality.personalityType} personality type. Key personality traits include:

${chart.personality.traits.map(trait => `- ${trait}`).join('\n')}

### Technical Expertise

My technical strengths span multiple areas:

**Programming Languages:**
${chart.skills.languages.map(lang => `- ${lang.language}: ${lang.proficiency}% proficiency, ${lang.experience} experience`).join('\n')}

**Frameworks & Tools:**
${chart.skills.frameworks.map(framework => `- ${framework.framework}: ${framework.proficiency}% proficiency`).join('\n')}

### Career Trajectory

The career analysis suggests my strongest potential lies in:

${Object.entries(chart.career.potential)
  .filter(([_, score]) => score > 70)
  .sort(([_, a], [__, b]) => b - a)
  .map(([role, score]) => `- ${role.replace(/([A-Z])/g, ' $1').trim()}: ${score}% potential`)
  .join('\n')}

### Collaboration Style

My approach to teamwork and communication is characterized by:
- Style: ${chart.social.collaboration.style}
- Communication: ${chart.social.collaboration.communication}
- Teamwork: ${chart.social.collaboration.teamwork}

## Applications for Tech Teams

This type of personality-driven analysis has significant implications for:

1. **Team Composition**: Building balanced teams with complementary personalities
2. **Career Development**: Helping developers find roles that align with their natural strengths
3. **Hiring Decisions**: Making more informed recruitment choices
4. **Project Management**: Assigning tasks based on personality strengths
5. **Leadership Development**: Identifying and nurturing future tech leaders

## The Science Behind It

While the "astrology" framing adds an engaging layer, the underlying analysis combines:

- Behavioral psychology
- Technical skill assessment
- Career trajectory modeling
- Collaboration pattern analysis
- Performance metrics

This data-driven approach provides actionable insights for both individual developers and organizations.

## Conclusion

Understanding developer personality through comprehensive analysis offers a new dimension to team building and career development in technology. By recognizing and leveraging these insights, we can build more effective teams and create more fulfilling career paths for developers.

*What are your thoughts on personality-based developer analytics? Have you used similar approaches in your organization?*

#DeveloperAnalytics #TechLeadership #CareerDevelopment #TeamBuilding #EngineeringManagement
      `;

      const articleData = {
        author: `urn:li:person:${await this.getProfileId()}`,
        lifecycleState: 'PUBLISHED',
        specificContent: {
          'com.linkedin.ugc.ShareContent': {
            shareCommentary: {
              text: 'Exploring the fascinating intersection of personality analysis and developer analytics. Here are my insights from a comprehensive Developer Birth Chart analysis.'
            },
            shareMediaCategory: 'ARTICLE',
            media: [
              {
                status: 'READY',
                description: {
                  text: 'An in-depth analysis of developer personality and career potential through data-driven insights'
                },
                originalUrl: `${process.env.NEXT_PUBLIC_API_URL}/blog/developer-birth-chart-analysis`,
                title: {
                  text: 'Developer Personality Analysis: The Intersection of Astrology and Technology'
                },
                text: articleContent
              }
            ]
          }
        },
        visibility: {
          'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
        }
      };

      const response = await fetch('https://api.linkedin.com/v2/ugcPosts', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(articleData),
      });

      const data = await response.json();

      return {
        success: true,
        url: `https://www.linkedin.com/feed/update/${data.id}`,
        postId: data.id
      };

    } catch (error) {
      logger.error('Failed to create LinkedIn article', { chartId: chart.id, error });
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create LinkedIn article'
      };
    }
  }
}

export const linkedInClient = new LinkedInClient({
  clientId: process.env.LINKEDIN_CLIENT_ID!,
  clientSecret: process.env.LINKEDIN_CLIENT_SECRET!,
  redirectUri: process.env.LINKEDIN_REDIRECT_URI!,
  scope: [
    'r_liteprofile',
    'r_emailaddress',
    'w_member_social',
    'rw_company_admin',
    'w_share'
  ]
});