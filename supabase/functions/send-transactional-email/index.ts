import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const SENDGRID_API_KEY = Deno.env.get('SENDGRID_API_KEY')
const FROM_EMAIL = Deno.env.get('FROM_EMAIL') ?? 'noreply@creatoropshub.com'

interface EmailPayload {
  to: string
  subject: string
  html: string
  type: 'verification' | 'password_reset'
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    })
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  if (!SENDGRID_API_KEY) {
    return new Response(
      JSON.stringify({ error: 'SendGrid not configured' }),
      { status: 503, headers: { 'Content-Type': 'application/json' } }
    )
  }

  try {
    const payload: EmailPayload = await req.json()

    const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${SENDGRID_API_KEY}`,
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: payload.to }] }],
        from: { email: FROM_EMAIL, name: 'CreatorOps Hub' },
        subject: payload.subject,
        content: [{ type: 'text/html', value: payload.html }],
      }),
    })

    if (!res.ok) {
      const errText = await res.text()
      return new Response(
        JSON.stringify({ error: 'SendGrid error', details: errText }),
        { status: 502, headers: { 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ success: true }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    )
  } catch (err) {
    return new Response(
      JSON.stringify({
        error: err instanceof Error ? err.message : 'Unknown error',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
