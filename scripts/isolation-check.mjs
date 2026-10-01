/**
 * Proves one signed-in user can never read or overwrite another user's data.
 *
 * A throwaway API instance runs against a temporary SQLite file, so the dev
 * database is never touched. Supabase tokens resolve to a user id through the
 * same `requireAuth` path, so this covers them as well.
 *
 *   node scripts/isolation-check.mjs
 */
import { spawn } from 'node:child_process'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'

const PORT = 4187
const BASE = `http://127.0.0.1:${PORT}`
const PASSWORD = 'Isolation1pass'
const dir = mkdtempSync(join(tmpdir(), 'tm-iso-'))
const dbFile = join(dir, 'data.sqlite')

let failures = 0
const pass = (message) => console.log(`PASS  ${message}`)
const fail = (message) => {
  failures += 1
  console.log(`FAIL  ${message}`)
}
const check = (condition, message) => (condition ? pass(message) : fail(message))

async function api(path, { method = 'GET', token, body } = {}) {
  const response = await fetch(BASE + path, {
    method,
    headers: {
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  let json = null
  try {
    json = await response.json()
  } catch {
    /* non-JSON body */
  }
  return { status: response.status, json }
}

async function waitForApi() {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    try {
      const { status } = await api('/api/health')
      if (status === 200) return true
    } catch {
      /* not up yet */
    }
    await new Promise((resolve) => setTimeout(resolve, 100))
  }
  return false
}

const server = spawn(process.execPath, ['server/index.js'], {
  cwd: process.cwd(),
  env: { ...process.env, PORT: String(PORT), DATABASE_FILE: dbFile, CORS_ORIGIN: 'http://localhost:5173' },
  stdio: ['ignore', 'pipe', 'pipe'],
})

/** Captured so a failure explains itself instead of just reporting "not healthy". */
let serverLog = ''
server.stdout.on('data', (chunk) => {
  serverLog += chunk
})
server.stderr.on('data', (chunk) => {
  serverLog += chunk
})

/** Stops the child and waits for it, so the SQLite file is no longer locked. */
let stopped = false
/** Holds the db module once imported, so its handle can be closed before cleanup. */
let db = null
async function stopServer() {
  if (stopped) return
  stopped = true
  if (server.exitCode === null) {
    const exited = new Promise((resolve) => server.once('exit', resolve))
    server.kill()
    await Promise.race([exited, new Promise((resolve) => setTimeout(resolve, 3000))])
  }
}

const marker = (label) => ({
  tasks: [{ id: `${label}-task`, title: `${label} private task`, done: false, priority: 'high' }],
  projects: [{ id: `${label}-project`, name: `${label} project`, tasks: [] }],
  labels: [],
  filter: 'all',
  chat: [],
})

const titles = (json) => JSON.stringify(json?.state ?? {})
try {
  if (!(await waitForApi())) {
    fail(`API never became healthy on ${BASE}`)
    if (serverLog.trim()) console.log(serverLog.trim())
  } else {
    /* Two independent accounts. */
    const stamp = Date.now()
    const ada = await api('/api/auth/register', {
      method: 'POST',
      body: { name: 'Ada Tester', email: `iso-ada-${stamp}@example.com`, password: PASSWORD },
    })
    const bob = await api('/api/auth/register', {
      method: 'POST',
      body: { name: 'Bob Tester', email: `iso-bob-${stamp}@example.com`, password: PASSWORD },
    })
    const tokenA = ada.json?.token
    const tokenB = bob.json?.token
    const idA = ada.json?.user?.id
    const idB = bob.json?.user?.id

    check(Boolean(tokenA && tokenB && idA && idB && idA !== idB), 'two distinct accounts exist')
    check(ada.status === 201 && bob.status === 201, 'both accounts were created')

    const saved = await api('/api/workspace', {
      method: 'PUT',
      token: tokenA,
      body: { state: marker('ada') },
    })
    check(saved.status === 200, 'user A saved their workspace')

    const bSees = await api('/api/workspace', { token: tokenB })
    check(bSees.status === 200, 'user B can read their own (empty) workspace')
    check(!titles(bSees.json).includes('ada private task'), 'user B cannot see user A tasks or projects')

    await api('/api/workspace', { method: 'PUT', token: tokenB, body: { state: marker('bob') } })
    const aAfter = await api('/api/workspace', { token: tokenA })
    check(
      titles(aAfter.json).includes('ada private task') && !titles(aAfter.json).includes('bob private task'),
      'user B saving does not change the user A workspace',
    )
    const bOwn = await api('/api/workspace', { token: tokenB })
    check(titles(bOwn.json).includes('bob private task'), 'user B reads back their own data')

    const forged = await api('/api/workspace', {
      method: 'PUT',
      token: tokenB,
      body: { userId: idA, state: marker('forged') },
    })
    const aAfterForgery = await api('/api/workspace', { token: tokenA })
    check(
      forged.status === 200 && !titles(aAfterForgery.json).includes('forged'),
      'a forged userId in the body cannot overwrite another workspace',
    )

    const anonymous = await api('/api/workspace')
    check(anonymous.status === 401, 'no token is rejected (401)')
    const tampered = await api('/api/workspace', { token: `${tokenA.slice(0, -2)}xy` })
    check(tampered.status === 401, 'a tampered token is rejected (401)')

    /* Identity mapping: a Supabase id never inherits a row that sits on its email. */
    await stopServer()
    process.env.DATABASE_FILE = dbFile
    db = await import(pathToFileURL(join(process.cwd(), 'server', 'db.js')).href)
    const supabaseId = `supabase-iso-${stamp}`
    const row = db.findOrCreateSupabaseUser({
      id: supabaseId,
      email: `iso-ada-${stamp}@example.com`,
      name: 'Ada',
    })
    check(row.id === supabaseId, 'a Supabase id gets its own row, never the legacy row on that email')
    check(
      db.getWorkspace(supabaseId).state === null,
      'that new Supabase identity starts with an empty workspace',
    )
    check(
      db.getWorkspace(idA).state?.tasks?.[0]?.title === 'ada private task',
      'the original account keeps its own data',
    )
  }
} finally {
  await stopServer()
  db?.closeDatabase?.()
  rmSync(dir, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 })
}

console.log('')
if (failures > 0) {
  console.error(`Isolation check failed (${failures} problem${failures === 1 ? '' : 's'}).`)
  process.exit(1)
}
console.log("Isolation check passed: no user can reach another user's data.")