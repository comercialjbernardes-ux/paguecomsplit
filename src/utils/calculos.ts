import type { Vendedor, ProdutoVenda } from '../data/equipe'

export type StatusPgto = 'pago' | 'pendente' | 'parcial'

export interface ComissaoVendedorResult {
  fat: number
  meta: number
  atingimentoPct: number
  comissaoBase: number
  bonusValor: number
  comissaoTotal: number
}

// ─── Produto ───────────────────────────────────────────────────────────────

/** Calcula o valor de comissão de um único produto */
export function calcularComissaoProduto(valorVendido: number, pctComissao: number): number {
  return valorVendido * (pctComissao / 100)
}

/** Soma as comissões de todos os produtos de um vendedor */
export function calcularComissaoTotalProdutos(produtos: ProdutoVenda[]): number {
  return produtos.reduce(
    (acc, p) => acc + calcularComissaoProduto(p.valorVendido, p.pctComissao),
    0,
  )
}

/** Soma o valor vendido de todos os produtos */
export function calcularFaturamentoProdutos(produtos: ProdutoVenda[]): number {
  return produtos.reduce((acc, p) => acc + p.valorVendido, 0)
}

// ─── Atingimento ───────────────────────────────────────────────────────────

/** Retorna o percentual de atingimento arredondado */
export function calcularAtingimentoPct(faturamento: number, meta: number): number {
  if (meta === 0) return 0
  return Math.round((faturamento / meta) * 100)
}

// ─── Bônus ─────────────────────────────────────────────────────────────────

/**
 * Retorna o valor do bônus quando o vendedor atingiu >= 100% da meta.
 * @param faturamento  valor realizado
 * @param pctBonus     percentual de bônus configurado no vendedor (ex: 1.5 = 1,5%)
 * @param atingimento  resultado de calcularAtingimentoPct
 */
export function calcularBonus(
  faturamento: number,
  pctBonus: number,
  atingimento: number,
): number {
  return atingimento >= 100 ? faturamento * (pctBonus / 100) : 0
}

// ─── Comissão completa do vendedor ─────────────────────────────────────────

/**
 * Calcula todos os valores de comissão de um vendedor para um período.
 * A comissão base usa o % do vendedor aplicado sobre o faturamento total do período.
 */
export function calcularComissaoVendedor(
  vendedor: Vendedor,
  periodo: 'mensal' | 'acumulado',
): ComissaoVendedorResult {
  const fat =
    periodo === 'mensal' ? vendedor.faturamentoMensal : vendedor.faturamentoAcumulado
  const meta =
    periodo === 'mensal' ? vendedor.metaMensal : vendedor.metaAcumulada

  const atingimentoPct = calcularAtingimentoPct(fat, meta)
  const comissaoBase = fat * (vendedor.comissaoBase / 100)
  const bonusValor = calcularBonus(fat, vendedor.bonus, atingimentoPct)
  const comissaoTotal = comissaoBase + bonusValor

  return { fat, meta, atingimentoPct, comissaoBase, bonusValor, comissaoTotal }
}

// ─── Status de pagamento ───────────────────────────────────────────────────

const _statusMap: Record<number, StatusPgto> = {
  1: 'pago',
  2: 'pago',
  3: 'pendente',
  4: 'pendente',
  5: 'pago',
  6: 'parcial',
  7: 'pendente',
  8: 'parcial',
}

/** Retorna o status de pagamento de comissão pelo id do vendedor */
export function statusPagamentoPorId(id: number): StatusPgto {
  return _statusMap[id] ?? 'pendente'
}

// ─── Formatação (re-exportadas de equipe para centralizar) ─────────────────

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

export function formatPct(value: number): string {
  return `${value.toFixed(1).replace('.', ',')}%`
}
