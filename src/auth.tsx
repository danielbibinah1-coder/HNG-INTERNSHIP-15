import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { api, readSession, writeSession } from './api'
import type { ApiUser, AuthSession } from './api'

interface AuthContextValue {
  user: ApiUser | null
  token: string | null
  /** False until the stored session has been validated on boot. */
  ready: boolean
  /** True only after a deliberate sign-out, so the route guard can send the visitor home. */
  signedOut: boolean
  signIn: (email: string, password: string, remember?: boolean) => Promise<ApiUser>
  signUp: (name: string, email: string, password: string, remember?: boolean) => Promise<ApiUser>
  signOut: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(readSession)
  const [ready, setReady] = useState(false)
  const [signedOut, setSignedOut] = useState(false)

  /* Revalidate a stored token once on boot so stale sessions drop out cleanly. */
  useEffect(() => {
    let cancelled = false
    const stored = readSession()

    if (!stored) {
      setReady(true)
      return
    }

    api
      .me(stored.token)
      .then((response) => {
        if (!cancelled) setSession({ token: stored.token, user: response.user })
      })
      .catch(() => {
        if (!cancelled) {
          writeSession(null)
          setSession(null)
        }
      })
      .finally(() => {
        if (!cancelled) setReady(true)
      })

    return () => {
      cancelled = true
    }
  }, [])

  const adopt = useCallback((next: AuthSession, remember: boolean) => {
    writeSession(next, remember)
    setSession(next)
    setSignedOut(false)
    return next.user
  }, [])

  const signIn = useCallback(
    async (email: string, password: string, remember = true) => {
      const response = await api.login(email, password)
      return adopt({ token: response.token, user: response.user }, remember)
    },
    [adopt],
  )

  const signUp = useCallback(
    async (name: string, email: string, password: string, remember = true) => {
      const response = await api.register(name, email, password)
      return adopt({ token: response.token, user: response.user }, remember)
    },
    [adopt],
  )

  const signOut = useCallback(() => {
    const current = readSession()
    if (current) void api.logout(current.token).catch(() => undefined)
    writeSession(null)
    setSession(null)
    setSignedOut(true)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user: session?.user ?? null,
      token: session?.token ?? null,
      ready,
      signedOut,
      signIn,
      signUp,
      signOut,
    }),
    [session, ready, signedOut, signIn, signUp, signOut],
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
