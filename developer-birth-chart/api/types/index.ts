/**
 * Core type definitions for Developer Birth Chart API
 */

export interface GitHubUserData {
  id: number;
  login: string;
  name: string;
  bio: string;
  avatar_url: string;
  location: string;
  company: string;
  blog: string;
  public_repos: number;
  followers: number;
  following: number;
  created_at: string;
  updated_at: string;
}

export interface RepositoryData {
  id: number;
  name: string;
  description: string;
  language: string;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  topics: string[];
}

export interface CommitData {
  sha: string;
  message: string;
  author: {
    name: string;
    email: string;
    date: string;
  };
  commit: {
    author: {
      name: string;
      email: string;
      date: string;
    };
    message: string;
  };
}

export interface DeveloperBirthChart {
  id: string;
  userId: string;
  githubUsername: string;
  birthDate: string; // GitHub account creation date
  personality: PersonalityAnalysis;
  skills: SkillAnalysis;
  career: CareerAnalysis;
  social: SocialAnalysis;
  createdAt: string;
  updatedAt: string;
}

export interface PersonalityAnalysis {
  zodiacSign: string;
  personalityType: string;
  traits: string[];
  compatibility: CompatibilityScore[];
  insights: string[];
  confidence: number;
}

export interface SkillAnalysis {
  languages: LanguageSkill[];
  frameworks: FrameworkSkill[];
  tools: ToolSkill[];
  expertise: string[];
  growthAreas: string[];
}

export interface LanguageSkill {
  language: string;
  proficiency: number;
  repositories: number;
  linesOfCode: number;
  experience: string;
}

export interface FrameworkSkill {
  framework: string;
  proficiency: number;
  projects: number;
  experience: string;
}

export interface ToolSkill {
  tool: string;
  proficiency: number;
  usage: string;
}

export interface CareerAnalysis {
  careerPath: string;
  trajectory: CareerTrajectory;
  milestones: CareerMilestone[];
  recommendations: string[];
  potential: CareerPotential;
}

export interface CareerTrajectory {
  current: CareerStage;
  next: CareerStage[];
  timeline: string[];
}

export interface CareerStage {
  title: string;
  level: string;
  skills: string[];
  timeframe: string;
}

export interface CareerMilestone {
  title: string;
  description: string;
  date: string;
  impact: string;
}

export interface CareerPotential {
  seniorDeveloper: number;
  techLead: number;
  engineeringManager: number;
  cto: number;
  founder: number;
  consultant: number;
}

export interface SocialAnalysis {
  collaboration: CollaborationStyle;
  influence: InfluenceScore;
  community: CommunityEngagement;
  network: NetworkAnalysis;
}

export interface CollaborationStyle {
  style: string;
  preferences: string[];
  communication: string;
  teamwork: string;
}

export interface InfluenceScore {
  score: number;
  reach: number;
  engagement: number;
  impact: string;
}

export interface CommunityEngagement {
  level: string;
  activities: string[];
  contributions: string[];
  recognition: string[];
}

export interface NetworkAnalysis {
  connections: number;
  collaborators: Collaborator[];
  influence: string;
  reach: string;
}

export interface Collaborator {
  username: string;
  name: string;
  collaborationType: string;
  projects: string[];
  strength: number;
}

export interface CompatibilityScore {
  username: string;
  score: number;
  aspects: CompatibilityAspect[];
  recommendations: string[];
}

export interface CompatibilityAspect {
  aspect: string;
  score: number;
  description: string;
}

// API Request/Response Types
export interface ShareRequest {
  platform: 'twitter' | 'linkedin' | 'discord';
  chartId: string;
  message?: string;
  image?: boolean;
}

export interface ShareResponse {
  success: boolean;
  url?: string;
  error?: string;
  postId?: string;
}

export interface TeamAnalysisRequest {
  usernames: string[];
  organization?: string;
  depth?: 'basic' | 'detailed' | 'comprehensive';
}

export interface TeamAnalysisResponse {
  teamId: string;
  members: TeamMember[];
  dynamics: TeamDynamics;
  recommendations: TeamRecommendation[];
  synergy: TeamSynergy;
}

export interface TeamMember {
  username: string;
  role: string;
  personality: PersonalityAnalysis;
  skills: SkillAnalysis;
  collaboration: CollaborationStyle;
}

export interface TeamDynamics {
  communicationStyle: string;
  decisionMaking: string;
  conflictResolution: string;
  productivity: string;
  innovation: string;
}

export interface TeamRecommendation {
  category: string;
  recommendation: string;
  priority: 'high' | 'medium' | 'low';
  impact: string;
}

export interface TeamSynergy {
  overall: number;
  technical: number;
  creative: number;
  leadership: number;
  communication: number;
}

// Webhook Types
export interface GitHubWebhookEvent {
  action: string;
  repository: RepositoryData;
  sender: GitHubUserData;
  timestamp: string;
  type: string;
}

export interface DiscordWebhookEvent {
  id: string;
  token: string;
  type: number;
  guild_id?: string;
  channel_id: string;
  data: any;
}

// Analytics Types
export interface AnalyticsEvent {
  event: string;
  userId?: string;
  properties: Record<string, any>;
  timestamp: string;
  platform?: string;
  version?: string;
}

export interface ChartGenerationEvent extends AnalyticsEvent {
  event: 'chart_generated';
  properties: {
    username: string;
    personalityType: string;
    processingTime: number;
    dataPoints: number;
    features: string[];
  };
}

export interface ShareEvent extends AnalyticsEvent {
  event: 'chart_shared';
  properties: {
    platform: string;
    chartId: string;
    messageLength: number;
    hasImage: boolean;
  };
}

// Error Types
export interface APIError {
  error: string;
  message: string;
  code?: string;
  details?: Record<string, any>;
  timestamp: string;
  requestId: string;
}

// Rate Limiting Types
export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  message: string;
  standardHeaders: boolean;
  legacyHeaders: boolean;
}

// Integration Config Types
export interface TwitterConfig {
  apiKey: string;
  apiSecret: string;
  accessToken: string;
  accessTokenSecret: string;
  bearerToken: string;
  clientId: string;
  clientSecret: string;
}

export interface LinkedInConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scope: string[];
}

export interface DiscordConfig {
  botToken: string;
  clientId: string;
  clientSecret: string;
  guildId: string;
  channelId: string;
}

export interface StripeConfig {
  secretKey: string;
  publishableKey: string;
  webhookSecret: string;
  connectClientId?: string;
}

export interface SendGridConfig {
  apiKey: string;
  fromEmail: string;
  fromName: string;
  templates: Record<string, string>;
}

export interface SentryConfig {
  dsn: string;
  environment: string;
  tracesSampleRate: number;
  profilesSampleRate: number;
}

export interface MixpanelConfig {
  token: string;
  enabled: boolean;
  debug: boolean;
}

// Database Types
export interface DatabaseConfig {
  url: string;
  poolSize?: number;
  ssl?: boolean;
  maxConnections?: number;
  connectionTimeout?: number;
}

export interface RedisConfig {
  url: string;
  keyPrefix: string;
  ttl: number;
  maxRetries: number;
}