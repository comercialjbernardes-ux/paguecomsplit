// ═══════════════════════════════════════════════════════════════
// DataContext — Tipos, objeto context e hook
// Arquivo .ts puro (sem JSX) para preservar Vite Fast Refresh.
// O componente DataProvider vive em DataContext.tsx e importa
// daqui. Hooks e tipos devem ser importados deste arquivo.
// ═══════════════════════════════════════════════════════════════

import { createContext, useContext } from 'react'

/** Representa uma planilha cadastrada no benchmark anual. */
export interface HistoricalSheet {
  id: string          // Google Sheets ID
  label: string       // Ex: "Janeiro/2026"
  month: number       // 1–12
  year: number        // ex: 2026
  monthLabel: string  // "Janeiro", "Fevereiro", …
}

import type {
  DadosFechamento,
  Vendedor,
  LancamentoCusto,
  ClienteCarteira,
  SheetTab,
  SheetConnectionStatus,
  MetaPeriodo,
  SegmentOverride,
  CustoOperacional,
  Equipamento,
} from '../types'

export interface DataContextType {
  // ─ Estado de conexao ────────────────────────────────────────
  connectionStatus: SheetConnectionStatus
  isLoading: boolean
  error: string | null
  isOffline: boolean // true quando Sheets falha

  // ─ Dados mesclados ──────────────────────────────────────────
  fechamentos: DadosFechamento[]
  vendedores: Vendedor[]
  lancamentos: LancamentoCusto[]
  clientes: ClienteCarteira[]
  allTabs: SheetTab[]

  // ─ Periodo detectado da planilha ────────────────────────────
  periodo: string // ex: "Mar2026", "" se nao conectado

  // ─ Operacoes do SheetsContext (passthrough) ─────────────────
  connect: (sheetId?: string) => Promise<void>
  refetch: () => Promise<void>
  setSheetId: (id: string) => void
  currentSheetId: string

  // ─ Planilhas históricas (benchmark anual) ────────────────────
  historicalSheets: HistoricalSheet[]
  isLoadingHistorical: boolean
  addHistoricalSheet: (
    id: string,
    month: number,
    year: number,
  ) => Promise<{ success: boolean; label?: string; error?: string }>
  removeHistoricalSheet: (id: string) => void

  // ─ CRUD de Vendedores (localStorage) ────────────────────────
  saveVendedor: (vendedor: Vendedor) => void
  deleteVendedor: (id: number) => void

  // ─ CRUD de Lancamentos (localStorage) ───────────────────────
  saveLancamento: (lancamento: LancamentoCusto) => void
  deleteLancamento: (id: string) => void

  // ─ Metas por periodo ────────────────────────────────────────
  metas: MetaPeriodo[]
  saveMeta: (periodo: string, meta: number) => void

  // ─ Overrides de segmento de clientes ────────────────────────
  saveSegmentOverride: (override: SegmentOverride) => void
  /** Remove override e restaura inferência automática de segmento para o cliente */
  removeSegmentOverride: (clienteId: number) => void
  /**
   * Retorna o snapshot de clientes de um período específico (ex: "Mar2026").
   * Aplica segment overrides e enriquecimento de contaDigitalAtiva, assim como
   * o array `clientes` global. Retorna o snapshot mais recente como fallback.
   */
  getClientesPorPeriodo: (periodo: string) => ClienteCarteira[]

  // ─ CRUD de Custos Operacionais ───────────────────────────────
  custos: CustoOperacional[]
  saveCusto: (custo: CustoOperacional) => void
  deleteCusto: (id: string) => void

  // ─ CRUD de Equipamentos ──────────────────────────────────────
  equipamentos: Equipamento[]
  saveEquipamento: (eq: Equipamento) => void
  deleteEquipamento: (id: string) => void
}

export const DataContext = createContext<DataContextType | null>(null)

export function useDataContext(): DataContextType {
  const context = useContext(DataContext)
  if (!context) {
    throw new Error('useDataContext deve ser usado dentro de um DataProvider')
  }
  return context
}
