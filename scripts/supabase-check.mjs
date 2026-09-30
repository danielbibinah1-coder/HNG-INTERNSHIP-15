/**
 * Supabase wiring check.
 *
 * With credentials for a real project:
 *   SUPABASE_EMAIL=you@example.com SUPABASE_PASSWORD=... node scripts/supabase-check.mjs
 *   → signs in, verifies the workspace loads, that the session survives a
 *     reload, and that sign-out clears it.
 *
 * Without credentials it still verifies the wiring: the auth controls are
 * enabled when VITE_SUPABASE_* is present, a bad attempt surfaces an error
 * instead of faking a session, and nothing is written to storage.
 */
import { launchBrowser, SET_INPUT_JS } from './lib/cdp.mjs'

const BASE_URL = process.env.BASE_URL ?? 'http://localhost:5173'
const EMAIL = process.env.SUPABASE_EMAIL
const PASSWORD = process.env.SUPABASE_PASSWORD
const SESSION_KEY = 'taskmaster.supabase.auth'

const browser = await launchBrowser(9335)
const { evaluate, waitFor, navigate, close, pageErrors } = browser

let failures = 0
const step = (label, ok, extra = '') => {
  if (!ok) failures += 1
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}${extra ? `  ${extra}` : ''}`)
}

try {
  await navigate(`${BASE_URL}/#/signin`)
  await waitFor("document.querySelectorAll('form input').length >= 2", 'the sign-in form')

  const ui = await evaluate(`
    JSON.stringify({
      submitEnabled: !document.querySelector('form button[type=submit]').disabled,
      googleEnabled: ![...document.querySelectorAll('button')].find(b => b.textContent.trim() === 'Google').disabled,
      forgotIsButton: [...document.querySelectorAll('button')].some(b => b.textContent.trim() === 'Forgot password?'),
    })
  `)
  const state = JSON.parse(ui)
  console.log(`      sign-in controls: ${ui}`)

  step('"Forgot password?" is a working control', state.forgotIsButton)

  if (!EMAIL || !PASSWORD) {
    /* ---- wiring-only mode: never pretend to authenticate ---- */
    if (!state.submitEnabled) {
      console.log(
        'SKIP  VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY are not set, so the auth controls stay disabled.\n' +
          '      Add them to .env to exercise Supabase, then re-run with SUPABASE_EMAIL and SUPABASE_PASSWORD.',
      )
      console.log('\nSupabase check passed (wiring only).')
      close()
      process.exit(0)
    }

    step('auth controls enabled (VITE_SUPABASE_* present)', state.submitEnabled && state.googleEnabled)

    await evaluate(`${SET_INPUT_JS}(0, 'nobody@example.com')`)
    await evaluate(`${SET_INPUT_JS}(1, 'WrongPassw0rd1')`)
    await evaluate("document.querySelector('form button[type=submit]').click()")

    await waitFor("!!document.querySelector('[role=alert]')", 'an error message', 25000)
    const message = await evaluate("document.querySelector('[role=alert]').textContent.trim()")
    step('bad credentials surface an error (no fake session)', message.length > 0, `("${message.slice(0, 70)}")`)

    const stillOnSignIn = await evaluate("window.location.hash === '#/signin'")
    step('stayed on the auth page', stillOnSignIn)

    const stored = await evaluate(`localStorage.getItem('${SESSION_KEY}')`)
    step('no Supabase session stored', stored === null)

    step('no uncaught page errors', pageErrors.length === 0, pageErrors.join(' | '))
    console.log(
      '\nNo credentials supplied — add SUPABASE_EMAIL and SUPABASE_PASSWORD to run the full sign-in flow.',
    )
  } else {
    /* ---- full flow against a real project ---- */
    step('auth controls enabled', state.submitEnabled && state.googleEnabled)

    await evaluate(`${SET_INPUT_JS}(0, ${JSON.stringify(EMAIL)})`)
    await evaluate(`${SET_INPUT_JS}(1, ${JSON.stringify(PASSWORD)})`)
    await evaluate("document.querySelector('form button[type=submit]').click()")

    await waitFor("window.location.hash === '#/app'", 'the workspace after sign-in')
    step('signed in and routed to /app', true)

    await waitFor("!!document.querySelector('aside[aria-label=\"AI assistant\"]')", 'the workspace shell')
    step('workspace rendered', (await evaluate('document.body.innerText')).includes('Today Task'))

    const token = await evaluate(`Boolean(localStorage.getItem('${SESSION_KEY}'))`)
    step('session persisted to storage', token === true)

    await navigate(`${BASE_URL}/#/app`)
    await waitFor("!!document.querySelector('aside[aria-label=\"AI assistant\"]')", 'the workspace after reload')
    step('session survived a page reload', (await evaluate('window.location.hash')) === '#/app')

    await evaluate(
      "[...document.querySelectorAll('button')].find(b => b.getAttribute('aria-haspopup') === 'menu')?.click()",
    )
    await delay(400)
    await evaluate(
      "(() => { const b = [...document.querySelectorAll('button')].find(x => x.textContent.trim() === 'Sign out'); if (b) b.click() })()",
    )
    await waitFor("window.location.hash === '#/'", 'the landing page after sign-out')
    const cleared = await evaluate(`localStorage.getItem('${SESSION_KEY}')`)
    step('sign-out cleared the stored session', cleared === null)

    step('no uncaught page errors', pageErrors.length === 0, pageErrors.join(' | '))
  }
} catch (error) {
  failures += 1
  console.log(`FAIL  ${error.message}`)
  if (pageErrors.length) console.log(`      page errors: ${pageErrors.join(' | ')}`)
} finally {
  close()
}

console.log(failures === 0 ? '\nSupabase check passed.' : `\n${failures} Supabase check(s) failed.`)
process.exit(failures === 0 ? 0 : 1)
