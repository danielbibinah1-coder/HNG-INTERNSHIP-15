import { Info } from 'lucide-react'

/* Brand marks kept inline so the bundle keeps its tiny dependency surface. */
function GoogleMark() {
  return (
    <svg width="14" height="14" viewBox="0 0 18 18" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.91c1.7-1.57 2.69-3.88 2.69-6.62Z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.8 5.95-2.18l-2.91-2.26c-.81.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.95v2.33A9 9 0 0 0 9 18Z"
      />
      <path fill="#FBBC05" d="M3.97 10.72a5.4 5.4 0 0 1 0-3.44V4.95H.95a9 9 0 0 0 0 8.1l3.02-2.33Z" />
      <path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.9 11.43 0 9 0A9 9 0 0 0 .95 4.95l3.02 2.33C4.68 5.16 6.66 3.58 9 3.58Z"
      />
    </svg>
  )
}

function GithubMark() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true">
      <path
        fill="currentColor"
        d="M8 0a8 8 0 0 0-2.53 15.59c.4.07.55-.17.55-.38v-1.33c-2.23.48-2.7-1.07-2.7-1.07-.36-.93-.89-1.18-.89-1.18-.73-.5.05-.49.05-.49.8.06 1.23.83 1.23.83.72 1.23 1.88.87 2.34.67.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.6 7.6 0 0 1 4 0c1.53-1.03 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.28.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48v2.19c0 .21.15.46.55.38A8 8 0 0 0 8 0Z"
      />
    </svg>
  )
}

/**
 * Social sign-in placeholders. They are intentionally disabled: wiring Google
 * or GitHub needs OAuth client credentials, and pretending otherwise would be
 * worse than saying so.
 */
export default function SocialButtons() {
  return (
    <div>
      <div className="flex items-center gap-3">
        <span className="h-px flex-1 bg-[var(--line)]" />
        <span className="kicker">or</span>
        <span className="h-px flex-1 bg-[var(--line)]" />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2.5">
        <button
          type="button"
          className="btn-outline justify-center gap-2 py-2.5 disabled:cursor-not-allowed disabled:opacity-55"
          disabled
          title="Google sign-in needs OAuth credentials"
        >
          <GoogleMark />
          Google
        </button>
        <button
          type="button"
          className="btn-outline justify-center gap-2 py-2.5 disabled:cursor-not-allowed disabled:opacity-55"
          disabled
          title="GitHub sign-in needs OAuth credentials"
        >
          <GithubMark />
          GitHub
        </button>
      </div>

      <p className="mt-2.5 flex items-start gap-1.5 text-[11px] leading-relaxed text-ink-3">
        <Info size={12} className="mt-0.5 flex-none" />
        Social sign-in is not connected yet — email and password work today.
      </p>
    </div>
  )
}
