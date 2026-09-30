import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Menu, Moon, Sun, X } from 'lucide-react'
import Logo from '../sidebar/Logo'
import { initialsOf, useAuth } from '../../auth'
import { useTheme } from '../../theme'

const SECTIONS = [
  { id: 'features', label: 'Features' },
  { id: 'workflow', label: 'How it works' },
  { id: 'pricing', label: 'Pricing' },
  { id: 'faqs', label: 'FAQs' },
]

/**
 * In-page navigation is done with buttons rather than `#anchor` links: the URL
 * hash belongs to the router, so jumping to a section would look like a route
 * change. Scrolling the section into view keeps both behaviours intact.
 */
export function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

export default function SiteNav() {
  const { user } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const [open, setOpen] = useState(false)

  return (
    <header
      className="sticky top-0 z-40 border-b border-line backdrop-blur-xl"
      style={{ background: 'color-mix(in srgb, var(--bg) 86%, transparent)' }}
    >
      <div className="mx-auto flex h-[62px] w-full max-w-[1180px] items-center gap-3 px-5 sm:px-8">
        <Link to="/" className="flex items-center gap-2.5" onClick={() => setOpen(false)}>
          <Logo size={26} />
          <span className="text-[14.5px] font-bold tracking-tight text-ink">TaskMaster</span>
        </Link>

        <nav className="ml-7 hidden items-center gap-1 md:flex" aria-label="Page sections">
          {SECTIONS.map((section) => (
            <button
              key={section.id}
              type="button"
              className="rounded-lg px-3 py-1.5 text-[12.5px] font-medium text-ink-2 transition-colors duration-150 hover:bg-panel-3 hover:text-ink"
              onClick={() => scrollToSection(section.id)}
            >
              {section.label}
            </button>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            className="icon-btn icon-btn--ring h-8 w-8"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
          >
            {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
          </button>

          {user ? (
            <>
              <span className="hidden items-center gap-2 rounded-full border border-line bg-panel-2 py-1 pl-1 pr-3 sm:flex">
                <span
                  className="grid h-6 w-6 place-content-center rounded-full text-[10px] font-semibold text-white"
                  style={{ background: 'linear-gradient(135deg, var(--neon-2), var(--deep))' }}
                  aria-hidden="true"
                >
                  {initialsOf(user.name)}
                </span>
                <span className="max-w-[110px] truncate text-[12px] text-ink-2">
                  {user.name.split(' ')[0]}
                </span>
              </span>
              <Link to="/app" className="btn-neon">
                Open workspace
                <ArrowRight size={13} />
              </Link>
            </>
          ) : (
            <>
              <Link to="/signin" className="btn-soft hidden sm:inline-flex">
                Sign in
              </Link>
              <Link to="/signup" className="btn-neon">
                Get started
              </Link>
            </>
          )}

          <button
            type="button"
            className="icon-btn icon-btn--ring h-8 w-8 md:hidden"
            aria-label="Toggle navigation"
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X size={15} /> : <Menu size={15} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="anim-fade-in border-t border-line bg-panel px-5 py-3 md:hidden">
          <nav className="flex flex-col" aria-label="Page sections">
            {SECTIONS.map((section) => (
              <button
                key={section.id}
                type="button"
                className="rounded-lg px-2 py-2.5 text-left text-[13px] font-medium text-ink-2 transition-colors duration-150 hover:bg-panel-3 hover:text-ink"
                onClick={() => {
                  setOpen(false)
                  scrollToSection(section.id)
                }}
              >
                {section.label}
              </button>
            ))}
          </nav>
          {!user && (
            <Link to="/signin" className="btn-soft mt-3 w-full" onClick={() => setOpen(false)}>
              Sign in
            </Link>
          )}
        </div>
      )}
    </header>
  )
}
