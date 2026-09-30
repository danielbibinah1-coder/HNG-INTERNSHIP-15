import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './auth'
import { AppProvider } from './store'
import { ThemeProvider } from './theme'
import ProtectedRoute from './components/ProtectedRoute'
import LandingPage from './pages/LandingPage'
import SignInPage from './pages/SignInPage'
import SignUpPage from './pages/SignUpPage'
import WorkspacePage from './pages/WorkspacePage'

/**
 * Route map:
 *   /        marketing landing page
 *   /signin  sign in (redirects to /app when a session exists)
 *   /signup  create an account
 *   /app     the product — guarded by ProtectedRoute + AuthProvider session
 *
 * HashRouter is deliberate: static hosts such as GitHub Pages serve the app
 * from /<repo>/ and would 404 on real paths like /signin.
 */
export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <HashRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/signin" element={<SignInPage />} />
            <Route path="/signup" element={<SignUpPage />} />

            <Route element={<ProtectedRoute />}>
              <Route
                path="/app"
                element={
                  <AppProvider>
                    <WorkspacePage />
                  </AppProvider>
                }
              />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </HashRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}
