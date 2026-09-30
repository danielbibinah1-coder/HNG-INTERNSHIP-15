import { randomBytes, randomUUID, scryptSync, timingSafeEqual } from 'node:crypto'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import jwt from 'jsonwebtoken'
import { findUserById } from './db.js'

const here = dirname(fileURLToPath(import.meta.url))

/* ------------------------------------------------------------------ *
 * Passwords — scrypt with a per-user random salt (no native builds).
 * Stored as: scrypt$N$r$p$<salt base64>$<hash base64>
 * ------------------------------------------------------------------ */
const SCRYPT_N = 16384
const SCRYPT_R = 8
const SCRYPT_P = 1
const KEY_LENGTH = 64

export function hashPassword(password) {
  const salt = randomBytes(16)
  const hash = scryptSync(password, salt, KEY_LENGTH, {
    N: SCRYPT_N,
    r: SCRYPT_R,
    p: SCRYPT_P,
    maxmem: 64 * 1024 * 1024,
  })
  return ['scrypt', SCRYPT_N, SCRYPT_R, SCRYPT_P, salt.toString('base64'), hash.toString('base64')].join('$')
}

export function verifyPassword(password, stored) {
  if (typeof stored !== 'string') return false
  const parts = stored.split('$')
  if (parts.length !== 6 || parts[0] !== 'scrypt') return false

  const [, n, r, p, saltB64, hashB64] = parts
  const salt = Buffer.from(saltB64, 'base64')
  const expected = Buffer.from(hashB64, 'base64')

  const actual = scryptSync(password, salt, expected.length, {
    N: Number(n),
    r: Number(r),
    p: Number(p),
    maxmem: 64 * 1024 * 1024,
  })
  // Constant-time compare; buffers are equal length by construction.
  return actual.length === expected.length && timingSafeEqual(actual, expected)
}

/* ------------------------------------------------------------------ *
 * Sessions — stateless HS256 JWTs.
 * The signing secret comes from JWT_SECRET, or a generated dev secret
 * file (git-ignored) so local sessions survive server restarts.
 * ------------------------------------------------------------------ */
function resolveSecret() {
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length >= 16) return process.env.JWT_SECRET

  const secretFile = process.env.JWT_SECRET_FILE || join(here, '.jwt-secret')
  if (existsSync(secretFile)) return readFileSync(secretFile, 'utf8').trim()

  const generated = randomBytes(48).toString('hex')
  writeFileSync(secretFile, generated, { mode: 0o600 })
  return generated
}

const JWT_SECRET = resolveSecret()
const TOKEN_TTL = process.env.JWT_TTL || '7d'

export function signToken(user) {
  return jwt.sign({ sub: user.id, email: user.email, name: user.name }, JWT_SECRET, {
    expiresIn: TOKEN_TTL,
    issuer: 'taskmaster',
  })
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET, { issuer: 'taskmaster' })
  } catch {
    return null
  }
}

export function newUserId() {
  return randomUUID()
}

/** Express middleware — attaches req.user or replies 401. */
export function requireAuth(req, res, next) {
  const header = req.get('authorization') || ''
  const [scheme, token] = header.split(' ')

  if (!token || scheme.toLowerCase() !== 'bearer') {
    return res.status(401).json({
      ok: false,
      error: { code: 'not_authenticated', message: 'Sign in to continue.' },
    })
  }

  const payload = verifyToken(token)
  const user = payload ? findUserById(payload.sub) : null

  if (!user) {
    return res.status(401).json({
      ok: false,
      error: { code: 'session_expired', message: 'Your session expired — please sign in again.' },
    })
  }

  req.user = user
  return next()
}

/* ------------------------------------------------------------------ *
 * Throttling — in-memory fixed window per email+IP key.
 * ------------------------------------------------------------------ */
const WINDOW_MS = 15 * 60 * 1000
const MAX_ATTEMPTS = 10
const attempts = new Map()

export function throttled(key) {
  const entry = attempts.get(key)
  if (!entry) return false
  if (Date.now() - entry.firstAt > WINDOW_MS) {
    attempts.delete(key)
    return false
  }
  return entry.count >= MAX_ATTEMPTS
}

export function recordFailedAttempt(key) {
  const entry = attempts.get(key)
  if (!entry || Date.now() - entry.firstAt > WINDOW_MS) {
    attempts.set(key, { count: 1, firstAt: Date.now() })
    return
  }
  entry.count += 1
}

export function clearAttempts(key) {
  attempts.delete(key)
}
