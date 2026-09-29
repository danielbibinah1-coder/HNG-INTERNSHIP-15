import { ChevronsLeft, ChevronsRight, LifeBuoy, UserPlus } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useApp } from '../store'
import type { View } from '../types'
import Logo from './sidebar/Logo'
import MainMenu from './sidebar/MainMenu'
import ProjectLists from './sidebar/ProjectLists'
import ThemeSwitcher from './sidebar/ThemeSwitcher'
import UpgradeCard from './sidebar/UpgradeCard'
import UserProfile from './sidebar/UserProfile'

const lowerItems: { view: View; label: string; Icon: LucideIcon }[] = [
  { view: 'invites', label: 'Invites', Icon: UserPlus },
  { view: 'faqs', label: 'FAQs', Icon: LifeBuoy },
]

export default function Sidebar() {
  const {
    sidebarCollapsed,
    setSidebarCollapsed,
    sidebarDrawerOpen,
    setSidebarDrawerOpen,
    view,
    setView,
  } = useApp()
  const collapsed = sidebarCollapsed

  return (
    <aside
      className={`sidebar panel-card dim-target ${sidebarDrawerOpen ? 'drawer-open' : ''}`}
      aria-label="Workspace navigation"
    >
      <div className={`flex items-center gap-1 pb-3 pt-4 ${collapsed ? 'justify-center px-2' : 'px-3.5'}`}>
        <Logo size={28} />
        {!collapsed && (
          <span className="min-w-0 flex-1 truncate pl-1.5 text-[14.5px] font-bold tracking-tight text-ink">
            BetterTasks
          </span>
        )}
        <button
          type="button"
          className={`icon-btn h-7 w-7 flex-none ${collapsed ? '' : 'ml-auto'}`}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          onClick={() => setSidebarCollapsed(!collapsed)}
        >
          {collapsed ? <ChevronsRight size={14} /> : <ChevronsLeft size={14} />}
        </button>
      </div>

      <div className={`scroll-area min-h-0 flex-1 space-y-6 pb-4 ${collapsed ? 'px-2' : 'px-3.5'}`}>
        <MainMenu collapsed={collapsed} />

        {!collapsed && (
          <>
            <ProjectLists />
            <UpgradeCard />
          </>
        )}

        <nav aria-label="Support">
          <ul className="space-y-1">
            {lowerItems.map(({ view: value, label, Icon }) => (
              <li key={value}>
                <button
                  type="button"
                  title={label}
                  className={`nav-item ${view === value ? 'nav-item--active' : ''} ${collapsed ? 'justify-center px-0 py-2' : ''}`}
                  onClick={() => {
                    setView(value)
                    setSidebarDrawerOpen(false)
                  }}
                >
                  <Icon size={15} className="nav-icon" />
                  {!collapsed && <span className="min-w-0 flex-1 truncate">{label}</span>}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <ThemeSwitcher collapsed={collapsed} />
      </div>

      <div className={`pb-4 ${collapsed ? 'px-2' : 'px-3.5'}`}>
        <UserProfile collapsed={collapsed} />
      </div>
    </aside>
  )
}
