import { Link } from 'react-router-dom'
import { ArrowRight, ExternalLink } from 'lucide-react'
import Logo from '../sidebar/Logo'
import { useAuth } from '../../auth'
import { scrollToSection } from './SiteNav'

const REPO_URL = 'https://github.com/danielbibinah1-coder/HNG-INTERNSHIP-15'

export default function SiteFooter() {
  const { user } = useAuth()
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-line bg-panel/60">
      <div className="mx-auto grid w-full max-w-[1180px] gap-10 px-5 py-12 sm:px-8 lg:grid-cols-[1.2fr_0.6fr_0.6fr_0.6fr]">
        <div>
          <Link to="/" className="flex items-center gap-2.5">
            <Logo size={26} />
            <span className="text-[14px] font-bold tracking-tight text-ink">TaskMaster</span>
          </Link>
          <p className="mt-3 max-w-[300px] text-[12.5px] leading-relaxed text-ink-2">
            A three-column productivity workspace with real accounts, a Focus Mode loop and an
            assistant that knows your list.
          </p>
          <Link to={user ? '/app' : '/signup'} className="btn-neon mt-5">
            {user ? 'Open workspace' : 'Get started free'}
            <ArrowRight size={13} />
          </Link>
        </div>

        <nav aria-label="Product">
          <h2 className="kicker">Product</h2>
          <ul className="mt-3.5 space-y-2.5 text-[12.5px] text-ink-2">
            {[
              { id: 'features', label: 'Features' },
              { id: 'workflow', label: 'How it works' },
              { id: 'pricing', label: 'Pricing' },
              { id: 'faqs', label: 'FAQs' },
            ].map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  className="transition-colors duration-150 hover:text-ink"
                  onClick={() => scrollToSection(item.id)}
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Account">
          <h2 className="kicker">Account</h2>
          <ul className="mt-3.5 space-y-2.5 text-[12.5px] text-ink-2">
            <li>
              <Link to="/signup" className="transition-colors duration-150 hover:text-ink">
                Create account
              </Link>
            </li>
            <li>
              <Link to="/signin" className="transition-colors duration-150 hover:text-ink">
                Sign in
              </Link>
            </li>
            <li>
              <Link to="/app" className="transition-colors duration-150 hover:text-ink">
                Workspace
              </Link>
            </li>
          </ul>
        </nav>

        <nav aria-label="Resources">
          <h2 className="kicker">Resources</h2>
          <ul className="mt-3.5 space-y-2.5 text-[12.5px] text-ink-2">
            <li>
              <a
                href={REPO_URL}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 transition-colors duration-150 hover:text-ink"
              >
                Source repository
                <ExternalLink size={11} />
              </a>
            </li>
            <li>
              <a
                href={`${REPO_URL}#readme`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 transition-colors duration-150 hover:text-ink"
              >
                API documentation
                <ExternalLink size={11} />
              </a>
            </li>
          </ul>
        </nav>
      </div>

      <div className="border-t border-line">
        <div className="mx-auto flex w-full max-w-[1180px] flex-col gap-2 px-5 py-5 text-[11.5px] text-ink-3 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <p>© {year} TaskMaster. A prototype build — no payment processing is connected.</p>
          <p>React 19 · Vite · Tailwind v4 · Express · SQLite</p>
        </div>
      </div>
    </footer>
  )
}
