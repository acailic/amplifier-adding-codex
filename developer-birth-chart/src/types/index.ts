// GitHub API Types
export interface GitHubUser {
  id: number
  login: string
  name: string | null
  avatar_url: string
  bio: string | null
  location: string | null
  company: string | null
  blog: string | null
  email: string | null
  twitter_username: string | null
  public_repos: number
  followers: number
  following: number
  created_at: string
  updated_at: string
  hireable: boolean | null
  site_admin: boolean
}

export interface GitHubRepository {
  id: number
  name: string
  full_name: string
  description: string | null
  language: string | null
  stargazers_count: number
  watchers_count: number
  forks_count: number
  open_issues_count: number
  created_at: string
  updated_at: string
  pushed_at: string
  size: number
  default_branch: string
  topics: string[]
  license: {
    key: string
    name: string
  } | null
  private: boolean
  fork: boolean
  archived: boolean
}

export interface GitHubCommit {
  sha: string
  commit: {
    author: {
      name: string
      email: string
      date: string
    }
    message: string
  }
  author: {
    login: string
    id: number
    avatar_url: string
  } | null
}

export interface GitHubEvent {
  id: string
  type: string
  actor: {
    login: string
    id: number
    avatar_url: string
  }
  repo: {
    name: string
    id: number
  }
  payload: any
  public: boolean
  created_at: string
}

// Analysis Types
export interface DeveloperProfile {
  user: GitHubUser
  repositories: GitHubRepository[]
  recentActivity: GitHubEvent[]
  commitHistory: GitHubCommit[]
  stats: {
    totalCommits: number
    languages: Record<string, number>
    topics: Record<string, number>
    activityPattern: {
      hour: number[]
      dayOfWeek: number[]
      month: number[]
    }
    collaboration: {
      collaborators: number
      contributionsToOthers: number
      ownProjects: number
    }
  }
}

export interface PersonalityTrait {
  name: string
  value: number // 0-100
  description: string
  evidence: string[]
  zodiacSign: string
  element: 'fire' | 'earth' | 'air' | 'water'
  rulingPlanet: string
}

export interface ConstellationData {
  id: string
  name: string
  type: 'star' | 'planet' | 'asteroid' | 'comet'
  x: number
  y: number
  z: number
  magnitude: number
  color: string
  constellation: string
  trait?: PersonalityTrait
  connections: string[]
}

export interface BirthChart {
  id: string
  username: string
  createdAt: string
  profile: DeveloperProfile
  personality: {
    mainTrait: PersonalityTrait
    secondaryTraits: PersonalityTrait[]
    compatibility: {
      withTeam: string[]
      tools: string[]
      environments: string[]
    }
    careerPath: {
      current: string
      potential: string[]
      timeline: {
        year: number
        milestone: string
        probability: number
      }[]
    }
  }
  constellation: {
    nodes: ConstellationData[]
    connections: {
      from: string
      to: string
      strength: number
      type: 'aspect' | 'conjunction' | 'opposition' | 'trine'
    }[]
    theme: 'stellar' | 'cosmic' | 'nebula' | 'galaxy'
  }
  insights: {
    strengths: string[]
    weaknesses: string[]
    opportunities: string[]
    threats: string[]
  }
  compatibility: {
    similarDevelopers: string[]
    oppositePersonality: string[]
    idealTeamRoles: string[]
  }
}

// Chart Generation Types
export interface ChartGenerationRequest {
  username: string
  includePrivate: boolean
  theme: 'light' | 'dark' | 'cosmic'
  style: 'minimal' | 'detailed' | 'artistic'
}

export interface ChartGenerationResponse {
  success: boolean
  data?: BirthChart
  error?: string
  warnings?: string[]
}

// UI State Types
export interface AppTheme {
  mode: 'light' | 'dark' | 'auto'
  cosmic: boolean
  accent: string
}

export interface AppState {
  theme: AppTheme
  currentChart: BirthChart | null
  isLoading: boolean
  error: string | null
  offlineMode: boolean
  charts: BirthChart[]
  userPreferences: {
    notifications: boolean
    vibrate: boolean
    autoSync: boolean
    analytics: boolean
  }
}

// PWA Types
export interface NotificationConfig {
  cosmicEvents: boolean
  chartUpdates: boolean
  weeklyInsights: boolean
  achievementMilestones: boolean
}

export interface ShareData {
  title: string
  text: string
  url: string
  files?: File[]
}

// Analytics Types
export interface AnalyticsEvent {
  type: 'chart_generated' | 'chart_shared' | 'chart_saved' | 'theme_changed' | 'feature_used'
  data: Record<string, any>
  timestamp: string
  userId?: string
}

// Mobile Specific Types
export interface TouchGesture {
  type: 'tap' | 'swipe' | 'pinch' | 'rotate' | 'pan'
  direction?: 'up' | 'down' | 'left' | 'right'
  velocity?: number
  distance?: number
  scale?: number
  rotation?: number
}

export interface MobileOptimization {
  preferReducedMotion: boolean
  touchOptimized: boolean
  offlineFirst: boolean
  dataSaver: boolean
}

// API Response Types
export interface APIResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
  timestamp: string
}

export interface PaginatedResponse<T> extends APIResponse<T[]> {
  pagination: {
    page: number
    limit: number
    total: number
    hasMore: boolean
  }
}

// Chart Comparison Types
export interface ChartComparison {
  chart1: BirthChart
  chart2: BirthChart
  compatibility: number // 0-100
  similarities: string[]
  differences: string[]
  collaborationPotential: number // 0-100
  conflicts: string[]
}

// Team Analysis Types
export interface TeamMember {
  username: string
  birthChart: BirthChart
  role: string
  contributionLevel: number
  personalityFit: number
}

export interface TeamAnalysis {
  members: TeamMember[]
  teamDynamics: {
    cohesion: number
    communication: number
    innovation: number
    productivity: number
  }
  personalityDistribution: Record<string, number>
  recommendedChanges: string[]
}

// Export all types
export type {
  // Re-export React types
  ReactNode,
  ReactElement,
  ComponentType,
  FC,
} from 'react'