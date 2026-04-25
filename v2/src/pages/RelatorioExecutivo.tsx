// ═══════════════════════════════════════════════════════════════
// Relatorio Executivo Inteligente
// Diagnostico automatico + recomendacoes estrategicas
// ═══════════════════════════════════════════════════════════════

import { useMemo } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts'
import {
  FileText, TrendingUp, TrendingDown, AlertTriangle,
  CheckCircle, AlertCircle, XCircle, Target, Lightbulb,
} from 'lucide-react'
import { useInternoData } from '../hooks/useInternoData'
import { useDataContext } from '../contexts/dataContextValue'
import { LoadingState } from '../components/LoadingState'
import { formatCurrency, formatCurrencyShort } from '../utils/format'
import { calcCustosMensalEfetivo, dataPertenceAoPeriodo } from '../utils/custos'
import type { DadosFechamento } from '../types'
import { PRECO_CONTA_DIGITAL } from '../constants/empresa'

// ─── Logica de recomendacoes (funcao pura) ────────────────────

interface RecomendacaoItem {
  tipo: 'critica' | 'atencao' | 'ok' | 'info'
  titulo: string
  descricao: string
  acao?: string
}

function gerarRecomendacoes(
  atual: DadosFechamento,
  anterior: DadosFechamento | null,
  totalCustos: number,
  totalClientes: number,
): RecomendacaoItem[] {
  const rec: RecomendacaoItem[] = []

  // ── 1. Margem real (Markup / TPV) ────────────────────────────
  const margemCalc = atual.tpvTotal > 0
    ? (atual.markupPos / atual.tpvTotal) * 100
    : (atual.taxaMargem ?? 0) * 100  // taxaMargem stored as decimal (0.01 = 1%)

  if (margemCalc < 0.8) {
    rec.push({
      tipo: 'critica',
      titulo: 'Margem critica — abaixo de 0,8%',
      descricao: `Margem atual de ${margemCalc.toFixed(2)}% esta em nivel critico. Cada R$1.000 processado gera apenas R$${(margemCalc * 10).toFixed(2)} de receita bruta.`,
      acao: 'Revisao urgente: renegociar taxas com a rede adquirente, eliminar descontos e aumentar TPV minimo por EC.',
    })
  } else if (margemCalc < 1.2) {
    rec.push({
      tipo: 'atencao',
      titulo: `Margem baixa (${margemCalc.toFixed(2)}%)`,
      descricao: totalCustos > 0
        ? `Margem abaixo de 1,2%. Para cobrir os ${formatCurrency(totalCustos)} em custos operacionais registrados, o TPV precisaria ser de ${formatCurrency(totalCustos / (margemCalc / 100))}.`
        : `Margem abaixo de 1,2%. A cada R$1.000 processado, a empresa retém apenas R$${(margemCalc * 10).toFixed(2)} de markup. Para atingir 2% com o markup atual de ${formatCurrency(atual.markupPos)}, o TPV precisaria ser de ${formatCurrency(atual.markupPos / 0.02)}.`,
      acao: 'Priorizar ECs de alto volume, reduzir descontos concedidos e ampliar base de Conta Digital.',
    })
  } else if (margemCalc < 2) {
    rec.push({
      tipo: 'atencao',
      titulo: `Margem em zona de atencao (${margemCalc.toFixed(2)}%)`,
      descricao: `Entre 1,2% e 2%. Viavel mas sensivel a queda de volume. Receita bruta atual: ${formatCurrency(atual.markupPos)}.`,
      acao: `Focar em crescimento de TPV (+10% aumentaria Markup em ~${formatCurrency(atual.markupPos * 0.1)}).`,
    })
  } else {
    rec.push({
      tipo: 'ok',
      titulo: `Margem saudavel (${margemCalc.toFixed(2)}%)`,
      descricao: `Acima de 2%. A empresa gera R$${(margemCalc / 100 * 1000).toFixed(2)} para cada R$1.000 processado. Manter ritmo de crescimento.`,
    })
  }

  // ── 2. Analise comparativa vs período anterior ───────────────
  if (anterior) {
    const varMarkup = anterior.markupPos > 0
      ? ((atual.markupPos - anterior.markupPos) / anterior.markupPos) * 100 : 0
    const varTpv = anterior.tpvTotal > 0
      ? ((atual.tpvTotal - anterior.tpvTotal) / anterior.tpvTotal) * 100 : 0
    const varEcs = anterior.ecsAtivos > 0
      ? ((atual.ecsAtivos - anterior.ecsAtivos) / anterior.ecsAtivos) * 100 : 0

    if (varMarkup < -15) {
      rec.push({
        tipo: 'critica',
        titulo: `Queda forte no Markup: ${varMarkup.toFixed(1)}%`,
        descricao: `Markup caiu de ${formatCurrency(anterior.markupPos)} para ${formatCurrency(atual.markupPos)} (-${formatCurrency(anterior.markupPos - atual.markupPos)}). Maior queda esperada: perda de EC âncora.`,
        acao: 'Identificar ECs com maior queda de TPV e contatar proativamente para reativacao.',
      })
    } else if (varMarkup < -5) {
      rec.push({
        tipo: 'atencao',
        titulo: `Markup recuou ${Math.abs(varMarkup).toFixed(1)}% vs mes anterior`,
        descricao: `Queda de ${formatCurrency(anterior.markupPos - atual.markupPos)}. TPV variou ${varTpv >= 0 ? '+' : ''}${varTpv.toFixed(1)}%.`,
        acao: 'Verificar sazonalidade e monitorar ticket medio dos ECs ativos.',
      })
    } else if (varMarkup > 10) {
      rec.push({
        tipo: 'ok',
        titulo: `Crescimento expressivo: +${varMarkup.toFixed(1)}%`,
        descricao: `Markup cresceu ${formatCurrency(atual.markupPos - anterior.markupPos)}. ${varEcs > 0 ? `Base de ECs cresceu ${varEcs.toFixed(1)}%.` : 'Ticket medio melhorou.'}`,
      })
    } else if (varMarkup > 0) {
      rec.push({
        tipo: 'ok',
        titulo: `Crescimento moderado: +${varMarkup.toFixed(1)}%`,
        descricao: `Markup evoluiu ${formatCurrency(atual.markupPos - anterior.markupPos)} vs ${anterior.periodo}. Tendencia positiva.`,
      })
    }

    // Churn de ECs
    if (varEcs < -8) {
      rec.push({
        tipo: 'critica',
        titulo: `Perda de ECs: ${Math.abs(varEcs).toFixed(0)}% de reducao`,
        descricao: `Base caiu de ${anterior.ecsAtivos} para ${atual.ecsAtivos} ECs (-${anterior.ecsAtivos - atual.ecsAtivos} estabelecimentos).`,
        acao: 'Implementar plano de retencao imediato: ligar para ECs inativos nos ultimos 30 dias.',
      })
    } else if (varEcs < -3) {
      rec.push({
        tipo: 'atencao',
        titulo: `Reducao de ${Math.abs(varEcs).toFixed(0)}% na base de ECs`,
        descricao: `${anterior.ecsAtivos} → ${atual.ecsAtivos} ECs. Cada EC perdido representa ~${formatCurrency(anterior.markupPos / Math.max(anterior.ecsAtivos, 1))} de Markup/mes.`,
        acao: 'Ativar campanhas de reativacao e revisar motivos de cancelamento.',
      })
    }

    // Descontos crescendo
    if (anterior.descontos > 0 && atual.descontos > anterior.descontos * 1.2) {
      const varDesc = ((atual.descontos - anterior.descontos) / anterior.descontos) * 100
      rec.push({
        tipo: 'atencao',
        titulo: `Descontos cresceram ${varDesc.toFixed(0)}%`,
        descricao: `De ${formatCurrency(anterior.descontos)} para ${formatCurrency(atual.descontos)}. Impacto direto no Markup liquido.`,
        acao: 'Revisar politica de descontos: limitar a maximo de 5% do Markup por EC.',
      })
    }
  }

  // ── 3. Eficiencia operacional ─────────────────────────────────
  if (atual.markupPos > 0) {
    const pctDescontos = (atual.descontos / atual.markupPos) * 100
    const pctFatura = (atual.faturaDigital / atual.markupPos) * 100
    const pctDeducoes = ((atual.descontos + atual.faturaDigital) / atual.markupPos) * 100

    if (pctDeducoes > 25) {
      rec.push({
        tipo: 'critica',
        titulo: `Deducoes consomem ${pctDeducoes.toFixed(1)}% do Markup`,
        descricao: `Descontos: ${pctDescontos.toFixed(1)}% + Conta Digital: ${pctFatura.toFixed(1)}%. Total deduzido: ${formatCurrency(atual.descontos + atual.faturaDigital)}.`,
        acao: 'Negociar reducao de descontos e expandir base de Conta Digital (que gera receita, nao custo).',
      })
    } else if (pctDescontos > 10) {
      rec.push({
        tipo: 'atencao',
        titulo: `Descontos em ${pctDescontos.toFixed(1)}% do Markup`,
        descricao: `${formatCurrency(atual.descontos)} em descontos este mes. Acima de 10% compromete a margem.`,
        acao: 'Mapear os 3 maiores descontos e avaliar renegociacao.',
      })
    }
  }

  // ── 4. Relacao custo/receita ──────────────────────────────────
  if (totalCustos > 0 && atual.markupPos > 0) {
    const pctCusto = (totalCustos / atual.markupPos) * 100
    const lucro = atual.valorLiquido - totalCustos
    if (pctCusto > 80) {
      rec.push({
        tipo: 'critica',
        titulo: `Custos consomem ${pctCusto.toFixed(0)}% do Markup`,
        descricao: `Custos mensais de ${formatCurrency(totalCustos)} vs Markup de ${formatCurrency(atual.markupPos)}. Resultado operacional: ${lucro >= 0 ? '+' : ''}${formatCurrency(lucro)}.`,
        acao: 'Corte imediato de custos variaveis. Identificar e eliminar gastos nao essenciais.',
      })
    } else if (pctCusto > 50) {
      rec.push({
        tipo: 'atencao',
        titulo: `Custos em ${pctCusto.toFixed(0)}% do Markup (meta: <40%)`,
        descricao: `${formatCurrency(totalCustos)} em custos mensais. Margem apos custos: ${formatCurrency(lucro)}.`,
        acao: 'Priorizar crescimento de receita para diluir custos fixos.',
      })
    } else if (pctCusto <= 40) {
      rec.push({
        tipo: 'ok',
        titulo: `Eficiencia de custos: ${pctCusto.toFixed(0)}% do Markup`,
        descricao: `Custos bem controlados. Lucro operacional estimado: ${formatCurrency(lucro)}.`,
      })
    }
  }

  // ── 5. Oportunidade Conta Digital ────────────────────────────
  if (totalClientes > 0 && atual.faturaDigital > 0) {
    const ecsDigital = Math.round(atual.faturaDigital / PRECO_CONTA_DIGITAL)
    const ecsSemDigital = Math.max(0, atual.ecsAtivos - ecsDigital)
    const potencialReceita = ecsSemDigital * PRECO_CONTA_DIGITAL
    const pctAdocao = (ecsDigital / Math.max(atual.ecsAtivos, 1)) * 100

    if (pctAdocao < 40 && ecsSemDigital > 5) {
      rec.push({
        tipo: 'info',
        titulo: `Oportunidade: +${ecsSemDigital} ECs sem Conta Digital`,
        descricao: `Apenas ${ecsDigital} de ${atual.ecsAtivos} ECs tem Conta Digital (${pctAdocao.toFixed(0)}%). Ativar os demais geraria +${formatCurrency(potencialReceita)}/mes de receita recorrente.`,
        acao: `Campanha ativa: oferecer ativacao gratuita para os ${Math.min(ecsSemDigital, 10)} ECs de maior TPV sem Conta Digital.`,
      })
    } else if (pctAdocao >= 70) {
      rec.push({
        tipo: 'ok',
        titulo: `Alta adocao de Conta Digital (${pctAdocao.toFixed(0)}%)`,
        descricao: `${ecsDigital} ECs ativos geram ${formatCurrency(atual.faturaDigital)}/mes de receita recorrente garantida.`,
      })
    }
  }

  return rec
}

// ─── Componente Principal ─────────────────────────────────────

export function RelatorioExecutivoPage() {
  const { fechamentos, fechamentoAtual, clientes, lancamentos, isLoading } = useInternoData()
  const { custos, equipamentos } = useDataContext()

  // Custo mensal total (operacional + equipamentos) — inclui prorate trimestral/anual/único
  const totalCustosMensal = useMemo(() => {
    const op = calcCustosMensalEfetivo(custos, fechamentoAtual?.periodo)
    const eq = equipamentos.reduce((s, eq) => {
      const r = eq.numeroParcelas - eq.parcelasPagas
      return s + (r > 0 ? eq.valorParcela : 0)
    }, 0)
    return op + eq
  }, [custos, equipamentos, fechamentoAtual?.periodo])

  // Periodo anterior — usando indexOf para garantir ordem correta independente do array
  const periodoAnterior = useMemo(() => {
    if (!fechamentoAtual || fechamentos.length < 2) return null
    const idx = fechamentos.indexOf(fechamentoAtual)
    return idx > 0 ? fechamentos[idx - 1] : null
  }, [fechamentos, fechamentoAtual])

  // Calculos do relatorio
  const relatorio = useMemo(() => {
    if (!fechamentoAtual) return null
    const f = fechamentoAtual
    const ant = periodoAnterior

    const totalReceitas = f.markupPos + f.comissaoRede + f.repasse
    const totalDeducoes = f.faturaDigital + f.descontos
    const margemCalc = f.tpvTotal > 0 ? (f.markupPos / f.tpvTotal) * 100 : (f.taxaMargem ?? 0) * 100
    const lucroOperacional = f.valorLiquido - totalCustosMensal

    // Despesas manuais locais — filtradas pelo período atual
    const despesasLocais = lancamentos
      .filter((l) => l.tipo === 'despesa' && l.source === 'local' && dataPertenceAoPeriodo(l.data, f.periodo))
      .reduce((s, l) => s + Math.abs(l.valor), 0)

    // Variacao vs anterior
    const varMarkup = ant && ant.markupPos > 0 ? ((f.markupPos - ant.markupPos) / ant.markupPos) * 100 : null
    const varLiquido = ant && ant.valorLiquido > 0 ? ((f.valorLiquido - ant.valorLiquido) / ant.valorLiquido) * 100 : null
    const varEcs = ant && ant.ecsAtivos > 0 ? ((f.ecsAtivos - ant.ecsAtivos) / ant.ecsAtivos) * 100 : null

    // Diagnostico geral
    const saude: 'CRITICA' | 'ATENCAO' | 'ESTAVEL' | 'SAUDAVEL' =
      margemCalc < 1 ? 'CRITICA'
      : margemCalc < 2 ? 'ATENCAO'
      : lucroOperacional < 0 ? 'ATENCAO'
      : 'SAUDAVEL'

    // Recomendacoes
    const recomendacoes = gerarRecomendacoes(f, ant, totalCustosMensal, clientes.length)

    // Acoes prioritarias (tipo critica ou atencao, max 3)
    const acoes = recomendacoes
      .filter((r) => (r.tipo === 'critica' || r.tipo === 'atencao') && r.acao)
      .slice(0, 3)
      .map((r) => r.acao as string)

    // Bloco 7: projecao rapida (taxa de crescimento media dos ultimos fechamentos)
    const nomesMes = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']
    const taxaMedia = (() => {
      if (fechamentos.length < 2) return 0
      const taxas: number[] = []
      for (let i = 1; i < fechamentos.length; i++) {
        const prev = fechamentos[i - 1].markupPos
        const curr = fechamentos[i].markupPos
        if (prev > 0) taxas.push((curr - prev) / prev)
      }
      return taxas.length > 0 ? taxas.reduce((s, t) => s + t, 0) / taxas.length : 0
    })()

    const ultimoMarkup = f.markupPos
    const ultimoPeriodoMatch = f.periodo.match(/^([A-Za-z]{3})(\d{4})$/)
    const mesBaseRaw = ultimoPeriodoMatch
      ? ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez']
          .indexOf(ultimoPeriodoMatch[1].toLowerCase())
      : -1
    // indexOf retorna -1 quando o período não bate — cair para mês atual como fallback
    const mesBaseGlobal = mesBaseRaw === -1 ? new Date().getMonth() : mesBaseRaw
    const anoBaseGlobal = ultimoPeriodoMatch ? parseInt(ultimoPeriodoMatch[2]) : new Date().getFullYear()
    const projecao3meses = [1, 2, 3].map((n) => {
      const mesBase = mesBaseGlobal
      const anoBase = anoBaseGlobal
      const mesAbs = mesBase + n
      const mesIdx = mesAbs % 12
      const anoOffset = Math.floor(mesAbs / 12)
      const label = `${nomesMes[mesIdx]}/${String(anoBase + anoOffset).slice(-2)}`
      return {
        label,
        valor: Math.round(ultimoMarkup * Math.pow(1 + taxaMedia, n)),
      }
    })

    // Meta de margem: TPV necessário = custos / (margem% / 100)
    // Exemplo: custos=10k, margem=2% → TPV=500k para gerar 10k de Markup
    const margemAlvo = 2 // %
    const receitaMeta = totalCustosMensal > 0
      ? totalCustosMensal / (margemAlvo / 100)
      : totalReceitas * (1 + (margemAlvo - margemCalc) / 100)
    const reducaoCustoNecessaria = totalCustosMensal > 0
      ? totalCustosMensal - totalReceitas * (1 - margemAlvo / 100)
      : 0

    return {
      f, ant,
      totalReceitas, totalDeducoes, margemCalc,
      lucroOperacional, despesasLocais,
      varMarkup, varLiquido, varEcs,
      saude, recomendacoes, acoes,
      projecao3meses, taxaMedia, receitaMeta, reducaoCustoNecessaria, margemAlvo,
    }
  }, [fechamentoAtual, periodoAnterior, totalCustosMensal, clientes, lancamentos, custos, fechamentos])

  if (isLoading) return <LoadingState message="Gerando relatorio executivo..." />

  if (!relatorio) {
    return (
      <div className="card text-center py-12">
        <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-500">Sem dados disponíveis</h3>
        <p className="text-sm text-gray-400 mt-1">Conecte uma planilha para gerar o relatorio.</p>
      </div>
    )
  }

  const { f, ant, totalReceitas, totalDeducoes, margemCalc, lucroOperacional, varMarkup, varLiquido, varEcs, saude, recomendacoes, acoes } = relatorio

  const saúdeConfig = {
    CRITICA: { bg: 'bg-red-100 border-red-300', text: 'text-red-800', icon: <XCircle className="w-5 h-5 text-red-600" />, label: 'SITUACAO CRITICA' },
    ATENCAO: { bg: 'bg-yellow-100 border-yellow-300', text: 'text-yellow-800', icon: <AlertTriangle className="w-5 h-5 text-yellow-600" />, label: 'REQUER ATENCAO' },
    ESTAVEL: { bg: 'bg-blue-50 border-blue-200', text: 'text-blue-800', icon: <AlertCircle className="w-5 h-5 text-blue-500" />, label: 'SITUACAO ESTAVEL' },
    SAUDAVEL: { bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-800', icon: <CheckCircle className="w-5 h-5 text-emerald-500" />, label: 'SITUACAO SAUDAVEL' },
  }
  const sc = saúdeConfig[saude]

  function Variacao({ valor }: { valor: number | null }) {
    if (valor === null) return null
    return (
      <span className={`flex items-center gap-1 text-xs font-medium ${valor >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
        {valor >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
        {valor >= 0 ? '+' : ''}{valor.toFixed(1)}%
      </span>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <FileText className="w-7 h-7 text-violet-500" />
            Relatorio Executivo
          </h1>
          <p className="text-gray-500 mt-1">Diagnostico automatico — {f.periodo}</p>
        </div>
        <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${sc.bg}`}>
          {sc.icon}
          <span className={`text-sm font-bold ${sc.text}`}>{sc.label}</span>
        </div>
      </div>

      {/* 1. Resumo Executivo */}
      <div>
        <h2 className="text-base font-semibold text-gray-700 uppercase tracking-wide mb-3">
          1. Resumo Executivo — {f.periodo}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { label: 'Receita Bruta', value: formatCurrency(totalReceitas), sub: <Variacao valor={varMarkup} />, color: 'emerald' },
            { label: 'Total Deducoes', value: `- ${formatCurrency(totalDeducoes)}`, color: 'red' },
            { label: 'Valor Liquido', value: formatCurrency(f.valorLiquido), sub: <Variacao valor={varLiquido} />, color: 'blue' },
            { label: 'Custos Operac.', value: `- ${formatCurrency(totalCustosMensal)}`, color: totalCustosMensal > 0 ? 'red' : 'gray' },
            { label: 'Lucro Operac.', value: formatCurrency(lucroOperacional), color: lucroOperacional >= 0 ? 'emerald' : 'red' },
            { label: 'Margem Real', value: `${margemCalc.toFixed(2)}%`, color: margemCalc >= 2 ? 'emerald' : margemCalc >= 1 ? 'blue' : 'red' },
          ].map((k, i) => (
            <div key={i} className="card-hover text-center">
              <p className="text-xs text-gray-500 mb-1">{k.label}</p>
              <p className={`text-base font-bold ${k.color === 'emerald' ? 'text-emerald-700' : k.color === 'red' ? 'text-red-700' : k.color === 'blue' ? 'text-blue-700' : 'text-gray-700'}`}>
                {k.value}
              </p>
              {k.sub && <div className="flex justify-center mt-1">{k.sub}</div>}
            </div>
          ))}
        </div>
        {ant && (
          <div className="mt-3 p-3 bg-gray-50 rounded-xl text-sm text-gray-600 flex flex-wrap gap-6">
            <span>Periodo anterior: <strong>{ant.periodo}</strong></span>
            <span>Markup: {formatCurrency(ant.markupPos)} <Variacao valor={varMarkup} /></span>
            <span>Liquido: {formatCurrency(ant.valorLiquido)} <Variacao valor={varLiquido} /></span>
            <span>ECs: {ant.ecsAtivos} → {f.ecsAtivos} <Variacao valor={varEcs} /></span>
          </div>
        )}
      </div>

      {/* 2. Diagnostico Financeiro */}
      <div>
        <h2 className="text-base font-semibold text-gray-700 uppercase tracking-wide mb-3">
          2. Diagnostico Financeiro
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {recomendacoes.map((r, i) => {
            const config = {
              critica: { bg: 'border-l-4 border-red-400 bg-red-50', icon: <XCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" /> },
              atencao: { bg: 'border-l-4 border-yellow-400 bg-yellow-50', icon: <AlertTriangle className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" /> },
              ok: { bg: 'border-l-4 border-emerald-400 bg-emerald-50', icon: <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" /> },
              info: { bg: 'border-l-4 border-blue-300 bg-blue-50', icon: <AlertCircle className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" /> },
            }[r.tipo]
            return (
              <div key={i} className={`rounded-xl p-4 ${config.bg}`}>
                <div className="flex items-start gap-2">
                  {config.icon}
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{r.titulo}</p>
                    <p className="text-xs text-gray-600 mt-0.5">{r.descricao}</p>
                    {r.acao && <p className="text-xs text-gray-500 mt-1 italic">→ {r.acao}</p>}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* 3. Analise de Custos */}
      {totalCustosMensal > 0 && (
        <div>
          <h2 className="text-base font-semibold text-gray-700 uppercase tracking-wide mb-3">
            3. Analise de Custos
          </h2>
          <div className="card space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-700">Resumo de Custos Mensais</h3>
              <a href="/interno/custos" className="text-xs text-blue-600 hover:text-blue-800 font-medium">
                Ver detalhamento completo →
              </a>
            </div>
            {custos.slice(0, 5).map((c) => (
              <div key={c.id} className="flex justify-between text-sm">
                <span className="text-gray-600">{c.descricao}</span>
                <span className="font-medium text-red-700">- {formatCurrency(c.valor)}</span>
              </div>
            ))}
            {custos.length > 5 && (
              <p className="text-xs text-gray-400">+ {custos.length - 5} outros</p>
            )}
            <div className="border-t border-gray-200 pt-2 flex justify-between font-bold text-sm">
              <span>Total Custos Mensais</span>
              <span className="text-red-700">- {formatCurrency(totalCustosMensal)}</span>
            </div>
            {f.markupPos > 0 && (
              <p className="text-xs text-gray-400">
                {((totalCustosMensal / f.markupPos) * 100).toFixed(1)}% do Markup POS — distribuição por categoria disponível em Gestão de Custos
              </p>
            )}
          </div>
        </div>
      )}

      {/* 4. Analise de Carteira */}
      <div>
        <h2 className="text-base font-semibold text-gray-700 uppercase tracking-wide mb-3">
          4. Analise de Carteira
        </h2>
        {ant ? (
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-700">Comparativo vs Período Anterior</h3>
              <a href="/relatorios" className="text-xs text-blue-600 hover:text-blue-800 font-medium">
                Ver histórico completo →
              </a>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 text-xs text-gray-500 font-medium">Métrica</th>
                  <th className="text-right py-2 text-xs text-gray-500 font-medium">{ant.periodo}</th>
                  <th className="text-right py-2 text-xs text-gray-500 font-medium">{f.periodo}</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { label: 'Markup POS', prev: formatCurrency(ant.markupPos), curr: formatCurrency(f.markupPos), up: f.markupPos >= ant.markupPos },
                  { label: 'Valor Líquido', prev: formatCurrency(ant.valorLiquido), curr: formatCurrency(f.valorLiquido), up: f.valorLiquido >= ant.valorLiquido },
                  { label: 'ECs Ativos', prev: String(ant.ecsAtivos), curr: String(f.ecsAtivos), up: f.ecsAtivos >= ant.ecsAtivos },
                  {
                    label: 'Margem',
                    prev: `${(ant.tpvTotal > 0 ? (ant.markupPos / ant.tpvTotal) * 100 : 0).toFixed(2)}%`,
                    curr: `${margemCalc.toFixed(2)}%`,
                    up: margemCalc >= (ant.tpvTotal > 0 ? (ant.markupPos / ant.tpvTotal) * 100 : 0),
                  },
                ].map((row, i) => (
                  <tr key={i} className="border-b border-gray-50 last:border-0">
                    <td className="py-2.5 text-gray-600">{row.label}</td>
                    <td className="py-2.5 text-right text-gray-400">{row.prev}</td>
                    <td className={`py-2.5 text-right font-semibold ${row.up ? 'text-emerald-700' : 'text-red-700'}`}>{row.curr}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-xs text-gray-400 mt-3">
              Ver carteira de ECs, saúde e oportunidades em{' '}
              <a href="/interno/carteira" className="text-blue-500 hover:underline">Carteira</a>
            </p>
          </div>
        ) : (
          <div className="card text-center py-6 text-gray-400 text-sm">
            Apenas um período disponível — adicione mais fechamentos para ver o comparativo
          </div>
        )}
      </div>

      {/* 5. Recomendacoes Estrategicas */}
      <div>
        <h2 className="text-base font-semibold text-gray-700 uppercase tracking-wide mb-3">
          5. Recomendacoes Estrategicas
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {recomendacoes.filter((r) => r.tipo !== 'ok').slice(0, 3).map((r, i) => (
            <div key={i} className="card border-t-4 border-violet-400">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-4 h-4 text-violet-500" />
                <span className="text-xs font-semibold text-violet-700 uppercase">Recomendacao {i + 1}</span>
              </div>
              <p className="text-sm font-semibold text-gray-800">{r.titulo}</p>
              <p className="text-xs text-gray-500 mt-1">{r.descricao}</p>
            </div>
          ))}
          {recomendacoes.filter((r) => r.tipo !== 'ok').length === 0 && (
            <div className="card border-t-4 border-emerald-400 md:col-span-3 text-center py-6">
              <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              <p className="text-sm font-semibold text-emerald-700">Excelente desempenho! Nenhuma recomendacao critica.</p>
            </div>
          )}
        </div>
      </div>

      {/* 6. Plano de Acao */}
      {acoes.length > 0 && (
        <div>
          <h2 className="text-base font-semibold text-gray-700 uppercase tracking-wide mb-3">
            6. Plano de Acao — 3 Prioridades
          </h2>
          <div className="space-y-3">
            {acoes.map((acao, i) => (
              <div key={i} className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                <div className="w-8 h-8 rounded-full bg-violet-500 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                  {i + 1}
                </div>
                <div className="flex-1">
                  <div className="flex items-start gap-2">
                    <Lightbulb className="w-4 h-4 text-violet-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-gray-700">{acao}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7. Projecao Rapida — Bloco 7 */}
      <div>
        <h2 className="text-base font-semibold text-gray-700 uppercase tracking-wide mb-3">
          7. Projecao Rapida — Proximos 3 Meses
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Mini grafico de projecao */}
          <div className="card">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Markup POS Projetado</h3>
            <p className="text-xs text-gray-400 mb-3">
              Taxa de crescimento media: {relatorio.taxaMedia >= 0 ? '+' : ''}{(relatorio.taxaMedia * 100).toFixed(1)}% ao mes
            </p>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={relatorio.projecao3meses}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis tickFormatter={(v: number) => formatCurrencyShort(v)} tick={{ fontSize: 10 }} />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Bar dataKey="valor" name="Projecao" fill="#6366F1" radius={[4, 4, 0, 0]} opacity={0.8} />
              </BarChart>
            </ResponsiveContainer>
            <div className="flex gap-4 mt-2">
              {relatorio.projecao3meses.map((p, i) => (
                <div key={i} className="text-center flex-1">
                  <p className="text-xs text-gray-500">{p.label}</p>
                  <p className="text-sm font-bold text-indigo-700">{formatCurrencyShort(p.valor)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Meta de margem */}
          <div className="card space-y-4">
            <h3 className="text-sm font-semibold text-gray-700">Meta de Margem ({relatorio.margemAlvo}%)</h3>
            <div className="p-3 bg-blue-50 rounded-xl">
              <p className="text-xs text-blue-600 font-semibold mb-1">Para atingir {relatorio.margemAlvo}% de margem:</p>
              <p className="text-sm text-gray-700">
                A receita precisa ser de{' '}
                <span className="font-bold text-blue-700">{formatCurrency(relatorio.receitaMeta)}</span>
              </p>
              {relatorio.reducaoCustoNecessaria > 0 && (
                <p className="text-sm text-gray-700 mt-1">
                  ou os custos devem ser reduzidos em{' '}
                  <span className="font-bold text-red-700">{formatCurrency(relatorio.reducaoCustoNecessaria)}</span>
                </p>
              )}
            </div>
            <div className="p-3 bg-gray-50 rounded-xl">
              <p className="text-xs text-gray-500 font-semibold mb-2">Situacao atual</p>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Margem atual</span>
                <span className={`font-bold ${relatorio.margemCalc >= relatorio.margemAlvo ? 'text-emerald-700' : 'text-red-700'}`}>
                  {relatorio.margemCalc.toFixed(2)}%
                </span>
              </div>
              <div className="flex justify-between text-sm mt-1">
                <span className="text-gray-600">Gap para meta</span>
                <span className={`font-bold ${relatorio.margemCalc >= relatorio.margemAlvo ? 'text-emerald-700' : 'text-amber-700'}`}>
                  {relatorio.margemCalc >= relatorio.margemAlvo
                    ? `+${(relatorio.margemCalc - relatorio.margemAlvo).toFixed(2)}% acima`
                    : `-${(relatorio.margemAlvo - relatorio.margemCalc).toFixed(2)}% abaixo`}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
