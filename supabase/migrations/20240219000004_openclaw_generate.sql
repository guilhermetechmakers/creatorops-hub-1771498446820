-- OpenClaw Generate - Generated outputs and usage tracking

CREATE TABLE openclaw_generated_outputs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  job_id UUID REFERENCES openclaw_research_jobs(id) ON DELETE SET NULL,
  output_type TEXT NOT NULL,
  content TEXT NOT NULL,
  confidence_score NUMERIC(3,2),
  approved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_openclaw_generated_outputs_user_id ON openclaw_generated_outputs(user_id);
CREATE INDEX idx_openclaw_generated_outputs_job_id ON openclaw_generated_outputs(job_id);
CREATE INDEX idx_openclaw_generated_outputs_created_at ON openclaw_generated_outputs(created_at DESC);

ALTER TABLE openclaw_generated_outputs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "openclaw_generated_outputs_read_own" ON openclaw_generated_outputs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "openclaw_generated_outputs_insert_own" ON openclaw_generated_outputs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "openclaw_generated_outputs_update_own" ON openclaw_generated_outputs
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "openclaw_generated_outputs_delete_own" ON openclaw_generated_outputs
  FOR DELETE USING (auth.uid() = user_id);

-- Usage tracking for generate operations (separate from research)
CREATE TABLE openclaw_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  operation_type TEXT NOT NULL,
  tokens_used INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_openclaw_usage_user_created ON openclaw_usage(user_id, created_at DESC);

ALTER TABLE openclaw_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "openclaw_usage_read_own" ON openclaw_usage
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "openclaw_usage_insert_own" ON openclaw_usage
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER openclaw_generated_outputs_updated_at
  BEFORE UPDATE ON openclaw_generated_outputs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
