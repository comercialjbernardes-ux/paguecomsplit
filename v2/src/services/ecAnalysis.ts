// ═══════════════════════════════════════════════════════════════
// EC Analysis — Cruzamento de dados por CNPJ do estabelecimento
// Combina dados de ClienteCarteira + LancamentoCusto por CNPJ
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
  receitaLiquida: number // markup - sum(descontos)
}

/**
 * Retorna o perfil completo de um EC pelo CNPJ,
 * cruzando dados da carteira com lançamentos financeiros.
 */
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

  const totalDescontos = descontos.reduce((s, l) => s + l.valor, 0)

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
    receitaLiquida: cliente.ticketMedio - totalDescontos,
  }
}

/**
 * Calcula o score de saúde (0-100) de um EC.
 * - TPV (40%): normalizado pela média da carteira
 * - Margem (30%): > 1% = 100%, escala linear até 0%
 * - Conta Digital ativa (20%)
 * - Sem desconto no período (10%)
 */
export function calcHealthScore(
  cliente: ClienteCarteira,
  mediaTpv: number,
  temDesconto: boolean,
): number {
  const tpvScore = mediaTpv > 0 ? Math.min((cliente.volumeTotal / mediaTpv) * 50, 100) : 50
  const margemScore = Math.min(((cliente.margem || 0) / 1.0) * 100, 100)
  const contaScore = cliente.contaDigitalAtiva ? 100 : 0
  const semDesconto = temDesconto ? 0 : 100

  return Math.round(
    tpvScore * 0.4 +
    margemScore * 0.3 +
    contaScore * 0.2 +
    semDesconto * 0.1,
  )
}

export type HealthStatus = 'saudavel' | 'atencao' | 'critico'

export function getHealthStatus(score: number): HealthStatus {
  if (score >= 70) return 'saudavel'
  if (score >= 40) return 'atencao'
  return 'critico'
}
