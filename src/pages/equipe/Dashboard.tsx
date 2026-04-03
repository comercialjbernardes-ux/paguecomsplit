import { useState, useMemo } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import {
  DollarSign,
  Target,
  TrendingUp,
  Users,
  ArrowUpRight,
  ChevronUp,
  ChevronDown,
} from 'lucide-react'
import {
  vendedores,
  dadosMensais,
  calcularAtingimento,
  formatBRL,
  formatK,
} from '../../data/equipe'
import { EmptyState } from '../../components/EmptyState'
import { SkeletonCard, SkeletonTable } from '../../components/Skeleton'
import { FileSpreadsheet } from 'lucide-react'

type Periodo = 'mensal' | 'acumulado'
type SortKey = 'nome' | 'regiao' | 'faturamento' | 'meta' | 'atingimento'
type SortDir = 'asc' | 'desc'

function StatusBadge({ pct }: { pct: number }) {
  if (pct >= 100) return <span className="badge-success">Atingido</span>
  if (pct >= 70) return <span className="badge-warning">Em progresso</span>
  return <span className="badge-error">Abaixo</span>
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[#0D1B2A] rounded-[8px] px-4 py-3 shadow-xl">
      <p className="text-white/60 text-xs mb-2">{label}</p>
      {payload.map((entry: any) => (
        <div key={entry.name} className="flex items-center gap-2 text-sm">
          <span
            className="w-2 h-2 rounded-full inline-block"
            style={{ background: entry.color }}
          />
          <span className="text-white/70">{entry.name === 'realizado' ? 'Realizado' : 'Meta'}:</span>
          <span className="text-white font-semibold">{formatK(entry.value)}</span>
        </div>
      ))}
    </div>
  )
}

export function EquipeDashboard() {
  const [periodo, setPeriodo] = useState<Periodo>('mensal')
  const [sortKey, setSortKey] = useState<SortKey>('atingimento')
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  const totais = useMemo(() => {
    const fat =
      periodo === 'mensal'
        ? vendedores.reduce((s, v) => s + v.faturamentoMensal, 0)
        : vendedores.reduce((s, v) => s + v.faturamentoAcumulado, 0)
    const meta =
      periodo === 'mensal'
        ? vendedores.reduce((s, v) => s + v.metaMensal, 0)
        : vendedores.reduce((s, v) => s + v.metaAcumulada, 0)
    return { fat, meta, pct: Math.round((fat / meta) * 100) }
  }, [periodo])

  const graficoData = useMemo(() => {
    if (periodo === 'mensal') {
      return dadosMensais.slice(-6)
    }
    // acumulado: running total
    let accR = 0
    let accM = 0
    return dadosMensais.map((d) => {
      accR += d.realizado
      accM += d.meta
      return { mes: d.mes, realizado: accR, meta: accM }
    })
  }, [periodo])

  function handleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('desc')
    }
  }

  const sortedVendedores = useMemo(() => {
    return [...vendedores].sort((a, b) => {
      let av: number | string
      let bv: number | string
      if (sortKey === 'nome') {
        av = a.nome
        bv = b.nome
      } else if (sortKey === 'regiao') {
        av = a.regiao
        bv = b.regiao
      } else if (sortKey === 'faturamento') {
        av = periodo === 'mensal' ? a.faturamentoMensal : a.faturamentoAcumulado
        bv = periodo === 'mensal' ? b.faturamentoMensal : b.faturamentoAcumulado
      } else if (sortKey === 'meta') {
        av = periodo === 'mensal' ? a.metaMensal : a.metaAcumulada
        bv = periodo === 'mensal' ? b.metaMensal : b.metaAcumulada
      } else {
        av = calcularAtingimento(
          periodo === 'mensal' ? a.faturamentoMensal : a.faturamentoAcumulado,
          periodo === 'mensal' ? a.metaMensal : a.metaAcumulada
        )
        bv = calcularAtingimento(
          periodo === 'mensal' ? b.faturamentoMensal : b.faturamentoAcumulado,
          periodo === 'mensal' ? b.metaMensal : b.metaAcumulada
        )
      }
      if (typeof av === 'string') {
        return sortDir === 'asc'
          ? av.localeCompare(bv as string)
          : (bv as string).localeCompare(av)
      }
      return sortDir === 'asc' ? (av as number) - (bv as number) : (bv as number) - (av as number)
    })
  }, [sortKey, sortDir, periodo])

  function SortIcon({ col }: { col: SortKey }) {
    if (sortKey !== col) return <ChevronUp size={14} strokeWidth={1.5} className="text-slate-300" />
    return sortDir === 'asc' ? (
      <ChevronUp size={14} strokeWidth={1.5} className="text-[#00C896]" />
    ) : (
      <ChevronDown size={14} strokeWidth={1.5} className="text-[#00C896]" />
    )
  }

  // Estado vazio: sem vendedores
  if (vendedores.length === 0) {
    return (
      <div className="p-6 lg:p-8">
        <div className="card">
          <EmptyState
            icon={FileSpreadsheet}
            description="Importe uma planilha de fechamento para visualizar os resultados"
          />
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#0D1B2A]">Dashboard da Equipe</h1>
          <p className="text-slate-500 text-sm mt-1">Resultados e performance dos vendedores</p>
        </div>

        {/* Toggle */}
        <div className="flex bg-white border border-[#E2E8F0] rounded-[8px] p-1 gap-1">
          {(['mensal', 'acumulado'] as Periodo[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriodo(p)}
              className={`px-4 py-1.5 rounded-[6px] text-sm font-medium transition-all duration-150 ${
                periodo === p
                  ? 'bg-[#0D1B2A] text-white shadow-sm'
                  : 'text-slate-500 hover:text-[#0D1B2A]'
              }`}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards — 1 col mobile, 2 tablet, 4 desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Faturamento Total */}
        <div className="card p-6">
          <div className="flex items-start justify-between mb-4">
            <p className="text-slate-500 text-sm font-medium">Faturamento Total</p>
            <div className="w-9 h-9 bg-[#E6FAF5] rounded-[8px] flex items-center justify-center">
              <DollarSign size={18} strokeWidth={1.5} className="text-[#00C896]" />
            </div>
          </div>
          <p className="text-[32px] font-bold text-[#0D1B2A] leading-none mb-3">
            {formatK(totais.fat)}
          </p>
          <div className="flex items-center gap-1.5">
            <ArrowUpRight size={14} strokeWidth={1.5} className="text-[#10B981]" />
            <span className="text-[#10B981] text-sm font-medium">+8,4%</span>
            <span className="text-slate-400 text-xs">vs mês anterior</span>
          </div>
        </div>

        {/* Meta Total */}
        <div className="card p-6">
          <div className="flex items-start justify-between mb-4">
            <p className="text-slate-500 text-sm font-medium">Meta Total</p>
            <div className="w-9 h-9 bg-[#EFF6FF] rounded-[8px] flex items-center justify-center">
              <Target size={18} strokeWidth={1.5} className="text-blue-500" />
            </div>
          </div>
          <p className="text-[32px] font-bold text-[#0D1B2A] leading-none mb-3">
            {formatK(totais.meta)}
          </p>
          <div className="flex items-center gap-1.5">
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                totais.pct >= 100
                  ? 'bg-[#ECFDF5] text-[#065F46]'
                  : totais.pct >= 70
                  ? 'bg-[#FFFBEB] text-[#92400E]'
                  : 'bg-[#FEF2F2] text-[#991B1B]'
              }`}
            >
              {totais.pct}% atingido
            </span>
          </div>
        </div>

        {/* % Atingimento */}
        <div className="card p-6">
          <div className="flex items-start justify-between mb-4">
            <p className="text-slate-500 text-sm font-medium">% Atingimento</p>
            <div className="w-9 h-9 bg-[#F5F3FF] rounded-[8px] flex items-center justify-center">
              <TrendingUp size={18} strokeWidth={1.5} className="text-violet-500" />
            </div>
          </div>
          <p className="text-[32px] font-bold text-[#0D1B2A] leading-none mb-4">
            {totais.pct}%
          </p>
          <div className="w-full bg-[#E2E8F0] rounded-full h-2">
            <div
              className="h-2 rounded-full transition-all duration-500"
              style={{
                width: `${Math.min(totais.pct, 100)}%`,
                background: totais.pct >= 100 ? '#00C896' : totais.pct >= 70 ? '#F59E0B' : '#EF4444',
              }}
            />
          </div>
        </div>

        {/* Vendedores Ativos */}
        <div className="card p-6">
          <div className="flex items-start justify-between mb-4">
            <p className="text-slate-500 text-sm font-medium">Vendedores Ativos</p>
            <div className="w-9 h-9 bg-[#FFF7ED] rounded-[8px] flex items-center justify-center">
              <Users size={18} strokeWidth={1.5} className="text-orange-500" />
            </div>
          </div>
          <p className="text-[32px] font-bold text-[#0D1B2A] leading-none mb-3">
            {vendedores.length}
          </p>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 text-xs">
              {vendedores.filter((v) => calcularAtingimento(v.faturamentoMensal, v.metaMensal) >= 70).length} acima de 70%
            </span>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="card p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-base font-semibold text-[#0D1B2A]">
              {periodo === 'mensal' ? 'Últimos 6 meses' : 'Acumulado anual'}
            </h2>
            <p className="text-slate-400 text-xs mt-0.5">Realizado vs Meta</p>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={graficoData} barSize={28} barGap={4}>
            <CartesianGrid vertical={false} stroke="#E2E8F0" strokeDasharray="0" />
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
              tickFormatter={(v: number) => formatK(v)}
              width={80}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#F1F5F9' }} />
            <Legend
              wrapperStyle={{ paddingTop: '16px', fontSize: '12px', fontFamily: 'Inter' }}
              formatter={(value) => (
                <span style={{ color: '#64748B' }}>{value === 'realizado' ? 'Realizado' : 'Meta'}</span>
              )}
            />
            <Bar dataKey="realizado" fill="#0D1B2A" radius={[4, 4, 0, 0]} name="realizado" />
            <Bar dataKey="meta" fill="#00C896" radius={[4, 4, 0, 0]} name="meta" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-[#E2E8F0] flex items-center justify-between">
          <h2 className="text-base font-semibold text-[#0D1B2A]">Vendedores</h2>
          <p className="text-slate-400 text-xs">{vendedores.length} vendedores</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#F8FAFC]">
                {(
                  [
                    { key: 'nome', label: 'Nome' },
                    { key: 'regiao', label: 'Região' },
                    { key: 'faturamento', label: 'Faturamento' },
                    { key: 'meta', label: 'Meta' },
                    { key: 'atingimento', label: '% Ating.' },
                  ] as { key: SortKey; label: string }[]
                ).map(({ key, label }) => (
                  <th
                    key={key}
                    onClick={() => handleSort(key)}
                    className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer hover:text-[#0D1B2A] select-none"
                  >
                    <span className="flex items-center gap-1">
                      {label}
                      <SortIcon col={key} />
                    </span>
                  </th>
                ))}
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {sortedVendedores.map((v) => {
                const fat = periodo === 'mensal' ? v.faturamentoMensal : v.faturamentoAcumulado
                const meta = periodo === 'mensal' ? v.metaMensal : v.metaAcumulada
                const pct = calcularAtingimento(fat, meta)
                return (
                  <tr
                    key={v.id}
                    className="hover:bg-[#F0FDF9] transition-colors duration-100"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-[#0D1B2A] rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-white text-xs font-bold">{v.avatar}</span>
                        </div>
                        <span className="text-sm font-medium text-[#0D1B2A]">{v.nome}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">{v.regiao}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-[#0D1B2A]">
                      {formatBRL(fat)}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">{formatBRL(meta)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-20 bg-[#E2E8F0] rounded-full h-1.5">
                          <div
                            className="h-1.5 rounded-full"
                            style={{
                              width: `${Math.min(pct, 100)}%`,
                              background: pct >= 100 ? '#00C896' : pct >= 70 ? '#F59E0B' : '#EF4444',
                            }}
                          />
                        </div>
                        <span className="text-sm font-semibold text-[#0D1B2A] w-10">{pct}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge pct={pct} />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
