/// <reference lib="deno.ns" />

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

// Presence heartbeat (Edge Function)
// POST { lat?: number, lng?: number }
// Uses the caller's JWT so RLS applies.

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405)

  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')
  if (!supabaseUrl || !supabaseAnonKey) return json({ error: 'Supabase env missing' }, 500)

  const authHeader = req.headers.get('Authorization') ?? ''
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authHeader } },
  })

  const { data: userData, error: userErr } = await supabase.auth.getUser()
  if (userErr || !userData.user) return json({ error: 'Unauthorized' }, 401)

  const { lat, lng } = (await req.json().catch(() => ({}))) as { lat?: number; lng?: number }

  const { error } = await supabase
    .from('user_presence')
    .upsert(
      {
        user_id: userData.user.id,
        lat: typeof lat === 'number' ? lat : null,
        lng: typeof lng === 'number' ? lng : null,
        last_seen: new Date().toISOString(),
      },
      { onConflict: 'user_id' },
    )

  if (error) return json({ error: error.message }, 400)
  return json({ ok: true })
})

