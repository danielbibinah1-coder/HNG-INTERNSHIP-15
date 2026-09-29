import { useApp } from '../../store'

export default function GreetingCard() {
  const { setView } = useApp()

  return (
    <section className="panel-card anim-fade-up flex-row items-center justify-between gap-4 px-5 py-4 dim-target">
      <div className="min-w-0">
        <h1 className="truncate text-[17px] font-semibold tracking-tight text-ink">
          Good Morning, Pristia!
        </h1>
        <p className="mt-0.5 truncate text-[12.5px] text-ink-2">What do you plan to do today?</p>
      </div>

      <button
        type="button"
        className="group flex flex-none items-center gap-2.5 rounded-full border border-line bg-panel-2 py-1.5 pl-1.5 pr-3.5 transition-colors duration-150 hover:border-[rgba(255,23,68,0.4)]"
        title="Open profile"
        onClick={() => setView('profile')}
      >
        <span
          className="grid h-7 w-7 place-content-center rounded-full text-[10.5px] font-semibold text-white"
          style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}
          aria-hidden="true"
        >
          OS
        </span>
        <span className="text-left leading-tight">
          <span className="block text-[12px] font-medium text-ink">Odama Studio</span>
          <span className="block text-[10.5px] text-ink-3">1.35K</span>
        </span>
        <span className="ml-1 h-6 w-px bg-line" aria-hidden="true" />
        <span className="text-[10.5px] font-medium text-ink-3 transition-colors duration-150 group-hover:text-neon-2">
          Workspace
        </span>
      </button>
    </section>
  )
}
