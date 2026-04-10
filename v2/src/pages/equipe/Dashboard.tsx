// ═══════════════════════════════════════════════════════════════
// Dashboard de Resultados — Modulo Equipe
// Fechamento Capita mensal e acumulado, metas, projecoes
// Conforme fluxograma: KPIs + grafico barras + tabela vendedores
// ═══════════════════════════════════════════════════════════════

import { useState, useMemo } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, LineChart, Line,
} from 'recharts'
import {
  Users, TrendingUp, Target, DollarSign,
  ArrowUpRight, ArrowDownRight, LayoutDashboard,
} from 'lucide-react'
import { useEquipeData } from '../../hooks/useEquipeData'
import { useInternoData } from '../../hooks/useInternoData'
import { LoadingState } from '../../components/LoadingState'
import { ErrorBanner } from '../../components/ErrorBanner'
import {
  formatCurrency, formatCurrencyShort, formatPercent,
  formatNumber, calcAtingimento,
} from '../../utils/format'

type Periodo = 'mensal' | 'acumulado'

export function EquipeDashboard() {
  const { vendedores, dadosMensais, isLoading, error } = useEquipeData()
  const { fechamentos, fechamentoAtual } = useInternoData()
  const [periodo, setPeriodo] = useState<Periodo>('mensal')

  // KPIs calculados
  const kpis = useMemo(() => {
    const f = fechamentoAtual
    const totalFat = periodo === 'mensal'
      ? vendedores.reduce((s, v) => s + v.faturamentoMensal, 0)
      : vendedores.reduce((s, v) => s + v.faturamentoAcumulado, 0)
    const totalMeta = periodo === 'mensal'
      ? vendedores.reduce((s, v) => s + v.metaMensal, 0)
      : vendedores.reduce((s, v) => s + v.metaAcumulada, 0)

    return {
      faturamento: totalFat || f?.tpvTotal || 0,
      meta: totalMeta,
      atingimento: calcAtingimento(totalFat || f?.tpvTotal || 0, totalMeta || 1),
      ecsAtivos: f?.ecsAtivos || vendedores.length,
      markupPos: f?.markupPos || 0,
      valorLiquido: f?.valorLiquido || 0,
      variacaoTpv: f?.variacaoTpv,
    }
  }, [vendedores, fechamentoAtual, periodo])

  // Dados do grafico de barras (vendedores)
  const chartVendedores = useMemo(() => {
    return vendedores
      .map((v) => ({
        nome: v.nome.split(' ').slice(0, 2).join(' '),
        realizado: periodo === 'mensal' ? v.faturamentoMensal : v.faturamentoAcumulado,
        meta: periodo === 'mensal' ? v.metaMensal : v.metaAcumulada,
      }))
      .sort((a, b) => b.realizado - a.realizado)
  }, [vendedores, periodo])

  // Tabela vendedores ordenada
  const tabelaVendedores = useMemo(() => {
    return [...vendedores].sort((a, b) => {
      const fatA = periodo === 'mensal' ? a.faturamentoMensal : a.faturamentoAcumulado
      const fatB = periodo === 'mensal' ? b.faturamentoMensal : b.faturamentoAcumulado
      return fatB - fatA
    })
  }, [vendedores, periodo])

  if (isLoading) return <LoadingState message="Carregando dashboard..." />

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <LayoutDashboard className="w-7 h-7 text-emerald-500" />
            Dashboard de Resultados
          </h1>
          <p className="text-gray-500 mt-1">
            Fechamento Capita — {periodo === 'mensal' ? 'Mensal' : 'Acumulado'}
          </p>
        </div>

        {/* Toggle periodo */}
        <div className="flex bg-gray-100 rounded-lg p-1">
          {(['mensal', 'acumulado'] as Periodo[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriodo(p)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                periodo === p
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {p === 'mensal' ? 'Mensal' : 'Acumulado'}
            </button>
          ))}
        </div>
      </div>

      {error && <ErrorBanner message={error} />}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          icon={<DollarSign className="w-5 h-5" />}
          label="Faturamento Total"
          value={formatCurrencyShort(kpis.faturamento)}
          variacao={kpis.variacaoTpv}
          color="emerald"
        />
        <KPICard
          icon={<Target className="w-5 h-5" />}
          label="Meta Total"
          value={formatCurrencyShort(kpis.meta)}
          sublabel={`${formatPercent(kpis.atingimento)} atingido`}
          color="blue"
        />
        <KPICard
          icon={<Users className="w-5 h-5" />}
          label="ECs Ativos"
          value={formatNumber(kpis.ecsAtivos)}
          color="navy"
        />
        <KPICard
          icon={<TrendingUp className="w-5 h-5" />}
          label="Markup POS"
          value={formatCurrency(kpis.markupPos)}
          color="emerald"
        />
      </div>

      {/* Graficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Grafico: Realizado vs Meta por vendedor */}
        {chartVendedores.length > 0 && (
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Realizado vs Meta por Vendedor
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartVendedores}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="nome" tick={{ fontSize: 11 }} />
                <YAxis tickFormatter={(v: number) => formatCurrencyShort(v)} tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(value) => formatCurrency(Number(value))}
                  labelStyle={{ fontWeight: 600 }}
                />
                <Legend />
                <Bar dataKey="realizado" name="Realizado" fill="#00C896" radius={[4, 4, 0, 0]} />
                <Bar dataKey="meta" name="Meta" fill="#0D1B2A" radius={[4, 4, 0, 0]} opacity={0.3} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Grafico: Evolucao mensal */}
        {dadosMensais.length > 0 && (
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Evolucao do Faturamento
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dadosMensais}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
                <YAxis tickFormatter={(v: number) => formatCurrencyShort(v)} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Legend />
                <Line
                  type="monotone" dataKey="realizado" name="Realizado"
                  stroke="#00C896" strokeWidth={2} dot={{ r: 4 }}
                />
                <Line
                  type="monotone" dataKey="meta" name="Meta"
                  stroke="#0D1B2A" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Grafico: Metricas do Fechamento */}
        {fechamentos.length > 0 && (
          <div className="card lg:col-span-2">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Metricas de Fechamento por Periodo
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={fechamentos}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="periodo" tick={{ fontSize: 11 }} />
                <YAxis tickFormatter={(v: number) => formatCurrencyShort(v)} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Legend />
                <Bar dataKey="markupPos" name="Markup POS" fill="#00C896" radius={[4, 4, 0, 0]} />
                <Bar dataKey="valorLiquido" name="Valor Liquido" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Tabela de vendedores */}
      {tabelaVendedores.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Desempenho por Vendedor
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-3 font-medium text-gray-500">#</th>
                  <th className="text-left py-3 px-3 font-medium text-gray-500">Vendedor</th>
                  <th className="text-left py-3 px-3 font-medium text-gray-500">Regiao</th>
                  <th className="text-right py-3 px-3 font-medium text-gray-500">Realizado</th>
                  <th className="text-right py-3 px-3 font-medium text-gray-500">Meta</th>
                  <th className="text-right py-3 px-3 font-medium text-gray-500">% Ating.</th>
                  <th className="text-right py-3 px-3 font-medium text-gray-500">Variacao</th>
                </tr>
              </thead>
              <tbody>
                {tabelaVendedores.map((v, i) => {
                  const fat = periodo === 'mensal' ? v.faturamentoMensal : v.faturamentoAcumulado
                  const meta = periodo === 'mensal' ? v.metaMensal : v.metaAcumulada
                  const ating = calcAtingimento(fat, meta)
                  return (
                    <tr key={v.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="py-3 px-3 text-gray-400">{i + 1}</td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold">
                            {v.avatar}
                          </div>
                          <span className="font-medium text-gray-900">{v.nome}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-gray-600">{v.regiao}</td>
                      <td className="py-3 px-3 text-right font-medium">{formatCurrency(fat)}</td>
                      <td className="py-3 px-3 text-right text-gray-500">{formatCurrency(meta)}</td>
                      <td className="py-3 px-3 text-right">
                        <span className={ating >= 100 ? 'badge-success' : ating >= 80 ? 'badge-warning' : 'badge-error'}>
                          {formatPercent(ating)}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <span className={`flex items-center justify-end gap-1 text-sm ${v.variacaoMes >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                          {v.variacaoMes >= 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                          {formatPercent(Math.abs(v.variacaoMes))}
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

      {/* Estado vazio */}
      {!isLoading && vendedores.length === 0 && fechamentos.length === 0 && (
        <div className="card text-center py-12">
          <LayoutDashboard className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-500 mb-2">Sem dados para exibir</h3>
          <p className="text-sm text-gray-400">
            Conecte uma planilha Google Sheets em Configuracoes para visualizar os dados.
          </p>
        </div>
      )}
    </div>
  )
}

// ─── KPI Card ─────────────────────────────────────────────────

function KPICard({
  icon, label, value, sublabel, variacao, color,
}: {
  icon: React.ReactNode
  label: string
  value: string
  sublabel?: string
  variacao?: number
  color: 'emerald' | 'blue' | 'navy'
}) {
  const colorMap = {
    emerald: 'bg-emerald-50 text-emerald-600',
    blue: 'bg-blue-50 text-blue-600',
    navy: 'bg-navy-50 text-navy-600',
  }

  return (
    <div className="card-hover">
      <div className="flex items-center justify-between mb-3">
        <div className={`p-2 rounded-lg ${colorMap[color]}`}>{icon}</div>
        {variacao !== undefined && (
          <span className={`flex items-center gap-1 text-xs font-medium ${variacao >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
            {variacao >= 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
            {formatPercent(Math.abs(variacao))}
          </span>
        )}
      </div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
      {sublabel && <p className="text-xs text-gray-400 mt-1">{sublabel}</p>}
    </div>
  )
}
