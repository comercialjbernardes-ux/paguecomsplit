// ═══════════════════════════════════════════════════════════════
// Layout — Layout principal com Sidebar + area de conteudo
// ═══════════════════════════════════════════════════════════════

import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { ConnectionStatus } from './ConnectionStatus'

export function Layout() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-auto">
        <ConnectionStatus />
        <main className="flex-1">
          <div className="p-6 lg:p-8 max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
