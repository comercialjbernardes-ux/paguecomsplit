// ─── Central formatting utilities ───────────────────────────────────────────
// All monetary, percentage and date values must pass through these functions.

/**
 * Full BRL currency format with 2 decimal places.
 * Example: 1234567.89 → "R$ 1.234.567,89"
 */
export function formatBRL(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

/**
 * Percentage with 1 decimal, comma separator.
 * Example: 87.3 → "87,3%"
 */
export function formatPct(value: number): string {
  return `${value.toFixed(1).replace('.', ',')}%`
}

/**
 * Short date in Brazilian format dd/mm/yyyy.
 * Example: "2025-03-15" or Date → "15/03/2025"
 */
export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date + 'T00:00:00') : date
  return d.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

/**
 * Compact format for charts where space is limited.
 * Example: 1200000 → "R$ 1,2M" | 340000 → "R$ 340K" | 500 → "R$ 500"
 */
export function formatK(value: number): string {
  const abs = Math.abs(value)
  const sign = value < 0 ? '-' : ''
  if (abs >= 1_000_000) {
    return `${sign}R$ ${(abs / 1_000_000).toFixed(1).replace('.', ',')}M`
  }
  if (abs >= 1_000) {
    return `${sign}R$ ${(abs / 1_000).toFixed(0)}K`
  }
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}
