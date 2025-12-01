/**
 * Discord Bot Integration for Developer Birth Chart
 * Handles team analysis, community engagement, and interactive features
 */

import {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  SlashCommandBuilder,
  REST,
  Routes,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ModalSubmitInteraction,
  ChatInputCommandInteraction
} from 'discord.js';
import { DiscordConfig, TeamAnalysisRequest, TeamAnalysisResponse, DeveloperBirthChart } from '../../types';
import { logger } from '../monitoring/logger';
import { redisClient } from '../database/redis';

export interface DiscordTeamMember {
  userId: string;
  username: string;
  githubUsername?: string;
  role: string;
  chart?: DeveloperBirthChart;
}

export class DiscordBot {
  private client: Client;
  private config: DiscordConfig;
  private rest: REST;
  private commands: any[];

  constructor(config: DiscordConfig) {
    this.config = config;
    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
      ],
    });
    this.rest = new REST({ version: '10' }).setToken(config.botToken);
    this.commands = this.initializeCommands();
    this.setupEventHandlers();
  }

  /**
   * Initialize bot commands
   */
  private initializeCommands(): any[] {
    return [
      // Birth Chart command
      new SlashCommandBuilder()
        .setName('birthchart')
        .setDescription('Generate your Developer Birth Chart')
        .addStringOption(option =>
          option.setName('username')
            .setDescription('GitHub username')
            .setRequired(true)
        ),

      // Team analysis command
      new SlashCommandBuilder()
        .setName('team-analysis')
        .setDescription('Analyze your team\'s compatibility and dynamics')
        .addStringOption(option =>
          option.setName('usernames')
            .setDescription('Comma-separated GitHub usernames')
            .setRequired(true)
        )
        .addStringOption(option =>
          option.setName('depth')
            .setDescription('Analysis depth: basic, detailed, or comprehensive')
            .addChoices(
              { name: 'Basic', value: 'basic' },
              { name: 'Detailed', value: 'detailed' },
              { name: 'Comprehensive', value: 'comprehensive' }
            )
            .setRequired(false)
        ),

      // Compatibility check command
      new SlashCommandBuilder()
        .setName('compatibility')
        .setDescription('Check compatibility between developers')
        .addStringOption(option =>
          option.setName('user1')
            .setDescription('First GitHub username')
            .setRequired(true)
        )
        .addStringOption(option =>
          option.setName('user2')
            .setDescription('Second GitHub username')
            .setRequired(true)
        ),

      // Team builder command
      new SlashCommandBuilder()
        .setName('team-builder')
        .setDescription('Build an optimal team based on roles')
        .addStringOption(option =>
          option.setName('roles')
            .setDescription('Required roles (comma-separated)')
            .setRequired(true)
        )
        .addStringOption(option =>
          option.setName('usernames')
            .setDescription('Available developers (comma-separated GitHub usernames)')
            .setRequired(true)
        ),

      // Insights command
      new SlashCommandBuilder()
        .setName('insights')
        .setDescription('Get career and skill insights')
        .addStringOption(option =>
          option.setName('username')
            .setDescription('GitHub username')
            .setRequired(true)
        ),
    ].map(command => command.toJSON());
  }

  /**
   * Setup event handlers
   */
  private setupEventHandlers(): void {
    this.client.once('ready', () => {
      logger.info(`Discord bot logged in as ${this.client.user?.tag}`);
      this.registerCommands();
    });

    this.client.on('interactionCreate', async (interaction) => {
      try {
        if (interaction.isChatInputCommand()) {
          await this.handleSlashCommand(interaction);
        } else if (interaction.isButton()) {
          await this.handleButtonInteraction(interaction);
        } else if (interaction.isModalSubmit()) {
          await this.handleModalSubmit(interaction);
        }
      } catch (error) {
        logger.error('Error handling interaction', { error, interactionId: interaction.id });
        await interaction.reply({
          content: '❌ An error occurred while processing your request.',
          ephemeral: true
        });
      }
    });

    this.client.on('error', (error) => {
      logger.error('Discord client error', { error });
    });
  }

  /**
   * Register commands with Discord
   */
  private async registerCommands(): Promise<void> {
    try {
      await this.rest.put(
        Routes.applicationGuildCommands(this.config.clientId, this.config.guildId),
        { body: this.commands }
      );
      logger.info('Successfully registered Discord commands');
    } catch (error) {
      logger.error('Failed to register Discord commands', { error });
    }
  }

  /**
   * Start the bot
   */
  async start(): Promise<void> {
    try {
      await this.client.login(this.config.botToken);
    } catch (error) {
      logger.error('Failed to start Discord bot', { error });
      throw error;
    }
  }

  /**
   * Handle slash commands
   */
  private async handleSlashCommand(interaction: ChatInputCommandInteraction): Promise<void> {
    const { commandName } = interaction;

    switch (commandName) {
      case 'birthchart':
        await this.handleBirthChartCommand(interaction);
        break;
      case 'team-analysis':
        await this.handleTeamAnalysisCommand(interaction);
        break;
      case 'compatibility':
        await this.handleCompatibilityCommand(interaction);
        break;
      case 'team-builder':
        await this.handleTeamBuilderCommand(interaction);
        break;
      case 'insights':
        await this.handleInsightsCommand(interaction);
        break;
    }
  }

  /**
   * Handle birthchart command
   */
  private async handleBirthChartCommand(interaction: ChatInputCommandInteraction): Promise<void> {
    const username = interaction.options.getString('username');

    if (!username) {
      await interaction.reply({
        content: '❌ Please provide a GitHub username.',
        ephemeral: true
      });
      return;
    }

    await interaction.deferReply();

    try {
      // Call the birth chart API
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/chart/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate birth chart');
      }

      const chart: DeveloperBirthChart = await response.json();

      const embed = new EmbedBuilder()
        .setTitle(`🔮 Developer Birth Chart: @${username}`)
        .setColor(0x00AE86)
        .setThumbnail(chart.githubUsername ? `https://github.com/${chart.githubUsername}.png` : undefined)
        .addFields(
          {
            name: '🌟 Zodiac Sign',
            value: chart.personality.zodiacSign,
            inline: true
          },
          {
            name: '🧠 Personality Type',
            value: chart.personality.personalityType,
            inline: true
          },
          {
            name: '🎯 Career Path',
            value: chart.career.careerPath,
            inline: true
          },
          {
            name: '💻 Top Languages',
            value: chart.skills.languages.slice(0, 3).map(l => l.language).join(', '),
            inline: true
          },
          {
            name: '⭐ Key Traits',
            value: chart.personality.traits.slice(0, 3).join(', '),
            inline: true
          },
          {
            name: '🤝 Collaboration Style',
            value: chart.social.collaboration.style,
            inline: true
          }
        )
        .setDescription('Your Developer Birth Chart reveals unique insights into your coding personality and career potential!')
        .setTimestamp()
        .setFooter({ text: 'Generated by Developer Birth Chart Bot' });

      const row = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
          new ButtonBuilder()
            .setCustomId(`share_twitter_${chart.id}`)
            .setLabel('Share on Twitter')
            .setStyle(ButtonStyle.Secondary)
            .setEmoji('🐦'),
          new ButtonBuilder()
            .setCustomId(`share_linkedin_${chart.id}`)
            .setLabel('Share on LinkedIn')
            .setStyle(ButtonStyle.Secondary)
            .setEmoji('💼'),
          new ButtonBuilder()
            .setCustomId(`view_details_${chart.id}`)
            .setLabel('View Details')
            .setStyle(ButtonStyle.Primary)
            .setEmoji('📊')
        );

      await interaction.editReply({ embeds: [embed], components: [row] });

    } catch (error) {
      logger.error('Error generating birth chart', { username, error });
      await interaction.editReply({
        content: `❌ Failed to generate birth chart for @${username}. Please try again later.`
      });
    }
  }

  /**
   * Handle team analysis command
   */
  private async handleTeamAnalysisCommand(interaction: ChatInputCommandInteraction): Promise<void> {
    const usernames = interaction.options.getString('usernames');
    const depth = interaction.options.getString('depth') || 'basic';

    if (!usernames) {
      await interaction.reply({
        content: '❌ Please provide GitHub usernames.',
        ephemeral: true
      });
      return;
    }

    await interaction.deferReply();

    try {
      const usernameList = usernames.split(',').map(u => u.trim());
      const request: TeamAnalysisRequest = {
        usernames: usernameList,
        depth: depth as 'basic' | 'detailed' | 'comprehensive'
      };

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/team/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze team');
      }

      const analysis: TeamAnalysisResponse = await response.json();

      const embed = new EmbedBuilder()
        .setTitle('👥 Team Analysis Results')
        .setColor(0x7289DA)
        .addFields(
          {
            name: '🔗 Team Synergy',
            value: `Overall: ${analysis.synergy.overall}%\nTechnical: ${analysis.synergy.technical}%\nCommunication: ${analysis.synergy.communication}%`,
            inline: true
          },
          {
            name: '🏢 Team Dynamics',
            value: `Communication: ${analysis.dynamics.communicationStyle}\nDecision Making: ${analysis.dynamics.decisionMaking}`,
            inline: true
          }
        )
        .setDescription(`Analysis of ${analysis.members.length} team members`)
        .setTimestamp();

      // Add member details
      analysis.members.forEach((member, index) => {
        embed.addFields({
          name: `${index + 1}. ${member.username}`,
          value: `Role: ${member.role}\nPersonality: ${member.personality.personalityType}\nStyle: ${member.collaboration.style}`,
          inline: true
        });
      });

      const row = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
          new ButtonBuilder()
            .setCustomId(`team_recommendations_${analysis.teamId}`)
            .setLabel('View Recommendations')
            .setStyle(ButtonStyle.Primary),
          new ButtonBuilder()
            .setCustomId(`export_report_${analysis.teamId}`)
            .setLabel('Export Report')
            .setStyle(ButtonStyle.Secondary)
        );

      await interaction.editReply({ embeds: [embed], components: [row] });

    } catch (error) {
      logger.error('Error analyzing team', { usernames, error });
      await interaction.editReply({
        content: '❌ Failed to analyze team. Please try again later.'
      });
    }
  }

  /**
   * Handle compatibility check command
   */
  private async handleCompatibilityCommand(interaction: ChatInputCommandInteraction): Promise<void> {
    const user1 = interaction.options.getString('user1');
    const user2 = interaction.options.getString('user2');

    if (!user1 || !user2) {
      await interaction.reply({
        content: '❌ Please provide both usernames.',
        ephemeral: true
      });
      return;
    }

    await interaction.deferReply();

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/compatibility/check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user1, user2 }),
      });

      if (!response.ok) {
        throw new Error('Failed to check compatibility');
      }

      const compatibility = await response.json();

      const embed = new EmbedBuilder()
        .setTitle(`💕 Compatibility: ${user1} & ${user2}`)
        .setColor(0xE91E63)
        .addFields(
          {
            name: '⭐ Overall Score',
            value: `${compatibility.score}%`,
            inline: true
          },
          {
            name: '🔗 Connection Type',
            value: compatibility.connectionType,
            inline: true
          }
        )
        .setDescription('Developer personality compatibility analysis')
        .setTimestamp();

      compatibility.aspects.forEach((aspect: any) => {
        embed.addFields({
          name: aspect.name,
          value: `${aspect.score}% - ${aspect.description}`,
          inline: true
        });
      });

      await interaction.editReply({ embeds: [embed] });

    } catch (error) {
      logger.error('Error checking compatibility', { user1, user2, error });
      await interaction.editReply({
        content: '❌ Failed to check compatibility. Please try again later.'
      });
    }
  }

  /**
   * Handle team builder command
   */
  private async handleTeamBuilderCommand(interaction: ChatInputCommandInteraction): Promise<void> {
    const roles = interaction.options.getString('roles');
    const usernames = interaction.options.getString('usernames');

    if (!roles || !usernames) {
      await interaction.reply({
        content: '❌ Please provide both roles and usernames.',
        ephemeral: true
      });
      return;
    }

    await interaction.deferReply();

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/team/build`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requiredRoles: roles.split(',').map(r => r.trim()),
          availableUsers: usernames.split(',').map(u => u.trim()),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to build team');
      }

      const team = await response.json();

      const embed = new EmbedBuilder()
        .setTitle('🏗️ Optimal Team Composition')
        .setColor(0x00BFA5)
        .setDescription('AI-powered team building based on personality and skills')
        .setTimestamp();

      team.assignments.forEach((assignment: any) => {
        embed.addFields({
          name: assignment.role,
          value: `${assignment.user} (Match: ${assignment.matchScore}%)`,
          inline: true
        });
      });

      embed.addFields({
        name: '🎯 Team Effectiveness',
        value: `${team.effectiveness}%`,
        inline: false
      });

      await interaction.editReply({ embeds: [embed] });

    } catch (error) {
      logger.error('Error building team', { roles, usernames, error });
      await interaction.editReply({
        content: '❌ Failed to build optimal team. Please try again later.'
      });
    }
  }

  /**
   * Handle insights command
   */
  private async handleInsightsCommand(interaction: ChatInputCommandInteraction): Promise<void> {
    const username = interaction.options.getString('username');

    if (!username) {
      await interaction.reply({
        content: '❌ Please provide a GitHub username.',
        ephemeral: true
      });
      return;
    }

    await interaction.deferReply();

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/insights/${username}`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Failed to get insights');
      }

      const insights = await response.json();

      const embed = new EmbedBuilder()
        .setTitle(`💡 Career Insights: @${username}`)
        .setColor(0xFFA726)
        .addFields(
          {
            name: '📈 Career Trajectory',
            value: insights.trajectory,
            inline: false
          },
          {
            name: '🎯 High-Potential Roles',
            value: Object.entries(insights.potential)
              .filter(([_, score]: [string, number]) => score > 70)
              .map(([role, score]) => `${role}: ${score}%`)
              .join('\n'),
            inline: true
          },
          {
            name: '📚 Recommended Skills',
            value: insights.recommendedSkills.slice(0, 5).join(', '),
            inline: true
          }
        )
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });

    } catch (error) {
      logger.error('Error getting insights', { username, error });
      await interaction.editReply({
        content: '❌ Failed to retrieve insights. Please try again later.'
      });
    }
  }

  /**
   * Handle button interactions
   */
  private async handleButtonInteraction(interaction: any): Promise<void> {
    const [action, ...params] = interaction.customId.split('_');

    switch (action) {
      case 'share':
        await this.handleShareAction(interaction, params[0], params[1]);
        break;
      case 'view':
        await this.handleViewAction(interaction, params[0], params[1]);
        break;
      case 'team':
        await this.handleTeamAction(interaction, params[0], params[1]);
        break;
      case 'export':
        await this.handleExportAction(interaction, params[0], params[1]);
        break;
    }
  }

  /**
   * Handle modal submissions
   */
  private async handleModalSubmit(interaction: ModalSubmitInteraction): Promise<void> {
    // Handle modal submissions for detailed inputs
    await interaction.reply({
      content: '✅ Your submission has been processed!',
      ephemeral: true
    });
  }

  /**
   * Handle share actions
   */
  private async handleShareAction(interaction: any, platform: string, chartId: string): Promise<void> {
    await interaction.reply({
      content: `🔗 Sharing chart on ${platform}...`,
      ephemeral: true
    });

    // Implement sharing logic
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/share/${platform}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chartId }),
      });

      const result = await response.json();

      if (result.success) {
        await interaction.followUp({
          content: `✅ Successfully shared on ${platform}! ${result.url}`,
          ephemeral: true
        });
      } else {
        await interaction.followUp({
          content: `❌ Failed to share: ${result.error}`,
          ephemeral: true
        });
      }
    } catch (error) {
      await interaction.followUp({
        content: '❌ Failed to share. Please try again later.',
        ephemeral: true
      });
    }
  }

  /**
   * Handle view actions
   */
  private async handleViewAction(interaction: any, type: string, id: string): Promise<void> {
    // Show detailed view modal
    const modal = new ModalBuilder()
      .setCustomId(`details_${id}`)
      .setTitle('Detailed Birth Chart Analysis');

    await interaction.showModal(modal);
  }

  /**
   * Handle team actions
   */
  private async handleTeamAction(interaction: any, action: string, teamId: string): Promise<void> {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/team/${action}/${teamId}`, {
        method: 'GET',
      });

      const data = await response.json();

      const embed = new EmbedBuilder()
        .setTitle(`Team ${action}`)
        .setColor(0x7289DA)
        .setDescription(data.message || `Team ${action} completed successfully`);

      await interaction.reply({ embeds: [embed], ephemeral: true });

    } catch (error) {
      await interaction.reply({
        content: '❌ Failed to process team action.',
        ephemeral: true
      });
    }
  }

  /**
   * Handle export actions
   */
  private async handleExportAction(interaction: any, type: string, id: string): Promise<void> {
    await interaction.reply({
      content: '📊 Generating export... This may take a moment.',
      ephemeral: true
    });

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/export/${type}/${id}`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Export failed');
      }

      const buffer = Buffer.from(await response.arrayBuffer());

      await interaction.followUp({
        files: [{
          attachment: buffer,
          name: `team-analysis-${Date.now()}.pdf`
        }],
        ephemeral: true
      });

    } catch (error) {
      await interaction.followUp({
        content: '❌ Failed to generate export.',
        ephemeral: true
      });
    }
  }

  /**
   * Send team analysis results to Discord channel
   */
  async sendTeamAnalysis(teamId: string, analysis: TeamAnalysisResponse): Promise<void> {
    try {
      const channel = await this.client.channels.fetch(this.config.channelId);
      if (!channel || !channel.isTextBased()) {
        throw new Error('Invalid channel');
      }

      const embed = new EmbedBuilder()
        .setTitle('🔄 Team Analysis Update')
        .setColor(0x00AE86)
        .setDescription(`Analysis completed for team ${teamId}`)
        .addFields(
          {
            name: 'Synergy Score',
            value: `${analysis.synergy.overall}%`,
            inline: true
          },
          {
            name: 'Members Analyzed',
            value: analysis.members.length.toString(),
            inline: true
          }
        )
        .setTimestamp();

      await channel.send({ embeds: [embed] });

    } catch (error) {
      logger.error('Failed to send team analysis to Discord', { teamId, error });
    }
  }

  /**
   * Cache team member data
   */
  private async cacheTeamMember(member: DiscordTeamMember): Promise<void> {
    try {
      const cacheKey = `discord:member:${member.userId}`;
      await redisClient.setex(cacheKey, 3600, JSON.stringify(member));
    } catch (error) {
      logger.error('Failed to cache team member', { memberId: member.userId, error });
    }
  }

  /**
   * Get cached team member data
   */
  private async getCachedTeamMember(userId: string): Promise<DiscordTeamMember | null> {
    try {
      const cacheKey = `discord:member:${userId}`;
      const data = await redisClient.get(cacheKey);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      logger.error('Failed to get cached team member', { userId, error });
      return null;
    }
  }
}

export const discordBot = new DiscordBot({
  botToken: process.env.DISCORD_BOT_TOKEN!,
  clientId: process.env.DISCORD_CLIENT_ID!,
  clientSecret: process.env.DISCORD_CLIENT_SECRET!,
  guildId: process.env.DISCORD_GUILD_ID!,
  channelId: process.env.DISCORD_CHANNEL_ID!
});