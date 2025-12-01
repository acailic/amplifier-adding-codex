import { githubService } from '../../api/lib/github';
import { GitHubAnalysisResult } from '../../api/types';

// Mock the Octokit and GraphQLClient
jest.mock('@octokit/rest', () => ({
  Octokit: jest.fn().mockImplementation(() => ({
    users: {
      getForUser: jest.fn(),
    },
    repos: {
      listForUser: jest.fn(),
    },
    search: {
      issuesAndPullRequests: jest.fn(),
    },
  })),
}));

jest.mock('@octokit/graphql', () => ({
  GraphQLClient: jest.fn().mockImplementation(() => ({
    request: jest.fn(),
  })),
}));

describe('GitHubAnalysisService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('analyzeDeveloper', () => {
    it('should successfully analyze a developer profile', async () => {
      // Mock data
      const mockUser = {
        login: 'testuser',
        created_at: '2020-01-01T00:00:00Z',
        public_repos: 10,
        followers: 50,
        following: 25,
      };

      const mockRepos = [
        {
          name: 'awesome-project',
          language: 'TypeScript',
          stargazers_count: 100,
          forks_count: 20,
          created_at: '2021-01-01T00:00:00Z',
          updated_at: '2023-01-01T00:00:00Z',
        },
      ];

      const mockContributions = {
        totalCommitContributions: 500,
        contributionCalendar: {
          weeks: [
            {
              contributionDays: [
                { date: '2023-01-01', contributionCount: 5 },
                { date: '2023-01-02', contributionCount: 3 },
              ],
            },
          ],
        },
      };

      // Mock the API calls
      const { Octokit } = require('@octokit/rest');
      const { GraphQLClient } = require('@octokit/graphql');

      const mockOctokit = new Octokit();
      const mockGraphQL = new GraphQLClient();

      mockOctokit.users.getForUser.mockResolvedValue({ data: mockUser });
      mockOctokit.repos.listForUser.mockResolvedValue({ data: mockRepos });
      mockOctokit.search.issuesAndPullRequests.mockResolvedValue({
        data: { total_count: 10 },
      });
      mockGraphQL.request.mockResolvedValue({
        user: {
          contributionsCollection: mockContributions,
        },
      });

      const result = await githubService.analyzeDeveloper('testuser');

      expect(result).toBeDefined();
      expect(result.user.login).toBe('testuser');
      expect(result.repositories).toHaveLength(1);
      expect(result.contributions.total).toBe(500);
      expect(result.languages).toEqual({ TypeScript: 1 });
      expect(result.collaboration_patterns).toBeDefined();
    });

    it('should handle API errors gracefully', async () => {
      const { Octokit } = require('@octokit/rest');
      const mockOctokit = new Octokit();

      mockOctokit.users.getForUser.mockRejectedValue(new Error('API Error'));

      await expect(githubService.analyzeDeveloper('nonexistent')).rejects.toThrow(
        'Failed to analyze GitHub user nonexistent'
      );
    });
  });

  describe('generateBirthChart', () => {
    it('should generate a birth chart from GitHub analysis', async () => {
      const mockAnalysis: GitHubAnalysisResult = {
        user: {
          login: 'testuser',
          created_at: '2020-01-01T00:00:00Z',
          public_repos: 5,
          followers: 10,
          following: 5,
        },
        repositories: [
          {
            name: 'js-project',
            language: 'JavaScript',
            stargazers_count: 50,
            forks_count: 10,
            created_at: '2021-01-01T00:00:00Z',
            updated_at: '2023-01-01T00:00:00Z',
          },
        ],
        contributions: {
          total: 100,
          daily_contributions: [
            { date: '2023-01-01', count: 2 },
            { date: '2023-01-02', count: 3 },
          ],
        },
        languages: { JavaScript: 1 },
        collaboration_patterns: {
          pull_requests_created: 10,
          pull_requests_reviewed: 5,
          issues_opened: 8,
          issues_closed: 6,
        },
      };

      const chart = await githubService.generateBirthChart(mockAnalysis);

      expect(chart).toBeDefined();
      expect(chart.github_username).toBe('testuser');
      expect(chart.birth_date).toEqual(new Date('2020-01-01T00:00:00Z'));
      expect(chart.chart_data).toBeDefined();
      expect(chart.chart_data.coding_sign).toBeDefined();
      expect(chart.chart_data.tech_ascendant).toBeDefined();
      expect(chart.metrics).toBeDefined();
      expect(chart.metrics.total_contributions).toBe(100);
      expect(chart.metrics.repositories_count).toBe(5);
    });
  });

  describe('analyzeTeamConstellation', () => {
    it('should analyze team constellation for multiple developers', async () => {
      // Mock the analyzeDeveloper method
      jest.spyOn(githubService, 'analyzeDeveloper').mockResolvedValue({
        user: {
          login: 'dev1',
          created_at: '2020-01-01T00:00:00Z',
          public_repos: 10,
          followers: 50,
          following: 25,
        },
        repositories: [],
        contributions: { total: 100, daily_contributions: [] },
        languages: { TypeScript: 1 },
        collaboration_patterns: {
          pull_requests_created: 10,
          pull_requests_reviewed: 5,
          issues_opened: 8,
          issues_closed: 6,
        },
      });

      const usernames = ['dev1', 'dev2'];
      const result = await githubService.analyzeTeamConstellation(usernames);

      expect(result).toBeDefined();
      expect(result.harmony_score).toBeDefined();
      expect(result.complementary_skills).toBeDefined();
      expect(result.potential_conflicts).toBeDefined();
      expect(result.team_archetype).toBeDefined();
      expect(result.recommended_structure).toBeDefined();
      expect(typeof result.harmony_score).toBe('number');
      expect(Array.isArray(result.complementary_skills)).toBe(true);
    });
  });
});