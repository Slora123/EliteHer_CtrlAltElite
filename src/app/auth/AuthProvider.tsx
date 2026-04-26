import type { Session } from '@supabase/supabase-js'
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { assertEnv } from '../../lib/env'
import { getCurrentPosition } from '../../lib/location'
import { supabase } from '../../lib/supabase'

type AuthCtx = {
  session: Session | null
  loading: boolean
  signOut: () => Promise<void>
}

const Ctx = createContext<AuthCtx | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (assertEnv().length) {
      setSession(null)
      setLoading(false)
      return
    }

    let ignore = false
    ;(async () => {
      const { data } = await supabase.auth.getSession()
      if (ignore) return

      if (data.session) {
        setSession(data.session)
        setLoading(false)
        return
      }

      // No login UI: automatically create an anonymous user session.
      // Requires enabling "Anonymous Sign-ins" in Supabase Auth settings.
      const anon = await supabase.auth.signInAnonymously()
      if (ignore) return
      setSession(anon.data.session ?? null)
      setLoading(false)
    })().catch(() => {
      if (ignore) return
      setSession(null)
      setLoading(false)
    })

    const { data: sub } = supabase.auth.onAuthStateChange((_evt, s) => {
      setSession(s)
      setLoading(false)
    })

    return () => {
      ignore = true
      sub.subscription.unsubscribe()
    }
  }, [])

  // Presence heartbeat (backend complete): update user_presence periodically.
  useEffect(() => {
    if (!session) return
    let cancelled = false

    const beat = async () => {
      try {
        let lat: number | undefined
        let lng: number | undefined
        try {
          const p = await getCurrentPosition()
          lat = p.coords.latitude
          lng = p.coords.longitude
        } catch {
          // location optional
        }
        await supabase.functions.invoke('presence-heartbeat', { body: { lat, lng } })
      } catch {
        // ignore if function not deployed yet
      }
    }

    void beat()
    const t = window.setInterval(() => {
      if (cancelled) return
      void beat()
    }, 3 * 60 * 1000) // every 3 minutes

    return () => {
      cancelled = true
      window.clearInterval(t)
    }
  }, [session])

  const value = useMemo<AuthCtx>(
    () => ({
      session,
      loading,
      signOut: async () => {
        await supabase.auth.signOut()
      },
    }),
    [session, loading],
  )

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useAuth() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
