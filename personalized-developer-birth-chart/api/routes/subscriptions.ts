import { NextRequest, NextResponse } from 'next/server';
import { stripeService } from '../lib/stripe';
import { supabase } from '../lib/supabase';
import { withAuth } from '../middleware/auth';
import { rateLimit } from '../middleware/rateLimit';
import { SubscriptionTier, APIResponse, Subscription } from '../types';
import { config } from '../../config/env';

// Create a checkout session for subscription
export const POST = withAuth(
  rateLimit('auth')(
    async (request: any): Promise<NextResponse<APIResponse<{ url: string }>>> => {
      try {
        const body = await request.json();
        const { tier, promotionCode } = body;

        if (!Object.values(SubscriptionTier).includes(tier)) {
          return NextResponse.json({
            success: false,
            error: {
              code: 'INVALID_TIER',
              message: 'Invalid subscription tier'
            }
          }, { status: 400 });
        }

        if (tier === SubscriptionTier.FREE) {
          return NextResponse.json({
            success: false,
            error: {
              code: 'INVALID_TIER',
              message: 'Cannot create checkout session for free tier'
            }
          }, { status: 400 });
        }

        // Get or create Stripe customer
        let stripeCustomerId = request.user.stripe_customer_id;
        if (!stripeCustomerId) {
          const customer = await stripeService.createCustomer(
            request.user.email,
            request.user.id,
            {
              username: request.user.username,
              github_username: request.user.github_username
            }
          );
          stripeCustomerId = customer.id;

          // Update user with Stripe customer ID
          await supabase.updateUser(request.user.id, {
            stripe_customer_id: stripeCustomerId
          });
        }

        // Get pricing plan
        const pricingPlan = stripeService.getPricingPlan(tier as SubscriptionTier);
        if (!pricingPlan) {
          return NextResponse.json({
            success: false,
            error: {
              code: 'PLAN_NOT_FOUND',
              message: 'Pricing plan not found for specified tier'
            }
          }, { status: 404 });
        }

        // Create checkout session
        const session = await stripeService.createCheckoutSession({
          customerId: stripeCustomerId,
          priceId: pricingPlan.priceId,
          successUrl: `${config.appUrl}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: `${config.appUrl}/subscription/canceled`,
          userId: request.user.id,
          promotionCode
        });

        return NextResponse.json({
          success: true,
          data: { url: session.url! }
        });

      } catch (error) {
        console.error('Create checkout session error:', error);
        return NextResponse.json({
          success: false,
          error: {
            code: 'CHECKOUT_SESSION_FAILED',
            message: 'Failed to create checkout session',
            details: config.isDevelopment ? error.message : undefined
          }
        }, { status: 500 });
      }
    }
  )
);

// Get current subscription
export const GET = withAuth(
  rateLimit('apiCall')(
    async (request: any): Promise<NextResponse<APIResponse<Subscription | null>>> => {
      try {
        let subscription = await supabase.getUserSubscription(request.user.id);

        // If no subscription exists, create a free one
        if (!subscription) {
          subscription = await supabase.createSubscription({
            user_id: request.user.id,
            tier: SubscriptionTier.FREE,
            status: 'active'
          });
        }

        return NextResponse.json({
          success: true,
          data: subscription
        });

      } catch (error) {
        console.error('Get subscription error:', error);
        return NextResponse.json({
          success: false,
          error: {
            code: 'GET_SUBSCRIPTION_FAILED',
            message: 'Failed to retrieve subscription'
          }
        }, { status: 500 });
      }
    }
  )
);

// Update subscription (change tier, cancel, etc.)
export const PUT = withAuth(
  rateLimit('apiCall')(
    async (request: any): Promise<NextResponse<APIResponse<Subscription>>> => {
      try {
        const body = await request.json();
        const { action, tier } = body;

        const currentSubscription = await supabase.getUserSubscription(request.user.id);
        if (!currentSubscription || !currentSubscription.stripe_subscription_id) {
          return NextResponse.json({
            success: false,
            error: {
              code: 'NO_ACTIVE_SUBSCRIPTION',
              message: 'No active subscription found'
            }
          }, { status: 404 });
        }

        let updatedSubscription;

        switch (action) {
          case 'upgrade':
          case 'downgrade':
            if (!tier || !Object.values(SubscriptionTier).includes(tier)) {
              return NextResponse.json({
                success: false,
                error: {
                  code: 'INVALID_TIER',
                  message: 'Valid tier is required for tier changes'
                }
              }, { status: 400 });
            }

            if (tier === SubscriptionTier.FREE) {
              return NextResponse.json({
                success: false,
                error: {
                  code: 'INVALID_TIER',
                  message: 'Use "cancel" action to downgrade to free tier'
                }
              }, { status: 400 });
            }

            // Change subscription tier
            const stripeSubscription = await stripeService.changeSubscriptionTier(
              currentSubscription.stripe_subscription_id,
              tier as SubscriptionTier
            );

            // Update database
            updatedSubscription = await supabase.updateSubscription(request.user.id, {
              tier,
              status: stripeSubscription.status,
              current_period_start: new Date(stripeSubscription.current_period_start * 1000).toISOString(),
              current_period_end: new Date(stripeSubscription.current_period_end * 1000).toISOString(),
              usage_limits: stripeService.getUsageLimitsForTier(tier as SubscriptionTier)
            });

            break;

          case 'cancel':
            // Cancel subscription at period end
            await stripeService.cancelSubscription(
              currentSubscription.stripe_subscription_id,
              true
            );

            updatedSubscription = await supabase.updateSubscription(request.user.id, {
              cancel_at_period_end: true
            });

            break;

          case 'resume':
            // Resume cancelled subscription
            await stripeService.resumeSubscription(currentSubscription.stripe_subscription_id);

            updatedSubscription = await supabase.updateSubscription(request.user.id, {
              cancel_at_period_end: false
            });

            break;

          case 'pause':
            // Pause subscription
            await stripeService.pauseSubscription(currentSubscription.stripe_subscription_id);

            updatedSubscription = await supabase.updateSubscription(request.user.id, {
              status: 'past_due'
            });

            break;

          default:
            return NextResponse.json({
              success: false,
              error: {
                code: 'INVALID_ACTION',
                message: 'Invalid action. Supported actions: upgrade, downgrade, cancel, resume, pause'
              }
            }, { status: 400 });
        }

        return NextResponse.json({
          success: true,
          data: updatedSubscription!
        });

      } catch (error) {
        console.error('Update subscription error:', error);
        return NextResponse.json({
          success: false,
          error: {
            code: 'UPDATE_SUBSCRIPTION_FAILED',
            message: 'Failed to update subscription',
            details: config.isDevelopment ? error.message : undefined
          }
        }, { status: 500 });
      }
    }
  )
);

// Create billing portal session
export async function createBillingPortal(request: any): Promise<NextResponse<APIResponse<{ url: string }>>> {
  try {
    if (!request.user.stripe_customer_id) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'NO_STRIPE_CUSTOMER',
          message: 'No Stripe customer found for this user'
        }
      }, { status: 404 });
    }

    const session = await stripeService.createBillingPortalSession(
      request.user.stripe_customer_id,
      `${config.appUrl}/subscription`
    );

    return NextResponse.json({
      success: true,
      data: { url: session.url }
    });

  } catch (error) {
    console.error('Create billing portal error:', error);
    return NextResponse.json({
      success: false,
      error: {
        code: 'BILLING_PORTAL_FAILED',
        message: 'Failed to create billing portal session',
        details: config.isDevelopment ? error.message : undefined
      }
    }, { status: 500 });
  }
}

// Get pricing plans
export function getPricingPlans(): NextResponse<APIResponse<any>> {
  try {
    const plans = stripeService.getAllPricingPlans();

    return NextResponse.json({
      success: true,
      data: plans
    });

  } catch (error) {
    console.error('Get pricing plans error:', error);
    return NextResponse.json({
      success: false,
      error: {
        code: 'GET_PRICING_PLANS_FAILED',
        message: 'Failed to retrieve pricing plans'
      }
    }, { status: 500 });
  }
}

// Get upcoming invoice
export async function getUpcomingInvoice(request: any): Promise<NextResponse<APIResponse<any>>> {
  try {
    const subscription = await supabase.getUserSubscription(request.user.id);

    if (!subscription || !subscription.stripe_subscription_id) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'NO_ACTIVE_SUBSCRIPTION',
          message: 'No active subscription found'
        }
      }, { status: 404 });
    }

    const invoice = await stripeService.getUpcomingInvoice(
      request.user.stripe_customer_id!,
      subscription.stripe_subscription_id
    );

    return NextResponse.json({
      success: true,
      data: {
        amount: invoice.amount_due / 100,
        currency: invoice.currency,
        date: new Date(invoice.due_date! * 1000).toISOString(),
        lines: invoice.lines.data.map(line => ({
          description: line.description,
          amount: line.amount / 100,
          quantity: line.quantity
        }))
      }
    });

  } catch (error) {
    console.error('Get upcoming invoice error:', error);
    return NextResponse.json({
      success: false,
      error: {
        code: 'GET_UPCOMING_INVOICE_FAILED',
        message: 'Failed to retrieve upcoming invoice',
        details: config.isDevelopment ? error.message : undefined
      }
    }, { status: 500 });
  }
}

// Get invoice history
export async function getInvoiceHistory(request: any): Promise<NextResponse<APIResponse<any[]>>> {
  try {
    if (!request.user.stripe_customer_id) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'NO_STRIPE_CUSTOMER',
          message: 'No Stripe customer found for this user'
        }
      }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');

    const invoices = await stripeService.getCustomerInvoices(request.user.stripe_customer_id, limit);

    const formattedInvoices = invoices.data.map(invoice => ({
      id: invoice.id,
      amount: invoice.amount_paid / 100,
      currency: invoice.currency,
      date: new Date(invoice.created * 1000).toISOString(),
      status: invoice.status,
      invoice_pdf: invoice.invoice_pdf,
      hosted_invoice_url: invoice.hosted_invoice_url
    }));

    return NextResponse.json({
      success: true,
      data: formattedInvoices
    });

  } catch (error) {
    console.error('Get invoice history error:', error);
    return NextResponse.json({
      success: false,
      error: {
        code: 'GET_INVOICE_HISTORY_FAILED',
        message: 'Failed to retrieve invoice history',
        details: config.isDevelopment ? error.message : undefined
      }
    }, { status: 500 });
  }
}

// Export handlers for use in Next.js API routes
export const subscriptionHandlers = {
  POST,
  GET,
  PUT,
  createBillingPortal,
  getPricingPlans,
  getUpcomingInvoice,
  getInvoiceHistory
};