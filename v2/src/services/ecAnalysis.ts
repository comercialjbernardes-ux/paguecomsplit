// ═══════════════════════════════════════════════════════════════
// EC Analysis — Análise inteligente de carteira
// Score baseado em dados reais: Markup (receita real), TPV, Conta Digital
// NÃO usa cliente.margem (campo decimal do sheet) — calcula markup/tpv
// ═══════════════════════════════════════════════════════════════

import type { ClienteCarteira, LancamentoCusto } from '../types'

export interface ECProfile {
  cnpj: string
  nome: string
  segmento: string
  tpv: number
  markup: number
  margem: number
  repasses: LancamentoCusto[]
  descontos: LancamentoCusto[]
  contaDigitalAtiva: boolean
  receitaLiquida: number
}

export function crossReferenceByEC(
  cnpj: string,
  clientes: ClienteCarteira[],
  lancamentos: LancamentoCusto[],
): ECProfile | null {
  const cliente = clientes.find((c) => c.cnpj === cnpj)
  if (!cliente) return null

  const nomeNorm = cliente.nome.toLowerCase()
  const repasses = lancamentos.filter(
    (l) => l.tipo === 'receita' && l.categoria === 'Repasse' &&
      l.descricao.toLowerCase().includes(nomeNorm.slice(0, 10)),
  )
  const descontos = lancamentos.filter(
    (l) => l.tipo === 'despesa' && l.source === 'sheets' &&
      l.descricao.toLowerCase().includes(nomeNorm.slice(0, 10)),
  )

  return {
    cnpj: cliente.cnpj || '',
    nome: cliente.nome,
    segmento: cliente.segmento,
    tpv: cliente.volumeTotal,
    markup: cliente.ticketMedio,
    margem: cliente.margem || 0,
    repasses,
    descontos,
    contaDigitalAtiva: cliente.contaDigitalAtiva || false,
    receitaLiquida: cliente.ticketMedio - descontos.reduce((s, l) => s + l.valor, 0),
  }
}

/**
 * Margem real = Markup / TPV × 100
 * Evita usar cliente.margem do sheet (armazenado como decimal 0.0105 ≠ 1.05%)
 */
export function calcMargemReal(markup: number, tpv: number): number {
  if (tpv <= 0 || markup <= 0) return 0
  return (markup / tpv) * 100
}

/**
 * Score de saúde (0–100) baseado em receita real.
 *
 * Componentes:
 *  - Markup (50%): receita gerada vs média da carteira — principal indicador
 *  - TPV     (30%): volume processado vs média
 *  - Conta Digital (20%): fidelidade / receita recorrente
 *
 * NÃO usa cliente.margem (inconsistente no sheet).
 */
export function calcHealthScore(
  cliente: ClienteCarteira,
  mediaTpv: number,
  _temDesconto: boolean,  // mantido para compatibilidade de assinatura
  mediaMarkup = 0,
): number {
  const markupScore = mediaMarkup > 0
    ? Math.min((cliente.ticketMedio / mediaMarkup) * 50, 100)
    : cliente.ticketMedio > 0 ? 50 : 0

  const tpvScore = mediaTpv > 0
    ? Math.min((cliente.volumeTotal / mediaTpv) * 50, 100)
    : 50

  const contaScore = cliente.contaDigitalAtiva ? 100 : 0

  return Math.round(
    markupScore * 0.50 +
    tpvScore    * 0.30 +
    contaScore  * 0.20,
  )
}

export type HealthStatus = 'saudavel' | 'atencao' | 'critico'

export function getHealthStatus(score: number): HealthStatus {
  if (score >= 60) return 'saudavel'
  if (score >= 30) return 'atencao'
  return 'critico'
}

// ─── Análises acionáveis ──────────────────────────────────────

/** ECs sem markup = sem receita no período → risco de churn */
export function getECsSemReceita(clientes: ClienteCarteira[]): ClienteCarteira[] {
  return clientes
    .filter((c) => (c.ticketMedio == null || c.ticketMedio === 0 || c.volumeTotal == null || c.volumeTotal === 0) && c.status !== 'inativo')
    .sort((a, b) => b.volumeTotal - a.volumeTotal)
}

/** ECs sem conta digital com markup > 0 = oportunidade de venda */
export function getOportunidadesContaDigital(clientes: ClienteCarteira[]): ClienteCarteira[] {
  return [...clientes]
    .filter((c) => !c.contaDigitalAtiva && c.ticketMedio > 0)
    .sort((a, b) => b.ticketMedio - a.ticketMedio)
    .slice(0, 8)
}

/** Top N por markup (receita real) */
export function getTopByMarkup(clientes: ClienteCarteira[], n = 10): ClienteCarteira[] {
  return [...clientes].sort((a, b) => b.ticketMedio - a.ticketMedio).slice(0, n)
}

/** Histograma de markup em faixas para gráfico de distribuição */
export function getMarkupDistribution(clientes: ClienteCarteira[]): { faixa: string; count: number; color: string }[] {
  const faixas = [
    { label: 'Sem receita',  min: 0,    max: 0.01,   color: '#EF4444' },
    { label: 'R$1–100',      min: 0.01, max: 100,    color: '#F97316' },
    { label: 'R$101–300',    min: 100,  max: 300,    color: '#EAB308' },
    { label: 'R$301–600',    min: 300,  max: 600,    color: '#84CC16' },
    { label: 'R$601+',       min: 600,  max: Infinity, color: '#22C55E' },
  ]
  return faixas.map((f) => ({
    faixa: f.label,
    count: clientes.filter((c) => c.ticketMedio >= f.min && c.ticketMedio < f.max).length,
    color: f.color,
  }))
}
