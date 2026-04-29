// ═══════════════════════════════════════════════════════════════
// useHistoricalSheets — Gestão do Benchmark Anual
//
// PONTO 3 — DataContext como objeto deus (refatoração).
// Responsabilidade única: carregar, armazenar e remover planilhas
// históricas mensais (Benchmark Anual).
//
// Inclui loadHistoricalSheetData(), que replica o pipeline de
// SheetsContext.connect() para carregar todos os dados de cada mês.
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useCallback } from 'react'
import { getSpreadsheetMetadata, readRange } from '../services/sheetsApi'
import { logger } from '../services/errorLogger'
import {
  filterFechamentoTabs,
  mapRowsToFechamento,
  mapRowsToVendedores,
  mapRowsToClientes,
  mapRowsMKPdePOS,
  mapRowsToLancamentos,
  mapRowsRepasses,
  mapRowsDescontos,
  mapRowsCobrDigital,
} from '../services/sheetMappers'
import { SHEET_TABS } from '../config/sheets'
import type {
  DadosFechamento,
  Vendedor,
  LancamentoCusto,
  ClienteCarteira,
  SheetTab,
} from '../types'
import type { HistoricalSheet } from '../contexts/dataContextValue'

// ─── Tipos exportados ────────────────────────────────────────

/** Snapshot completo de dados de uma planilha mensal histórica */
export interface HistoricalSheetData {
  fechamentos: DadosFechamento[]
  vendedores:  Vendedor[]
  lancamentos: LancamentoCusto[]
  clientes:    ClienteCarteira[]
}

// ─── Constantes ──────────────────────────────────────────────

const MESES_ABBR  = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']
const MESES_LABEL = [
  'Janeiro','Fevereiro','Março','Abril','Maio','Junho',
  'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro',
]

// ─── Helpers ──────────────────────────────────────────────────

function findTab(tabs: SheetTab[], name: string): SheetTab | undefined {
  return tabs.find(s => s.title.toLowerCase() === name.toLowerCase())
}

/**
 * Carrega todos os dados de uma planilha mensal histórica.
 * Replica o pipeline de SheetsContext.connect() para uso standalone.
 */
async function loadHistoricalSheetData(
  sheetId: string,
  canonicalPeriodo: string,
): Promise<HistoricalSheetData> {
  const meta = await getSpreadsheetMetadata(sheetId)

  // ── Fechamentos ─────────────────────────────────────────────
  const fTabs = filterFechamentoTabs(meta.sheets)
  const fechamentos: DadosFechamento[] = []
  for (const tab of fTabs) {
    try {
      const rows = await readRange(`'${tab.title}'!A:J`, sheetId) as (string | number)[][]
      fechamentos.push(mapRowsToFechamento(rows, canonicalPeriodo))
    } catch {
      logger.warn(`Erro ao ler aba "${tab.title}"`, 'useHistoricalSheets.load', { tabTitle: tab.title })
    }
  }

  // ── Vendedores ──────────────────────────────────────────────
  let vendedores: Vendedor[] = []
  if (findTab(meta.sheets, SHEET_TABS.VENDEDORES)) {
    try {
      const rows = await readRange(`'${SHEET_TABS.VENDEDORES}'!A:Z`, sheetId) as (string | number)[][]
      vendedores = mapRowsToVendedores(rows)
    } catch {
      logger.warn('Erro ao ler aba Vendedores', 'useHistoricalSheets.load')
    }
  }

  // ── Clientes (fallback: MKP de POS) ────────────────────────
  let clientes: ClienteCarteira[] = []
  if (findTab(meta.sheets, SHEET_TABS.CLIENTES)) {
    try {
      const rows = await readRange(`'${SHEET_TABS.CLIENTES}'!A:Z`, sheetId) as (string | number)[][]
      clientes = mapRowsToClientes(rows)
    } catch {
      logger.warn('Erro ao ler aba Clientes', 'useHistoricalSheets.load')
    }
  } else if (findTab(meta.sheets, SHEET_TABS.MKP_POS)) {
    try {
      const rows = await readRange(`'${SHEET_TABS.MKP_POS}'!A:F`, sheetId) as (string | number)[][]
      clientes = mapRowsMKPdePOS(rows, canonicalPeriodo)
    } catch {
      logger.warn('Erro ao ler aba MKP de POS', 'useHistoricalSheets.load')
    }
  }

  // ── Lançamentos (fallback: Repasses + Descontos + Digital) ──
  let lancamentos: LancamentoCusto[] = []
  if (findTab(meta.sheets, SHEET_TABS.LANCAMENTOS)) {
    try {
      const rows = await readRange(`'${SHEET_TABS.LANCAMENTOS}'!A:Z`, sheetId) as (string | number)[][]
      lancamentos = mapRowsToLancamentos(rows)
    } catch {
      logger.warn('Erro ao ler aba Lancamentos', 'useHistoricalSheets.load')
    }
  } else {
    const combined: LancamentoCusto[] = []
    if (findTab(meta.sheets, SHEET_TABS.REPASSES)) {
      try {
        const rows = await readRange(`'${SHEET_TABS.REPASSES}'!A:F`, sheetId) as (string | number)[][]
        combined.push(...mapRowsRepasses(rows))
      } catch {
        logger.warn('Erro ao ler aba Repasses', 'useHistoricalSheets.load')
      }
    }
    if (findTab(meta.sheets, SHEET_TABS.DESCONTOS)) {
      try {
        const rows = await readRange(`'${SHEET_TABS.DESCONTOS}'!A:F`, sheetId) as (string | number)[][]
        combined.push(...mapRowsDescontos(rows, canonicalPeriodo))
      } catch {
        logger.warn('Erro ao ler aba Descontos', 'useHistoricalSheets.load')
      }
    }
    if (findTab(meta.sheets, SHEET_TABS.COBR_DIGITAL)) {
      try {
        const rows = await readRange(`'${SHEET_TABS.COBR_DIGITAL}'!A:E`, sheetId) as (string | number)[][]
        combined.push(...mapRowsCobrDigital(rows, canonicalPeriodo))
      } catch {
        logger.warn('Erro ao ler aba Cobr. Conta Digital', 'useHistoricalSheets.load')
      }
    }
    lancamentos = combined
  }

  return { fechamentos, vendedores, lancamentos, clientes }
}

// ─── Hook ────────────────────────────────────────────────────

export function useHistoricalSheets() {
  const [historicalSheets, setHistoricalSheets] = useState<HistoricalSheet[]>(() => {
    try {
      const saved = localStorage.getItem('vdf_historical_sheets')
      if (!saved) return []
      const parsed = JSON.parse(saved) as unknown[]
      return parsed.filter(
        (s): s is HistoricalSheet =>
          typeof s === 'object' && s !== null &&
          'id' in s && 'month' in s && 'year' in s,
      )
    } catch { return [] }
  })

  const [historicalDataMap, setHistoricalDataMap] = useState<Record<string, HistoricalSheetData>>({})
  const [isLoadingHistorical, setIsLoadingHistorical] = useState(false)

  // Carrega todas as planilhas salvas ao inicializar
  useEffect(() => {
    const stored = (() => {
      try {
        const s = localStorage.getItem('vdf_historical_sheets')
        if (!s) return []
        const parsed = JSON.parse(s) as unknown[]
        return parsed.filter(
          (e): e is HistoricalSheet =>
            typeof e === 'object' && e !== null && 'id' in e && 'month' in e && 'year' in e,
        )
      } catch { return [] }
    })()
    if (stored.length === 0) return
    let cancelled = false
    setIsLoadingHistorical(true)
    Promise.all(
      stored.map(async (hs) => {
        const canonicalPeriodo = `${MESES_ABBR[hs.month - 1]}${hs.year}`
        const mapKey = `${hs.year}-${String(hs.month).padStart(2, '0')}`
        try {
          const data = await loadHistoricalSheetData(hs.id, canonicalPeriodo)
          return { mapKey, data }
        } catch {
          return {
            mapKey,
            data: { fechamentos: [], vendedores: [], lancamentos: [], clientes: [] } as HistoricalSheetData,
          }
        }
      }),
    ).then((results) => {
      if (cancelled) return
      const map: Record<string, HistoricalSheetData> = {}
      results.forEach(r => { map[r.mapKey] = r.data })
      setHistoricalDataMap(map)
      setIsLoadingHistorical(false)
    })
    return () => { cancelled = true }
  }, [])

  const addHistoricalSheet = useCallback(async (
    id: string, month: number, year: number,
  ): Promise<{ success: boolean; label?: string; error?: string }> => {
    if (!id.trim()) return { success: false, error: 'ID vazio' }
    setIsLoadingHistorical(true)
    try {
      const canonicalPeriodo = `${MESES_ABBR[month - 1]}${year}`
      const mapKey = `${year}-${String(month).padStart(2, '0')}`
      const data = await loadHistoricalSheetData(id, canonicalPeriodo)

      if (data.fechamentos.length === 0) {
        setIsLoadingHistorical(false)
        return { success: false, error: 'Nenhuma aba de fechamento encontrada nesta planilha' }
      }

      const monthLabel = MESES_LABEL[month - 1]
      const label = `${monthLabel}/${year}`
      const entry: HistoricalSheet = { id, label, month, year, monthLabel }

      setHistoricalSheets(prev => {
        const filtered = prev.filter(s => !(s.month === month && s.year === year))
        const next = [...filtered, entry]
        localStorage.setItem('vdf_historical_sheets', JSON.stringify(next))
        return next
      })
      setHistoricalDataMap(prev => ({ ...prev, [mapKey]: data }))
      setIsLoadingHistorical(false)
      return { success: true, label }
    } catch (err) {
      setIsLoadingHistorical(false)
      const msg = err instanceof Error ? err.message : 'Erro ao carregar planilha'
      logger.error(
        'Falha ao carregar planilha histórica', 'useHistoricalSheets.add',
        err instanceof Error ? err : new Error(String(err)), { sheetId: id, month, year },
      )
      return { success: false, error: msg }
    }
  }, [])

  const removeHistoricalSheet = useCallback((id: string) => {
    setHistoricalSheets(prev => {
      const entry = prev.find(s => s.id === id)
      const next = prev.filter(s => s.id !== id)
      localStorage.setItem('vdf_historical_sheets', JSON.stringify(next))
      if (entry) {
        const mapKey = `${entry.year}-${String(entry.month).padStart(2, '0')}`
        setHistoricalDataMap(p => {
          const n = { ...p }
          delete n[mapKey]
          return n
        })
      }
      return next
    })
  }, [])

  return {
    historicalSheets,
    historicalDataMap,
    isLoadingHistorical,
    addHistoricalSheet,
    removeHistoricalSheet,
  }
}
