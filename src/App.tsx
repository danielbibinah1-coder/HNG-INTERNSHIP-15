import { Menu, Sparkles } from 'lucide-react'
import { useApp } from './store'
import Logo from './components/sidebar/Logo'
import Sidebar from './components/Sidebar'
import Dashboard from './components/Dashboard'
import AIAssistant from './components/AIAssistant'
import UpgradeModal from './components/UpgradeModal'

export default function App() {
  const {
    sidebarCollapsed,
    aiOpen,
    focusMode,
    sidebarDrawerOpen,
    setSidebarDrawerOpen,
    aiDrawerOpen,
    setAiDrawerOpen,
    openAi,
    signedOut,
    setSignedOut,
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
          <span className="text-[13.5px] font-bold tracking-tight text-ink">BetterTasks</span>
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

      {/* ---------- signed out overlay ---------- */}
      {signedOut && (
        <div
          className="anim-fade-in fixed inset-0 z-[80] grid place-items-center bg-[rgba(4,5,8,0.82)] p-6"
          role="dialog"
          aria-modal="true"
          aria-label="Signed out"
        >
          <div className="dropdown w-full max-w-[300px] p-6 text-center">
            <span
              className="mx-auto grid h-12 w-12 place-content-center rounded-full text-[14px] font-semibold text-white"
              style={{ background: 'linear-gradient(135deg, var(--neon-2), var(--deep))' }}
              aria-hidden="true"
            >
              PC
            </span>
            <h2 className="mt-3.5 text-[14.5px] font-semibold text-ink">Signed out</h2>
            <p className="mt-1.5 text-[12px] leading-relaxed text-ink-2">
              You left this workspace. Your tasks and lists stay saved in this browser.
            </p>
            <button type="button" className="btn-neon mt-4 w-full" onClick={() => setSignedOut(false)}>
              Sign back in
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
