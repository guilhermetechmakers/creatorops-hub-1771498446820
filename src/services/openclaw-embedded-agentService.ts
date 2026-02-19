import { supabase } from '@/lib/supabase'
import type {
  OpenClawEmbeddedAgent,
  OpenClawGeneratedOutput,
  OpenClawResearchJob,
  OpenClawSource,
} from '@/types/database'

export interface CreateResearchPayload {
  query: string
  content_item_id?: string
  agent_id?: string
  output_type?: 'summary' | 'thread' | 'script' | 'caption'
}

export interface CreateGeneratePayload {
  prompt: string
  output_type?: 'thread' | 'script' | 'caption' | 'article'
  job_id?: string
}

export interface GenerateResponse {
  output_id: string
  output: OpenClawGeneratedOutput
  confidence_score: number
}

export interface ResearchResponse {
  job_id: string
  status: string
  job: OpenClawResearchJob
  sources: OpenClawSource[]
  summary: string
  confidence_score: number
}

export interface UsageResponse {
  api_calls_24h: number
  tokens_used_24h: number
  cost_units_24h: number
  records: Array<{
    id: string
    tokens_used: number
    api_calls: number
    cost_units: number
    created_at: string
  }>
}

export const openclawEmbeddedAgentService = {
  async createResearch(
    accessToken: string,
    payload: CreateResearchPayload
  ): Promise<ResearchResponse> {
    const { data, error } = await supabase.functions.invoke('openclaw-research', {
      body: {
        query: payload.query,
        content_item_id: payload.content_item_id,
      },
      headers: { Authorization: `Bearer ${accessToken}` },
    })

    if (error) throw error
    if (data?.error) throw new Error(data.error)
    const res = data as ResearchResponse
    return {
      ...res,
      sources: (res.sources ?? []).map((s: { url: string; title?: string; snippet?: string }) => ({
        url: s.url,
        title: s.title,
        snippet: s.snippet,
      })),
    }
  },

  async createGenerate(
    accessToken: string,
    payload: CreateGeneratePayload
  ): Promise<GenerateResponse> {
    const { data, error } = await supabase.functions.invoke('openclaw-generate', {
      body: {
        prompt: payload.prompt,
        output_type: payload.output_type ?? 'article',
        job_id: payload.job_id,
      },
      headers: { Authorization: `Bearer ${accessToken}` },
    })

    if (error) throw error
    if (data?.error) throw new Error(data.error)
    return data as GenerateResponse
  },

  async getGeneratedOutput(
    _accessToken: string,
    outputId: string
  ): Promise<OpenClawGeneratedOutput> {
    const { data, error } = await supabase
      .from('openclaw_generated_outputs')
      .select('*')
      .eq('id', outputId)
      .single()

    if (error) throw error
    if (!data) throw new Error('Output not found')
    return data as OpenClawGeneratedOutput
  },

  async listGeneratedOutputs(
    _accessToken: string,
    options?: { limit?: number; offset?: number; job_id?: string }
  ): Promise<{ outputs: OpenClawGeneratedOutput[]; count: number }> {
    let query = supabase
      .from('openclaw_generated_outputs')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })

    if (options?.job_id) {
      query = query.eq('job_id', options.job_id)
    }
    if (options?.limit) {
      query = query.limit(options.limit)
    }
    if (options?.offset !== undefined) {
      query = query.range(
        options.offset,
        options.offset + (options.limit ?? 20) - 1
      )
    }

    const { data, count, error } = await query
    if (error) throw error
    return { outputs: (data ?? []) as OpenClawGeneratedOutput[], count: count ?? 0 }
  },

  async approveOutput(
    _accessToken: string,
    outputId: string
  ): Promise<OpenClawGeneratedOutput> {
    const { data, error } = await supabase
      .from('openclaw_generated_outputs')
      .update({ approved: true, updated_at: new Date().toISOString() })
      .eq('id', outputId)
      .select()
      .single()

    if (error) throw error
    return data as OpenClawGeneratedOutput
  },

  async getJob(
    _accessToken: string,
    jobId: string
  ): Promise<{ job: OpenClawResearchJob }> {
    const { data: job, error } = await supabase
      .from('openclaw_research_jobs')
      .select('*')
      .eq('id', jobId)
      .single()

    if (error) throw error
    if (!job) throw new Error('Job not found')
    return { job: job as OpenClawResearchJob }
  },

  async listJobs(
    _accessToken: string,
    options?: { limit?: number; offset?: number; status?: string }
  ): Promise<{ jobs: OpenClawResearchJob[]; count: number }> {
    let query = supabase
      .from('openclaw_research_jobs')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })

    if (options?.status) {
      query = query.eq('status', options.status)
    }
    if (options?.limit) {
      query = query.limit(options.limit)
    }
    if (options?.offset) {
      query = query.range(options.offset, options.offset + (options.limit ?? 20) - 1)
    }

    const { data, count, error } = await query
    if (error) throw error
    return { jobs: (data ?? []) as OpenClawResearchJob[], count: count ?? 0 }
  },

  async getUsage(accessToken: string): Promise<UsageResponse> {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? ''
    const url = `${supabaseUrl}/functions/v1/openclaw-proxy?action=usage`
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    const json = await res.json()
    if (json.error) throw new Error(json.error)
    return json
  },

  async cancelJob(accessToken: string, jobId: string): Promise<{ success: boolean; job: OpenClawResearchJob }> {
    const { data, error } = await supabase.functions.invoke('openclaw-proxy', {
      body: { action: 'cancel', job_id: jobId },
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    if (error) throw error
    if (data?.error) throw new Error(data.error)
    return data as { success: boolean; job: OpenClawResearchJob }
  },

  async listAgents(userId: string): Promise<OpenClawEmbeddedAgent[]> {
    const { data, error } = await supabase
      .from('openclaw_embedded_agent')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data ?? []) as OpenClawEmbeddedAgent[]
  },

  async createAgent(
    userId: string,
    payload: { title: string; description?: string }
  ): Promise<OpenClawEmbeddedAgent> {
    const { data, error } = await supabase
      .from('openclaw_embedded_agent')
      .insert({
        user_id: userId,
        title: payload.title,
        description: payload.description ?? null,
        status: 'active',
      })
      .select()
      .single()

    if (error) throw error
    return data as OpenClawEmbeddedAgent
  },

  async updateAgent(
    id: string,
    userId: string,
    payload: Partial<{ title: string; description: string; status: string }>
  ): Promise<OpenClawEmbeddedAgent> {
    const { data, error } = await supabase
      .from('openclaw_embedded_agent')
      .update({ ...payload, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) throw error
    return data as OpenClawEmbeddedAgent
  },

  async deleteAgent(id: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('openclaw_embedded_agent')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)

    if (error) throw error
  },
}
