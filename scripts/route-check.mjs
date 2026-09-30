/**
 * Route smoke test.
 *
 * Launches headless Chrome over the DevTools protocol, visits each route and
 * asserts that React actually rendered something useful — including the
 * protected-route redirect. Any uncaught page error fails the run.
 *
 *   node scripts/route-check.mjs                 # against the Vite dev server
 *   BASE_URL=http://localhost:4173 node scripts/route-check.mjs
 */
import { spawn } from 'node:child_process'
import { existsSync, mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { setTimeout as delay } from 'node:timers/promises'

const BASE_URL = process.env.BASE_URL ?? 'http://localhost:5173'
const CHROME_CANDIDATES = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
]
const CHROME = CHROME_CANDIDATES.find((candidate) => existsSync(candidate))
if (!CHROME) {
  console.error('No Chrome/Edge binary found.')
  process.exit(1)
}

const CDP_PORT = 9333
const profile = mkdtempSync(join(tmpdir(), 'taskmaster-cdp-'))

const chrome = spawn(
  CHROME,
  [
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    '--no-first-run',
    '--no-default-browser-check',
    `--user-data-dir=${profile}`,
    `--remote-debugging-port=${CDP_PORT}`,
    'about:blank',
  ],
  { stdio: 'ignore' },
)

async function cdpReady() {
  for (let attempt = 0; attempt < 80; attempt += 1) {
    try {
      const response = await fetch(`http://127.0.0.1:${CDP_PORT}/json/list`)
      if (response.ok) {
        const targets = await response.json()
        const page = targets.find((target) => target.type === 'page')
        if (page?.webSocketDebuggerUrl) return page
      }
    } catch {
      /* not up yet */
    }
    await delay(250)
  }
  throw new Error('Chrome did not expose a page target on the DevTools port')
}

const page = await cdpReady()
const socket = new WebSocket(page.webSocketDebuggerUrl)
const pending = new Map()
const pageErrors = []
let nextId = 0

socket.addEventListener('message', (event) => {
  const message = JSON.parse(event.data)
  if (message.method === 'Runtime.exceptionThrown') {
    const details = message.params?.exceptionDetails
    pageErrors.push(details?.exception?.description ?? details?.text ?? 'unknown page error')
  }
  if (message.id && pending.has(message.id)) {
    const { resolve, reject } = pending.get(message.id)
    pending.delete(message.id)
    if (message.error) reject(new Error(message.error.message))
    else resolve(message.result)
  }
})

const send = (method, params = {}) =>
  new Promise((resolve, reject) => {
    const id = (nextId += 1)
    pending.set(id, { resolve, reject })
    socket.send(JSON.stringify({ id, method, params }))
  })

await new Promise((resolve) => socket.addEventListener('open', resolve))
await send('Page.enable')
await send('Runtime.enable')

async function evaluate(expression) {
  const result = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true })
  return result.result?.value
}

async function visit(hash) {
  await send('Page.navigate', { url: `${BASE_URL}/#${hash}` })
  for (let attempt = 0; attempt < 60; attempt += 1) {
    const mounted = await evaluate("document.querySelector('#root')?.childElementCount ?? 0")
    if (mounted > 0) break
    await delay(150)
  }
  await delay(350) // let effects settle (auth revalidation, redirects)
  return evaluate('document.body.innerText') ?? ''
}

const CASES = [
  { hash: '/', name: 'landing', expect: ['Plan the day.', 'Get started', 'Everything the day needs', 'Start free', 'Questions, answered honestly', 'Source repository'] },
  { hash: '/signin', name: 'sign-in', expect: ['Welcome back', 'Keep me signed in', 'Sign in'] },
  { hash: '/signup', name: 'sign-up', expect: ['Create your workspace', 'Confirm password', 'Create account'] },
  { hash: '/app', name: 'protected workspace (signed out)', expect: ['Welcome back'], forbid: ['Today task'] },
]

let failures = 0
for (const testCase of CASES) {
  const before = pageErrors.length
  const text = await visit(testCase.hash)
  const missing = testCase.expect.filter((needle) => !text.includes(needle))
  const forbidden = (testCase.forbid ?? []).filter((needle) => text.includes(needle))
  const errored = pageErrors.length > before

  const ok = missing.length === 0 && forbidden.length === 0 && !errored
  if (!ok) failures += 1

  console.log(`${ok ? 'PASS' : 'FAIL'}  ${testCase.name}  (${text.length} chars of visible text)`)
  if (missing.length) console.log(`        missing: ${missing.join(' | ')}`)
  if (forbidden.length) console.log(`        should not contain: ${forbidden.join(' | ')}`)
  if (errored) console.log(`        page errors: ${pageErrors.slice(before).join(' | ')}`)
}

socket.close()
chrome.kill()
console.log(failures === 0 ? '\nAll route checks passed.' : `\n${failures} route check(s) failed.`)
process.exit(failures === 0 ? 0 : 1)
