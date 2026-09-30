/**
 * End-to-end auth flow test.
 *
 * Drives the real sign-up form in headless Chrome, waits for the workspace to
 * load, checks that the workspace was persisted to the API, then signs out
 * through the account menu and confirms we land back on the landing page.
 *
 *   node scripts/auth-check.mjs
 *   BASE_URL=http://localhost:4173 node scripts/auth-check.mjs
 */
import { spawn } from 'node:child_process'
import { existsSync, mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { setTimeout as delay } from 'node:timers/promises'

const BASE_URL = process.env.BASE_URL ?? 'http://localhost:5173'
const CHROME = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
].find((candidate) => existsSync(candidate))

if (!CHROME) {
  console.error('No Chrome/Edge binary found.')
  process.exit(1)
}

const CDP_PORT = 9334
const EMAIL = `cdp-${Date.now()}@example.com`
const PASSWORD = 'Passw0rd1'
const NAME = 'CDP Tester'

const chrome = spawn(
  CHROME,
  [
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    '--no-first-run',
    '--no-default-browser-check',
    `--user-data-dir=${mkdtempSync(join(tmpdir(), 'taskmaster-auth-'))}`,
    `--remote-debugging-port=${CDP_PORT}`,
    'about:blank',
  ],
  { stdio: 'ignore' },
)

async function pageTarget() {
  for (let attempt = 0; attempt < 80; attempt += 1) {
    try {
      const response = await fetch(`http://127.0.0.1:${CDP_PORT}/json/list`)
      if (response.ok) {
        const found = (await response.json()).find((target) => target.type === 'page')
        if (found?.webSocketDebuggerUrl) return found
      }
    } catch {
      /* not up yet */
    }
    await delay(250)
  }
  throw new Error('Chrome did not expose a page target')
}

const socket = new WebSocket((await pageTarget()).webSocketDebuggerUrl)
const pending = new Map()
const errors = []
let nextId = 0

socket.addEventListener('message', (event) => {
  const message = JSON.parse(event.data)
  if (message.method === 'Runtime.exceptionThrown') {
    errors.push(message.params?.exceptionDetails?.exception?.description ?? 'unknown page error')
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

const evaluate = async (expression) => {
  const result = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true })
  return result.result?.value
}

const waitFor = async (expression, label, timeoutMs = 20000) => {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    if (await evaluate(expression)) return true
    await delay(200)
  }
  throw new Error(`Timed out waiting for ${label}`)
}

/* React controlled inputs ignore plain .value writes, so go through the native
   setter and fire the input event React listens for. */
const SET_INPUT = `
  (function () {
    const inputs = document.querySelectorAll('form input');
    const set = (element, value) => {
      const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
      setter.call(element, value);
      element.dispatchEvent(new Event('input', { bubbles: true }));
    };
    set(inputs[0], ${JSON.stringify(NAME)});
    set(inputs[1], ${JSON.stringify(EMAIL)});
    set(inputs[2], ${JSON.stringify(PASSWORD)});
    set(inputs[3], ${JSON.stringify(PASSWORD)});
    inputs[4].click();
    return inputs.length;
  })()
`

let failed = false
const step = (label, ok, extra = '') => {
  if (!ok) failed = true
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}${extra ? `  ${extra}` : ''}`)
}

try {
  await send('Page.navigate', { url: `${BASE_URL}/#/signup` })
  await waitFor("document.querySelectorAll('form input').length >= 5", 'the sign-up form')

  const inputCount = await evaluate(SET_INPUT)
  step('filled the sign-up form', inputCount >= 5, `(${inputCount} inputs)`)

  await evaluate("document.querySelector('form button[type=submit]').click()")
  await waitFor("window.location.hash === '#/app'", 'the workspace route')
  step('redirected to /app after signing up', true)

  await waitFor(`!!document.querySelector('aside[aria-label="AI assistant"]')`, 'the workspace shell')
  const workspaceText = await evaluate('document.body.innerText')
  step('workspace rendered', workspaceText.includes('Today Task') && workspaceText.includes('AI Assist'), `(${workspaceText.length} chars)`)
  step('account menu shows the new user', workspaceText.includes('CDP'))

  /* The store debounces its PUT by ~900ms; give it room, then read it back. */
  await delay(1600)
  const saved = await evaluate(`
    (async () => {
      const raw = localStorage.getItem('taskmaster.auth.v1');
      if (!raw) return { ok: false, reason: 'no session stored' };
      const token = JSON.parse(raw).token;
      const response = await fetch('/api/workspace', { headers: { Authorization: 'Bearer ' + token } });
      const body = await response.json();
      return { ok: body.ok === true, tasks: body.state?.tasks?.length ?? 0, hasState: Boolean(body.state) };
    })()
  `)
  step(
    'workspace persisted to the API',
    saved?.ok === true && saved.hasState,
    saved?.reason ?? `(${saved?.tasks} tasks stored server-side)`,
  )

  const menuInfo = await evaluate(`
    (() => {
      const trigger = [...document.querySelectorAll('button')].find(b => b.getAttribute('aria-haspopup') === 'menu');
      if (!trigger) return 'no account-menu trigger found';
      trigger.click();
      return 'trigger clicked';
    })()
  `)
  await delay(400)
  const menuItems = await evaluate(
    "[...document.querySelectorAll('[role=menuitem]')].map(i => i.textContent.trim()).join(' | ')",
  )
  console.log(`      ${menuInfo}; menu items: ${menuItems || '(none)'}`)

  const clickedSignOut = await evaluate(
    "(() => { const b = [...document.querySelectorAll('button')].find(x => x.textContent.trim() === 'Sign out'); if (b) { b.click(); return true } return false })()",
  )
  await delay(500)
  const samples = await evaluate(`
    JSON.stringify({
      hash: window.location.hash,
      session: localStorage.getItem('taskmaster.auth.v1') ? 'present' : 'cleared',
      heading: (document.querySelector('h1')?.textContent || document.body.innerText).slice(0, 60)
    })
  `)
  console.log(`      after click: ${samples}`)
  await waitFor("window.location.hash === '#/'", 'the landing page')
  step('signed out from the account menu', clickedSignOut === true)

  const tokenAfter = await evaluate("localStorage.getItem('taskmaster.auth.v1')")
  step('session token cleared from storage', tokenAfter === null)

  step('no uncaught page errors', errors.length === 0, errors.join(' | '))
} catch (error) {
  failed = true
  console.log(`FAIL  ${error.message}`)
  if (errors.length) console.log(`      page errors: ${errors.join(' | ')}`)
}

socket.close()
chrome.kill()
console.log(failed ? '\nAuth flow check failed.' : `\nAuth flow passed (${EMAIL}).`)
process.exit(failed ? 1 : 0)
