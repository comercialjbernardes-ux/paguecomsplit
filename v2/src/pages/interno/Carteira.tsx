// ═══════════════════════════════════════════════════════════════
// Analise de Carteira — Modulo Interno
// Perfil, segmento e top clientes
// Conforme fluxograma: comportamento/perfil + top performers
// ═══════════════════════════════════════════════════════════════

import { useState, useMemo } from 'react'
import {
  ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend, ReferenceLine,
  BarChart, Bar,
} from 'recharts'
import { Users, Search, Filter, TrendingUp, Heart, Wifi, DollarSign, Activity } from 'lucide-react'
import { useInternoData } from '../../hooks/useInternoData'
import { useDataContext } from '../../contexts/dataContextValue'
import { LoadingState } from '../../components/LoadingState'
import { PeriodSelector } from '../../components/PeriodSelector'
import {
  formatCurrency, formatNumber, getStatusBadgeClass, getChartColor,
} from '../../utils/format'
import { calcCustosMensalSemUnico, calcCustosMensalEfetivo } from '../../utils/custos'
import { PRECO_CONTA_DIGITAL } from '../../constants/empresa'
import {
  calcHealthScore, getHealthStatus, calcMargemReal,
  getECsSemReceita, getOportunidadesContaDigital, getTopByMarkup, getMarkupDistribution,
} from '../../services/ecAnalysis'

const SEGMENTOS_FIXOS = ['Alimentacao', 'Comercio', 'Saude', 'Servicos', 'Hospedagem & Lazer', 'Outros']

export function InternoCarteira() {
  const { clientes, segmentos, isLoading, fechamentos, fechamentoAtual, getClientesPorPeriodo } = useInternoData()
  const { saveSegmentOverride, removeSegmentOverride, custos, equipamentos } = useDataContext()
  const [filtroSegmento, setFiltroSegmento] = useState('todos')
  const [filtroVendedor, setFiltroVendedor] = useState('todos')
  const [filtroStatus, setFiltroStatus] = useState('todos')
  const [busca, setBusca] = useState('')
  const [aba, setAba] = useState<'carteira' | 'saude' | 'lucratividade'>('carteira')

  // ── Período selecionado ────────────────────────────────────────
  const [periodoSelecionado, setPeriodoSelecionado] = useState<string>('ultimo')
  const isAcumulado = periodoSelecionado === 'acumulado'

  const periodoEfetivo = useMemo(() => {
    if (isAcumulado) return null
    if (periodoSelecionado === 'ultimo') return fechamentoAtual?.periodo ?? null
    return periodoSelecionado
  }, [isAcumulado, periodoSelecionado, fechamentoAtual])

  // Base de clientes do período selecionado.
  // Em modo período específico, usa o snapshot daquele mês via getClientesPorPeriodo.
  // Em modo acumulado, agrega clientes de TODOS os períodos por ID:
  //   - soma volumeTotal e ticketMedio de cada mês
  //   - mantém metadados (nome, cnpj, segmento, status, vendedor…) do período mais recente
  // Todos os memos downstream (kpis, charts, healthScores…) passam a ser period-aware
  // automaticamente pois dependem de `filtrados` que por sua vez depende de `clientesBase`.
  const clientesBase = useMemo(() => {
    if (!isAcumulado) {
      if (!periodoEfetivo) return clientes
      const periodClients = getClientesPorPeriodo(periodoEfetivo)
      return periodClients.length > 0 ? periodClients : clientes
    }

    // Modo acumulado: agregar clientes de TODOS os períodos por ID
    // Soma volumeTotal e ticketMedio; mantém metadados do período mais recente
    if (fechamentos.length === 0) return clientes
    const mergeMap = new Map<number, (typeof clientes)[0]>()
    // Percorre cronologicamente (fechamentos já está ordenado)
    // O último período sobrescreve os metadados → dados mais recentes ficam
    for (const f of fechamentos) {
      const periodClients = getClientesPorPeriodo(f.periodo)
      for (const c of periodClients) {
        const prev = mergeMap.get(c.id)
        mergeMap.set(c.id, {
          ...c,                                              // metadados do mais recente
          volumeTotal: (prev?.volumeTotal ?? 0) + c.volumeTotal,
          ticketMedio: (prev?.ticketMedio ?? 0) + c.ticketMedio,
        })
      }
    }
    const result = Array.from(mergeMap.values())
    return result.length > 0 ? result : clientes
  }, [clientes, periodoEfetivo, isAcumulado, getClientesPorPeriodo, fechamentos])

  // Clientes filtrados — aplica filtros de UI sobre a base do período correto
  const filtrados = useMemo(() => {
    return clientesBase.filter((c) => {
      if (filtroSegmento !== 'todos' && c.segmento !== filtroSegmento) return false
      if (filtroVendedor !== 'todos' && c.vendedor !== filtroVendedor) return false
      if (filtroStatus !== 'todos' && c.status !== filtroStatus) return false
      if (busca && !c.nome.toLowerCase().includes(busca.toLowerCase())) return false
      return true
    })
  }, [clientesBase, filtroSegmento, filtroVendedor, filtroStatus, busca])

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

  // Scatter agrupado por segmento (uma série por segmento = cor diferente + legenda)
  const scatterPorSegmento = useMemo(() => {
    const groups = new Map<string, Array<{ x: number; y: number; z: number; nome: string; cnpj: string; segmento: string; margem: number }>>()
    // M-13: normalizar z relativo ao maior ticketMedio da carteira para evitar bolhas gigantes
    const maxTicket = Math.max(...filtrados.map((c) => c.ticketMedio), 1)
    filtrados.forEach((c) => {
      const seg = c.segmento || 'Outros'
      if (!groups.has(seg)) groups.set(seg, [])
      groups.get(seg)!.push({
        x: c.volumeTotal,
        y: c.ticketMedio,
        // Tamanho normalizado: mínimo 40, máximo 500 (proporcional ao maior da carteira)
        z: 40 + (c.ticketMedio / maxTicket) * 460,
        nome: c.nome,
        cnpj: c.cnpj || '',
        segmento: seg,
        margem: calcMargemReal(c.ticketMedio, c.volumeTotal),
      })
    })
    return Array.from(groups.entries())
  }, [filtrados])

  // Médias para linhas de referência dos quadrantes
  const avgTPV = useMemo(() =>
    filtrados.length > 0 ? filtrados.reduce((s, c) => s + c.volumeTotal, 0) / filtrados.length : 0,
  [filtrados])
  const avgMarkup = useMemo(() =>
    filtrados.length > 0 ? filtrados.reduce((s, c) => s + c.ticketMedio, 0) / filtrados.length : 0,
  [filtrados])

  // Status com volume: contagem + TPV total por status
  const porStatusDetalhado = useMemo(() => {
    const map = new Map<string, { count: number; volume: number; markup: number }>()
    filtrados.forEach((c) => {
      const entry = map.get(c.status) || { count: 0, volume: 0, markup: 0 }
      entry.count++
      entry.volume += c.volumeTotal
      entry.markup += c.ticketMedio
      map.set(c.status, entry)
    })
    const total = filtrados.length
    const totalVolume = filtrados.reduce((s, c) => s + c.volumeTotal, 0)
    return Array.from(map.entries()).map(([status, d]) => ({
      status,
      label: status === 'ativo' ? 'Ativo' : status === 'em risco' ? 'Em Risco' : 'Inativo',
      count: d.count,
      volume: d.volume,
      markup: d.markup,
      pctClientes: total > 0 ? (d.count / total) * 100 : 0,
      pctVolume: totalVolume > 0 ? (d.volume / totalVolume) * 100 : 0,
    }))
      .sort((a, b) => {
        const ord = { ativo: 0, 'em risco': 1, inativo: 2 }
        return (ord[a.status as keyof typeof ord] ?? 3) - (ord[b.status as keyof typeof ord] ?? 3)
      })
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
  // Usa calcCustosMensalEfetivo com período específico se selecionado
  // Em modo acumulado multiplica o custo mensal pelo número de períodos acumulados
  const rankingLucratividade = useMemo(() => {
    const nPeriodos = isAcumulado ? fechamentos.length : 1
    const custoMensalBase = periodoEfetivo
      ? calcCustosMensalEfetivo(custos, periodoEfetivo)
      : calcCustosMensalSemUnico(custos)

    const custoMensalTotal = (
      custoMensalBase +
      equipamentos.reduce((s, eq) => {
        const restantes = eq.numeroParcelas - eq.parcelasPagas
        return s + (restantes > 0 ? eq.valorParcela : 0)
      }, 0)
    ) * nPeriodos

    const volumeTotal = filtrados.reduce((s, c) => s + c.volumeTotal, 0)

    return filtrados.map((c) => {
      // Custo proporcional ponderado pelo volume do cliente
      const proporcao = volumeTotal > 0 ? c.volumeTotal / volumeTotal : 1 / Math.max(filtrados.length, 1)
      const custoCliente = custoMensalTotal * proporcao
      // ECs com Conta Digital ativa têm custo fixo adicional de R$29,90/mês
      const custoContaDigital = c.contaDigitalAtiva ? PRECO_CONTA_DIGITAL : 0
      const lucroEstimado = c.ticketMedio - custoCliente - custoContaDigital
      return { ...c, custoCliente: custoCliente + custoContaDigital, lucroEstimado }
    }).sort((a, b) => b.lucroEstimado - a.lucroEstimado)
  }, [filtrados, custos, equipamentos, periodoEfetivo, isAcumulado, fechamentos])

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
          <p className="text-gray-500 mt-1">
            Perfil, segmento e top clientes
            {periodoEfetivo && !isAcumulado && <span className="ml-2 text-xs text-gray-400">— {periodoEfetivo}</span>}
            {isAcumulado && <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">acumulado</span>}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {fechamentos.length > 0 && (
            <PeriodSelector
              fechamentos={fechamentos}
              value={periodoSelecionado}
              onChange={setPeriodoSelecionado}
            />
          )}
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
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card-hover">
          <p className="text-sm text-gray-500">Total Clientes</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{formatNumber(kpis.totalClientes)}</p>
        </div>
        <div className="card-hover">
          <p className="text-sm text-gray-500">{isAcumulado ? 'Volume Acumulado' : 'Volume Total'}</p>
          <p className="text-2xl font-bold text-emerald-700 mt-1">{formatCurrency(kpis.totalVolume)}</p>
        </div>
        <div className="card-hover">
          <p className="text-sm text-gray-500">{isAcumulado ? 'Markup Total por EC' : 'Markup Medio por EC'}</p>
          <p className="text-2xl font-bold text-blue-700 mt-1">{formatCurrency(kpis.markupMedio)}</p>
        </div>
        <div className="card-hover">
          <p className="text-sm text-gray-500">ECs Ativos</p>
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

        {/* ── Mapa de Carteira: Scatter multi-segmento com quadrantes ── */}
        {scatterPorSegmento.length > 0 && (
          <div className="card lg:col-span-2">
            <div className="flex items-start justify-between mb-1">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Mapa de Carteira — TPV x Markup</h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Cada bolha = 1 EC · tamanho proporcional ao markup · cor por segmento
                </p>
              </div>
              <Activity className="w-5 h-5 text-gray-300 shrink-0 mt-0.5" />
            </div>

            {/* Legenda de quadrantes */}
            <div className="grid grid-cols-2 gap-1 mb-3 text-xs">
              <div className="flex items-center gap-1.5 text-gray-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                Alto TPV + Alto Markup = <span className="font-semibold text-emerald-600 ml-0.5">Campeões</span>
              </div>
              <div className="flex items-center gap-1.5 text-gray-400">
                <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                Baixo TPV + Alto Markup = <span className="font-semibold text-amber-600 ml-0.5">Potencial</span>
              </div>
              <div className="flex items-center gap-1.5 text-gray-400">
                <span className="w-2 h-2 rounded-full bg-blue-300 shrink-0" />
                Alto TPV + Baixo Markup = <span className="font-semibold text-blue-600 ml-0.5">Volume</span>
              </div>
              <div className="flex items-center gap-1.5 text-gray-400">
                <span className="w-2 h-2 rounded-full bg-red-300 shrink-0" />
                Baixo TPV + Baixo Markup = <span className="font-semibold text-red-500 ml-0.5">Atenção</span>
              </div>
            </div>

            <ResponsiveContainer width="100%" height={310}>
              <ScatterChart margin={{ top: 8, right: 24, bottom: 8, left: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  type="number" dataKey="x" name="TPV"
                  tickFormatter={(v: number) => v >= 1000000 ? `R$${(v / 1000000).toFixed(1)}M` : v >= 1000 ? `R$${(v / 1000).toFixed(0)}k` : `R$${v}`}
                  tick={{ fontSize: 10 }} label={{ value: 'Volume (TPV)', position: 'insideBottom', offset: -2, fontSize: 10, fill: '#94a3b8' }}
                />
                <YAxis
                  type="number" dataKey="y" name="Markup"
                  tickFormatter={(v: number) => `R$${v.toFixed(0)}`}
                  tick={{ fontSize: 10 }} label={{ value: 'Markup (R$)', angle: -90, position: 'insideLeft', offset: 12, fontSize: 10, fill: '#94a3b8' }}
                />
                {/* Tamanho da bolha reflete o markup — range [20,300] */}
                <ZAxis type="number" dataKey="z" range={[20, 300]} />

                {/* Linhas de referência = médias da carteira (criam os 4 quadrantes) */}
                {avgTPV > 0 && (
                  <ReferenceLine x={avgTPV} stroke="#94a3b8" strokeDasharray="6 3" strokeWidth={1.5}
                    label={{ value: `Média TPV`, position: 'top', fontSize: 9, fill: '#94a3b8' }} />
                )}
                {avgMarkup > 0 && (
                  <ReferenceLine y={avgMarkup} stroke="#94a3b8" strokeDasharray="6 3" strokeWidth={1.5}
                    label={{ value: `Média Markup`, position: 'right', fontSize: 9, fill: '#94a3b8' }} />
                )}

                <Tooltip
                  cursor={{ strokeDasharray: '4 4', stroke: '#cbd5e1' }}
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null
                    const d = payload[0]?.payload as { nome: string; cnpj: string; segmento: string; x: number; y: number; margem: number }
                    const quadrante =
                      d.x >= avgTPV && d.y >= avgMarkup ? { label: 'Campeão', color: 'text-emerald-600' }
                      : d.x < avgTPV && d.y >= avgMarkup ? { label: 'Potencial', color: 'text-amber-600' }
                      : d.x >= avgTPV && d.y < avgMarkup ? { label: 'Volume', color: 'text-blue-600' }
                      : { label: 'Atenção', color: 'text-red-500' }
                    return (
                      <div className="bg-white shadow-xl rounded-xl p-3 border border-gray-100 text-sm max-w-[220px]">
                        <p className="font-semibold text-gray-900 truncate">{d.nome}</p>
                        {d.cnpj && <p className="text-gray-400 text-xs font-mono mb-1">{d.cnpj}</p>}
                        <div className="flex items-center gap-1 mb-2">
                          <span className="text-xs px-1.5 py-0.5 bg-gray-100 rounded text-gray-500">{d.segmento}</span>
                          <span className={`text-xs font-semibold ${quadrante.color}`}>{quadrante.label}</span>
                        </div>
                        <div className="space-y-0.5 text-xs text-gray-600">
                          <div className="flex justify-between"><span>TPV:</span><span className="font-medium">{formatCurrency(d.x)}</span></div>
                          <div className="flex justify-between"><span>Markup:</span><span className="font-medium text-emerald-700">{formatCurrency(d.y)}</span></div>
                          {d.margem > 0 && <div className="flex justify-between"><span>Margem:</span><span className="font-medium text-blue-600">{d.margem.toFixed(2)}%</span></div>}
                        </div>
                      </div>
                    )
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />

                {/* Uma série por segmento = cor diferente automaticamente */}
                {scatterPorSegmento.map(([seg, dados], i) => (
                  <Scatter
                    key={seg}
                    name={seg}
                    data={dados}
                    fill={getChartColor(i)}
                    fillOpacity={0.8}
                  />
                ))}
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

      {/* ── Status: cards com volume real + mini barras ── */}
      {aba === 'carteira' && porStatusDetalhado.length > 0 && (
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Saude da Carteira por Status</h3>
            <span className="text-xs text-gray-400">— volume de negócio e concentração por grupo</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
            {porStatusDetalhado.map((s) => {
              const cfg = s.status === 'ativo'
                ? { bg: 'bg-emerald-50', border: 'border-emerald-200', title: 'text-emerald-700', bar: 'bg-emerald-500', icon: '✅' }
                : s.status === 'em risco'
                ? { bg: 'bg-amber-50', border: 'border-amber-200', title: 'text-amber-700', bar: 'bg-amber-400', icon: '⚠️' }
                : { bg: 'bg-red-50', border: 'border-red-200', title: 'text-red-700', bar: 'bg-red-400', icon: '🔴' }
              return (
                <div key={s.status} className={`rounded-xl border p-4 ${cfg.bg} ${cfg.border}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-sm font-semibold ${cfg.title}`}>{cfg.icon} {s.label}</span>
                    <span className="text-2xl font-bold text-gray-800">{s.count}</span>
                  </div>
                  <p className="text-xs text-gray-500 mb-3">{s.pctClientes.toFixed(0)}% dos ECs</p>

                  {/* Barra de participação em clientes */}
                  <div className="mb-3">
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                      <span>Participação (ECs)</span>
                      <span>{s.pctClientes.toFixed(1)}%</span>
                    </div>
                    <div className="h-1.5 bg-white/60 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${cfg.bar}`} style={{ width: `${s.pctClientes}%` }} />
                    </div>
                  </div>

                  {/* Volume e markup */}
                  <div className="pt-3 border-t border-white/50 space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">Volume (TPV)</span>
                      <span className="font-semibold text-gray-700">{formatCurrency(s.volume)}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">% do TPV total</span>
                      <span className="font-semibold text-gray-700">{s.pctVolume.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">Markup gerado</span>
                      <span className={`font-semibold ${cfg.title}`}>{formatCurrency(s.markup)}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Barra comparativa de volume entre os grupos */}
          {porStatusDetalhado.reduce((s, d) => s + d.volume, 0) > 0 && (
            <div>
              <p className="text-xs text-gray-400 mb-2">Distribuição do volume total por status</p>
              <div className="h-5 rounded-full overflow-hidden flex">
                {porStatusDetalhado.map((s) => {
                  const color = s.status === 'ativo' ? 'bg-emerald-500' : s.status === 'em risco' ? 'bg-amber-400' : 'bg-red-400'
                  return s.pctVolume > 0 ? (
                    <div key={s.status} className={`${color} flex items-center justify-center`} style={{ width: `${s.pctVolume}%` }}
                      title={`${s.label}: ${s.pctVolume.toFixed(1)}%`}>
                      {s.pctVolume > 8 && <span className="text-white text-[10px] font-semibold">{s.pctVolume.toFixed(0)}%</span>}
                    </div>
                  ) : null
                })}
              </div>
              <div className="flex gap-4 mt-2 flex-wrap">
                {porStatusDetalhado.map((s) => {
                  const color = s.status === 'ativo' ? 'bg-emerald-500' : s.status === 'em risco' ? 'bg-amber-400' : 'bg-red-400'
                  return (
                    <div key={s.status} className="flex items-center gap-1.5 text-xs text-gray-500">
                      <span className={`w-2.5 h-2.5 rounded-sm ${color}`} />
                      {s.label} ({formatCurrency(s.volume)})
                    </div>
                  )
                })}
              </div>
            </div>
          )}
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
                      <div className="flex items-center gap-1">
                        <select
                          value={c.segmento || 'Outros'}
                          onChange={(e) =>
                            saveSegmentOverride({ clienteId: c.id, segmento: e.target.value })
                          }
                          className="text-sm border border-gray-200 rounded-lg px-2 py-1 bg-white text-gray-700 hover:border-blue-300 focus:outline-none focus:ring-1 focus:ring-blue-300 w-full max-w-[140px]"
                          title="Alterar segmento"
                        >
                          {SEGMENTOS_FIXOS.map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                        <button
                          onClick={() => removeSegmentOverride(c.id)}
                          className="p-1 text-gray-300 hover:text-amber-500 transition-colors flex-shrink-0"
                          title="Restaurar segmento automático"
                        >
                          ↺
                        </button>
                      </div>
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
                    formatter={(v) => [formatCurrency(Number(v)), 'Markup']}
                    labelFormatter={(label) => {
                      // B-05: usar === para evitar mapeamento errado em nomes ambiguos
                      const ec = topByMarkup.find((c) => c.nome.split(' ')[0] === label)
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
