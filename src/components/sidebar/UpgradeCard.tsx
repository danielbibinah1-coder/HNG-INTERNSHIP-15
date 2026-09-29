import { ArrowUpRight, Check } from 'lucide-react'
import { useApp } from '../../store'

export default function UpgradeCard() {
  const { premium, setUpgradeOpen } = useApp()

  return (
    <button
      type="button"
      onClick={() => setUpgradeOpen(true)}
      className="group relative w-full overflow-hidden rounded-xl border border-[rgba(255,23,68,0.32)] p-3.5 text-left transition-all duration-150 hover:border-[rgba(255,23,68,0.55)]"
      style={{
        background: premium
          ? 'linear-gradient(135deg, rgba(255,23,68,0.16), rgba(176,0,48,0.08))'
          : 'linear-gradient(135deg, rgba(176,0,48,0.38), rgba(255,23,68,0.10))',
        boxShadow: '0 0 26px -14px var(--glow)',
      }}
      aria-label={premium ? 'Manage premium plan' : 'Upgrade plan'}
    >
      <div className="flex items-start gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-[12.5px] font-semibold text-white">
            {premium ? 'Premium active' : 'Upgrade plan'}
          </p>
          <p className="mt-1 text-[11px] leading-snug text-white/65">
            {premium
              ? 'Your workspace is on TaskMaster Premium. Enjoy the extra seats.'
              : 'Unlock your premium workspace, share your progress with more people and much more.'}
          </p>
        </div>
        <span
          className={`grid h-7 w-7 flex-none place-content-center rounded-full transition-transform duration-150 group-hover:rotate-45 ${
            premium ? 'bg-white/15 text-white' : 'bg-neon text-white'
          }`}
        >
          {premium ? <Check size={13} /> : <ArrowUpRight size={13} />}
        </span>
      </div>
    </button>
  )
}
