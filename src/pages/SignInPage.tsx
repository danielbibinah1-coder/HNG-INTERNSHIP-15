import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { AlertCircle, Loader2 } from 'lucide-react'
import AuthLayout from '../components/auth/AuthLayout'
import FormField from '../components/auth/FormField'
import SocialButtons from '../components/auth/SocialButtons'
import { ApiError } from '../api'
import { useAuth } from '../auth'

interface SignInState {
  from?: string
}

export default function SignInPage() {
  const { user, ready, signIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(true)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const from = (location.state as SignInState | null)?.from ?? '/app'

  /* Already signed in (or restored from storage) — go straight to the workspace. */
  if (ready && user) return <Navigate to={from} replace />

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFormError('')

    const errors: Record<string, string> = {}
    if (!email.trim()) errors.email = 'Enter your email address.'
    if (!password) errors.password = 'Enter your password.'
    setFieldErrors(errors)
    if (Object.keys(errors).length > 0) return

    setSubmitting(true)
    try {
      await signIn(email.trim(), password, remember)
      navigate(from, { replace: true })
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
      title="Welcome back"
      subtitle="Sign in to pick up your tasks, lists and AI history exactly where you left off."
      footer={
        <>
          New to TaskMaster?{' '}
          <Link to="/signup" className="font-medium text-neon-2 hover:underline">
            Create an account
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
          label="Email"
          type="email"
          value={email}
          onChange={setEmail}
          placeholder="you@studio.com"
          autoComplete="email"
          error={fieldErrors.email}
          autoFocus
          disabled={submitting}
        />

        <FormField
          label="Password"
          type="password"
          value={password}
          onChange={setPassword}
          placeholder="Your password"
          autoComplete="current-password"
          error={fieldErrors.password}
          disabled={submitting}
        />

        <div className="flex items-center justify-between gap-3">
          <label className="flex cursor-pointer items-center gap-2 text-[12px] text-ink-2">
            <input
              type="checkbox"
              className="h-3.5 w-3.5 accent-[var(--neon)]"
              checked={remember}
              onChange={(event) => setRemember(event.target.checked)}
            />
            Keep me signed in
          </label>
          <span
            className="text-[11.5px] text-ink-3"
            title="Password reset is not part of this prototype yet"
          >
            Forgot password?
          </span>
        </div>

        <button type="submit" className="btn-neon w-full py-2.5" disabled={submitting}>
          {submitting ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              Signing in…
            </>
          ) : (
            'Sign in'
          )}
        </button>

        <SocialButtons />

        <p className="text-[11px] leading-relaxed text-ink-3">
          Accounts are stored by the TaskMaster API. If signing in fails, start it with{' '}
          <code className="rounded bg-panel-3 px-1 py-0.5 text-[10.5px] text-ink-2">npm run dev:api</code>.
        </p>
      </form>
    </AuthLayout>
  )
}
