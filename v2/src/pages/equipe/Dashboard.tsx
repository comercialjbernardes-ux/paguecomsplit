// ═══════════════════════════════════════════════════════════════
// Dashboard de Resultados — Central de Comando
// Página inicial: visão executiva completa do negócio
// ═══════════════════════════════════════════════════════════════

import { useState, useMemo } from 'react'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, PieChart, Pie, Cell,
} from 'recharts'
import {
  LayoutDashboard, TrendingUp, TrendingDown, DollarSign,
  Users, Store, ArrowUpRight, ArrowDownRight, Activity,
  CheckCircle, AlertTriangle, XCircle, Lightbulb,
  CreditCard, Percent, Wallet, ShieldAlert, Star,
  Calendar, ChevronRight,
} from 'lucide-react'
import { useEquipeData } from '../../hooks/useEquipeData'
import { useInternoData } from '../../hooks/useInternoData'
import { useDataContext } from '../../contexts/DataContext'
import { NOME_EMPRESA, PRECO_CONTA_DIGITAL } from '../../constants/empresa'
import { LoadingState } from '../../components/LoadingState'
import { ErrorBanner } from '../../components/ErrorBanner'
import { formatCurrency, formatCurrencyShort } from '../../utils/format'
import {
  calcMargemReal, getECsSemReceita,
  getOportunidadesContaDigital, getTopByMarkup, getMarkupDistribution,
} from '../../services/ecAnalysis'
import type { DadosFechamento } from '../../types'

// ─── Insights automáticos ────────────────────────────────────

interface Insight { nivel: 'critico' | 'atencao' | 'positivo' | 'info'; titulo: string; texto: string }

function gerarInsights(
  f: DadosFechamento,
  ant: DadosFechamento | null,
  ecsSemReceita: number,
  oportunidades: number,
): Insight[] {
  const ins: Insight[] = []
  const margem = f.tpvTotal > 0 ? (f.markupPos / f.tpvTotal) * 100 : 0
  const varMarkup = ant?.markupPos ? ((f.markupPos - ant.markupPos) / ant.markupPos) * 100 : null
  const varEcs = ant?.ecsAtivos ? ((f.ecsAtivos - ant.ecsAtivos) / ant.ecsAtivos) * 100 : null

  if (margem < 1) ins.push({ nivel: 'critico', titulo: 'Margem crítica', texto: `${margem.toFixed(2)}% — abaixo do mínimo viável. Renegociar taxas com a rede adquirente.` })
  else if (margem < 1.5) ins.push({ nivel: 'atencao', titulo: `Margem em atenção (${margem.toFixed(2)}%)`, texto: 'Viável, mas sensível a quedas de volume. Priorizar crescimento de TPV.' })
  else ins.push({ nivel: 'positivo', titulo: `Margem saudável (${margem.toFixed(2)}%)`, texto: `A cada R$ 1.000 processados, a empresa gera R$ ${(margem * 10).toFixed(2)} de receita.` })

  if (varMarkup !== null) {
    if (varMarkup < -10) ins.push({ nivel: 'critico', titulo: `Receita recuou ${Math.abs(varMarkup).toFixed(1)}%`, texto: `Queda de ${formatCurrency((ant?.markupPos ?? 0) - f.markupPos)} vs período anterior. Verificar ECs com maior retração de volume.` })
    else if (varMarkup > 8) ins.push({ nivel: 'positivo', titulo: `Crescimento de ${varMarkup.toFixed(1)}% na receita`, texto: `Markup cresceu ${formatCurrency(f.markupPos - (ant?.markupPos ?? 0))} em relação ao período anterior.` })
  }

  if (ecsSemReceita >= 5) ins.push({ nivel: 'critico', titulo: `${ecsSemReceita} ECs sem receita`, texto: 'Risco de churn elevado. Ligar para os ECs de maior histórico de volume que pararam de processar.' })
  else if (ecsSemReceita > 0) ins.push({ nivel: 'atencao', titulo: `${ecsSemReceita} EC${ecsSemReceita > 1 ? 's' : ''} sem receita no período`, texto: 'Contatar proativamente para evitar cancelamentos.' })

  if (oportunidades >= 5) ins.push({ nivel: 'info', titulo: `${oportunidades} oportunidades de Conta Digital`, texto: `Ativar todos geraria +${formatCurrency(oportunidades * PRECO_CONTA_DIGITAL)}/mês de receita recorrente garantida.` })

  if (varEcs !== null && varEcs < -5) ins.push({ nivel: 'atencao', titulo: `Base de ECs reduziu ${Math.abs(varEcs).toFixed(0)}%`, texto: `${ant?.ecsAtivos} → ${f.ecsAtivos} estabelecimentos. Cada EC vale ~${formatCurrency(f.markupPos / Math.max(f.ecsAtivos, 1))}/mês.` })

  const pctDesc = f.markupPos > 0 ? (f.descontos / f.markupPos) * 100 : 0
  if (pctDesc > 15) ins.push({ nivel: 'atencao', titulo: `Descontos em ${pctDesc.toFixed(1)}% do Markup`, texto: `${formatCurrency(f.descontos)} em descontos concedidos no período. Revisar política de descontos.` })

  return ins.slice(0, 4)
}

// ─── Componente Principal ─────────────────────────────────────

export function EquipeDashboard() {
  const { vendedores, isLoading, error } = useEquipeData()
  const { fechamentos, clientes } = useInternoData()
  const { custos, equipamentos } = useDataContext()
  const [periodoSel, setPeriodoSel] = useState<string>('ultimo')

  // Período selecionado e anterior
  const fechamentoAtual = useMemo<DadosFechamento | null>(() => {
    if (!fechamentos.length) return null
    if (periodoSel === 'ultimo') return fechamentos[fechamentos.length - 1]
    return fechamentos.find((f) => f.periodo === periodoSel) ?? fechamentos[fechamentos.length - 1]
  }, [fechamentos, periodoSel])

  const fechamentoAnt = useMemo<DadosFechamento | null>(() => {
    if (!fechamentoAtual || fechamentos.length < 2) return null
    const idx = fechamentos.indexOf(fechamentoAtual)
    return idx > 0 ? fechamentos[idx - 1] : null
  }, [fechamentos, fechamentoAtual])

  // Custo mensal
  const totalCustos = useMemo(() => {
    const op = custos.filter((c) => c.recorrencia === 'mensal').reduce((s, c) => s + c.valor, 0)
    const eq = equipamentos.reduce((s, eq) => (eq.numeroParcelas - eq.parcelasPagas) > 0 ? s + eq.valorParcela : s, 0)
    return op + eq
  }, [custos, equipamentos])

  // KPIs e variações
  const kpis = useMemo(() => {
    const f = fechamentoAtual; const ant = fechamentoAnt
    if (!f) return null
    const margem = f.tpvTotal > 0 ? (f.markupPos / f.tpvTotal) * 100 : f.taxaMargem
    const ticketMedio = f.ecsAtivos > 0 ? f.markupPos / f.ecsAtivos : 0
    const lucroOp = f.valorLiquido - totalCustos
    const receitaBruta = f.markupPos + f.comissaoRede + f.repasse
    const totalDeducoes = f.faturaDigital + f.descontos
    const pctDeducoes = receitaBruta > 0 ? (totalDeducoes / receitaBruta) * 100 : 0
    const var_ = (campo: keyof DadosFechamento) =>
      ant && (ant[campo] as number) > 0 ? (((f[campo] as number) - (ant[campo] as number)) / (ant[campo] as number)) * 100 : null
    const saude: 'CRITICA' | 'ATENCAO' | 'SAUDAVEL' = margem < 1 ? 'CRITICA' : margem < 1.5 ? 'ATENCAO' : 'SAUDAVEL'
    return { f, ant, margem, ticketMedio, lucroOp, receitaBruta, totalDeducoes, pctDeducoes, saude,
      varTpv: var_('tpvTotal'), varMarkup: var_('markupPos'), varLiquido: var_('valorLiquido'),
      varEcs: var_('ecsAtivos'), varMargem: ant?.tpvTotal ? margem - (ant.markupPos / ant.tpvTotal * 100) : null,
    }
  }, [fechamentoAtual, fechamentoAnt, totalCustos])

  // Análise de carteira
  const carteira = useMemo(() => {
    if (!clientes.length) return null
    const totalVol = clientes.reduce((s, c) => s + c.volumeTotal, 0)
    const comReceita = clientes.filter((c) => c.ticketMedio > 0)
    const semReceita = getECsSemReceita(clientes)
    const oportunidades = getOportunidadesContaDigital(clientes)
    const top5 = getTopByMarkup(clientes, 5)
    const distribuicao = getMarkupDistribution(clientes)
    const ordenados = [...clientes].sort((a, b) => b.volumeTotal - a.volumeTotal)
    let acum = 0
    const top5pct = totalVol > 0
      ? Math.round(ordenados.slice(0, 5).reduce((s, c) => s + c.volumeTotal, 0) / totalVol * 100) : 0
    const paretoData = ordenados.slice(0, 8).map((c) => {
      acum += c.volumeTotal
      return { nome: c.nome.slice(0, 14), tpv: c.volumeTotal, pctAcum: totalVol > 0 ? Math.round(acum / totalVol * 100) : 0 }
    })
    return { totalVol, comReceita: comReceita.length, semReceita, oportunidades, top5, distribuicao, top5pct, paretoData }
  }, [clientes])

  // Dados evolução (últimos 10 períodos)
  const evolucao = useMemo(() =>
    fechamentos.slice(-10).map((f) => ({ periodo: f.periodo, markup: f.markupPos, liquido: f.valorLiquido, tpv: f.tpvTotal, ecs: f.ecsAtivos }))
  , [fechamentos])

  // Gráfico all-in-one (todos os períodos)
  const chartTodos = useMemo(() =>
    fechamentos.map((f) => ({ periodo: f.periodo, markup: f.markupPos, liquido: f.valorLiquido }))
  , [fechamentos])

  // Insights
  const insights = useMemo(() => {
    if (!fechamentoAtual) return []
    return gerarInsights(fechamentoAtual, fechamentoAnt, carteira?.semReceita.length ?? 0, carteira?.oportunidades.length ?? 0)
  }, [fechamentoAtual, fechamentoAnt, carteira])

  // Vendedores ordenados
  const rankingVend = useMemo(() => [...vendedores].sort((a, b) => b.faturamentoMensal - a.faturamentoMensal), [vendedores])

  if (isLoading) return <LoadingState message="Carregando dashboard..." />

  const saúdeConfig = {
    CRITICA:  { bg: 'bg-red-500',    pill: 'bg-red-100 text-red-700',    icon: <XCircle className="w-4 h-4" />,       label: 'Situação Crítica' },
    ATENCAO:  { bg: 'bg-amber-500',  pill: 'bg-amber-100 text-amber-700', icon: <AlertTriangle className="w-4 h-4" />, label: 'Requer Atenção' },
    SAUDAVEL: { bg: 'bg-emerald-500',pill: 'bg-emerald-100 text-emerald-700',icon: <CheckCircle className="w-4 h-4" />, label: 'Situação Saudável' },
  }
  const sc = kpis ? saúdeConfig[kpis.saude] : null
  const hoje = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })

  return (
    <div className="space-y-5">
      {error && <ErrorBanner message={error} />}

      {/* ══ HEADER ══════════════════════════════════════════════ */}
      <div className="bg-slate-800 rounded-2xl overflow-hidden">
        <div className="px-6 py-5 flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <LayoutDashboard className="w-4 h-4 text-slate-400" />
              <span className="text-slate-400 text-xs font-medium tracking-wider uppercase">Dashboard de Resultados</span>
            </div>
            <h1 className="text-white text-2xl font-bold leading-tight">{NOME_EMPRESA}</h1>
            <p className="text-slate-400 text-sm mt-0.5">Central de desempenho comercial · {hoje}</p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            {sc && kpis && (
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-white text-xs font-semibold ${sc.bg}`}>
                {sc.icon} {sc.label}
              </div>
            )}
            <div className="flex items-center gap-2 bg-slate-700 rounded-lg px-3 py-2">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <select value={periodoSel} onChange={(e) => setPeriodoSel(e.target.value)}
                className="bg-transparent text-white text-sm border-none outline-none cursor-pointer">
                <option value="ultimo" className="bg-slate-800">Último período</option>
                {[...fechamentos].reverse().map((f) => (
                  <option key={f.periodo} value={f.periodo} className="bg-slate-800">{f.periodo}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
        {/* Faixa de destaque com os 3 números mais importantes */}
        {kpis && (
          <div className="border-t border-slate-700 grid grid-cols-3 divide-x divide-slate-700">
            {[
              { label: 'Markup / Receita', valor: formatCurrencyShort(kpis.f.markupPos), var_: kpis.varMarkup },
              { label: 'ECs Ativos', valor: String(kpis.f.ecsAtivos), var_: kpis.varEcs },
              { label: 'Valor Líquido', valor: formatCurrencyShort(kpis.f.valorLiquido), var_: kpis.varLiquido },
            ].map((item) => (
              <div key={item.label} className="px-6 py-3 text-center">
                <p className="text-slate-400 text-xs mb-0.5">{item.label}</p>
                <p className="text-white text-xl font-bold">{item.valor}</p>
                {item.var_ !== null && item.var_ !== undefined && (
                  <p className={`text-xs font-medium mt-0.5 ${item.var_ >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {item.var_ >= 0 ? '▲' : '▼'} {Math.abs(item.var_).toFixed(1)}% vs anterior
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ══ 8 KPI CARDS ═════════════════════════════════════════ */}
      {kpis && (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          <MiniKPI label="TPV Total" value={formatCurrencyShort(kpis.f.tpvTotal)} var_={kpis.varTpv}
            icon={<Activity className="w-3.5 h-3.5" />} color="slate" />
          <MiniKPI label="Markup POS" value={formatCurrencyShort(kpis.f.markupPos)} var_={kpis.varMarkup}
            icon={<ArrowUpRight className="w-3.5 h-3.5" />} color="emerald" />
          <MiniKPI label="Margem %" value={`${kpis.margem.toFixed(2)}%`}
            var_={kpis.varMargem} isPercent
            icon={<Percent className="w-3.5 h-3.5" />}
            color={kpis.margem >= 1.5 ? 'emerald' : kpis.margem >= 1 ? 'amber' : 'red'} />
          <MiniKPI label="ECs Ativos" value={String(kpis.f.ecsAtivos)} var_={kpis.varEcs}
            icon={<Store className="w-3.5 h-3.5" />} color="blue" />
          <MiniKPI label="Valor Líquido" value={formatCurrencyShort(kpis.f.valorLiquido)} var_={kpis.varLiquido}
            icon={<DollarSign className="w-3.5 h-3.5" />} color="blue" />
          <MiniKPI label="Ticket/EC" value={formatCurrencyShort(kpis.ticketMedio)}
            icon={<CreditCard className="w-3.5 h-3.5" />} color="purple" />
          <MiniKPI label="Conta Digital" value={formatCurrencyShort(kpis.f.faturaDigital)}
            icon={<Wallet className="w-3.5 h-3.5" />} color="teal"
            sub={kpis.f.faturaDigital > 0 ? `~${Math.round(kpis.f.faturaDigital / PRECO_CONTA_DIGITAL)} ECs` : 'Nenhum'} />
          <MiniKPI label="Descontos" value={formatCurrencyShort(kpis.f.descontos)}
            icon={<ShieldAlert className="w-3.5 h-3.5" />}
            color={kpis.pctDeducoes > 15 ? 'red' : 'slate'}
            sub={kpis.pctDeducoes > 0 ? `${kpis.pctDeducoes.toFixed(1)}% do Markup` : '—'} />
        </div>
      )}

      {/* ══ EVOLUÇÃO + DRE ══════════════════════════════════════ */}
      {(evolucao.length > 1 || kpis) && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* Gráfico evolução — 2/3 */}
          {evolucao.length > 1 && (
            <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-semibold text-gray-800">Evolução de Resultados</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Markup POS e Valor Líquido — últimos períodos</p>
                </div>
                {kpis?.varMarkup !== null && kpis?.varMarkup !== undefined && (
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${kpis.varMarkup >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                    Markup {kpis.varMarkup >= 0 ? '+' : ''}{kpis.varMarkup.toFixed(1)}% vs anterior
                  </span>
                )}
              </div>
              <ResponsiveContainer width="100%" height={230}>
                <AreaChart data={evolucao} margin={{ top: 5, right: 10, bottom: 20, left: 5 }}>
                  <defs>
                    <linearGradient id="gMkp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#059669" stopOpacity={0.18}/>
                      <stop offset="95%" stopColor="#059669" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="gLiq" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.12}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="periodo" tick={{ fontSize: 10 }} angle={-15} textAnchor="end" height={35} />
                  <YAxis tickFormatter={(v: number) => formatCurrencyShort(v)} tick={{ fontSize: 10 }} width={68} />
                  <Tooltip formatter={(v) => formatCurrency(Number(v))} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Area type="monotone" dataKey="markup" name="Markup POS" stroke="#059669" strokeWidth={2.5}
                    fill="url(#gMkp)" dot={{ r: 3, fill: '#059669' }} activeDot={{ r: 5 }} />
                  <Area type="monotone" dataKey="liquido" name="Valor Líquido" stroke="#3B82F6" strokeWidth={2}
                    fill="url(#gLiq)" dot={{ r: 3, fill: '#3B82F6' }} strokeDasharray="4 2" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* DRE snapshot — 1/3 */}
          {kpis && (
            <div className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col">
              <h3 className="text-sm font-semibold text-gray-800 mb-1">DRE — {kpis.f.periodo}</h3>
              <p className="text-xs text-gray-400 mb-4">Composição do resultado do período</p>
              <div className="space-y-2 flex-1">
                {[
                  { label: 'Markup POS', valor: kpis.f.markupPos, tipo: 'receita' },
                  { label: 'Comissão de Rede', valor: kpis.f.comissaoRede, tipo: 'receita' },
                  { label: 'Repasse', valor: kpis.f.repasse, tipo: 'receita' },
                  { label: 'Receita Bruta', valor: kpis.receitaBruta, tipo: 'subtotal' },
                  { label: '(-) Descontos', valor: kpis.f.descontos, tipo: 'deducao' },
                  { label: '(-) Cobr. Conta Digital', valor: kpis.f.faturaDigital, tipo: 'deducao' },
                  { label: 'Valor Líquido', valor: kpis.f.valorLiquido, tipo: 'resultado' },
                  ...(totalCustos > 0 ? [{ label: '(-) Custos Op.', valor: totalCustos, tipo: 'custo' }] : []),
                  ...(totalCustos > 0 ? [{ label: 'Resultado Op.', valor: kpis.lucroOp, tipo: 'lucro' }] : []),
                ].filter((l) => l.valor !== 0).map((linha, i) => (
                  <div key={i} className={`flex justify-between items-center px-2.5 py-1.5 rounded-lg text-xs ${
                    linha.tipo === 'subtotal' ? 'bg-gray-50 font-semibold text-gray-700 border border-gray-200' :
                    linha.tipo === 'resultado' ? 'bg-blue-50 font-bold text-blue-800 border border-blue-200' :
                    linha.tipo === 'lucro' ? `${kpis.lucroOp >= 0 ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'} font-bold` :
                    linha.tipo === 'deducao' || linha.tipo === 'custo' ? 'text-red-600' :
                    'text-gray-600'
                  }`}>
                    <span>{linha.label}</span>
                    <span className="font-medium">
                      {(linha.tipo === 'deducao' || linha.tipo === 'custo') && linha.valor > 0
                        ? `(${formatCurrencyShort(linha.valor)})` : formatCurrencyShort(linha.valor)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ══ CARTEIRA DE ECs ═════════════════════════════════════ */}
      {carteira && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {/* Saúde da carteira */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-sm font-semibold text-gray-800 mb-4">Saúde da Carteira de ECs</h3>
            <div className="grid grid-cols-2 gap-3 mb-5">
              {[
                { label: 'Total na base', value: clientes.length, color: 'text-gray-800', bg: 'bg-gray-50', desc: 'estabelecimentos' },
                { label: 'Gerando receita', value: carteira.comReceita, color: 'text-emerald-700', bg: 'bg-emerald-50',
                  desc: `${clientes.length > 0 ? Math.round(carteira.comReceita / clientes.length * 100) : 0}% da base` },
                { label: 'Sem receita (risco)', value: carteira.semReceita.length, color: carteira.semReceita.length > 0 ? 'text-red-700' : 'text-gray-400', bg: carteira.semReceita.length > 0 ? 'bg-red-50' : 'bg-gray-50',
                  desc: carteira.semReceita.length > 0 ? 'Risco de churn' : 'Tudo em dia' },
                { label: 'Sem Conta Digital', value: carteira.oportunidades.length, color: 'text-blue-700', bg: 'bg-blue-50',
                  desc: carteira.oportunidades.length > 0 ? `+${formatCurrencyShort(carteira.oportunidades.length * PRECO_CONTA_DIGITAL)}/mês pot.` : 'Nenhuma' },
              ].map((item) => (
                <div key={item.label} className={`${item.bg} rounded-xl p-3`}>
                  <p className={`text-2xl font-bold ${item.color}`}>{item.value}</p>
                  <p className="text-xs text-gray-600 font-medium mt-0.5">{item.label}</p>
                  <p className="text-xs text-gray-400">{item.desc}</p>
                </div>
              ))}
            </div>

            {/* Distribuição por faixa de markup */}
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Distribuição por Faixa de Receita</h4>
            <div className="space-y-2">
              {carteira.distribuicao.map((d) => {
                const pct = clientes.length > 0 ? (d.count / clientes.length) * 100 : 0
                return (
                  <div key={d.faixa} className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full flex-shrink-0`} style={{ backgroundColor: d.color }} />
                    <span className="text-xs text-gray-600 w-28 flex-shrink-0">{d.faixa}</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                      <div className="h-1.5 rounded-full" style={{ width: `${pct}%`, backgroundColor: d.color }} />
                    </div>
                    <span className="text-xs font-medium text-gray-700 w-12 text-right">{d.count} ECs</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Top 5 ECs + Pareto */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-400" /> Top 5 ECs por Receita
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">Top 5 = {carteira.top5pct}% do TPV total</p>
              </div>
              {carteira.top5pct > 50 && (
                <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium flex-shrink-0">⚠ Concentrado</span>
              )}
            </div>

            <div className="space-y-3 mb-5">
              {carteira.top5.map((ec, i) => {
                const pct = carteira.top5[0].ticketMedio > 0 ? (ec.ticketMedio / carteira.top5[0].ticketMedio) * 100 : 0
                const marg = calcMargemReal(ec.ticketMedio, ec.volumeTotal)
                return (
                  <div key={ec.id} className="flex items-center gap-2">
                    <span className={`text-xs font-bold w-4 ${i === 0 ? 'text-amber-500' : 'text-gray-300'}`}>{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between mb-0.5">
                        <span className="text-xs font-medium text-gray-700 truncate">{ec.nome}</span>
                        <span className="text-xs font-bold text-emerald-700 ml-2 flex-shrink-0">{formatCurrencyShort(ec.ticketMedio)}</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-1.5">
                        <div className={`h-1.5 rounded-full ${i === 0 ? 'bg-amber-400' : 'bg-emerald-400'}`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                    <span className="text-xs text-gray-400 w-10 text-right flex-shrink-0">{marg.toFixed(1)}%</span>
                  </div>
                )
              })}
            </div>

            {/* Mini pareto */}
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Concentração de TPV</h4>
            <ResponsiveContainer width="100%" height={130}>
              <BarChart data={carteira.paretoData} margin={{ bottom: 25, left: 0, right: 5 }}>
                <XAxis dataKey="nome" tick={{ fontSize: 9 }} angle={-30} textAnchor="end" interval={0} />
                <YAxis tickFormatter={(v: number) => formatCurrencyShort(v)} tick={{ fontSize: 9 }} width={55} />
                <Tooltip formatter={(v) => formatCurrency(Number(v))} />
                <Bar dataKey="tpv" name="TPV" fill="#3B82F6" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* ══ INSIGHTS AUTOMÁTICOS ════════════════════════════════ */}
      {insights.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-amber-400" /> Diagnóstico Automático
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {insights.map((ins, i) => {
              const cfg = {
                critico:  { bg: 'bg-red-50 border-red-200',    icon: <XCircle className="w-4 h-4 text-red-500" />,      tag: 'bg-red-100 text-red-700',    label: 'Crítico' },
                atencao:  { bg: 'bg-amber-50 border-amber-200', icon: <AlertTriangle className="w-4 h-4 text-amber-500" />,tag: 'bg-amber-100 text-amber-700', label: 'Atenção' },
                positivo: { bg: 'bg-emerald-50 border-emerald-200', icon: <CheckCircle className="w-4 h-4 text-emerald-500" />, tag: 'bg-emerald-100 text-emerald-700', label: 'Positivo' },
                info:     { bg: 'bg-blue-50 border-blue-200',   icon: <Lightbulb className="w-4 h-4 text-blue-500" />,    tag: 'bg-blue-100 text-blue-700',  label: 'Oportunidade' },
              }[ins.nivel]
              return (
                <div key={i} className={`border rounded-xl p-4 ${cfg.bg}`}>
                  <div className="flex items-center gap-2 mb-2">
                    {cfg.icon}
                    <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${cfg.tag}`}>{cfg.label}</span>
                  </div>
                  <p className="text-xs font-semibold text-gray-800 mb-1">{ins.titulo}</p>
                  <p className="text-xs text-gray-500 leading-relaxed">{ins.texto}</p>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ══ GRÁFICO HISTÓRICO COMPLETO ═══════════════════════════ */}
      {chartTodos.length > 1 && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-800 mb-1">Histórico Completo de Resultados</h3>
          <p className="text-xs text-gray-400 mb-4">Markup POS vs Valor Líquido — todos os períodos cadastrados</p>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={chartTodos} margin={{ bottom: 20, left: 5, right: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="periodo" tick={{ fontSize: 10 }} angle={-20} textAnchor="end" height={40} />
              <YAxis tickFormatter={(v: number) => formatCurrencyShort(v)} tick={{ fontSize: 10 }} width={68} />
              <Tooltip formatter={(v) => formatCurrency(Number(v))} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="markup" name="Markup POS" fill="#059669" radius={[3, 3, 0, 0]} />
              <Bar dataKey="liquido" name="Valor Líquido" fill="#3B82F6" radius={[3, 3, 0, 0]} opacity={0.7} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* ══ TABELA HISTÓRICA COMPARATIVA ════════════════════════ */}
      {fechamentos.length > 1 && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-gray-400" /> Evolução por Período
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  {['Período','ECs','Var. ECs','TPV','Markup','Margem','Líquido','Var. Markup'].map((h) => (
                    <th key={h} className={`py-2.5 px-3 text-xs font-medium text-gray-400 ${h === 'Período' ? 'text-left' : 'text-right'}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[...fechamentos].reverse().slice(0, 10).map((f, i, arr) => {
                  const prev = arr[i + 1]
                  const varM = prev?.markupPos ? ((f.markupPos - prev.markupPos) / prev.markupPos) * 100 : null
                  const varE = prev?.ecsAtivos ? ((f.ecsAtivos - prev.ecsAtivos) / prev.ecsAtivos) * 100 : null
                  const marg = f.tpvTotal > 0 ? (f.markupPos / f.tpvTotal) * 100 : f.taxaMargem
                  const isAtual = f.periodo === fechamentoAtual?.periodo
                  return (
                    <tr key={f.periodo} className={`border-b border-gray-50 hover:bg-gray-50 transition-colors ${isAtual ? 'bg-blue-50/60' : ''}`}>
                      <td className={`py-2.5 px-3 font-medium ${isAtual ? 'text-blue-700' : 'text-gray-700'}`}>
                        {f.periodo} {isAtual && <span className="ml-1 text-xs bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded">atual</span>}
                      </td>
                      <td className="py-2.5 px-3 text-right text-gray-600">{f.ecsAtivos}</td>
                      <td className="py-2.5 px-3 text-right">
                        <VarBadge val={varE} suffix="%" />
                      </td>
                      <td className="py-2.5 px-3 text-right text-gray-600">{formatCurrencyShort(f.tpvTotal)}</td>
                      <td className="py-2.5 px-3 text-right font-medium text-gray-800">{formatCurrencyShort(f.markupPos)}</td>
                      <td className={`py-2.5 px-3 text-right text-xs font-semibold ${marg >= 1.5 ? 'text-emerald-600' : marg >= 1 ? 'text-amber-600' : 'text-red-600'}`}>
                        {marg.toFixed(2)}%
                      </td>
                      <td className="py-2.5 px-3 text-right text-blue-700 font-medium">{formatCurrencyShort(f.valorLiquido)}</td>
                      <td className="py-2.5 px-3 text-right">
                        <VarBadge val={varM} suffix="%" />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ══ EQUIPE ══════════════════════════════════════════════ */}
      {rankingVend.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-4 h-4 text-gray-400" />
            <h3 className="text-sm font-semibold text-gray-800">Equipe Comercial</h3>
            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{rankingVend.length} consultores</span>
          </div>
          <div className="space-y-2">
            {rankingVend.map((v, i) => {
              const maxFat = rankingVend[0].faturamentoMensal
              const pct = maxFat > 0 ? (v.faturamentoMensal / maxFat) * 100 : 0
              return (
                <div key={v.id} className={`flex items-center gap-3 p-3 rounded-xl ${i === 0 ? 'bg-amber-50 border border-amber-100' : 'bg-gray-50'}`}>
                  <span className={`text-sm font-bold w-5 text-center ${i === 0 ? 'text-amber-500' : 'text-gray-300'}`}>{i === 0 ? '★' : i + 1}</span>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${i === 0 ? 'bg-amber-100 text-amber-700' : 'bg-gray-200 text-gray-600'}`}>
                    {v.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <div>
                        <span className="text-sm font-medium text-gray-800">{v.nome}</span>
                        {v.regiao && <span className="ml-2 text-xs text-gray-400">{v.regiao}</span>}
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {v.variacaoMes !== 0 && (
                          <span className={`text-xs font-medium flex items-center gap-0.5 ${v.variacaoMes >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                            {v.variacaoMes >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                            {Math.abs(v.variacaoMes).toFixed(1)}%
                          </span>
                        )}
                        <span className="text-sm font-bold text-gray-800">{formatCurrencyShort(v.faturamentoMensal)}</span>
                      </div>
                    </div>
                    <div className="w-full bg-white rounded-full h-1.5 border border-gray-200">
                      <div className={`h-1.5 rounded-full ${i === 0 ? 'bg-amber-400' : 'bg-emerald-400'}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Estado vazio */}
      {!isLoading && !kpis && rankingVend.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 text-center py-16">
          <LayoutDashboard className="w-12 h-12 text-gray-200 mx-auto mb-4" />
          <h3 className="text-base font-semibold text-gray-500 mb-1">Sem dados disponíveis</h3>
          <p className="text-sm text-gray-400">Conecte uma planilha em Configurações para visualizar os dados.</p>
        </div>
      )}
    </div>
  )
}

// ─── Sub-componentes ──────────────────────────────────────────

function MiniKPI({ label, value, var_, icon, color, sub, isPercent }: {
  label: string; value: string; var_?: number | null
  icon: React.ReactNode; color: string; sub?: string; isPercent?: boolean
}) {
  const colorMap: Record<string, string> = {
    slate: 'bg-slate-100 text-slate-600', emerald: 'bg-emerald-50 text-emerald-600',
    blue: 'bg-blue-50 text-blue-600', amber: 'bg-amber-50 text-amber-600',
    red: 'bg-red-50 text-red-600', purple: 'bg-purple-50 text-purple-600',
    teal: 'bg-teal-50 text-teal-600',
  }
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-3 hover:shadow-sm transition-shadow">
      <div className={`inline-flex p-1.5 rounded-lg ${colorMap[color] ?? colorMap.slate} mb-2`}>{icon}</div>
      <p className="text-xs text-gray-400 leading-tight">{label}</p>
      <p className="text-base font-bold text-gray-900 mt-0.5">{value}</p>
      {var_ != null && (
        <span className={`inline-flex items-center gap-0.5 text-xs font-medium ${var_ >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
          {var_ >= 0 ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
          {var_ >= 0 ? '+' : ''}{isPercent ? `${var_.toFixed(2)}pp` : `${var_.toFixed(1)}%`}
        </span>
      )}
      {sub && !var_ && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  )
}

function VarBadge({ val, suffix = '%' }: { val: number | null; suffix?: string }) {
  if (val === null) return <span className="text-gray-200 text-xs">—</span>
  return (
    <span className={`inline-flex items-center gap-0.5 text-xs font-semibold ${val >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
      {val >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
      {Math.abs(val).toFixed(1)}{suffix}
    </span>
  )
}
