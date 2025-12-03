/**
 * Social Media Image Generator API
 * Generates shareable birth chart images using Canvas and Sharp
 */

import { createCanvas, loadImage, registerFont } from 'canvas';
import sharp from 'sharp';
import { DeveloperBirthChart } from '../../types';
import { logger } from '../monitoring/logger';
import { redisClient } from '../database/redis';

export interface ImageGenerationRequest {
  chartId: string;
  platform: 'twitter' | 'linkedin' | 'instagram' | 'discord';
  theme: 'dark' | 'light' | 'astrology' | 'tech';
  size?: { width: number; height: number };
  customizations?: {
    includeStats?: boolean;
    includeZodiac?: boolean;
    colorScheme?: string;
    fontFamily?: string;
  };
}

export interface ImageGenerationResponse {
  success: boolean;
  imageUrl?: string;
  buffer?: Buffer;
  error?: string;
  metadata?: {
    size: { width: number; height: number };
    format: string;
    sizeBytes: number;
    generationTime: number;
  };
}

export class SocialMediaImageGenerator {
  private fonts: Map<string, string> = new Map();
  private colorSchemes: Record<string, any> = {
    dark: {
      background: '#0a0a0a',
      foreground: '#ffffff',
      accent: '#00ff88',
      secondary: '#333333',
      gradient: ['#00ff88', '#00ccff']
    },
    light: {
      background: '#ffffff',
      foreground: '#1a1a1a',
      accent: '#00ff88',
      secondary: '#f0f0f0',
      gradient: ['#00ff88', '#00ccff']
    },
    astrology: {
      background: '#0a0a2e',
      foreground: '#ffd700',
      accent: '#ff6b6b',
      secondary: '#1a1a4e',
      gradient: ['#ff6b6b', '#ffd700', '#4ecdc4']
    },
    tech: {
      background: '#1a1a2e',
      foreground: '#00ff88',
      accent: '#00ccff',
      secondary: '#16213e',
      gradient: ['#00ff88', '#00ccff', '#0088ff']
    }
  };

  constructor() {
    this.initializeFonts();
  }

  /**
   * Initialize custom fonts
   */
  private initializeFonts(): void {
    try {
      // Register custom fonts (would need actual font files)
      registerFont('Inter', { family: 'Inter', weight: '400' });
      registerFont('InterBold', { family: 'Inter', weight: '700' });
      registerFont('SpaceMono', { family: 'Space Mono', weight: '400' });

      this.fonts.set('inter', 'Inter');
      this.fonts.set('interBold', 'InterBold');
      this.fonts.set('mono', 'Space Mono');

      logger.info('Custom fonts initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize custom fonts', { error });
      // Fall back to system fonts
      this.fonts.set('inter', 'Arial');
      this.fonts.set('interBold', 'Arial');
      this.fonts.set('mono', 'Courier New');
    }
  }

  /**
   * Generate social media image for birth chart
   */
  async generateChartImage(
    chart: DeveloperBirthChart,
    request: ImageGenerationRequest
  ): Promise<ImageGenerationResponse> {
    const startTime = Date.now();

    try {
      logger.info('Generating chart image', {
        chartId: chart.id,
        platform: request.platform,
        theme: request.theme
      });

      const platformSizes = {
        twitter: { width: 1200, height: 675 },
        linkedin: { width: 1200, height: 627 },
        instagram: { width: 1080, height: 1080 },
        discord: { width: 800, height: 600 }
      };

      const size = request.size || platformSizes[request.platform];
      const colorScheme = this.colorSchemes[request.theme];

      // Create canvas
      const canvas = createCanvas(size.width, size.height);
      const ctx = canvas.getContext('2d');

      // Draw background
      this.drawBackground(ctx, size, colorScheme);

      // Draw birth chart visualization
      await this.drawBirthChart(ctx, chart, size, colorScheme);

      // Draw personality insights
      this.drawPersonalityInsights(ctx, chart, size, colorScheme);

      // Draw tech stack
      this.drawTechStack(ctx, chart, size, colorScheme);

      // Draw zodiac elements if requested
      if (request.customizations?.includeZodiac !== false) {
        await this.drawZodiacElements(ctx, chart, size, colorScheme);
      }

      // Draw statistics if requested
      if (request.customizations?.includeStats) {
        this.drawStatistics(ctx, chart, size, colorScheme);
      }

      // Draw branding
      this.drawBranding(ctx, size, colorScheme);

      // Convert to buffer
      const buffer = canvas.toBuffer('image/png');

      // Optimize with Sharp
      const optimizedBuffer = await this.optimizeImage(buffer, request.platform);

      const generationTime = Date.now() - startTime;

      // Generate image URL for caching
      const imageUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/social/image/${chart.id}/${request.platform}/${request.theme}`;

      // Cache the generated image
      await this.cacheImage(chart.id, request, optimizedBuffer);

      logger.info('Successfully generated chart image', {
        chartId: chart.id,
        platform: request.platform,
        generationTime,
        sizeBytes: optimizedBuffer.length
      });

      return {
        success: true,
        imageUrl,
        buffer: optimizedBuffer,
        metadata: {
          size,
          format: 'png',
          sizeBytes: optimizedBuffer.length,
          generationTime
        }
      };

    } catch (error) {
      logger.error('Failed to generate chart image', {
        chartId: chart.id,
        platform: request.platform,
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate image'
      };
    }
  }

  /**
   * Draw background
   */
  private drawBackground(ctx: CanvasRenderingContext2D, size: { width: number; height: number }, colorScheme: any): void {
    // Create gradient background
    const gradient = ctx.createLinearGradient(0, 0, size.width, size.height);
    gradient.addColorStop(0, colorScheme.gradient[0]);
    gradient.addColorStop(1, colorScheme.gradient[1]);

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size.width, size.height);

    // Add subtle grid pattern
    ctx.strokeStyle = colorScheme.secondary + '20';
    ctx.lineWidth = 1;

    const gridSize = 50;
    for (let x = 0; x <= size.width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, size.height);
      ctx.stroke();
    }

    for (let y = 0; y <= size.height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(size.width, y);
      ctx.stroke();
    }
  }

  /**
   * Draw birth chart visualization
   */
  private async drawBirthChart(
    ctx: CanvasRenderingContext2D,
    chart: DeveloperBirthChart,
    size: { width: number; height: number },
    colorScheme: any
  ): Promise<void> {
    const centerX = size.width / 2;
    const centerY = size.height / 2 - 50;
    const radius = Math.min(size.width, size.height) * 0.25;

    // Draw outer circle
    ctx.strokeStyle = colorScheme.accent;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.stroke();

    // Draw zodiac wheel
    this.drawZodiacWheel(ctx, centerX, centerY, radius, colorScheme);

    // Draw personality points
    this.drawPersonalityPoints(ctx, chart, centerX, centerY, radius, colorScheme);

    // Draw connecting lines
    this.drawConnectingLines(ctx, chart, centerX, centerY, radius, colorScheme);
  }

  /**
   * Draw zodiac wheel
   */
  private drawZodiacWheel(
    ctx: CanvasRenderingContext2D,
    centerX: number,
    centerY: number,
    radius: number,
    colorScheme: any
  ): void {
    const zodiacSigns = ['♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓'];
    const angleStep = (2 * Math.PI) / zodiacSigns.length;

    ctx.font = '20px Arial';
    ctx.fillStyle = colorScheme.foreground;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    zodiacSigns.forEach((sign, index) => {
      const angle = index * angleStep - Math.PI / 2;
      const x = centerX + Math.cos(angle) * (radius + 30);
      const y = centerY + Math.sin(angle) * (radius + 30);

      ctx.fillText(sign, x, y);

      // Draw dividing lines
      ctx.strokeStyle = colorScheme.secondary;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(
        centerX + Math.cos(angle) * radius,
        centerY + Math.sin(angle) * radius
      );
      ctx.stroke();
    });
  }

  /**
   * Draw personality points
   */
  private drawPersonalityPoints(
    ctx: CanvasRenderingContext2D,
    chart: DeveloperBirthChart,
    centerX: number,
    centerY: number,
    radius: number,
    colorScheme: any
  ): void {
    const traits = chart.personality.traits.slice(0, 6);
    const angleStep = (2 * Math.PI) / traits.length;

    traits.forEach((trait, index) => {
      const angle = index * angleStep - Math.PI / 2;
      const distance = radius * 0.7; // Place at 70% of radius
      const x = centerX + Math.cos(angle) * distance;
      const y = centerY + Math.sin(angle) * distance;

      // Draw point
      ctx.fillStyle = colorScheme.accent;
      ctx.beginPath();
      ctx.arc(x, y, 8, 0, 2 * Math.PI);
      ctx.fill();

      // Draw trait label
      ctx.fillStyle = colorScheme.foreground;
      ctx.font = '14px Inter';
      ctx.textAlign = 'center';
      ctx.fillText(trait.substring(0, 10), x, y - 15);
    });
  }

  /**
   * Draw connecting lines
   */
  private drawConnectingLines(
    ctx: CanvasRenderingContext2D,
    chart: DeveloperBirthChart,
    centerX: number,
    centerY: number,
    radius: number,
    colorScheme: any
  ): void {
    const traits = chart.personality.traits.slice(0, 6);
    const angleStep = (2 * Math.PI) / traits.length;

    ctx.strokeStyle = colorScheme.accent + '50';
    ctx.lineWidth = 2;

    for (let i = 0; i < traits.length; i++) {
      for (let j = i + 1; j < traits.length; j++) {
        const angle1 = i * angleStep - Math.PI / 2;
        const angle2 = j * angleStep - Math.PI / 2;
        const distance = radius * 0.7;

        const x1 = centerX + Math.cos(angle1) * distance;
        const y1 = centerY + Math.sin(angle1) * distance;
        const x2 = centerX + Math.cos(angle2) * distance;
        const y2 = centerY + Math.sin(angle2) * distance;

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }
    }
  }

  /**
   * Draw personality insights
   */
  private drawPersonalityInsights(
    ctx: CanvasRenderingContext2D,
    chart: DeveloperBirthChart,
    size: { width: number; height: number },
    colorScheme: any
  ): void {
    const boxX = 50;
    const boxY = size.height - 150;
    const boxWidth = size.width - 100;
    const boxHeight = 100;

    // Draw background box
    ctx.fillStyle = colorScheme.background + '80';
    ctx.fillRect(boxX, boxY, boxWidth, boxHeight);

    // Draw border
    ctx.strokeStyle = colorScheme.accent;
    ctx.lineWidth = 2;
    ctx.strokeRect(boxX, boxY, boxWidth, boxHeight);

    // Draw title
    ctx.fillStyle = colorScheme.accent;
    ctx.font = 'bold 18px InterBold';
    ctx.textAlign = 'left';
    ctx.fillText(`🔮 ${chart.personality.zodiacSign} Developer`, boxX + 20, boxY + 30);

    // Draw personality type
    ctx.fillStyle = colorScheme.foreground;
    ctx.font = '16px Inter';
    ctx.fillText(chart.personality.personalityType, boxX + 20, boxY + 55);

    // Draw top traits
    const topTraits = chart.personality.traits.slice(0, 3);
    const traitsText = topTraits.join(' • ');
    ctx.font = '14px Inter';
    ctx.fillText(traitsText, boxX + 20, boxY + 80);
  }

  /**
   * Draw tech stack
   */
  private drawTechStack(
    ctx: CanvasRenderingContext2D,
    chart: DeveloperBirthChart,
    size: { width: number; height: number },
    colorScheme: any
  ): void {
    const boxX = 50;
    const boxY = 50;
    const boxWidth = 250;
    const boxHeight = 120;

    // Draw background box
    ctx.fillStyle = colorScheme.background + '80';
    ctx.fillRect(boxX, boxY, boxWidth, boxHeight);

    // Draw border
    ctx.strokeStyle = colorScheme.accent;
    ctx.lineWidth = 2;
    ctx.strokeRect(boxX, boxY, boxWidth, boxHeight);

    // Draw title
    ctx.fillStyle = colorScheme.accent;
    ctx.font = 'bold 16px InterBold';
    ctx.textAlign = 'left';
    ctx.fillText('💻 Tech Stack', boxX + 15, boxY + 25);

    // Draw languages
    const languages = chart.skills.languages.slice(0, 3);
    ctx.fillStyle = colorScheme.foreground;
    ctx.font = '14px Inter';

    languages.forEach((lang, index) => {
      const y = boxY + 50 + (index * 25);

      // Draw language name
      ctx.fillText(lang.language, boxX + 15, y);

      // Draw proficiency bar
      const barWidth = 100;
      const barHeight = 8;
      const barX = boxX + 120;
      const barY = y - 6;

      // Background bar
      ctx.fillStyle = colorScheme.secondary;
      ctx.fillRect(barX, barY, barWidth, barHeight);

      // Filled bar
      ctx.fillStyle = colorScheme.accent;
      ctx.fillRect(barX, barY, (barWidth * lang.proficiency) / 100, barHeight);

      // Proficiency text
      ctx.fillStyle = colorScheme.foreground;
      ctx.font = '12px Inter';
      ctx.fillText(`${lang.proficiency}%`, barX + barWidth + 10, y);
    });
  }

  /**
   * Draw zodiac elements
   */
  private async drawZodiacElements(
    ctx: CanvasRenderingContext2D,
    chart: DeveloperBirthChart,
    size: { width: number; height: number },
    colorScheme: any
  ): Promise<void> {
    const zodiacEmojis: Record<string, string> = {
      'Aries': '♈',
      'Taurus': '♉',
      'Gemini': '♊',
      'Cancer': '♋',
      'Leo': '♌',
      'Virgo': '♍',
      'Libra': '♎',
      'Scorpio': '♏',
      'Sagittarius': '♐',
      'Capricorn': '♑',
      'Aquarius': '♒',
      'Pisces': '♓'
    };

    const emoji = zodiacEmojis[chart.personality.zodiacSign] || '⭐';
    const centerX = size.width - 100;
    const centerY = 100;

    // Draw zodiac symbol
    ctx.font = '48px Arial';
    ctx.fillStyle = colorScheme.accent;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(emoji, centerX, centerY);

    // Draw zodiac name
    ctx.font = 'bold 18px InterBold';
    ctx.fillStyle = colorScheme.foreground;
    ctx.fillText(chart.personality.zodiacSign, centerX, centerY + 40);
  }

  /**
   * Draw statistics
   */
  private drawStatistics(
    ctx: CanvasRenderingContext2D,
    chart: DeveloperBirthChart,
    size: { width: number; height: number },
    colorScheme: any
  ): void {
    const boxX = size.width - 300;
    const boxY = size.height - 150;
    const boxWidth = 250;
    const boxHeight = 100;

    // Draw background box
    ctx.fillStyle = colorScheme.background + '80';
    ctx.fillRect(boxX, boxY, boxWidth, boxHeight);

    // Draw border
    ctx.strokeStyle = colorScheme.accent;
    ctx.lineWidth = 2;
    ctx.strokeRect(boxX, boxY, boxWidth, boxHeight);

    // Draw stats
    ctx.fillStyle = colorScheme.foreground;
    ctx.font = '14px Inter';
    ctx.textAlign = 'left';

    const stats = [
      `🌟 ${chart.skills.languages.length} Languages`,
      `🏆 ${chart.career.milestones.length} Milestones`,
      `🤝 ${chart.social.collaboration.connections || 0} Connections`
    ];

    stats.forEach((stat, index) => {
      ctx.fillText(stat, boxX + 15, boxY + 30 + (index * 25));
    });
  }

  /**
   * Draw branding
   */
  private drawBranding(
    ctx: CanvasRenderingContext2D,
    size: { width: number; height: number },
    colorScheme: any
  ): void {
    ctx.fillStyle = colorScheme.secondary;
    ctx.font = '12px Inter';
    ctx.textAlign = 'center';
    ctx.fillText('Generated by Developer Birth Chart', size.width / 2, size.height - 20);
    ctx.fillText('@' + process.env.NEXT_PUBLIC_APP_TWITTER || '@devbirthchart', size.width / 2, size.height - 5);
  }

  /**
   * Optimize image for platform
   */
  private async optimizeImage(buffer: Buffer, platform: string): Promise<Buffer> {
    const quality = platform === 'twitter' ? 85 : 90;

    return await sharp(buffer)
      .png({ quality, compressionLevel: 9 })
      .toBuffer();
  }

  /**
   * Cache generated image
   */
  private async cacheImage(chartId: string, request: ImageGenerationRequest, buffer: Buffer): Promise<void> {
    try {
      const cacheKey = `image:${chartId}:${request.platform}:${request.theme}`;
      await redisClient.setex(cacheKey, 86400, buffer.toString('base64')); // Cache for 24 hours
    } catch (error) {
      logger.error('Failed to cache image', { chartId, error });
    }
  }

  /**
   * Get cached image
   */
  async getCachedImage(chartId: string, request: ImageGenerationRequest): Promise<Buffer | null> {
    try {
      const cacheKey = `image:${chartId}:${request.platform}:${request.theme}`;
      const cached = await redisClient.get(cacheKey);
      return cached ? Buffer.from(cached, 'base64') : null;
    } catch (error) {
      logger.error('Failed to get cached image', { chartId, error });
      return null;
    }
  }

  /**
   * Generate image variations
   */
  async generateImageVariations(
    chart: DeveloperBirthChart,
    chartId: string
  ): Promise<Record<string, ImageGenerationResponse>> {
    const platforms: Array<'twitter' | 'linkedin' | 'instagram' | 'discord'> = ['twitter', 'linkedin', 'instagram', 'discord'];
    const themes: Array<'dark' | 'light' | 'astrology' | 'tech'> = ['dark', 'light', 'astrology', 'tech'];

    const results: Record<string, ImageGenerationResponse> = {};

    for (const platform of platforms) {
      for (const theme of themes) {
        const key = `${platform}_${theme}`;
        results[key] = await this.generateChartImage(chart, {
          chartId,
          platform,
          theme,
          customizations: {
            includeStats: platform === 'linkedin',
            includeZodiac: theme !== 'tech'
          }
        });
      }
    }

    return results;
  }

  /**
   * Create animated GIF (placeholder for future implementation)
   */
  async createAnimatedGif(chart: DeveloperBirthChart, request: ImageGenerationRequest): Promise<ImageGenerationResponse> {
    try {
      // This would require additional libraries like gif-encoder
      // For now, return a static image

      const staticResponse = await this.generateChartImage(chart, request);

      return {
        ...staticResponse,
        metadata: {
          ...staticResponse.metadata!,
          format: 'gif'
        }
      };

    } catch (error) {
      return {
        success: false,
        error: 'Animated GIF generation not yet implemented'
      };
    }
  }

  /**
   * Generate story format (vertical)
   */
  async generateStoryFormat(chart: DeveloperBirthChart, request: ImageGenerationRequest): Promise<ImageGenerationResponse> {
    const storyRequest: ImageGenerationRequest = {
      ...request,
      size: { width: 1080, height: 1920 },
      customizations: {
        ...request.customizations,
        includeStats: true,
        includeZodiac: true
      }
    };

    return await this.generateChartImage(chart, storyRequest);
  }

  /**
   * Generate carousel images
   */
  async generateCarouselImages(
    chart: DeveloperBirthChart,
    chartId: string
  ): Promise<ImageGenerationResponse[]> {
    const slides = [
      { type: 'overview', title: 'Developer Birth Chart' },
      { type: 'personality', title: 'Personality Analysis' },
      { type: 'skills', title: 'Technical Skills' },
      { type: 'career', title: 'Career Path' },
      { type: 'compatibility', title: 'Team Dynamics' }
    ];

    const images: ImageGenerationResponse[] = [];

    for (const slide of slides) {
      // Generate individual slide images
      const request: ImageGenerationRequest = {
        chartId,
        platform: 'instagram',
        theme: 'astrology',
        size: { width: 1080, height: 1080 },
        customizations: {
          includeStats: slide.type !== 'overview',
          includeZodiac: slide.type === 'overview'
        }
      };

      const response = await this.generateChartImage(chart, request);
      images.push(response);
    }

    return images;
  }
}

export const imageGenerator = new SocialMediaImageGenerator();