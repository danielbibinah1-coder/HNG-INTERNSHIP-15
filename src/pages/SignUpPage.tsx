import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { AlertCircle, Loader2 } from 'lucide-react'
import AuthLayout from '../components/auth/AuthLayout'
import FormField from '../components/auth/FormField'
import SocialButtons from '../components/auth/SocialButtons'
import { ApiError } from '../api'
import { useAuth } from '../auth'

/** Local strength read-out for feedback; the API enforces the real rules. */
function strengthOf(password: string): { score: number; label: string } {
  let score = 0
  if (password.length >= 8) score += 1
  if (password.length >= 12) score += 1
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1
  if (/[0-9]/.test(password)) score += 1
  if (/[^A-Za-z0-9]/.test(password)) score += 1

  const labels = ['At least 8 characters', 'Weak', 'Fair', 'Good', 'Strong', 'Excellent']
  return { score, label: labels[Math.min(score, 5)] }
}

export default function SignUpPage() {
  const { user, ready, signUp } = useAuth()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [accepted, setAccepted] = useState(false)
  const [remember, setRemember] = useState(true)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const strength = strengthOf(password)

  if (ready && user) return <Navigate to="/app" replace />

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFormError('')

    const errors: Record<string, string> = {}
    if (name.trim().length < 2) errors.name = 'Enter your name (at least 2 characters).'
    if (!email.trim()) errors.email = 'Enter your email address.'
    if (password.length < 8) errors.password = 'Use at least 8 characters.'
    else if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
      errors.password = 'Mix in at least one letter and one number.'
    }
    if (confirm !== password) errors.confirm = 'Passwords do not match.'
    if (!accepted) errors.terms = 'Please accept the terms to create an account.'

    setFieldErrors(errors)
    if (Object.keys(errors).length > 0) return

    setSubmitting(true)
    try {
      await signUp(name.trim(), email.trim(), password, remember)
      navigate('/app', { replace: true })
    } catch (error) {
      if (error instanceof ApiError) {
        setFieldErrors(error.fields ?? {})
        setFormError(error.message)
      } else {
        setFormError('Something went wrong. Please try again.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout
      title="Create your workspace"
      subtitle="One account for your tasks, lists and AI history — synced by the TaskMaster API."
      footer={
        <>
          Already have an account?{' '}
          <Link to="/signin" className="font-medium text-neon-2 hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {formError && (
          <p
            role="alert"
            className="anim-fade-in flex items-start gap-2 rounded-xl border border-[rgba(255,23,68,0.35)] bg-[var(--neon-soft)] px-3.5 py-2.5 text-[12px] leading-relaxed text-neon-2"
          >
            <AlertCircle size={13} className="mt-0.5 flex-none" />
            {formError}
          </p>
        )}

        <FormField
          label="Full name"
          value={name}
          onChange={setName}
          placeholder="Ada Lovelace"
          autoComplete="name"
          error={fieldErrors.name}
          autoFocus
          disabled={submitting}
        />

        <FormField
          label="Work email"
          type="email"
          value={email}
          onChange={setEmail}
          placeholder="you@studio.com"
          autoComplete="email"
          error={fieldErrors.email}
          disabled={submitting}
        />

        <div>
          <FormField
            label="Password"
            type="password"
            value={password}
            onChange={setPassword}
            placeholder="At least 8 characters"
            autoComplete="new-password"
            error={fieldErrors.password}
            disabled={submitting}
          />

          {password.length > 0 && (
            <div className="mt-2 flex items-center gap-2">
              <span className="flex flex-1 gap-1" aria-hidden="true">
                {[0, 1, 2, 3, 4].map((step) => (
                  <span
                    key={step}
                    className={`h-1 flex-1 rounded-full transition-colors duration-200 ${
                      step < strength.score ? 'bg-neon' : 'bg-[var(--line)]'
                    }`}
                  />
                ))}
              </span>
              <span className="w-[96px] text-right text-[10.5px] text-ink-3">{strength.label}</span>
            </div>
          )}
        </div>

        <FormField
          label="Confirm password"
          type="password"
          value={confirm}
          onChange={setConfirm}
          placeholder="Repeat your password"
          autoComplete="new-password"
          error={fieldErrors.confirm}
          disabled={submitting}
        />

        <div className="space-y-2">
          <label className="flex cursor-pointer items-start gap-2 text-[12px] leading-relaxed text-ink-2">
            <input
              type="checkbox"
              className="mt-0.5 h-3.5 w-3.5 accent-[var(--neon)]"
              checked={accepted}
              onChange={(event) => setAccepted(event.target.checked)}
            />
            I agree to the terms of service and privacy policy.
          </label>
          {fieldErrors.terms && <p className="text-[11.5px] text-neon-2">{fieldErrors.terms}</p>}

          <label className="flex cursor-pointer items-center gap-2 text-[12px] text-ink-2">
            <input
              type="checkbox"
              className="h-3.5 w-3.5 accent-[var(--neon)]"
              checked={remember}
              onChange={(event) => setRemember(event.target.checked)}
            />
            Keep me signed in on this device
          </label>
        </div>

        <button type="submit" className="btn-neon w-full py-2.5" disabled={submitting}>
          {submitting ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              Creating your account…
            </>
          ) : (
            'Create account'
          )}
        </button>

        <SocialButtons />
      </form>
    </AuthLayout>
  )
}
