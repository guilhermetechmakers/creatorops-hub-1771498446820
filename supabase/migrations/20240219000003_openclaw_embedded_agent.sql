-- OpenClaw Embedded Agent - AI research & generation schema
-- Stores agent configs, research jobs, and provenance metadata

-- openclaw_embedded_agent table (agent configs)
CREATE TABLE openclaw_embedded_agent (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE openclaw_embedded_agent ENABLE ROW LEVEL SECURITY;

CREATE POLICY "openclaw_embedded_agent_read_own" ON openclaw_embedded_agent
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "openclaw_embedded_agent_insert_own" ON openclaw_embedded_agent
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "openclaw_embedded_agent_update_own" ON openclaw_embedded_agent
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "openclaw_embedded_agent_delete_own" ON openclaw_embedded_agent
  FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX idx_openclaw_embedded_agent_user_id ON openclaw_embedded_agent(user_id);
CREATE INDEX idx_openclaw_embedded_agent_created_at ON openclaw_embedded_agent(created_at DESC);

-- openclaw_research_jobs table (job records with outputs and provenance)
CREATE TABLE openclaw_research_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES openclaw_embedded_agent(id) ON DELETE SET NULL,
  query TEXT NOT NULL,
  output_type TEXT DEFAULT 'summary',
  status TEXT DEFAULT 'pending',
  progress INTEGER DEFAULT 0,
  output_text TEXT,
  output_json JSONB,
  sources JSONB DEFAULT '[]',
  metadata JSONB DEFAULT '{}',
  content_item_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE openclaw_research_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "openclaw_research_jobs_read_own" ON openclaw_research_jobs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "openclaw_research_jobs_insert_own" ON openclaw_research_jobs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "openclaw_research_jobs_update_own" ON openclaw_research_jobs
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "openclaw_research_jobs_delete_own" ON openclaw_research_jobs
  FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX idx_openclaw_research_jobs_user_id ON openclaw_research_jobs(user_id);
CREATE INDEX idx_openclaw_research_jobs_status ON openclaw_research_jobs(status);
CREATE INDEX idx_openclaw_research_jobs_created_at ON openclaw_research_jobs(created_at DESC);

-- openclaw_usage_accounting table (quota and billing)
CREATE TABLE openclaw_usage_accounting (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  job_id UUID REFERENCES openclaw_research_jobs(id) ON DELETE SET NULL,
  tokens_used INTEGER DEFAULT 0,
  api_calls INTEGER DEFAULT 0,
  cost_units DECIMAL(12, 6) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE openclaw_usage_accounting ENABLE ROW LEVEL SECURITY;

CREATE POLICY "openclaw_usage_accounting_read_own" ON openclaw_usage_accounting
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "openclaw_usage_accounting_insert_own" ON openclaw_usage_accounting
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_openclaw_usage_accounting_user_id ON openclaw_usage_accounting(user_id);
CREATE INDEX idx_openclaw_usage_accounting_created_at ON openclaw_usage_accounting(created_at DESC);

-- Triggers for updated_at
CREATE TRIGGER openclaw_embedded_agent_updated_at
  BEFORE UPDATE ON openclaw_embedded_agent
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER openclaw_research_jobs_updated_at
  BEFORE UPDATE ON openclaw_research_jobs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
