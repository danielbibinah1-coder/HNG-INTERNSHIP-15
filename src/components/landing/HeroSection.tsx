import { Link } from 'react-router-dom'
import { ArrowRight, CalendarCheck, Flame, Sparkles, Zap } from 'lucide-react'
import { useAuth } from '../../auth'
import { scrollToSection } from './SiteNav'

const STATS = [
  { Icon: Zap, value: '3 columns', label: 'Lists · Today · AI Assist' },
  { Icon: Flame, value: 'Focus Mode', label: 'One task at a time' },
  { Icon: CalendarCheck, value: 'Auto-saved', label: 'Synced to your account' },
]

const PREVIEW_TASKS = [
  { title: 'Create design system', badge: 'badge-high', label: 'high', done: true },
  { title: 'Ship landing page hero', badge: 'badge-medium', label: 'medium', done: false },
  { title: 'Upload dribbble shot', badge: 'badge-low', label: 'low', done: false },
]

export default function HeroSection() {
  const { user } = useAuth()

  return (
    <section className="relative overflow-hidden">
      <div
        className="pointer-events-none absolute -right-40 -top-32 h-[520px] w-[520px] rounded-full opacity-50 blur-3xl"
        style={{ background: 'radial-gradient(circle, var(--glow), transparent 70%)' }}
        aria-hidden="true"
      />

      <div className="relative mx-auto grid w-full max-w-[1180px] gap-14 px-5 pb-16 pt-14 sm:px-8 lg:grid-cols-[1.02fr_1fr] lg:items-center lg:pb-24 lg:pt-20">
        {/* ---------- copy ---------- */}
        <div className="anim-fade-up">
          <span className="inline-flex items-center gap-2 rounded-full border border-[rgba(255,23,68,0.35)] bg-[var(--neon-soft)] px-3 py-1.5 text-[11px] font-medium text-neon-2">
            <Sparkles size={12} />
            Built for people who ship
          </span>

          <h1 className="mt-5 text-[38px] font-bold leading-[1.08] tracking-tight text-ink sm:text-[46px]">
            Plan the day.
            <br />
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: 'linear-gradient(120deg, var(--neon-2), var(--neon), var(--deep))' }}
            >
              Finish it.
            </span>
          </h1>

          <p className="mt-5 max-w-[520px] text-[14px] leading-relaxed text-ink-2">
            TaskMaster is a three-column workspace: your lists on the left, today&apos;s tasks in the
            middle, an AI assistant that already knows your workload on the right. Sign in and your
            work follows you between devices.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link to={user ? '/app' : '/signup'} className="btn-neon px-5 py-2.5 text-[13.5px]">
              {user ? 'Open your workspace' : 'Create your free account'}
              <ArrowRight size={14} />
            </Link>
            <button
              type="button"
              className="btn-outline px-5 py-2.5 text-[13.5px]"
              onClick={() => scrollToSection('workflow')}
            >
              See how it works
            </button>
          </div>

          <p className="mt-3.5 text-[11.5px] text-ink-3">
            {user ? (
              <>Signed in as {user.email}</>
            ) : (
              <>No credit card — an email and a password is all it takes.</>
            )}
          </p>

          <dl className="mt-9 grid gap-4 border-t border-line pt-6 sm:grid-cols-3">
            {STATS.map(({ Icon, value, label }) => (
              <div key={value} className="flex items-start gap-2.5">
                <span className="mt-0.5 grid h-6 w-6 flex-none place-content-center rounded-lg bg-panel-2 text-neon-2">
                  <Icon size={13} />
                </span>
                <span>
                  <dt className="text-[12.5px] font-semibold text-ink">{value}</dt>
                  <dd className="text-[11.5px] text-ink-3">{label}</dd>
                </span>
              </div>
            ))}
          </dl>
        </div>

        {/* ---------- product preview ---------- */}
        <div className="anim-fade-up relative">
          <div
            className="pointer-events-none absolute inset-x-6 -bottom-6 h-24 rounded-full opacity-60 blur-2xl"
            style={{ background: 'radial-gradient(ellipse, var(--glow), transparent 70%)' }}
            aria-hidden="true"
          />
          <div className="panel-card relative" aria-hidden="true">
            <div className="flex items-center gap-2 border-b border-line px-4 py-2.5">
              <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
              <span className="ml-2 text-[11px] text-ink-3">taskmaster · today</span>
            </div>

            <div className="grid gap-3 p-3 sm:grid-cols-[104px_minmax(0,1fr)] lg:grid-cols-[104px_minmax(0,1fr)_130px]">
              {/* mini sidebar */}
              <div className="hidden flex-col gap-1.5 rounded-xl border border-line bg-panel-2 p-2 sm:flex">
                {['Today', 'Odama Website', 'Dribbble', 'Personal'].map((item, index) => (
                  <span
                    key={item}
                    className={`truncate rounded-md px-2 py-1.5 text-[10.5px] ${
                      index === 0 ? 'bg-[var(--neon-soft)] text-neon-2' : 'text-ink-3'
                    }`}
                  >
                    {item}
                  </span>
                ))}
              </div>

              {/* mini task list */}
              <div className="rounded-xl border border-line bg-panel-2 p-3">
                <p className="kicker">Today task</p>
                <div className="mt-2">
                  {PREVIEW_TASKS.map((task) => (
                    <div key={task.title} className="task-row !py-2.5">
                      <span className={`task-check h-4 w-4 ${task.done ? 'task-check--done' : ''}`}>
                        {task.done && <Flame size={9} />}
                      </span>
                      <span
                        className={`task-title flex-1 text-[11.5px] ${
                          task.done ? 'text-ink-3 line-through' : 'text-ink'
                        }`}
                      >
                        {task.title}
                      </span>
                      <span className={`badge ${task.badge} !px-2 !text-[9px]`}>{task.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* mini assistant */}
              <div className="hidden flex-col gap-2 rounded-xl border border-line bg-panel-2 p-2.5 lg:flex">
                <span className="flex items-center gap-1.5 text-[10.5px] font-semibold text-ink-2">
                  <Sparkles size={11} className="text-neon-2" />
                  AI Assist
                </span>
                <p className="rounded-lg bg-panel-3 p-2 text-[10px] leading-relaxed text-ink-2">
                  Two tasks are open — start with the hero section?
                </p>
                <p className="ml-3 self-end rounded-lg bg-[var(--neon-soft)] p-2 text-[10px] leading-relaxed text-neon-2">
                  Yes, plan it
                </p>
                <span className="mt-auto flex gap-1">
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}