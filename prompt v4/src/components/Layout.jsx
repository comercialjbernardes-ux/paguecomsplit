import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { AlertCircle } from 'lucide-react'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import ErrorReport from './ErrorReport'

export default function Layout() {
  const [reportOpen, setReportOpen] = useState(false)

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <div style={{ marginLeft: 240, flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Topbar />
        <main
          style={{
            marginTop: 64,
            background: '#F7F8FA',
            minHeight: 'calc(100vh - 64px)',
            overflowY: 'auto',
          }}
        >
          {/* Botão "Gerar Relatório" — discreto, topo direito */}
          <div className="flex justify-end px-8 pt-3">
            <button
              onClick={() => setReportOpen(true)}
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-[#EF4444] transition-colors duration-150"
            >
              <AlertCircle size={12} strokeWidth={1.5} />
              Gerar Relatório de Erro
            </button>
          </div>

          <Outlet />
        </main>
      </div>

      {reportOpen && <ErrorReport onClose={() => setReportOpen(false)} />}
    </div>
  )
}
