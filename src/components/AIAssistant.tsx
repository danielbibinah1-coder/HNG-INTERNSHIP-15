import { useEffect, useRef } from 'react'
import { Sparkles, X } from 'lucide-react'
import { SUGGESTED_PROMPTS, useApp } from '../store'
import ChatInput from './ai/ChatInput'
import ChatMessages from './ai/ChatMessages'

export default function AIAssistant() {
  const {
    chat,
    typing,
    sendChat,
    clearChat,
    aiOpen,
    setAiOpen,
    aiDrawerOpen,
    setAiDrawerOpen,
    aiFocusTick,
  } = useApp()
  const inputRef = useRef<HTMLInputElement>(null)

  /* "AI Assist" button focuses the input. */
  useEffect(() => {
    if (aiFocusTick > 0) inputRef.current?.focus()
  }, [aiFocusTick])

  const closePanel = () => {
    setAiOpen(false)
    setAiDrawerOpen(false)
  }

  const isEmpty = chat.length === 0 && !typing

  return (
    <aside
      className={`ai-panel panel-card dim-target ${aiOpen ? '' : 'ai-closed'} ${aiDrawerOpen ? 'drawer-open' : ''}`}
      aria-label="AI assistant"
    >
      <header className="flex flex-none items-start justify-between gap-3 border-b border-line px-5 py-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span
              className="grid h-6 w-6 flex-none place-content-center rounded-md"
              style={{ background: 'linear-gradient(135deg, var(--neon-2), var(--deep))' }}
              aria-hidden="true"
            >
              <Sparkles size={12} className="text-white" />
            </span>
            <h2 className="text-[14.5px] font-semibold tracking-tight text-ink">AI Assist</h2>
          </div>
          <p className="mt-1 text-[11px] text-ink-3">Knowledge, answers, ideas. One click away.</p>
        </div>
        <button
          type="button"
          className="icon-btn h-7 w-7 flex-none"
          title="Close AI assistant"
          aria-label="Close AI assistant"
          onClick={closePanel}
        >
          <X size={14} />
        </button>
      </header>

      {isEmpty ? (
        <div className="anim-fade-up flex min-h-0 flex-1 flex-col items-center justify-center overflow-y-auto px-5 py-6 text-center">
          <p className="text-[12px] text-ink-3">Hi, Pristia</p>
          <h3 className="mt-1.5 text-[19px] font-semibold tracking-tight text-ink">How can I help you?</h3>
          <span
            className="mt-4 grid h-11 w-11 place-content-center rounded-full border border-[rgba(255,23,68,0.35)] bg-[rgba(255,23,68,0.1)]"
            style={{ boxShadow: '0 0 26px -8px var(--glow)' }}
            aria-hidden="true"
          >
            <Sparkles size={18} className="text-neon-2" />
          </span>

          <div className="mt-7 w-full">
            <p className="kicker mb-2.5">Suggested</p>
            <div className="space-y-2">
              {SUGGESTED_PROMPTS.map((prompt) => (
                <button key={prompt} type="button" className="prompt-pill" onClick={() => sendChat(prompt)}>
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <ChatMessages />
      )}

      <div className="flex-none border-t border-line px-4 py-3.5">
        <ChatInput ref={inputRef} onSend={sendChat} disabled={typing} />
        <div className="mt-2 flex items-center justify-between">
          <span className="text-[10.5px] text-ink-3">Press Enter to send</span>
          {chat.length > 0 && (
            <button
              type="button"
              className="text-[10.5px] text-ink-3 transition-colors duration-150 hover:text-neon-2"
              onClick={clearChat}
            >
              Clear conversation
            </button>
          )}
        </div>
      </div>
    </aside>
  )
}
