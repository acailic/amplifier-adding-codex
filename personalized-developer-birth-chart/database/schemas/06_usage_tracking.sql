-- Usage tracking table
CREATE TABLE usage_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  event_type VARCHAR(30) NOT NULL CHECK (event_type IN ('chart_generated', 'api_call', 'team_analysis', 'export', 'premium_feature')),
  resource_id UUID,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Usage aggregates table for quick lookups
CREATE TABLE usage_aggregates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  charts_generated INTEGER DEFAULT 0,
  api_calls INTEGER DEFAULT 0,
  team_analyses INTEGER DEFAULT 0,
  exports_generated INTEGER DEFAULT 0,
  premium_features_used INTEGER DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Achievements table
CREATE TABLE achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(30) NOT NULL CHECK (type IN ('chart_count', 'referral_milestone', 'team_builder', 'innovation', 'consistency')),
  title VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  icon_url TEXT,
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  rarity VARCHAR(20) DEFAULT 'common' CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
  metadata JSONB DEFAULT '{}',
  UNIQUE(user_id, type, title)
);

-- Audit log for security
CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  action VARCHAR(50) NOT NULL,
  resource_type VARCHAR(50) NOT NULL,
  resource_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_usage_tracking_user_id ON usage_tracking(user_id);
CREATE INDEX idx_usage_tracking_event_type ON usage_tracking(event_type);
CREATE INDEX idx_usage_tracking_created_at ON usage_tracking(created_at);

CREATE INDEX idx_usage_aggregates_user_id ON usage_aggregates(user_id);
CREATE INDEX idx_usage_aggregates_date ON usage_aggregates(date);

CREATE INDEX idx_achievements_user_id ON achievements(user_id);
CREATE INDEX idx_achievements_type ON achievements(type);
CREATE INDEX idx_achievements_rarity ON achievements(rarity);

CREATE INDEX idx_audit_log_user_id ON audit_log(user_id);
CREATE INDEX idx_audit_log_action ON audit_log(action);
CREATE INDEX idx_audit_log_created_at ON audit_log(created_at);

-- Function to update usage aggregates
CREATE OR REPLACE FUNCTION update_usage_aggregates()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO usage_aggregates (user_id, date, charts_generated, api_calls, team_analyses, exports_generated, premium_features_used)
    VALUES (
        NEW.user_id,
        NEW.created_at::DATE,
        CASE WHEN NEW.event_type = 'chart_generated' THEN 1 ELSE 0 END,
        CASE WHEN NEW.event_type = 'api_call' THEN 1 ELSE 0 END,
        CASE WHEN NEW.event_type = 'team_analysis' THEN 1 ELSE 0 END,
        CASE WHEN NEW.event_type = 'export' THEN 1 ELSE 0 END,
        CASE WHEN NEW.event_type = 'premium_feature' THEN 1 ELSE 0 END
    )
    ON CONFLICT (user_id, date)
    DO UPDATE SET
        charts_generated = usage_aggregates.charts_generated +
            CASE WHEN NEW.event_type = 'chart_generated' THEN 1 ELSE 0 END,
        api_calls = usage_aggregates.api_calls +
            CASE WHEN NEW.event_type = 'api_call' THEN 1 ELSE 0 END,
        team_analyses = usage_aggregates.team_analyses +
            CASE WHEN NEW.event_type = 'team_analysis' THEN 1 ELSE 0 END,
        exports_generated = usage_aggregates.exports_generated +
            CASE WHEN NEW.event_type = 'export' THEN 1 ELSE 0 END,
        premium_features_used = usage_aggregates.premium_features_used +
            CASE WHEN NEW.event_type = 'premium_feature' THEN 1 ELSE 0 END,
        updated_at = NOW();

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update aggregates
CREATE TRIGGER update_usage_aggregates_trigger
    AFTER INSERT ON usage_tracking
    FOR EACH ROW
    EXECUTE FUNCTION update_usage_aggregates();

-- Function to check usage limits
CREATE OR REPLACE FUNCTION check_usage_limits(
    p_user_id UUID,
    p_event_type VARCHAR,
    p_limit_type VARCHAR DEFAULT 'daily'
)
RETURNS JSONB AS $$
DECLARE
    current_usage BIGINT;
    usage_limit BIGINT;
    subscription_tier VARCHAR;
BEGIN
    -- Get user's subscription tier
    SELECT tier INTO subscription_tier
    FROM subscriptions
    WHERE user_id = p_user_id AND status = 'active';

    IF subscription_tier IS NULL THEN
        subscription_tier := 'free';
    END IF;

    -- Get usage limits based on tier
    CASE subscription_tier
        WHEN 'free' THEN
            usage_limit := CASE p_event_type
                WHEN 'chart_generated' THEN 3
                WHEN 'api_call' THEN 100
                ELSE 10
            END;
        WHEN 'starter' THEN
            usage_limit := CASE p_event_type
                WHEN 'chart_generated' THEN 25
                WHEN 'api_call' THEN 1000
                ELSE 100
            END;
        WHEN 'pro' THEN
            usage_limit := CASE p_event_type
                WHEN 'chart_generated' THEN 250
                WHEN 'api_call' THEN 10000
                ELSE 1000
            END;
        WHEN 'team' THEN
            usage_limit := CASE p_event_type
                WHEN 'chart_generated' THEN 1000
                WHEN 'api_call' THEN 50000
                ELSE 5000
            END;
        WHEN 'enterprise' THEN
            usage_limit := -1; -- Unlimited
        ELSE
            usage_limit := 10;
    END CASE;

    -- Check current usage
    IF usage_limit = -1 THEN
        RETURN jsonb_build_object('allowed', true, 'current', 0, 'limit', 'unlimited');
    END IF;

    SELECT COUNT(*) INTO current_usage
    FROM usage_tracking
    WHERE user_id = p_user_id
    AND event_type = p_event_type
    AND created_at >= date_trunc(p_limit_type, NOW());

    RETURN jsonb_build_object(
        'allowed', current_usage < usage_limit,
        'current', current_usage,
        'limit', usage_limit,
        'remaining', GREATEST(usage_limit - current_usage, 0)
    );
END;
$$ LANGUAGE plpgsql;

-- RLS policies
ALTER TABLE usage_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_aggregates ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Usage tracking policies
CREATE POLICY "Users can view their own usage"
    ON usage_tracking FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Users can create their own usage events"
    ON usage_tracking FOR INSERT
    WITH CHECK (user_id = auth.uid());

-- Usage aggregates policies
CREATE POLICY "Users can view their own usage aggregates"
    ON usage_aggregates FOR SELECT
    USING (user_id = auth.uid());

-- Achievements policies
CREATE POLICY "Users can view their own achievements"
    ON achievements FOR SELECT
    USING (user_id = auth.uid());

-- Audit log policies (read-only for users)
CREATE POLICY "Users can view their own audit logs"
    ON audit_log FOR SELECT
    USING (user_id = auth.uid());