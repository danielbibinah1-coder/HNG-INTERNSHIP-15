import { useEffect } from 'react'
import { Check, Sparkles, X } from 'lucide-react'
import { useApp } from '../store'

const FEATURES = [
  'Unlimited projects, lists and tasks',
  'Share your progress with more people',
  'Priority AI Assist with longer conversations',
]

export default function UpgradeModal() {
  const { upgradeOpen, setUpgradeOpen, premium, upgrade } = useApp()

  useEffect(() => {
    if (!upgradeOpen) return
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setUpgradeOpen(false)
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [upgradeOpen, setUpgradeOpen])

  if (!upgradeOpen) return null

  const close = () => setUpgradeOpen(false)

  return (
    <div
      className="anim-fade-in fixed inset-0 z-[70] grid place-items-center bg-[rgba(4,5,8,0.66)] p-4"
      role="presentation"
      onClick={close}
    >
      <div
        className="dropdown anim-fade-up w-full max-w-sm p-5"
        role="dialog"
        aria-modal="true"
        aria-label="Upgrade plan"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <span
            className="grid h-9 w-9 flex-none place-content-center rounded-xl"
            style={{ background: 'linear-gradient(135deg, var(--neon-2), var(--deep))', boxShadow: '0 0 18px -6px var(--glow)' }}
            aria-hidden="true"
          >
            <Sparkles size={16} className="text-white" />
          </span>
          <button type="button" className="icon-btn h-7 w-7" aria-label="Close dialog" onClick={close}>
            <X size={14} />
          </button>
        </div>

        {premium ? (
          <>
            <h2 className="mt-4 text-[15px] font-semibold text-ink">You are on Premium</h2>
            <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-2">
              Your workspace has every premium feature unlocked. Thank you for supporting TaskMaster.
            </p>
            <button type="button" className="btn-neon mt-5 w-full" onClick={close}>
              <Check size={14} />
              Done
            </button>
          </>
        ) : (
          <>
            <h2 className="mt-4 text-[15px] font-semibold text-ink">Upgrade plan</h2>
            <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-2">
              Unlock your premium workspace, share your progress with more people and much more.
            </p>
            <ul className="mt-4 space-y-2">
              {FEATURES.map((feature) => (
                <li key={feature} className="flex items-start gap-2.5 text-[12.5px] text-ink-2">
                  <span className="mt-0.5 grid h-4 w-4 flex-none place-content-center rounded-full bg-[rgba(255,23,68,0.15)]">
                    <Check size={10} className="text-neon-2" />
                  </span>
                  {feature}
                </li>
              ))}
            </ul>
            <p className="mt-4 text-[11.5px] text-ink-3">
              <span className="text-[15px] font-semibold text-ink">$12</span> / month per workspace
            </p>
            <div className="mt-4 flex gap-2">
              <button type="button" className="btn-outline flex-1" onClick={close}>
                Maybe later
              </button>
              <button
                type="button"
                className="btn-neon flex-1"
                onClick={() => {
                  upgrade()
                  close()
                }}
              >
                Upgrade now
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
