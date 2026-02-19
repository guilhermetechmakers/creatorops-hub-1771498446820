import { supabase } from '@/lib/supabase'
import type { GoogleIntegrationGmailCalendar } from '@/types/database'

export const googleIntegrationService = {
  async list(userId: string): Promise<GoogleIntegrationGmailCalendar[]> {
    const { data, error } = await supabase
      .from('google_integration_gmail_calendar')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data ?? []
  },

  async getById(
    id: string,
    userId: string
  ): Promise<GoogleIntegrationGmailCalendar | null> {
    const { data, error } = await supabase
      .from('google_integration_gmail_calendar')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null
      throw error
    }
    return data
  },

  async create(
    userId: string,
    payload: { title: string; description?: string }
  ): Promise<GoogleIntegrationGmailCalendar> {
    const { data, error } = await supabase
      .from('google_integration_gmail_calendar')
      .insert({
        user_id: userId,
        title: payload.title,
        description: payload.description ?? null,
        status: 'active',
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  async update(
    id: string,
    userId: string,
    payload: Partial<{ title: string; description: string; status: string }>
  ): Promise<GoogleIntegrationGmailCalendar> {
    const { data, error } = await supabase
      .from('google_integration_gmail_calendar')
      .update({
        ...payload,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async delete(id: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('google_integration_gmail_calendar')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)

    if (error) throw error
  },

  async revoke(id: string, userId: string): Promise<GoogleIntegrationGmailCalendar> {
    return this.update(id, userId, { status: 'revoked' })
  },
}
