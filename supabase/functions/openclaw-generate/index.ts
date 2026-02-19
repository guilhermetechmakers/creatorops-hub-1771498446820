import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

const DAILY_QUOTA = 100
const RATE_LIMIT_WINDOW_MS = 24 * 60 * 60 * 1000
const MAX_RETRIES = 3
const INITIAL_BACKOFF_MS = 500
const MIN_CONFIDENCE_THRESHOLD = 0.5

const OUTPUT_TYPES = ['thread', 'script', 'caption', 'article']

async function sleep(attempt: number): Promise<void> {
  const delay = INITIAL_BACKOFF_MS * Math.pow(2, attempt) + Math.random() * 200
  await new Promise((r) => setTimeout(r, delay))
}

async function fetchWithRetry(url: string, options: RequestInit, attempt = 0): Promise<Response> {
  try {
    const res = await fetch(url, options)
    if (!res.ok && res.status >= 500 && attempt < MAX_RETRIES - 1) {
      await sleep(attempt)
      return fetchWithRetry(url, options, attempt + 1)
    }
    return res
  } catch (err) {
    if (attempt < MAX_RETRIES - 1) {
      await sleep(attempt)
      return fetchWithRetry(url, options, attempt + 1)
    }
    throw err
  }
}

async function checkQuota(supabase: ReturnType<typeof createClient>, userId: string): Promise<{ allowed: boolean; message?: string }> {
  const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW_MS).toISOString()
  const { count, error } = await supabase
    .from('openclaw_usage')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('operation_type', 'generate')
    .gte('created_at', windowStart)

  if (error) return { allowed: false, message: 'Quota check failed' }
  if ((count ?? 0) >= DAILY_QUOTA) {
    return { allowed: false, message: `Daily generation quota (${DAILY_QUOTA}) exceeded` }
  }
  return { allowed: true }
}

async function recordUsage(supabase: ReturnType<typeof createClient>, userId: string, tokens = 0): Promise<void> {
  await supabase.from('openclaw_usage').insert({
    user_id: userId,
    operation_type: 'generate',
    tokens_used: tokens,
  })
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const authHeader = req.headers.get('Authorization')
  if (!authHeader) {
    return new Response(
      JSON.stringify({ error: 'Unauthorized' }),
      { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  const openclawApiUrl = Deno.env.get('OPENCLAW_API_URL') ?? ''

  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''))

  if (authError || !user) {
    return new Response(
      JSON.stringify({ error: 'Invalid or expired token' }),
      { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  try {
    const body = await req.json()
    const { prompt, output_type, job_id } = body

    if (!prompt || typeof prompt !== 'string') {
      return new Response(
        JSON.stringify({ error: 'prompt is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const type = output_type ?? 'article'
    if (!OUTPUT_TYPES.includes(type)) {
      return new Response(
        JSON.stringify({ error: `output_type must be one of: ${OUTPUT_TYPES.join(', ')}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const sanitizedPrompt = prompt.trim().slice(0, 2000)

    const quotaCheck = await checkQuota(supabase, user.id)
    if (!quotaCheck.allowed) {
      return new Response(
        JSON.stringify({ error: quotaCheck.message }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    let content = ''
    let confidence = 0.88

    if (openclawApiUrl) {
      try {
        const res = await fetchWithRetry(`${openclawApiUrl}/generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: sanitizedPrompt, output_type: type }),
        })
        if (res.ok) {
          const data = await res.json()
          content = data.content ?? ''
          confidence = Math.max(MIN_CONFIDENCE_THRESHOLD, Math.min(1, data.confidence ?? 0.88))
        }
      } catch {
        // Fall through to mock
      }
    }

    if (!content) {
      content = `[Generated ${type}]\n\nBased on: "${sanitizedPrompt}"\n\nThis is a placeholder generated content. Connect your OpenClaw API to see real outputs.`
    }

    const { data: output, error: insertError } = await supabase
      .from('openclaw_generated_outputs')
      .insert({
        user_id: user.id,
        job_id: job_id ?? null,
        output_type: type,
        content,
        confidence_score: confidence,
        approved: false,
      })
      .select()
      .single()

    if (insertError) {
      return new Response(
        JSON.stringify({ error: insertError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    await recordUsage(supabase, user.id, content.length)

    return new Response(
      JSON.stringify({
        output_id: output.id,
        output,
        confidence_score: confidence,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    return new Response(
      JSON.stringify({
        error: err instanceof Error ? err.message : 'Unknown error',
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
