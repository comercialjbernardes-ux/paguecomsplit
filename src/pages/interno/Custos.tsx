import { useState, useMemo, useCallback } from 'react'
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { Upload, FileSpreadsheet, Filter } from 'lucide-react'
import {
  lancamentosMock,
  categoriasDisponiveis,
  contasDisponiveis,
  caixaProjetado,
} from '../../data/interno'
import type { LancamentoCusto } from '../../data/interno'
import { formatCurrency } from '../../utils/calculos'

const PIE_COLORS = ['#0D1B2A', '#00C896', '#F59E0B', '#EF4444', '#8B5CF6', '#3B82F6', '#EC4899', '#14B8A6', '#64748B', '#F97316']

function formatCurrencyShort(v: number): string {
  if (Math.abs(v) >= 1_000_000) return `R$ ${(v / 1_000_000).toFixed(1)}M`
  if (Math.abs(v) >= 1_000) return `R$ ${(v / 1_000).toFixed(0)}K`
  return formatCurrency(v)
}

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[#0D1B2A] rounded-[8px] px-4 py-3 shadow-xl">
      {label && <p className="text-white/60 text-xs mb-1">{label}</p>}
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex items-center gap-2 text-sm">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color || p.fill }} />
          <span className="text-white font-semibold">{formatCurrency(Math.abs(p.value))}</span>
        </div>
      ))}
    </div>
  )
}

function PieTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null
  const d = payload[0]
  return (
    <div className="bg-[#0D1B2A] rounded-[8px] px-4 py-3 shadow-xl">
      <p className="text-white/60 text-xs mb-1">{d.name}</p>
      <p className="text-white font-semibold text-sm">{formatCurrency(d.value)}</p>
    </div>
  )
}

export function InternoCustos() {
  const [lancamentos, setLancamentos] = useState<LancamentoCusto[]>(lancamentosMock)
  const [periodoInicio, setPeriodoInicio] = useState('2026-03-01')
  const [periodoFim, setPeriodoFim] = useState('2026-03-31')
  const [contaFiltro, setContaFiltro] = useState('Todas')
  const [dragActive, setDragActive] = useState(false)

  const filtrados = useMemo(() => {
    return lancamentos.filter((l) => {
      if (l.data < periodoInicio || l.data > periodoFim) return false
      if (contaFiltro !== 'Todas' && l.conta !== contaFiltro) return false
      return true
    })
  }, [lancamentos, periodoInicio, periodoFim, contaFiltro])

  // Despesas por categoria (pie)
  const despesasPorCategoria = useMemo(() => {
    const map: Record<string, number> = {}
    filtrados.filter((l) => l.valor < 0).forEach((l) => {
      map[l.categoria] = (map[l.categoria] || 0) + Math.abs(l.valor)
    })
    return Object.entries(map)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
  }, [filtrados])

  // Receitas por categoria (bar)
  const receitasPorTipo = useMemo(() => {
    const map: Record<string, number> = {}
    filtrados.filter((l) => l.valor > 0).forEach((l) => {
      map[l.categoria] = (map[l.categoria] || 0) + l.valor
    })
    return Object.entries(map)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
  }, [filtrados])

  const handleCategoriaChange = useCallback((id: number, newCat: string) => {
    setLancamentos((prev) =>
      prev.map((l) => (l.id === id ? { ...l, categoria: newCat } : l))
    )
  }, [])

  const handleCSVDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
    const file = e.dataTransfer.files[0]
    if (!file || !file.name.endsWith('.csv')) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const text = ev.target?.result as string
      if (!text) return
      const lines = text.trim().split('\n').slice(1) // skip header
      const parsed: LancamentoCusto[] = lines.map((line, i) => {
        const cols = line.split(';').map((c) => c.trim().replace(/"/g, ''))
        return {
          id: 1000 + i,
          data: cols[0] || '2026-03-01',
          descricao: cols[1] || 'Importado',
          valor: parseFloat(cols[2]?.replace(',', '.') || '0'),
          categoria: cols[3] || 'Outros',
          conta: cols[4] || 'Banco Principal',
        }
      }).filter((l) => !isNaN(l.valor))
      setLancamentos((prev) => [...prev, ...parsed])
    }
    reader.readAsText(file)
  }, [])

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#0D1B2A]">Análise de Custos e Receitas</h1>
          <p className="text-slate-500 text-sm mt-1">Lançamentos, categorização e projeção de caixa</p>
        </div>
      </div>

      {/* Zona de Upload CSV */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragActive(true) }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleCSVDrop}
        className={`border-2 border-dashed rounded-[12px] p-8 mb-8 text-center transition-all ${
          dragActive
            ? 'border-[#00C896] bg-[#E6FAF5]'
            : 'border-[#E2E8F0] bg-white hover:border-slate-300'
        }`}
      >
        <Upload size={32} strokeWidth={1.5} className={`mx-auto mb-3 ${dragActive ? 'text-[#00C896]' : 'text-slate-300'}`} />
        <p className="text-sm font-medium text-[#0D1B2A] mb-1">Arraste um extrato bancário CSV aqui</p>
        <p className="text-xs text-slate-400">Formato: Data;Descrição;Valor;Categoria;Conta (separador ;)</p>
      </div>

      {/* Filtros */}
      <div className="flex items-center gap-4 mb-6 flex-wrap">
        <div className="flex items-center gap-2">
          <Filter size={16} strokeWidth={1.5} className="text-slate-400" />
          <span className="text-sm text-slate-500 font-medium">Filtros:</span>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-400">De</label>
          <input
            type="date"
            value={periodoInicio}
            onChange={(e) => setPeriodoInicio(e.target.value)}
            className="h-9 px-3 text-sm border border-[#E2E8F0] rounded-[8px] bg-white focus:outline-none focus:ring-2 focus:ring-[#00C896]/30"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-400">Até</label>
          <input
            type="date"
            value={periodoFim}
            onChange={(e) => setPeriodoFim(e.target.value)}
            className="h-9 px-3 text-sm border border-[#E2E8F0] rounded-[8px] bg-white focus:outline-none focus:ring-2 focus:ring-[#00C896]/30"
          />
        </div>
        <select
          value={contaFiltro}
          onChange={(e) => setContaFiltro(e.target.value)}
          className="h-9 px-3 text-sm border border-[#E2E8F0] rounded-[8px] bg-white text-[#0D1B2A] font-medium focus:outline-none focus:ring-2 focus:ring-[#00C896]/30"
        >
          <option value="Todas">Todas as contas</option>
          {contasDisponiveis.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* Tabela de Lançamentos */}
      <div className="bg-white border border-[#E2E8F0] rounded-[12px] shadow-card overflow-hidden mb-8">
        <div className="px-6 py-4 border-b border-[#E2E8F0] flex items-center gap-2">
          <FileSpreadsheet size={16} strokeWidth={1.5} className="text-[#0D1B2A]" />
          <h2 className="text-sm font-semibold text-[#0D1B2A]">Lançamentos</h2>
          <span className="text-xs text-slate-400 ml-auto">{filtrados.length} itens</span>
        </div>
        <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
          <table className="w-full">
            <thead className="sticky top-0 bg-[#F8FAFC] z-10">
              <tr>
                {['Data', 'Descrição', 'Valor', 'Categoria', 'Conta'].map((h) => (
                  <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {filtrados.map((l) => (
                <tr key={l.id} className="hover:bg-[#F0FDF9] transition-colors">
                  <td className="px-6 py-3 text-sm text-slate-500 whitespace-nowrap">
                    {new Date(l.data + 'T00:00').toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-6 py-3 text-sm text-[#0D1B2A] font-medium">{l.descricao}</td>
                  <td className={`px-6 py-3 text-sm font-semibold whitespace-nowrap ${l.valor >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                    {l.valor >= 0 ? '+' : ''}{formatCurrency(l.valor)}
                  </td>
                  <td className="px-6 py-3">
                    <select
                      value={l.categoria}
                      onChange={(e) => handleCategoriaChange(l.id, e.target.value)}
                      className="h-8 px-2 text-xs border border-[#E2E8F0] rounded-[6px] bg-white text-[#0D1B2A] focus:outline-none focus:ring-1 focus:ring-[#00C896]/30"
                    >
                      {categoriasDisponiveis.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-3 text-sm text-slate-500">{l.conta}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        {/* Despesas por Categoria (Pizza) */}
        <div className="bg-white border border-[#E2E8F0] rounded-[12px] shadow-card p-6">
          <h2 className="text-sm font-semibold text-[#0D1B2A] mb-1">Despesas por Categoria</h2>
          <p className="text-xs text-slate-400 mb-4">Distribuição das saídas</p>
          {despesasPorCategoria.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={despesasPorCategoria}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={95}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {despesasPorCategoria.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<PieTooltip />} />
                <Legend
                  wrapperStyle={{ fontSize: '11px', fontFamily: 'Inter' }}
                  formatter={(value) => <span style={{ color: '#64748B' }}>{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-slate-400 text-center py-8">Sem dados para o período</p>
          )}
        </div>

        {/* Receitas por Tipo (Barras) */}
        <div className="bg-white border border-[#E2E8F0] rounded-[12px] shadow-card p-6">
          <h2 className="text-sm font-semibold text-[#0D1B2A] mb-1">Receitas por Tipo</h2>
          <p className="text-xs text-slate-400 mb-4">Entradas por categoria</p>
          {receitasPorTipo.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={receitasPorTipo} barSize={32}>
                <CartesianGrid vertical={false} stroke="#E2E8F0" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94A3B8', fontSize: 11, fontFamily: 'Inter' }}
                  interval={0}
                  angle={-20}
                  textAnchor="end"
                  height={50}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94A3B8', fontSize: 11, fontFamily: 'Inter' }}
                  tickFormatter={(v) => formatCurrencyShort(v)}
                  width={70}
                />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: '#F1F5F9' }} />
                <Bar dataKey="value" fill="#00C896" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-slate-400 text-center py-8">Sem dados para o período</p>
          )}
        </div>
      </div>

      {/* Caixa Projetado */}
      <div className="bg-white border border-[#E2E8F0] rounded-[12px] shadow-card p-6">
        <h2 className="text-sm font-semibold text-[#0D1B2A] mb-1">Visão de Caixa Projetado</h2>
        <p className="text-xs text-slate-400 mb-6">Saldo estimado — linha do tempo mensal</p>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={caixaProjetado}>
            <CartesianGrid vertical={false} stroke="#E2E8F0" />
            <XAxis
              dataKey="mes"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94A3B8', fontSize: 12, fontFamily: 'Inter' }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94A3B8', fontSize: 12, fontFamily: 'Inter' }}
              tickFormatter={(v) => formatCurrencyShort(v)}
              width={70}
            />
            <Tooltip content={<ChartTooltip />} />
            <Line
              type="monotone"
              dataKey="saldo"
              stroke="#0D1B2A"
              strokeWidth={2.5}
              dot={{ r: 4, fill: '#0D1B2A' }}
              name="Saldo"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
