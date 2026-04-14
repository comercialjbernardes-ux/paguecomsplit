// ═══════════════════════════════════════════════════════════════
// Ranking — Modulo Equipe
// Competitividade e compartilhamento, extracao por fechamento
// Conforme fluxograma: podio top 3 + lista completa + filtro
// ═══════════════════════════════════════════════════════════════

import { useState, useMemo } from 'react'
import { Trophy, Medal, Filter, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { useEquipeData } from '../../hooks/useEquipeData'
import { LoadingState } from '../../components/LoadingState'
import { formatCurrency, formatPercent, calcAtingimento } from '../../utils/format'

type Periodo = 'mensal' | 'acumulado'

export function EquipeRanking() {
  const { vendedores, regioes, isLoading } = useEquipeData()
  const [periodo, setPeriodo] = useState<Periodo>('mensal')
  const [filtroRegiao, setFiltroRegiao] = useState('todas')

  // Ranking ordenado
  const ranking = useMemo(() => {
    let filtered = [...vendedores]
    if (filtroRegiao !== 'todas') {
      filtered = filtered.filter((v) => v.regiao === filtroRegiao)
    }
    return filtered.sort((a, b) => {
      const fatA = periodo === 'mensal' ? a.faturamentoMensal : a.faturamentoAcumulado
      const fatB = periodo === 'mensal' ? b.faturamentoMensal : b.faturamentoAcumulado
      return fatB - fatA
    })
  }, [vendedores, periodo, filtroRegiao])

  const top3 = ranking.slice(0, 3)
  const restante = ranking.slice(3)

  if (isLoading) return <LoadingState message="Carregando ranking..." />

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <Trophy className="w-7 h-7 text-amber-500" />
            Ranking
          </h1>
          <p className="text-gray-500 mt-1">Competitividade e extracao por fechamento</p>
        </div>
        <div className="flex gap-3">
          {/* Filtro regiao */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={filtroRegiao}
              onChange={(e) => setFiltroRegiao(e.target.value)}
              className="input-field w-auto"
            >
              <option value="todas">Todas as regioes</option>
              {regioes.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
          {/* Toggle periodo */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            {(['mensal', 'acumulado'] as Periodo[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriodo(p)}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  periodo === p ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
                }`}
              >
                {p === 'mensal' ? 'Mensal' : 'Acumulado'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Podio Top 3 */}
      {top3.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {top3.map((v, i) => {
            const fat = periodo === 'mensal' ? v.faturamentoMensal : v.faturamentoAcumulado
            const meta = periodo === 'mensal' ? v.metaMensal : v.metaAcumulada
            const ating = calcAtingimento(fat, meta)
            const medalColors = [
              'from-amber-400 to-amber-600',
              'from-gray-300 to-gray-500',
              'from-orange-400 to-orange-600',
            ]
            const bgColors = [
              'bg-amber-50 border-amber-200',
              'bg-gray-50 border-gray-200',
              'bg-orange-50 border-orange-200',
            ]
            return (
              <div key={v.id} className={`card border-2 ${bgColors[i]} relative`}>
                {/* Medal */}
                <div className={`absolute -top-3 -right-3 w-10 h-10 rounded-full bg-gradient-to-br ${medalColors[i]} flex items-center justify-center shadow-lg`}>
                  <span className="text-white text-sm font-bold">{i + 1}</span>
                </div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center text-lg font-bold text-gray-700">
                    {v.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{v.nome}</p>
                    <p className="text-xs text-gray-500">{v.regiao}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Faturamento</span>
                    <span className="font-semibold">{formatCurrency(fat)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Meta</span>
                    <span className="text-gray-600">{formatCurrency(meta)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Atingimento</span>
                    <span className={`font-semibold ${ating >= 100 ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {formatPercent(ating)}
                    </span>
                  </div>
                  {/* Barra de progresso */}
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div
                      className={`h-2 rounded-full transition-all ${ating >= 100 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                      style={{ width: `${Math.min(ating, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Lista completa */}
      {restante.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Medal className="w-5 h-5 text-gray-400" />
            Ranking Completo
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-3 font-medium text-gray-500">Pos.</th>
                  <th className="text-left py-3 px-3 font-medium text-gray-500">Vendedor</th>
                  <th className="text-left py-3 px-3 font-medium text-gray-500">Regiao</th>
                  <th className="text-right py-3 px-3 font-medium text-gray-500">Faturamento</th>
                  <th className="text-right py-3 px-3 font-medium text-gray-500">% Ating.</th>
                  <th className="text-right py-3 px-3 font-medium text-gray-500">Variacao</th>
                </tr>
              </thead>
              <tbody>
                {restante.map((v, i) => {
                  const fat = periodo === 'mensal' ? v.faturamentoMensal : v.faturamentoAcumulado
                  const meta = periodo === 'mensal' ? v.metaMensal : v.metaAcumulada
                  const ating = calcAtingimento(fat, meta)
                  return (
                    <tr key={v.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="py-3 px-3 font-medium text-gray-400">{i + 4}</td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center text-xs font-bold">
                            {v.avatar}
                          </div>
                          <span className="font-medium">{v.nome}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-gray-500">{v.regiao}</td>
                      <td className="py-3 px-3 text-right font-medium">{formatCurrency(fat)}</td>
                      <td className="py-3 px-3 text-right">
                        <span className={ating >= 100 ? 'badge-success' : ating >= 80 ? 'badge-warning' : 'badge-error'}>
                          {formatPercent(ating)}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <span className={`flex items-center justify-end gap-1 ${(v.variacaoMes ?? 0) >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                          {(v.variacaoMes ?? 0) >= 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                          {formatPercent(Math.abs(v.variacaoMes ?? 0))}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Vazio */}
      {vendedores.length === 0 && !isLoading && (
        <div className="card text-center py-12">
          <Trophy className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-500">Sem vendedores cadastrados</h3>
          <p className="text-sm text-gray-400 mt-1">Conecte a planilha com a aba "Vendedores".</p>
        </div>
      )}
    </div>
  )
}
