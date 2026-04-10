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

// ─── Atingimento ───────────────────────────────────────────────────────────

/** Retorna o percentual de atingimento arredondado */
export function calcularAtingimentoPct(faturamento, meta) {
  if (meta === 0) return 0
  return Math.round((faturamento / meta) * 100)
}

// ─── Bônus ─────────────────────────────────────────────────────────────────

/**
 * Retorna o valor do bônus quando o vendedor atingiu >= 100% da meta.
 */
export function calcularBonus(faturamento, pctBonus, atingimento) {
  return atingimento >= 100 ? faturamento * (pctBonus / 100) : 0
}

// ─── Comissão completa do vendedor ─────────────────────────────────────────

/**
 * Calcula todos os valores de comissão de um vendedor para um período.
 */
export function calcularComissaoVendedor(vendedor, periodo) {
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

const _statusMap = {
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
export function statusPagamentoPorId(id) {
  return _statusMap[id] ?? 'pendente'
}

// ─── Formatação ───────────────────────────────────────────────────────────

export function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

export function formatPct(value) {
  return `${value.toFixed(1).replace('.', ',')}%`
}
