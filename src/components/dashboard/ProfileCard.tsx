export default function ProfileCard() {
  return (
    <section className="panel-card anim-fade-up flex-row items-center justify-between gap-4 px-5 py-3.5 dim-target">
      <div className="flex min-w-0 items-center gap-3">
        <span
          className="grid h-9 w-9 flex-none place-content-center rounded-full text-[15px]"
          style={{ background: 'radial-gradient(circle at 30% 30%, #2a2d36, #14161c)', boxShadow: 'inset 0 0 0 1px var(--line)' }}
          role="img"
          aria-label="Panda avatar"
        >
          🐼
        </span>
        <div className="min-w-0 leading-tight">
          <p className="truncate text-[13px] font-medium text-ink">Nameless Panda #245</p>
          <p className="truncate text-[11px] text-ink-3">Microsoft</p>
        </div>
      </div>

      <div className="flex flex-none items-center gap-5">
        <div className="text-right leading-tight">
          <p className="text-[10.5px] uppercase tracking-wider text-ink-3">Overall Impact Score</p>
          <p className="mt-1 text-[15px] font-semibold text-ink-2">—</p>
        </div>
        <span className="h-8 w-px bg-line" aria-hidden="true" />
        <div className="text-right leading-tight">
          <p className="text-[10.5px] uppercase tracking-wider text-ink-3">Ideal Session Length</p>
          <p className="mt-1 text-[15px] font-semibold text-ink-2">—</p>
        </div>
      </div>
    </section>
  )
}
