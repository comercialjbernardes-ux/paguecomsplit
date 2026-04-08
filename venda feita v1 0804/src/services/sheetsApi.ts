// ═══════════════════════════════════════════════════════════════
// Google Sheets API v4 — Wrapper de fetch
// Leitura/escrita na planilha via REST API
// ═══════════════════════════════════════════════════════════════

import { ENV } from '../config/env'
import { SHEETS_API_BASE } from '../config/sheets'
import { getAccessToken } from './googleAuth'
import type { SheetTab } from '../types'

// ─── Leitura ──────────────────────────────────────────────────

/**
 * Le os metadados da planilha (titulo, abas, etc.)
 */
export async function getSpreadsheetMetadata(sheetId?: string): Promise<{
  title: string
  sheets: SheetTab[]
}> {
  const id = sheetId || ENV.SHEET_ID
  const url = `${SHEETS_API_BASE}/${id}?fields=properties.title,sheets.properties`
  const res = await fetchWithAuth(url)
  const data = await res.json()

  return {
    title: data.properties?.title || 'Sem titulo',
    sheets: (data.sheets || []).map((s: { properties: { sheetId: number; title: string; index: number } }) => ({
      sheetId: s.properties.sheetId,
      title: s.properties.title,
      index: s.properties.index,
    })),
  }
}

/**
 * Le um range especifico da planilha
 * @param range - ex: "Fechamento_Mar2026!A:Z" ou "Vendedores!A1:G100"
 */
export async function readRange(
  range: string,
  sheetId?: string
): Promise<string[][]> {
  const id = sheetId || ENV.SHEET_ID
  const encodedRange = encodeURIComponent(range)
  const url = `${SHEETS_API_BASE}/${id}/values/${encodedRange}?valueRenderOption=UNFORMATTED_VALUE&dateTimeRenderOption=FORMATTED_STRING`
  const res = await fetchWithAuth(url)
  const data = await res.json()
  return data.values || []
}

/**
 * Le multiplos ranges de uma vez (batch read)
 */
export async function readMultipleRanges(
  ranges: string[],
  sheetId?: string
): Promise<Record<string, string[][]>> {
  const id = sheetId || ENV.SHEET_ID
  const params = ranges.map((r) => `ranges=${encodeURIComponent(r)}`).join('&')
  const url = `${SHEETS_API_BASE}/${id}/values:batchGet?${params}&valueRenderOption=UNFORMATTED_VALUE&dateTimeRenderOption=FORMATTED_STRING`
  const res = await fetchWithAuth(url)
  const data = await res.json()

  const result: Record<string, string[][]> = {}
  ;(data.valueRanges || []).forEach((vr: { range: string; values?: string[][] }, i: number) => {
    result[ranges[i]] = vr.values || []
  })
  return result
}

// ─── Escrita ──────────────────────────────────────────────────

/**
 * Adiciona linhas ao final de um range (append)
 */
export async function appendRows(
  range: string,
  values: (string | number | boolean)[][],
  sheetId?: string
): Promise<{ updatedRange: string; updatedRows: number }> {
  const id = sheetId || ENV.SHEET_ID
  const encodedRange = encodeURIComponent(range)
  const url = `${SHEETS_API_BASE}/${id}/values/${encodedRange}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`

  const res = await fetchWithAuth(url, {
    method: 'POST',
    body: JSON.stringify({ values }),
  })
  const data = await res.json()
  return {
    updatedRange: data.updates?.updatedRange || '',
    updatedRows: data.updates?.updatedRows || 0,
  }
}

/**
 * Atualiza um range especifico (update)
 */
export async function updateRange(
  range: string,
  values: (string | number | boolean)[][],
  sheetId?: string
): Promise<{ updatedCells: number }> {
  const id = sheetId || ENV.SHEET_ID
  const encodedRange = encodeURIComponent(range)
  const url = `${SHEETS_API_BASE}/${id}/values/${encodedRange}?valueInputOption=USER_ENTERED`

  const res = await fetchWithAuth(url, {
    method: 'PUT',
    body: JSON.stringify({ values }),
  })
  const data = await res.json()
  return { updatedCells: data.updatedCells || 0 }
}

/**
 * Remove linhas de uma aba especifica
 */
export async function deleteRows(
  tabSheetId: number,
  startIndex: number,
  endIndex: number,
  sheetId?: string
): Promise<void> {
  const id = sheetId || ENV.SHEET_ID
  const url = `${SHEETS_API_BASE}/${id}:batchUpdate`

  await fetchWithAuth(url, {
    method: 'POST',
    body: JSON.stringify({
      requests: [
        {
          deleteDimension: {
            range: {
              sheetId: tabSheetId,
              dimension: 'ROWS',
              startIndex,
              endIndex,
            },
          },
        },
      ],
    }),
  })
}

// ─── Helpers ──────────────────────────────────────────────────

/**
 * Fetch com autenticacao (token OAuth ou API Key)
 *
 * Estrategia:
 * - GET  (leitura): sempre usa API Key. Se o usuario estiver logado, tambem
 *   envia o Bearer token como Authorization — isso garante acesso tanto a
 *   planilhas publicas quanto a privadas compartilhadas com o usuario.
 * - POST/PUT/DELETE (escrita): usa Bearer token (obrigatorio).
 */
async function fetchWithAuth(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = getAccessToken()
  const method = (options.method || 'GET').toUpperCase()
  const isWrite = ['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }

  // Para leituras: sempre adiciona API Key na URL
  if (!isWrite && ENV.GOOGLE_API_KEY) {
    const separator = url.includes('?') ? '&' : '?'
    url = `${url}${separator}key=${ENV.GOOGLE_API_KEY}`
  }

  // Se tiver token OAuth, manda como Authorization (leitura + escrita)
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  } else if (isWrite) {
    throw new Error('Autenticacao necessaria para escrita. Faca login novamente.')
  }

  const res = await fetch(url, { ...options, headers })

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: { message: res.statusText } }))
    const message = error?.error?.message || `Erro HTTP ${res.status}`
    throw new Error(`[Sheets API] ${message}`)
  }

  return res
}
