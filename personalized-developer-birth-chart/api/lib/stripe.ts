import Stripe from 'stripe';
import { config } from '../../config/env';
import { SubscriptionTier, FeatureGates } from '../types';

class StripeService {
  private stripe: Stripe;

  constructor() {
    this.stripe = new Stripe(config.stripeSecretKey, {
      apiVersion: '2024-06-20',
    });
  }

  // Pricing plans configuration
  private readonly pricingPlans = {
    [SubscriptionTier.STARTER]: {
      name: 'Starter',
      priceId: process.env.STRIPE_STARTER_PRICE_ID || 'price_starter_placeholder',
      amount: 500, // $5.00 in cents
      currency: 'usd',
      interval: 'month' as const,
      features: [
        '25 charts per month',
        '3 team members',
        '1,000 API calls per day',
        'Basic chart styles',
        'Email support'
      ]
    },
    [SubscriptionTier.PRO]: {
      name: 'Pro',
      priceId: process.env.STRIPE_PRO_PRICE_ID || 'price_pro_placeholder',
      amount: 1500, // $15.00 in cents
      currency: 'usd',
      interval: 'month' as const,
      features: [
        '250 charts per month',
        '10 team members',
        '10,000 API calls per day',
        'Advanced chart features',
        'Team constellation analysis',
        'Priority email support'
      ]
    },
    [SubscriptionTier.TEAM]: {
      name: 'Team',
      priceId: process.env.STRIPE_TEAM_PRICE_ID || 'price_team_placeholder',
      amount: 4900, // $49.00 in cents
      currency: 'usd',
      interval: 'month' as const,
      features: [
        '1,000 charts per month',
        '25 team members',
        '50,000 API calls per day',
        'Advanced analytics',
        'Custom branding',
        'Priority support',
        'Team management tools'
      ]
    },
    [SubscriptionTier.ENTERPRISE]: {
      name: 'Enterprise',
      priceId: process.env.STRIPE_ENTERPRISE_PRICE_ID || 'price_enterprise_placeholder',
      amount: 19900, // $199.00 in cents (custom pricing)
      currency: 'usd',
      interval: 'month' as const,
      features: [
        'Unlimited charts',
        'Unlimited team members',
        'Unlimited API calls',
        'White-label options',
        'Dedicated support',
        'Custom integrations',
        'SLA guarantee'
      ]
    }
  };

  // Customer management
  async createCustomer(email: string, userId: string, metadata?: any) {
    const customer = await this.stripe.customers.create({
      email,
      metadata: {
        userId,
        ...metadata
      }
    });

    return customer;
  }

  async getCustomer(customerId: string) {
    return await this.stripe.customers.retrieve(customerId);
  }

  async updateCustomer(customerId: string, updates: any) {
    return await this.stripe.customers.update(customerId, updates);
  }

  async deleteCustomer(customerId: string) {
    return await this.stripe.customers.del(customerId);
  }

  // Subscription management
  async createSubscription(customerId: string, priceId: string, userId: string) {
    const subscription = await this.stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'],
      metadata: {
        userId
      }
    });

    return subscription;
  }

  async getSubscription(subscriptionId: string) {
    return await this.stripe.subscriptions.retrieve(subscriptionId);
  }

  async updateSubscription(subscriptionId: string, updates: any) {
    return await this.stripe.subscriptions.update(subscriptionId, updates);
  }

  async cancelSubscription(subscriptionId: string, cancelAtPeriodEnd = false) {
    if (cancelAtPeriodEnd) {
      return await this.stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: true
      });
    } else {
      return await this.stripe.subscriptions.cancel(subscriptionId);
    }
  }

  async pauseSubscription(subscriptionId: string) {
    return await this.stripe.subscriptions.update(subscriptionId, {
      pause_collection: {
        behavior: 'keep_as_draft'
      }
    });
  }

  async resumeSubscription(subscriptionId: string) {
    return await this.stripe.subscriptions.update(subscriptionId, {
      pause_collection: null as any
    });
  }

  // Subscription changes (upgrade/downgrade)
  async changeSubscriptionTier(subscriptionId: string, newTier: SubscriptionTier) {
    const plan = this.pricingPlans[newTier];
    if (!plan) {
      throw new Error(`Invalid subscription tier: ${newTier}`);
    }

    const subscription = await this.getSubscription(subscriptionId);
    const currentItemId = subscription.items.data[0].id;

    const updatedSubscription = await this.stripe.subscriptions.update(subscriptionId, {
      items: [{
        id: currentItemId,
        price: plan.priceId
      }],
      proration_behavior: 'create_prorations'
    });

    return updatedSubscription;
  }

  // Payment methods
  async attachPaymentMethod(paymentMethodId: string, customerId: string) {
    return await this.stripe.paymentMethods.attach(paymentMethodId, {
      customer: customerId
    });
  }

  async setDefaultPaymentMethod(customerId: string, paymentMethodId: string) {
    return await this.stripe.customers.update(customerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId
      }
    });
  }

  async getCustomerPaymentMethods(customerId: string) {
    const paymentMethods = await this.stripe.paymentMethods.list({
      customer: customerId,
      type: 'card'
    });

    return paymentMethods;
  }

  // Invoices
  async getUpcomingInvoice(customerId: string, subscriptionId?: string) {
    return await this.stripe.invoices.retrieveUpcoming({
      customer: customerId,
      subscription: subscriptionId
    });
  }

  async getCustomerInvoices(customerId: string, limit = 10) {
    const invoices = await this.stripe.invoices.list({
      customer: customerId,
      limit
    });

    return invoices;
  }

  // Checkout sessions
  async createCheckoutSession(params: {
    customerId: string;
    priceId: string;
    successUrl: string;
    cancelUrl: string;
    userId: string;
    promotionCode?: string;
  }) {
    const sessionConfig: Stripe.Checkout.SessionCreateParams = {
      customer: params.customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: params.priceId,
          quantity: 1
        }
      ],
      mode: 'subscription',
      success_url: params.successUrl,
      cancel_url: params.cancelUrl,
      allow_promotion_codes: !!params.promotionCode,
      metadata: {
        userId: params.userId
      },
      billing_address_collection: 'auto',
      customer_update: {
        address: 'auto',
        name: 'auto'
      }
    };

    if (params.promotionCode) {
      sessionConfig.discounts = [{ promotion_code: params.promotionCode }];
    }

    const session = await this.stripe.checkout.sessions.create(sessionConfig);
    return session;
  }

  async createBillingPortalSession(customerId: string, returnUrl: string) {
    const session = await this.stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl
    });

    return session;
  }

  // Usage and metered billing (for future use)
  async createUsageRecord(subscriptionItemId: string, quantity: number, timestamp?: number) {
    return await this.stripe.subscriptionItems.createUsageRecord(
      subscriptionItemId,
      {
        quantity,
        timestamp: timestamp || Math.floor(Date.now() / 1000)
      }
    );
  }

  // Coupons and promotions
  async createCoupon(params: {
    name: string;
    amountOff?: number;
    percentOff?: number;
    duration: 'forever' | 'once' | 'repeating';
    durationInMonths?: number;
  }) {
    const couponConfig: Stripe.CouponCreateParams = {
      name: params.name,
      duration: params.duration
    };

    if (params.amountOff) {
      couponConfig.amount_off = params.amountOff;
    } else if (params.percentOff) {
      couponConfig.percent_off = params.percentOff;
    }

    if (params.duration === 'repeating' && params.durationInMonths) {
      couponConfig.duration_in_months = params.durationInMonths;
    }

    return await this.stripe.coupons.create(couponConfig);
  }

  async createPromotionCode(couponId: string, code: string) {
    return await this.stripe.promotionCodes.create({
      coupon: couponId,
      code: code,
      active: true
    });
  }

  // Webhook event handling
  async constructWebhookEvent(payload: string, signature: string) {
    return this.stripe.webhooks.constructEvent(
      payload,
      signature,
      config.stripeWebhookSecret
    );
  }

  // Analytics and reporting
  async getSubscriptionMetrics(periodStart: Date, periodEnd: Date) {
    const subscriptions = await this.stripe.subscriptions.list({
      created: {
        gte: Math.floor(periodStart.getTime() / 1000),
        lte: Math.floor(periodEnd.getTime() / 1000)
      },
      limit: 100
    });

    const metrics = {
      newSubscriptions: subscriptions.data.length,
      mrr: 0,
      activeSubscriptions: 0,
      churnRate: 0
    };

    subscriptions.data.forEach(sub => {
      if (sub.status === 'active') {
        metrics.activeSubscriptions++;
        metrics.mrr += (sub.items.data[0].price.unit_amount || 0) / 100;
      }
    });

    return metrics;
  }

  // Utility methods
  getTierFromPriceId(priceId: string): SubscriptionTier | null {
    for (const [tier, plan] of Object.entries(this.pricingPlans)) {
      if (plan.priceId === priceId) {
        return tier as SubscriptionTier;
      }
    }
    return null;
  }

  getUsageLimitsForTier(tier: SubscriptionTier) {
    return FeatureGates[tier];
  }

  getAllPricingPlans() {
    return this.pricingPlans;
  }

  getPricingPlan(tier: SubscriptionTier) {
    return this.pricingPlans[tier];
  }

  // Referral rewards (future implementation)
  async applyReferralCredit(customerId: string, amount: number) {
    // Create a customer credit for referral rewards
    return await this.stripe.customers.createBalanceTransaction(
      customerId,
      {
        amount: -amount, // Negative amount for credit
        currency: 'usd',
        description: 'Referral reward credit'
      }
    );
  }

  // Tax calculation (if needed)
  async calculateTax(amount: number, customerId: string) {
    // This would integrate with Stripe Tax if enabled
    // For now, returning the original amount
    return {
      amount,
      tax: 0,
      total: amount
    };
  }
}

export const stripeService = new StripeService();