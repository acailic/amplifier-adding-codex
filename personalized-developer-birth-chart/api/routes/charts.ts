import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabase } from '../lib/supabase';
import { githubService } from '../lib/github';
import { withAuth, requireFeature } from '../middleware/auth';
import { rateLimit } from '../middleware/rateLimit';
import {
  ChartGenerationRequestSchema,
  APIResponse,
  DeveloperChart,
  ExportFormat
} from '../types';

// Generate a new developer birth chart
export const POST = withAuth(
  rateLimit('chartGeneration')(
    async (request: any): Promise<NextResponse<APIResponse<DeveloperChart>>> => {
      try {
        const body = await request.json();
        const { data: requestData, error: validationError } = ChartGenerationRequestSchema.safeParse(body);

        if (validationError) {
          return NextResponse.json({
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Invalid request data',
              details: validationError.errors
            }
          }, { status: 400 });
        }

        const { github_username, include_team_analysis, team_member_usernames, chart_style, include_predictions } = requestData;

        // Check usage limits
        const usageCheck = await supabase.checkUsageLimits(request.user.id, 'chart_generated');
        if (!usageCheck.allowed) {
          return NextResponse.json({
            success: false,
            error: {
              code: 'USAGE_LIMIT_EXCEEDED',
              message: 'You have reached your monthly chart generation limit',
              current: usageCheck.current,
              limit: usageCheck.limit
            }
          }, { status: 429 });
        }

        // Check if team analysis is requested and user has premium features
        if (include_team_analysis || team_member_usernames?.length > 0) {
          if (!request.subscription?.usage_limits?.advanced_features) {
            return NextResponse.json({
              success: false,
              error: {
                code: 'PREMIUM_FEATURE_REQUIRED',
                message: 'Team constellation analysis requires a Pro subscription or higher'
              }
            }, { status: 403 });
          }
        }

        // Analyze the primary developer
        const analysis = await githubService.analyzeDeveloper(github_username);
        const chart = await githubService.generateBirthChart(analysis);

        // Set chart properties
        chart.user_id = request.user.id;
        chart.is_premium = request.subscription?.usage_limits?.advanced_features || false;

        // Save the chart to database
        const savedChart = await supabase.createChart({
          user_id: request.user.id,
          github_username: chart.github_username,
          birth_date: chart.birth_date.toISOString(),
          chart_data: chart.chart_data,
          metrics: chart.metrics,
          is_premium: chart.is_premium
        });

        // Track usage
        await supabase.trackUsage({
          user_id: request.user.id,
          event_type: 'chart_generated',
          resource_id: savedChart.id,
          metadata: {
            github_username,
            include_team_analysis,
            team_member_count: team_member_usernames?.length || 0,
            chart_style,
            include_predictions
          }
        });

        // Check for achievements
        await checkForAchievements(request.user.id, savedChart.id);

        return NextResponse.json({
          success: true,
          data: savedChart,
          meta: {
            usage: usageCheck
          }
        });

      } catch (error) {
        console.error('Chart generation error:', error);
        return NextResponse.json({
          success: false,
          error: {
            code: 'CHART_GENERATION_FAILED',
            message: 'Failed to generate developer birth chart',
            details: config.isDevelopment ? error.message : undefined
          }
        }, { status: 500 });
      }
    }
  )
);

// Get user's charts
export const GET = withAuth(
  rateLimit('apiCall')(
    async (request: any): Promise<NextResponse<APIResponse<DeveloperChart[]>>> => {
      try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const team_id = searchParams.get('team_id');

        let result;
        if (team_id) {
          // Get charts for a specific team
          result = await supabase.getTeamCharts(team_id, limit, (page - 1) * limit);
        } else {
          // Get user's personal charts
          result = await supabase.getUserCharts(request.user.id, limit, (page - 1) * limit);
        }

        return NextResponse.json({
          success: true,
          data: result.charts,
          meta: {
            pagination: {
              page,
              limit,
              total: result.total,
              total_pages: Math.ceil(result.total / limit)
            }
          }
        });

      } catch (error) {
        console.error('Get charts error:', error);
        return NextResponse.json({
          success: false,
          error: {
            code: 'GET_CHARTS_FAILED',
            message: 'Failed to retrieve charts'
          }
        }, { status: 500 });
      }
    }
  )
);

// Get a specific chart by ID
export async function getChartById(
  request: any,
  chartId: string
): Promise<NextResponse<APIResponse<DeveloperChart>>> {
  try {
    const chart = await supabase.getChartById(chartId, request.user?.id);

    if (!chart) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'CHART_NOT_FOUND',
          message: 'Chart not found or access denied'
        }
      }, { status: 404 });
    }

    // Update last accessed timestamp
    await supabase.updateChart(chartId, { last_accessed: new Date().toISOString() });

    return NextResponse.json({
      success: true,
      data: chart
    });

  } catch (error) {
    console.error('Get chart error:', error);
    return NextResponse.json({
      success: false,
      error: {
        code: 'GET_CHART_FAILED',
        message: 'Failed to retrieve chart'
      }
    }, { status: 500 });
  }
}

// Export chart as different formats (premium feature)
export async function exportChart(
  request: any,
  chartId: string,
  format: ExportFormat
): Promise<NextResponse<APIResponse<{ url: string }>>> {
  try {
    // Check if user has premium features
    if (!request.subscription?.usage_limits?.advanced_features) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'PREMIUM_FEATURE_REQUIRED',
          message: 'Chart export requires a Pro subscription or higher'
        }
      }, { status: 403 });
    }

    const chart = await supabase.getChartById(chartId, request.user.id);

    if (!chart) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'CHART_NOT_FOUND',
          message: 'Chart not found'
        }
      }, { status: 404 });
    }

    // Check usage limits for exports
    const usageCheck = await supabase.checkUsageLimits(request.user.id, 'export');
    if (!usageCheck.allowed) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'EXPORT_LIMIT_EXCEEDED',
          message: 'You have reached your export limit',
          current: usageCheck.current,
          limit: usageCheck.limit
        }
      }, { status: 429 });
    }

    // Generate export (this would integrate with your image generation service)
    const exportUrl = await generateChartExport(chart, format);

    // Track export usage
    await supabase.trackUsage({
      user_id: request.user.id,
      event_type: 'export',
      resource_id: chartId,
      metadata: { format }
    });

    return NextResponse.json({
      success: true,
      data: { url: exportUrl }
    });

  } catch (error) {
    console.error('Export chart error:', error);
    return NextResponse.json({
      success: false,
      error: {
        code: 'EXPORT_FAILED',
        message: 'Failed to export chart'
      }
    }, { status: 500 });
  }
}

// Share chart with referral tracking
export async function shareChart(
  request: any,
  chartId: string,
  platform: string
): Promise<NextResponse<APIResponse<{ shareUrl: string; referralCode: string }>>> {
  try {
    const chart = await supabase.getChartById(chartId, request.user.id);

    if (!chart) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'CHART_NOT_FOUND',
          message: 'Chart not found'
        }
      }, { status: 404 });
    }

    // Get or create referral code for user
    let referralCode = request.user.referral_code;
    if (!referralCode) {
      referralCode = generateReferralCode();
      await supabase.updateUser(request.user.id, { referral_code: referralCode });
    }

    // Create sharing URL with referral tracking
    const baseUrl = config.appUrl;
    const shareUrl = `${baseUrl}/chart/${chartId}?ref=${referralCode}`;

    // Track sharing event
    await supabase.trackSharingEvent({
      user_id: request.user.id,
      platform,
      content_type: 'chart',
      content_id: chartId,
      referral_code_used: referralCode
    });

    // Update viral metrics
    await updateViralMetrics(request.user.id, platform);

    return NextResponse.json({
      success: true,
      data: {
        shareUrl,
        referralCode
      }
    });

  } catch (error) {
    console.error('Share chart error:', error);
    return NextResponse.json({
      success: false,
      error: {
        code: 'SHARE_FAILED',
        message: 'Failed to share chart'
      }
    }, { status: 500 });
  }
}

// Helper functions
async function checkForAchievements(userId: string, chartId: string): Promise<void> {
  const { charts, total } = await supabase.getUserCharts(userId, 100, 0);

  // First chart achievement
  if (total === 1) {
    await supabase.unlockAchievement({
      user_id: userId,
      type: 'chart_count',
      title: 'First Step',
      description: 'Generated your first developer birth chart',
      rarity: 'common'
    });
  }

  // Chart milestones
  if (total === 10) {
    await supabase.unlockAchievement({
      user_id: userId,
      type: 'chart_count',
      title: 'Chart Enthusiast',
      description: 'Generated 10 developer birth charts',
      rarity: 'rare'
    });
  }

  if (total === 50) {
    await supabase.unlockAchievement({
      user_id: userId,
      type: 'chart_count',
      title: 'Chart Master',
      description: 'Generated 50 developer birth charts',
      rarity: 'epic'
    });
  }
}

function generateReferralCode(): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return code;
}

async function generateChartExport(chart: DeveloperChart, format: ExportFormat): Promise<string> {
  // This would integrate with your image generation service (Canvas, Sharp, etc.)
  // For now, return a placeholder URL
  return `${config.appUrl}/api/exports/${chart.id}.${format}`;
}

async function updateViralMetrics(userId: string, platform: string): Promise<void> {
  // This would update the viral_metrics table
  // Implementation depends on your specific tracking requirements
  const today = new Date().toISOString().split('T')[0];

  // Update or create daily viral metrics
  await supabase.query(`
    INSERT INTO viral_metrics (user_id, period, date, sharing_events)
    VALUES ($1, 'daily', $2, jsonb_build_object($3, 1))
    ON CONFLICT (user_id, period, date)
    DO UPDATE SET
      sharing_events = viral_metrics.sharing_events ||
        jsonb_build_object($3, COALESCE((viral_metrics.sharing_events->$3)::int, 0) + 1)
  `, [userId, today, platform]);
}

// Export functions for use in Next.js API routes
export const chartHandlers = {
  POST,
  GET,
  getChartById,
  exportChart,
  shareChart
};