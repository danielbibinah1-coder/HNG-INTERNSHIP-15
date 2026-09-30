import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import FaqSection from '../components/landing/FaqSection'
import FeaturesSection from '../components/landing/FeaturesSection'
import HeroSection from '../components/landing/HeroSection'
import PricingSection from '../components/landing/PricingSection'
import SiteFooter from '../components/landing/SiteFooter'
import SiteNav from '../components/landing/SiteNav'
import SocialProofSection from '../components/landing/SocialProofSection'
import WorkflowSection from '../components/landing/WorkflowSection'
import { useAuth } from '../auth'

/**
 * Public marketing page. It owns the scroll container because the document
 * itself does not scroll (index.css pins body height for the app shell).
 */
export default function LandingPage() {
  const { user } = useAuth()

  return (
    <div className="scroll-area h-full bg-bg">
      <SiteNav />

      <main>
        <HeroSection />
        <FeaturesSection />
        <WorkflowSection />
        <SocialProofSection />
        <PricingSection />
        <FaqSection />

        {/* ---------- closing call to action ---------- */}
        <section className="mx-auto w-full max-w-[1180px] px-5 pb-16 sm:px-8 lg:pb-20">
          <div
            className="relative overflow-hidden rounded-3xl border border-line p-8 text-center sm:p-12"
            style={{ background: 'linear-gradient(135deg, var(--panel), var(--panel-2))' }}
          >
            <div
              className="pointer-events-none absolute -bottom-24 left-1/2 h-[280px] w-[520px] -translate-x-1/2 rounded-full opacity-50 blur-3xl"
              style={{ background: 'radial-gradient(ellipse, var(--glow), transparent 70%)' }}
              aria-hidden="true"
            />
            <h2 className="relative text-[26px] font-bold leading-tight tracking-tight text-ink sm:text-[32px]">
              Your next task is one click away
            </h2>
            <p className="relative mx-auto mt-3 max-w-[520px] text-[13.5px] leading-relaxed text-ink-2">
              {user
                ? `You are signed in as ${user.email}. Your workspace is waiting.`
                : 'Create an account, add your first list, and let the workspace keep the day honest.'}
            </p>
            <div className="relative mt-7 flex flex-wrap items-center justify-center gap-3">
              <Link to={user ? '/app' : '/signup'} className="btn-neon px-5 py-2.5 text-[13.5px]">
                {user ? 'Open your workspace' : 'Create your free account'}
                <ArrowRight size={14} />
              </Link>
              <Link to="/signin" className="btn-outline px-5 py-2.5 text-[13.5px]">
                I already have an account
              </Link>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
