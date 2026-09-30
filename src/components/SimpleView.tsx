import { useState } from 'react'
import type { LucideIcon } from 'lucide-react'
import { Activity, ArrowLeft, BarChart3, Check, Link2, LogOut, UserPlus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { initialsOf, useAuth } from '../auth'
import { useApp } from '../store'
import type { View } from '../types'

const VIEW_META: Record<Exclude<View, 'todo'>, { title: string; subtitle: string }> = {
  share: { title: 'Share My Impact', subtitle: 'Let teammates follow your progress in real time.' },
  analytics: { title: 'Analytics', subtitle: 'A clear read on your velocity, streaks and workload.' },
  leaderboard: { title: 'Leaderboard', subtitle: 'See how your workspace ranks this week.' },
  invites: { title: 'Invites', subtitle: 'Bring collaborators into your BetterTasks workspace.' },
  faqs: { title: 'FAQs', subtitle: 'Quick answers about how TaskMaster works.' },
  profile: { title: 'Profile', subtitle: 'Your account details and workspace membership.' },
}

const FAQS: { question: string; answer: string }[] = [
  {
    question: 'How do projects and lists work?',
    answer:
      'Everything you plan lives in lists, grouped under projects in the sidebar. Select a list to scope Today Task to it — click it again to see every task across the workspace.',
  },
  {
    question: 'Where is my data stored?',
    answer:
      'When you are signed in, your tasks, lists and chat history are saved to your TaskMaster account (SQLite behind the Express API) and cached in this browser, so they follow you between devices. Guests keep everything in this browser only.',
  },
  {
    question: 'What does Focus Mode do?',
    answer:
      'Focus Mode dims the sidebar and AI assistant, promotes a single active task, and gives you a “Complete & next” loop so you can work without distractions. Press Esc to exit.',
  },
  {
    question: 'Is there a premium plan?',
    answer:
      'Yes. Upgrade plan unlocks premium workspace features such as sharing progress with more people. You can activate it from the card in the sidebar.',
  },
]

export default function SimpleView() {
  const { view, sharingEnabled, toggleSharing, setView } = useApp()
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [copied, setCopied] = useState(false)

  if (view === 'todo') return null
  const meta = VIEW_META[view]

  const copyInvite = () => {
    void navigator.clipboard
      .writeText('https://taskmaster.app/join/bettertasks-12')
      .then(() => {
        setCopied(true)
        window.setTimeout(() => setCopied(false), 1600)
      })
      .catch(() => setCopied(false))
  }

  const backToTodo = (
    <button type="button" className="btn-outline mt-6" onClick={() => setView('todo')}>
      <ArrowLeft size={13} />
      Back to To-do
    </button>
  )

  const emptyState = (Icon: LucideIcon, note: string) => (
    <div className="flex flex-1 flex-col items-center justify-center py-14 text-center">
      <span
        className="grid h-12 w-12 place-content-center rounded-2xl border border-[rgba(255,23,68,0.3)] bg-[rgba(255,23,68,0.08)]"
        style={{ boxShadow: '0 0 28px -10px var(--glow)' }}
        aria-hidden="true"
      >
        <Icon size={20} className="text-neon-2" />
      </span>
      <p className="mt-4 max-w-[380px] text-[13px] leading-relaxed text-ink-2">{note}</p>
      {backToTodo}
    </div>
  )

  return (
    <section className="panel-card anim-fade-up flex-1 px-6 py-5" aria-label={meta.title}>
      <header className="flex-none">
        <h1 className="text-[17px] font-semibold tracking-tight text-ink">{meta.title}</h1>
        <p className="mt-0.5 text-[12.5px] text-ink-2">{meta.subtitle}</p>
      </header>

      <div className="flex min-h-0 flex-1 flex-col">
        {view === 'share' && (
          <div className="flex flex-1 flex-col items-center justify-center py-12 text-center">
            <span
              className={`grid h-12 w-12 place-content-center rounded-2xl border transition-colors duration-150 ${
                sharingEnabled
                  ? 'border-[rgba(255,23,68,0.45)] bg-[rgba(255,23,68,0.12)]'
                  : 'border-line bg-panel-2'
              }`}
              aria-hidden="true"
            >
              <Activity size={20} className={sharingEnabled ? 'text-neon-2' : 'text-ink-3'} />
            </span>
            <p className="mt-4 max-w-[400px] text-[13px] leading-relaxed text-ink-2">
              {sharingEnabled
                ? 'Sharing is on. Teammates in your workspace can now follow your completed tasks and impact score.'
                : 'Sharing is off. Turn it on so teammates can follow your completed tasks and impact score in real time.'}
            </p>
            <button
              type="button"
              className={`mt-5 ${sharingEnabled ? 'btn-outline' : 'btn-neon'}`}
              role="switch"
              aria-checked={sharingEnabled}
              onClick={toggleSharing}
            >
              {sharingEnabled ? (
                <>
                  <Check size={13} />
                  Sharing on — turn off
                </>
              ) : (
                'Turn on sharing'
              )}
            </button>
            {backToTodo}
          </div>
        )}

        {view === 'analytics' &&
          emptyState(
            Activity,
            'Your velocity, streaks and workload charts will appear here once you have a week of completed tasks. Keep using Today Task to collect signal.',
          )}
        {view === 'leaderboard' &&
          emptyState(
            BarChart3,
            'Rankings unlock when your workspace enables shared impact. Turn on Share My Impact to start competing with your teammates.',
          )}

        {view === 'invites' && (
          <div className="flex flex-1 flex-col items-center justify-center py-12 text-center">
            <span
              className="grid h-12 w-12 place-content-center rounded-2xl border border-[rgba(255,23,68,0.3)] bg-[rgba(255,23,68,0.08)]"
              aria-hidden="true"
            >
              <UserPlus size={20} className="text-neon-2" />
            </span>
            <p className="mt-4 text-[13px] text-ink-2">Share this link with a teammate to invite them:</p>
            <div className="mt-3 flex w-full max-w-[420px] items-center gap-2 rounded-xl border border-line bg-panel-2 px-3 py-2">
              <span className="min-w-0 flex-1 truncate text-left text-[12px] text-ink-3">
                taskmaster.app/join/bettertasks-12
              </span>
              <button type="button" className="btn-neon !px-3 !py-1.5" onClick={copyInvite}>
                <Link2 size={13} />
                {copied ? 'Copied' : 'Copy link'}
              </button>
            </div>
            <p className="mt-3 text-[11.5px] text-ink-3">No invites sent yet — copied links are valid for 7 days.</p>
            {backToTodo}
          </div>
        )}

        {view === 'faqs' && (
          <div className="mt-4 min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
            {FAQS.map((item) => (
              <details
                key={item.question}
                className="group rounded-xl border border-line bg-panel-2 px-4 py-3 transition-colors duration-150 open:border-[rgba(255,23,68,0.3)]"
              >
                <summary className="cursor-pointer list-none text-[13px] font-medium text-ink">
                  {item.question}
                </summary>
                <p className="mt-2 text-[12.5px] leading-relaxed text-ink-2">{item.answer}</p>
              </details>
            ))}
            {backToTodo}
          </div>
        )}

        {view === 'profile' && (
          <div className="flex flex-1 flex-col items-center justify-center py-12 text-center">
            <span
              className="grid h-16 w-16 place-content-center rounded-full text-[18px] font-semibold text-white"
              style={{ background: 'linear-gradient(135deg, var(--neon-2), var(--deep))' }}
              aria-hidden="true"
            >
              {user ? initialsOf(user.name) : 'G'}
            </span>
            <h2 className="mt-4 text-[15px] font-semibold text-ink">{user?.name ?? 'Guest'}</h2>
            <p className="text-[12.5px] text-ink-2">{user?.email ?? 'Not signed in'}</p>
            <p className="mt-1 text-[11.5px] text-ink-3">
              {user ? 'TaskMaster account' : 'Guest workspace'} · Odama Studio
            </p>
            <div className="mt-5 flex gap-2">
              <button type="button" className="btn-outline" onClick={() => setView('todo')}>
                <ArrowLeft size={13} />
                Back to To-do
              </button>
              <button
                type="button"
                className="btn-soft"
                onClick={() => {
                  signOut()
                  navigate('/', { replace: true })
                }}
              >
                <LogOut size={13} />
                Sign out
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}


