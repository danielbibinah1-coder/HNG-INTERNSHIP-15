import { useId, useState } from 'react'
import { AlertCircle, Eye, EyeOff } from 'lucide-react'

interface FormFieldProps {
  label: string
  value: string
  onChange: (value: string) => void
  type?: 'text' | 'email' | 'password'
  placeholder?: string
  autoComplete?: string
  error?: string
  hint?: string
  autoFocus?: boolean
  disabled?: boolean
}

/**
 * Labelled input with inline validation messaging, used by both auth pages.
 * Errors are announced to screen readers via aria-describedby/aria-invalid.
 */
export default function FormField({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  autoComplete,
  error,
  hint,
  autoFocus = false,
  disabled = false,
}: FormFieldProps) {
  const id = useId()
  const errorId = `${id}-error`
  const hintId = `${id}-hint`
  const [revealed, setRevealed] = useState(false)

  const isPassword = type === 'password'
  const inputType = isPassword && revealed ? 'text' : type
  const describedBy = [error ? errorId : null, hint ? hintId : null].filter(Boolean).join(' ') || undefined

  return (
    <div className={isPassword ? 'relative' : undefined}>
      <label htmlFor={id} className="mb-1.5 block text-[11.5px] font-medium text-ink-2">
        {label}
      </label>

      <div className="relative">
        <input
          id={id}
          type={inputType}
          className={`field py-2.5 text-[13px] ${isPassword ? 'pr-10' : ''} ${
            error ? '!border-[rgba(255,23,68,0.62)]' : ''
          }`}
          value={value}
          placeholder={placeholder}
          autoComplete={autoComplete}
          autoFocus={autoFocus}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          onChange={(event) => onChange(event.target.value)}
        />

        {isPassword && (
          <button
            type="button"
            className="absolute right-1.5 top-1/2 grid h-7 w-7 -translate-y-1/2 place-content-center rounded-md text-ink-3 transition-colors duration-150 hover:text-ink"
            aria-label={revealed ? 'Hide password' : 'Show password'}
            aria-pressed={revealed}
            onClick={() => setRevealed((prev) => !prev)}
          >
            {revealed ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        )}
      </div>

      {error ? (
        <p id={errorId} className="mt-1.5 flex items-center gap-1.5 text-[11.5px] text-neon-2">
          <AlertCircle size={12} />
          {error}
        </p>
      ) : hint ? (
        <p id={hintId} className="mt-1.5 text-[11.5px] text-ink-3">
          {hint}
        </p>
      ) : null}
    </div>
  )
}
