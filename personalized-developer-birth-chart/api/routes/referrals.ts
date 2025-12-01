import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../lib/supabase';
import { withAuth, optionalAuthenticate } from '../middleware/auth';
import { rateLimit } from '../middleware/rateLimit';
import { APIResponse, Referral, ViralMetrics } from '../types';
import { config } from '../../config/env';
import { nanoid } from 'nanoid';

// Generate referral code for authenticated user
export const POST = withAuth(
  rateLimit('apiCall')(
    async (request: any): Promise<NextResponse<APIResponse<{ referralCode: string; referralUrl: string }>>> => {
      try {
        // Check if user already has a referral code
        if (request.user.referral_code) {
          return NextResponse.json({
            success: true,
            data: {
              referralCode: request.user.referral_code,
              referralUrl: `${config.appUrl}?ref=${request.user.referral_code}`
            }
          });
        }

        // Generate new referral code
        const referralCode = generateReferralCode();

        // Update user with referral code
        await supabase.updateUser(request.user.id, {
          referral_code: referralCode
        });

        return NextResponse.json({
          success: true,
          data: {
            referralCode,
            referralUrl: `${config.appUrl}?ref=${referralCode}`
          }
        });

      } catch (error) {
        console.error('Generate referral code error:', error);
        return NextResponse.json({
          success: false,
          error: {
            code: 'GENERATE_REFERRAL_CODE_FAILED',
            message: 'Failed to generate referral code'
          }
        }, { status: 500 });
      }
    }
  )
);

// Apply referral code (for new users during signup)
export const PUT = optionalAuthenticate(
  rateLimit('auth')(
    async (request: any): Promise<NextResponse<APIResponse<{ success: boolean; reward?: string }>>> => {
      try {
        const body = await request.json();
        const { referralCode, email } = body;

        if (!referralCode) {
          return NextResponse.json({
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Referral code is required'
            }
          }, { status: 400 });
        }

        // Find referral by code
        const referral = await supabase.getReferralByCode(referralCode);

        if (!referral) {
          return NextResponse.json({
            success: false,
            error: {
              code: 'REFERRAL_NOT_FOUND',
              message: 'Invalid referral code'
            }
          }, { status: 404 });
        }

        if (referral.status !== 'pending') {
          return NextResponse.json({
            success: false,
            error: {
              code: 'REFERRAL_ALREADY_USED',
              message: 'This referral code has already been used'
            }
          }, { status: 400 });
        }

        let userId: string;

        if (request.user) {
          // User is authenticated, update existing referral
          userId = request.user.id;
        } else if (email) {
          // Find user by email for unauthenticated application
          const user = await supabase.getUserByEmail(email);
          if (!user) {
            return NextResponse.json({
              success: false,
              error: {
                code: 'USER_NOT_FOUND',
                message: 'Please create an account first, then apply the referral code'
              }
            }, { status: 404 });
          }
          userId = user.id;
        } else {
          return NextResponse.json({
            success: false,
            error: {
              code: 'AUTHENTICATION_REQUIRED',
              message: 'Please authenticate or provide email to apply referral code'
            }
          }, { status: 401 });
        }

        // Update referral with referred user
        await supabase.query(`
          UPDATE referrals
          SET referred_user_id = $1, status = 'completed', conversion_date = NOW()
          WHERE id = $2
        `, [userId, referral.id]);

        // Update the new user's referred_by field
        await supabase.updateUser(userId, {
          referred_by: referral.referrer_id
        });

        // Determine reward based on referrer's subscription tier
        const reward = await calculateReferralReward(referral.referrer_id);

        // Apply reward to referrer
        if (reward && reward !== 'no_reward') {
          await applyReferralReward(referral.referrer_id, reward);
        }

        // Track conversion
        await trackReferralConversion(referral.referrer_id, referralCode, reward);

        return NextResponse.json({
          success: true,
          data: {
            success: true,
            reward: reward !== 'no_reward' ? reward : undefined
          }
        });

      } catch (error) {
        console.error('Apply referral code error:', error);
        return NextResponse.json({
          success: false,
          error: {
            code: 'APPLY_REFERRAL_CODE_FAILED',
            message: 'Failed to apply referral code'
          }
        }, { status: 500 });
      }
    }
  )
);

// Get user's referrals
export const GET = withAuth(
  rateLimit('apiCall')(
    async (request: any): Promise<NextResponse<APIResponse<Referral[]>>> => {
      try {
        const referrals = await supabase.getUserReferrals(request.user.id);

        return NextResponse.json({
          success: true,
          data: referrals
        });

      } catch (error) {
        console.error('Get referrals error:', error);
        return NextResponse.json({
          success: false,
          error: {
            code: 'GET_REFERRALS_FAILED',
            message: 'Failed to retrieve referrals'
          }
        }, { status: 500 });
      }
    }
  )
);

// Get viral metrics for user
export async function getViralMetrics(
  request: any,
  period: 'daily' | 'weekly' | 'monthly' = 'monthly'
): Promise<NextResponse<APIResponse<ViralMetrics[]>>> {
  try {
    const metrics = await supabase.getViralMetrics(request.user.id, period);

    return NextResponse.json({
      success: true,
      data: metrics
    });

  } catch (error) {
    console.error('Get viral metrics error:', error);
    return NextResponse.json({
      success: false,
      error: {
        code: 'GET_VIRAL_METRICS_FAILED',
        message: 'Failed to retrieve viral metrics'
      }
    }, { status: 500 });
  }
}

// Track sharing event
export async function trackSharing(request: any): Promise<NextResponse<APIResponse<{ tracked: boolean }>>> {
  try {
    const body = await request.json();
    const { platform, contentType, contentId } = body;

    if (!platform || !contentType || !contentId) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Platform, content type, and content ID are required'
        }
      }, { status: 400 });
    }

    // Get user's referral code
    let referralCode = request.user.referral_code;
    if (!referralCode) {
      referralCode = generateReferralCode();
      await supabase.updateUser(request.user.id, {
        referral_code: referralCode
      });
    }

    // Track sharing event
    await supabase.trackSharingEvent({
      user_id: request.user.id,
      platform,
      content_type: contentType,
      content_id,
      referral_code_used: referralCode
    });

    return NextResponse.json({
      success: true,
      data: { tracked: true }
    });

  } catch (error) {
    console.error('Track sharing error:', error);
    return NextResponse.json({
      success: false,
      error: {
        code: 'TRACK_SHARING_FAILED',
        message: 'Failed to track sharing event'
      }
    }, { status: 500 });
  }
}

// Get referral statistics
export async function getReferralStats(request: any): Promise<NextResponse<APIResponse<any>>> {
  try {
    const userId = request.user.id;

    // Get referral counts
    const referrals = await supabase.getUserReferrals(userId);
    const totalReferrals = referrals.length;
    const completedReferrals = referrals.filter(r => r.status === 'completed').length;
    const pendingReferrals = referrals.filter(r => r.status === 'pending').length;

    // Get viral metrics for different periods
    const [dailyMetrics, weeklyMetrics, monthlyMetrics] = await Promise.all([
      supabase.getViralMetrics(userId, 'daily'),
      supabase.getViralMetrics(userId, 'weekly'),
      supabase.getViralMetrics(userId, 'monthly')
    ]);

    // Calculate viral coefficient
    const calculateViralCoefficient = (metrics: any[]) => {
      if (metrics.length === 0) return 0;

      const totalReferrals = metrics.reduce((sum, m) => sum + m.referrals_sent, 0);
      const totalConversions = metrics.reduce((sum, m) => sum + m.referrals_converted, 0);

      return totalReferrals > 0 ? totalConversions / totalReferrals : 0;
    };

    // Get sharing events breakdown
    const sharingEvents = await supabase.getUserSharingEvents(userId, 100);
    const sharingByPlatform = sharingEvents.reduce((acc, event) => {
      acc[event.platform] = (acc[event.platform] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Calculate rewards earned
    const rewardsEarned = referrals
      .filter(r => r.status === 'completed' && r.reward_tier)
      .map(r => r.reward_tier);

    const rewardCounts = rewardsEarned.reduce((acc, reward) => {
      acc[reward!] = (acc[reward!] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return NextResponse.json({
      success: true,
      data: {
        referrals: {
          total: totalReferrals,
          completed: completedReferrals,
          pending: pendingReferrals,
          conversion_rate: totalReferrals > 0 ? completedReferrals / totalReferrals : 0
        },
        viral_coefficient: {
          daily: calculateViralCoefficient(dailyMetrics),
          weekly: calculateViralCoefficient(weeklyMetrics),
          monthly: calculateViralCoefficient(monthlyMetrics)
        },
        sharing_breakdown: sharingByPlatform,
        rewards: {
          free_months: rewardCounts['free_month'] || 0,
          discounts: rewardCounts['discount'] || 0,
          cash_bonuses: rewardCounts['cash_bonus'] || 0
        },
        top_platform: Object.entries(sharingByPlatform)
          .sort(([,a], [,b]) => b - a)[0]?.[0] || 'none'
      }
    });

  } catch (error) {
    console.error('Get referral stats error:', error);
    return NextResponse.json({
      success: false,
      error: {
        code: 'GET_REFERRAL_STATS_FAILED',
        message: 'Failed to retrieve referral statistics'
      }
    }, { status: 500 });
  }
}

// Helper functions
function generateReferralCode(): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return code;
}

async function calculateReferralReward(referrerId: string): Promise<string> {
  try {
    const referrerSubscription = await supabase.getUserSubscription(referrerId);

    if (!referrerSubscription) {
      return 'no_reward';
    }

    const tier = referrerSubscription.tier;
    const referralCount = await supabase.query(`
      SELECT COUNT(*) as count
      FROM referrals
      WHERE referrer_id = $1 AND status = 'completed'
    `, [referrerId]);

    const completedReferrals = parseInt(referralCount[0]?.count || '0');

    // Reward structure based on subscription tier and referral count
    if (tier === 'enterprise') {
      if (completedReferrals < 5) return 'cash_bonus';
      if (completedReferrals < 20) return 'cash_bonus';
      return 'cash_bonus';
    } else if (tier === 'team') {
      if (completedReferrals < 3) return 'free_month';
      if (completedReferrals < 10) return 'free_month';
      return 'discount';
    } else if (tier === 'pro') {
      if (completedReferrals < 2) return 'discount';
      return 'discount';
    } else if (tier === 'starter') {
      return 'discount';
    }

    return 'no_reward';
  } catch (error) {
    console.error('Error calculating referral reward:', error);
    return 'no_reward';
  }
}

async function applyReferralReward(referrerId: string, reward: string): Promise<void> {
  try {
    if (reward === 'free_month') {
      // Add free month to subscription
      const subscription = await supabase.getUserSubscription(referrerId);
      if (subscription && subscription.stripe_subscription_id) {
        // This would integrate with Stripe to add a free month
        // For now, just track the reward
        await supabase.query(`
          UPDATE referrals
          SET reward_tier = 'free_month', status = 'rewarded'
          WHERE referrer_id = $1 AND status = 'completed'
          ORDER BY conversion_date DESC
          LIMIT 1
        `, [referrerId]);
      }
    } else if (reward === 'discount') {
      // Apply discount to next invoice
      await supabase.query(`
        UPDATE referrals
        SET reward_tier = 'discount', status = 'rewarded'
        WHERE referrer_id = $1 AND status = 'completed'
        ORDER BY conversion_date DESC
        LIMIT 1
      `, [referrerId]);
    } else if (reward === 'cash_bonus') {
      // Track cash bonus for payout
      await supabase.query(`
        UPDATE referrals
        SET reward_tier = 'cash_bonus', status = 'rewarded'
        WHERE referrer_id = $1 AND status = 'completed'
        ORDER BY conversion_date DESC
        LIMIT 1
      `, [referrerId]);
    }
  } catch (error) {
    console.error('Error applying referral reward:', error);
  }
}

async function trackReferralConversion(referrerId: string, referralCode: string, reward: string): Promise<void> {
  try {
    const today = new Date().toISOString().split('T')[0];

    // Update viral metrics
    await supabase.query(`
      INSERT INTO viral_metrics (user_id, period, date, referrals_sent, referrals_converted, conversion_rate)
      VALUES ($1, 'daily', $2, 0, 1, 1.0)
      ON CONFLICT (user_id, period, date)
      DO UPDATE SET
        referrals_converted = viral_metrics.referrals_converted + 1,
        conversion_rate = CASE
          WHEN viral_metrics.referrals_sent > 0
          THEN (viral_metrics.referrals_converted + 1)::decimal / viral_metrics.referrals_sent
          ELSE 1.0
        END
    `, [referrerId, today]);

    // Track conversion event
    await supabase.trackUsage({
      user_id: referrerId,
      event_type: 'referral_conversion',
      metadata: { referral_code: referralCode, reward }
    });

  } catch (error) {
    console.error('Error tracking referral conversion:', error);
  }
}

// Export handlers for use in Next.js API routes
export const referralHandlers = {
  POST,
  GET,
  getViralMetrics,
  trackSharing,
  getReferralStats
};