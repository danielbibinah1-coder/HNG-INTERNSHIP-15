import { useState } from 'react'
import { Minus, Plus } from 'lucide-react'

const FAQS = [
  {
    question: 'Do I need an account to use TaskMaster?',
    answer:
      'Yes — the workspace is behind a real session. Creating one takes an email, a password of at least 8 characters with a letter and a number, and that is it. No email confirmation step is wired up in this prototype.',
  },
  {
    question: 'Where is my data stored?',
    answer:
      'Signed-in workspaces are saved by the TaskMaster API into a local SQLite file, and mirrored in this browser so the UI stays instant. Guests keep everything in the browser only.',
  },
  {
    question: 'Is the AI assistant a real model?',
    answer:
      'It is a canned assistant: it reads your actual task list and answers from keyword-aware templates, so replies stay useful and instant without sending your tasks to a third party.',
  },
  {
    question: 'What happens if I forget my password?',
    answer:
      'Password reset is not implemented yet — the API stores only scrypt hashes, so a reset flow would need email delivery. Sign-up validation prevents the most common weak passwords in the meantime.',
  },
  {
    question: 'Can I run it myself?',
    answer:
      'Yes. The repo ships the Vite client and the Express API together: npm install, npm run dev:api for the API and npm run dev for the client. The database file is created on first boot.',
  },
]

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <section id="faqs" className="scroll-mt-20 border-t border-line bg-panel/40 py-16 lg:py-20">
      <div className="mx-auto grid w-full max-w-[1180px] gap-10 px-5 sm:px-8 lg:grid-cols-[0.8fr_1.2fr]">
        <header>
          <span className="kicker">FAQs</span>
          <h2 className="mt-2.5 text-[27px] font-bold leading-tight tracking-tight text-ink sm:text-[32px]">
            Questions, answered honestly
          </h2>
          <p className="mt-3 text-[13.5px] leading-relaxed text-ink-2">
            Including the parts that are still prototypes.
          </p>
        </header>

        <div className="divide-y divide-[var(--line)] overflow-hidden rounded-2xl border border-line bg-panel">
          {FAQS.map((faq, index) => {
            const open = openIndex === index
            return (
              <article key={faq.question}>
                <h3>
                  <button
                    type="button"
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors duration-150 hover:bg-panel-2"
                    aria-expanded={open}
                    onClick={() => setOpenIndex(open ? null : index)}
                  >
                    <span className="text-[13px] font-medium text-ink">{faq.question}</span>
                    <span
                      className={`grid h-6 w-6 flex-none place-content-center rounded-full border border-line text-ink-3 transition-colors duration-150 ${
                        open ? 'border-[rgba(255,23,68,0.5)] text-neon-2' : ''
                      }`}
                      aria-hidden="true"
                    >
                      {open ? <Minus size={11} /> : <Plus size={11} />}
                    </span>
                  </button>
                </h3>
                {open && (
                  <p className="anim-fade-in px-5 pb-5 text-[12.5px] leading-relaxed text-ink-2">
                    {faq.answer}
                  </p>
                )}
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
