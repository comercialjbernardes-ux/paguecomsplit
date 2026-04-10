// ═══════════════════════════════════════════════════════════════
// CRUD Service — Operacoes de escrita na planilha Google Sheets
// @deprecated Escrita de vendedores e lancamentos migrada para
// DataContext + localStorageService (Partes 2 e 3 do refactoring).
// Apenas LancamentoFormData e validateLancamento ainda em uso ativo.
// ═══════════════════════════════════════════════════════════════

import { appendRows, updateRange, deleteRows, getSpreadsheetMetadata } from './sheetsApi'
import { SHEET_TABS } from '../config/sheets'
import { ENV } from '../config/env'
import type { LancamentoCusto, SheetTab } from '../types'

// ─── Tipos ────────────────────────────────────────────────────

export interface LancamentoFormData {
  data: string
  descricao: string
  categoria: string
  tipo: 'receita' | 'despesa'
  valor: number
  conta: string
}

// ─── Helpers ──────────────────────────────────────────────────

/** Gera um ID unico para novos lancamentos */
function generateId(): string {
  return `L${Date.now().toString(36).toUpperCase()}`
}

/** Converte LancamentoFormData para array de valores (ordem das colunas) */
function formDataToRow(data: LancamentoFormData, id?: string): (string | number)[] {
  return [
    id || generateId(),                           // COL 0: ID
    data.data,                                     // COL 1: Data
    data.descricao,                                // COL 2: Descricao
    data.categoria,                                // COL 3: Categoria
    data.tipo === 'receita' ? 'Receita' : 'Despesa', // COL 4: Tipo
    data.valor,                                    // COL 5: Valor
    data.conta,                                    // COL 6: Conta
  ]
}

/** Busca o sheetId numerico da aba Lancamentos */
async function getLancamentosSheetId(spreadsheetId?: string): Promise<number> {
  const id = spreadsheetId || ENV.SHEET_ID
  const metadata = await getSpreadsheetMetadata(id)
  const tab = metadata.sheets.find(
    (s: SheetTab) => s.title.toLowerCase() === SHEET_TABS.LANCAMENTOS.toLowerCase()
  )
  if (!tab) {
    throw new Error(`Aba "${SHEET_TABS.LANCAMENTOS}" nao encontrada na planilha`)
  }
  return tab.sheetId
}

// ─── CRUD ─────────────────────────────────────────────────────

/**
 * Adiciona um novo lancamento na planilha
 * Insere uma nova linha no final da aba "Lancamentos"
 */
export async function addLancamento(
  data: LancamentoFormData,
  sheetId?: string
): Promise<{ id: string; row: number }> {
  const id = generateId()
  const row = formDataToRow(data, id)
  const range = `'${SHEET_TABS.LANCAMENTOS}'!A:G`

  const result = await appendRows(range, [row], sheetId)

  // Extrair numero da linha do range retornado (ex: "Lancamentos!A15:G15" -> 15)
  const match = result.updatedRange.match(/(\d+)/)
  const rowNumber = match ? parseInt(match[1]) : 0

  return { id, row: rowNumber }
}

/**
 * Atualiza um lancamento existente na planilha
 * Sobrescreve a linha correspondente ao _sheetRow do lancamento
 */
export async function updateLancamento(
  lancamento: LancamentoCusto,
  data: LancamentoFormData,
  sheetId?: string
): Promise<void> {
  if (!lancamento._sheetRow) {
    throw new Error('Lancamento sem referencia de linha na planilha (_sheetRow)')
  }

  const row = formDataToRow(data, lancamento.id)
  const range = `'${SHEET_TABS.LANCAMENTOS}'!A${lancamento._sheetRow}:G${lancamento._sheetRow}`

  await updateRange(range, [row], sheetId)
}

/**
 * Exclui um lancamento da planilha
 * Remove a linha correspondente ao _sheetRow
 */
export async function deleteLancamento(
  lancamento: LancamentoCusto,
  sheetId?: string
): Promise<void> {
  if (!lancamento._sheetRow) {
    throw new Error('Lancamento sem referencia de linha na planilha (_sheetRow)')
  }

  const tabSheetId = await getLancamentosSheetId(sheetId)

  // deleteRows usa indices 0-based, _sheetRow e 1-based
  await deleteRows(
    tabSheetId,
    lancamento._sheetRow - 1,  // startIndex (0-based, inclusive)
    lancamento._sheetRow,      // endIndex (0-based, exclusive)
    sheetId
  )
}

// ─── Validacao ────────────────────────────────────────────────

export interface ValidationError {
  field: string
  message: string
}

/** Valida os dados do formulario antes de salvar */
export function validateLancamento(data: LancamentoFormData): ValidationError[] {
  const errors: ValidationError[] = []

  if (!data.data || data.data.trim() === '') {
    errors.push({ field: 'data', message: 'Data e obrigatoria' })
  }

  if (!data.descricao || data.descricao.trim() === '') {
    errors.push({ field: 'descricao', message: 'Descricao e obrigatoria' })
  }

  if (!data.categoria || data.categoria.trim() === '') {
    errors.push({ field: 'categoria', message: 'Categoria e obrigatoria' })
  }

  if (!data.tipo) {
    errors.push({ field: 'tipo', message: 'Tipo e obrigatorio' })
  }

  if (!data.valor || data.valor <= 0) {
    errors.push({ field: 'valor', message: 'Valor deve ser maior que zero' })
  }

  // Conta e opcional para lancamentos locais
  // if (!data.conta || data.conta.trim() === '') {
  //   errors.push({ field: 'conta', message: 'Conta e obrigatoria' })
  // }

  return errors
}
