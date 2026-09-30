import { CloudUpload, Flame, LayoutGrid, ListChecks, Moon, Sparkles } from 'lucide-react'

const FEATURES = [
  {
    Icon: LayoutGrid,
    title: 'Three-column workspace',
    body: 'Lists, today’s tasks and the assistant sit side by side, so nothing is more than a glance away.',
  },
  {
    Icon: ListChecks,
    title: 'Tasks, lists and projects',
    body: 'Group work into projects, scope the dashboard to a single list, and re-prioritise in one click.',
  },
  {
    Icon: Flame,
    title: 'Focus Mode',
    body: 'Dim everything else, promote one task and run a “complete & next” loop until the list is clear.',
  },
  {
    Icon: Sparkles,
    title: 'AI Assist',
    body: 'The assistant reads your open tasks and answers with concrete next steps instead of filler.',
  },
  {
    Icon: CloudUpload,
    title: 'Account sync',
    body: 'Signed-in work is stored by the TaskMaster API and cached locally, so refreshes and new devices change nothing.',
  },
  {
    Icon: Moon,
    title: 'Light and dark',
    body: 'Both themes are first-class citizens, and each device remembers its own preference.',
  },
]

export default function FeaturesSection() {
  return (
    <section id="features" className="mx-auto w-full max-w-[1180px] scroll-mt-20 px-5 py-16 sm:px-8 lg:py-20">
      <header className="max-w-[620px]">
        <span className="kicker">Features</span>
        <h2 className="mt-2.5 text-[27px] font-bold leading-tight tracking-tight text-ink sm:text-[32px]">
          Everything the day needs. Nothing it doesn’t.
        </h2>
        <p className="mt-3 text-[13.5px] leading-relaxed text-ink-2">
          No dashboards to configure, no plugins to install. Open the workspace and start working —
          every screen was designed around finishing the next task.
        </p>
      </header>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map(({ Icon, title, body }) => (
          <article
            key={title}
            className="rounded-2xl border border-line bg-panel p-5 transition-[transform,border-color,box-shadow] duration-200 hover:-translate-y-0.5 hover:border-[rgba(255,23,68,0.35)] hover:shadow-[0_18px_40px_-28px_var(--glow)]"
          >
            <span className="grid h-8 w-8 place-content-center rounded-xl bg-[var(--neon-soft)] text-neon-2">
              <Icon size={15} />
            </span>
            <h3 className="mt-3.5 text-[13.5px] font-semibold text-ink">{title}</h3>
            <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-2">{body}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
