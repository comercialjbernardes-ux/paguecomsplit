// ═══════════════════════════════════════════════════════════════
// Entry Point — Venda Feita Dashboard v2
// Providers: AuthProvider -> SheetsProvider -> DataProvider -> App
// ═══════════════════════════════════════════════════════════════

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AuthProvider } from './contexts/AuthContext'
import { SheetsProvider } from './contexts/SheetsContext'
import { DataProvider } from './contexts/DataContext'
import App from './App'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <SheetsProvider>
        <DataProvider>
          <App />
        </DataProvider>
      </SheetsProvider>
    </AuthProvider>
  </StrictMode>,
)
