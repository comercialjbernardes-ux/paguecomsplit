// ═══════════════════════════════════════════════════════════════
// Relatorios — Pagina central de geracao de relatorios
// Visao de relatorios por periodo com exportacao PDF/Excel/CSV
// ═══════════════════════════════════════════════════════════════

import { useState, useMemo, useRef } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, PieChart, Pie, Cell,
} from 'recharts'
import {
  FileBarChart, Calendar, TrendingUp,
  DollarSign, Users, ArrowUpRight, ArrowDownRight,
  Printer,
} from 'lucide-react'
import { useInternoData } from '../hooks/useInternoData'
import { useEquipeData } from '../hooks/useEquipeData'
import { LoadingState } from '../components/LoadingState'
import { ExportMenu } from '../components/ExportMenu'
import { exportElementToPDF } from '../services/exportService'
import {
  formatCurrency, formatCurrencyShort, formatPercent,
  getChartColor,
} from '../utils/format'
import type { DadosFechamento } from '../types'
import type { ReportData } from '../services/exportService'

type PeriodoRelatorio = 'mensal' | 'trimestral' | 'anual'

export function RelatoriosPage() {
  const { fechamentos, lancamentos, clientes } = useInternoData()
  const { vendedores } = useEquipeData()
  const [periodoTipo, setPeriodoTipo] = useState<PeriodoRelatorio>('mensal')
  const [periodoSelecionado, setPeriodoSelecionado] = useState<string>('todos')
  const reportRef = useRef<HTMLDivElement>(null)

  // Periodos disponiveis
  const periodosDisponiveis = useMemo(() => {
    return fechamentos.map((f: DadosFechamento) => f.periodo)
  }, [fechamentos])

  // Fechamento filtrado pelo periodo
  const fechamentosFiltrados = useMemo(() => {
    if (periodoSelecionado === 'todos') return fechamentos
    return fechamentos.filter((f: DadosFechamento) => f.periodo === periodoSelecionado)
  }, [fechamentos, periodoSelecionado])

  // Lancamentos filtrados
  const lancamentosFiltrados = useMemo(() => {
    if (periodoSelecionado === 'todos') return lancamentos
    // Filtrar por periodo baseado na data
    return lancamentos.filter((l) => {
      // Tenta casar o mes/ano do lancamento com o periodo
      if (!l.data) return false
      return true // Sem filtro de periodo especifico nos lancamentos
    })
  }, [lancamentos, periodoSelecionado])

  // KPIs consolidados
  const kpis = useMemo(() => {
    const totalReceitas = lancamentosFiltrados
      .filter((l) => l.tipo === 'receita')
      .reduce((s, l) => s + l.valor, 0)
    const totalDespesas = lancamentosFiltrados
      .filter((l) => l.tipo === 'despesa')
      .reduce((s, l) => s + l.valor, 0)
    const ultimoFech = fechamentosFiltrados[fechamentosFiltrados.length - 1]

    return {
      tpvTotal: fechamentosFiltrados.reduce((s, f) => s + f.tpvTotal, 0),
      valorLiquido: fechamentosFiltrados.reduce((s, f) => s + f.valorLiquido, 0),
      totalReceitas,
      totalDespesas,
      saldo: totalReceitas - totalDespesas,
      ecsAtivos: ultimoFech?.ecsAtivos || 0,
      markupTotal: fechamentosFiltrados.reduce((s, f) => s + f.markupPos, 0),
      numPeriodos: fechamentosFiltrados.length,
    }
  }, [fechamentosFiltrados, lancamentosFiltrados])

  // Dados para o grafico de evolucao
  const evolucaoData = useMemo(() => {
    return fechamentosFiltrados.map((f: DadosFechamento) => ({
      periodo: f.periodo,
      tpv: f.tpvTotal,
      liquido: f.valorLiquido,
      markup: f.markupPos,
    }))
  }, [fechamentosFiltrados])

  // Dados por categoria (pizza)
  const porCategoria = useMemo(() => {
    const map = new Map<string, number>()
    lancamentosFiltrados.forEach((l) => {
      const cat = l.categoria || 'Sem categoria'
      map.set(cat, (map.get(cat) || 0) + Math.abs(l.valor))
    })
    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8)
  }, [lancamentosFiltrados])

  // Dados para exportacao
  const exportData: ReportData = useMemo(() => ({
    fechamentos: fechamentosFiltrados,
    vendedores,
    lancamentos: lancamentosFiltrados,
    clientes,
  }), [fechamentosFiltrados, vendedores, lancamentosFiltrados, clientes])

  // Imprimir / PDF via captura de tela
  const handlePrint = async () => {
    if (reportRef.current) {
      await exportElementToPDF(reportRef.current, 'relatorio-visual-venda-feita')
    }
  }

  const { isLoading } = useInternoData()

  if (isLoading) {
    return <LoadingState message="Carregando dados do relatorio..." />
  }

  return (
    <div className="space-y-6">
      {/* Header com acoes */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <FileBarChart className="w-7 h-7 text-blue-500" />
            Relatorios
          </h1>
          <p className="text-gray-500 mt-1">
            Gere relatorios por periodo e exporte em PDF, Excel ou CSV
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="btn-outline flex items-center gap-2"
          >
            <Printer className="w-4 h-4" />
            Imprimir
          </button>
          <ExportMenu
            data={exportData}
            fileName="relatorio-venda-feita"
          />
        </div>
      </div>

      {/* Filtros de periodo */}
      <div className="card">
        <div className="flex flex-wrap items-center gap-4">
          <Calendar className="w-4 h-4 text-gray-400" />

          {/* Tipo de periodo */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            {(['mensal', 'trimestral', 'anual'] as PeriodoRelatorio[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriodoTipo(p)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  periodoTipo === p
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {p === 'mensal' ? 'Mensal' : p === 'trimestral' ? 'Trimestral' : 'Anual'}
              </button>
            ))}
          </div>

          {/* Periodo especifico */}
          <select
            value={periodoSelecionado}
            onChange={(e) => setPeriodoSelecionado(e.target.value)}
            className="input-field w-auto"
          >
            <option value="todos">Todos os periodos</option>
            {periodosDisponiveis.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>

          <span className="text-xs text-gray-400">
            {kpis.numPeriodos} periodo(s) selecionado(s)
          </span>
        </div>
      </div>

      {/* Conteudo do relatorio (capturavel para PDF) */}
      <div ref={reportRef} className="space-y-6 bg-white rounded-xl p-1">
        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <ReportKPI
            icon={<DollarSign className="w-5 h-5" />}
            label="TPV Total"
            value={formatCurrencyShort(kpis.tpvTotal)}
            color="emerald"
          />
          <ReportKPI
            icon={<TrendingUp className="w-5 h-5" />}
            label="Valor Liquido"
            value={formatCurrencyShort(kpis.valorLiquido)}
            color="blue"
          />
          <ReportKPI
            icon={<ArrowUpRight className="w-5 h-5" />}
            label="Total Receitas"
            value={formatCurrencyShort(kpis.totalReceitas)}
            sublabel={`${lancamentosFiltrados.filter((l) => l.tipo === 'receita').length} lancamentos`}
            color="emerald"
          />
          <ReportKPI
            icon={<ArrowDownRight className="w-5 h-5" />}
            label="Total Despesas"
            value={formatCurrencyShort(kpis.totalDespesas)}
            sublabel={`Saldo: ${formatCurrency(kpis.saldo)}`}
            color="red"
          />
        </div>

        {/* Graficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Evolucao por periodo */}
          {evolucaoData.length > 0 && (
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Evolucao por Periodo
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={evolucaoData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="periodo" tick={{ fontSize: 11 }} />
                  <YAxis tickFormatter={(v: number) => formatCurrencyShort(v)} tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Legend />
                  <Bar dataKey="markup" name="Markup POS" fill="#00C896" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="liquido" name="Valor Liquido" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Distribuicao por categoria */}
          {porCategoria.length > 0 && (
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Distribuicao por Categoria
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={porCategoria}
                    cx="50%" cy="50%"
                    outerRadius={100}
                    dataKey="value"
                    paddingAngle={2}
                    label={({ name, percent }) =>
                      `${String(name || '').substring(0, 12)} (${((Number(percent) || 0) * 100).toFixed(0)}%)`
                    }
                  >
                    {porCategoria.map((_, i) => (
                      <Cell key={i} fill={getChartColor(i)} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Tabela resumo de fechamento */}
        {fechamentosFiltrados.length > 0 && (
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Resumo de Fechamento
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-3 font-medium text-gray-500">Periodo</th>
                    <th className="text-right py-3 px-3 font-medium text-gray-500">ECs</th>
                    <th className="text-right py-3 px-3 font-medium text-gray-500">TPV Total</th>
                    <th className="text-right py-3 px-3 font-medium text-gray-500">Markup POS</th>
                    <th className="text-right py-3 px-3 font-medium text-gray-500">Margem</th>
                    <th className="text-right py-3 px-3 font-medium text-gray-500">Valor Liquido</th>
                  </tr>
                </thead>
                <tbody>
                  {fechamentosFiltrados.map((f: DadosFechamento) => (
                    <tr key={f.periodo} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="py-3 px-3 font-medium">{f.periodo}</td>
                      <td className="py-3 px-3 text-right">{f.ecsAtivos}</td>
                      <td className="py-3 px-3 text-right">{formatCurrency(f.tpvTotal)}</td>
                      <td className="py-3 px-3 text-right">{formatCurrency(f.markupPos)}</td>
                      <td className="py-3 px-3 text-right">{formatPercent(f.taxaMargem)}</td>
                      <td className="py-3 px-3 text-right font-medium text-blue-700">
                        {formatCurrency(f.valorLiquido)}
                      </td>
                    </tr>
                  ))}
                  {/* Linha de totais */}
                  {fechamentosFiltrados.length > 1 && (
                    <tr className="border-t-2 border-gray-300 bg-gray-50 font-semibold">
                      <td className="py-3 px-3">TOTAL</td>
                      <td className="py-3 px-3 text-right">—</td>
                      <td className="py-3 px-3 text-right">{formatCurrency(kpis.tpvTotal)}</td>
                      <td className="py-3 px-3 text-right">{formatCurrency(kpis.markupTotal)}</td>
                      <td className="py-3 px-3 text-right">—</td>
                      <td className="py-3 px-3 text-right text-blue-700">{formatCurrency(kpis.valorLiquido)}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Resumo vendedores */}
        {vendedores.length > 0 && (
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-gray-400" />
              Equipe ({vendedores.length} vendedores)
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-3 font-medium text-gray-500">#</th>
                    <th className="text-left py-3 px-3 font-medium text-gray-500">Vendedor</th>
                    <th className="text-left py-3 px-3 font-medium text-gray-500">Regiao</th>
                    <th className="text-right py-3 px-3 font-medium text-gray-500">Meta</th>
                    <th className="text-right py-3 px-3 font-medium text-gray-500">Comissao %</th>
                  </tr>
                </thead>
                <tbody>
                  {vendedores.map((v, i) => (
                    <tr key={v.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="py-3 px-3 text-gray-400">{i + 1}</td>
                      <td className="py-3 px-3 font-medium">{v.nome}</td>
                      <td className="py-3 px-3 text-gray-500">{v.regiao}</td>
                      <td className="py-3 px-3 text-right">{formatCurrency(v.metaMensal)}</td>
                      <td className="py-3 px-3 text-right">{formatPercent(v.comissaoBase)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Estado vazio */}
      {fechamentos.length === 0 && lancamentos.length === 0 && (
        <div className="card text-center py-12">
          <FileBarChart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-500">Sem dados para relatorio</h3>
          <p className="text-sm text-gray-400 mt-1">
            Conecte uma planilha em Configuracoes para gerar relatorios.
          </p>
        </div>
      )}
    </div>
  )
}

// ─── ReportKPI Card ──────────────────────────────────────────

function ReportKPI({
  icon, label, value, sublabel, color,
}: {
  icon: React.ReactNode
  label: string
  value: string
  sublabel?: string
  color: 'emerald' | 'blue' | 'red'
}) {
  const colorMap = {
    emerald: 'bg-emerald-50 text-emerald-600',
    blue: 'bg-blue-50 text-blue-600',
    red: 'bg-red-50 text-red-600',
  }

  return (
    <div className="card-hover">
      <div className="flex items-center gap-2 mb-2">
        <div className={`p-2 rounded-lg ${colorMap[color]}`}>{icon}</div>
      </div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
      {sublabel && <p className="text-xs text-gray-400 mt-1">{sublabel}</p>}
    </div>
  )
}
