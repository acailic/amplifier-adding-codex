/**
 * Enhanced GitHub API Client for Developer Birth Chart
 * Handles deep analysis, webhooks, GitHub App integration, and sponsor features
 */

import { App, Octokit } from '@octokit/app';
import { createAppAuth } from '@octokit/auth-app';
import { Octokit as RestOctokit } from '@octokit/rest';
import { GitHubWebhookEvent } from '../../types';
import { logger } from '../monitoring/logger';
import { redisClient } from '../database/redis';

export interface EnhancedGitHubData {
  userData: any;
  repositories: any[];
  contributions: any[];
  commits: any[];
  pullRequests: any[];
  issues: any[];
  actions: any;
  sponsors: any;
  collaborations: any[];
  commitPatterns: CommitPattern[];
  technologyStack: TechnologyStack;
  collaborationNetwork: CollaborationNetwork;
  careerMilestones: CareerMilestone[];
}

export interface CommitPattern {
  dayOfWeek: number;
  hourOfDay: number;
  frequency: number;
  timezone: string;
  productivity: number;
  messageSentiment: 'positive' | 'neutral' | 'negative';
}

export interface TechnologyStack {
  languages: Record<string, number>;
  frameworks: Record<string, number>;
  tools: Record<string, number>;
  platforms: Record<string, number>;
  evolution: TechnologyEvolution[];
}

export interface TechnologyEvolution {
  period: string;
  languages: Record<string, number>;
  frameworks: Record<string, number>;
  newTechnologies: string[];
  abandonedTechnologies: string[];
}

export interface CollaborationNetwork {
  collaborators: Collaborator[];
  organizations: Organization[];
  mentorship: MentorshipRelationship[];
  influence: InfluenceMetrics;
}

export interface Collaborator {
  username: string;
  name: string;
  collaborationScore: number;
  sharedRepositories: string[];
  interactionFrequency: number;
  collaborationType: string[];
}

export interface Organization {
  name: string;
  role: string;
  contributionLevel: number;
  influence: string;
  startDate: string;
  endDate?: string;
}

export interface MentorshipRelationship {
  mentor: string;
  mentee: string;
  context: string;
  duration: string;
  impact: string;
}

export interface InfluenceMetrics {
  followers: number;
  following: number;
  repositoryStars: number;
  contributionImpact: number;
  communityEngagement: number;
}

export interface CareerMilestone {
  date: string;
  type: string;
  description: string;
  impact: string;
  repositories: string[];
  skills: string[];
}

export class EnhancedGitHubClient {
  private app: App;
  private octokit: RestOctokit;
  private appId: number;
  private privateKey: string;
  private clientId: string;
  private clientSecret: string;

  constructor() {
    this.appId = parseInt(process.env.GITHUB_APP_ID || '0');
    this.privateKey = process.env.GITHUB_PRIVATE_KEY || '';
    this.clientId = process.env.GITHUB_CLIENT_ID || '';
    this.clientSecret = process.env.GITHUB_CLIENT_SECRET || '';

    this.app = new App({
      appId: this.appId,
      privateKey: this.privateKey,
      oauth: {
        clientId: this.clientId,
        clientSecret: this.clientSecret,
      },
    });

    this.octokit = new RestOctokit({
      auth: `token ${process.env.GITHUB_TOKEN}`,
      throttle: {
        onRateLimit: (retryAfter: number, options: any) => {
          logger.warn(`Rate limit hit, retrying after ${retryAfter} seconds`);
          return true;
        },
        onAbuseLimit: (retryAfter: number, options: any) => {
          logger.error(`Abuse limit hit, retrying after ${retryAfter} seconds`);
          return true;
        },
      },
    });
  }

  /**
   * Get comprehensive GitHub data for birth chart analysis
   */
  async getEnhancedUserData(username: string): Promise<EnhancedGitHubData> {
    try {
      logger.info('Fetching enhanced GitHub data', { username });

      const cacheKey = `github:enhanced:${username}`;
      const cached = await redisClient.get(cacheKey);

      if (cached) {
        logger.info('Returning cached GitHub data', { username });
        return JSON.parse(cached);
      }

      // Parallel data fetching
      const [
        userData,
        repositories,
        contributions,
        commits,
        pullRequests,
        issues,
        actions,
        sponsors,
        collaborators
      ] = await Promise.all([
        this.getUserData(username),
        this.getRepositories(username),
        this.getContributions(username),
        this.getCommitHistory(username),
        this.getPullRequests(username),
        this.getIssues(username),
        this.getGitHubActionsData(username),
        this.getSponsorsData(username),
        this.getCollaborationData(username)
      ]);

      // Advanced analysis
      const commitPatterns = await this.analyzeCommitPatterns(commits);
      const technologyStack = await this.analyzeTechnologyStack(repositories, commits);
      const collaborationNetwork = await this.buildCollaborationNetwork(userData, collaborators);
      const careerMilestones = await this.identifyCareerMilestones(repositories, contributions);

      const enhancedData: EnhancedGitHubData = {
        userData,
        repositories,
        contributions,
        commits,
        pullRequests,
        issues,
        actions,
        sponsors,
        collaborations: collaborators,
        commitPatterns,
        technologyStack,
        collaborationNetwork,
        careerMilestones
      };

      // Cache for 1 hour
      await redisClient.setex(cacheKey, 3600, JSON.stringify(enhancedData));

      logger.info('Successfully fetched enhanced GitHub data', { username });
      return enhancedData;

    } catch (error) {
      logger.error('Failed to fetch enhanced GitHub data', { username, error });
      throw new Error(`Failed to fetch GitHub data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get user data with extended information
   */
  private async getUserData(username: string): Promise<any> {
    try {
      const userResponse = await this.octokit.rest.users.getByUsername({ username });
      const user = userResponse.data;

      // Get extended user information
      const [organizations, followers, following] = await Promise.all([
        this.octokit.rest.orgs.listForUser({ username }),
        this.octokit.rest.users.listFollowers({ username }),
        this.octokit.rest.users.listFollowing({ username })
      ]);

      return {
        ...user,
        organizations: organizations.data,
        followers: followers.data,
        following: following.data,
        followersCount: followers.data.length,
        followingCount: following.data.length
      };

    } catch (error) {
      logger.error('Failed to get user data', { username, error });
      throw error;
    }
  }

  /**
   * Get repositories with detailed analysis
   */
  private async getRepositories(username: string): Promise<any[]> {
    try {
      const reposResponse = await this.octokit.rest.repos.listForUser({
        username,
        type: 'all',
        sort: 'updated',
        direction: 'desc',
        per_page: 100
      });

      const repositories = reposResponse.data;

      // Get detailed information for each repository
      const detailedRepos = await Promise.all(
        repositories.map(async (repo) => {
          try {
            const [languages, contributors, releases, workflows] = await Promise.all([
              this.octokit.rest.repos.listLanguages({ owner: username, repo: repo.name }),
              this.octokit.rest.repos.listContributors({ owner: username, repo: repo.name }),
              this.octokit.rest.repos.listReleases({ owner: username, repo: repo.name }),
              this.getGitHubActionsWorkflows(username, repo.name)
            ]);

            return {
              ...repo,
              languages: languages.data,
              contributors: contributors.data,
              releases: releases.data,
              workflows,
              codeQuality: await this.analyzeCodeQuality(username, repo.name)
            };

          } catch (error) {
            logger.warn('Failed to get repository details', { username, repo: repo.name, error });
            return repo;
          }
        })
      );

      return detailedRepos;

    } catch (error) {
      logger.error('Failed to get repositories', { username, error });
      throw error;
    }
  }

  /**
   * Get contribution activity
   */
  private async getContributions(username: string): Promise<any[]> {
    try {
      const query = `
        query ($username: String!) {
          user(login: $username) {
            contributionsCollection {
              contributionCalendar {
                weeks {
                  contributionDays {
                    date
                    contributionCount
                    weekday
                    color
                  }
                }
              }
              totalRepositoriesWithContributedCommits
              totalCommitContributions
              totalIssueContributions
              totalPullRequestContributions
              totalPullRequestReviewContributions
            }
          }
        }
      `;

      const response = await this.octokit.graphql(query, { username });
      return response.user.contributionsCollection;

    } catch (error) {
      logger.error('Failed to get contributions', { username, error });
      throw error;
    }
  }

  /**
   * Get commit history with detailed analysis
   */
  private async getCommitHistory(username: string): Promise<any[]> {
    try {
      const repositories = await this.octokit.rest.repos.listForUser({ username });
      const commits: any[] = [];

      for (const repo of repositories.data.slice(0, 10)) { // Limit to 10 most recent repos
        try {
          const commitsResponse = await this.octokit.rest.repos.listCommits({
            owner: username,
            repo: repo.name,
            per_page: 100
          });

          const detailedCommits = commitsResponse.data.map(commit => ({
            ...commit,
            repository: repo.name,
            languages: repo.language,
            analysis: this.analyzeCommitMessage(commit.commit.message)
          }));

          commits.push(...detailedCommits);

        } catch (error) {
          logger.warn('Failed to get commits for repository', { username, repo: repo.name });
        }
      }

      return commits;

    } catch (error) {
      logger.error('Failed to get commit history', { username, error });
      throw error;
    }
  }

  /**
   * Get pull requests
   */
  private async getPullRequests(username: string): Promise<any[]> {
    try {
      const prsResponse = await this.octokit.rest.search.issuesAndPullRequests({
        q: `author:${username} type:pr`,
        sort: 'created',
        order: 'desc',
        per_page: 100
      });

      return prsResponse.data.items;

    } catch (error) {
      logger.error('Failed to get pull requests', { username, error });
      throw error;
    }
  }

  /**
   * Get issues
   */
  private async getIssues(username: string): Promise<any[]> {
    try {
      const issuesResponse = await this.octokit.rest.search.issuesAndPullRequests({
        q: `author:${username} type:issue`,
        sort: 'created',
        order: 'desc',
        per_page: 100
      });

      return issuesResponse.data.items;

    } catch (error) {
      logger.error('Failed to get issues', { username, error });
      throw error;
    }
  }

  /**
   * Get GitHub Actions data
   */
  private async getGitHubActionsData(username: string): Promise<any> {
    try {
      const repositories = await this.octokit.rest.repos.listForUser({ username });
      const workflowsData: any[] = [];

      for (const repo of repositories.data.slice(0, 10)) {
        try {
          const workflows = await this.getGitHubActionsWorkflows(username, repo.name);
          workflowsData.push({
            repository: repo.name,
            workflows
          });
        } catch (error) {
          logger.warn('Failed to get workflows', { username, repo: repo.name });
        }
      }

      return workflowsData;

    } catch (error) {
      logger.error('Failed to get GitHub Actions data', { username, error });
      throw error;
    }
  }

  /**
   * Get GitHub Actions workflows
   */
  private async getGitHubActionsWorkflows(owner: string, repo: string): Promise<any[]> {
    try {
      const workflowsResponse = await this.octokit.rest.actions.listRepoWorkflows({
        owner,
        repo
      });

      return workflowsResponse.data.workflows;

    } catch (error) {
      logger.error('Failed to get workflows', { owner, repo, error });
      return [];
    }
  }

  /**
   * Get sponsors data
   */
  private async getSponsorsData(username: string): Promise<any> {
    try {
      // Note: This requires GitHub Sponsors API access
      const sponsorsResponse = await this.octokit.request('GET /users/{username}/sponsors', {
        username,
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'X-GitHub-Api-Version': '2022-11-28'
        }
      });

      return sponsorsResponse.data;

    } catch (error) {
      logger.warn('Failed to get sponsors data (may not be available)', { username, error });
      return null;
    }
  }

  /**
   * Get collaboration data
   */
  private async getCollaborationData(username: string): Promise<any[]> {
    try {
      const collaborators: any[] = [];
      const repositories = await this.octokit.rest.repos.listForUser({ username });

      for (const repo of repositories.data.slice(0, 20)) {
        try {
          const collaboratorsResponse = await this.octokit.rest.repos.listCollaborators({
            owner: username,
            repo: repo.name
          });

          collaborators.push(...collaboratorsResponse.data.map(collaborator => ({
            ...collaborator,
            repository: repo.name
          })));

        } catch (error) {
          // Many repos won't have collaborators, so this is expected
          continue;
        }
      }

      return collaborators;

    } catch (error) {
      logger.error('Failed to get collaboration data', { username, error });
      throw error;
    }
  }

  /**
   * Analyze commit patterns
   */
  private async analyzeCommitPatterns(commits: any[]): Promise<CommitPattern[]> {
    try {
      const patterns: Record<string, CommitPattern> = {};

      commits.forEach(commit => {
        if (!commit.commit?.author?.date) return;

        const date = new Date(commit.commit.author.date);
        const dayOfWeek = date.getDay();
        const hourOfDay = date.getHours();
        const key = `${dayOfWeek}-${hourOfDay}`;

        if (!patterns[key]) {
          patterns[key] = {
            dayOfWeek,
            hourOfDay,
            frequency: 0,
            timezone: 'UTC',
            productivity: 0,
            messageSentiment: this.analyzeCommitMessage(commit.commit.message).sentiment
          };
        }

        patterns[key].frequency++;
      });

      // Calculate productivity scores
      const maxFrequency = Math.max(...Object.values(patterns).map(p => p.frequency));
      Object.values(patterns).forEach(pattern => {
        pattern.productivity = (pattern.frequency / maxFrequency) * 100;
      });

      return Object.values(patterns);

    } catch (error) {
      logger.error('Failed to analyze commit patterns', { error });
      return [];
    }
  }

  /**
   * Analyze technology stack
   */
  private async analyzeTechnologyStack(repositories: any[], commits: any[]): Promise<TechnologyStack> {
    try {
      const languages: Record<string, number> = {};
      const frameworks: Record<string, number> = {};
      const tools: Record<string, number> = {};
      const platforms: Record<string, number> = {};

      // Analyze repository languages
      repositories.forEach(repo => {
        if (repo.languages) {
          Object.entries(repo.languages).forEach(([lang, bytes]) => {
            languages[lang] = (languages[lang] || 0) + (bytes as number);
          });
        }

        if (repo.topics) {
          repo.topics.forEach((topic: string) => {
            // Categorize topics
            if (this.isFramework(topic)) {
              frameworks[topic] = (frameworks[topic] || 0) + 1;
            } else if (this.isTool(topic)) {
              tools[topic] = (tools[topic] || 0) + 1;
            } else if (this.isPlatform(topic)) {
              platforms[topic] = (platforms[topic] || 0) + 1;
            }
          });
        }
      });

      return {
        languages,
        frameworks,
        tools,
        platforms,
        evolution: [] // Would need historical data for this
      };

    } catch (error) {
      logger.error('Failed to analyze technology stack', { error });
      return {
        languages: {},
        frameworks: {},
        tools: {},
        platforms: {},
        evolution: []
      };
    }
  }

  /**
   * Build collaboration network
   */
  private async buildCollaborationNetwork(userData: any, collaborators: any[]): Promise<CollaborationNetwork> {
    try {
      const networkCollaborators: Collaborator[] = collaborators.map(collab => ({
        username: collab.login,
        name: collab.name || collab.login,
        collaborationScore: this.calculateCollaborationScore(collab),
        sharedRepositories: [collab.repository],
        interactionFrequency: 1,
        collaborationType: ['co-development']
      }));

      return {
        collaborators: networkCollaborators,
        organizations: userData.organizations || [],
        mentorship: [], // Would need more data for this
        influence: {
          followers: userData.followersCount || 0,
          following: userData.followingCount || 0,
          repositoryStars: userData.public_repos ? userData.public_repos * 10 : 0,
          contributionImpact: 0,
          communityEngagement: userData.followersCount ? Math.min((userData.followersCount / 100) * 10, 10) : 0
        }
      };

    } catch (error) {
      logger.error('Failed to build collaboration network', { error });
      return {
        collaborators: [],
        organizations: [],
        mentorship: [],
        influence: {
          followers: 0,
          following: 0,
          repositoryStars: 0,
          contributionImpact: 0,
          communityEngagement: 0
        }
      };
    }
  }

  /**
   * Identify career milestones
   */
  private async identifyCareerMilestones(repositories: any[], contributions: any): Promise<CareerMilestone[]> {
    try {
      const milestones: CareerMilestone[] = [];

      // First repository
      const sortedRepos = repositories.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      if (sortedRepos.length > 0) {
        milestones.push({
          date: sortedRepos[0].created_at,
          type: 'first_repository',
          description: 'Created first GitHub repository',
          impact: 'Started their open source journey',
          repositories: [sortedRepos[0].name],
          skills: []
        });
      }

      // First starred repository
      const starredRepo = repositories.find(repo => repo.stargazers_count > 0);
      if (starredRepo) {
        milestones.push({
          date: starredRepo.created_at,
          type: 'first_starred_project',
          description: `Created ${starredRepo.name} which gained ${starredRepo.stargazers_count} stars`,
          impact: 'Demonstrated ability to create valuable projects',
          repositories: [starredRepo.name],
          skills: []
        });
      }

      // Contribution milestones
      if (contributions.totalCommitContributions) {
        const milestoneDates = [
          { commits: 100, type: 'century_commits' },
          { commits: 500, type: 'major_contributor' },
          { commits: 1000, type: 'expert_contributor' }
        ];

        milestoneDates.forEach(milestone => {
          if (contributions.totalCommitContributions >= milestone.commits) {
            milestones.push({
              date: contributions.contributionCalendar?.weeks?.[0]?.contributionDays?.[0]?.date || new Date().toISOString(),
              type: milestone.type,
              description: `Reached ${milestone.commits} total commits`,
              impact: `Established as a significant contributor`,
              repositories: [],
              skills: []
            });
          }
        });
      }

      return milestones.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    } catch (error) {
      logger.error('Failed to identify career milestones', { error });
      return [];
    }
  }

  /**
   * Analyze code quality (placeholder)
   */
  private async analyzeCodeQuality(owner: string, repo: string): Promise<any> {
    try {
      // This would integrate with code quality analysis tools
      return {
        score: 0,
        metrics: {},
        issues: []
      };
    } catch (error) {
      return {
        score: 0,
        metrics: {},
        issues: []
      };
    }
  }

  /**
   * Analyze commit message
   */
  private analyzeCommitMessage(message: string): { sentiment: string; keywords: string[] } {
    const positiveWords = ['fix', 'add', 'update', 'improve', 'feature', 'enhance'];
    const negativeWords = ['bug', 'error', 'fix', 'issue', 'problem', 'broken'];

    const messageLower = message.toLowerCase();

    const positiveCount = positiveWords.filter(word => messageLower.includes(word)).length;
    const negativeCount = negativeWords.filter(word => messageLower.includes(word)).length;

    const keywords = messageLower.match(/(\w+)/g) || [];

    return {
      sentiment: positiveCount > negativeCount ? 'positive' : negativeCount > positiveCount ? 'negative' : 'neutral',
      keywords: keywords.slice(0, 5)
    };
  }

  /**
   * Calculate collaboration score
   */
  private calculateCollaborationScore(collaborator: any): number {
    let score = 0;

    if (collaborator.type === 'User') score += 50;
    if (collaborator.permissions?.push) score += 30;
    if (collaborator.permissions?.admin) score += 20;

    return score;
  }

  /**
   * Check if topic is a framework
   */
  private isFramework(topic: string): boolean {
    const frameworks = ['react', 'vue', 'angular', 'django', 'rails', 'express', 'laravel', 'spring', 'flutter'];
    return frameworks.includes(topic.toLowerCase());
  }

  /**
   * Check if topic is a tool
   */
  private isTool(topic: string): boolean {
    const tools = ['docker', 'kubernetes', 'aws', 'azure', 'git', 'jenkins', 'terraform', 'webpack', 'babel'];
    return tools.includes(topic.toLowerCase());
  }

  /**
   * Check if topic is a platform
   */
  private isPlatform(topic: string): boolean {
    const platforms = ['ios', 'android', 'web', 'mobile', 'desktop', 'server', 'cloud', 'blockchain'];
    return platforms.includes(topic.toLowerCase());
  }

  /**
   * Handle GitHub webhooks
   */
  async handleWebhook(event: GitHubWebhookEvent): Promise<void> {
    try {
      logger.info('Processing GitHub webhook', { type: event.type, action: event.action });

      switch (event.type) {
        case 'push':
          await this.handlePushWebhook(event);
          break;
        case 'pull_request':
          await this.handlePullRequestWebhook(event);
          break;
        case 'issues':
          await this.handleIssuesWebhook(event);
          break;
        case 'release':
          await this.handleReleaseWebhook(event);
          break;
        default:
          logger.info('Unhandled webhook type', { type: event.type });
      }

    } catch (error) {
      logger.error('Failed to handle webhook', { event, error });
      throw error;
    }
  }

  /**
   * Handle push webhooks
   */
  private async handlePushWebhook(event: GitHubWebhookEvent): Promise<void> {
    // Update user's activity data
    const username = event.sender.login;
    await this.invalidateUserCache(username);

    // Trigger real-time updates if needed
    await this.sendRealtimeUpdate(username, 'push', event);
  }

  /**
   * Handle pull request webhooks
   */
  private async handlePullRequestWebhook(event: GitHubWebhookEvent): Promise<void> {
    const username = event.sender.login;
    await this.invalidateUserCache(username);
    await this.sendRealtimeUpdate(username, 'pull_request', event);
  }

  /**
   * Handle issues webhooks
   */
  private async handleIssuesWebhook(event: GitHubWebhookEvent): Promise<void> {
    const username = event.sender.login;
    await this.invalidateUserCache(username);
    await this.sendRealtimeUpdate(username, 'issues', event);
  }

  /**
   * Handle release webhooks
   */
  private async handleReleaseWebhook(event: GitHubWebhookEvent): Promise<void> {
    const username = event.sender.login;
    await this.invalidateUserCache(username);
    await this.sendRealtimeUpdate(username, 'release', event);
  }

  /**
   * Invalidate user cache
   */
  private async invalidateUserCache(username: string): Promise<void> {
    try {
      const cacheKey = `github:enhanced:${username}`;
      await redisClient.del(cacheKey);
    } catch (error) {
      logger.error('Failed to invalidate user cache', { username, error });
    }
  }

  /**
   * Send real-time updates
   */
  private async sendRealtimeUpdate(username: string, eventType: string, data: any): Promise<void> {
    try {
      const update = {
        username,
        eventType,
        data,
        timestamp: new Date().toISOString()
      };

      await redisClient.publish('github-updates', JSON.stringify(update));
    } catch (error) {
      logger.error('Failed to send real-time update', { username, eventType, error });
    }
  }

  /**
   * Create GitHub App installation URL
   */
  createInstallationUrl(redirectUri?: string): string {
    const params = new URLSearchParams({
      client_id: this.clientId,
      scope: 'repo,read:org,read:user,admin:repo_hook'
    });

    if (redirectUri) {
      params.append('redirect_uri', redirectUri);
    }

    return `https://github.com/login/oauth/authorize?${params.toString()}`;
  }

  /**
   * Exchange code for access token
   */
  async exchangeCodeForToken(code: string): Promise<any> {
    try {
      const response = await this.octokit.rest.oauth.createDeviceCode({
        client_id: this.clientId,
        scope: 'repo'
      });

      return response.data;

    } catch (error) {
      logger.error('Failed to exchange code for token', { error });
      throw error;
    }
  }
}

export const enhancedGitHubClient = new EnhancedGitHubClient();