export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      teams: {
        Row: {
          id: string
          name: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          created_at?: string
          updated_at?: string
        }
      }
      team_members: {
        Row: {
          id: string
          team_id: string
          user_id: string
          role: 'owner' | 'admin' | 'member'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          team_id: string
          user_id: string
          role: 'owner' | 'admin' | 'member'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          team_id?: string
          user_id?: string
          role?: 'owner' | 'admin' | 'member'
          created_at?: string
          updated_at?: string
        }
      }
      google_integration_gmail_calendar: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}

export type TeamRole = 'owner' | 'admin' | 'member'

export interface GoogleIntegrationGmailCalendar {
  id: string
  user_id: string
  title: string
  description?: string | null
  status: string
  created_at: string
  updated_at: string
}

export interface FileUploadManagement {
  id: string
  user_id: string
  title: string
  description?: string | null
  status: string
  created_at: string
  updated_at: string
}

export interface FileAsset {
  id: string
  user_id: string
  folder_id?: string | null
  storage_path: string
  filename: string
  content_type: string
  size_bytes: number
  version: number
  parent_asset_id?: string | null
  thumbnail_path?: string | null
  tags: string[]
  status: string
  created_at: string
  updated_at: string
}

export interface OpenClawEmbeddedAgent {
  id: string
  user_id: string
  title: string
  description?: string | null
  status: string
  created_at: string
  updated_at: string
}

/** Source format for API responses (url, title, snippet) */
export interface OpenClawSource {
  url: string
  title?: string
  snippet?: string
  timestamp?: string
  confidence?: number
}

export interface OpenClawResearchJob {
  id: string
  user_id: string
  agent_id?: string | null
  query: string
  output_type?: string
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled'
  progress?: number
  output_text?: string | null
  output_json?: Record<string, unknown> | null
  sources?: OpenClawSource[] | unknown
  metadata?: Record<string, unknown>
  content_item_id?: string | null
  created_at: string
  updated_at: string
}

export interface OpenClawResearchSource {
  id: string
  job_id: string
  url: string
  title?: string | null
  snippet?: string | null
  snapshot_path?: string | null
  created_at: string
}

export interface OpenClawGeneratedOutput {
  id: string
  user_id: string
  job_id?: string | null
  output_type: string
  content: string
  confidence_score?: number | null
  approved: boolean
  created_at: string
  updated_at: string
}

export interface Project {
  id: string
  user_id: string
  name: string
  status: 'draft' | 'active' | 'archived' | 'completed'
  channel?: string | null
  created_at: string
  updated_at: string
}

export interface ContentItem {
  id: string
  project_id?: string | null
  user_id: string
  title: string
  channel?: string | null
  status: 'draft' | 'in_review' | 'scheduled' | 'published' | 'archived'
  due_date?: string | null
  assignee_id?: string | null
  tags: string[]
  created_at: string
  updated_at: string
}

export interface SavedView {
  id: string
  user_id: string
  name: string
  filters: Record<string, unknown>
  sort_by?: string | null
  sort_order?: string | null
  created_at: string
  updated_at: string
}

export interface ContentItemFilters {
  status?: string
  channel?: string
  assignee_id?: string
  tags?: string[]
  date_from?: string
  date_to?: string
}
