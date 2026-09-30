import { createClient } from '@supabase/supabase-js'
import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * Single, shared Supabase client.
 *
 * Credentials come from Vite env vars (see `.env.example`) — never hardcoded:
 *   VITE_SUPABASE_URL      Project URL → Project Settings → API
 *   VITE_SUPABASE_ANON_KEY Project URL → Project Settings → API → anon public key
 *
 * The client is only created when both are present, so the app still boots (and
 * renders the landing page and auth screens) on a fresh clone without secrets.
 *
 * `persistSession: true` is what keeps a signed-in visitor signed in after a
 * browser refresh; `detectSessionInUrl` picks up the OAuth / password-recovery
 * callback that Supabase appends to the redirect URL.
 */
const SUPABASE_URL = String(import.meta.env.VITE_SUPABASE_URL ?? '').trim()
const SUPABASE_ANON_KEY = String(import.meta.env.VITE_SUPABASE_ANON_KEY ?? '').trim()

/** Storage key used for the persisted Supabase session. */
export const SUPABASE_STORAGE_KEY = 'taskmaster.supabase.auth'

export const isSupabaseConfigured = SUPABASE_URL.length > 0 && SUPABASE_ANON_KEY.length > 0

/** Missing-env guard. Thrown by the auth service so UI code can show a clear message. */
export class SupabaseNotConfiguredError extends Error {
  constructor() {
    super('Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file.')
    this.name = 'SupabaseNotConfiguredError'
  }
}

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: 'pkce',
        storageKey: SUPABASE_STORAGE_KEY,
      },
    })
  : null

/** Returns the client, or throws a helpful error when the env vars are missing. */
export function requireSupabase(): SupabaseClient {
  if (!supabase) throw new SupabaseNotConfiguredError()
  return supabase
}
