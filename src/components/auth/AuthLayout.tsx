import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Check, Moon, Sun } from 'lucide-react'
import Logo from '../sidebar/Logo'
import { useTheme } from '../../theme'

const HIGHLIGHTS = [
  'Tasks, lists and projects in one focused workspace',
  'Focus Mode that keeps a single task in front of you',
  'AI Assist that already knows what is on your plate',
]

interface AuthLayoutProps {
  title: string
  subtitle: string
  children: ReactNode
  /** Rendered under the form card — e.g. "Already have an account?". */
  footer: ReactNode
}

/**
 * Split-screen shell shared by the sign-in and sign-up pages: a marketing
 * panel on the left, the form card on the right.
 */
export default function AuthLayout({ title, subtitle, children, footer }: AuthLayoutProps) {
  const { theme, toggleTheme } = useTheme()

  return (
    <div className="grid h-full min-h-0 bg-bg lg:grid-cols-[1.05fr_1fr]">
      {/* ---------- marketing panel ---------- */}
      <aside className="relative hidden flex-col justify-between overflow-hidden border-r border-line bg-panel p-10 lg:flex xl:p-14">
        <div
          className="pointer-events-none absolute -left-32 top-1/4 h-[420px] w-[420px] rounded-full opacity-60 blur-3xl"
          style={{ background: 'radial-gradient(circle, var(--glow), transparent 70%)' }}
          aria-hidden="true"
        />
        <Link to="/" className="relative flex items-center gap-2.5">
          <Logo size={30} />
          <span className="text-[15px] font-bold tracking-tight text-ink">TaskMaster</span>
        </Link>

        <div className="relative max-w-[420px]">
          <span className="badge badge-high">Productivity workspace</span>
          <h2 className="mt-4 text-[30px] font-bold leading-[1.15] tracking-tight text-ink">
            Plan the day, then let the workspace carry it.
          </h2>
          <ul className="mt-7 space-y-3">
            {HIGHLIGHTS.map((item) => (
              <li key={item} className="flex gap-3 text-[13px] leading-relaxed text-ink-2">
                <span
                  className="mt-0.5 grid h-4 w-4 flex-none place-content-center rounded-full bg-[var(--neon-soft)] text-neon-2"
                  aria-hidden="true"
                >
                  <Check size={10} strokeWidth={3} />
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <figure className="relative max-w-[420px] rounded-2xl border border-line bg-panel-2 p-5">
          <blockquote className="text-[12.5px] leading-relaxed text-ink-2">
            “The three-column layout means I never lose the thread — tasks on the left, today in the
            middle, the assistant on the right.”
          </blockquote>
          <figcaption className="mt-3 flex items-center gap-2.5">
            <span
              className="grid h-7 w-7 place-content-center rounded-full text-[10.5px] font-semibold text-white"
              style={{ background: 'linear-gradient(135deg, var(--neon-2), var(--deep))' }}
              aria-hidden="true"
            >
              AO
            </span>
            <span className="text-[11.5px] text-ink-3">Ada O. · product designer</span>
          </figcaption>
        </figure>
      </aside>

      {/* ---------- form panel ---------- */}
      <section className="scroll-area flex min-h-0 flex-col">
        <header className="flex flex-none items-center justify-between gap-3 px-5 py-4 sm:px-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-[12.5px] font-medium text-ink-3 transition-colors duration-150 hover:text-ink"
          >
            <ArrowLeft size={13} />
            Back to home
          </Link>
          <div className="flex items-center gap-2">
            <Link to="/app" className="hidden text-[12.5px] text-ink-3 transition-colors duration-150 hover:text-ink sm:inline">
              Open workspace
            </Link>
            <button
              type="button"
              className="icon-btn icon-btn--ring h-8 w-8"
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
            >
              {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
            </button>
          </div>
        </header>

        <div className="flex flex-1 items-center justify-center px-5 pb-14 pt-2 sm:px-8">
          <div className="w-full max-w-[392px] anim-fade-up">
            <div className="mb-7 lg:hidden">
              <Link to="/" className="flex items-center gap-2.5">
                <Logo size={28} />
                <span className="text-[14px] font-bold tracking-tight text-ink">TaskMaster</span>
              </Link>
            </div>

            <h1 className="text-[24px] font-bold tracking-tight text-ink">{title}</h1>
            <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-2">{subtitle}</p>

            <div className="mt-6">{children}</div>

            <div className="mt-6 text-center text-[12.5px] text-ink-2">{footer}</div>
          </div>
        </div>
      </section>
    </div>
  )
}
