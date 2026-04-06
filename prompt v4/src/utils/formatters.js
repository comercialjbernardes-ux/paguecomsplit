/**
 * formatters.js — Utilitários centralizados de formatação e cálculo.
 * ÚNICA fonte da verdade para format/calc functions. Não duplique em outros arquivos.
 */

// ─── Moeda ────────────────────────────────────────────────────────────────────

export function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

export function formatCurrencyShort(value) {
  const abs = Math.abs(value)
  const sign = value < 0 ? '-' : ''
  if (abs >= 1_000_000) return `${sign}R$ ${(abs / 1_000_000).toFixed(1).replace('.', ',')}M`
  if (abs >= 1_000)     return `${sign}R$ ${(abs / 1_000).toFixed(0)}K`
  return formatCurrency(value)
}

// ─── Porcentagem ──────────────────────────────────────────────────────────────

export function formatPct(value) {
  return `${value.toFixed(1).replace('.', ',')}%`
}

// ─── Atingimento (cálculo puro, sem dependências) ────────────────────────────

export function calcularAtingimento(faturamento, meta) {
  if (!meta || meta === 0) return 0
  return Math.round((faturamento / meta) * 100)
}
