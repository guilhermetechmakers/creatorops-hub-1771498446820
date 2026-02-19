-- File Upload & Management - S3-compatible storage schema
-- Uses file_upload_management (sanitized) for SQL compatibility

-- Folders/collections for organizing assets
CREATE TABLE file_upload_management (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE file_upload_management ENABLE ROW LEVEL SECURITY;

CREATE POLICY "file_upload_management_read_own" ON file_upload_management
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "file_upload_management_insert_own" ON file_upload_management
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "file_upload_management_update_own" ON file_upload_management
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "file_upload_management_delete_own" ON file_upload_management
  FOR DELETE USING (auth.uid() = user_id);

-- File assets - metadata for S3-stored files (versioning, thumbnails, etc.)
CREATE TABLE file_assets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  folder_id UUID REFERENCES file_upload_management(id) ON DELETE SET NULL,
  storage_path TEXT NOT NULL,
  filename TEXT NOT NULL,
  content_type TEXT NOT NULL,
  size_bytes BIGINT NOT NULL DEFAULT 0,
  version INTEGER NOT NULL DEFAULT 1,
  parent_asset_id UUID REFERENCES file_assets(id) ON DELETE SET NULL,
  thumbnail_path TEXT,
  tags TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_file_assets_user_id ON file_assets(user_id);
CREATE INDEX idx_file_assets_folder_id ON file_assets(folder_id);
CREATE INDEX idx_file_assets_created_at ON file_assets(created_at DESC);
CREATE INDEX idx_file_assets_tags ON file_assets USING GIN(tags);

ALTER TABLE file_assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "file_assets_read_own" ON file_assets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "file_assets_insert_own" ON file_assets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "file_assets_update_own" ON file_assets
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "file_assets_delete_own" ON file_assets
  FOR DELETE USING (auth.uid() = user_id);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER file_upload_management_updated_at
  BEFORE UPDATE ON file_upload_management
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER file_assets_updated_at
  BEFORE UPDATE ON file_assets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Storage bucket for assets (S3-compatible)
INSERT INTO storage.buckets (id, name, public)
VALUES ('assets', 'assets', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for assets bucket (user-scoped paths: user_id/...)
CREATE POLICY "assets_upload_own" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'assets' AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "assets_select_own" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'assets' AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "assets_update_own" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'assets' AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "assets_delete_own" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'assets' AND (storage.foldername(name))[1] = auth.uid()::text
  );
