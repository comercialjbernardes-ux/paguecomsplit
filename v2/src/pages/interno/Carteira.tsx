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
import { Users, Search, Filter, TrendingUp, Heart, Wifi, DollarSign } from 'lucide-react'
import { useInternoData } from '../../hooks/useInternoData'
import { useDataContext } from '../../contexts/DataContext'
import { LoadingState } from '../../components/LoadingState'
import {
  formatCurrency, formatNumber, getStatusBadgeClass, getChartColor,
} from '../../utils/format'
import {
  calcHealthScore, getHealthStatus, calcMargemReal,
  getECsSemReceita, getOportunidadesContaDigital, getTopByMarkup, getMarkupDistribution,
} from '../../services/ecAnalysis'

const SEGMENTOS_FIXOS = ['Alimentacao', 'Comercio', 'Saude', 'Servicos', 'Hospedagem & Lazer', 'Outros']

export function InternoCarteira() {
  const { clientes, segmentos, isLoading, lancamentos } = useInternoData()
  const { saveSegmentOverride, custos, equipamentos } = useDataContext()
  const [filtroSegmento, setFiltroSegmento] = useState('todos')
  const [filtroVendedor, setFiltroVendedor] = useState('todos')
  const [filtroStatus, setFiltroStatus] = useState('todos')
  const [busca, setBusca] = useState('')
  const [aba, setAba] = useState<'carteira' | 'saude' | 'lucratividade'>('carteira')

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

  // Scatter data (volume x markup)
  const scatterData = useMemo(() => {
    return filtrados.map((c) => ({
      x: c.volumeTotal,
      y: c.ticketMedio,
      nome: c.nome,
      cnpj: c.cnpj || '',
      segmento: c.segmento,
      margem: calcMargemReal(c.ticketMedio, c.volumeTotal),
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

  // ITEM B: pre-calcular volume total para participacao %
  const totalVolumeFiltrado = useMemo(() =>
    filtrados.reduce((s, c) => s + c.volumeTotal, 0),
  [filtrados])

  // Score de saúde — usa markup real como principal métrica
  const healthScores = useMemo(() => {
    const mediaTpv    = filtrados.length > 0 ? filtrados.reduce((s, c) => s + c.volumeTotal, 0) / filtrados.length : 0
    const mediaMarkup = filtrados.length > 0 ? filtrados.reduce((s, c) => s + c.ticketMedio, 0) / filtrados.length : 0
    return filtrados.map((c) => {
      const score       = calcHealthScore(c, mediaTpv, false, mediaMarkup)
      const participacao = totalVolumeFiltrado > 0 ? (c.volumeTotal / totalVolumeFiltrado) * 100 : 0
      const margemReal  = calcMargemReal(c.ticketMedio, c.volumeTotal)
      const tendencia: 'CRESCENDO' | 'ESTAVEL' | 'DECLINANDO' =
        score >= 60 ? 'CRESCENDO' : score >= 30 ? 'ESTAVEL' : 'DECLINANDO'
      return { ...c, score, status: getHealthStatus(score), participacao, margemReal, tendencia }
    })
  }, [filtrados, totalVolumeFiltrado])

  // Análises acionáveis para a aba Saúde
  const ecsSemReceita         = useMemo(() => getECsSemReceita(filtrados),           [filtrados])
  const oportunidadesContaDig = useMemo(() => getOportunidadesContaDigital(filtrados), [filtrados])
  const topByMarkup           = useMemo(() => getTopByMarkup(filtrados, 10),         [filtrados])
  const markupDistribuicao    = useMemo(() => getMarkupDistribution(filtrados),       [filtrados])

  // MELHORIA 06: lucro estimado por cliente (custo proporcional por volume)
  const rankingLucratividade = useMemo(() => {
    const custoMensalTotal = [
      ...custos.filter((c) => c.recorrencia === 'mensal').map((c) => c.valor),
      ...equipamentos.map((eq) => {
        const restantes = eq.numeroParcelas - eq.parcelasPagas
        return restantes > 0 ? eq.valorParcela : 0
      }),
    ].reduce((s, v) => s + v, 0)

    const volumeTotal = filtrados.reduce((s, c) => s + c.volumeTotal, 0)

    return filtrados.map((c) => {
      // Custo proporcional ponderado pelo volume do cliente
      const proporcao = volumeTotal > 0 ? c.volumeTotal / volumeTotal : 1 / Math.max(filtrados.length, 1)
      const custoCliente = custoMensalTotal * proporcao
      const lucroEstimado = c.ticketMedio - custoCliente
      return { ...c, custoCliente, lucroEstimado }
    }).sort((a, b) => b.lucroEstimado - a.lucroEstimado)
  }, [filtrados, custos, equipamentos])

  if (isLoading) return <LoadingState message="Carregando carteira..." />

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <Users className="w-7 h-7 text-blue-500" />
            Analise de Carteira
          </h1>
          <p className="text-gray-500 mt-1">Perfil, segmento e top clientes</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setAba('carteira')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${aba === 'carteira' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            Carteira
          </button>
          <button
            onClick={() => setAba('saude')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${aba === 'saude' ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            <Heart className="w-4 h-4" />
            Saude
          </button>
          <button
            onClick={() => setAba('lucratividade')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${aba === 'lucratividade' ? 'bg-violet-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            <DollarSign className="w-4 h-4" />
            Lucratividade
          </button>
        </div>
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

      {/* Graficos — aba Carteira */}
      {aba === 'carteira' && <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                    const data = payload[0]?.payload as { nome: string; cnpj: string; segmento: string; x: number; y: number; margem: number }
                    return (
                      <div className="bg-white shadow-lg rounded-lg p-3 border text-sm">
                        <p className="font-semibold">{data.nome}</p>
                        {data.cnpj && <p className="text-gray-400 text-xs">{data.cnpj}</p>}
                        <p className="text-gray-500">{data.segmento}</p>
                        <p>TPV: {formatCurrency(data.x)}</p>
                        <p>Markup: {formatCurrency(data.y)}</p>
                        {data.margem > 0 && <p className="text-blue-600">Margem: {data.margem.toFixed(2)}%</p>}
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
      </div>}

      {/* Status breakdown */}
      {aba === 'carteira' && porStatus.length > 0 && (
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
      {aba === 'carteira' && top10.length > 0 && (
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
                  <th className="text-left py-3 px-3 font-medium text-gray-500">CNPJ</th>
                  <th className="text-left py-3 px-3 font-medium text-gray-500">Nome Fantasia</th>
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
                    <td className="py-3 px-3 text-gray-500 text-xs font-mono">{c.cnpj || '—'}</td>
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

      {/* Aba Lucratividade — MELHORIA 06 */}
      {aba === 'lucratividade' && (
        <div className="card">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-5 h-5 text-violet-500" />
            <h3 className="text-lg font-semibold text-gray-900">Ranking de Lucratividade Real</h3>
          </div>
          <p className="text-sm text-gray-400 mb-4">
            Lucro Estimado = Markup do EC − Custo Operacional Proporcional (ponderado pelo volume).
            {custos.length === 0 && equipamentos.length === 0 && (
              <span className="text-amber-600 ml-1">Cadastre custos em Gestao de Custos para uma analise precisa.</span>
            )}
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 px-3 font-medium text-gray-500">#</th>
                  <th className="text-left py-2 px-3 font-medium text-gray-500">CNPJ</th>
                  <th className="text-left py-2 px-3 font-medium text-gray-500">Nome Fantasia</th>
                  <th className="text-left py-2 px-3 font-medium text-gray-500">Segmento</th>
                  <th className="text-right py-2 px-3 font-medium text-gray-500">Volume (TPV)</th>
                  <th className="text-right py-2 px-3 font-medium text-gray-500">Markup POS</th>
                  <th className="text-right py-2 px-3 font-medium text-gray-500">Custo Proporcional</th>
                  <th className="text-right py-2 px-3 font-medium text-gray-500">Lucro Estimado</th>
                </tr>
              </thead>
              <tbody>
                {rankingLucratividade.slice(0, 20).map((c, i) => (
                  <tr key={c.id} className={`border-b border-gray-50 hover:bg-gray-50 ${i === 0 ? 'bg-emerald-50/50' : ''}`}>
                    <td className="py-2 px-3 text-gray-400 font-medium">{i + 1}</td>
                    <td className="py-2 px-3 text-gray-500 text-xs font-mono">{c.cnpj || '—'}</td>
                    <td className="py-2 px-3 font-medium text-gray-900">{c.nome}</td>
                    <td className="py-2 px-3 text-gray-500">{c.segmento}</td>
                    <td className="py-2 px-3 text-right">{formatCurrency(c.volumeTotal)}</td>
                    <td className="py-2 px-3 text-right text-emerald-700">{formatCurrency(c.ticketMedio)}</td>
                    <td className="py-2 px-3 text-right text-red-600">- {formatCurrency(c.custoCliente)}</td>
                    <td className="py-2 px-3 text-right">
                      <span className={`font-bold ${c.lucroEstimado >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                        {c.lucroEstimado >= 0 ? '' : '- '}{formatCurrency(Math.abs(c.lucroEstimado))}
                      </span>
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

      {/* ── Aba Saude — Análise inteligente e acionável ── */}
      {aba === 'saude' && filtrados.length > 0 && (
        <div className="space-y-6">

          {/* KPIs de saúde real */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="card-hover text-center">
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Gerando Receita</p>
              <p className="text-2xl font-bold text-emerald-600">
                {filtrados.filter((c) => c.ticketMedio > 0).length}
                <span className="text-base font-normal text-gray-400">/{filtrados.length}</span>
              </p>
              <p className="text-xs text-gray-400 mt-1">ECs com markup &gt; R$0</p>
            </div>
            <div className="card-hover text-center">
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Receita Media/EC</p>
              <p className="text-2xl font-bold text-blue-600">{formatCurrency(kpis.markupMedio)}</p>
              <p className="text-xs text-gray-400 mt-1">markup médio da carteira</p>
            </div>
            <div className={`card-hover text-center ${ecsSemReceita.length > 0 ? 'border-red-200 bg-red-50' : ''}`}>
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Sem Receita</p>
              <p className={`text-2xl font-bold ${ecsSemReceita.length > 0 ? 'text-red-600' : 'text-gray-400'}`}>
                {ecsSemReceita.length}
              </p>
              <p className="text-xs text-gray-400 mt-1">ECs com markup = R$0</p>
            </div>
            <div className={`card-hover text-center ${oportunidadesContaDig.length > 0 ? 'border-blue-200 bg-blue-50' : ''}`}>
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Oportunidade</p>
              <p className="text-2xl font-bold text-blue-500">{oportunidadesContaDig.length}</p>
              <p className="text-xs text-gray-400 mt-1">ECs sem Conta Digital</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Alertas: ECs sem receita */}
            {ecsSemReceita.length > 0 && (
              <div className="card border-red-100">
                <h3 className="text-base font-semibold text-red-700 mb-3 flex items-center gap-2">
                  <span className="text-lg">⚠️</span>
                  ECs sem Receita no Período ({ecsSemReceita.length})
                </h3>
                <p className="text-xs text-gray-400 mb-3">
                  Markup = R$0 — possível inatividade ou churn iminente. Contato imediato recomendado.
                </p>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {ecsSemReceita.slice(0, 15).map((c) => (
                    <div key={c.id} className="flex items-center justify-between py-2 px-3 bg-red-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-gray-900 truncate max-w-[200px]">{c.nome}</p>
                        <p className="text-xs text-gray-400 font-mono">{c.cnpj || '—'}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs text-gray-500">{c.segmento}</p>
                        <p className="text-xs font-medium text-red-600">TPV: {formatCurrency(c.volumeTotal)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Oportunidades: Conta Digital */}
            {oportunidadesContaDig.length > 0 && (
              <div className="card border-blue-100">
                <h3 className="text-base font-semibold text-blue-700 mb-3 flex items-center gap-2">
                  <Wifi className="w-4 h-4" />
                  Oportunidades de Conta Digital ({oportunidadesContaDig.length})
                </h3>
                <p className="text-xs text-gray-400 mb-3">
                  ECs com receita mas sem Conta Digital ativa — potencial de +R$29,90/mês cada.
                </p>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {oportunidadesContaDig.map((c) => (
                    <div key={c.id} className="flex items-center justify-between py-2 px-3 bg-blue-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-gray-900 truncate max-w-[200px]">{c.nome}</p>
                        <p className="text-xs text-gray-400 font-mono">{c.cnpj || '—'}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs text-emerald-700 font-medium">Markup: {formatCurrency(c.ticketMedio)}</p>
                        <p className="text-xs text-gray-400">+R$29,90/mês</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Top performers por markup */}
            <div className="card lg:col-span-2">
              <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-500" />
                Top 10 — Maiores Geradores de Receita (Markup)
              </h3>
              <p className="text-xs text-gray-400 mb-4">
                ECs que mais contribuem para a receita da empresa no período.
              </p>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={topByMarkup.map((c) => ({ nome: c.nome.split(' ')[0], markup: c.ticketMedio, cnpj: c.cnpj }))} layout="vertical" margin={{ left: 8, right: 16 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                  <XAxis type="number" tickFormatter={(v: number) => `R$${v.toFixed(0)}`} tick={{ fontSize: 10 }} />
                  <YAxis type="category" dataKey="nome" tick={{ fontSize: 10 }} width={80} />
                  <Tooltip
                    formatter={(v: number) => [formatCurrency(v), 'Markup']}
                    labelFormatter={(label) => {
                      const ec = topByMarkup.find((c) => c.nome.startsWith(label))
                      return ec ? ec.nome : label
                    }}
                  />
                  <Bar dataKey="markup" name="Markup" radius={[0, 4, 4, 0]}>
                    {topByMarkup.map((_, i) => (
                      <Cell key={i} fill={i === 0 ? '#22C55E' : i < 3 ? '#84CC16' : '#00C896'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

          </div>

          {/* Distribuição de markup */}
          <div className="card">
            <h3 className="text-base font-semibold text-gray-900 mb-1 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-violet-500" />
              Distribuicao de Markup — Concentracao de Receita
            </h3>
            <p className="text-xs text-gray-400 mb-4">
              Quantos ECs estão em cada faixa de markup. Faixas baixas = oportunidade de crescimento ou risco.
            </p>
            <div className="flex gap-3 flex-wrap">
              {markupDistribuicao.map((f) => (
                <div key={f.faixa} className="flex-1 min-w-[100px] text-center p-3 rounded-xl border" style={{ borderColor: f.color + '40', backgroundColor: f.color + '10' }}>
                  <p className="text-2xl font-bold" style={{ color: f.color }}>{f.count}</p>
                  <p className="text-xs text-gray-500 mt-1">{f.faixa}</p>
                  <p className="text-xs text-gray-400">{filtrados.length > 0 ? ((f.count / filtrados.length) * 100).toFixed(0) : 0}%</p>
                </div>
              ))}
            </div>
          </div>

          {/* Ranking completo */}
          <div className="card">
            <h3 className="text-base font-semibold text-gray-900 mb-1">
              Ranking Completo — Score por EC
            </h3>
            <p className="text-xs text-gray-400 mb-4">
              Score = Markup (50%) + TPV (30%) + Conta Digital (20%). Ordenado do maior para o menor.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 px-3 font-medium text-gray-500">#</th>
                    <th className="text-left py-2 px-3 font-medium text-gray-500">CNPJ</th>
                    <th className="text-left py-2 px-3 font-medium text-gray-500">Nome Fantasia</th>
                    <th className="text-right py-2 px-3 font-medium text-gray-500">Markup</th>
                    <th className="text-right py-2 px-3 font-medium text-gray-500">TPV</th>
                    <th className="text-right py-2 px-3 font-medium text-gray-500">Margem</th>
                    <th className="text-right py-2 px-3 font-medium text-gray-500">Part.%</th>
                    <th className="text-center py-2 px-3 font-medium text-gray-500">Conta Dig.</th>
                    <th className="text-right py-2 px-3 font-medium text-gray-500">Score</th>
                    <th className="text-left py-2 px-3 font-medium text-gray-500">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {[...healthScores].sort((a, b) => b.score - a.score).slice(0, 30).map((ec, i) => (
                    <tr key={ec.id} className={`border-b border-gray-50 hover:bg-gray-50 ${ec.ticketMedio === 0 ? 'bg-red-50/40' : ''}`}>
                      <td className="py-2 px-3 text-gray-400 text-xs">{i + 1}</td>
                      <td className="py-2 px-3 text-gray-400 text-xs font-mono whitespace-nowrap">{ec.cnpj || '—'}</td>
                      <td className="py-2 px-3 font-medium text-gray-900 max-w-[180px] truncate">{ec.nome}</td>
                      <td className="py-2 px-3 text-right font-semibold text-emerald-700">{formatCurrency(ec.ticketMedio)}</td>
                      <td className="py-2 px-3 text-right text-gray-500">{formatCurrency(ec.volumeTotal)}</td>
                      <td className="py-2 px-3 text-right text-gray-500">{ec.margemReal.toFixed(2)}%</td>
                      <td className="py-2 px-3 text-right text-gray-500">{ec.participacao.toFixed(1)}%</td>
                      <td className="py-2 px-3 text-center">
                        {ec.contaDigitalAtiva
                          ? <Wifi className="w-3.5 h-3.5 text-blue-500 mx-auto" />
                          : <span className="text-gray-300 text-xs">—</span>}
                      </td>
                      <td className="py-2 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <div className="w-12 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${ec.score >= 60 ? 'bg-emerald-400' : ec.score >= 30 ? 'bg-amber-400' : 'bg-red-400'}`} style={{ width: `${ec.score}%` }} />
                          </div>
                          <span className="font-semibold text-gray-700 text-xs w-6 text-right">{ec.score}</span>
                        </div>
                      </td>
                      <td className="py-2 px-3">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                          ec.status === 'saudavel' ? 'bg-emerald-100 text-emerald-700'
                          : ec.status === 'atencao' ? 'bg-amber-100 text-amber-700'
                          : 'bg-red-100 text-red-700'
                        }`}>
                          {ec.status === 'saudavel' ? 'Saudavel' : ec.status === 'atencao' ? 'Atencao' : 'Critico'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}
    </div>
  )
}
