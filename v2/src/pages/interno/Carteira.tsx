// ═══════════════════════════════════════════════════════════════
// Analise de Carteira — Modulo Interno
// Perfil, segmento e top clientes
// Conforme fluxograma: comportamento/perfil + top performers
// ═══════════════════════════════════════════════════════════════

import { useState, useMemo } from 'react'
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
  BarChart, Bar,
} from 'recharts'
import { Users, Search, Filter, TrendingUp } from 'lucide-react'
import { useInternoData } from '../../hooks/useInternoData'
import { useEquipeData } from '../../hooks/useEquipeData'
import { useDataContext } from '../../contexts/DataContext'
import { LoadingState } from '../../components/LoadingState'
import {
  formatCurrency, formatNumber, getStatusBadgeClass, getChartColor,
} from '../../utils/format'

const SEGMENTOS_FIXOS = ['Alimentacao', 'Comercio', 'Saude', 'Servicos', 'Hospedagem & Lazer', 'Outros']

export function InternoCarteira() {
  const { clientes, segmentos, isLoading } = useInternoData()
  const { saveSegmentOverride } = useDataContext()
  useEquipeData()
  const [filtroSegmento, setFiltroSegmento] = useState('todos')
  const [filtroVendedor, setFiltroVendedor] = useState('todos')
  const [filtroStatus, setFiltroStatus] = useState('todos')
  const [busca, setBusca] = useState('')

  // Clientes filtrados
  const filtrados = useMemo(() => {
    return clientes.filter((c) => {
      if (filtroSegmento !== 'todos' && c.segmento !== filtroSegmento) return false
      if (filtroVendedor !== 'todos' && c.vendedor !== filtroVendedor) return false
      if (filtroStatus !== 'todos' && c.status !== filtroStatus) return false
      if (busca && !c.nome.toLowerCase().includes(busca.toLowerCase())) return false
      return true
    })
  }, [clientes, filtroSegmento, filtroVendedor, filtroStatus, busca])

  // Top 10 por volume
  const top10 = useMemo(() => {
    return [...filtrados]
      .sort((a, b) => b.volumeTotal - a.volumeTotal)
      .slice(0, 10)
  }, [filtrados])

  // Distribuicao por segmento (pizza)
  const porSegmento = useMemo(() => {
    const map = new Map<string, number>()
    filtrados.forEach((c) => {
      const seg = c.segmento || 'Sem segmento'
      map.set(seg, (map.get(seg) || 0) + 1)
    })
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }))
  }, [filtrados])

  // Distribuicao por status
  const porStatus = useMemo(() => {
    const map = new Map<string, number>()
    filtrados.forEach((c) => {
      map.set(c.status, (map.get(c.status) || 0) + 1)
    })
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }))
  }, [filtrados])

  // Scatter data (volume x ticket medio)
  const scatterData = useMemo(() => {
    return filtrados.map((c) => ({
      x: c.volumeTotal,
      y: c.ticketMedio,
      nome: c.nome,
      segmento: c.segmento,
    }))
  }, [filtrados])

  // Nomes unicos dos vendedores (da carteira)
  const vendedoresNomes = useMemo(() => {
    const set = new Set<string>(clientes.map((c) => c.vendedor).filter(Boolean))
    return Array.from(set).sort()
  }, [clientes])

  // KPIs
  // Nota: ticketMedio na aba MKP de POS contém o Markup do EC, nao ticket por transacao
  const kpis = useMemo(() => {
    const totalVolume = filtrados.reduce((s, c) => s + c.volumeTotal, 0)
    const markupMedio = filtrados.length > 0
      ? filtrados.reduce((s, c) => s + c.ticketMedio, 0) / filtrados.length : 0
    const ativos = filtrados.filter((c) => c.status === 'ativo').length
    return { totalClientes: filtrados.length, totalVolume, markupMedio, ativos }
  }, [filtrados])

  if (isLoading) return <LoadingState message="Carregando carteira..." />

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <Users className="w-7 h-7 text-blue-500" />
          Analise de Carteira
        </h1>
        <p className="text-gray-500 mt-1">Perfil, segmento e top clientes</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card-hover">
          <p className="text-sm text-gray-500">Total Clientes</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{formatNumber(kpis.totalClientes)}</p>
        </div>
        <div className="card-hover">
          <p className="text-sm text-gray-500">Volume Total</p>
          <p className="text-2xl font-bold text-emerald-700 mt-1">{formatCurrency(kpis.totalVolume)}</p>
        </div>
        <div className="card-hover">
          <p className="text-sm text-gray-500">Markup Medio por EC</p>
          <p className="text-2xl font-bold text-blue-700 mt-1">{formatCurrency(kpis.markupMedio)}</p>
        </div>
        <div className="card-hover">
          <p className="text-sm text-gray-500">Clientes Ativos</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {kpis.ativos}
            <span className="text-sm font-normal text-gray-400 ml-1">
              / {kpis.totalClientes}
            </span>
          </p>
        </div>
      </div>

      {/* Filtros */}
      <div className="card">
        <div className="flex flex-wrap gap-3 items-center">
          <Filter className="w-4 h-4 text-gray-400" />
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text" value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar cliente..."
              className="input-field pl-10"
            />
          </div>
          <select value={filtroSegmento} onChange={(e) => setFiltroSegmento(e.target.value)} className="input-field w-auto">
            <option value="todos">Todos segmentos</option>
            {segmentos.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={filtroVendedor} onChange={(e) => setFiltroVendedor(e.target.value)} className="input-field w-auto">
            <option value="todos">Todos vendedores</option>
            {vendedoresNomes.map((v) => <option key={v} value={v}>{v}</option>)}
          </select>
          <select value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value)} className="input-field w-auto">
            <option value="todos">Todos status</option>
            <option value="ativo">Ativo</option>
            <option value="em risco">Em risco</option>
            <option value="inativo">Inativo</option>
          </select>
        </div>
      </div>

      {/* Graficos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Scatter: Volume x Ticket */}
        {scatterData.length > 0 && (
          <div className="card lg:col-span-2">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Volume (TPV) x Markup por EC</h3>
            <ResponsiveContainer width="100%" height={300}>
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" dataKey="x" name="TPV" tickFormatter={(v: number) => formatCurrency(v)} tick={{ fontSize: 10 }} />
                <YAxis type="number" dataKey="y" name="Markup" tickFormatter={(v: number) => formatCurrency(v)} tick={{ fontSize: 10 }} />
                <Tooltip
                  formatter={(value) => formatCurrency(Number(value))}
                  labelFormatter={() => ''}
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null
                    const data = payload[0]?.payload as { nome: string; segmento: string; x: number; y: number }
                    return (
                      <div className="bg-white shadow-lg rounded-lg p-3 border text-sm">
                        <p className="font-semibold">{data.nome}</p>
                        <p className="text-gray-500">{data.segmento}</p>
                        <p>TPV: {formatCurrency(data.x)}</p>
                        <p>Markup: {formatCurrency(data.y)}</p>
                      </div>
                    )
                  }}
                />
                <Scatter data={scatterData} fill="#00C896" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Pizza: por segmento */}
        {porSegmento.length > 0 && (
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Por Segmento</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={porSegmento} cx="50%" cy="50%" outerRadius={90} dataKey="value" paddingAngle={2}>
                  {porSegmento.map((_, i) => <Cell key={i} fill={getChartColor(i)} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Status breakdown */}
      {porStatus.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribuicao por Status</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={porStatus} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={80} />
              <Tooltip />
              <Bar dataKey="value" name="Clientes" radius={[0, 4, 4, 0]}>
                {porStatus.map((entry, i) => (
                  <Cell
                    key={i}
                    fill={entry.name === 'ativo' ? '#00C896' : entry.name === 'em risco' ? '#F59E0B' : '#EF4444'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Top 10 clientes */}
      {top10.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-gray-400" />
            Top {Math.min(10, top10.length)} Clientes por Volume
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-3 font-medium text-gray-500">#</th>
                  <th className="text-left py-3 px-3 font-medium text-gray-500">Cliente</th>
                  <th className="text-left py-3 px-3 font-medium text-gray-500">Segmento</th>
                  <th className="text-left py-3 px-3 font-medium text-gray-500">Vendedor</th>
                  <th className="text-right py-3 px-3 font-medium text-gray-500">Volume</th>
                  <th className="text-right py-3 px-3 font-medium text-gray-500">Markup POS</th>
                  <th className="text-left py-3 px-3 font-medium text-gray-500">Status</th>
                </tr>
              </thead>
              <tbody>
                {top10.map((c, i) => (
                  <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-3 px-3 text-gray-400 font-medium">{i + 1}</td>
                    <td className="py-3 px-3 font-medium text-gray-900">{c.nome}</td>
                    <td className="py-3 px-3">
                      {/* Select inline para override de segmento */}
                      <select
                        value={c.segmento || 'Outros'}
                        onChange={(e) =>
                          saveSegmentOverride({ clienteId: c.id, segmento: e.target.value })
                        }
                        className="text-sm border border-gray-200 rounded-lg px-2 py-1 bg-white text-gray-700 hover:border-blue-300 focus:outline-none focus:ring-1 focus:ring-blue-300 w-full max-w-[160px]"
                        title="Alterar segmento"
                      >
                        {SEGMENTOS_FIXOS.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                    <td className="py-3 px-3 text-gray-500">{c.vendedor}</td>
                    <td className="py-3 px-3 text-right font-medium">{formatCurrency(c.volumeTotal)}</td>
                    <td className="py-3 px-3 text-right text-gray-500">{formatCurrency(c.ticketMedio)}</td>
                    <td className="py-3 px-3">
                      <span className={getStatusBadgeClass(c.status)}>{c.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Vazio */}
      {clientes.length === 0 && !isLoading && (
        <div className="card text-center py-12">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-500">Sem clientes na carteira</h3>
          <p className="text-sm text-gray-400 mt-1">Conecte a planilha com a aba "Clientes".</p>
        </div>
      )}
    </div>
  )
}
