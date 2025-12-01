-- Developer Birth Charts table
CREATE TABLE developer_charts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  github_username VARCHAR(100) NOT NULL,
  birth_date TIMESTAMP WITH TIME ZONE, -- GitHub join date
  chart_data JSONB NOT NULL,
  metrics JSONB NOT NULL,
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_premium BOOLEAN DEFAULT FALSE,
  team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
  cached_image_url TEXT,
  last_accessed TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_charts_user_id ON developer_charts(user_id);
CREATE INDEX idx_charts_github_username ON developer_charts(github_username);
CREATE INDEX idx_charts_team_id ON developer_charts(team_id);
CREATE INDEX idx_charts_generated_at ON developer_charts(generated_at);
CREATE INDEX idx_charts_is_premium ON developer_charts(is_premium);

-- Full text search on chart data
CREATE INDEX idx_charts_search ON developer_charts USING GIN (
  to_tsvector('english',
    COALESCE(chart_data->>'coding_sign', '') || ' ' ||
    COALESCE(chart_data->>'tech_ascendant', '') || ' ' ||
    COALESCE(chart_data->>'collaboration_moon', '') || ' ' ||
    COALESCE(github_username, '')
  )
);

-- Trigger for last_accessed
CREATE OR REPLACE FUNCTION update_last_accessed()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_accessed = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_charts_last_accessed
    BEFORE UPDATE ON developer_charts
    FOR EACH ROW
    EXECUTE FUNCTION update_last_accessed();

-- RLS policies
ALTER TABLE developer_charts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own charts"
    ON developer_charts FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own charts"
    ON developer_charts FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own charts"
    ON developer_charts FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Team members can view team charts"
    ON developer_charts FOR SELECT
    USING (
      EXISTS (
        SELECT 1 FROM team_members
        WHERE team_members.team_id = developer_charts.team_id
        AND team_members.user_id = auth.uid()
      )
    );