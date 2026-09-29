import { forwardRef, useState } from 'react'
import { Send } from 'lucide-react'

interface Props {
  onSend: (text: string) => void
  disabled?: boolean
}

const ChatInput = forwardRef<HTMLInputElement, Props>(function ChatInput({ onSend, disabled = false }, ref) {
  const [value, setValue] = useState('')

  const submit = () => {
    const trimmed = value.trim()
    if (!trimmed || disabled) return
    onSend(trimmed)
    setValue('')
  }

  return (
    <div className="flex items-center gap-2 rounded-xl border border-line bg-panel-2 px-3 py-2 transition-colors duration-150 focus-within:border-[rgba(255,23,68,0.55)]">
      <input
        ref={ref}
        className="min-w-0 flex-1 bg-transparent text-[13px] text-ink outline-none placeholder:text-ink-3"
        placeholder="Write something..."
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter') submit()
        }}
        aria-label="Write a message for the AI assistant"
        maxLength={500}
      />
      <button
        type="button"
        className="grid h-8 w-8 flex-none place-content-center rounded-full text-white transition-transform duration-150 hover:scale-105 active:scale-95 disabled:scale-100 disabled:opacity-40"
        style={{ background: 'linear-gradient(180deg, var(--neon-2), var(--neon))', boxShadow: '0 4px 14px -6px var(--glow)' }}
        disabled={!value.trim() || disabled}
        onClick={submit}
        title="Send message"
        aria-label="Send message"
      >
        <Send size={14} />
      </button>
    </div>
  )
})

export default ChatInput
