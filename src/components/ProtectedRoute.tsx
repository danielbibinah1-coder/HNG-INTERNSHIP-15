import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../auth'

function BootScreen() {
  return (
    <div className="grid h-full place-items-center bg-bg">
      <div className="flex items-center gap-2.5 text-[12.5px] text-ink-3" role="status">
        <span
          className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-line border-t-[var(--neon)]"
          aria-hidden="true"
        />
        Loading your workspace…
      </div>
    </div>
  )
}

/**
 * Gates the product behind a real session: while the stored token is being
 * checked we show a boot screen, and signed-out visitors are sent to /signin
 * with the page they wanted so we can bounce them back after signing in.
 */
export default function ProtectedRoute() {
  const { user, ready, signedOut } = useAuth()
  const location = useLocation()

  if (!ready) return <BootScreen />

  /* A deliberate sign-out goes to the landing page; every other unauthenticated
     visit to /app goes to sign-in with the page that was requested. */
  if (!user) {
    return signedOut ? (
      <Navigate to="/" replace />
    ) : (
      <Navigate to="/signin" replace state={{ from: location.pathname }} />
    )
  }

  return <Outlet />
}
