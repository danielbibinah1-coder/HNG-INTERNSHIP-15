import { mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { DatabaseSync } from 'node:sqlite'

const here = dirname(fileURLToPath(import.meta.url))

/** SQLite file location (override with DATABASE_FILE for tests/deploys). */
export const DB_PATH = process.env.DATABASE_FILE || join(here, 'data.sqlite')

mkdirSync(dirname(DB_PATH), { recursive: true })

const db = new DatabaseSync(DB_PATH)

db.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA foreign_keys = ON;

  CREATE TABLE IF NOT EXISTS users (
    id            TEXT PRIMARY KEY,
    name          TEXT NOT NULL,
    email         TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at    INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS workspaces (
    user_id    TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    state      TEXT NOT NULL,
    updated_at INTEGER NOT NULL
  );
`)

const insertUser = db.prepare(
  'INSERT INTO users (id, name, email, password_hash, created_at) VALUES (?, ?, ?, ?, ?)',
)
const selectUserByEmail = db.prepare('SELECT * FROM users WHERE email = ?')
const selectUserById = db.prepare('SELECT * FROM users WHERE id = ?')
const selectWorkspace = db.prepare('SELECT state, updated_at FROM workspaces WHERE user_id = ?')
const upsertWorkspace = db.prepare(
  `INSERT INTO workspaces (user_id, state, updated_at) VALUES (?, ?, ?)
   ON CONFLICT(user_id) DO UPDATE SET state = excluded.state, updated_at = excluded.updated_at`,
)

/** Strip the password hash before a user object ever reaches a response body. */
function toPublicUser(row) {
  if (!row) return null
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    createdAt: Number(row.created_at),
  }
}

export function createUser({ id, name, email, passwordHash }) {
  const createdAt = Date.now()
  insertUser.run(id, name, email, passwordHash, createdAt)
  return { id, name, email, createdAt }
}

export function findUserByEmail(email) {
  return toPublicUser(selectUserByEmail.get(email))
}

/** Includes password_hash — only for the login path. */
export function findUserRecordByEmail(email) {
  return selectUserByEmail.get(email) ?? null
}

export function findUserById(id) {
  return toPublicUser(selectUserById.get(id))
}

/**
 * Resolves the local user row for a Supabase identity.
 *
 * Supabase owns passwords now, so there is nothing to hash — we only need a
 * stable row to hang the workspace off. If the same email already has a row
 * (created through the API's own sign-up), that row is reused so its workspace
 * is not orphaned.
 */
export function findOrCreateSupabaseUser({ id, email, name }) {
  const existingById = findUserById(id)
  if (existingById) return existingById

  const existingByEmail = email ? findUserByEmail(email) : null
  if (existingByEmail) return existingByEmail

  return createUser({
    id,
    name: name?.trim() || (email ? email.split('@')[0] : 'Member'),
    email: email || `${id}@supabase.local`,
    passwordHash: '',
  })
}

export function getWorkspace(userId) {
  const row = selectWorkspace.get(userId)
  if (!row) return { state: null, updatedAt: null }
  let state = null
  try {
    state = JSON.parse(row.state)
  } catch {
    state = null
  }
  return { state, updatedAt: Number(row.updated_at) }
}

export function saveWorkspace(userId, state) {
  const updatedAt = Date.now()
  upsertWorkspace.run(userId, JSON.stringify(state), updatedAt)
  return updatedAt
}

export function closeDatabase() {
  db.close()
}
