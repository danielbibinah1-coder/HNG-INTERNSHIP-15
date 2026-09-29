import { useEffect, useRef } from 'react'
import { Sparkles } from 'lucide-react'
import { useApp } from '../../store'

function AssistantAvatar() {
  return (
    <span
      className="mt-0.5 grid h-6 w-6 flex-none place-content-center rounded-full"
      style={{ background: 'linear-gradient(135deg, var(--neon-2), var(--deep))' }}
      aria-hidden="true"
    >
      <Sparkles size={11} className="text-white" />
    </span>
  )
}

export default function ChatMessages() {
  const { chat, typing } = useApp()
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [chat.length, typing])

  return (
    <div className="scroll-area min-h-0 flex-1 space-y-3.5 px-4 py-4" aria-live="polite">
      {chat.map((message) => (
        <div
          key={message.id}
          className={`anim-fade-up flex gap-2 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
        >
          {message.role === 'assistant' && <AssistantAvatar />}
          <div
            className={
              message.role === 'user'
                ? 'max-w-[85%] whitespace-pre-line rounded-2xl rounded-br-md px-3.5 py-2.5 text-[12.5px] leading-relaxed text-white'
                : 'max-w-[85%] whitespace-pre-line rounded-2xl rounded-bl-md border border-line bg-panel-2 px-3.5 py-2.5 text-[12.5px] leading-relaxed text-ink-2'
            }
            style={
              message.role === 'user'
                ? { background: 'linear-gradient(180deg, var(--neon-2), var(--neon))' }
                : undefined
            }
          >
            {message.content}
          </div>
        </div>
      ))}

      {typing && (
        <div className="anim-fade-in flex items-center gap-2">
          <AssistantAvatar />
          <span className="flex items-center gap-1.5 rounded-2xl rounded-bl-md border border-line bg-panel-2 px-3.5 py-3.5">
            <span className="typing-dot" />
            <span className="typing-dot" />
            <span className="typing-dot" />
          </span>
        </div>
      )}

      <div ref={endRef} />
    </div>
  )
}
