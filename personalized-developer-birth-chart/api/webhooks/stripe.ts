import { NextRequest, NextResponse } from 'next/server';
import { stripeService } from '../lib/stripe';
import { supabase } from '../lib/supabase';
import { config } from '../../config/env';
import { WebhookEventType } from '../types';

export async function handleStripeWebhook(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json({
        error: 'Missing Stripe signature'
      }, { status: 400 });
    }

    // Verify webhook signature
    const event = stripeService.constructWebhookEvent(body, signature);

    console.log('Processing Stripe webhook event:', event.type);

    switch (event.type) {
      case WebhookEventType.CUSTOMER_CREATED:
        await handleCustomerCreated(event.data.object as any);
        break;

      case WebhookEventType.SUBSCRIPTION_CREATED:
        await handleSubscriptionCreated(event.data.object as any);
        break;

      case WebhookEventType.SUBSCRIPTION_UPDATED:
        await handleSubscriptionUpdated(event.data.object as any);
        break;

      case WebhookEventType.SUBSCRIPTION_DELETED:
        await handleSubscriptionDeleted(event.data.object as any);
        break;

      case WebhookEventType.INVOICE_PAID:
        await handleInvoicePaid(event.data.object as any);
        break;

      case WebhookEventType.INVOICE_FAILED:
        await handleInvoiceFailed(event.data.object as any);
        break;

      default:
        console.log(`Unhandled webhook event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({
      error: 'Webhook processing failed',
      message: error.message
    }, { status: 400 });
  }
}

async function handleCustomerCreated(customer: any): Promise<void> {
  try {
    const userId = customer.metadata?.userId;
    if (!userId) {
      console.log('Customer created without userId metadata');
      return;
    }

    // Update user with Stripe customer ID
    await supabase.updateUser(userId, {
      stripe_customer_id: customer.id
    });

    console.log(`Updated user ${userId} with Stripe customer ID ${customer.id}`);

  } catch (error) {
    console.error('Error handling customer created:', error);
  }
}

async function handleSubscriptionCreated(subscription: any): Promise<void> {
  try {
    const userId = subscription.metadata?.userId;
    if (!userId) {
      console.log('Subscription created without userId metadata');
      return;
    }

    const tier = stripeService.getTierFromPriceId(subscription.items.data[0].price.id);
    if (!tier) {
      console.log('Could not determine tier from price ID');
      return;
    }

    const usageLimits = stripeService.getUsageLimitsForTier(tier);

    // Create subscription in database
    await supabase.createSubscription({
      user_id: userId,
      tier,
      stripe_subscription_id: subscription.id,
      status: subscription.status,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      cancel_at_period_end: subscription.cancel_at_period_end,
      usage_limits
    });

    // Track subscription event
    await supabase.trackUsage({
      user_id: userId,
      event_type: 'subscription_created',
      resource_id: subscription.id,
      metadata: {
        tier,
        status: subscription.status
      }
    });

    console.log(`Created subscription for user ${userId}, tier: ${tier}`);

  } catch (error) {
    console.error('Error handling subscription created:', error);
  }
}

async function handleSubscriptionUpdated(subscription: any): Promise<void> {
  try {
    // Find subscription by Stripe ID
    const existingSub = await supabase.query(`
      SELECT user_id FROM subscriptions WHERE stripe_subscription_id = $1
    `, [subscription.id]);

    if (!existingSub || existingSub.length === 0) {
      console.log('Subscription update received for unknown subscription');
      return;
    }

    const userId = existingSub[0].user_id;
    const tier = stripeService.getTierFromPriceId(subscription.items.data[0].price.id);
    if (!tier) {
      console.log('Could not determine tier from price ID');
      return;
    }

    const usageLimits = stripeService.getUsageLimitsForTier(tier);

    // Update subscription in database
    await supabase.updateSubscription(userId, {
      tier,
      status: subscription.status,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      cancel_at_period_end: subscription.cancel_at_period_end,
      usage_limits
    });

    // Track subscription update
    await supabase.trackUsage({
      user_id: userId,
      event_type: 'subscription_updated',
      resource_id: subscription.id,
      metadata: {
        tier,
        status: subscription.status,
        cancel_at_period_end: subscription.cancel_at_period_end
      }
    });

    console.log(`Updated subscription for user ${userId}, tier: ${tier}, status: ${subscription.status}`);

  } catch (error) {
    console.error('Error handling subscription updated:', error);
  }
}

async function handleSubscriptionDeleted(subscription: any): Promise<void> {
  try {
    // Find subscription by Stripe ID
    const existingSub = await supabase.query(`
      SELECT user_id FROM subscriptions WHERE stripe_subscription_id = $1
    `, [subscription.id]);

    if (!existingSub || existingSub.length === 0) {
      console.log('Subscription deletion received for unknown subscription');
      return;
    }

    const userId = existingSub[0].user_id;

    // Update subscription status in database
    await supabase.updateSubscription(userId, {
      status: 'canceled',
      tier: 'free',
      current_period_end: new Date().toISOString(),
      cancel_at_period_end: false,
      usage_limits: stripeService.getUsageLimitsForTier('free')
    });

    // Track subscription cancellation
    await supabase.trackUsage({
      user_id: userId,
      event_type: 'subscription_canceled',
      resource_id: subscription.id,
      metadata: {
        reason: 'webhook_cancellation'
      }
    });

    console.log(`Canceled subscription for user ${userId}`);

  } catch (error) {
    console.error('Error handling subscription deleted:', error);
  }
}

async function handleInvoicePaid(invoice: any): Promise<void> {
  try {
    if (!invoice.subscription) {
      return; // One-time invoice, not subscription related
    }

    // Find subscription
    const existingSub = await supabase.query(`
      SELECT user_id, tier FROM subscriptions WHERE stripe_subscription_id = $1
    `, [invoice.subscription]);

    if (!existingSub || existingSub.length === 0) {
      console.log('Invoice payment received for unknown subscription');
      return;
    }

    const userId = existingSub[0].user_id;
    const tier = existingSub[0].tier;

    // Track successful payment
    await supabase.trackUsage({
      user_id: userId,
      event_type: 'payment_successful',
      resource_id: invoice.id,
      metadata: {
        amount: invoice.amount_paid / 100,
        currency: invoice.currency,
        tier
      }
    });

    // Check for referral rewards to apply
    await checkAndApplyReferralRewards(userId);

    console.log(`Processed successful payment for user ${userId}, amount: ${invoice.amount_paid / 100} ${invoice.currency}`);

  } catch (error) {
    console.error('Error handling invoice paid:', error);
  }
}

async function handleInvoiceFailed(invoice: any): Promise<void> {
  try {
    if (!invoice.subscription) {
      return; // One-time invoice, not subscription related
    }

    // Find subscription
    const existingSub = await supabase.query(`
      SELECT user_id, tier FROM subscriptions WHERE stripe_subscription_id = $1
    `, [invoice.subscription]);

    if (!existingSub || existingSub.length === 0) {
      console.log('Invoice payment failure received for unknown subscription');
      return;
    }

    const userId = existingSub[0].user_id;

    // Track failed payment
    await supabase.trackUsage({
      user_id: userId,
      event_type: 'payment_failed',
      resource_id: invoice.id,
      metadata: {
        amount: invoice.amount_due / 100,
        currency: invoice.currency,
        attempt_count: invoice.attempt_count
      }
    });

    console.log(`Processed failed payment for user ${userId}, amount: ${invoice.amount_due / 100} ${invoice.currency}`);

  } catch (error) {
    console.error('Error handling invoice failed:', error);
  }
}

async function checkAndApplyReferralRewards(userId: string): Promise<void> {
  try {
    // Get completed referrals that haven't been rewarded
    const unrewardedReferrals = await supabase.query(`
      SELECT * FROM referrals
      WHERE referrer_id = $1 AND status = 'completed' AND (reward_tier IS NULL OR status != 'rewarded')
      ORDER BY conversion_date ASC
      LIMIT 5
    `, [userId]);

    if (!unrewardedReferrals || unrewardedReferrals.length === 0) {
      return;
    }

    const userSubscription = await supabase.getUserSubscription(userId);
    if (!userSubscription) {
      return;
    }

    for (const referral of unrewardedReferrals) {
      let rewardTier = 'no_reward';

      // Determine reward based on user's subscription tier
      switch (userSubscription.tier) {
        case 'enterprise':
          rewardTier = 'cash_bonus';
          break;
        case 'team':
          rewardTier = 'free_month';
          break;
        case 'pro':
          rewardTier = 'discount';
          break;
        case 'starter':
          rewardTier = 'discount';
          break;
      }

      if (rewardTier !== 'no_reward') {
        // Apply the reward
        await applyRewardToSubscription(userId, rewardTier);

        // Update referral record
        await supabase.query(`
          UPDATE referrals
          SET reward_tier = $2, status = 'rewarded'
          WHERE id = $1
        `, [referral.id, rewardTier]);

        // Track reward application
        await supabase.trackUsage({
          user_id: userId,
          event_type: 'referral_reward_applied',
          metadata: {
            referral_id: referral.id,
            reward_tier: rewardTier
          }
        });
      }
    }

  } catch (error) {
    console.error('Error checking and applying referral rewards:', error);
  }
}

async function applyRewardToSubscription(userId: string, rewardTier: string): Promise<void> {
  try {
    if (rewardTier === 'free_month') {
      // This would integrate with Stripe to add a free month
      // For now, just track that the reward should be applied
      console.log(`Free month reward should be applied to user ${userId}`);
    } else if (rewardTier === 'discount') {
      // This would integrate with Stripe to apply a discount
      console.log(`Discount reward should be applied to user ${userId}`);
    } else if (rewardTier === 'cash_bonus') {
      // This would integrate with a payment system for cash bonuses
      console.log(`Cash bonus reward should be applied to user ${userId}`);
    }

  } catch (error) {
    console.error('Error applying reward to subscription:', error);
  }
}