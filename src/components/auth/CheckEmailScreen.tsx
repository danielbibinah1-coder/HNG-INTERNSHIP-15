import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Check, Mail } from 'lucide-react'
import { AuthServiceError } from '../../auth'

interface CheckEmailScreenProps {
  email: string
  onResend: () => Promise<void>
}

/**
 * Post-sign-up screen shown when Supabase requires email confirmation.
 *
 * Any email provider works here — the address is only ever displayed back to
 * the person who typed it; nothing is filtered or restricted.
 */
export default function CheckEmailScreen({ email, onResend }: CheckEmailScreenProps) {
  const [sending, setSending] = useState(false)
  const [status, setStatus] = useState<'idle' | 'sent' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const handleResend = async () => {
    setSending(true)
    setStatus('idle')
    setMessage('')
    try {
      await onResend()
      setStatus('sent')
      setMessage('Verification email sent again.')
    } catch (error) {
      setStatus('error')
      setMessage(
        error instanceof AuthServiceError
          ? error.message
          : 'Could not send the email again. Please try in a moment.',
      )
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="anim-fade-up">
      <span
        className="grid h-14 w-14 place-content-center rounded-2xl border border-[rgba(255,23,68,0.35)] bg-[var(--neon-soft)]"
        style={{ boxShadow: '0 0 26px -8px var(--glow)' }}
        aria-hidden="true"
      >
        <Mail size={22} className="text-neon-2" />
      </span>

      <h2 className="mt-5 text-[15px] font-semibold text-ink">Check your email</h2>
      <p className="mt-2 text-[13px] leading-relaxed text-ink-2">
        Your verification link has been sent to{' '}
        <span className="break-all font-medium text-ink">{email}</span>. Please verify your email to
        continue.
      </p>

      <ul className="mt-5 space-y-2.5">
        {[
          'Open the email we just sent you.',
          'Follow the verification link in it.',
          'Come back and sign in — your workspace is waiting.',
        ].map((step, index) => (
          <li key={step} className="flex items-start gap-2.5 text-[12.5px] leading-relaxed text-ink-2">
            <span
              className="mt-0.5 grid h-4 w-4 flex-none place-content-center rounded-full bg-[var(--neon-soft)] text-neon-2"
              aria-hidden="true"
            >
              <Check size={10} strokeWidth={3} />
            </span>
            <span>
              <span className="text-ink-3">{index + 1}. </span>
              {step}
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-6 space-y-3">
        <button type="button" className="btn-neon w-full py-2.5" onClick={handleResend} disabled={sending}>
          {sending ? 'Sending…' : 'Resend verification email'}
        </button>

        {status !== 'idle' && (
          <p
            role="status"
            className={`anim-fade-in text-center text-[11.5px] ${
              status === 'sent' ? 'text-ink-3' : 'text-neon-2'
            }`}
          >
            {message}
          </p>
        )}

        <p className="text-center text-[11.5px] text-ink-3">
          Nothing after a few minutes? Check spam, or{' '}
          <button
            type="button"
            className="font-medium text-neon-2 hover:underline"
            onClick={handleResend}
            disabled={sending}
          >
            send it again
          </button>
          .
        </p>

        <Link to="/signin" className="btn-outline w-full py-2.5">
          Back to sign in
        </Link>
      </div>
    </div>
  )
}