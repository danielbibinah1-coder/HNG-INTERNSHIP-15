import { Link } from 'react-router-dom'
import { ArrowRight, Check } from 'lucide-react'
import { useAuth } from '../../auth'

const PLANS = [
  {
    name: 'Starter',
    price: 'Free',
    cadence: 'forever',
    blurb: 'Everything you need to run a day on TaskMaster.',
    features: ['Unlimited tasks and lists', 'Focus Mode', 'AI Assist and chat history', 'Light and dark themes'],
    cta: 'Create account',
    highlight: false,
  },
  {
    name: 'Pro',
    price: '$8',
    cadence: 'per month',
    blurb: 'For people who plan several projects at once.',
    features: [
      'Everything in Starter',
      'Progress sharing with teammates',
      'Priority support',
      'Early access to new views',
    ],
    cta: 'Get started free',
    highlight: true,
  },
  {
    name: 'Team',
    price: '$16',
    cadence: 'per member / month',
    blurb: 'Workspaces that keep a whole studio aligned.',
    features: ['Everything in Pro', 'Shared project lists', 'Leaderboard and analytics', 'Central billing'],
    cta: 'Create account',
    highlight: false,
  },
]

export default function PricingSection() {
  const { user } = useAuth()

  return (
    <section id="pricing" className="mx-auto w-full max-w-[1180px] scroll-mt-20 px-5 py-16 sm:px-8 lg:py-20">
      <header className="mx-auto max-w-[620px] text-center">
        <span className="kicker">Pricing</span>
        <h2 className="mt-2.5 text-[27px] font-bold leading-tight tracking-tight text-ink sm:text-[32px]">
          Start free. Upgrade when it earns it.
        </h2>
        <p className="mt-3 text-[13.5px] leading-relaxed text-ink-2">
          Every account gets the full workspace. Paid tiers are for sharing and team features.
        </p>
      </header>

      <div className="mt-10 grid gap-4 lg:grid-cols-3">
        {PLANS.map((plan) => (
          <article
            key={plan.name}
            className={`relative flex flex-col rounded-2xl border p-6 transition-transform duration-200 hover:-translate-y-0.5 ${
              plan.highlight
                ? 'border-[rgba(255,23,68,0.5)] bg-panel shadow-[0_24px_60px_-40px_var(--glow)]'
                : 'border-line bg-panel'
            }`}
          >
            {plan.highlight && (
              <span className="badge badge-high absolute -top-2.5 left-6">Most popular</span>
            )}

            <h3 className="text-[13.5px] font-semibold text-ink">{plan.name}</h3>
            <p className="mt-3 flex items-baseline gap-1.5">
              <span className="text-[30px] font-bold tracking-tight text-ink">{plan.price}</span>
              <span className="text-[11.5px] text-ink-3">{plan.cadence}</span>
            </p>
            <p className="mt-2 text-[12.5px] leading-relaxed text-ink-2">{plan.blurb}</p>

            <ul className="mt-5 flex-1 space-y-2.5">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2.5 text-[12.5px] text-ink-2">
                  <span
                    className="mt-0.5 grid h-4 w-4 flex-none place-content-center rounded-full bg-[var(--neon-soft)] text-neon-2"
                    aria-hidden="true"
                  >
                    <Check size={10} strokeWidth={3} />
                  </span>
                  {feature}
                </li>
              ))}
            </ul>

            <Link
              to={user ? '/app' : '/signup'}
              className={`${plan.highlight ? 'btn-neon' : 'btn-outline'} mt-6 w-full py-2.5`}
            >
              {user ? 'Open workspace' : plan.cta}
              <ArrowRight size={13} />
            </Link>
          </article>
        ))}
      </div>

      <p className="mt-6 text-center text-[11.5px] text-ink-3">
        Pricing shown is illustrative for this prototype — no payment provider is connected. Upgrading
        inside the app flips a demo flag.
      </p>
    </section>
  )
}
