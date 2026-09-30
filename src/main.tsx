import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'

const rootElement = document.getElementById('root')
if (!rootElement) {
  throw new Error('Root element #root not found')
}

/* App owns the provider stack: ThemeProvider > AuthProvider > router, and it
   mounts AppProvider (the workspace store) only for the authenticated route. */
createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
