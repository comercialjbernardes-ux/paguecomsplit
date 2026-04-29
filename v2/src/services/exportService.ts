// ═══════════════════════════════════════════════════════════════
// Export Service — Exportacao de dados para PDF, Excel e CSV
// Usa jsPDF para PDF estruturado, SheetJS (xlsx) para Excel
// ═══════════════════════════════════════════════════════════════

import jsPDF from 'jspdf'
import * as XLSX from 'xlsx'
import { formatCurrency, formatPercent } from '../utils/format'
import type { DadosFechamento, Vendedor, LancamentoCusto, ClienteCarteira, ReportData } from '../types'

// ─── Tipos ────────────────────────────────────────────────────

export type ExportFormat = 'pdf' | 'excel' | 'csv'
export type ReportType = 'dre' | 'vendedores' | 'lancamentos' | 'clientes' | 'fechamento' | 'completo'

export interface ExportOptions {
  format: ExportFormat
  reportType: ReportType
  periodo?: string
  titulo?: string
  fileName?: string
}

export type { ReportData }

// ─── PDF Export ───────────────────────────────────────────────

/**
 * Exporta um elemento HTML como PDF via impressão nativa do browser.
 *
 * Estratégia:
 *  1. Clona o elemento já renderizado (SVGs Recharts incluídos) num
 *     container temporário escondido na tela mas visível em @media print.
 *  2. Define document.title como nome do arquivo (Chrome/Edge usam isso
 *     como nome padrão ao salvar como PDF).
 *  3. Chama window.print() → dialog "Salvar como PDF" do browser.
 *  4. Remove o container após o diálogo ser fechado.
 *
 * Vantagens sobre html2canvas:
 *  - Não gera canvas gigantesco (o bug das 497 páginas)
 *  - SVGs e gráficos Recharts renderizam nativamente
 *  - Quebras de página controladas por CSS (break-before / break-inside)
 *  - Arquivo final pequeno e texto selecionável
 */
export async function exportElementToPDF(
  element: HTMLElement,
  fileName: string = 'relatorio'
): Promise<void> {
  // Container isolado: escondido na tela, visível apenas em @media print
  const printRoot = document.createElement('div')
  printRoot.id = 'vdf-pdf-root'

  // Clona o elemento com todos os filhos já renderizados
  printRoot.appendChild(element.cloneNode(true))
  document.body.appendChild(printRoot)

  // O title vira nome padrão do arquivo no diálogo "Salvar como PDF"
  const prevTitle = document.title
  document.title = fileName

  return new Promise<void>((resolve) => {
    const cleanup = () => {
      if (document.body.contains(printRoot)) {
        document.body.removeChild(printRoot)
      }
      document.title = prevTitle
      resolve()
    }

    // afterprint dispara quando o diálogo de impressão fecha
    window.addEventListener('afterprint', cleanup, { once: true })
    // Fallback: alguns browsers (Firefox older) não disparam afterprint
    setTimeout(cleanup, 30_000)

    window.print()
  })
}

/**
 * Gera um relatorio PDF com dados estruturados (sem captura de tela)
 */
export function exportDataToPDF(
  data: ReportData,
  options: ExportOptions
): void {
  const pdf = new jsPDF('p', 'mm', 'a4')
  const pageWidth = pdf.internal.pageSize.getWidth()
  const margin = 15
  const contentWidth = pageWidth - margin * 2
  let y = margin

  // ─── Header ───────
  pdf.setFillColor(13, 27, 42) // navy-500
  pdf.rect(0, 0, pageWidth, 35, 'F')

  pdf.setTextColor(255, 255, 255)
  pdf.setFontSize(18)
  pdf.setFont('helvetica', 'bold')
  pdf.text('Venda Feita', margin, 15)

  pdf.setFontSize(10)
  pdf.setFont('helvetica', 'normal')
  pdf.text(options.titulo || 'Relatorio Financeiro', margin, 23)

  const dataStr = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'long', year: 'numeric',
  })
  pdf.text(`Gerado em ${dataStr}`, margin, 30)

  y = 45
  pdf.setTextColor(0, 0, 0)

  // ─── Conteudo baseado no tipo de relatorio ───────
  switch (options.reportType) {
    case 'dre':
    case 'fechamento':
      y = renderFechamentoPDF(pdf, data.fechamentos, y, margin, contentWidth)
      break
    case 'vendedores':
      y = renderVendedoresPDF(pdf, data.vendedores, y, margin, contentWidth)
      break
    case 'lancamentos':
      y = renderLancamentosPDF(pdf, data.lancamentos, y, margin, contentWidth)
      break
    case 'clientes':
      y = renderClientesPDF(pdf, data.clientes, y, margin, contentWidth)
      break
    case 'completo':
      y = renderFechamentoPDF(pdf, data.fechamentos, y, margin, contentWidth)
      pdf.addPage()
      y = 20
      y = renderVendedoresPDF(pdf, data.vendedores, y, margin, contentWidth)
      pdf.addPage()
      y = 20
      y = renderLancamentosPDF(pdf, data.lancamentos, y, margin, contentWidth)
      pdf.addPage()
      y = 20
      y = renderClientesPDF(pdf, data.clientes, y, margin, contentWidth)
      break
  }

  // ─── Footer ───────
  const totalPages = pdf.getNumberOfPages()
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i)
    pdf.setFontSize(8)
    pdf.setTextColor(150, 150, 150)
    pdf.text(
      `Pagina ${i} de ${totalPages} — Venda Feita Dashboard`,
      pageWidth / 2,
      pdf.internal.pageSize.getHeight() - 8,
      { align: 'center' }
    )
  }

  pdf.save(`${options.fileName || 'relatorio-venda-feita'}.pdf`)
}

function renderFechamentoPDF(
  pdf: jsPDF, data: DadosFechamento[], y: number,
  margin: number, contentWidth: number
): number {
  pdf.setFontSize(14)
  pdf.setFont('helvetica', 'bold')
  pdf.text('DRE / Fechamento', margin, y)
  y += 10

  if (data.length === 0) {
    pdf.setFontSize(10)
    pdf.setFont('helvetica', 'normal')
    pdf.text('Sem dados de fechamento disponíveis.', margin, y)
    return y + 10
  }

  // Tabela de fechamento
  const headers = ['Periodo', 'ECs', 'TPV Total', 'Markup POS', 'Valor Liquido']
  const colWidths = [contentWidth * 0.2, contentWidth * 0.12, contentWidth * 0.23, contentWidth * 0.23, contentWidth * 0.22]

  // Header da tabela
  pdf.setFillColor(240, 240, 240)
  pdf.rect(margin, y, contentWidth, 8, 'F')
  pdf.setFontSize(8)
  pdf.setFont('helvetica', 'bold')
  let x = margin + 2
  headers.forEach((h, i) => {
    pdf.text(h, x, y + 5.5)
    x += colWidths[i]
  })
  y += 10

  // Linhas
  pdf.setFont('helvetica', 'normal')
  data.forEach((f) => {
    if (y > 270) {
      pdf.addPage()
      y = 20
    }
    x = margin + 2
    pdf.text(f.periodo, x, y + 4)
    x += colWidths[0]
    pdf.text(String(f.ecsAtivos), x, y + 4)
    x += colWidths[1]
    pdf.text(formatCurrency(f.tpvTotal), x, y + 4)
    x += colWidths[2]
    pdf.text(formatCurrency(f.markupPos), x, y + 4)
    x += colWidths[3]
    pdf.text(formatCurrency(f.valorLiquido), x, y + 4)
    y += 7

    // Linha divisoria
    pdf.setDrawColor(230, 230, 230)
    pdf.line(margin, y, margin + contentWidth, y)
    y += 1
  })

  return y + 5
}

function renderVendedoresPDF(
  pdf: jsPDF, data: Vendedor[], y: number,
  margin: number, contentWidth: number
): number {
  pdf.setFontSize(14)
  pdf.setFont('helvetica', 'bold')
  pdf.text('Vendedores', margin, y)
  y += 10

  if (data.length === 0) {
    pdf.setFontSize(10)
    pdf.setFont('helvetica', 'normal')
    pdf.text('Sem dados de vendedores disponíveis.', margin, y)
    return y + 10
  }

  const headers = ['Nome', 'Regiao', 'Meta Mensal', 'Comissao %']
  const colWidths = [contentWidth * 0.35, contentWidth * 0.2, contentWidth * 0.25, contentWidth * 0.2]

  pdf.setFillColor(240, 240, 240)
  pdf.rect(margin, y, contentWidth, 8, 'F')
  pdf.setFontSize(8)
  pdf.setFont('helvetica', 'bold')
  let x = margin + 2
  headers.forEach((h, i) => {
    pdf.text(h, x, y + 5.5)
    x += colWidths[i]
  })
  y += 10

  pdf.setFont('helvetica', 'normal')
  data.forEach((v) => {
    if (y > 270) {
      pdf.addPage()
      y = 20
    }
    x = margin + 2
    pdf.text(v.nome, x, y + 4)
    x += colWidths[0]
    pdf.text(v.regiao, x, y + 4)
    x += colWidths[1]
    pdf.text(formatCurrency(v.metaMensal), x, y + 4)
    x += colWidths[2]
    pdf.text(formatPercent(v.comissaoBase), x, y + 4)
    y += 7
    pdf.setDrawColor(230, 230, 230)
    pdf.line(margin, y, margin + contentWidth, y)
    y += 1
  })

  return y + 5
}

function renderLancamentosPDF(
  pdf: jsPDF, data: LancamentoCusto[], y: number,
  margin: number, contentWidth: number
): number {
  pdf.setFontSize(14)
  pdf.setFont('helvetica', 'bold')
  pdf.text('Lancamentos', margin, y)
  y += 10

  if (data.length === 0) {
    pdf.setFontSize(10)
    pdf.setFont('helvetica', 'normal')
    pdf.text('Sem dados de lancamentos disponíveis.', margin, y)
    return y + 10
  }

  // Resumo
  const receitas = data.filter((l) => l.tipo === 'receita').reduce((s, l) => s + l.valor, 0)
  const despesas = data.filter((l) => l.tipo === 'despesa').reduce((s, l) => s + l.valor, 0)

  pdf.setFontSize(9)
  pdf.setFont('helvetica', 'normal')
  pdf.setTextColor(0, 200, 150)
  pdf.text(`Receitas: ${formatCurrency(receitas)}`, margin, y + 4)
  pdf.setTextColor(239, 68, 68)
  pdf.text(`Despesas: ${formatCurrency(despesas)}`, margin + 60, y + 4)
  pdf.setTextColor(0, 0, 0)
  pdf.text(`Saldo: ${formatCurrency(receitas - despesas)}`, margin + 120, y + 4)
  y += 12

  const headers = ['Data', 'Descricao', 'Categoria', 'Tipo', 'Valor']
  const colWidths = [contentWidth * 0.15, contentWidth * 0.3, contentWidth * 0.2, contentWidth * 0.12, contentWidth * 0.23]

  pdf.setFillColor(240, 240, 240)
  pdf.rect(margin, y, contentWidth, 8, 'F')
  pdf.setFontSize(8)
  pdf.setFont('helvetica', 'bold')
  pdf.setTextColor(0, 0, 0)
  let x = margin + 2
  headers.forEach((h, i) => {
    pdf.text(h, x, y + 5.5)
    x += colWidths[i]
  })
  y += 10

  pdf.setFont('helvetica', 'normal')
  data.forEach((l) => {
    if (y > 270) {
      pdf.addPage()
      y = 20
    }
    x = margin + 2
    pdf.text(l.data, x, y + 4)
    x += colWidths[0]
    pdf.text(l.descricao.substring(0, 30), x, y + 4)
    x += colWidths[1]
    pdf.text(l.categoria, x, y + 4)
    x += colWidths[2]
    pdf.text(l.tipo, x, y + 4)
    x += colWidths[3]
    if (l.tipo === 'receita') pdf.setTextColor(0, 200, 150)
    else pdf.setTextColor(239, 68, 68)
    pdf.text(formatCurrency(l.valor), x, y + 4)
    pdf.setTextColor(0, 0, 0)
    y += 7
    pdf.setDrawColor(230, 230, 230)
    pdf.line(margin, y, margin + contentWidth, y)
    y += 1
  })

  return y + 5
}

function renderClientesPDF(
  pdf: jsPDF, data: ClienteCarteira[], y: number,
  margin: number, contentWidth: number
): number {
  pdf.setFontSize(14)
  pdf.setFont('helvetica', 'bold')
  pdf.text('Carteira de Clientes', margin, y)
  y += 10

  if (data.length === 0) {
    pdf.setFontSize(10)
    pdf.setFont('helvetica', 'normal')
    pdf.text('Sem dados de clientes disponíveis.', margin, y)
    return y + 10
  }

  const headers = ['Nome', 'Segmento', 'Vendedor', 'Volume', 'Status']
  const colWidths = [contentWidth * 0.25, contentWidth * 0.18, contentWidth * 0.2, contentWidth * 0.2, contentWidth * 0.17]

  pdf.setFillColor(240, 240, 240)
  pdf.rect(margin, y, contentWidth, 8, 'F')
  pdf.setFontSize(8)
  pdf.setFont('helvetica', 'bold')
  let x = margin + 2
  headers.forEach((h, i) => {
    pdf.text(h, x, y + 5.5)
    x += colWidths[i]
  })
  y += 10

  pdf.setFont('helvetica', 'normal')
  data.forEach((c) => {
    if (y > 270) {
      pdf.addPage()
      y = 20
    }
    x = margin + 2
    pdf.text(c.nome.substring(0, 25), x, y + 4)
    x += colWidths[0]
    pdf.text(c.segmento, x, y + 4)
    x += colWidths[1]
    pdf.text(c.vendedor.substring(0, 18), x, y + 4)
    x += colWidths[2]
    pdf.text(formatCurrency(c.volumeTotal), x, y + 4)
    x += colWidths[3]
    pdf.text(c.status, x, y + 4)
    y += 7
    pdf.setDrawColor(230, 230, 230)
    pdf.line(margin, y, margin + contentWidth, y)
    y += 1
  })

  return y + 5
}

// ─── Excel Export ─────────────────────────────────────────────

/**
 * Exporta dados como Excel (.xlsx) com multiplas abas
 */
export function exportToExcel(
  data: ReportData,
  options: ExportOptions
): void {
  const wb = XLSX.utils.book_new()

  switch (options.reportType) {
    case 'dre':
    case 'fechamento':
      addFechamentoSheet(wb, data.fechamentos)
      break
    case 'vendedores':
      addVendedoresSheet(wb, data.vendedores)
      break
    case 'lancamentos':
      addLancamentosSheet(wb, data.lancamentos)
      break
    case 'clientes':
      addClientesSheet(wb, data.clientes)
      break
    case 'completo':
      addFechamentoSheet(wb, data.fechamentos)
      addVendedoresSheet(wb, data.vendedores)
      addLancamentosSheet(wb, data.lancamentos)
      addClientesSheet(wb, data.clientes)
      break
  }

  XLSX.writeFile(wb, `${options.fileName || 'relatorio-venda-feita'}.xlsx`)
}

function addFechamentoSheet(wb: XLSX.WorkBook, data: DadosFechamento[]): void {
  const rows = data.map((f) => ({
    'Periodo': f.periodo,
    'ECs Ativos': f.ecsAtivos,
    'TPV Total': f.tpvTotal,
    'TPV Medio': f.tpvMedio,
    'Markup POS': f.markupPos,
    'Taxa Margem (%)': f.taxaMargem,
    'Comissao Rede': f.comissaoRede,
    'Repasse': f.repasse,
    'Fatura Digital': -Math.abs(f.faturaDigital || 0),
    'Descontos': -Math.abs(f.descontos || 0),
    'Valor Liquido': f.valorLiquido,
  }))
  const ws = XLSX.utils.json_to_sheet(rows)
  ws['!cols'] = [
    { wch: 14 }, { wch: 10 }, { wch: 16 }, { wch: 16 }, { wch: 16 },
    { wch: 14 }, { wch: 16 }, { wch: 16 }, { wch: 16 }, { wch: 16 }, { wch: 16 },
  ]
  XLSX.utils.book_append_sheet(wb, ws, 'Fechamento')
}

function addVendedoresSheet(wb: XLSX.WorkBook, data: Vendedor[]): void {
  const rows = data.map((v) => ({
    'ID': v.id,
    'Nome': v.nome,
    'Regiao': v.regiao,
    'Meta Mensal': v.metaMensal,
    'Meta Acumulada': v.metaAcumulada,
    'Comissao Base (%)': v.comissaoBase,
    'Bonus (%)': v.bonus,
    'Faturamento Mensal': v.faturamentoMensal,
    'Faturamento Acumulado': v.faturamentoAcumulado,
  }))
  const ws = XLSX.utils.json_to_sheet(rows)
  ws['!cols'] = [
    { wch: 6 }, { wch: 25 }, { wch: 15 }, { wch: 16 }, { wch: 16 },
    { wch: 14 }, { wch: 10 }, { wch: 18 }, { wch: 20 },
  ]
  XLSX.utils.book_append_sheet(wb, ws, 'Vendedores')
}

function addLancamentosSheet(wb: XLSX.WorkBook, data: LancamentoCusto[]): void {
  const rows = data.map((l) => ({
    'ID': l.id,
    'Data': l.data,
    'Descricao': l.descricao,
    'Categoria': l.categoria,
    'Tipo': l.tipo,
    'Valor': l.valor,
    'Conta': l.conta,
  }))
  const ws = XLSX.utils.json_to_sheet(rows)
  ws['!cols'] = [
    { wch: 14 }, { wch: 12 }, { wch: 35 }, { wch: 18 },
    { wch: 10 }, { wch: 16 }, { wch: 18 },
  ]
  XLSX.utils.book_append_sheet(wb, ws, 'Lancamentos')
}

function addClientesSheet(wb: XLSX.WorkBook, data: ClienteCarteira[]): void {
  const rows = data.map((c) => ({
    'ID': c.id,
    'Nome': c.nome,
    'Segmento': c.segmento,
    'Vendedor': c.vendedor,
    'Volume Total': c.volumeTotal,
    'Ticket Medio': c.ticketMedio,
    'Ultima Compra': c.ultimaCompra,
    'Status': c.status,
    'Frequencia': c.frequencia,
  }))
  const ws = XLSX.utils.json_to_sheet(rows)
  ws['!cols'] = [
    { wch: 6 }, { wch: 25 }, { wch: 15 }, { wch: 20 }, { wch: 16 },
    { wch: 14 }, { wch: 14 }, { wch: 10 }, { wch: 10 },
  ]
  XLSX.utils.book_append_sheet(wb, ws, 'Clientes')
}

// ─── CSV Export ───────────────────────────────────────────────

/**
 * Exporta dados como CSV
 */
export function exportToCSV(
  data: ReportData,
  options: ExportOptions
): void {
  let csvContent = ''

  switch (options.reportType) {
    case 'dre':
    case 'fechamento':
      csvContent = fechamentoToCSV(data.fechamentos)
      break
    case 'vendedores':
      csvContent = vendedoresToCSV(data.vendedores)
      break
    case 'lancamentos':
      csvContent = lancamentosToCSV(data.lancamentos)
      break
    case 'clientes':
      csvContent = clientesToCSV(data.clientes)
      break
    case 'completo':
      csvContent = [
        '=== FECHAMENTO ===',
        fechamentoToCSV(data.fechamentos),
        '',
        '=== VENDEDORES ===',
        vendedoresToCSV(data.vendedores),
        '',
        '=== LANCAMENTOS ===',
        lancamentosToCSV(data.lancamentos),
        '',
        '=== CLIENTES ===',
        clientesToCSV(data.clientes),
      ].join('\n')
      break
  }

  // Download do CSV
  const BOM = '\uFEFF'
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${options.fileName || 'relatorio-venda-feita'}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

function escapeCSV(value: string | number): string {
  const str = String(value)
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

function fechamentoToCSV(data: DadosFechamento[]): string {
  const header = 'Periodo,ECs Ativos,TPV Total,TPV Medio,Markup POS,Taxa Margem,Comissao Rede,Repasse,Fatura Digital,Descontos,Valor Liquido'
  const rows = data.map((f) =>
    [f.periodo, f.ecsAtivos, f.tpvTotal, f.tpvMedio, f.markupPos, f.taxaMargem, f.comissaoRede, f.repasse, -Math.abs(f.faturaDigital || 0), -Math.abs(f.descontos || 0), f.valorLiquido]
      .map(escapeCSV).join(',')
  )
  return [header, ...rows].join('\n')
}

function vendedoresToCSV(data: Vendedor[]): string {
  const header = 'ID,Nome,Regiao,Meta Mensal,Meta Acumulada,Comissao Base,Bonus,Faturamento Mensal,Faturamento Acumulado'
  const rows = data.map((v) =>
    [v.id, v.nome, v.regiao, v.metaMensal, v.metaAcumulada, v.comissaoBase, v.bonus, v.faturamentoMensal, v.faturamentoAcumulado]
      .map(escapeCSV).join(',')
  )
  return [header, ...rows].join('\n')
}

function lancamentosToCSV(data: LancamentoCusto[]): string {
  const header = 'ID,Data,Descricao,Categoria,Tipo,Valor,Conta'
  const rows = data.map((l) =>
    [l.id, l.data, l.descricao, l.categoria, l.tipo, l.valor, l.conta]
      .map(escapeCSV).join(',')
  )
  return [header, ...rows].join('\n')
}

function clientesToCSV(data: ClienteCarteira[]): string {
  const header = 'ID,Nome,Segmento,Vendedor,Volume Total,Ticket Medio,Ultima Compra,Status,Frequencia'
  const rows = data.map((c) =>
    [c.id, c.nome, c.segmento, c.vendedor, c.volumeTotal, c.ticketMedio, c.ultimaCompra, c.status, c.frequencia]
      .map(escapeCSV).join(',')
  )
  return [header, ...rows].join('\n')
}

// ─── Dispatcher ───────────────────────────────────────────────

/**
 * Funcao principal para exportar dados no formato escolhido
 */
export function exportReport(data: ReportData, options: ExportOptions): void {
  switch (options.format) {
    case 'pdf':
      exportDataToPDF(data, options)
      break
    case 'excel':
      exportToExcel(data, options)
      break
    case 'csv':
      exportToCSV(data, options)
      break
  }
}
