// ═══════════════════════════════════════════════════════════════
// DataContext — Provider unificado de dados
//
// PONTO 3 — Refatoração: DataContext como objeto deus → composição de hooks.
// Responsabilidades separadas em hooks especializados:
//   - useLocalData      → CRUD de dados persistidos no localStorage
//   - useHistoricalSheets → Benchmark Anual (carga + gestão de planilhas mensais)
//
// DataContext agora é responsável exclusivamente por:
//   - Composição dos dois hooks acima
//   - Computação de dados derivados (allFechamentos, vendedores mesclados, etc.)
//   - Exposição da API pública via Context
//
// API surface idêntica ao comportamento anterior — zero breaking changes.
// ═══════════════════════════════════════════════════════════════

import {
  useCallback,
  useMemo,
  type ReactNode,
} from 'react'
import { useSheetsData } from './SheetsContext'
import { DataContext } from './dataContextValue'
import {
  mergeVendedores,
  mergeLancamentos,
  mergeSegmentOverrides,
} from '../services/mergeStrategies'
import { clear } from '../services/localStorageService'
import { useLocalData } from '../hooks/useLocalData'
import { useHistoricalSheets } from '../hooks/useHistoricalSheets'
import type {
  DadosFechamento,
  ClienteCarteira,
} from '../types'

// ─── Helpers ─────────────────────────────────────────────────

/** Ordena fechamentos por período cronológico (Jan2025 < Fev2025 < ... < Dez2026) */
function sortFechamentos(arr: DadosFechamento[]): DadosFechamento[] {
  const mesMap: Record<string, number> = {
    jan:0, fev:1, mar:2, abr:3, mai:4, jun:5,
    jul:6, ago:7, set:8, out:9, nov:10, dez:11,
  }
  return [...arr].sort((a, b) => {
    const parse = (p: string) => {
      const m = p.toLowerCase().match(/^([a-z]{3})(\d{4})/)
      if (!m) return 0
      return parseInt(m[2]) * 12 + (mesMap[m[1]] ?? 0)
    }
    return parse(a.periodo) - parse(b.periodo)
  })
}

// ─── DataProvider ────────────────────────────────────────────

export function DataProvider({ children }: { children: ReactNode }) {
  const sheets = useSheetsData()

  // ─ Hooks especializados ──────────────────────────────────────
  const localData    = useLocalData()
  const historical   = useHistoricalSheets()

  // ─ Dados históricos computados ───────────────────────────────

  /** Fechamentos de todos os meses históricos — merge + dedup + cronológico */
  const allFechamentos = useMemo(() => {
    const base = Object.values(historical.historicalDataMap).flatMap(d => d.fechamentos)
    const seen = new Set<string>()
    return sortFechamentos(base.filter(f => {
      if (seen.has(f.periodo)) return false
      seen.add(f.periodo)
      return true
    }))
  }, [historical.historicalDataMap])

  /** Vendedores históricos: dedup por id, mês mais recente vence */
  const historicalVendedores = useMemo(() => {
    const sortedKeys = Object.keys(historical.historicalDataMap).sort().reverse()
    const seen = new Set<number>()
    const result = []
    for (const key of sortedKeys) {
      for (const v of historical.historicalDataMap[key].vendedores) {
        if (!seen.has(v.id)) { seen.add(v.id); result.push(v) }
      }
    }
    return result
  }, [historical.historicalDataMap])

  /** Lançamentos históricos: todos os meses concatenados */
  const historicalLancamentos = useMemo(() =>
    Object.values(historical.historicalDataMap)
      .flatMap(d => d.lancamentos)
      .map(l => ({ ...l, source: 'sheets' as const })),
  [historical.historicalDataMap])

  /** Clientes históricos: apenas o mês mais recente disponível */
  const historicalClientes = useMemo(() => {
    const latestKey = Object.keys(historical.historicalDataMap).sort().at(-1)
    return latestKey ? historical.historicalDataMap[latestKey].clientes : []
  }, [historical.historicalDataMap])

  // ─ Dados mesclados ───────────────────────────────────────────

  const vendedores = useMemo(() =>
    mergeVendedores(historicalVendedores, localData.localVendedores),
  [localData.localVendedores, historicalVendedores])

  const lancamentos = useMemo(() =>
    mergeLancamentos(historicalLancamentos, localData.localLancamentos),
  [localData.localLancamentos, historicalLancamentos])

  const clientes = useMemo(() => {
    const clientesBase = mergeSegmentOverrides(historicalClientes, localData.segmentOverrides)
    const nomesComDigital = new Set(
      lancamentos
        .filter((l) => l.categoria === 'Conta Digital')
        .map((l) => l.nomeCliente?.toLowerCase().trim())
        .filter((n): n is string => Boolean(n)),
    )
    if (nomesComDigital.size === 0) return clientesBase
    return clientesBase.map((c) => ({
      ...c,
      contaDigitalAtiva: nomesComDigital.has(c.nome.toLowerCase().trim()),
    }))
  }, [historicalClientes, localData.segmentOverrides, lancamentos])

  // ─ getClientesPorPeriodo ─────────────────────────────────────
  const getClientesPorPeriodo = useCallback((periodo: string): ClienteCarteira[] => {
    const mesMap: Record<string, number> = {
      jan:1, fev:2, mar:3, abr:4, mai:5, jun:6,
      jul:7, ago:8, set:9, out:10, nov:11, dez:12,
    }
    const m = periodo.toLowerCase().match(/^([a-z]{3})(\d{4})$/)
    if (!m) return clientes
    const month = mesMap[m[1]]
    if (!month) return clientes
    const mapKey = `${m[2]}-${String(month).padStart(2, '0')}`
    const base = historical.historicalDataMap[mapKey]?.clientes ?? []
    if (base.length === 0) return clientes
    const withOverrides = mergeSegmentOverrides(base, localData.segmentOverrides)
    const nomesComDigital = new Set(
      lancamentos
        .filter((l) => l.categoria === 'Conta Digital')
        .map((l) => l.nomeCliente?.toLowerCase().trim())
        .filter((n): n is string => Boolean(n)),
    )
    if (nomesComDigital.size === 0) return withOverrides
    return withOverrides.map((c) => ({
      ...c,
      contaDigitalAtiva: nomesComDigital.has(c.nome.toLowerCase().trim()),
    }))
  }, [historical.historicalDataMap, localData.segmentOverrides, lancamentos, clientes])

  // ─ Connect com clean-slate ───────────────────────────────────
  const connect = useCallback(async (sheetId?: string) => {
    clear('vdf_vendedores')
    clear('vdf_lancamentos')
    await sheets.connect(sheetId)
  }, [sheets])

  const periodoAtual = useMemo(
    () => allFechamentos[allFechamentos.length - 1]?.periodo ?? '',
    [allFechamentos],
  )

  // ─ Context value memoizado ───────────────────────────────────
  const contextValue = useMemo(
    () => ({
      connectionStatus: {
        connected: Object.keys(historical.historicalDataMap).length > 0,
        sheetId: '',
        title: 'Benchmark Anual',
        tabs: [],
        lastSync: sheets.connectionStatus.lastSync,
      },
      isLoading: historical.isLoadingHistorical,
      error: null,
      isOffline: false,
      periodo: periodoAtual,
      fechamentos: allFechamentos,
      historicalSheets: historical.historicalSheets,
      isLoadingHistorical: historical.isLoadingHistorical,
      addHistoricalSheet: historical.addHistoricalSheet,
      removeHistoricalSheet: historical.removeHistoricalSheet,
      vendedores,
      lancamentos,
      clientes,
      allTabs: sheets.allTabs,
      connect,
      refetch: sheets.refetch,
      setSheetId: sheets.setSheetId,
      currentSheetId: sheets.currentSheetId,
      saveVendedor:          localData.saveVendedor,
      deleteVendedor:        localData.deleteVendedor,
      saveLancamento:        localData.saveLancamento,
      deleteLancamento:      localData.deleteLancamento,
      metas:                 localData.metas,
      saveMeta:              localData.saveMeta,
      saveSegmentOverride:   localData.saveSegmentOverride,
      removeSegmentOverride: localData.removeSegmentOverride,
      getClientesPorPeriodo,
      custos:                localData.custos,
      saveCusto:             localData.saveCusto,
      deleteCusto:           localData.deleteCusto,
      equipamentos:          localData.equipamentos,
      saveEquipamento:       localData.saveEquipamento,
      deleteEquipamento:     localData.deleteEquipamento,
    }),
    [
      sheets.connectionStatus,
      sheets.allTabs,
      sheets.refetch,
      sheets.setSheetId,
      sheets.currentSheetId,
      historical.historicalDataMap,
      historical.historicalSheets,
      historical.isLoadingHistorical,
      historical.addHistoricalSheet,
      historical.removeHistoricalSheet,
      periodoAtual,
      allFechamentos,
      vendedores,
      lancamentos,
      clientes,
      connect,
      localData.saveVendedor,
      localData.deleteVendedor,
      localData.saveLancamento,
      localData.deleteLancamento,
      localData.metas,
      localData.saveMeta,
      localData.saveSegmentOverride,
      localData.removeSegmentOverride,
      getClientesPorPeriodo,
      localData.custos,
      localData.saveCusto,
      localData.deleteCusto,
      localData.equipamentos,
      localData.saveEquipamento,
      localData.deleteEquipamento,
    ],
  )

  return (
    <DataContext.Provider value={contextValue}>
      {children}
    </DataContext.Provider>
  )
}
