import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import type { ApiUser } from './api'
import { isSupabaseConfigured } from './lib/supabase'
import { authService, toApiUser } from './services/auth-service'
import type { SignUpResult } from './services/auth-service'

export { AuthServiceError } from './services/auth-service'
export type { SignUpResult, AuthStatus } from './services/auth-service'

export interface AuthContextValue {
  /** The signed-in user, or null. */
  user: ApiUser | null
  /** Supabase access token — the API accepts it as a bearer credential. */
  token: string | null
  /** 'loading' while Supabase resolves the persisted session on boot. */
  status: 'loading' | 'authenticated' | 'unauthenticated'
  /** False until the persisted session has been resolved on boot. */
  ready: boolean
  /** True only after a deliberate sign-out, so the route guard can send the visitor home. */
  signedOut: boolean
  /** False when VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY are missing. */
  configured: boolean
  signIn: (email: string, password: string, remember?: boolean) => Promise<ApiUser>
  signUp: (name: string, email: string, password: string, remember?: boolean) => Promise<SignUpResult>
  signInWithGoogle: () => Promise<void>
  sendPasswordReset: (email: string) => Promise<void>
  /** Re-sends the "verify your email" message from the Check your email screen. */
  resendVerificationEmail: (email: string) => Promise<void>
  signOut: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

/**
 * Session state on top of Supabase Auth.
 *
 * The provider resolves the persisted session on boot (so a refresh keeps the
 * visitor signed in) and then follows Supabase's auth events. Every screen that
 * needs identity should call `useAuth()` rather than importing the service.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [ready, setReady] = useState(!isSupabaseConfigured)
  const [signedOut, setSignedOut] = useState(false)

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setReady(true)
      return
    }

    let active = true

    authService
      .getSession()
      .then((current) => {
        if (!active) return
        setSession(current)
        if (current) setSignedOut(false)
      })
      .finally(() => {
        if (active) setReady(true)
      })

    const unsubscribe = authService.subscribe((next) => {
      if (!active) return
      setSession(next)
      setReady(true)
      /* A null session here means "expired, revoked, or never had one" — not a
         deliberate sign-out, so the flag is only cleared when a session arrives.
         Setting it on boot would bounce signed-out visitors from /app to the
         marketing page instead of the sign-in form. */
      if (next) setSignedOut(false)
    })

    return () => {
      active = false
      unsubscribe()
    }
  }, [])

  const user = useMemo(() => (session?.user ? toApiUser(session.user) : null), [session])

  const signIn = useCallback(async (email: string, password: string, remember = true) => {
    const signedInUser = await authService.signInWithEmail(email, password, remember)
    setSignedOut(false)
    return signedInUser
  }, [])

  const signUp = useCallback(async (name: string, email: string, password: string, remember = true) => {
    const result = await authService.signUpWithEmail(name, email, password, remember)
    if (result.user) setSignedOut(false)
    return result
  }, [])

  const signInWithGoogle = useCallback(async () => {
    setSignedOut(false)
    await authService.signInWithGoogle()
  }, [])

  const sendPasswordReset = useCallback(async (email: string) => {
    await authService.sendPasswordReset(email)
  }, [])

  const resendVerificationEmail = useCallback(async (email: string) => {
    await authService.resendVerificationEmail(email)
  }, [])

  const signOut = useCallback(() => {
    void authService.signOut()
    setSession(null)
    setSignedOut(true)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token: session?.access_token ?? null,
      status: ready ? (user ? 'authenticated' : 'unauthenticated') : 'loading',
      ready,
      signedOut,
      configured: isSupabaseConfigured,
      signIn,
      signUp,
      signInWithGoogle,
      sendPasswordReset,
      resendVerificationEmail,
      signOut,
    }),
    [
      user,
      session,
      ready,
      signedOut,
      signIn,
      signUp,
      signInWithGoogle,
      sendPasswordReset,
      resendVerificationEmail,
      signOut,
    ],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}

/** Initials for the avatar chips ("Ada Lovelace" -> "AL"). */
export function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

