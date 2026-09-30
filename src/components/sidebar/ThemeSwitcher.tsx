import { Moon, Sun } from 'lucide-react'
import { useTheme } from '../../theme'
import type { Theme } from '../../types'

const options: { value: Theme; label: string; Icon: typeof Sun }[] = [
  { value: 'light', label: 'Light', Icon: Sun },
  { value: 'dark', label: 'Dark', Icon: Moon },
]

export default function ThemeSwitcher({ collapsed }: { collapsed: boolean }) {
  const { theme, setTheme, toggleTheme } = useTheme()

  if (collapsed) {
    const Current = theme === 'dark' ? Moon : Sun
    return (
      <button
        type="button"
        className="icon-btn icon-btn--ring h-8 w-8 self-center"
        title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
        onClick={toggleTheme}
      >
        <Current size={14} />
      </button>
    )
  }

  return (
    <div>
      <p className="kicker mb-2 px-2">Theme</p>
      <div className="flex gap-1 rounded-lg border border-line bg-panel-2 p-1">
        {options.map(({ value, label, Icon }) => {
          const active = theme === value
          return (
            <button
              key={value}
              type="button"
              aria-pressed={active}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-[11.5px] font-medium transition-all duration-150 ${
                active
                  ? 'bg-panel-3 text-neon-2 shadow-[0_0_10px_-5px_var(--glow)]'
                  : 'text-ink-3 hover:text-ink-2'
              }`}
              onClick={() => setTheme(value)}
            >
              <Icon size={12} />
              {label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
