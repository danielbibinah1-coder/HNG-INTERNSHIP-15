/**
 * Thin client for the TaskMaster API (see `server/`).
 *
 * Requests are relative by default, which works in development because Vite
 * proxies `/api` to http://localhost:4000. Point VITE_API_URL at a deployed
 * API origin when the client is hosted separately.
 */

export interface ApiUser {
  id: string
  name: string
  email: string
  createdAt: number
}

export interface AuthSession {
  token: string
  user: ApiUser
}

interface ApiErrorBody {
  code?: string
  message?: string
  fields?: Record<string, string>
}

interface AuthResponse extends AuthSession {
  ok: boolean
}

export interface WorkspaceResponse {
  ok: boolean
  state: unknown | null
  updatedAt: number | null
}

/** Error carrying the API's machine-readable code and per-field messages. */
export class ApiError extends Error {
  readonly status: number
  readonly code: string
  readonly fields: Record<string, string> | undefined

  constructor(status: number, body: ApiErrorBody | null, fallback: string) {
    super(body?.message || fallback)
    this.name = 'ApiError'
    this.status = status
    this.code = body?.code ?? 'unknown_error'
    this.fields = body?.fields
  }
}

const BASE_URL = String(import.meta.env.VITE_API_URL ?? '').replace(/\/+$/, '')
const SESSION_KEY = 'taskmaster.auth.v1'

function readFrom(pick: () => Storage): AuthSession | null {
  try {
    const raw = pick().getItem(SESSION_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<AuthSession> | null
    if (!parsed || typeof parsed.token !== 'string' || !parsed.user) return null
    return { token: parsed.token, user: parsed.user }
  } catch {
    return null
  }
}

/** Reads the stored session, preferring a persistent ("remember me") one. */
export function readSession(): AuthSession | null {
  return readFrom(() => localStorage) ?? readFrom(() => sessionStorage)
}

/**
 * Stores the session. `remember: false` keeps it in sessionStorage, so closing
 * the browser signs the visitor out.
 */
export function writeSession(session: AuthSession | null, remember = true): void {
  try {
    if (!session) {
      localStorage.removeItem(SESSION_KEY)
      sessionStorage.removeItem(SESSION_KEY)
      return
    }
    const target = remember ? localStorage : sessionStorage
    const other = remember ? sessionStorage : localStorage
    other.removeItem(SESSION_KEY)
    target.setItem(SESSION_KEY, JSON.stringify(session))
  } catch {
    /* storage unavailable — the in-memory session still works */
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  body?: unknown
  token?: string | null
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, token } = options
  const headers: Record<string, string> = { Accept: 'application/json' }
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  if (token) headers.Authorization = `Bearer ${token}`

  let response: Response
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  } catch {
    throw new ApiError(0, { code: 'network_error', message: 'Cannot reach the TaskMaster API.' }, 'Network error')
  }

  const text = await response.text()
  let payload: unknown = null
  if (text) {
    try {
      payload = JSON.parse(text)
    } catch {
      payload = null
    }
  }

  if (!response.ok) {
    const errorBody = (payload as { error?: ApiErrorBody } | null)?.error ?? null
    throw new ApiError(response.status, errorBody, `Request failed with status ${response.status}.`)
  }

  return payload as T
}

export const api = {
  register: (name: string, email: string, password: string) =>
    request<AuthResponse>('/api/auth/register', { method: 'POST', body: { name, email, password } }),

  login: (email: string, password: string) =>
    request<AuthResponse>('/api/auth/login', { method: 'POST', body: { email, password } }),

  me: (token: string) => request<{ ok: boolean; user: ApiUser }>('/api/auth/me', { token }),

  logout: (token: string) => request<{ ok: boolean }>('/api/auth/logout', { method: 'POST', token }),

  loadWorkspace: (token: string) => request<WorkspaceResponse>('/api/workspace', { token }),

  saveWorkspace: (token: string, state: unknown) =>
    request<{ ok: boolean; updatedAt: number }>('/api/workspace', { method: 'PUT', body: { state }, token }),
}
