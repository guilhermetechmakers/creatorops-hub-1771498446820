-- Projects table
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('draft', 'active', 'archived', 'completed')),
  channel TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "projects_read_own" ON projects
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "projects_insert_own" ON projects
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "projects_update_own" ON projects
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "projects_delete_own" ON projects
  FOR DELETE USING (auth.uid() = user_id);

-- Content items table
CREATE TABLE content_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  channel TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'in_review', 'scheduled', 'published', 'archived')),
  due_date TIMESTAMP WITH TIME ZONE,
  assignee_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE content_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "content_items_read_own" ON content_items
  FOR SELECT USING (auth.uid() = user_id OR auth.uid() = assignee_id);

CREATE POLICY "content_items_insert_own" ON content_items
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "content_items_update_own" ON content_items
  FOR UPDATE USING (auth.uid() = user_id OR auth.uid() = assignee_id);

CREATE POLICY "content_items_delete_own" ON content_items
  FOR DELETE USING (auth.uid() = user_id);

-- Saved views for filter presets
CREATE TABLE saved_views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  filters JSONB DEFAULT '{}',
  sort_by TEXT,
  sort_order TEXT DEFAULT 'desc',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE saved_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "saved_views_read_own" ON saved_views
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "saved_views_insert_own" ON saved_views
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "saved_views_update_own" ON saved_views
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "saved_views_delete_own" ON saved_views
  FOR DELETE USING (auth.uid() = user_id);

-- Indexes for filtering and sorting
CREATE INDEX idx_content_items_user_status ON content_items(user_id, status);
CREATE INDEX idx_content_items_user_channel ON content_items(user_id, channel);
CREATE INDEX idx_content_items_due_date ON content_items(due_date);
CREATE INDEX idx_content_items_assignee ON content_items(assignee_id);
CREATE INDEX idx_projects_user_status ON projects(user_id, status);
