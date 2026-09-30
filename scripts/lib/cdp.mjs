/**
 * Minimal Chrome DevTools Protocol client used by the check scripts.
 *
 * Node 24 ships a global WebSocket, so driving a real browser needs no extra
 * dependencies: launch headless Chrome, attach to its page target, navigate and
 * evaluate expressions in the page.
 */
import { spawn } from 'node:child_process'
import { existsSync, mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { setTimeout as delay } from 'node:timers/promises'

const CHROME_CANDIDATES = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
]

export async function launchBrowser(port) {
  const binary = CHROME_CANDIDATES.find((candidate) => existsSync(candidate))
  if (!binary) throw new Error('No Chrome/Edge binary found')

  const chrome = spawn(
    binary,
    [
      '--headless=new',
      '--disable-gpu',
      '--no-sandbox',
      '--no-first-run',
      '--no-default-browser-check',
      `--user-data-dir=${mkdtempSync(join(tmpdir(), 'taskmaster-cdp-'))}`,
      `--remote-debugging-port=${port}`,
      'about:blank',
    ],
    { stdio: 'ignore' },
  )

  let target = null
  for (let attempt = 0; attempt < 80 && !target; attempt += 1) {
    try {
      const response = await fetch(`http://127.0.0.1:${port}/json/list`)
      if (response.ok) {
        const pages = await response.json()
        target = pages.find((page) => page.type === 'page') ?? null
      }
    } catch {
      /* not up yet */
    }
    if (!target) await delay(250)
  }
  if (!target?.webSocketDebuggerUrl) {
    chrome.kill()
    throw new Error('Chrome did not expose a page target')
  }

  const socket = new WebSocket(target.webSocketDebuggerUrl)
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

  const navigate = async (url) => {
    await send('Page.navigate', { url })
    await waitFor("document.querySelector('#root')?.childElementCount > 0", 'the app to mount')
  }

  const close = () => {
    try {
      socket.close()
    } catch {
      /* already closed */
    }
    chrome.kill()
  }

  return { evaluate, waitFor, navigate, close, pageErrors }
}

/** Writes a value into a React-controlled input and fires the event it listens for. */
export const SET_INPUT_JS = `
  (function (index, value) {
    const element = document.querySelectorAll('form input')[index];
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
    setter.call(element, value);
    element.dispatchEvent(new Event('input', { bubbles: true }));
    return true;
  })
`
