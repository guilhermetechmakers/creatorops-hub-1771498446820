import { supabase } from '@/lib/supabase'
import type {
  ContentItem,
  ContentItemFilters,
  Project,
  SavedView,
} from '@/types/database'

const PAGE_SIZE = 12

export interface ListContentParams {
  limit?: number
  offset?: number
  search?: string
  filters?: ContentItemFilters
  sort_by?: string
  sort_order?: 'asc' | 'desc'
}

export interface ListContentResult {
  items: ContentItem[]
  total: number
}

export const projectContentListService = {
  async listContentItems(
    userId: string,
    params: ListContentParams = {}
  ): Promise<ListContentResult> {
    const {
      limit = PAGE_SIZE,
      offset = 0,
      search,
      filters = {},
      sort_by = 'updated_at',
      sort_order = 'desc',
    } = params

    let query = supabase
      .from('content_items')
      .select('*', { count: 'exact' })
      .or(`user_id.eq.${userId},assignee_id.eq.${userId}`)
      .order(sort_by, { ascending: sort_order === 'asc' })
      .range(offset, offset + limit - 1)

    if (search?.trim()) {
      query = query.ilike('title', `%${search.trim()}%`)
    }
    if (filters.status) {
      query = query.eq('status', filters.status)
    }
    if (filters.channel) {
      query = query.eq('channel', filters.channel)
    }
    if (filters.assignee_id) {
      query = query.eq('assignee_id', filters.assignee_id)
    }
    if (filters.tags?.length) {
      query = query.overlaps('tags', filters.tags)
    }
    if (filters.date_from) {
      query = query.gte('due_date', filters.date_from)
    }
    if (filters.date_to) {
      query = query.lte('due_date', filters.date_to)
    }

    const { data, error, count } = await query
    if (error) throw error
    return {
      items: (data ?? []) as ContentItem[],
      total: count ?? 0,
    }
  },

  async listProjects(userId: string): Promise<Project[]> {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })

    if (error) throw error
    return (data ?? []) as Project[]
  },

  async getContentItem(id: string, userId: string): Promise<ContentItem | null> {
    const { data, error } = await supabase
      .from('content_items')
      .select('*')
      .eq('id', id)
      .or(`user_id.eq.${userId},assignee_id.eq.${userId}`)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null
      throw error
    }
    return data as ContentItem
  },

  async getProject(id: string, userId: string): Promise<Project | null> {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null
      throw error
    }
    return data as Project
  },

  async createContentItem(
    userId: string,
    payload: Partial<Omit<ContentItem, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
  ): Promise<ContentItem> {
    const { data, error } = await supabase
      .from('content_items')
      .insert({
        user_id: userId,
        title: payload.title ?? 'Untitled',
        project_id: payload.project_id ?? null,
        channel: payload.channel ?? null,
        status: payload.status ?? 'draft',
        due_date: payload.due_date ?? null,
        assignee_id: payload.assignee_id ?? null,
        tags: payload.tags ?? [],
      })
      .select()
      .single()

    if (error) throw error
    return data as ContentItem
  },

  async duplicateContentItem(id: string, userId: string): Promise<ContentItem> {
    const item = await this.getContentItem(id, userId)
    if (!item) throw new Error('Content item not found')

    return this.createContentItem(userId, {
      ...item,
      title: `${item.title} (Copy)`,
      status: 'draft',
    })
  },

  async updateContentItem(
    id: string,
    userId: string,
    payload: Partial<Pick<ContentItem, 'status' | 'assignee_id' | 'due_date' | 'title' | 'channel' | 'tags'>>
  ): Promise<ContentItem> {
    const { data, error } = await supabase
      .from('content_items')
      .update({ ...payload, updated_at: new Date().toISOString() })
      .eq('id', id)
      .or(`user_id.eq.${userId},assignee_id.eq.${userId}`)
      .select()
      .single()

    if (error) throw error
    return data as ContentItem
  },

  async bulkUpdateStatus(
    ids: string[],
    userId: string,
    status: ContentItem['status']
  ): Promise<void> {
    const { error } = await supabase
      .from('content_items')
      .update({ status, updated_at: new Date().toISOString() })
      .in('id', ids)
      .eq('user_id', userId)

    if (error) throw error
  },

  async bulkAssign(
    ids: string[],
    userId: string,
    assigneeId: string | null
  ): Promise<void> {
    const { error } = await supabase
      .from('content_items')
      .update({ assignee_id: assigneeId, updated_at: new Date().toISOString() })
      .in('id', ids)
      .eq('user_id', userId)

    if (error) throw error
  },

  async deleteContentItem(id: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('content_items')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)

    if (error) throw error
  },

  async listSavedViews(userId: string): Promise<SavedView[]> {
    const { data, error } = await supabase
      .from('saved_views')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })

    if (error) throw error
    return (data ?? []) as SavedView[]
  },

  async createSavedView(
    userId: string,
    payload: { name: string; filters: Record<string, unknown>; sort_by?: string; sort_order?: string }
  ): Promise<SavedView> {
    const { data, error } = await supabase
      .from('saved_views')
      .insert({
        user_id: userId,
        name: payload.name,
        filters: payload.filters,
        sort_by: payload.sort_by ?? null,
        sort_order: payload.sort_order ?? 'desc',
      })
      .select()
      .single()

    if (error) throw error
    return data as SavedView
  },

  async deleteSavedView(id: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('saved_views')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)

    if (error) throw error
  },
}
