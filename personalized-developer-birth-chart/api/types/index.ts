import { z } from 'zod';

// User Schema
export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  username: z.string().min(3).max(30),
  github_username: z.string().optional(),
  stripe_customer_id: z.string().optional(),
  referral_code: z.string().optional(),
  referred_by: z.string().optional(),
  created_at: z.date(),
  updated_at: z.date(),
});

// Subscription Tiers
export enum SubscriptionTier {
  FREE = 'free',
  STARTER = 'starter', // $5/month
  PRO = 'pro', // $15/month
  TEAM = 'team', // $49/month
  ENTERPRISE = 'enterprise', // Custom pricing
}

export const SubscriptionSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  tier: z.nativeEnum(SubscriptionTier),
  stripe_subscription_id: z.string().optional(),
  status: z.enum(['active', 'canceled', 'past_due', 'unpaid', 'trialing']),
  current_period_start: z.date(),
  current_period_end: z.date(),
  cancel_at_period_end: z.boolean(),
  usage_limits: z.object({
    charts_per_month: z.number(),
    team_members: z.number(),
    api_calls_per_day: z.number(),
    advanced_features: z.boolean(),
    priority_support: z.boolean(),
  }),
  created_at: z.date(),
  updated_at: z.date(),
});

// Feature Gating
export const FeatureGates = {
  [SubscriptionTier.FREE]: {
    charts_per_month: 3,
    team_members: 1,
    api_calls_per_day: 100,
    advanced_features: false,
    priority_support: false,
  },
  [SubscriptionTier.STARTER]: {
    charts_per_month: 25,
    team_members: 3,
    api_calls_per_day: 1000,
    advanced_features: false,
    priority_support: false,
  },
  [SubscriptionTier.PRO]: {
    charts_per_month: 250,
    team_members: 10,
    api_calls_per_day: 10000,
    advanced_features: true,
    priority_support: false,
  },
  [SubscriptionTier.TEAM]: {
    charts_per_month: 1000,
    team_members: 25,
    api_calls_per_day: 50000,
    advanced_features: true,
    priority_support: true,
  },
  [SubscriptionTier.ENTERPRISE]: {
    charts_per_month: -1, // Unlimited
    team_members: -1, // Unlimited
    api_calls_per_day: -1, // Unlimited
    advanced_features: true,
    priority_support: true,
  },
};

// Developer Birth Chart
export const DeveloperChartSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  github_username: z.string(),
  birth_date: z.date(), // When they joined GitHub
  chart_data: z.object({
    coding_sign: z.string(), // Primary language/archetype
    tech_ascendant: z.string(), // Stack/architecture they project
    collaboration_moon: z.string(), // Teamwork style
    innovation_mars: z.string(), // Problem-solving approach
    communication_mercury: z.string(), // Documentation/commenting
    learning_jupiter: z.string(), // Growth pattern
    stability_saturn: z.string(), // Code quality approach
  }),
  metrics: z.object({
    total_contributions: z.number(),
    repositories_count: z.number(),
    languages_used: z.array(z.string()),
    commit_frequency: z.number(),
    collaboration_score: z.number(),
    innovation_score: z.number(),
    learning_velocity: z.number(),
  }),
  generated_at: z.date(),
  is_premium: z.boolean(),
  team_id: z.string().optional(),
});

// Team Constellation
export const TeamSchema = z.object({
  id: z.string(),
  name: z.string(),
  owner_id: z.string(),
  members: z.array(z.object({
    user_id: z.string(),
    role: z.enum(['owner', 'admin', 'member']),
    joined_at: z.date(),
  })),
  constellation_map: z.object({
    harmony_score: z.number(),
    complementary_skills: z.array(z.string()),
    potential_conflicts: z.array(z.string()),
    team_archetype: z.string(),
    recommended_structure: z.array(z.string()),
  }),
  created_at: z.date(),
  updated_at: z.date(),
});

// Referral System
export const ReferralSchema = z.object({
  id: z.string(),
  referrer_id: z.string(),
  referred_user_id: z.string(),
  referral_code: z.string(),
  status: z.enum(['pending', 'completed', 'rewarded']),
  reward_tier: z.enum(['free_month', 'discount', 'cash_bonus']),
  conversion_date: z.date().optional(),
  created_at: z.date(),
});

// Viral Analytics
export const ViralMetricsSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  period: z.enum(['daily', 'weekly', 'monthly']),
  referrals_sent: z.number(),
  referrals_converted: z.number(),
  conversion_rate: z.number(),
  viral_coefficient: z.number(),
  sharing_events: z.object({
    twitter: z.number(),
    linkedin: z.number(),
    email: z.number(),
    direct: z.number(),
  }),
  generated_at: z.date(),
});

// Usage Tracking
export const UsageTrackingSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  event_type: z.enum(['chart_generated', 'api_call', 'team_analysis', 'export']),
  resource_id: z.string().optional(),
  metadata: z.record(z.any()),
  created_at: z.date(),
});

// API Response Types
export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    pagination?: {
      page: number;
      limit: number;
      total: number;
      total_pages: number;
    };
    usage?: {
      current: number;
      limit: number;
      reset_date: string;
    };
  };
}

// Webhook Event Types
export enum WebhookEventType {
  SUBSCRIPTION_CREATED = 'subscription.created',
  SUBSCRIPTION_UPDATED = 'subscription.updated',
  SUBSCRIPTION_DELETED = 'subscription.deleted',
  INVOICE_PAID = 'invoice.paid',
  INVOICE_FAILED = 'invoice.failed',
  CUSTOMER_CREATED = 'customer.created',
}

// GitHub Analysis Types
export interface GitHubAnalysisResult {
  user: {
    login: string;
    created_at: string;
    public_repos: number;
    followers: number;
    following: number;
  };
  repositories: Array<{
    name: string;
    language: string;
    stargazers_count: number;
    forks_count: number;
    created_at: string;
    updated_at: string;
  }>;
  contributions: {
    total: number;
    daily_contributions: Array<{
      date: string;
      count: number;
    }>;
  };
  languages: Record<string, number>;
  collaboration_patterns: {
    pull_requests_created: number;
    pull_requests_reviewed: number;
    issues_opened: number;
    issues_closed: number;
  };
}

// Chart Generation Request
export const ChartGenerationRequestSchema = z.object({
  github_username: z.string().min(1),
  include_team_analysis: z.boolean().optional(),
  team_member_usernames: z.array(z.string()).optional(),
  chart_style: z.enum(['modern', 'classic', 'minimalist']).optional(),
  include_predictions: z.boolean().optional(),
});

// Export Types
export enum ExportFormat {
  PNG = 'png',
  SVG = 'svg',
  PDF = 'pdf',
  JSON = 'json',
}

// Achievement System
export const AchievementSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  type: z.enum(['chart_count', 'referral_milestone', 'team_builder', 'innovation']),
  title: z.string(),
  description: z.string(),
  icon_url: z.string(),
  unlocked_at: z.date(),
  rarity: z.enum(['common', 'rare', 'epic', 'legendary']),
});

export type User = z.infer<typeof UserSchema>;
export type Subscription = z.infer<typeof SubscriptionSchema>;
export type DeveloperChart = z.infer<typeof DeveloperChartSchema>;
export type Team = z.infer<typeof TeamSchema>;
export type Referral = z.infer<typeof ReferralSchema>;
export type ViralMetrics = z.infer<typeof ViralMetricsSchema>;
export type UsageTracking = z.infer<typeof UsageTrackingSchema>;
export type Achievement = z.infer<typeof AchievementSchema>;
export type ChartGenerationRequest = z.infer<typeof ChartGenerationRequestSchema>;