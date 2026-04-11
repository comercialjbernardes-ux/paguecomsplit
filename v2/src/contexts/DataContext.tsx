// ═══════════════════════════════════════════════════════════════
// DataContext — Provider unificado de dados
// Combina SheetsContext (leitura) + localStorage (escrita manual)
// API surface identica ao SheetsContext para compatibilidade
// ═══════════════════════════════════════════════════════════════

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react'
import { useSheetsData } from './SheetsContext'
import {
  getAll,
  upsert,
  remove,
  clear,
  hasData,
} from '../services/localStorageService'
import {
  mergeVendedores,
  mergeLancamentos,
  mergeSegmentOverrides,
} from '../services/mergeStrategies'
import type {
  DadosFechamento,
  Vendedor,
  LancamentoCusto,
  ClienteCarteira,
  SheetTab,
  SheetConnectionStatus,
  MetaPeriodo,
  SegmentOverride,
} from '../types'

interface DataContextType {
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
}

const DataContext = createContext<DataContextType | null>(null)

export function DataProvider({ children }: { children: ReactNode }) {
  const sheets = useSheetsData()

  // ─ Estado local ─────────────────────────────────────────────
  const [localVendedores, setLocalVendedores] = useState<Vendedor[]>(() =>
    getAll<Vendedor>('vdf_vendedores'),
  )
  const [localLancamentos, setLocalLancamentos] = useState<LancamentoCusto[]>(() =>
    getAll<LancamentoCusto>('vdf_lancamentos'),
  )
  const [metas, setMetas] = useState<MetaPeriodo[]>(() =>
    getAll<MetaPeriodo>('vdf_metas'),
  )
  const [segmentOverrides, setSegmentOverrides] = useState<SegmentOverride[]>(() =>
    getAll<SegmentOverride>('vdf_segment_overrides'),
  )

  // ─ Seed de vendedores do Sheets no first-run ─────────────────
  useEffect(() => {
    if (sheets.vendedores.length > 0 && !hasData('vdf_vendedores')) {
      const seeded = sheets.vendedores.map((v) => ({ ...v, _seededFromSheets: true }))
      localStorage.setItem('vdf_vendedores', JSON.stringify(seeded))
      setLocalVendedores(seeded)
    }
  }, [sheets.vendedores])

  // ─ Dados mesclados ──────────────────────────────────────────
  const vendedores = mergeVendedores(sheets.vendedores, localVendedores)
  const lancamentos = mergeLancamentos(sheets.lancamentos, localLancamentos)
  const clientes = mergeSegmentOverrides(sheets.clientes, segmentOverrides)

  // ─ isOffline: Sheets falhou mas ha dados locais ──────────────
  const isOffline = !sheets.connectionStatus.connected && (
    localVendedores.length > 0 || localLancamentos.length > 0
  )

  // ─ CRUD Vendedores ───────────────────────────────────────────
  const saveVendedor = useCallback((vendedor: Vendedor) => {
    upsert<Vendedor>('vdf_vendedores', vendedor)
    setLocalVendedores(getAll<Vendedor>('vdf_vendedores'))
  }, [])

  const deleteVendedor = useCallback((id: number) => {
    remove('vdf_vendedores', id)
    setLocalVendedores(getAll<Vendedor>('vdf_vendedores'))
  }, [])

  // ─ CRUD Lancamentos ─────────────────────────────────────────
  const saveLancamento = useCallback((lancamento: LancamentoCusto) => {
    upsert<LancamentoCusto>('vdf_lancamentos', { ...lancamento, source: 'local' })
    setLocalLancamentos(getAll<LancamentoCusto>('vdf_lancamentos'))
  }, [])

  const deleteLancamento = useCallback((id: string) => {
    remove('vdf_lancamentos', id)
    setLocalLancamentos(getAll<LancamentoCusto>('vdf_lancamentos'))
  }, [])

  // ─ Metas ────────────────────────────────────────────────────
  const saveMeta = useCallback((periodo: string, meta: number) => {
    const item = { periodo, meta, editedAt: new Date().toISOString(), id: periodo }
    upsert<typeof item>('vdf_metas', item)
    setMetas(getAll<MetaPeriodo>('vdf_metas'))
  }, [])

  // ─ Connect com clean-slate ──────────────────────────────────
  // Limpa dados transacionais do periodo anterior antes de semear novos dados.
  // Preserva: vdf_metas, vdf_regras_comissao, vdf_projecao_base, vdf_segment_overrides
  const connect = useCallback(async (sheetId?: string) => {
    clear('vdf_vendedores')
    clear('vdf_lancamentos')
    setLocalVendedores([])
    setLocalLancamentos([])
    await sheets.connect(sheetId)
  }, [sheets])

  // ─ Segment Overrides ────────────────────────────────────────
  const saveSegmentOverride = useCallback((override: SegmentOverride) => {
    upsert<SegmentOverride & { id: number }>(
      'vdf_segment_overrides',
      { ...override, id: override.clienteId },
    )
    setSegmentOverrides(getAll<SegmentOverride>('vdf_segment_overrides'))
  }, [])

  return (
    <DataContext.Provider
      value={{
        connectionStatus: sheets.connectionStatus,
        isLoading: sheets.isLoading,
        error: sheets.error,
        isOffline,
        periodo: sheets.fechamentos[0]?.periodo || '',
        fechamentos: sheets.fechamentos,
        vendedores,
        lancamentos,
        clientes,
        allTabs: sheets.allTabs,
        connect,
        refetch: sheets.refetch,
        setSheetId: sheets.setSheetId,
        currentSheetId: sheets.currentSheetId,
        saveVendedor,
        deleteVendedor,
        saveLancamento,
        deleteLancamento,
        metas,
        saveMeta,
        saveSegmentOverride,
      }}
    >
      {children}
    </DataContext.Provider>
  )
}

export function useDataContext(): DataContextType {
  const context = useContext(DataContext)
  if (!context) {
    throw new Error('useDataContext deve ser usado dentro de um DataProvider')
  }
  return context
}

/** Alias para compatibilidade — hooks migrados usam useDataContext diretamente */
export const useSheetsDataCompat = useDataContext
