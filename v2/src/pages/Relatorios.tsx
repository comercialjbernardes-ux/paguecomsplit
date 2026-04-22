// ═══════════════════════════════════════════════════════════════
// Relatorios — Relatório Executivo para Apresentação ao Cliente
// Layout profissional, secionado, com insights automáticos e PDF
// ═══════════════════════════════════════════════════════════════

import { useState, useMemo, useRef } from 'react'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, PieChart, Pie, Cell,
} from 'recharts'
import {
  FileBarChart, TrendingUp, TrendingDown,
  DollarSign, Users, ArrowUpRight, ArrowDownRight,
  Printer, CheckCircle, AlertTriangle, XCircle, AlertCircle,
  Target, Lightbulb, ShieldAlert, Activity, Calendar, Star,
} from 'lucide-react'
import { useInternoData } from '../hooks/useInternoData'
import { useEquipeData } from '../hooks/useEquipeData'
import { useDataContext } from '../contexts/dataContextValue'
import { NOME_EMPRESA, PRECO_CONTA_DIGITAL } from '../constants/empresa'
import { LoadingState } from '../components/LoadingState'
import { exportElementToPDF } from '../services/exportService'
import { formatCurrency, formatCurrencyShort, getChartColor } from '../utils/format'
import {
  calcHealthScore, calcMargemReal,
  getECsSemReceita, getOportunidadesContaDigital, getTopByMarkup,
} from '../services/ecAnalysis'
import type { DadosFechamento } from '../types'

// ─── Insights automáticos ────────────────────────────────────

interface Insight {
  nivel: 'critico' | 'atencao' | 'positivo' | 'info'
  titulo: string
  texto: string
  acao?: string
}

function gerarInsights(
  atual: DadosFechamento,
  anterior: DadosFechamento | null,
  ecsSemReceita: number,
  oportunidades: number,
  totalCustos: number,
): Insight[] {
  const ins: Insight[] = []
  const margem = atual.tpvTotal > 0 ? (atual.markupPos / atual.tpvTotal) * 100 : 0
  const pctDeducoes = atual.markupPos > 0 ? ((atual.descontos + atual.faturaDigital) / atual.markupPos) * 100 : 0

  // Saúde da margem
  if (margem < 1) {
    ins.push({
      nivel: 'critico',
      titulo: 'Margem crítica',
      texto: `Margem de ${margem.toFixed(2)}% está abaixo do mínimo viável (1%). Cada R$ 1.000 de TPV gera apenas R$ ${(margem * 10).toFixed(2)} de receita.`,
      acao: 'Renegociar taxas e eliminar descontos prioritariamente.',
    })
  } else if (margem < 1.5) {
    ins.push({
      nivel: 'atencao',
      titulo: 'Margem em zona de atenção',
      texto: `Margem de ${margem.toFixed(2)}% está entre 1% e 1,5%. Operação viável mas sensível a quedas de volume.`,
      acao: 'Focar em crescimento de TPV para diluir custos fixos.',
    })
  } else {
    ins.push({
      nivel: 'positivo',
      titulo: 'Margem saudável',
      texto: `Margem de ${margem.toFixed(2)}% — acima de 1,5%. A empresa gera R$ ${(margem / 100 * 1000).toFixed(2)} para cada R$ 1.000 processado.`,
    })
  }

  // Evolução vs anterior
  if (anterior) {
    const varMarkup = anterior.markupPos > 0 ? ((atual.markupPos - anterior.markupPos) / anterior.markupPos) * 100 : 0
    const varEcs = anterior.ecsAtivos > 0 ? ((atual.ecsAtivos - anterior.ecsAtivos) / anterior.ecsAtivos) * 100 : 0

    if (varMarkup < -15) {
      ins.push({
        nivel: 'critico',
        titulo: `Receita caiu ${Math.abs(varMarkup).toFixed(1)}% vs período anterior`,
        texto: `Markup recuou ${formatCurrency(anterior.markupPos - atual.markupPos)}. Provável perda de EC âncora ou queda de TPV concentrada.`,
        acao: 'Identificar os ECs com maior queda de volume e contatar imediatamente.',
      })
    } else if (varMarkup < -5) {
      ins.push({
        nivel: 'atencao',
        titulo: `Receita recuou ${Math.abs(varMarkup).toFixed(1)}% no período`,
        texto: `Queda de ${formatCurrency(anterior.markupPos - atual.markupPos)} em relação a ${anterior.periodo}. Monitorar ticket médio dos ECs ativos.`,
        acao: 'Verificar sazonalidade e reativar ECs com queda de volume.',
      })
    } else if (varMarkup > 10) {
      ins.push({
        nivel: 'positivo',
        titulo: `Crescimento de ${varMarkup.toFixed(1)}% na receita`,
        texto: `Markup cresceu ${formatCurrency(atual.markupPos - anterior.markupPos)} vs ${anterior.periodo}.${varEcs > 0 ? ` Base de ECs expandiu ${varEcs.toFixed(1)}%.` : ' Ticket médio por EC melhorou.'}`,
      })
    }

    if (varEcs < -8) {
      ins.push({
        nivel: 'critico',
        titulo: `Base de ECs encolheu ${Math.abs(varEcs).toFixed(0)}%`,
        texto: `De ${anterior.ecsAtivos} para ${atual.ecsAtivos} estabelecimentos. Cada EC perdido representa ~${formatCurrency(anterior.markupPos / Math.max(anterior.ecsAtivos, 1))}/mês.`,
        acao: 'Implementar plano de retenção: ligar para ECs inativos nos últimos 30 dias.',
      })
    }
  }

  // ECs sem receita
  if (ecsSemReceita > 0) {
    ins.push({
      nivel: ecsSemReceita >= 5 ? 'critico' : 'atencao',
      titulo: `${ecsSemReceita} EC${ecsSemReceita > 1 ? 's' : ''} sem receita no período`,
      texto: `Estabelecimentos com TPV = zero são risco de churn imediato. Cada reativação gera receita recorrente.`,
      acao: `Ligar para os ${Math.min(ecsSemReceita, 5)} ECs de maior histórico de volume que pararam de processar.`,
    })
  }

  // Oportunidades conta digital
  if (oportunidades > 0) {
    const potencial = oportunidades * PRECO_CONTA_DIGITAL
    ins.push({
      nivel: 'info',
      titulo: `${oportunidades} oportunidades de Conta Digital`,
      texto: `ECs com receita ativa mas sem Conta Digital. Ativar todos geraria +${formatCurrency(potencial)}/mês de receita recorrente garantida.`,
      acao: `Oferecer ativação para os ${Math.min(oportunidades, 8)} ECs de maior markup sem Conta Digital.`,
    })
  }

  // Deduções
  if (pctDeducoes > 20) {
    ins.push({
      nivel: 'atencao',
      titulo: `Deduções consomem ${pctDeducoes.toFixed(1)}% do Markup`,
      texto: `Descontos (${formatCurrency(atual.descontos)}) + Conta Digital (${formatCurrency(atual.faturaDigital)}) = ${formatCurrency(atual.descontos + atual.faturaDigital)} deduzidos da receita bruta.`,
      acao: 'Revisar política de descontos: limitar a máximo de 10% do Markup por EC.',
    })
  }

  // Custo/receita
  if (totalCustos > 0 && atual.markupPos > 0) {
    const pctCusto = (totalCustos / atual.markupPos) * 100
    if (pctCusto > 60) {
      ins.push({
        nivel: 'critico',
        titulo: `Custos representam ${pctCusto.toFixed(0)}% do Markup`,
        texto: `${formatCurrency(totalCustos)} em custos operacionais contra ${formatCurrency(atual.markupPos)} de receita. Resultado operacional em risco.`,
        acao: 'Auditar custos variáveis e renegociar contratos de fornecedores.',
      })
    }
  }

  return ins
}

// ─── Componente Principal ─────────────────────────────────────

export function RelatoriosPage() {
  const { fechamentos, clientes, lancamentos, isLoading } = useInternoData()
  const { vendedores } = useEquipeData()
  const { custos, equipamentos } = useDataContext()
  const [periodoSelecionado, setPeriodoSelecionado] = useState<string>('ultimo')
  const reportRef = useRef<HTMLDivElement>(null)

  // Custo mensal total
  const totalCustos = useMemo(() => {
    const op = custos.filter((c) => c.recorrencia === 'mensal').reduce((s, c) => s + c.valor, 0)
    const eq = equipamentos.reduce((s, eq) => {
      const r = eq.numeroParcelas - eq.parcelasPagas
      return r > 0 ? s + eq.valorParcela : s
    }, 0)
    return op + eq
  }, [custos, equipamentos])

  // Período selecionado
  const periodoAtual = useMemo<DadosFechamento | null>(() => {
    if (fechamentos.length === 0) return null
    if (periodoSelecionado === 'ultimo') return fechamentos[fechamentos.length - 1]
    return fechamentos.find((f) => f.periodo === periodoSelecionado) || fechamentos[fechamentos.length - 1]
  }, [fechamentos, periodoSelecionado])

  const periodoAnterior = useMemo<DadosFechamento | null>(() => {
    if (!periodoAtual || fechamentos.length < 2) return null
    const idx = fechamentos.indexOf(periodoAtual)
    return idx > 0 ? fechamentos[idx - 1] : null
  }, [fechamentos, periodoAtual])

  // Dados calculados
  const dados = useMemo(() => {
    if (!periodoAtual) return null
    const f = periodoAtual
    const ant = periodoAnterior

    const margem = f.tpvTotal > 0 ? (f.markupPos / f.tpvTotal) * 100 : (f.taxaMargem ?? 0) * 100
    const receitaBruta = f.markupPos + f.comissaoRede + f.repasse
    const totalDeducoes = f.faturaDigital + f.descontos
    const lucroOp = f.valorLiquido - totalCustos

    const varMarkup = ant?.markupPos > 0 ? ((f.markupPos - ant.markupPos) / ant.markupPos) * 100 : null
    const varTpv = ant?.tpvTotal > 0 ? ((f.tpvTotal - ant.tpvTotal) / ant.tpvTotal) * 100 : null
    const varLiquido = ant?.valorLiquido > 0 ? ((f.valorLiquido - ant.valorLiquido) / ant.valorLiquido) * 100 : null
    const varEcs = ant?.ecsAtivos > 0 ? ((f.ecsAtivos - ant.ecsAtivos) / ant.ecsAtivos) * 100 : null

    const saude: 'CRITICA' | 'ATENCAO' | 'SAUDAVEL' =
      margem < 1 || lucroOp < -1000 ? 'CRITICA'
      : margem < 1.5 || lucroOp < 0 ? 'ATENCAO'
      : 'SAUDAVEL'

    // Análise da carteira
    const mediaTpv = clientes.length > 0 ? clientes.reduce((s, c) => s + c.volumeTotal, 0) / clientes.length : 0
    const mediaMarkup = clientes.length > 0 ? clientes.reduce((s, c) => s + c.ticketMedio, 0) / clientes.length : 0
    const ecsSemReceita = getECsSemReceita(clientes)
    const oportunidades = getOportunidadesContaDigital(clientes)
    const top10 = getTopByMarkup(clientes, 10)
    const ecsCom = clientes.filter((c) => c.ticketMedio > 0 && c.status !== 'inativo').length
    const totalVolume = clientes.reduce((s, c) => s + c.volumeTotal, 0)

    // Pareto
    const ordenados = [...clientes].sort((a, b) => b.volumeTotal - a.volumeTotal)
    let acumPareto = 0
    const paretoData = ordenados.slice(0, 15).map((c) => {
      acumPareto += c.volumeTotal
      return {
        nome: c.nome.slice(0, 16),
        tpv: c.volumeTotal,
        pct: totalVolume > 0 ? Math.round((acumPareto / totalVolume) * 100) : 0,
      }
    })
    const top5pct = totalVolume > 0
      ? Math.round(ordenados.slice(0, 5).reduce((s, c) => s + c.volumeTotal, 0) / totalVolume * 100) : 0

    // Evolução (últimos 6 períodos ou todos)
    const evolucao = fechamentos.slice(-8).map((fech) => ({
      periodo: fech.periodo,
      markup: fech.markupPos,
      tpv: fech.tpvTotal,
      liquido: fech.valorLiquido,
    }))

    // DRE simplificado
    const dreLinhas = [
      { label: 'Markup POS', valor: f.markupPos, tipo: 'receita' as const },
      { label: 'Comissão de Rede', valor: f.comissaoRede, tipo: 'receita' as const },
      { label: 'Repasse', valor: f.repasse, tipo: 'receita' as const },
      { label: 'Receita Bruta', valor: receitaBruta, tipo: 'subtotal' as const },
      { label: '(-) Descontos', valor: -f.descontos, tipo: 'deducao' as const },
      { label: '(-) Cobra Digital', valor: -f.faturaDigital, tipo: 'deducao' as const },
      { label: 'Valor Líquido', valor: f.valorLiquido, tipo: 'resultado' as const },
    ].filter((l) => l.valor !== 0)

    // Insights inteligentes
    const insights = gerarInsights(f, ant, ecsSemReceita.length, oportunidades.length, totalCustos)

    // Plano de ação (até 3 ações dos insights com criticalidade maior)
    const acoes = insights
      .filter((i) => i.acao && (i.nivel === 'critico' || i.nivel === 'atencao'))
      .slice(0, 3)
      .map((i) => i.acao as string)

    return {
      f, ant, margem, receitaBruta, totalDeducoes, lucroOp,
      varMarkup, varTpv, varLiquido, varEcs,
      saude, ecsSemReceita, oportunidades, top10, ecsCom,
      totalVolume, mediaTpv, mediaMarkup,
      paretoData, top5pct, evolucao, dreLinhas, insights, acoes,
    }
  }, [periodoAtual, periodoAnterior, clientes, fechamentos, totalCustos])

  const handlePrint = async () => {
    if (reportRef.current) {
      await exportElementToPDF(reportRef.current, `relatorio-${dados?.f.periodo || 'venda-feita'}`)
    }
  }

  if (isLoading) return <LoadingState message="Carregando dados do relatório..." />

  if (!dados || !periodoAtual) {
    return (
      <div className="card text-center py-16">
        <FileBarChart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-500">Sem dados disponíveis</h3>
        <p className="text-sm text-gray-400 mt-1">Conecte uma planilha em Configurações para gerar relatórios.</p>
      </div>
    )
  }

  const { f, ant, margem, receitaBruta, totalDeducoes, lucroOp,
    varMarkup, varTpv, varLiquido, varEcs,
    saude, ecsSemReceita, oportunidades, top10, ecsCom,
    paretoData, top5pct, evolucao, dreLinhas, insights, acoes } = dados

  const saudeConfig = {
    CRITICA: {
      bg: 'bg-red-600', border: 'border-red-700',
      text: 'text-white', badge: 'SITUAÇÃO CRÍTICA',
      icon: <XCircle className="w-6 h-6" />,
      desc: 'Indicadores exigem ação imediata. Veja as recomendações abaixo.',
    },
    ATENCAO: {
      bg: 'bg-amber-500', border: 'border-amber-600',
      text: 'text-white', badge: 'REQUER ATENÇÃO',
      icon: <AlertTriangle className="w-6 h-6" />,
      desc: 'Desempenho abaixo do ideal em alguns indicadores. Acompanhe de perto.',
    },
    SAUDAVEL: {
      bg: 'bg-emerald-600', border: 'border-emerald-700',
      text: 'text-white', badge: 'SITUAÇÃO SAUDÁVEL',
      icon: <CheckCircle className="w-6 h-6" />,
      desc: 'Todos os indicadores dentro das metas. Manter o ritmo de crescimento.',
    },
  }
  const sc = saudeConfig[saude]

  const nivelConfig = {
    critico: { bg: 'bg-red-50', border: 'border-red-200', icon: <XCircle className="w-4 h-4 text-red-600 flex-shrink-0" />, badge: 'bg-red-100 text-red-700' },
    atencao: { bg: 'bg-amber-50', border: 'border-amber-200', icon: <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />, badge: 'bg-amber-100 text-amber-700' },
    positivo: { bg: 'bg-emerald-50', border: 'border-emerald-200', icon: <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />, badge: 'bg-emerald-100 text-emerald-700' },
    info: { bg: 'bg-blue-50', border: 'border-blue-200', icon: <Lightbulb className="w-4 h-4 text-blue-600 flex-shrink-0" />, badge: 'bg-blue-100 text-blue-700' },
  }

  const hoje = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })

  return (
    <>
      {/* Print CSS inline */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .report-section { break-inside: avoid; }
          .page-break { break-before: page; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
      `}</style>

      <div className="space-y-4">
        {/* Barra de controles — oculta na impressão */}
        <div className="no-print flex items-center justify-between flex-wrap gap-3 bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-600">Período:</span>
            <select
              value={periodoSelecionado}
              onChange={(e) => setPeriodoSelecionado(e.target.value)}
              className="input-field w-auto text-sm py-1.5"
            >
              <option value="ultimo">Último período</option>
              {[...fechamentos].reverse().map((fec) => (
                <option key={fec.periodo} value={fec.periodo}>{fec.periodo}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="btn-outline flex items-center gap-2 text-sm"
            >
              <Printer className="w-4 h-4" />
              Imprimir
            </button>
            <button
              onClick={handlePrint}
              className="btn-primary flex items-center gap-2 text-sm"
            >
              <FileBarChart className="w-4 h-4" />
              Exportar PDF
            </button>
          </div>
        </div>

        {/* Conteúdo do relatório */}
        <div ref={reportRef} className="space-y-6 bg-gray-50 rounded-xl p-4 print:p-0 print:bg-white">

          {/* ══ CABEÇALHO DO RELATÓRIO ══ */}
          <div className="report-section bg-white rounded-xl border border-gray-200 overflow-hidden">
            {/* Faixa superior */}
            <div className="bg-slate-800 px-6 py-5 flex items-center justify-between flex-wrap gap-4">
              <div>
                <p className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-1">Relatório de Desempenho Comercial</p>
                <h1 className="text-white text-2xl font-bold">{NOME_EMPRESA}</h1>
                <p className="text-slate-300 text-sm mt-0.5">Parceria CB — Análise de Carteira e Resultados</p>
              </div>
              <div className="text-right">
                <p className="text-slate-400 text-xs">Período de referência</p>
                <p className="text-white text-xl font-bold">{f.periodo}</p>
                {ant && <p className="text-slate-400 text-xs mt-1">Comparativo: {ant.periodo}</p>}
                <p className="text-slate-500 text-xs mt-1">Gerado em {hoje}</p>
              </div>
            </div>

            {/* Banner de situação */}
            <div className={`${sc.bg} px-6 py-4 flex items-center justify-between flex-wrap gap-3`}>
              <div className={`flex items-center gap-3 ${sc.text}`}>
                {sc.icon}
                <div>
                  <p className="font-bold text-lg">{sc.badge}</p>
                  <p className="text-sm opacity-90">{sc.desc}</p>
                </div>
              </div>
              <div className={`flex gap-4 ${sc.text}`}>
                {varMarkup !== null && (
                  <div className="text-center">
                    <p className="text-xs opacity-75">Receita</p>
                    <p className="font-bold text-sm">{varMarkup >= 0 ? '+' : ''}{varMarkup.toFixed(1)}%</p>
                  </div>
                )}
                {varTpv !== null && (
                  <div className="text-center">
                    <p className="text-xs opacity-75">TPV</p>
                    <p className="font-bold text-sm">{varTpv >= 0 ? '+' : ''}{varTpv.toFixed(1)}%</p>
                  </div>
                )}
                {varEcs !== null && (
                  <div className="text-center">
                    <p className="text-xs opacity-75">ECs</p>
                    <p className="font-bold text-sm">{varEcs >= 0 ? '+' : ''}{varEcs.toFixed(1)}%</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ══ SEÇÃO 1 — KPIs PRINCIPAIS ══ */}
          <div className="report-section">
            <SectionTitle number="1" title="Indicadores do Período" />
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              <KPICard
                label="TPV Total"
                value={formatCurrencyShort(f.tpvTotal)}
                variacao={varTpv}
                icon={<Activity className="w-4 h-4" />}
                color="slate"
                detalhe={`${f.ecsAtivos} ECs`}
              />
              <KPICard
                label="Markup / Receita"
                value={formatCurrencyShort(f.markupPos)}
                variacao={varMarkup}
                icon={<ArrowUpRight className="w-4 h-4" />}
                color="emerald"
                detalhe="Receita bruta"
              />
              <KPICard
                label="Margem Real"
                value={`${margem.toFixed(2)}%`}
                variacao={
                  // M-14: guard explícito — ant.markupPos pode ser undefined → NaN pp
                  (ant?.tpvTotal ?? 0) > 0 && ant?.markupPos != null
                    ? margem - (ant.markupPos / ant.tpvTotal! * 100)
                    : null
                }
                icon={<TrendingUp className="w-4 h-4" />}
                color={margem >= 1.5 ? 'emerald' : margem >= 1 ? 'amber' : 'red'}
                detalhe="Markup / TPV"
                isPercent
              />
              <KPICard
                label="ECs Ativos"
                value={String(f.ecsAtivos)}
                variacao={varEcs}
                icon={<Users className="w-4 h-4" />}
                color="blue"
                detalhe={`${ecsCom} c/ receita`}
              />
              <KPICard
                label="Valor Líquido"
                value={formatCurrencyShort(f.valorLiquido)}
                variacao={varLiquido}
                icon={<DollarSign className="w-4 h-4" />}
                color="blue"
                detalhe="Após deduções"
              />
              <KPICard
                label="Resultado Op."
                value={formatCurrencyShort(lucroOp)}
                variacao={null}
                icon={<Target className="w-4 h-4" />}
                color={lucroOp >= 0 ? 'emerald' : 'red'}
                detalhe={totalCustos > 0 ? `Custos: ${formatCurrencyShort(totalCustos)}` : 'Sem custos cadastrados'}
              />
            </div>
          </div>

          {/* ══ SEÇÃO 2 — DESEMPENHO FINANCEIRO ══ */}
          <div className="report-section page-break">
            <SectionTitle number="2" title="Desempenho Financeiro" />
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

              {/* Evolução (ocupa 3/5) */}
              {evolucao.length > 1 && (
                <div className="lg:col-span-3 bg-white rounded-xl border border-gray-200 p-5">
                  <h3 className="text-sm font-semibold text-gray-700 mb-4">Evolução do Markup (últimos períodos)</h3>
                  <ResponsiveContainer width="100%" height={240}>
                    <AreaChart data={evolucao} margin={{ top: 5, right: 10, bottom: 20, left: 10 }}>
                      <defs>
                        <linearGradient id="gradMarkup" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#059669" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="periodo" tick={{ fontSize: 10 }} angle={-20} textAnchor="end" />
                      <YAxis tickFormatter={(v: number) => formatCurrencyShort(v)} tick={{ fontSize: 10 }} width={70} />
                      <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                      <Area
                        type="monotone" dataKey="markup" name="Markup POS"
                        stroke="#059669" strokeWidth={2.5}
                        fill="url(#gradMarkup)" dot={{ r: 4, fill: '#059669' }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* DRE simplificado (ocupa 2/5) */}
              <div className={`${evolucao.length > 1 ? 'lg:col-span-2' : 'lg:col-span-5'} bg-white rounded-xl border border-gray-200 p-5`}>
                <h3 className="text-sm font-semibold text-gray-700 mb-4">DRE — {f.periodo}</h3>
                <div className="space-y-1.5">
                  {dreLinhas.map((linha, i) => (
                    <div
                      key={i}
                      className={`flex items-center justify-between py-1.5 px-2 rounded-lg text-sm ${
                        linha.tipo === 'subtotal' ? 'bg-gray-50 font-semibold text-gray-700 border border-gray-200' :
                        linha.tipo === 'resultado' ? 'bg-blue-50 font-bold text-blue-800 border border-blue-200' :
                        linha.tipo === 'deducao' ? 'text-red-600' :
                        'text-gray-600'
                      }`}
                    >
                      <span>{linha.label}</span>
                      <span className={linha.valor < 0 ? 'text-red-600' : ''}>
                        {linha.valor < 0 ? `(${formatCurrency(Math.abs(linha.valor))})` : formatCurrency(linha.valor)}
                      </span>
                    </div>
                  ))}
                </div>
                {totalDeducoes > 0 && (
                  <p className="text-xs text-gray-400 mt-3">
                    Deduções = {receitaBruta > 0 ? ((totalDeducoes / receitaBruta) * 100).toFixed(1) : '0'}% da Receita Bruta
                  </p>
                )}
              </div>
            </div>

            {/* Tabela histórica compacta */}
            {fechamentos.length > 1 && (
              <div className="bg-white rounded-xl border border-gray-200 p-5 mt-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-4">Histórico de Períodos</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="text-left py-2 px-3 text-xs font-medium text-gray-500">Período</th>
                        <th className="text-right py-2 px-3 text-xs font-medium text-gray-500">ECs</th>
                        <th className="text-right py-2 px-3 text-xs font-medium text-gray-500">TPV</th>
                        <th className="text-right py-2 px-3 text-xs font-medium text-gray-500">Markup</th>
                        <th className="text-right py-2 px-3 text-xs font-medium text-gray-500">Margem</th>
                        <th className="text-right py-2 px-3 text-xs font-medium text-gray-500">Val. Líquido</th>
                        <th className="text-right py-2 px-3 text-xs font-medium text-gray-500">Var. Markup</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...fechamentos].reverse().slice(0, 8).map((fec, i, arr) => {
                        const prev = arr[i + 1]
                        const varM = prev?.markupPos > 0 ? ((fec.markupPos - prev.markupPos) / prev.markupPos) * 100 : null
                        const marg = fec.tpvTotal > 0 ? (fec.markupPos / fec.tpvTotal) * 100 : (fec.taxaMargem ?? 0) * 100
                        const isAtual = fec.periodo === f.periodo
                        return (
                          <tr key={fec.periodo} className={`border-b border-gray-50 ${isAtual ? 'bg-blue-50' : 'hover:bg-gray-50'}`}>
                            <td className={`py-2 px-3 font-medium ${isAtual ? 'text-blue-700' : ''}`}>
                              {fec.periodo}{isAtual && <span className="ml-2 text-xs bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded">atual</span>}
                            </td>
                            <td className="py-2 px-3 text-right text-gray-600">{fec.ecsAtivos}</td>
                            <td className="py-2 px-3 text-right text-gray-600">{formatCurrencyShort(fec.tpvTotal)}</td>
                            <td className="py-2 px-3 text-right font-medium">{formatCurrencyShort(fec.markupPos)}</td>
                            <td className={`py-2 px-3 text-right text-xs font-medium ${marg >= 1.5 ? 'text-emerald-600' : marg >= 1 ? 'text-amber-600' : 'text-red-600'}`}>
                              {marg.toFixed(2)}%
                            </td>
                            <td className="py-2 px-3 text-right text-blue-700 font-medium">{formatCurrencyShort(fec.valorLiquido)}</td>
                            <td className="py-2 px-3 text-right">
                              {varM !== null ? (
                                <span className={`text-xs font-medium ${varM >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                  {varM >= 0 ? '+' : ''}{varM.toFixed(1)}%
                                </span>
                              ) : <span className="text-gray-300">—</span>}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* ══ SEÇÃO 3 — CARTEIRA DE ECs ══ */}
          <div className="report-section page-break">
            <SectionTitle number="3" title="Análise da Carteira de Estabelecimentos" />

            {/* KPIs carteira */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
                <p className="text-2xl font-bold text-gray-900">{f.ecsAtivos}</p>
                <p className="text-xs text-gray-500 mt-1">ECs Ativos</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
                <p className="text-2xl font-bold text-emerald-600">{ecsCom}</p>
                <p className="text-xs text-gray-500 mt-1">Gerando Receita</p>
                <p className="text-xs text-emerald-600 font-medium">{f.ecsAtivos > 0 ? Math.round(ecsCom / f.ecsAtivos * 100) : 0}% da base</p>
              </div>
              <div className={`bg-white rounded-xl border p-4 text-center ${ecsSemReceita.length > 0 ? 'border-red-200' : 'border-gray-200'}`}>
                <p className={`text-2xl font-bold ${ecsSemReceita.length > 0 ? 'text-red-600' : 'text-gray-400'}`}>{ecsSemReceita.length}</p>
                <p className="text-xs text-gray-500 mt-1">Sem Receita</p>
                <p className="text-xs text-red-500 font-medium">{ecsSemReceita.length > 0 ? 'Risco de churn' : 'Tudo em dia'}</p>
              </div>
              <div className={`bg-white rounded-xl border p-4 text-center ${oportunidades.length > 0 ? 'border-blue-200' : 'border-gray-200'}`}>
                <p className={`text-2xl font-bold ${oportunidades.length > 0 ? 'text-blue-600' : 'text-gray-400'}`}>{oportunidades.length}</p>
                <p className="text-xs text-gray-500 mt-1">Oportunidades</p>
                <p className="text-xs text-blue-500 font-medium">
                  {oportunidades.length > 0 ? `+${formatCurrencyShort(oportunidades.length * PRECO_CONTA_DIGITAL)}/mês potencial` : 'Sem oportunidades'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Top 10 ECs por markup */}
              {top10.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                  <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                    <Star className="w-4 h-4 text-amber-500" />
                    Top 10 por Receita Gerada
                  </h3>
                  <div className="space-y-2">
                    {top10.map((ec, i) => {
                      const pct = top10[0].ticketMedio > 0 ? (ec.ticketMedio / top10[0].ticketMedio) * 100 : 0
                      const marg = calcMargemReal(ec.ticketMedio, ec.volumeTotal)
                      return (
                        <div key={ec.id} className="flex items-center gap-2">
                          <span className="text-xs font-bold text-gray-400 w-5 text-right">{i + 1}</span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-0.5">
                              <span className="text-xs font-medium text-gray-700 truncate">{ec.nome}</span>
                              <span className="text-xs font-bold text-emerald-700 ml-2 flex-shrink-0">{formatCurrencyShort(ec.ticketMedio)}</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-1.5">
                              <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                          <span className="text-xs text-gray-400 w-12 text-right flex-shrink-0">{marg.toFixed(1)}%</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Análise de concentração (Pareto) */}
              {paretoData.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <ShieldAlert className="w-4 h-4 text-amber-500" />
                        Concentração de TPV (Pareto)
                      </h3>
                      <p className="text-xs text-gray-400 mt-0.5">Top 5 ECs = {top5pct}% do faturamento total</p>
                    </div>
                    {top5pct > 50 && (
                      <span className="text-xs bg-amber-100 text-amber-700 font-medium px-2 py-0.5 rounded-full flex-shrink-0">
                        ⚠ Concentrado
                      </span>
                    )}
                  </div>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={paretoData.slice(0, 10)} margin={{ bottom: 30, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
                      <XAxis dataKey="nome" tick={{ fontSize: 9 }} angle={-30} textAnchor="end" interval={0} />
                      <YAxis tickFormatter={(v: number) => formatCurrencyShort(v)} tick={{ fontSize: 9 }} width={60} />
                      <Tooltip formatter={(value, name) =>
                        name === 'tpv' ? [formatCurrency(Number(value)), 'TPV'] : [`${value}%`, '% Acum.']}
                      />
                      <Bar dataKey="tpv" name="tpv" fill="#3B82F6" radius={[3, 3, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                  {top5pct > 50 && (
                    <p className="text-xs text-amber-600 mt-2 bg-amber-50 p-2 rounded-lg">
                      Alta concentração aumenta o risco de queda brusca de faturamento. Priorizar diversificação da carteira.
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* ECs em risco */}
            {ecsSemReceita.length > 0 && (
              <div className="bg-white rounded-xl border border-red-200 p-5 mt-4">
                <h3 className="text-sm font-semibold text-red-700 mb-3 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  ECs em Risco de Churn ({ecsSemReceita.length} sem receita no período)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  {ecsSemReceita.slice(0, 6).map((ec) => (
                    <div key={ec.id} className="flex items-center gap-2 bg-red-50 rounded-lg p-2.5">
                      <div className="w-2 h-2 rounded-full bg-red-400 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-gray-700 truncate">{ec.nome}</p>
                        <p className="text-xs text-red-500">TPV anterior: {formatCurrencyShort(ec.volumeTotal || 0)}</p>
                      </div>
                    </div>
                  ))}
                </div>
                {ecsSemReceita.length > 6 && (
                  <p className="text-xs text-gray-400 mt-2">+ {ecsSemReceita.length - 6} outros ECs sem receita</p>
                )}
              </div>
            )}
          </div>

          {/* ══ SEÇÃO 4 — DIAGNÓSTICO & RECOMENDAÇÕES ══ */}
          <div className="report-section page-break">
            <SectionTitle number="4" title="Diagnóstico e Recomendações" />
            <div className="space-y-3">
              {insights.map((ins, i) => {
                const cfg = nivelConfig[ins.nivel]
                const nivelLabel = { critico: 'CRÍTICO', atencao: 'ATENÇÃO', positivo: 'POSITIVO', info: 'OPORTUNIDADE' }
                return (
                  <div key={i} className={`${cfg.bg} border ${cfg.border} rounded-xl p-4`}>
                    <div className="flex items-start gap-3">
                      {cfg.icon}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${cfg.badge}`}>
                            {nivelLabel[ins.nivel]}
                          </span>
                          <span className="text-sm font-semibold text-gray-800">{ins.titulo}</span>
                        </div>
                        <p className="text-sm text-gray-600">{ins.texto}</p>
                        {ins.acao && (
                          <div className="mt-2 flex items-start gap-1.5">
                            <Target className="w-3.5 h-3.5 text-gray-400 flex-shrink-0 mt-0.5" />
                            <p className="text-xs text-gray-500 italic">{ins.acao}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
              {insights.length === 0 && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 text-center">
                  <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                  <p className="text-sm font-medium text-emerald-700">Todos os indicadores estão dentro do esperado.</p>
                </div>
              )}
            </div>
          </div>

          {/* ══ SEÇÃO 5 — PLANO DE AÇÃO ══ */}
          {acoes.length > 0 && (
            <div className="report-section">
              <SectionTitle number="5" title="Plano de Ação Prioritário" />
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <p className="text-xs text-gray-400 mb-4">Ações derivadas dos pontos críticos e de atenção identificados acima.</p>
                <div className="space-y-4">
                  {acoes.map((acao, i) => (
                    <div key={i} className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                        {String(i + 1).padStart(2, '0')}
                      </div>
                      <div className="flex-1 border-b border-gray-100 pb-4">
                        <p className="text-sm text-gray-700 leading-relaxed">{acao}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Rodapé do relatório */}
          <div className="text-center py-4 border-t border-gray-200">
            <p className="text-xs text-gray-400">
              Relatório gerado automaticamente pela plataforma Venda Feita · {hoje} · Período: {f.periodo}
            </p>
          </div>

        </div>
      </div>
    </>
  )
}

// ─── Sub-componentes ──────────────────────────────────────────

function SectionTitle({ number, title }: { number: string; title: string }) {
  return (
    <div className="flex items-center gap-3 mb-3">
      <div className="w-7 h-7 rounded-lg bg-slate-800 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
        {number}
      </div>
      <h2 className="text-base font-bold text-gray-800">{title}</h2>
      <div className="flex-1 h-px bg-gray-200" />
    </div>
  )
}

function KPICard({
  label, value, variacao, icon, color, detalhe, isPercent,
}: {
  label: string
  value: string
  variacao: number | null
  icon: React.ReactNode
  color: 'slate' | 'emerald' | 'blue' | 'amber' | 'red'
  detalhe?: string
  isPercent?: boolean
}) {
  const colorMap = {
    slate: 'bg-slate-50 text-slate-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    blue: 'bg-blue-50 text-blue-600',
    amber: 'bg-amber-50 text-amber-600',
    red: 'bg-red-50 text-red-600',
  }
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className={`inline-flex p-1.5 rounded-lg ${colorMap[color]} mb-2`}>{icon}</div>
      <p className="text-xs text-gray-500 leading-tight">{label}</p>
      <p className="text-xl font-bold text-gray-900 mt-0.5">{value}</p>
      {variacao !== null && (
        <span className={`flex items-center gap-0.5 text-xs font-medium mt-0.5 ${variacao >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
          {variacao >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {variacao >= 0 ? '+' : ''}{isPercent ? `${variacao.toFixed(2)}pp` : `${variacao.toFixed(1)}%`}
        </span>
      )}
      {detalhe && <p className="text-xs text-gray-400 mt-0.5">{detalhe}</p>}
    </div>
  )
}
