import { useEffect, useRef, useState } from 'react'
import { ChevronDown, Link2, LogOut, User } from 'lucide-react'
import { useApp } from '../../store'

export default function UserProfile({ collapsed }: { collapsed: boolean }) {
  const { setView, setSignedOut, setSidebarDrawerOpen } = useApp()
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handleMouseDown = (event: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleMouseDown)
    return () => document.removeEventListener('mousedown', handleMouseDown)
  }, [open])

  const copyLink = () => {
    void navigator.clipboard
      .writeText('https://taskmaster.app/w/pristia-12')
      .then(() => {
        setCopied(true)
        window.setTimeout(() => setCopied(false), 1600)
      })
      .catch(() => setCopied(false))
  }

  return (
    <div ref={wrapRef} className="relative mt-2 border-t border-line pt-3">
      <button
        type="button"
        className={`flex w-full items-center gap-2.5 rounded-lg p-1.5 transition-colors duration-150 hover:bg-panel-3 ${
          collapsed ? 'justify-center' : ''
        }`}
        aria-expanded={open}
        aria-haspopup="menu"
        title="Account menu"
        onClick={() => setOpen((value) => !value)}
      >
        <span
          className="grid h-7 w-7 flex-none place-content-center rounded-full text-[10.5px] font-semibold text-white"
          style={{ background: 'linear-gradient(135deg, var(--neon-2), var(--deep))' }}
          aria-hidden="true"
        >
          PC
        </span>
        {!collapsed && (
          <>
            <span className="min-w-0 flex-1 text-left">
              <span className="block truncate text-[12.5px] font-medium text-ink">Pristia Candra</span>
              <span className="block truncate text-[10.5px] text-ink-3">Workspace member #12</span>
            </span>
            <ChevronDown
              size={13}
              className={`flex-none text-ink-3 transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
            />
          </>
        )}
      </button>

      {open && (
        <div className="dropdown absolute bottom-full left-0 right-0 z-30 mb-2 p-1" role="menu">
          <button
            type="button"
            role="menuitem"
            className="dropdown-item"
            onClick={() => {
              setView('profile')
              setOpen(false)
              setSidebarDrawerOpen(false)
            }}
          >
            <User size={13} />
            Profile
          </button>
          <button type="button" role="menuitem" className="dropdown-item" onClick={copyLink}>
            <Link2 size={13} />
            {copied ? 'Link copied' : 'Copy profile link'}
          </button>
          <button
            type="button"
            role="menuitem"
            className="dropdown-item dropdown-item--danger"
            onClick={() => {
              setOpen(false)
              setSignedOut(true)
            }}
          >
            <LogOut size={13} />
            Sign out
          </button>
        </div>
      )}
    </div>
  )
}
