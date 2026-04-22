// ═══════════════════════════════════════════════════════════════
// ConnectionStatus — Banner de status do Benchmark Anual
// Exibe quantos meses estão conectados via grade mensal.
// O modelo antigo de "planilha única" foi substituído pelo Benchmark.
// ═══════════════════════════════════════════════════════════════

import { useState } from 'react'
import { TrendingUp, X, Loader2 } from 'lucide-react'
import { useDataContext } from '../contexts/dataContextValue'

export function ConnectionStatus() {
  const { historicalSheets, isLoadingHistorical, periodo } = useDataContext()
  const [dismissed, setDismissed] = useState(false)

  // Carregando planilhas históricas
  if (isLoadingHistorical) {
    return (
      <div className="bg-violet-50 border-b border-violet-200 px-4 py-2 flex items-center gap-2 text-sm text-violet-700">
        <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />
        <span>Carregando planilhas do benchmark...</span>
      </div>
    )
  }

  // Nenhuma planilha cadastrada — banner explicativo (dispensável)
  if (historicalSheets.length === 0 || dismissed) return null

  // Meses conectados — banner verde compacto
  const count = historicalSheets.length
  const lastPeriodo = periodo || historicalSheets
    .slice()
    .sort((a, b) => a.year !== b.year ? b.year - a.year : b.month - a.month)[0]
    ?.label

  return (
    <div className="bg-emerald-50 border-b border-emerald-200 px-4 py-2 flex items-center justify-between gap-4 text-sm">
      <div className="flex items-center gap-2 text-emerald-700">
        <TrendingUp className="w-4 h-4 flex-shrink-0" />
        <span>
          Benchmark Anual: <strong>{count} {count === 1 ? 'mês' : 'meses'}</strong> conectado{count !== 1 ? 's' : ''}
          {lastPeriodo && <span className="text-emerald-500 ml-1">· último: {lastPeriodo}</span>}
        </span>
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="text-emerald-500 hover:text-emerald-700 flex-shrink-0"
        title="Fechar"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}
