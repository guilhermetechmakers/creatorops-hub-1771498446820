-- OpenClaw Storage Bucket for web snapshot archival (S3-compatible via Supabase Storage)
-- Enables archiving of source page content for research provenance

INSERT INTO storage.buckets (id, name, public)
VALUES ('openclaw-snapshots', 'openclaw-snapshots', false)
ON CONFLICT (id) DO NOTHING;

-- RLS: Users can read snapshots for their own research jobs (job_id is first path segment)
CREATE POLICY "openclaw_snapshots_read_own" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'openclaw-snapshots'
    AND EXISTS (
      SELECT 1 FROM openclaw_research_jobs j
      WHERE j.id::text = (storage.foldername(name))[1]
      AND j.user_id = auth.uid()
    )
  );
