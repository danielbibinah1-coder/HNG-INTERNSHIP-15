import { Menu, Sparkles } from 'lucide-react'
import { useApp } from '../store'
import Logo from '../components/sidebar/Logo'
import Sidebar from '../components/Sidebar'
import Dashboard from '../components/Dashboard'
import AIAssistant from '../components/AIAssistant'
import UpgradeModal from '../components/UpgradeModal'

/**
 * The product itself: the three-column workspace. Mounted only for an
 * authenticated session (see ProtectedRoute), which is what lets AppProvider
 * mirror the account's workspace to the API.
 */
export default function WorkspacePage() {
  const {
    sidebarCollapsed,
    aiOpen,
    focusMode,
    sidebarDrawerOpen,
    setSidebarDrawerOpen,
    aiDrawerOpen,
    setAiDrawerOpen,
    openAi,
  } = useApp()

  const shellClass = [
    'shell',
    aiOpen ? 'ai-open' : '',
    sidebarCollapsed ? 'nav-collapsed' : '',
    focusMode ? 'focus-mode' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className="flex h-full flex-col bg-bg">
      {/* ---------- mobile top bar ---------- */}
      <header className="mobile-bar flex-none items-center gap-3 border-b border-line bg-panel px-4 py-2.5 dim-target">
        <button
          type="button"
          className="icon-btn h-8 w-8"
          aria-label="Open navigation"
          onClick={() => setSidebarDrawerOpen(true)}
        >
          <Menu size={16} />
        </button>
        <span className="flex items-center gap-2">
          <Logo size={22} />
          <span className="text-[13.5px] font-bold tracking-tight text-ink">TaskMaster</span>
        </span>
        <button type="button" className="btn-neon ml-auto !py-1.5" onClick={openAi}>
          <Sparkles size={12} />
          AI Assist
        </button>
      </header>

      {/* ---------- three column workspace ---------- */}
      <div className={shellClass}>
        <Sidebar />
        <Dashboard />
        <AIAssistant />
      </div>

      {(sidebarDrawerOpen || aiDrawerOpen) && (
        <div
          className="backdrop"
          role="presentation"
          onClick={() => {
            setSidebarDrawerOpen(false)
            setAiDrawerOpen(false)
          }}
        />
      )}

      <UpgradeModal />
    </div>
  )
}
