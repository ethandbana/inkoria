import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Not authenticated' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }
    const supabase = createClient(supabaseUrl, supabaseAnonKey, { global: { headers: { Authorization: authHeader } } })
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Not authenticated' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const rawDailyApiKey = Deno.env.get('DAILY_API_KEY') ?? ''
    const dailyApiKey = rawDailyApiKey
      .trim()
      .replace(/^['\"]|['\"]$/g, '')
      .replace(/^Bearer\s+/i, '')

    if (!dailyApiKey) {
      return new Response(JSON.stringify({ error: 'Daily API key not configured' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const body = await req.json()
    const { partnerId, callType } = body

    if (typeof partnerId !== 'string' || !partnerId || (callType !== 'audio' && callType !== 'video')) {
      return new Response(JSON.stringify({ error: 'Invalid request payload' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const normalizedCallType = callType === 'video' ? 'video' : 'audio'

    const roomName = `inkoria-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`

    const roomRes = await fetch('https://api.daily.co/v1/rooms', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${dailyApiKey}`,
      },
      body: JSON.stringify({
        name: roomName.substring(0, 64),
        properties: {
          exp: Math.floor(Date.now() / 1000) + 3600,
          enable_chat: true,
          enable_knocking: false,
          start_video_off: normalizedCallType === 'audio',
          start_audio_off: false,
        },
      }),
    })

    if (!roomRes.ok) {
      const errText = await roomRes.text()
      console.error('Daily API error:', {
        status: roomRes.status,
        detail: errText,
        keyLength: dailyApiKey.length,
        normalizedSecret: rawDailyApiKey !== dailyApiKey,
      })
      return new Response(JSON.stringify({ error: 'Failed to create room', detail: errText }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const room = await roomRes.json()

    // Notify the partner about the incoming call
    await supabase.from('notifications').insert({
      user_id: partnerId,
      from_user_id: user.id,
      title: normalizedCallType === 'video' ? '📹 Incoming Video Call' : '📞 Incoming Voice Call',
      body: `You have an incoming ${normalizedCallType} call`,
      type: 'call',
      link: room.url,
    })

    return new Response(JSON.stringify({ url: room.url, name: room.name }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (err) {
    console.error('Error:', err)
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
})
