import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders })
  }

  const authHeader = req.headers.get('Authorization')
  if (!authHeader) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''))

  if (authError || !user) {
    return new Response(
      JSON.stringify({ error: 'Invalid or expired token' }),
      {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }

  try {
    const url = new URL(req.url)
    const action = url.searchParams.get('action') ?? 'get'

    if (req.method === 'GET' && action === 'usage') {
      const windowStart = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      const { data: rows, error } = await supabase
        .from('openclaw_usage_accounting')
        .select('id, tokens_used, api_calls, cost_units, created_at')
        .eq('user_id', user.id)
        .gte('created_at', windowStart)
        .order('created_at', { ascending: false })

      if (error) throw error

      const totalApiCalls = (rows ?? []).reduce((acc, r) => acc + (r.api_calls ?? 0), 0)
      const totalTokens = (rows ?? []).reduce((acc, r) => acc + (r.tokens_used ?? 0), 0)
      const totalCost = (rows ?? []).reduce(
        (acc, r) => acc + Number(r.cost_units ?? 0),
        0
      )

      return new Response(
        JSON.stringify({
          api_calls_24h: totalApiCalls,
          tokens_used_24h: totalTokens,
          cost_units_24h: totalCost,
          records: rows ?? [],
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    if (req.method === 'GET' && action === 'get') {
      const jobId = url.searchParams.get('job_id')
      if (!jobId) {
        return new Response(
          JSON.stringify({ error: 'job_id is required' }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        )
      }

      const { data: job, error } = await supabase
        .from('openclaw_research_jobs')
        .select('*')
        .eq('id', jobId)
        .eq('user_id', user.id)
        .single()

      if (error || !job) {
        return new Response(
          JSON.stringify({ error: 'Job not found' }),
          {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        )
      }

      return new Response(JSON.stringify({ job }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (req.method === 'POST') {
      const body = await req.json().catch(() => ({}))
      const { action: bodyAction, job_id } = body
      const act = bodyAction ?? url.searchParams.get('action')

      if (act === 'cancel' && job_id) {
        const { data: job, error: updateError } = await supabase
          .from('openclaw_research_jobs')
          .update({
            status: 'cancelled',
            updated_at: new Date().toISOString(),
          })
          .eq('id', job_id)
          .eq('user_id', user.id)
          .select()
          .single()

        if (updateError || !job) {
          return new Response(
            JSON.stringify({ error: 'Job not found or already completed' }),
            {
              status: 404,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
          )
        }

        return new Response(
          JSON.stringify({ success: true, job, message: 'Job cancelled' }),
          {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        )
      }

      if (act === 'list') {
        const limit = Math.min(Number(body.limit) || 20, 100)
        const offset = Number(body.offset) || 0
        const statusFilter = body.status

        let query = supabase
          .from('openclaw_research_jobs')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .range(offset, offset + limit - 1)

        if (statusFilter && typeof statusFilter === 'string') {
          query = query.eq('status', statusFilter)
        }

        const { data: jobs, error: listError } = await query

        if (listError) throw listError

        return new Response(
          JSON.stringify({ jobs: jobs ?? [], count: (jobs ?? []).length }),
          {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        )
      }
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action or method' }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } catch (err) {
    return new Response(
      JSON.stringify({
        error: err instanceof Error ? err.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
