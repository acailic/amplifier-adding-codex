/**
 * Email Service Integration (SendGrid/Postmark)
 * Handles transactional emails, notifications, and marketing communications
 */

import sendgrid from '@sendgrid/mail';
import { logger } from '../monitoring/logger';
import { redisClient } from '../database/redis';

export interface EmailConfig {
  provider: 'sendgrid' | 'postmark';
  apiKey: string;
  fromEmail: string;
  fromName: string;
  replyToEmail?: string;
}

export interface EmailRequest {
  to: string | string[];
  subject: string;
  templateId?: string;
  templateData?: Record<string, any>;
  html?: string;
  text?: string;
  attachments?: EmailAttachment[];
  categories?: string[];
  metadata?: Record<string, any>;
  sendAt?: Date;
}

export interface EmailAttachment {
  content: string;
  filename: string;
  type: string;
  disposition?: string;
  contentId?: string;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  htmlContent: string;
  textContent: string;
  variables: string[];
  categories: string[];
}

export interface EmailAnalytics {
  emailId: string;
  messageId: string;
  status: 'sent' | 'delivered' | 'opened' | 'clicked' | 'bounced' | 'spam' | 'unsubscribed';
  timestamp: string;
  events: EmailEvent[];
}

export interface EmailEvent {
  event: string;
  timestamp: string;
  ip?: string;
  userAgent?: string;
  url?: string;
  reason?: string;
}

export class EmailClient {
  private config: EmailConfig;
  private client: any;
  private templates: Map<string, EmailTemplate> = new Map();

  constructor(config: EmailConfig) {
    this.config = config;
    this.initializeClient();
    this.loadTemplates();
  }

  /**
   * Initialize email client based on provider
   */
  private initializeClient(): void {
    if (this.config.provider === 'sendgrid') {
      this.client = sendgrid.setApiKey(this.config.apiKey);
    } else if (this.config.provider === 'postmark') {
      // Initialize Postmark client
      this.client = {
        // Postmark client implementation
        send: async (email: any) => {
          // Mock implementation - would use actual Postmark SDK
          logger.info('Postmark email send (mock)', { email });
          return { messageId: 'mock-message-id' };
        }
      };
    } else {
      throw new Error(`Unsupported email provider: ${this.config.provider}`);
    }
  }

  /**
   * Load email templates
   */
  private async loadTemplates(): Promise<void> {
    try {
      // Load predefined templates
      const templates: EmailTemplate[] = [
        {
          id: 'birth-chart-ready',
          name: 'Birth Chart Ready',
          subject: 'Your Developer Birth Chart is Ready!',
          htmlContent: this.getBirthChartReadyTemplate(),
          textContent: this.getBirthChartReadyTextTemplate(),
          variables: ['username', 'chartUrl', 'personalityType', 'zodiacSign'],
          categories: ['birth-chart', 'notifications']
        },
        {
          id: 'team-analysis-complete',
          name: 'Team Analysis Complete',
          subject: 'Team Analysis Results Are Available',
          htmlContent: this.getTeamAnalysisTemplate(),
          textContent: this.getTeamAnalysisTextTemplate(),
          variables: ['teamName', 'synergyScore', 'memberCount', 'analysisUrl'],
          categories: ['team-analysis', 'notifications']
        },
        {
          id: 'subscription-welcome',
          name: 'Subscription Welcome',
          subject: 'Welcome to Developer Birth Chart Premium!',
          htmlContent: this.getSubscriptionWelcomeTemplate(),
          textContent: this.getSubscriptionWelcomeTextTemplate(),
          variables: ['name', 'planName', 'features'],
          categories: ['subscription', 'welcome']
        },
        {
          id: 'payment-receipt',
          name: 'Payment Receipt',
          subject: 'Payment Confirmation - Developer Birth Chart',
          htmlContent: this.getPaymentReceiptTemplate(),
          textContent: this.getPaymentReceiptTextTemplate(),
          variables: ['amount', 'currency', 'planName', 'transactionId', 'date'],
          categories: ['payment', 'receipt']
        },
        {
          id: 'marketplace-purchase',
          name: 'Marketplace Purchase',
          subject: 'Your Marketplace Purchase Confirmation',
          htmlContent: this.getMarketplacePurchaseTemplate(),
          textContent: this.getMarketplacePurchaseTextTemplate(),
          variables: ['productName', 'sellerName', 'amount', 'deliveryTime', 'purchaseId'],
          categories: ['marketplace', 'purchase']
        },
        {
          id: 'security-alert',
          name: 'Security Alert',
          subject: 'Security Alert for Your Developer Birth Chart Account',
          htmlContent: this.getSecurityAlertTemplate(),
          textContent: this.getSecurityAlertTextTemplate(),
          variables: ['alertType', 'location', 'device', 'timestamp'],
          categories: ['security', 'alerts']
        }
      ];

      templates.forEach(template => {
        this.templates.set(template.id, template);
      });

      logger.info('Email templates loaded', { count: templates.length });

    } catch (error) {
      logger.error('Failed to load email templates', { error });
    }
  }

  /**
   * Send email
   */
  async sendEmail(emailRequest: EmailRequest): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      logger.info('Sending email', {
        provider: this.config.provider,
        to: emailRequest.to,
        subject: emailRequest.subject,
        templateId: emailRequest.templateId
      });

      let result: any;

      if (this.config.provider === 'sendgrid') {
        result = await this.sendSendGridEmail(emailRequest);
      } else if (this.config.provider === 'postmark') {
        result = await this.sendPostmarkEmail(emailRequest);
      }

      // Cache email send result
      await this.cacheEmailSend(emailRequest, result);

      logger.info('Email sent successfully', {
        messageId: result.messageId,
        provider: this.config.provider
      });

      return {
        success: true,
        messageId: result.messageId
      };

    } catch (error) {
      logger.error('Failed to send email', {
        provider: this.config.provider,
        error: error instanceof Error ? error.message : 'Unknown error',
        to: emailRequest.to
      });

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send email'
      };
    }
  }

  /**
   * Send SendGrid email
   */
  private async sendSendGridEmail(emailRequest: EmailRequest): Promise<any> {
    const msg = {
      to: emailRequest.to,
      from: {
        email: this.config.fromEmail,
        name: this.config.fromName
      },
      subject: emailRequest.subject,
      categories: emailRequest.categories || ['general'],
      metadata: emailRequest.metadata,
    };

    if (emailRequest.templateId) {
      // Send template email
      msg.templateId = emailRequest.templateId;
      msg.dynamicTemplateData = emailRequest.templateData;
    } else {
      // Send regular email
      msg.html = emailRequest.html;
      msg.text = emailRequest.text;
    }

    if (emailRequest.attachments) {
      msg.attachments = emailRequest.attachments.map(attachment => ({
        content: attachment.content,
        filename: attachment.filename,
        type: attachment.type,
        disposition: attachment.disposition || 'attachment',
        contentId: attachment.contentId
      }));
    }

    if (emailRequest.sendAt) {
      msg.sendAt = emailRequest.sendAt;
    }

    const response = await this.client.send(msg);
    return response;
  }

  /**
   * Send Postmark email
   */
  private async sendPostmarkEmail(emailRequest: EmailRequest): Promise<any> {
    const postmarkEmail = {
      From: `${this.config.fromName} <${this.config.fromEmail}>`,
      To: Array.isArray(emailRequest.to) ? emailRequest.to.join(', ') : emailRequest.to,
      Subject: emailRequest.subject,
      HtmlBody: emailRequest.html,
      TextBody: emailRequest.text,
      Tag: emailRequest.categories,
      Metadata: emailRequest.metadata
    };

    if (emailRequest.attachments) {
      postmarkEmail.Attachments = emailRequest.attachments.map(attachment => ({
        Name: attachment.filename,
        Content: attachment.content,
        ContentType: attachment.type
      }));
    }

    return await this.client.send(postmarkEmail);
  }

  /**
   * Send birth chart ready email
   */
  async sendBirthChartReadyEmail(
    toEmail: string,
    username: string,
    chartUrl: string,
    personality: any,
    options: { includePreview?: boolean; customMessage?: string } = {}
  ): Promise<{ success: boolean; messageId?: string }> {
    const templateData = {
      username,
      chartUrl,
      personalityType: personality.personalityType,
      zodiacSign: personality.zodiacSign,
      includePreview: options.includePreview || false,
      customMessage: options.customMessage || ''
    };

    const result = await this.sendEmail({
      to: toEmail,
      templateId: 'birth-chart-ready',
      templateData,
      categories: ['birth-chart', 'notifications']
    });

    return result;
  }

  /**
   * Send team analysis completion email
   */
  async sendTeamAnalysisEmail(
    toEmail: string,
    teamName: string,
    analysisUrl: string,
    analysis: any
  ): Promise<{ success: boolean; messageId?: string }> {
    const templateData = {
      teamName,
      synergyScore: analysis.synergy.overall,
      memberCount: analysis.members.length,
      analysisUrl,
      topRecommendations: analysis.recommendations.slice(0, 3)
    };

    const result = await this.sendEmail({
      to: toEmail,
      templateId: 'team-analysis-complete',
      templateData,
      categories: ['team-analysis', 'notifications']
    });

    return result;
  }

  /**
   * Send subscription welcome email
   */
  async sendSubscriptionWelcomeEmail(
    toEmail: string,
    name: string,
    planName: string,
    features: string[]
  ): Promise<{ success: boolean; messageId?: string }> {
    const templateData = {
      name,
      planName,
      features: features.join(', ')
    };

    const result = await this.sendEmail({
      to: toEmail,
      templateId: 'subscription-welcome',
      templateData,
      categories: ['subscription', 'welcome']
    });

    return result;
  }

  /**
   * Send payment receipt email
   */
  async sendPaymentReceiptEmail(
    toEmail: string,
    paymentDetails: {
      amount: number;
      currency: string;
      planName: string;
      transactionId: string;
      date: string;
    }
  ): Promise<{ success: boolean; messageId?: string }> {
    const templateData = {
      amount: (paymentDetails.amount / 100).toFixed(2),
      currency: paymentDetails.currency,
      planName: paymentDetails.planName,
      transactionId: paymentDetails.transactionId,
      date: new Date(paymentDetails.date).toLocaleDateString()
    };

    const result = await this.sendEmail({
      to: toEmail,
      templateId: 'payment-receipt',
      templateData,
      categories: ['payment', 'receipt'],
      attachments: [
        {
          content: JSON.stringify(paymentDetails, null, 2),
          filename: `receipt-${paymentDetails.transactionId}.json`,
          type: 'application/json'
        }
      ]
    });

    return result;
  }

  /**
   * Send marketplace purchase confirmation
   */
  async sendMarketplacePurchaseEmail(
    toEmail: string,
    purchaseDetails: {
      productName: string;
      sellerName: string;
      amount: number;
      currency: string;
      deliveryTime: string;
      purchaseId: string;
    }
  ): Promise<{ success: boolean; messageId?: string }> {
    const templateData = {
      productName: purchaseDetails.productName,
      sellerName: purchaseDetails.sellerName,
      amount: (purchaseDetails.amount / 100).toFixed(2),
      currency: purchaseDetails.currency,
      deliveryTime: purchaseDetails.deliveryTime,
      purchaseId: purchaseDetails.purchaseId
    };

    const result = await this.sendEmail({
      to: toEmail,
      templateId: 'marketplace-purchase',
      templateData,
      categories: ['marketplace', 'purchase']
    });

    return result;
  }

  /**
   * Send security alert email
   */
  async sendSecurityAlertEmail(
    toEmail: string,
    alertDetails: {
      alertType: string;
      location: string;
      device: string;
      timestamp: string;
      actionRequired?: boolean;
    }
  ): Promise<{ success: boolean; messageId?: string }> {
    const templateData = {
      alertType: alertDetails.alertType,
      location: alertDetails.location,
      device: alertDetails.device,
      timestamp: new Date(alertDetails.timestamp).toLocaleString(),
      actionRequired: alertDetails.actionRequired || false
    };

    const result = await this.sendEmail({
      to: toEmail,
      templateId: 'security-alert',
      templateData,
      categories: ['security', 'alerts'],
      priority: 'high'
    });

    return result;
  }

  /**
   * Send batch email
   */
  async sendBatchEmail(
    emails: EmailRequest[],
    options: { rateLimit?: number; delay?: number } = {}
  ): Promise<{ success: boolean; results: any[]; failedCount: number }> {
    const { rateLimit = 10, delay = 1000 } = options;
    const results: any[] = [];
    let failedCount = 0;

    for (let i = 0; i < emails.length; i++) {
      const email = emails[i];

      try {
        const result = await this.sendEmail(email);
        results.push(result);

        if (!result.success) {
          failedCount++;
        }

        // Rate limiting: wait between emails
        if ((i + 1) % rateLimit === 0 && i < emails.length - 1) {
          await new Promise(resolve => setTimeout(resolve, delay));
        }

      } catch (error) {
        failedCount++;
        results.push({
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return {
      success: failedCount === 0,
      results,
      failedCount
    };
  }

  /**
   * Send marketing email campaign
   */
  async sendMarketingCampaign(
    recipients: string[],
    campaignId: string,
    subject: string,
    htmlContent: string,
    textContent: string,
    options: { schedule?: Date; trackOpens?: boolean; trackClicks?: boolean } = {}
  ): Promise<{ success: boolean; sentCount: number; campaignId: string }> {
    const batchEmails = recipients.map(email => ({
      to: email,
      subject,
      html: htmlContent,
      text: textContent,
      categories: ['marketing', campaignId],
      metadata: {
        campaignId,
        trackOpens: options.trackOpens || false,
        trackClicks: options.trackClicks || false
      }
    }));

    const { success, failedCount } = await this.sendBatchEmail(batchEmails);

    return {
      success,
      sentCount: recipients.length - failedCount,
      campaignId
    };
  }

  /**
   * Handle webhook events
   */
  async handleWebhook(
    provider: string,
    signature: string,
    payload: string
  ): Promise<{ processed: boolean; event?: any; error?: string }> {
    try {
      logger.info('Processing email webhook', { provider, signatureLength: signature.length });

      let event: any;

      if (provider === 'sendgrid') {
        event = JSON.parse(payload);
      } else if (provider === 'postmark') {
        event = JSON.parse(payload);
      } else {
        throw new Error(`Unsupported provider: ${provider}`);
      }

      // Process the event
      await this.processWebhookEvent(provider, event);

      logger.info('Email webhook processed successfully', { provider, eventType: event[0]?.event });

      return { processed: true, event };

    } catch (error) {
      logger.error('Failed to process email webhook', {
        provider,
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      return {
        processed: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Process webhook event
   */
  private async processWebhookEvent(provider: string, event: any): Promise<void> {
    const eventType = Array.isArray(event) ? event[0]?.event : event.event;

    switch (eventType) {
      case 'delivered':
        await this.handleEmailDelivered(event);
        break;
      case 'open':
        await this.handleEmailOpened(event);
        break;
      case 'click':
        await this.handleEmailClicked(event);
        break;
      case 'bounce':
        await this.handleEmailBounced(event);
        break;
      case 'spamreport':
        await this.handleEmailSpamReport(event);
        break;
      case 'unsubscribe':
        await this.handleEmailUnsubscribe(event);
        break;
      default:
        logger.info('Unhandled webhook event type', { eventType });
    }
  }

  /**
   * Handle email delivered event
   */
  private async handleEmailDelivered(event: any): Promise<void> {
    const emailId = event.id;
    await this.updateEmailStatus(emailId, 'delivered');
  }

  /**
   * Handle email opened event
   */
  private async handleEmailOpened(event: any): Promise<void> {
    const emailId = event.id;
    await this.updateEmailStatus(emailId, 'opened');
  }

  /**
   * Handle email clicked event
   */
  private async handleEmailClicked(event: any): Promise<void> {
    const emailId = event.id;
    await this.updateEmailStatus(emailId, 'clicked');
  }

  /**
   * Handle email bounced event
   */
  private async handleEmailBounced(event: any): Promise<void> {
    const emailId = event.id;
    const reason = event.reason;

    await this.updateEmailStatus(emailId, 'bounced');

    // Update user email status
    if (event.email) {
      await this.updateUserEmailStatus(event.email, 'bounced', reason);
    }
  }

  /**
   * Handle email spam report event
   */
  private async handleEmailSpamReport(event: any): Promise<void> {
    const emailId = event.id;
    await this.updateEmailStatus(emailId, 'spam');

    if (event.email) {
      await this.updateUserEmailStatus(event.email, 'spam');
    }
  }

  /**
   * Handle email unsubscribe event
   */
  private async handleEmailUnsubscribe(event: any): Promise<void> {
    const emailId = event.id;
    await this.updateEmailStatus(emailId, 'unsubscribed');

    if (event.email) {
      await this.updateUserEmailStatus(event.email, 'unsubscribed');
    }
  }

  /**
   * Update email status
   */
  private async updateEmailStatus(emailId: string, status: string): Promise<void> {
    try {
      const cacheKey = `email:status:${emailId}`;
      const analytics = await this.getEmailAnalytics(emailId) || {
        emailId,
        messageId: emailId,
        status: 'sent',
        timestamp: new Date().toISOString(),
        events: []
      };

      analytics.status = status;
      analytics.events.push({
        event: status,
        timestamp: new Date().toISOString()
      });

      await redisClient.setex(cacheKey, 86400 * 30, JSON.stringify(analytics)); // Cache for 30 days

    } catch (error) {
      logger.error('Failed to update email status', { emailId, status, error });
    }
  }

  /**
   * Update user email status
   */
  private async updateUserEmailStatus(email: string, status: string, reason?: string): Promise<void> {
    try {
      const cacheKey = `email:user:${email}`;
      const userStatus = await redisClient.get(cacheKey);

      const statusData = userStatus ? JSON.parse(userStatus) : {
        email,
        status: 'active',
        lastUpdated: new Date().toISOString(),
        history: []
      };

      statusData.status = status;
      statusData.lastUpdated = new Date().toISOString();

      statusData.history.push({
        status,
        timestamp: new Date().toISOString(),
        reason
      });

      await redisClient.setex(cacheKey, 86400 * 365, JSON.stringify(statusData)); // Cache for 1 year

    } catch (error) {
      logger.error('Failed to update user email status', { email, status, error });
    }
  }

  /**
   * Get email analytics
   */
  async getEmailAnalytics(emailId: string): Promise<EmailAnalytics | null> {
    try {
      const cacheKey = `email:status:${emailId}`;
      const cached = await redisClient.get(cacheKey);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      logger.error('Failed to get email analytics', { emailId, error });
      return null;
    }
  }

  /**
   * Get user email status
   */
  async getUserEmailStatus(email: string): Promise<any> {
    try {
      const cacheKey = `email:user:${email}`;
      const cached = await redisClient.get(cacheKey);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      logger.error('Failed to get user email status', { email, error });
      return null;
    }
  }

  /**
   * Cache email send result
   */
  private async cacheEmailSend(emailRequest: EmailRequest, result: any): Promise<void> {
    try {
      const cacheKey = `email:send:${Date.now()}`;
      await redisClient.setex(cacheKey, 3600, JSON.stringify({
        emailRequest,
        result,
        provider: this.config.provider,
        timestamp: new Date().toISOString()
      }));

    } catch (error) {
      logger.error('Failed to cache email send', { error });
    }
  }

  /**
   * Template HTML content generators
   */
  private getBirthChartReadyTemplate(): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Your Developer Birth Chart is Ready!</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px; text-align: center; }
          .content { padding: 30px 0; }
          .cta-button { display: inline-block; background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; }
          .personality-box { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🔮 Your Developer Birth Chart is Ready!</h1>
        </div>
        <div class="content">
          <p>Hi {{username}},</p>
          <p>Your personalized Developer Birth Chart analysis is now complete! Discover your unique coding personality, career insights, and team dynamics.</p>

          <div class="personality-box">
            <h3>Your Personality Profile:</h3>
            <p><strong>Zodiac Sign:</strong> {{zodiacSign}}</p>
            <p><strong>Personality Type:</strong> {{personalityType}}</p>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="{{chartUrl}}" class="cta-button">View Your Birth Chart</a>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private getBirthChartReadyTextTemplate(): string {
    return `
Your Developer Birth Chart is Ready!

Hi {{username}},

Your personalized Developer Birth Chart analysis is now complete!

Zodiac Sign: {{zodiacSign}}
Personality Type: {{personalityType}}

View your complete analysis at: {{chartUrl}}

Best regards,
The Developer Birth Chart Team
    `;
  }

  private getTeamAnalysisTemplate(): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Team Analysis Results</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #56ab2f 0%, #a8e063 100%); color: white; padding: 30px; border-radius: 10px; text-align: center; }
          .synergy-score { font-size: 48px; font-weight: bold; text-align: center; margin: 30px 0; }
          .results { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .cta-button { display: inline-block; background: #56ab2f; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>👥 Team Analysis Complete</h1>
        </div>
        <div class="content">
          <p>Hi!</p>
          <p>The analysis for {{teamName}} is complete. Here are the key findings:</p>

          <div class="synergy-score">{{synergyScore}}%</div>
          <p style="text-align: center;">Team Synergy Score</p>

          <div class="results">
            <h3>Analysis Summary:</h3>
            <ul>
              <li>{{memberCount}} team members analyzed</li>
              <li>Comprehensive compatibility assessment</li>
              <li>Team dynamics evaluation</li>
            </ul>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="{{analysisUrl}}" class="cta-button">View Full Analysis</a>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private getTeamAnalysisTextTemplate(): string {
    return `
Team Analysis Results

Hi!

The analysis for {{teamName}} is complete.

Key Findings:
- Team Synergy Score: {{synergyScore}}%
- {{memberCount}} team members analyzed
- Comprehensive compatibility assessment
- Team dynamics evaluation

View the complete analysis at: {{analysisUrl}}

Best regards,
The Developer Birth Chart Team
    `;
  }

  private getSubscriptionWelcomeTemplate(): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Welcome to Developer Birth Chart Premium!</title>
      </head>
      <body>
        <h1>Welcome to Premium!</h1>
        <p>Hi {{name}},</p>
        <p>Thank you for upgrading to {{planName}}! You now have access to:</p>
        <ul>
          {{features}}
        </ul>
        <p>Enjoy your enhanced experience!</p>
      </body>
      </html>
    `;
  }

  private getSubscriptionWelcomeTextTemplate(): string {
    return `
Welcome to Developer Birth Chart Premium!

Hi {{name}},

Thank you for upgrading to {{planName}}!

You now have access to:
{{features}}

Enjoy your enhanced experience!

Best regards,
The Developer Birth Chart Team
    `;
  }

  private getPaymentReceiptTemplate(): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Payment Receipt</title>
      </head>
      <body>
        <h1>Payment Receipt</h1>
        <p>Thank you for your purchase!</p>
        <p><strong>Amount:</strong> {{currency}} {{amount}}</p>
        <p><strong>Plan:</strong> {{planName}}</p>
        <p><strong>Transaction ID:</strong> {{transactionId}}</p>
        <p><strong>Date:</strong> {{date}}</p>
      </body>
      </html>
    `;
  }

  private getPaymentReceiptTextTemplate(): string {
    return `
Payment Receipt

Thank you for your purchase!

Amount: {{currency}} {{amount}}
Plan: {{planName}}
Transaction ID: {{transactionId}}
Date: {{date}}
    `;
  }

  private getMarketplacePurchaseTemplate(): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Purchase Confirmation</title>
      </head>
      <body>
        <h1>Purchase Confirmation</h1>
        <p>Your purchase has been confirmed!</p>
        <p><strong>Product:</strong> {{productName}}</p>
        <p><strong>Seller:</strong> {{sellerName}}</p>
        <p><strong>Amount:</strong> {{currency}} {{amount}}</p>
        <p><strong>Delivery Time:</strong> {{deliveryTime}}</p>
        <p><strong>Purchase ID:</strong> {{purchaseId}}</p>
      </body>
      </html>
    `;
  }

  private getMarketplacePurchaseTextTemplate(): string {
    return `
Purchase Confirmation

Your purchase has been confirmed!

Product: {{productName}}
Seller: {{sellerName}}
Amount: {{currency}} {{amount}}
Delivery Time: {{deliveryTime}}
Purchase ID: {{purchaseId}}
    `;
  }

  private getSecurityAlertTemplate(): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Security Alert</title>
      </head>
      <body>
        <h1>🔒 Security Alert</h1>
        <p>We detected a {{alertType}} on your account.</p>
        <p><strong>Location:</strong> {{location}}</p>
        <p><strong>Device:</strong> {{device}}</p>
        <p><strong>Time:</strong> {{timestamp}}</p>
        <p>If this was you, no action is needed. Otherwise, please secure your account immediately.</p>
      </body>
      </html>
    `;
  }

  private getSecurityAlertTextTemplate(): string {
    return `
Security Alert

We detected a {{alertType}} on your account.

Location: {{location}}
Device: {{device}}
Time: {{timestamp}}

If this was you, no action is needed. Otherwise, please secure your account immediately.
    `;
  }
}

export const emailClient = new EmailClient({
  provider: (process.env.EMAIL_PROVIDER as 'sendgrid' | 'postmark') || 'sendgrid',
  apiKey: process.env.EMAIL_API_KEY || '',
  fromEmail: process.env.EMAIL_FROM_EMAIL || 'noreply@developerbirthchart.com',
  fromName: process.env.EMAIL_FROM_NAME || 'Developer Birth Chart',
  replyToEmail: process.env.EMAIL_REPLY_TO_EMAIL
});