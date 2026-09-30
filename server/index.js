import './load-env.js' // must stay first: loads .env before the modules below read it
import { existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import express from 'express'
import {
  clearAttempts,
  hashPassword,
  newUserId,
  recordFailedAttempt,
  requireAuth,
  signToken,
  throttled,
  verifyPassword,
} from './auth.js'
import {
  createUser,
  findUserByEmail,
  findUserRecordByEmail,
  getWorkspace,
  saveWorkspace,
} from './db.js'
import { normalizeEmail, validateLogin, validateRegistration, validateWorkspaceState } from './validation.js'

const here = dirname(fileURLToPath(import.meta.url))
const clientDist = join(here, '..', 'dist')
const PORT = Number(process.env.PORT || 4000)

const app = express()
app.disable('x-powered-by')
app.use(express.json({ limit: '1mb' }))

/* ---------------- CORS (the Vite dev server is a different origin) ------------- */
const allowedOrigins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)

app.use((req, res, next) => {
  const origin = req.get('origin')
  if (origin && (allowedOrigins.length === 0 || allowedOrigins.includes(origin))) {
    res.set('Access-Control-Allow-Origin', allowedOrigins.length === 0 ? '*' : origin)
    res.set('Vary', 'Origin')
    res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    res.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    res.set('Access-Control-Max-Age', '600')
  }
  if (req.method === 'OPTIONS') return res.sendStatus(204)
  return next()
})

/* ---------------- tiny request log ---------------- */
app.use((req, _res, next) => {
  if (process.env.QUIET !== '1') {
    console.log(`${new Date().toISOString()} ${req.method} ${req.originalUrl}`)
  }
  next()
})

const fail = (res, status, code, message, extra) =>
  res.status(status).json({ ok: false, error: { code, message, ...extra } })

const clientKey = (req) => `${req.ip || 'local'}:${normalizeEmail(req.body?.email)}`

/* =============================== auth API =============================== */

app.post('/api/auth/register', (req, res) => {
  const { name, email, password } = req.body ?? {}
  const errors = validateRegistration({ name, email, password })

  if (Object.keys(errors).length > 0) {
    return fail(res, 400, 'validation_error', 'Please fix the highlighted fields.', { fields: errors })
  }

  const normalizedEmail = normalizeEmail(email)
  if (findUserByEmail(normalizedEmail)) {
    return fail(res, 409, 'email_taken', 'That email is already registered — try signing in instead.', {
      fields: { email: 'This email is already registered.' },
    })
  }

  const user = createUser({
    id: newUserId(),
    name: name.trim().replace(/\s+/g, ' '),
    email: normalizedEmail,
    passwordHash: hashPassword(password),
  })

  return res.status(201).json({ ok: true, token: signToken(user), user })
})

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body ?? {}
  const errors = validateLogin({ email, password })

  if (Object.keys(errors).length > 0) {
    return fail(res, 400, 'validation_error', 'Please fix the highlighted fields.', { fields: errors })
  }

  const key = clientKey(req)
  if (throttled(key)) {
    return fail(res, 429, 'too_many_attempts', 'Too many attempts. Wait a few minutes and try again.')
  }

  const record = findUserRecordByEmail(normalizeEmail(email))
  const valid = record ? verifyPassword(password, record.password_hash) : false

  if (!record || !valid) {
    recordFailedAttempt(key)
    return fail(res, 401, 'invalid_credentials', 'That email and password combination is incorrect.')
  }

  clearAttempts(key)
  const user = { id: record.id, name: record.name, email: record.email, createdAt: Number(record.created_at) }
  return res.json({ ok: true, token: signToken(user), user })
})

/* =============================== session API =============================== */

app.get('/api/auth/me', requireAuth, (req, res) => {
  res.json({ ok: true, user: req.user })
})

app.post('/api/auth/logout', requireAuth, (_req, res) => {
  // JWTs are stateless — the client drops the token. Kept for clarity/auditing.
  res.json({ ok: true })
})

/* ============================== workspace API ============================== */

app.get('/api/workspace', requireAuth, (req, res) => {
  const { state, updatedAt } = getWorkspace(req.user.id)
  res.json({ ok: true, state, updatedAt })
})

app.put('/api/workspace', requireAuth, (req, res) => {
  const problem = validateWorkspaceState(req.body?.state)
  if (problem) return fail(res, 400, 'validation_error', problem)
  const updatedAt = saveWorkspace(req.user.id, req.body.state)
  return res.json({ ok: true, updatedAt })
})

/* ================================ misc API ================================ */

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'taskmaster-api', time: new Date().toISOString() })
})

/* ---- serve the built client when dist/ exists (single-host deploys) ---- */
if (existsSync(clientDist)) {
  app.use(express.static(clientDist))
  app.use((req, res, next) => {
    if (req.method !== 'GET' || req.path.startsWith('/api/')) return next()
    return res.sendFile(join(clientDist, 'index.html'))
  })
}

/* ------------------------------- fallbacks ------------------------------- */
app.use((req, res) => fail(res, 404, 'not_found', `No route for ${req.method} ${req.path}`))

app.use((err, _req, res, _next) => {
  console.error('[server] unhandled error:', err)
  if (err?.type === 'entity.too.large') return fail(res, 413, 'payload_too_large', 'That payload is too large.')
  if (err instanceof SyntaxError) return fail(res, 400, 'bad_json', 'Request body was not valid JSON.')
  return fail(res, 500, 'server_error', 'Something went wrong on our side.')
})

const server = app.listen(PORT, () => {
  console.log(`TaskMaster API listening on http://localhost:${PORT}`)
})

function shutdown() {
  server.close(() => process.exit(0))
}
process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)
