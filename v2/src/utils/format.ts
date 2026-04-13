// ═══════════════════════════════════════════════════════════════
// Utilitarios de formatacao — moeda, percentual, datas
// ═══════════════════════════════════════════════════════════════

/** Formata valor como moeda BRL completa: R$ 1.234,56 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  }).format(value)
}

/** Formata valor como moeda abreviada: R$ 1,2M ou R$ 850K */
export function formatCurrencyShort(value: number): string {
  const abs = Math.abs(value)
  const sign = value < 0 ? '-' : ''

  if (abs >= 1_000_000) {
    return `${sign}R$ ${(abs / 1_000_000).toFixed(1).replace('.', ',')}M`
  }
  if (abs >= 1_000) {
    return `${sign}R$ ${(abs / 1_000).toFixed(0)}K`
  }
  return formatCurrency(value)
}

/** Formata percentual: 12.5 -> "12,5%" */
export function formatPercent(value: number, decimals = 1): string {
  return `${value.toFixed(decimals).replace('.', ',')}%`
}

/** Formata numero com separador de milhar: 1234567 -> "1.234.567" */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat('pt-BR').format(value)
}

/** Calcula percentual de atingimento: (realizado / meta) * 100 */
export function calcAtingimento(realizado: number, meta: number): number {
  if (meta === 0) return 0
  return (realizado / meta) * 100
}

/** Retorna classe CSS para badge de status */
export function getStatusBadgeClass(status: string): string {
  switch (status.toLowerCase()) {
    case 'ativo':
    case 'novo':
      return 'badge-success'
    case 'em risco':
      return 'badge-warning'
    case 'inativo':
      return 'badge-error'
    default:
      return 'badge-success'
  }
}

/** Retorna cor para graficos baseado no tipo */
export function getChartColor(index: number): string {
  const colors = [
    '#00C896', // emerald
    '#0D1B2A', // navy
    '#3B82F6', // blue
    '#F59E0B', // amber
    '#EF4444', // red
    '#8B5CF6', // violet
    '#EC4899', // pink
    '#06B6D4', // cyan
  ]
  return colors[index % colors.length]
}

/**
 * Converte string de periodo "Mar2026" para data DD/MM/AAAA ("01/03/2026").
 * Retorna a string original se nao reconhecer o formato.
 */
export function periodoToDate(periodo: string): string {
  const monthMap: Record<string, string> = {
    jan: '01', fev: '02', mar: '03', abr: '04',
    mai: '05', jun: '06', jul: '07', ago: '08',
    set: '09', out: '10', nov: '11', dez: '12',
  }
  const match = periodo.match(/^([A-Za-z]{3})(\d{4})$/i)
  if (!match) return periodo
  const month = monthMap[match[1].toLowerCase()]
  if (!month) return periodo
  return `01/${month}/${match[2]}`
}

/**
 * Converte data no formato DD/MM/AAAA para Date (usado para ordenacao).
 * Retorna new Date(0) como fallback para strings invalidas.
 */
export function parseDateBR(data: string): Date {
  if (!data) return new Date(0)
  const parts = data.split('/')
  if (parts.length === 3) {
    const [d, m, y] = parts.map(Number)
    const dt = new Date(y, m - 1, d)
    if (!isNaN(dt.getTime())) return dt
  }
  const fallback = new Date(data)
  return isNaN(fallback.getTime()) ? new Date(0) : fallback
}
