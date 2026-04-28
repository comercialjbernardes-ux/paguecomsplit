// ═══════════════════════════════════════════════════════════════
// Entry Point — Venda Feita Dashboard v2
// Providers: AuthProvider -> SheetsProvider -> DataProvider -> App
// ═══════════════════════════════════════════════════════════════

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AuthProvider } from './contexts/AuthContext'
import { SheetsProvider } from './contexts/SheetsContext'
import { DataProvider } from './contexts/DataContext'
import { ErrorBoundary } from './components/ErrorBoundary'
import { installGlobalHandlers } from './services/errorLogger'
import App from './App'
import './index.css'

installGlobalHandlers()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <AuthProvider>
        <SheetsProvider>
          <DataProvider>
            <App />
          </DataProvider>
        </SheetsProvider>
      </AuthProvider>
    </ErrorBoundary>
  </StrictMode>,
)
