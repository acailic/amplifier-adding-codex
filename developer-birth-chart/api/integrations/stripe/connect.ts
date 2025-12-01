/**
 * Stripe Connect Integration for Marketplace Features
 * Handles payments, subscriptions, marketplace transactions, and developer monetization
 */

import Stripe from 'stripe';
import { StripeConfig } from '../../types';
import { logger } from '../monitoring/logger';
import { redisClient } from '../database/redis';

export interface StripeConnectAccount {
  id: string;
  businessProfile: {
    name: string;
    url?: string;
    productDescription?: string;
    supportEmail?: string;
    supportPhone?: string;
    mcc: string;
  };
  capabilities: {
    cardPayments: 'active' | 'inactive';
    transfers: 'active' | 'inactive';
  };
  externalAccounts: {
    object: string;
    id: string;
    country: string;
    currency: string;
  }[];
  metadata: {
    userId: string;
    githubUsername: string;
    accountType: 'individual' | 'company';
  };
}

export interface MarketplaceProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  type: 'one_time' | 'recurring';
  recurring?: {
    interval: 'day' | 'week' | 'month' | 'year';
    intervalCount: number;
  };
  metadata: {
    category: string;
    features: string[];
    limitations: string[];
  };
}

export interface TransactionRecord {
  id: string;
  customerId: string;
  sellerId: string;
  productId: string;
  amount: number;
  currency: string;
  fee: number;
  netAmount: number;
  status: 'pending' | 'succeeded' | 'failed' | 'refunded';
  description: string;
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  priceId: string;
  amount: number;
  currency: string;
  interval: 'month' | 'year';
  features: string[];
  trialPeriodDays?: number;
  metadata: Record<string, any>;
}

export class StripeConnectClient {
  private stripe: Stripe;
  private config: StripeConfig;

  constructor(config: StripeConfig) {
    this.config = config;
    this.stripe = new Stripe(config.secretKey, {
      apiVersion: '2024-06-20',
      typescript: true
    });
  }

  /**
   * Create a Connect account for a developer
   */
  async createConnectAccount(
    userId: string,
    githubUsername: string,
    accountType: 'individual' | 'company' = 'individual',
    businessProfile?: Partial<StripeConnectAccount['businessProfile']>
  ): Promise<StripeConnectAccount> {
    try {
      logger.info('Creating Stripe Connect account', { userId, githubUsername, accountType });

      const accountParams: Stripe.AccountCreateParams = {
        type: accountType,
        capabilities: {
          cardPayments: { requested: true },
          transfers: { requested: true }
        },
        business_profile: {
          name: businessProfile?.name || `${githubUsername}'s Services`,
          product_description: businessProfile?.productDescription || 'Developer services and consulting',
          mcc: '5734', // Computer Programming Services
          support_email: businessProfile?.supportEmail,
          ...businessProfile
        },
        metadata: {
          userId,
          githubUsername,
          accountType
        }
      };

      const account = await this.stripe.accounts.create(accountParams);

      // Create account link for onboarding
      const accountLink = await this.createAccountLink(account.id);

      logger.info('Stripe Connect account created successfully', {
        accountId: account.id,
        userId,
        githubUsername
      });

      return {
        id: account.id,
        businessProfile: account.business_profile || {},
        capabilities: account.capabilities || {},
        externalAccounts: account.external_accounts?.data || [],
        metadata: account.metadata as any
      };

    } catch (error) {
      logger.error('Failed to create Stripe Connect account', {
        userId,
        githubUsername,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw new Error(`Failed to create Connect account: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Create account link for onboarding
   */
  async createAccountLink(accountId: string): Promise<string> {
    try {
      const accountLink = await this.stripe.accountLinks.create({
        account: accountId,
        refresh_url: `${process.env.NEXT_PUBLIC_API_URL}/api/stripe/refresh`,
        return_url: `${process.env.NEXT_PUBLIC_API_URL}/api/stripe/return`,
        type: 'account_onboarding'
      });

      return accountLink.url;

    } catch (error) {
      logger.error('Failed to create account link', { accountId, error });
      throw new Error('Failed to create account link');
    }
  }

  /**
   * Create a login link for existing account
   */
  async createLoginLink(accountId: string): Promise<string> {
    try {
      const loginLink = await this.stripe.accounts.createLoginLink(accountId);
      return loginLink.url;

    } catch (error) {
      logger.error('Failed to create login link', { accountId, error });
      throw new Error('Failed to create login link');
    }
  }

  /**
   * Process marketplace payment
   */
  async processMarketplacePayment(
    customerId: string,
    sellerId: string,
    productId: string,
    amount: number,
    currency: string = 'usd',
    description?: string
  ): Promise<TransactionRecord> {
    try {
      logger.info('Processing marketplace payment', {
        customerId,
        sellerId,
        productId,
        amount,
        currency
      });

      // Calculate platform fee (10% by default)
      const platformFeePercent = 0.10;
      const platformFee = Math.round(amount * platformFeePercent);
      const netAmount = amount - platformFee;

      // Create payment intent with application fee
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount,
        currency,
        customer: customerId,
        description: description || `Payment for product ${productId}`,
        metadata: {
          sellerId,
          productId
        },
        application_fee_amount: platformFee,
        transfer_data: {
          destination: sellerId
        }
      });

      // Record transaction
      const transaction: TransactionRecord = {
        id: paymentIntent.id,
        customerId,
        sellerId,
        productId,
        amount,
        currency,
        fee: platformFee,
        netAmount,
        status: 'pending',
        description: description || `Payment for product ${productId}`,
        metadata: {
          paymentIntentId: paymentIntent.id
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Cache transaction
      await this.cacheTransaction(transaction);

      logger.info('Marketplace payment processed successfully', {
        transactionId: transaction.id,
        amount,
        platformFee,
        netAmount
      });

      return transaction;

    } catch (error) {
      logger.error('Failed to process marketplace payment', {
        customerId,
        sellerId,
        productId,
        amount,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw new Error(`Failed to process payment: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Create subscription plan
   */
  async createSubscriptionPlan(
    name: string,
    description: string,
    amount: number,
    currency: string = 'usd',
    interval: 'month' | 'year' = 'month',
    features: string[],
    trialPeriodDays?: number,
    metadata?: Record<string, any>
  ): Promise<SubscriptionPlan> {
    try {
      logger.info('Creating subscription plan', { name, amount, interval });

      const priceParams: Stripe.PriceCreateParams = {
        unit_amount: amount,
        currency,
        recurring: {
          interval,
          interval_count: 1
        },
        product_data: {
          name,
          description,
          metadata
        }
      };

      const price = await this.stripe.prices.create(priceParams);

      const plan: SubscriptionPlan = {
        id: price.id,
        name,
        description,
        priceId: price.id,
        amount,
        currency,
        interval,
        features,
        trialPeriodDays,
        metadata: metadata || {}
      };

      // Cache plan
      await this.cacheSubscriptionPlan(plan);

      logger.info('Subscription plan created successfully', {
        planId: plan.id,
        name,
        amount,
        interval
      });

      return plan;

    } catch (error) {
      logger.error('Failed to create subscription plan', {
        name,
        amount,
        interval,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw new Error(`Failed to create subscription plan: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Subscribe customer to plan
   */
  async subscribeToPlan(
    customerId: string,
    planId: string,
    paymentMethodId?: string,
    trialPeriodDays?: number
  ): Promise<Stripe.Subscription> {
    try {
      logger.info('Subscribing customer to plan', { customerId, planId });

      const subscriptionParams: Stripe.SubscriptionCreateParams = {
        customer: customerId,
        items: [{ price: planId }],
        trial_period_days: trialPeriodDays,
        payment_behavior: 'default_incomplete',
        expand: ['latest_invoice.payment_intent']
      };

      if (paymentMethodId) {
        subscriptionParams.default_payment_method = paymentMethodId;
      }

      const subscription = await this.stripe.subscriptions.create(subscriptionParams);

      logger.info('Customer subscribed successfully', {
        customerId,
        subscriptionId: subscription.id,
        planId
      });

      return subscription;

    } catch (error) {
      logger.error('Failed to subscribe customer', {
        customerId,
        planId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw new Error(`Failed to subscribe: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Create checkout session for product
   */
  async createCheckoutSession(
    customerId: string,
    sellerId: string,
    productId: string,
    amount: number,
    currency: string = 'usd',
    successUrl: string,
    cancelUrl: string
  ): Promise<string> {
    try {
      logger.info('Creating checkout session', {
        customerId,
        sellerId,
        productId,
        amount
      });

      const platformFeePercent = 0.10;
      const platformFee = Math.round(amount * platformFeePercent);

      const session = await this.stripe.checkout.sessions.create({
        customer: customerId,
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency,
              unit_amount: amount,
              product_data: {
                name: `Product ${productId}`,
                description: `Purchase of product ${productId}`
              }
            },
            quantity: 1
          }
        ],
        payment_intent_data: {
          application_fee_amount: platformFee,
          transfer_data: {
            destination: sellerId
          }
        },
        mode: 'payment',
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: {
          sellerId,
          productId
        }
      });

      logger.info('Checkout session created successfully', {
        sessionId: session.id,
        amount,
        platformFee
      });

      return session.url!;

    } catch (error) {
      logger.error('Failed to create checkout session', {
        customerId,
        sellerId,
        productId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw new Error(`Failed to create checkout session: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Create checkout session for subscription
   */
  async createSubscriptionCheckoutSession(
    customerId: string,
    planId: string,
    successUrl: string,
    cancelUrl: string
  ): Promise<string> {
    try {
      logger.info('Creating subscription checkout session', { customerId, planId });

      const session = await this.stripe.checkout.sessions.create({
        customer: customerId,
        payment_method_types: ['card'],
        line_items: [
          {
            price: planId,
            quantity: 1
          }
        ],
        mode: 'subscription',
        success_url: successUrl,
        cancel_url: cancelUrl
      });

      logger.info('Subscription checkout session created successfully', {
        sessionId: session.id,
        planId
      });

      return session.url!;

    } catch (error) {
      logger.error('Failed to create subscription checkout session', {
        customerId,
        planId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw new Error(`Failed to create subscription checkout session: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Handle webhook events
   */
  async handleWebhook(
    signature: string,
    payload: string
  ): Promise<{ processed: boolean; event?: Stripe.Event; error?: string }> {
    try {
      logger.info('Processing Stripe webhook', { signatureLength: signature.length });

      const event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        this.config.webhookSecret
      );

      switch (event.type) {
        case 'payment_intent.succeeded':
          await this.handlePaymentSucceeded(event.data.object as Stripe.PaymentIntent);
          break;

        case 'payment_intent.payment_failed':
          await this.handlePaymentFailed(event.data.object as Stripe.PaymentIntent);
          break;

        case 'account.updated':
          await this.handleAccountUpdated(event.data.object as Stripe.Account);
          break;

        case 'invoice.payment_succeeded':
          await this.handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);
          break;

        case 'customer.subscription.created':
        case 'customer.subscription.updated':
        case 'customer.subscription.deleted':
          await this.handleSubscriptionEvent(event);
          break;

        default:
          logger.info('Unhandled webhook event type', { type: event.type });
      }

      logger.info('Webhook processed successfully', { type: event.type });
      return { processed: true, event };

    } catch (error) {
      logger.error('Failed to process webhook', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return {
        processed: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Handle successful payment
   */
  private async handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    try {
      const transactionId = paymentIntent.id;

      // Update transaction status
      await this.updateTransactionStatus(transactionId, 'succeeded');

      // Get transaction from cache
      const transaction = await this.getCachedTransaction(transactionId);

      if (transaction) {
        // Notify seller
        await this.notifySeller(transaction.sellerId, {
          type: 'payment_received',
          amount: transaction.amount,
          netAmount: transaction.netAmount,
          customerId: transaction.customerId
        });

        // Send receipt to customer
        await this.sendReceipt(transaction.customerId, transaction);
      }

      logger.info('Payment succeeded and processed', { transactionId });

    } catch (error) {
      logger.error('Failed to handle payment success', {
        paymentIntentId: paymentIntent.id,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Handle failed payment
   */
  private async handlePaymentFailed(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    try {
      const transactionId = paymentIntent.id;

      // Update transaction status
      await this.updateTransactionStatus(transactionId, 'failed');

      // Get transaction from cache
      const transaction = await this.getCachedTransaction(transactionId);

      if (transaction) {
        // Notify customer
        await this.notifyCustomer(transaction.customerId, {
          type: 'payment_failed',
          amount: transaction.amount,
          reason: paymentIntent.last_payment_error?.message || 'Unknown error'
        });
      }

      logger.info('Payment failure processed', { transactionId });

    } catch (error) {
      logger.error('Failed to handle payment failure', {
        paymentIntentId: paymentIntent.id,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Handle account updates
   */
  private async handleAccountUpdated(account: Stripe.Account): Promise<void> {
    try {
      const userId = account.metadata?.userId;
      if (!userId) return;

      // Check if account is fully onboarded
      const isOnboarded = this.isAccountFullyOnboarded(account);

      if (isOnboarded) {
        await this.notifyAccountReady(userId, account.id);
      }

      logger.info('Account update processed', { accountId: account.id, isOnboarded });

    } catch (error) {
      logger.error('Failed to handle account update', {
        accountId: account.id,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Handle subscription events
   */
  private async handleSubscriptionEvent(event: Stripe.Event): Promise<void> {
    try {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;

      switch (event.type) {
        case 'customer.subscription.created':
          await this.notifySubscriptionEvent(customerId, 'created', subscription);
          break;
        case 'customer.subscription.updated':
          await this.notifySubscriptionEvent(customerId, 'updated', subscription);
          break;
        case 'customer.subscription.deleted':
          await this.notifySubscriptionEvent(customerId, 'canceled', subscription);
          break;
      }

      logger.info('Subscription event processed', { type: event.type, subscriptionId: subscription.id });

    } catch (error) {
      logger.error('Failed to handle subscription event', {
        type: event.type,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Handle successful invoice payment
   */
  private async handleInvoicePaymentSucceeded(invoice: Stripe.Invoice): Promise<void> {
    try {
      const customerId = invoice.customer as string;
      const subscriptionId = invoice.subscription as string;

      await this.notifyInvoiceEvent(customerId, 'payment_succeeded', invoice);

      logger.info('Invoice payment processed', { invoiceId: invoice.id, subscriptionId });

    } catch (error) {
      logger.error('Failed to handle invoice payment', {
        invoiceId: invoice.id,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Check if account is fully onboarded
   */
  private isAccountFullyOnboarded(account: Stripe.Account): boolean {
    const capabilities = account.capabilities;
    return capabilities?.card_payments === 'active' && capabilities?.transfers === 'active';
  }

  /**
   * Notify seller of events
   */
  private async notifySeller(sellerId: string, data: any): Promise<void> {
    // This would integrate with your notification system
    logger.info('Notifying seller', { sellerId, data });
  }

  /**
   * Send receipt to customer
   */
  private async sendReceipt(customerId: string, transaction: TransactionRecord): Promise<void> {
    // This would integrate with your email service
    logger.info('Sending receipt', { customerId, transactionId: transaction.id });
  }

  /**
   * Notify customer
   */
  private async notifyCustomer(customerId: string, data: any): Promise<void> {
    // This would integrate with your notification system
    logger.info('Notifying customer', { customerId, data });
  }

  /**
   * Notify account ready
   */
  private async notifyAccountReady(userId: string, accountId: string): Promise<void> {
    // This would integrate with your notification system
    logger.info('Notifying account ready', { userId, accountId });
  }

  /**
   * Notify subscription event
   */
  private async notifySubscriptionEvent(customerId: string, type: string, subscription: Stripe.Subscription): Promise<void> {
    // This would integrate with your notification system
    logger.info('Notifying subscription event', { customerId, type, subscriptionId: subscription.id });
  }

  /**
   * Notify invoice event
   */
  private async notifyInvoiceEvent(customerId: string, type: string, invoice: Stripe.Invoice): Promise<void> {
    // This would integrate with your notification system
    logger.info('Notifying invoice event', { customerId, type, invoiceId: invoice.id });
  }

  /**
   * Cache transaction
   */
  private async cacheTransaction(transaction: TransactionRecord): Promise<void> {
    try {
      const cacheKey = `stripe:transaction:${transaction.id}`;
      await redisClient.setex(cacheKey, 86400, JSON.stringify(transaction)); // Cache for 24 hours
    } catch (error) {
      logger.error('Failed to cache transaction', { transactionId: transaction.id, error });
    }
  }

  /**
   * Get cached transaction
   */
  private async getCachedTransaction(transactionId: string): Promise<TransactionRecord | null> {
    try {
      const cacheKey = `stripe:transaction:${transactionId}`;
      const cached = await redisClient.get(cacheKey);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      logger.error('Failed to get cached transaction', { transactionId, error });
      return null;
    }
  }

  /**
   * Update transaction status
   */
  private async updateTransactionStatus(transactionId: string, status: TransactionRecord['status']): Promise<void> {
    try {
      const transaction = await this.getCachedTransaction(transactionId);
      if (transaction) {
        transaction.status = status;
        transaction.updatedAt = new Date().toISOString();
        await this.cacheTransaction(transaction);
      }
    } catch (error) {
      logger.error('Failed to update transaction status', { transactionId, status, error });
    }
  }

  /**
   * Cache subscription plan
   */
  private async cacheSubscriptionPlan(plan: SubscriptionPlan): Promise<void> {
    try {
      const cacheKey = `stripe:plan:${plan.id}`;
      await redisClient.setex(cacheKey, 86400, JSON.stringify(plan));
    } catch (error) {
      logger.error('Failed to cache subscription plan', { planId: plan.id, error });
    }
  }

  /**
   * Get account balance
   */
  async getAccountBalance(accountId: string): Promise<Stripe.Balance> {
    try {
      const balance = await this.stripe.balance.retrieve({
        stripeAccount: accountId
      });
      return balance;
    } catch (error) {
      logger.error('Failed to get account balance', { accountId, error });
      throw new Error('Failed to get account balance');
    }
  }

  /**
   * Create payout to connected account
   */
  async createPayout(
    accountId: string,
    amount: number,
    currency: string = 'usd'
  ): Promise<Stripe.Payout> {
    try {
      const payout = await this.stripe.payouts.create({
        amount,
        currency,
        method: 'instant'
      }, {
        stripeAccount: accountId
      });

      logger.info('Payout created successfully', {
        accountId,
        payoutId: payout.id,
        amount,
        currency
      });

      return payout;

    } catch (error) {
      logger.error('Failed to create payout', {
        accountId,
        amount,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw new Error('Failed to create payout');
    }
  }

  /**
   * Get account dashboard link
   */
  async getAccountDashboardLink(accountId: string): Promise<string> {
    try {
      const loginLink = await this.stripe.accounts.createLoginLink(accountId);
      return loginLink.url;
    } catch (error) {
      logger.error('Failed to get account dashboard link', { accountId, error });
      throw new Error('Failed to get account dashboard link');
    }
  }
}

export const stripeConnectClient = new StripeConnectClient({
  secretKey: process.env.STRIPE_SECRET_KEY!,
  publishableKey: process.env.STRIPE_PUBLISHABLE_KEY!,
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
  connectClientId: process.env.STRIPE_CONNECT_CLIENT_ID!
});