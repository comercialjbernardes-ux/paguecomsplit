// ═══════════════════════════════════════════════════════════════
// Entry Point — Venda Feita Dashboard v2
// Providers: AuthProvider -> SheetsProvider -> App
// ═══════════════════════════════════════════════════════════════

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AuthProvider } from './contexts/AuthContext'
import { SheetsProvider } from './contexts/SheetsContext'
import App from './App'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <SheetsProvider>
        <App />
      </SheetsProvider>
    </AuthProvider>
  </StrictMode>,
)
