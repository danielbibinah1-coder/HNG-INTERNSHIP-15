import type { Session, User } from '@supabase/supabase-js'
import type { ApiUser } from '../api'
import { isSupabaseConfigured, requireSupabase, SUPABASE_STORAGE_KEY } from '../lib/supabase'

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated'

/** Auth failure with a message safe to show in the UI, plus optional field errors. */
export class AuthServiceError extends Error {
  readonly code: string
  readonly fields: Record<string, string> | undefined

  constructor(message: string, code = 'auth_error', fields?: Record<string, string>) {
    super(message)
    this.name = 'AuthServiceError'
    this.code = code
    this.fields = fields
  }
}

export interface SignUpResult {
  user: ApiUser | null
  /** True when Supabase created the account but requires email confirmation first. */
  needsEmailConfirmation: boolean
}

/** Maps a Supabase user onto the shape the rest of the app already consumes. */
export function toApiUser(user: User): ApiUser {
  const metadata = (user.user_metadata ?? {}) as Record<string, unknown>
  const fullName = typeof metadata.full_name === 'string' ? metadata.full_name.trim() : ''
  const givenName = typeof metadata.name === 'string' ? metadata.name.trim() : ''
  const emailName = user.email ? user.email.split('@')[0] : ''

  return {
    id: user.id,
    name: fullName || givenName || emailName || 'Member',
    email: user.email ?? '',
    createdAt: user.created_at ? new Date(user.created_at).getTime() : Date.now(),
  }
}

/** Where Supabase should send the visitor back to (hash routing friendly). */
function defaultRedirect(): string {
  if (typeof window === 'undefined') return '/'
  return `${window.location.origin}/#/`
}

/**
 * Supabase speaks a different vocabulary to our forms, so translate the raw
 * error codes into sentences that match what the UI already displays.
 */
function toServiceError(error: unknown, fallback: string): AuthServiceError {
  if (error instanceof AuthServiceError) return error

  const message = error instanceof Error ? error.message : ''
  const code = (error as { code?: string } | null)?.code ?? 'auth_error'

  if (code === 'invalid_credentials' || /invalid login credentials/i.test(message)) {
    return new AuthServiceError('That email and password combination is incorrect.', code)
  }
  if (code === 'email_exists' || /already registered|already been registered/i.test(message)) {
    return new AuthServiceError('That email is already registered — try signing in instead.', code, {
      email: 'This email is already registered.',
    })
  }
  if (code === 'email_not_confirmed' || /email not confirmed/i.test(message)) {
    return new AuthServiceError('Confirm your email address before signing in.', code)
  }
  if (/password should be at least/i.test(message) || code === 'weak_password') {
    return new AuthServiceError('Use at least 8 characters with a letter and a number.', code, {
      password: 'Use at least 8 characters with a letter and a number.',
    })
  }
  if (/rate limit|too many requests|security purposes/i.test(message)) {
    return new AuthServiceError('Too many attempts from here — please wait a minute and try again.', code)
  }
  if (/failed to fetch|network/i.test(message)) {
    return new AuthServiceError('Cannot reach Supabase. Check your connection and try again.', code)
  }

  return new AuthServiceError(message || fallback, code)
}

/**
 * "Keep me signed in" unchecked → drop the persisted copy so the session does
 * not survive a refresh. The in-memory session stays valid for this tab.
 */
function forgetPersistedSession(): void {
  try {
    window.localStorage.removeItem(SUPABASE_STORAGE_KEY)
  } catch {
    /* storage unavailable */
  }
}

/**
 * Thin, framework-agnostic wrapper around Supabase Auth.
 *
 * Everything the app needs to authenticate lives here; React code should use
 * `useAuth()` from `src/auth.tsx` instead of touching this module directly.
 */
export const authService = {
  isConfigured: (): boolean => isSupabaseConfigured,

  /** Resolves the persisted session on boot (refresh-safe). */
  getSession: async (): Promise<Session | null> => {
    if (!isSupabaseConfigured) return null
    try {
      const { data, error } = await requireSupabase().auth.getSession()
      if (error) return null
      return data.session ?? null
    } catch {
      return null
    }
  },

  /** Subscribes to auth events (SIGNED_IN, SIGNED_OUT, TOKEN_REFRESHED, …). */
  subscribe: (handler: (session: Session | null) => void): (() => void) => {
    if (!isSupabaseConfigured) return () => undefined
    const { data } = requireSupabase().auth.onAuthStateChange((_event, session) => {
      handler(session ?? null)
    })
    return () => data.subscription.unsubscribe()
  },

  signInWithEmail: async (email: string, password: string, remember = true): Promise<ApiUser> => {
    try {
      const { data, error } = await requireSupabase().auth.signInWithPassword({
        email: email.trim(),
        password,
      })
      if (error) throw toServiceError(error, 'Could not sign you in.')
      if (!data.user) throw new AuthServiceError('Could not sign you in.')
      if (!remember) forgetPersistedSession()
      return toApiUser(data.user)
    } catch (error) {
      throw toServiceError(error, 'Could not sign you in.')
    }
  },

  signUpWithEmail: async (
    name: string,
    email: string,
    password: string,
    remember = true,
  ): Promise<SignUpResult> => {
    try {
      const { data, error } = await requireSupabase().auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: { full_name: name.trim() },
          emailRedirectTo: defaultRedirect(),
        },
      })
      if (error) throw toServiceError(error, 'Could not create your account.')

      /* A session comes back when email confirmation is disabled. */
      const sessionUser = data.session?.user ?? null
      if (sessionUser) {
        if (!remember) forgetPersistedSession()
        return { user: toApiUser(sessionUser), needsEmailConfirmation: false }
      }

      return { user: null, needsEmailConfirmation: true }
    } catch (error) {
      throw toServiceError(error, 'Could not create your account.')
    }
  },

  /** Starts the Google OAuth flow — the browser navigates away from the app. */
  signInWithGoogle: async (): Promise<void> => {
    try {
      const { error } = await requireSupabase().auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: defaultRedirect() },
      })
      if (error) throw toServiceError(error, 'Google sign-in is unavailable right now.')
    } catch (error) {
      throw toServiceError(error, 'Google sign-in is unavailable right now.')
    }
  },

  sendPasswordReset: async (email: string): Promise<void> => {
    try {
      const { error } = await requireSupabase().auth.resetPasswordForEmail(email.trim(), {
        redirectTo: defaultRedirect(),
      })
      if (error) throw toServiceError(error, 'Could not send the reset email.')
    } catch (error) {
      throw toServiceError(error, 'Could not send the reset email.')
    }
  },

  signOut: async (): Promise<void> => {
    if (!isSupabaseConfigured) return
    await requireSupabase().auth.signOut().catch(() => undefined)
  },
}
