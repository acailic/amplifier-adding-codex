-- Referrals table
CREATE TABLE referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  referred_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  referral_code VARCHAR(20) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'rewarded')),
  reward_tier VARCHAR(20) CHECK (reward_tier IN ('free_month', 'discount', 'cash_bonus')),
  conversion_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(referral_code)
);

-- Viral metrics table
CREATE TABLE viral_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  period VARCHAR(10) NOT NULL CHECK (period IN ('daily', 'weekly', 'monthly')),
  date DATE NOT NULL,
  referrals_sent INTEGER DEFAULT 0,
  referrals_converted INTEGER DEFAULT 0,
  conversion_rate DECIMAL(5,4) DEFAULT 0,
  viral_coefficient DECIMAL(5,4) DEFAULT 0,
  sharing_events JSONB DEFAULT '{
    "twitter": 0,
    "linkedin": 0,
    "email": 0,
    "direct": 0
  }',
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, period, date)
);

-- Sharing events table
CREATE TABLE sharing_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  platform VARCHAR(20) NOT NULL CHECK (platform IN ('twitter', 'linkedin', 'email', 'direct', 'copy_link')),
  content_type VARCHAR(20) NOT NULL CHECK (content_type IN ('chart', 'team_analysis', 'achievement')),
  content_id UUID NOT NULL,
  referral_code_used VARCHAR(20),
  clicks_tracked INTEGER DEFAULT 0,
  conversions_tracked INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_referrals_referrer_id ON referrals(referrer_id);
CREATE INDEX idx_referrals_referred_user_id ON referrals(referred_user_id);
CREATE INDEX idx_referrals_code ON referrals(referral_code);
CREATE INDEX idx_referrals_status ON referrals(status);

CREATE INDEX idx_viral_metrics_user_id ON viral_metrics(user_id);
CREATE INDEX idx_viral_metrics_date ON viral_metrics(date);
CREATE INDEX idx_viral_metrics_period ON viral_metrics(period);

CREATE INDEX idx_sharing_events_user_id ON sharing_events(user_id);
CREATE INDEX idx_sharing_events_platform ON sharing_events(platform);
CREATE INDEX idx_sharing_events_content ON sharing_events(content_type, content_id);
CREATE INDEX idx_sharing_events_created_at ON sharing_events(created_at);

-- RLS policies
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE viral_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE sharing_events ENABLE ROW LEVEL SECURITY;

-- Referrals policies
CREATE POLICY "Users can view their own referrals"
    ON referrals FOR SELECT
    USING (referrer_id = auth.uid() OR referred_user_id = auth.uid());

CREATE POLICY "Users can create referrals"
    ON referrals FOR INSERT
    WITH CHECK (referrer_id = auth.uid());

-- Viral metrics policies
CREATE POLICY "Users can view their own viral metrics"
    ON viral_metrics FOR SELECT
    USING (user_id = auth.uid());

-- Sharing events policies
CREATE POLICY "Users can view their own sharing events"
    ON sharing_events FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Users can create sharing events"
    ON sharing_events FOR INSERT
    WITH CHECK (user_id = auth.uid());