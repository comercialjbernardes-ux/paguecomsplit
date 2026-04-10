// ═══════════════════════════════════════════════════════════════
// ConnectionStatus — Banner nao-bloqueante de status da planilha
// Lê isOffline do DataContext; aparece apenas quando desconectado
// ═══════════════════════════════════════════════════════════════

import { useState } from 'react'
import { WifiOff, RefreshCw, X } from 'lucide-react'
import { useDataContext } from '../contexts/DataContext'

export function ConnectionStatus() {
  const { isOffline, error, refetch, isLoading } = useDataContext()
  const [dismissed, setDismissed] = useState(false)

  // So exibe se houver erro ou modo offline, e usuario nao dispensou
  if ((!isOffline && !error) || dismissed) return null

  return (
    <div className="bg-amber-50 border-b border-amber-200 px-4 py-2.5 flex items-center justify-between gap-4 text-sm">
      <div className="flex items-center gap-2 text-amber-800">
        <WifiOff className="w-4 h-4 flex-shrink-0" />
        <span>
          {isOffline
            ? 'Planilha desconectada — exibindo dados locais salvos'
            : `Erro de conexao — ${error}`}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => refetch()}
          disabled={isLoading}
          className="flex items-center gap-1.5 text-amber-700 hover:text-amber-900 font-medium disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          Reconectar
        </button>
        <button
          onClick={() => setDismissed(true)}
          className="text-amber-500 hover:text-amber-700 ml-2"
          title="Fechar"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
