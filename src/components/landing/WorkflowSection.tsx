import { Link } from 'react-router-dom'
import { ArrowRight, Command, CornerDownLeft, Keyboard } from 'lucide-react'

const STEPS = [
  {
    step: '01',
    title: 'Create your account',
    body: 'An email and a password — that is the whole sign-up. Passwords are hashed with scrypt on the server, never stored in plain text.',
  },
  {
    step: '02',
    title: 'Set up your lists',
    body: 'Add projects like “Odama Website” or “Dribbble”, group them, then select one to scope the Today Task column to that list.',
  },
  {
    step: '03',
    title: 'Work the day',
    body: 'Tick tasks off, hit Focus Mode for a single-task sprint, and ask AI Assist when a task needs breaking down.',
  },
]

const SHORTCUTS = [
  { keys: 'Enter', label: 'Add the task you are typing' },
  { keys: 'Esc', label: 'Leave Focus Mode' },
  { keys: 'AI Assist', label: 'Open the assistant drawer (mobile)' },
]

export default function WorkflowSection() {
  return (
    <section id="workflow" className="scroll-mt-20 border-y border-line bg-panel/40 py-16 lg:py-20">
      <div className="mx-auto grid w-full max-w-[1180px] gap-12 px-5 sm:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div>
          <span className="kicker">How it works</span>
          <h2 className="mt-2.5 text-[27px] font-bold leading-tight tracking-tight text-ink sm:text-[32px]">
            From sign-up to first tick in about a minute
          </h2>

          <ol className="mt-9 space-y-6">
            {STEPS.map(({ step, title, body }) => (
              <li key={step} className="flex gap-4">
                <span className="grid h-8 w-8 flex-none place-content-center rounded-xl border border-line bg-panel-2 text-[11px] font-semibold text-neon-2">
                  {step}
                </span>
                <span>
                  <h3 className="text-[13.5px] font-semibold text-ink">{title}</h3>
                  <p className="mt-1.5 max-w-[440px] text-[12.5px] leading-relaxed text-ink-2">{body}</p>
                </span>
              </li>
            ))}
          </ol>

          <Link to="/signup" className="btn-neon mt-9 px-5 py-2.5 text-[13.5px]">
            Start your workspace
            <ArrowRight size={14} />
          </Link>
        </div>

        <aside className="panel-card p-5">
          <span className="flex items-center gap-2 text-[12.5px] font-semibold text-ink">
            <Keyboard size={14} className="text-neon-2" />
            Built to be driven from the keyboard
          </span>
          <ul className="mt-4 space-y-3">
            {SHORTCUTS.map(({ keys, label }) => (
              <li key={keys} className="flex items-center justify-between gap-4 border-b border-line pb-3 last:border-b-0 last:pb-0">
                <span className="text-[12.5px] text-ink-2">{label}</span>
                <kbd className="flex flex-none items-center gap-1 rounded-md border border-line bg-panel-2 px-2 py-1 text-[10.5px] font-medium text-ink-3">
                  {keys === 'Enter' ? <CornerDownLeft size={10} /> : keys === 'Esc' ? <Command size={10} /> : null}
                  {keys}
                </kbd>
              </li>
            ))}
          </ul>
          <p className="mt-4 rounded-xl bg-panel-2 p-3 text-[11.5px] leading-relaxed text-ink-3">
            Sessions are signed JWTs that expire after seven days. Sign out from the account menu and
            the token is dropped from this device immediately.
          </p>
        </aside>
      </div>
    </section>
  )
}
