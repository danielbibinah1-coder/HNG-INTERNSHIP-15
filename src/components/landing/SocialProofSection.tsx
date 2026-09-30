import { Database, KeyRound, ShieldCheck } from 'lucide-react'

const FOUNDATIONS = [
  {
    Icon: ShieldCheck,
    title: 'scrypt password hashing',
    body: 'Passwords are salted and hashed with scrypt on the server — the database never holds a readable password.',
  },
  {
    Icon: KeyRound,
    title: 'Signed JWT sessions',
    body: 'Seven-day tokens are signed with HS256 and sent as bearer credentials. Signing out drops the token on this device.',
  },
  {
    Icon: Database,
    title: 'SQLite workspace store',
    body: 'Each account owns one workspace record, written through a small Express API with validation on every request.',
  },
]

const AUDIENCES = [
  { title: 'Designers', body: 'Keep client lists apart and never lose the thread when switching projects.' },
  { title: 'Founders', body: 'Run the day from one screen: what matters, what is next, what is stuck.' },
  { title: 'Students', body: 'Track coursework in Focus Mode sprints between classes.' },
]

export default function SocialProofSection() {
  return (
    <section className="mx-auto w-full max-w-[1180px] px-5 py-16 sm:px-8 lg:py-20">
      <header className="max-w-[620px]">
        <span className="kicker">Under the hood</span>
        <h2 className="mt-2.5 text-[27px] font-bold leading-tight tracking-tight text-ink sm:text-[32px]">
          Real accounts, not a staged demo
        </h2>
        <p className="mt-3 text-[13.5px] leading-relaxed text-ink-2">
          Sign-up creates a genuine user row, and the workspace you see is the one stored against your
          account. Here is how that works.
        </p>
      </header>

      <div className="mt-10 grid gap-4 lg:grid-cols-3">
        {FOUNDATIONS.map(({ Icon, title, body }) => (
          <article key={title} className="rounded-2xl border border-line bg-panel p-5">
            <span className="grid h-8 w-8 place-content-center rounded-xl bg-panel-2 text-neon-2">
              <Icon size={15} />
            </span>
            <h3 className="mt-3.5 text-[13.5px] font-semibold text-ink">{title}</h3>
            <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-2">{body}</p>
          </article>
        ))}
      </div>

      <div className="mt-4 grid gap-4 overflow-hidden rounded-2xl border border-line bg-panel p-6 lg:grid-cols-[0.9fr_1.1fr] lg:p-8">
        <div>
          <span className="kicker">Who it is for</span>
          <blockquote className="mt-3 text-[15px] font-medium leading-relaxed text-ink">
            “A task manager should disappear behind the work. That is why every column here exists to
            answer one question: what do I do next?”
          </blockquote>
          <p className="mt-3 text-[11.5px] text-ink-3">The TaskMaster design principle</p>
        </div>

        <dl className="grid gap-4 sm:grid-cols-3">
          {AUDIENCES.map(({ title, body }) => (
            <div key={title} className="rounded-xl border border-line bg-panel-2 p-4">
              <dt className="text-[12.5px] font-semibold text-ink">{title}</dt>
              <dd className="mt-1.5 text-[11.5px] leading-relaxed text-ink-2">{body}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}
