import { Octokit } from '@octokit/rest';
import { GraphQLClient } from '@octokit/graphql';
import { config } from '../../config/env';
import { GitHubAnalysisResult, DeveloperChart } from '../types';

class GitHubAnalysisService {
  private octokit: Octokit;
  private graphql: GraphQLClient;

  constructor() {
    this.octokit = new Octokit({
      auth: config.githubToken,
    });

    this.graphql = new GraphQLClient('https://api.github.com/graphql', {
      headers: {
        authorization: `token ${config.githubToken}`,
      },
    });
  }

  // Analyze a developer's GitHub profile
  async analyzeDeveloper(username: string): Promise<GitHubAnalysisResult> {
    try {
      // Get basic user info
      const { data: user } = await this.octokit.users.getForUser({ username });

      // Get repositories
      const repositories = await this.getUserRepositories(username);

      // Get contribution activity
      const contributions = await this.getContributions(username);

      // Get language distribution
      const languages = this.calculateLanguages(repositories);

      // Get collaboration patterns
      const collaborationPatterns = await this.getCollaborationPatterns(username);

      return {
        user: {
          login: user.login,
          created_at: user.created_at,
          public_repos: user.public_repos,
          followers: user.followers,
          following: user.following,
        },
        repositories,
        contributions,
        languages,
        collaboration_patterns: collaborationPatterns,
      };
    } catch (error) {
      throw new Error(`Failed to analyze GitHub user ${username}: ${error.message}`);
    }
  }

  // Get user's repositories
  private async getUserRepositories(username: string) {
    const repos = [];
    let page = 1;
    const perPage = 100;

    try {
      while (true) {
        const { data: pageRepos } = await this.octokit.repos.listForUser({
          username,
          type: 'owner',
          per_page: perPage,
          page,
          sort: 'updated',
          direction: 'desc',
        });

        if (pageRepos.length === 0) break;

        repos.push(...pageRepos.map(repo => ({
          name: repo.name,
          language: repo.language,
          stargazers_count: repo.stargazers_count,
          forks_count: repo.forks_count,
          created_at: repo.created_at,
          updated_at: repo.updated_at,
        })));

        if (pageRepos.length < perPage) break;
        page++;
      }
    } catch (error) {
      console.warn(`Error fetching repositories for ${username}:`, error.message);
    }

    return repos;
  }

  // Get user's contribution data
  private async getContributions(username: string) {
    try {
      // GraphQL query for contribution data
      const query = `
        query($username: String!) {
          user(login: $username) {
            contributionsCollection {
              totalCommitContributions
              restrictedContributionsCount
              contributionCalendar {
                weeks {
                  contributionDays {
                    date
                    contributionCount
                  }
                }
              }
            }
          }
        }
      `;

      const data = await this.graphql(query, { username });

      const contributions = data.user.contributionsCollection;
      const dailyContributions = [];

      // Flatten the calendar data
      for (const week of contributions.contributionCalendar.weeks) {
        for (const day of week.contributionDays) {
          dailyContributions.push({
            date: day.date,
            count: day.contributionCount,
          });
        }
      }

      return {
        total: contributions.totalCommitContributions,
        daily_contributions: dailyContributions,
      };
    } catch (error) {
      console.warn(`Error fetching contributions for ${username}:`, error.message);
      return {
        total: 0,
        daily_contributions: [],
      };
    }
  }

  // Calculate language distribution
  private calculateLanguages(repositories: any[]): Record<string, number> {
    const languages: Record<string, number> = {};

    repositories.forEach(repo => {
      if (repo.language) {
        languages[repo.language] = (languages[repo.language] || 0) + 1;
      }
    });

    return languages;
  }

  // Get collaboration patterns (simplified version)
  private async getCollaborationPatterns(username: string) {
    try {
      // Get recent pull requests
      const { data: pullRequests } = await this.octokit.search.issuesAndPullRequests({
        q: `author:${username} type:pr created:>=2023-01-01`,
        per_page: 100,
      });

      // Get issues they've created
      const { data: issues } = await this.octokit.search.issuesAndPullRequests({
        q: `author:${username} type:issue created:>=2023-01-01`,
        per_page: 100,
      });

      return {
        pull_requests_created: pullRequests.total_count,
        pull_requests_reviewed: 0, // Would need additional API calls
        issues_opened: issues.total_count,
        issues_closed: 0, // Would need additional API calls
      };
    } catch (error) {
      console.warn(`Error fetching collaboration patterns for ${username}:`, error.message);
      return {
        pull_requests_created: 0,
        pull_requests_reviewed: 0,
        issues_opened: 0,
        issues_closed: 0,
      };
    }
  }

  // Generate birth chart based on analysis
  async generateBirthChart(analysis: GitHubAnalysisResult): Promise<DeveloperChart> {
    const chartData = this.analyzePersonality(analysis);
    const metrics = this.calculateMetrics(analysis);

    return {
      id: '', // Will be set by database
      user_id: '', // Will be set by caller
      github_username: analysis.user.login,
      birth_date: new Date(analysis.user.created_at),
      chart_data: chartData,
      metrics: metrics,
      generated_at: new Date(),
      is_premium: false, // Will be updated based on subscription
    };
  }

  // Analyze personality based on GitHub data
  private analyzePersonality(analysis: GitHubAnalysisResult) {
    const { user, repositories, contributions, languages, collaboration_patterns } = analysis;

    // Primary language determines "Coding Sign"
    const codingSign = this.determineCodingSign(languages, repositories);

    // Most starred project determines "Tech Ascendant"
    const techAscendant = this.determineTechAscendant(repositories);

    // Collaboration patterns determine "Collaboration Moon"
    const collaborationMoon = this.determineCollaborationStyle(collaboration_patterns);

    // Problem-solving approach determines "Innovation Mars"
    const innovationMars = this.determineInnovationStyle(repositories, contributions);

    // Documentation and comments determine "Communication Mercury"
    const communicationMercury = this.determineCommunicationStyle(repositories);

    // Learning patterns determine "Learning Jupiter"
    const learningJupiter = this.determineLearningStyle(repositories, languages);

    // Code quality patterns determine "Stability Saturn"
    const stabilitySaturn = this.determineStabilityStyle(repositories, contributions);

    return {
      coding_sign: codingSign,
      tech_ascendant: techAscendant,
      collaboration_moon: collaborationMoon,
      innovation_mars: innovationMars,
      communication_mercury: communicationMercury,
      learning_jupiter: learningJupiter,
      stability_saturn: stabilitySaturn,
    };
  }

  // Helper methods for personality analysis
  private determineCodingSign(languages: Record<string, number>, repositories: any[]): string {
    const dominantLanguage = Object.entries(languages)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'Unknown';

    const languageArchetypes: Record<string, string> = {
      'JavaScript': 'The Innovator',
      'TypeScript': 'The Architect',
      'Python': 'The Philosopher',
      'Java': 'The Engineer',
      'C++': 'The Master Builder',
      'Ruby': 'The Artist',
      'Go': 'The Pragmatist',
      'Rust': 'The Perfectionist',
      'Swift': 'The Designer',
      'Kotlin': 'The Modernist',
      'C#': 'The Enterprise Builder',
      'PHP': 'The Pragmatist',
      'Shell': 'The System Wizard',
    };

    return languageArchetypes[dominantLanguage] || 'The Explorer';
  }

  private determineTechAscendant(repositories: any[]): string {
    const mostStarred = repositories
      .sort((a, b) => b.stargazers_count - a.stargazers_count)[0];

    if (!mostStarred) return 'Undefined';

    // Analyze repository characteristics
    const hasTests = mostStarred.name.toLowerCase().includes('test') ||
                    mostStarred.name.toLowerCase().includes('spec');
    const isFramework = mostStarred.name.toLowerCase().includes('framework') ||
                       mostStarred.name.toLowerCase().includes('lib');
    const isTool = mostStarred.name.toLowerCase().includes('tool') ||
                  mostStarred.name.toLowerCase().includes('cli');

    if (isFramework) return 'The Framework Builder';
    if (isTool) return 'The Tool Maker';
    if (hasTests) return 'The Quality Guardian';
    if (mostStarred.stargazers_count > 1000) return 'The Community Leader';
    if (mostStarred.forks_count > 500) return 'The Collaborator';

    return 'The Specialist';
  }

  private determineCollaborationStyle(collaboration: any): string {
    const { pull_requests_created, pull_requests_reviewed, issues_opened } = collaboration;
    const total = pull_requests_created + pull_requests_reviewed + issues_opened;

    if (total === 0) return 'The Lone Wolf';

    if (pull_requests_created > issues_opened) {
      return pull_requests_created > 50 ? 'The Integrator' : 'The Contributor';
    } else {
      return issues_opened > 50 ? 'The Voice' : 'The Participant';
    }
  }

  private determineInnovationStyle(repositories: any[], contributions: any): string {
    const repoCount = repositories.length;
    const avgCommits = contributions.total / Math.max(repoCount, 1);

    if (repoCount > 50) return 'The Experimenter';
    if (avgCommits > 100) return 'The Deep Diver';
    if (repoCount > 20 && avgCommits > 50) return 'The Productive Innovator';
    if (contributions.daily_contributions.some(d => d.count > 10)) return 'The Burst Creator';

    return 'The Steady Builder';
  }

  private determineCommunicationStyle(repositories: any[]): string {
    // This is a simplified version - in reality, you'd analyze README files, comments, etc.
    const hasReadmeCount = repositories.filter(repo =>
      repo.name.toLowerCase().includes('readme') ||
      repo.description?.length > 50
    ).length;

    const communicationRatio = hasReadmeCount / repositories.length;

    if (communicationRatio > 0.8) return 'The Documentarian';
    if (communicationRatio > 0.5) return 'The Communicator';
    if (communicationRatio > 0.3) return 'The Explainer';

    return 'The Code Whisperer';
  }

  private determineLearningStyle(repositories: any[], languages: Record<string, number>): string {
    const languageCount = Object.keys(languages).length;
    const techDiversity = languageCount / Math.max(repositories.length, 1);

    if (languageCount > 10) return 'The Polyglot';
    if (languageCount > 5) return 'The Explorer';
    if (techDiversity > 0.5) return 'The Adapter';
    if (languageCount === 1) return 'The Specialist';

    return 'The Pragmatist';
  }

  private determineStabilityStyle(repositories: any[], contributions: any): string {
    // Analyze contribution consistency
    const dailyData = contributions.daily_contributions;
    const activeDays = dailyData.filter(d => d.count > 0).length;
    const consistency = activeDays / Math.max(dailyData.length, 1);

    if (consistency > 0.8) return 'The Reliable';
    if (consistency > 0.6) return 'The Consistent';
    if (consistency > 0.4) return 'The Regular';
    if (dailyData.some(d => d.count > 20)) return 'The Marathoner';

    return 'The Sprinter';
  }

  // Calculate metrics for the chart
  private calculateMetrics(analysis: GitHubAnalysisResult) {
    const { user, repositories, contributions, languages, collaboration_patterns } = analysis;

    return {
      total_contributions: contributions.total,
      repositories_count: user.public_repos,
      languages_used: Object.keys(languages),
      commit_frequency: this.calculateCommitFrequency(contributions.daily_contributions),
      collaboration_score: this.calculateCollaborationScore(collaboration_patterns),
      innovation_score: this.calculateInnovationScore(repositories, contributions),
      learning_velocity: this.calculateLearningVelocity(repositories, languages),
    };
  }

  private calculateCommitFrequency(dailyContributions: any[]): number {
    const activeDays = dailyContributions.filter(d => d.count > 0).length;
    return activeDays / Math.max(dailyContributions.length, 1) * 100;
  }

  private calculateCollaborationScore(collaboration: any): number {
    const { pull_requests_created, issues_opened } = collaboration;
    const total = pull_requests_created + issues_opened;
    return Math.min(total / 10, 100); // Cap at 100
  }

  private calculateInnovationScore(repositories: any[], contributions: any): number {
    const repoDiversity = Math.min(repositories.length / 50, 1);
    const contributionConsistency = this.calculateCommitFrequency(contributions.daily_contributions) / 100;
    return Math.round((repoDiversity + contributionConsistency) / 2 * 100);
  }

  private calculateLearningVelocity(repositories: any[], languages: Record<string, number>): number {
    const languageCount = Object.keys(languages).length;
    const repoGrowth = repositories.length / Math.max(user.public_repos, 1);
    return Math.min((languageCount + repoGrowth * 10) / 20 * 100, 100);
  }

  // Team constellation analysis
  async analyzeTeamConstellation(usernames: string[]): Promise<any> {
    const analyses = await Promise.all(
      usernames.map(username => this.analyzeDeveloper(username))
    );

    return {
      harmony_score: this.calculateTeamHarmony(analyses),
      complementary_skills: this.findComplementarySkills(analyses),
      potential_conflicts: this.identifyPotentialConflicts(analyses),
      team_archetype: this.determineTeamArchetype(analyses),
      recommended_structure: this.recommendTeamStructure(analyses),
    };
  }

  private calculateTeamHarmony(analyses: GitHubAnalysisResult[]): number {
    // Calculate harmony based on complementary skills and overlapping languages
    const languages = analyses.map(a => Object.keys(a.languages)).flat();
    const uniqueLanguages = new Set(languages);
    const languageOverlap = (languages.length - uniqueLanguages.size) / languages.length;

    return Math.round((1 - languageOverlap) * 100); // Higher score for diverse skills
  }

  private findComplementarySkills(analyses: GitHubAnalysisResult[]): string[] {
    const skills = new Set<string>();

    analyses.forEach(analysis => {
      if (analysis.collaboration_patterns.pull_requests_created > 10) {
        skills.add('Integration Expert');
      }
      if (Object.keys(analysis.languages).length > 5) {
        skills.add('Polyglot Developer');
      }
      if (analysis.contributions.total > 1000) {
        skills.add('High-Output Developer');
      }
    });

    return Array.from(skills);
  }

  private identifyPotentialConflicts(analyses: GitHubAnalysisResult[]): string[] {
    const conflicts = [];

    // Check for too many specialists in the same language
    const languages = analyses.map(a => this.determineCodingSign(a.languages, a.repositories));
    const languageCount = languages.reduce((acc, lang) => {
      acc[lang] = (acc[lang] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    Object.entries(languageCount).forEach(([lang, count]) => {
      if (count > 2) {
        conflicts.push(`Multiple ${lang} specialists may lead to tunnel vision`);
      }
    });

    return conflicts;
  }

  private determineTeamArchetype(analyses: GitHubAnalysisResult[]): string {
    const totalRepos = analyses.reduce((sum, a) => sum + a.user.public_repos, 0);
    const avgContributions = analyses.reduce((sum, a) => sum + a.contributions.total, 0) / analyses.length;

    if (avgContributions > 1000) return 'The Powerhouse';
    if (totalRepos > 100) return 'The Prolific Team';
    if (analyses.every(a => Object.keys(a.languages).length > 3)) return 'The Polyglot Collective';
    if (analyses.every(a => a.collaboration_patterns.pull_requests_created > 20)) return 'The Integration Masters';

    return 'The Balanced Team';
  }

  private recommendTeamStructure(analyses: GitHubAnalysisResult[]): string[] {
    const structure = [];

    const hasArchitect = analyses.some(a =>
      this.determineTechAscendant(a.repositories) === 'The Architect'
    );
    const hasSpecialist = analyses.some(a => Object.keys(a.languages).length <= 2);

    if (!hasArchitect) structure.push('Consider adding a systems architect');
    if (!hasSpecialist) structure.push('Consider adding a domain specialist');
    if (analyses.length < 3) structure.push('Consider expanding team for better coverage');

    return structure;
  }
}

export const githubService = new GitHubAnalysisService();