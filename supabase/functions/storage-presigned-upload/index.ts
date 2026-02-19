import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

const ALLOWED_CONTENT_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'video/mp4',
  'video/webm',
  'audio/mpeg',
  'audio/wav',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
  'text/csv',
]

const BUCKET = 'assets'

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
    const { filename, content_type, size_bytes, folder_id } = body

    if (!filename || !content_type) {
      return new Response(
        JSON.stringify({ error: 'filename and content_type are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!ALLOWED_CONTENT_TYPES.includes(content_type)) {
      return new Response(
        JSON.stringify({ error: 'Content type not allowed' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const sanitized = filename.replace(/[^a-zA-Z0-9._-]/g, '_')
    const assetId = crypto.randomUUID()
    const version = 1
    const storagePath = `${user.id}/${assetId}/v${version}/${Date.now()}_${sanitized}`

    let signedData: { signedUrl?: string; path?: string; token?: string } | null = null
    try {
      const result = await supabase.storage
        .from(BUCKET)
        .createSignedUploadUrl(storagePath)
      signedData = result.data
    } catch {
      signedData = null
    }

    const { data: insertedAsset, error: insertError } = await supabase
      .from('file_assets')
      .insert({
        user_id: user.id,
        folder_id: folder_id || null,
        storage_path: storagePath,
        filename: sanitized,
        content_type,
        size_bytes: size_bytes ?? 0,
        version,
        status: 'pending',
      })
      .select('id')
      .single()

    if (insertError) {
      return new Response(
        JSON.stringify({ error: insertError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const uploadUrl = signedData?.signedUrl ?? signedData?.path
    return new Response(
      JSON.stringify({
        asset_id: insertedAsset?.id,
        path: storagePath,
        upload_url: uploadUrl ?? null,
        token: signedData?.token ?? null,
        use_direct_upload: !uploadUrl,
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
