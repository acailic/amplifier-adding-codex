import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { config } from '../../config/env';

class SupabaseService {
  private client: SupabaseClient;

  constructor() {
    this.client = createClient(config.supabaseUrl, config.supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  // User management
  async createUser(userData: {
    email: string;
    username: string;
    github_username?: string;
    referral_code?: string;
    referred_by?: string;
  }) {
    const { data, error } = await this.client
      .from('users')
      .insert(userData)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getUserById(userId: string) {
    const { data, error } = await this.client
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  async getUserByEmail(email: string) {
    const { data, error } = await this.client
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  async updateUser(userId: string, updates: any) {
    const { data, error } = await this.client
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Subscription management
  async createSubscription(subscriptionData: {
    user_id: string;
    tier: string;
    stripe_subscription_id?: string;
    status: string;
    current_period_start?: string;
    current_period_end?: string;
  }) {
    const { data, error } = await this.client
      .from('subscriptions')
      .insert(subscriptionData)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateSubscription(userId: string, updates: any) {
    const { data, error } = await this.client
      .from('subscriptions')
      .update(updates)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getUserSubscription(userId: string) {
    const { data, error } = await this.client
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  // Chart management
  async createChart(chartData: {
    user_id: string;
    github_username: string;
    birth_date: string;
    chart_data: any;
    metrics: any;
    is_premium?: boolean;
    team_id?: string;
  }) {
    const { data, error } = await this.client
      .from('developer_charts')
      .insert(chartData)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getUserCharts(userId: string, limit = 10, offset = 0) {
    const { data, error, count } = await this.client
      .from('developer_charts')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .order('generated_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return { charts: data || [], total: count || 0 };
  }

  async getChartById(chartId: string, userId?: string) {
    let query = this.client
      .from('developer_charts')
      .select('*')
      .eq('id', chartId);

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query.single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  async updateChart(chartId: string, updates: any) {
    const { data, error } = await this.client
      .from('developer_charts')
      .update(updates)
      .eq('id', chartId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Team management
  async createTeam(teamData: {
    name: string;
    owner_id: string;
    constellation_map?: any;
  }) {
    const { data, error } = await this.client
      .from('teams')
      .insert(teamData)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getTeamById(teamId: string) {
    const { data, error } = await this.client
      .from('teams')
      .select(`
        *,
        team_members (
          id,
          user_id,
          role,
          joined_at,
          users (
            id,
            username,
            github_username,
            avatar_url
          )
        )
      `)
      .eq('id', teamId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  async getUserTeams(userId: string) {
    const { data, error } = await this.client
      .from('team_members')
      .select(`
        teams (*)
      `)
      .eq('user_id', userId);

    if (error) throw error;
    return data?.map(item => item.teams) || [];
  }

  async addTeamMember(memberData: {
    team_id: string;
    user_id: string;
    role: string;
  }) {
    const { data, error } = await this.client
      .from('team_members')
      .insert(memberData)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Referral management
  async createReferral(referralData: {
    referrer_id: string;
    referral_code: string;
    referred_user_id?: string;
  }) {
    const { data, error } = await this.client
      .from('referrals')
      .insert(referralData)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getReferralByCode(code: string) {
    const { data, error } = await this.client
      .from('referrals')
      .select('*')
      .eq('referral_code', code)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  async getUserReferrals(userId: string) {
    const { data, error } = await this.client
      .from('referrals')
      .select(`
        *,
        referred_user:users (
          username,
          github_username
        )
      `)
      .eq('referrer_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // Usage tracking
  async trackUsage(usageData: {
    user_id: string;
    event_type: string;
    resource_id?: string;
    metadata?: any;
  }) {
    const { data, error } = await this.client
      .from('usage_tracking')
      .insert(usageData)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getUserUsage(userId: string, period: 'daily' | 'weekly' | 'monthly' = 'monthly') {
    const startDate = new Date();

    switch (period) {
      case 'daily':
        startDate.setDate(startDate.getDate() - 1);
        break;
      case 'weekly':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'monthly':
        startDate.setMonth(startDate.getMonth() - 1);
        break;
    }

    const { data, error } = await this.client
      .from('usage_tracking')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', startDate.toISOString());

    if (error) throw error;
    return data || [];
  }

  async checkUsageLimits(userId: string, eventType: string) {
    const { data, error } = await this.client
      .rpc('check_usage_limits', {
        p_user_id: userId,
        p_event_type: eventType
      });

    if (error) throw error;
    return data;
  }

  // Sharing and viral metrics
  async trackSharingEvent(sharingData: {
    user_id: string;
    platform: string;
    content_type: string;
    content_id: string;
    referral_code_used?: string;
  }) {
    const { data, error } = await this.client
      .from('sharing_events')
      .insert(sharingData)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getUserSharingEvents(userId: string, limit = 50) {
    const { data, error } = await this.client
      .from('sharing_events')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }

  // Achievements
  async unlockAchievement(achievementData: {
    user_id: string;
    type: string;
    title: string;
    description: string;
    icon_url?: string;
    rarity?: string;
    metadata?: any;
  }) {
    const { data, error } = await this.client
      .from('achievements')
      .insert(achievementData)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getUserAchievements(userId: string) {
    const { data, error } = await this.client
      .from('achievements')
      .select('*')
      .eq('user_id', userId)
      .order('unlocked_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // Analytics
  async getViralMetrics(userId: string, period: 'daily' | 'weekly' | 'monthly' = 'monthly') {
    const startDate = new Date();
    let endDate = new Date();

    switch (period) {
      case 'daily':
        startDate.setDate(startDate.getDate() - 1);
        break;
      case 'weekly':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'monthly':
        startDate.setMonth(startDate.getMonth() - 1);
        break;
    }

    const { data, error } = await this.client
      .from('viral_metrics')
      .select('*')
      .eq('user_id', userId)
      .eq('period', period)
      .gte('date', startDate.toISOString().split('T')[0])
      .lte('date', endDate.toISOString().split('T')[0])
      .order('date', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // Generic query method for complex operations
  async query(sql: string, params: any[] = []) {
    const { data, error } = await this.client.rpc('execute_sql', {
      sql,
      params
    });

    if (error) throw error;
    return data;
  }
}

export const supabase = new SupabaseService();