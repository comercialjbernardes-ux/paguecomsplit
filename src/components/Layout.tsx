import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Menu, TrendingUp, AlertCircle } from 'lucide-react'
import { Sidebar } from './Sidebar'
import { ErrorReport } from './ErrorReport'

export function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [reportOpen, setReportOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      {/* ── Mobile overlay (por trás do sidebar) ─────────────────────── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ───────────────────────────────────────────────────── */}
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* ── Área principal ────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar mobile */}
        <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-[#E2E8F0] flex-shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-[8px] hover:bg-slate-100 transition-colors"
            aria-label="Abrir menu"
          >
            <Menu size={20} strokeWidth={1.5} className="text-[#0D1B2A]" />
          </button>

          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-[#00C896] rounded-lg flex items-center justify-center">
              <TrendingUp size={14} strokeWidth={1.5} className="text-white" />
            </div>
            <span className="font-bold text-sm text-[#0D1B2A]">Venda Feita</span>
          </div>

          <button
            onClick={() => setReportOpen(true)}
            className="p-2 rounded-[8px] hover:bg-slate-100 transition-colors"
            aria-label="Gerar relatório de erro"
          >
            <AlertCircle size={18} strokeWidth={1.5} className="text-slate-400" />
          </button>
        </header>

        {/* Botão "Gerar Relatório" desktop — topo direito, discreto */}
        <div className="hidden lg:flex justify-end px-8 pt-4 flex-shrink-0">
          <button
            onClick={() => setReportOpen(true)}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-[#EF4444] transition-colors duration-150"
          >
            <AlertCircle size={13} strokeWidth={1.5} />
            Gerar Relatório
          </button>
        </div>

        {/* Conteúdo das rotas */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>

      {/* ── Modal de relatório de erro ─────────────────────────────────── */}
      {reportOpen && <ErrorReport onClose={() => setReportOpen(false)} />}
    </div>
  )
}
