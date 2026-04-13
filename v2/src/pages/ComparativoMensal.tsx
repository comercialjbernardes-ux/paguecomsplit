// ═══════════════════════════════════════════════════════════════
// Comparativo Mensal — Aba de analise periodo a periodo
// KPIs com semaforo vs mes anterior: TPV, Liquido, Markup, ECs
// ═══════════════════════════════════════════════════════════════

import { useMemo } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, LineChart, Line,
} from 'recharts'
import { BarChart2, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react'
import { useInternoData } from '../hooks/useInternoData'
import { LoadingState } from '../components/LoadingState'
import { formatCurrency, formatCurrencyShort, formatPercent } from '../utils/format'
import type { DadosFechamento } from '../types'

function Semaforo({ valor }: { valor: number | null }) {
  if (valor === null) return <span className="text-gray-300 text-xs">—</span>
  if (Math.abs(valor) < 0.5) return (
    <span className="flex items-center gap-1 text-xs text-gray-500 font-medium">
      <Minus className="w-3 h-3" /> estavel
    </span>
  )
  const positivo = valor > 0
  return (
    <span className={`flex items-center gap-1 text-xs font-semibold ${positivo ? 'text-emerald-600' : 'text-red-600'}`}>
      {positivo ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
      {formatPercent(Math.abs(valor))}
    </span>
  )
}

function Badge({ valor }: { valor: number | null }) {
  if (valor === null) return null
  const cor = valor >= 5 ? 'bg-emerald-100 text-emerald-700'
    : valor >= 0 ? 'bg-blue-50 text-blue-700'
    : valor >= -5 ? 'bg-yellow-100 text-yellow-700'
    : 'bg-red-100 text-red-700'
  const label = valor >= 5 ? 'Saudavel'
    : valor >= 0 ? 'Estavel'
    : valor >= -5 ? 'Atencao'
    : 'Critico'
  return <span className={`px-2 py-0.5 rounded text-xs font-semibold ${cor}`}>{label}</span>
}

export function ComparativoMensalPage() {
  const { fechamentos, isLoading } = useInternoData()

  // Adiciona variacoes em relacao ao mes anterior
  const periodos = useMemo(() => {
    return fechamentos.map((f: DadosFechamento, i: number) => {
      const ant = fechamentos[i - 1]
      const pct = (atual: number, anterior: number | undefined) =>
        anterior && anterior > 0 ? ((atual - anterior) / anterior) * 100 : null
      return {
        ...f,
        varTPV:     pct(f.tpvTotal,    ant?.tpvTotal),
        varMarkup:  pct(f.markupPos,   ant?.markupPos),
        varLiquido: pct(f.valorLiquido, ant?.valorLiquido),
        varEcs:     pct(f.ecsAtivos,   ant?.ecsAtivos),
        varMargem:  pct(f.taxaMargem,  ant?.taxaMargem),
      }
    }).reverse()
  }, [fechamentos])

  // Dados para grafico de linhas (markup + liquido)
  const chartLinhas = useMemo(() => {
    return [...fechamentos].map((f) => ({
      periodo: f.periodo,
      markup: f.markupPos,
      liquido: f.valorLiquido,
      tpv: f.tpvTotal,
    }))
  }, [fechamentos])

  if (isLoading) return <LoadingState message="Carregando comparativo..." />

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <BarChart2 className="w-7 h-7 text-violet-500" />
          Comparativo Mensal
        </h1>
        <p className="text-gray-500 mt-1">Evolucao de KPIs periodo a periodo com semaforo</p>
      </div>

      {fechamentos.length < 2 ? (
        <div className="card text-center py-12">
          <BarChart2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-500">Dados insuficientes</h3>
          <p className="text-sm text-gray-400 mt-1">Sao necessarios pelo menos 2 periodos para comparacao.</p>
        </div>
      ) : (
        <>
          {/* Graficos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card">
              <h3 className="text-base font-semibold text-gray-900 mb-4">Markup POS e Valor Liquido</h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={chartLinhas}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="periodo" tick={{ fontSize: 10 }} />
                  <YAxis tickFormatter={(v: number) => formatCurrencyShort(v)} tick={{ fontSize: 10 }} />
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Legend />
                  <Line type="monotone" dataKey="markup" name="Markup POS" stroke="#00C896" strokeWidth={2} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="liquido" name="Valor Liquido" stroke="#3B82F6" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="card">
              <h3 className="text-base font-semibold text-gray-900 mb-4">TPV por Periodo</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={chartLinhas}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="periodo" tick={{ fontSize: 10 }} />
                  <YAxis tickFormatter={(v: number) => formatCurrencyShort(v)} tick={{ fontSize: 10 }} />
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Bar dataKey="tpv" name="TPV Total" fill="#6366F1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Tabela comparativa */}
          <div className="card overflow-x-auto">
            <h3 className="text-base font-semibold text-gray-900 mb-4">Tabela Comparativa — Todos os Periodos</h3>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 px-3 font-medium text-gray-500">Periodo</th>
                  <th className="text-right py-2 px-3 font-medium text-gray-500">TPV</th>
                  <th className="text-right py-2 px-3 font-medium text-gray-500">Δ TPV</th>
                  <th className="text-right py-2 px-3 font-medium text-gray-500">Markup</th>
                  <th className="text-right py-2 px-3 font-medium text-gray-500">Δ Markup</th>
                  <th className="text-right py-2 px-3 font-medium text-gray-500">Liquido</th>
                  <th className="text-right py-2 px-3 font-medium text-gray-500">Δ Liquido</th>
                  <th className="text-right py-2 px-3 font-medium text-gray-500">ECs</th>
                  <th className="text-right py-2 px-3 font-medium text-gray-500">Δ ECs</th>
                  <th className="text-right py-2 px-3 font-medium text-gray-500">Status</th>
                </tr>
              </thead>
              <tbody>
                {periodos.map((f, i) => (
                  <tr key={f.periodo} className={`border-b border-gray-50 hover:bg-gray-50 ${i === 0 ? 'bg-blue-50/50 font-semibold' : ''}`}>
                    <td className="py-2 px-3 font-medium">
                      {f.periodo}
                      {i === 0 && <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">atual</span>}
                    </td>
                    <td className="py-2 px-3 text-right">{formatCurrency(f.tpvTotal)}</td>
                    <td className="py-2 px-3 text-right"><Semaforo valor={f.varTPV} /></td>
                    <td className="py-2 px-3 text-right">{formatCurrency(f.markupPos)}</td>
                    <td className="py-2 px-3 text-right"><Semaforo valor={f.varMarkup} /></td>
                    <td className="py-2 px-3 text-right">{formatCurrency(f.valorLiquido)}</td>
                    <td className="py-2 px-3 text-right"><Semaforo valor={f.varLiquido} /></td>
                    <td className="py-2 px-3 text-right">{f.ecsAtivos}</td>
                    <td className="py-2 px-3 text-right"><Semaforo valor={f.varEcs} /></td>
                    <td className="py-2 px-3 text-right"><Badge valor={f.varMarkup} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
