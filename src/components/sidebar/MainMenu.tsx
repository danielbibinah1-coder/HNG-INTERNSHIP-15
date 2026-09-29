import { Activity, ListTodo, Share2, Trophy } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useApp } from '../../store'
import type { View } from '../../types'

const items: { view: View; label: string; Icon: LucideIcon }[] = [
  { view: 'todo', label: 'To-do', Icon: ListTodo },
  { view: 'share', label: 'Share My Impact', Icon: Share2 },
  { view: 'analytics', label: 'Analytics', Icon: Activity },
  { view: 'leaderboard', label: 'Leaderboard', Icon: Trophy },
]

export default function MainMenu({ collapsed }: { collapsed: boolean }) {
  const { view, setView, sharingEnabled, setSidebarDrawerOpen } = useApp()

  return (
    <nav aria-label="Main menu">
      {!collapsed && <p className="kicker mb-2 px-2">Main menu</p>}
      <ul className="space-y-1">
        {items.map(({ view: value, label, Icon }) => (
          <li key={value}>
            <button
              type="button"
              title={label}
              aria-current={view === value ? 'page' : undefined}
              className={`nav-item ${view === value ? 'nav-item--active' : ''} ${collapsed ? 'justify-center px-0 py-2' : ''}`}
              onClick={() => {
                setView(value)
                setSidebarDrawerOpen(false)
              }}
            >
              <Icon size={15} className="nav-icon" strokeWidth={2} />
              {!collapsed && (
                <>
                  <span className="min-w-0 flex-1 truncate">{label}</span>
                  {value === 'share' && (
                    <span
                      className={`rounded border px-1.5 py-px text-[9px] font-semibold tracking-wide ${
                        sharingEnabled
                          ? 'border-[rgba(255,23,68,0.45)] bg-[rgba(255,23,68,0.1)] text-neon-2'
                          : 'border-line text-ink-3'
                      }`}
                    >
                      {sharingEnabled ? 'ON' : 'OFF'}
                    </span>
                  )}
                </>
              )}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  )
}
