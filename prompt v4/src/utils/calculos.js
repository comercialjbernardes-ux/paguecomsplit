import { calcularAtingimento, formatCurrency, formatPct } from './formatters'

// Re-exporta para compatibilidade com imports existentes
export { formatCurrency, formatPct }

// ─── Produto ───────────────────────────────────────────────────────────────

/** Calcula o valor de comissão de um único produto */
export function calcularComissaoProduto(valorVendido, pctComissao) {
  return valorVendido * (pctComissao / 100)
}

/** Soma as comissões de todos os produtos de um vendedor */
export function calcularComissaoTotalProdutos(produtos) {
  return produtos.reduce(
    (acc, p) => acc + calcularComissaoProduto(p.valorVendido, p.pctComissao),
    0,
  )
}

/** Soma o valor vendido de todos os produtos */
export function calcularFaturamentoProdutos(produtos) {
  return produtos.reduce((acc, p) => acc + p.valorVendido, 0)
}

// ─── Bônus ─────────────────────────────────────────────────────────────────

export function calcularBonus(faturamento, pctBonus, atingimento) {
  return atingimento >= 100 ? faturamento * (pctBonus / 100) : 0
}

// ─── Comissão completa do vendedor ─────────────────────────────────────────

export function calcularComissaoVendedor(vendedor, periodo) {
  const fat  = periodo === 'mensal' ? vendedor.faturamentoMensal  : vendedor.faturamentoAcumulado
  const meta = periodo === 'mensal' ? vendedor.metaMensal         : vendedor.metaAcumulada

  const atingimentoPct = calcularAtingimento(fat, meta) // fonte única de verdade
  const comissaoBase   = fat * (vendedor.comissaoBase / 100)
  const bonusValor     = calcularBonus(fat, vendedor.bonus, atingimentoPct)
  const comissaoTotal  = comissaoBase + bonusValor

  return { fat, meta, atingimentoPct, comissaoBase, bonusValor, comissaoTotal }
}

// ─── Status de pagamento ───────────────────────────────────────────────────

const _statusMap = { 1: 'pago', 2: 'pago', 3: 'pendente', 4: 'pendente', 5: 'pago', 6: 'parcial', 7: 'pendente', 8: 'parcial' }

export function statusPagamentoPorId(id) {
  return _statusMap[id] ?? 'pendente'
}
