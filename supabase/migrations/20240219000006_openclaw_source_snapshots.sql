-- OpenClaw Source Snapshots - Web snapshot archival (Supabase Storage / S3-compatible)
-- Tracks archived web page snapshots for research provenance

CREATE TABLE openclaw_source_snapshots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID NOT NULL REFERENCES openclaw_research_jobs(id) ON DELETE CASCADE,
  source_url TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  content_hash TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_openclaw_source_snapshots_job_id ON openclaw_source_snapshots(job_id);
CREATE INDEX idx_openclaw_source_snapshots_source_url ON openclaw_source_snapshots(source_url);

ALTER TABLE openclaw_source_snapshots ENABLE ROW LEVEL SECURITY;

-- Users can read snapshots for their own research jobs
CREATE POLICY "openclaw_source_snapshots_read_own" ON openclaw_source_snapshots
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM openclaw_research_jobs j
      WHERE j.id = openclaw_source_snapshots.job_id AND j.user_id = auth.uid()
    )
  );

-- Service role inserts via Edge Function (RLS bypass with service key)
-- Allow insert for authenticated users when job belongs to them
CREATE POLICY "openclaw_source_snapshots_insert_own" ON openclaw_source_snapshots
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM openclaw_research_jobs j
      WHERE j.id = openclaw_source_snapshots.job_id AND j.user_id = auth.uid()
    )
  );
