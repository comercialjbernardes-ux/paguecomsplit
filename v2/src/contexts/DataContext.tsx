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
  useMemo,
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
import { getSpreadsheetMetadata, readRange } from '../services/sheetsApi'
import {
  filterFechamentoTabs,
  extractPeriodoFromTab,
  mapRowsToFechamento,
} from '../services/sheetMappers'
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

// Ordena fechamentos por período cronológico (Jan2025 < Fev2025 < ... < Dez2026)
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

  // ─ Planilhas históricas (comparativo mensal) ─────────────────
  historicalSheets: { id: string; label: string }[]
  isLoadingHistorical: boolean
  addHistoricalSheet: (id: string) => Promise<{ success: boolean; label?: string; error?: string }>
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

  // ─ CRUD de Custos Operacionais ───────────────────────────────
  custos: CustoOperacional[]
  saveCusto: (custo: CustoOperacional) => void
  deleteCusto: (id: string) => void

  // ─ CRUD de Equipamentos ──────────────────────────────────────
  equipamentos: Equipamento[]
  saveEquipamento: (eq: Equipamento) => void
  deleteEquipamento: (id: string) => void
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
  const [custos, setCustos] = useState<CustoOperacional[]>(() =>
    getAll<CustoOperacional>('vdf_custos_fixos'),
  )
  const [equipamentos, setEquipamentos] = useState<Equipamento[]>(() =>
    getAll<Equipamento>('vdf_equipamentos'),
  )

  // ─ Planilhas históricas para comparativo ─────────────────────
  const [historicalSheets, setHistoricalSheets] = useState<{ id: string; label: string }[]>(() => {
    try {
      const saved = localStorage.getItem('vdf_historical_sheets')
      return saved ? JSON.parse(saved) : []
    } catch { return [] }
  })
  // Mapa sheetId → fechamentos carregados daquela planilha
  const [historicalFechamentosMap, setHistoricalFechamentosMap] = useState<Record<string, DadosFechamento[]>>({})
  const [isLoadingHistorical, setIsLoadingHistorical] = useState(false)

  // Carrega planilhas históricas salvas ao inicializar
  useEffect(() => {
    const stored = (() => {
      try {
        const s = localStorage.getItem('vdf_historical_sheets')
        return s ? (JSON.parse(s) as { id: string; label: string }[]) : []
      } catch { return [] }
    })()
    if (stored.length === 0) return
    setIsLoadingHistorical(true)
    Promise.all(
      stored.map(async (hs) => {
        try {
          const meta = await getSpreadsheetMetadata(hs.id)
          const fTabs = filterFechamentoTabs(meta.sheets)
          const loaded: DadosFechamento[] = []
          for (const tab of fTabs) {
            const rows = await readRange(`'${tab.title}'!A:J`, hs.id)
            const rowsTyped = rows as (string | number)[][]
            const periodo = extractPeriodoFromTab(tab.title, rowsTyped)
            loaded.push(mapRowsToFechamento(rowsTyped, periodo))
          }
          return { id: hs.id, fechamentos: loaded }
        } catch {
          return { id: hs.id, fechamentos: [] }
        }
      })
    ).then((results) => {
      const map: Record<string, DadosFechamento[]> = {}
      results.forEach(r => { map[r.id] = r.fechamentos })
      setHistoricalFechamentosMap(map)
      setIsLoadingHistorical(false)
    })
  }, []) // eslint-disable-line

  const addHistoricalSheet = useCallback(async (id: string) => {
    if (!id.trim()) return { success: false, error: 'ID vazio' }
    setIsLoadingHistorical(true)
    try {
      const meta = await getSpreadsheetMetadata(id)
      const fTabs = filterFechamentoTabs(meta.sheets)
      if (fTabs.length === 0) {
        setIsLoadingHistorical(false)
        return { success: false, error: 'Nenhuma aba de fechamento encontrada nesta planilha' }
      }
      const loaded: DadosFechamento[] = []
      for (const tab of fTabs) {
        const rows = await readRange(`'${tab.title}'!A:J`, id)
        const rowsTyped = rows as (string | number)[][]
        const periodo = extractPeriodoFromTab(tab.title, rowsTyped)
        loaded.push(mapRowsToFechamento(rowsTyped, periodo))
      }
      const label = loaded.map(f => f.periodo).join(', ') || meta.title
      setHistoricalSheets(prev => {
        const filtered = prev.filter(s => s.id !== id)
        const next = [...filtered, { id, label }]
        localStorage.setItem('vdf_historical_sheets', JSON.stringify(next))
        return next
      })
      setHistoricalFechamentosMap(prev => ({ ...prev, [id]: loaded }))
      setIsLoadingHistorical(false)
      return { success: true, label }
    } catch (err) {
      setIsLoadingHistorical(false)
      const msg = err instanceof Error ? err.message : 'Erro ao carregar planilha'
      return { success: false, error: msg }
    }
  }, [])

  const removeHistoricalSheet = useCallback((id: string) => {
    setHistoricalSheets(prev => {
      const next = prev.filter(s => s.id !== id)
      localStorage.setItem('vdf_historical_sheets', JSON.stringify(next))
      return next
    })
    setHistoricalFechamentosMap(prev => {
      const next = { ...prev }
      delete next[id]
      return next
    })
  }, [])

  // Merge primary + historical fechamentos, sem duplicatas, ordem cronológica
  const allFechamentos = useMemo(() => {
    const historical = Object.values(historicalFechamentosMap).flat()
    const all = [...sheets.fechamentos, ...historical]
    const seen = new Set<string>()
    return sortFechamentos(all.filter(f => {
      if (seen.has(f.periodo)) return false
      seen.add(f.periodo)
      return true
    }))
  }, [sheets.fechamentos, historicalFechamentosMap])

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

  // A1: popular contaDigitalAtiva cruzando nome do cliente com lançamentos Cobr. Digital
  const clientesBase = mergeSegmentOverrides(sheets.clientes, segmentOverrides)
  const nomesComDigital = new Set(
    lancamentos
      .filter((l) => l.categoria === 'Conta Digital')
      .map((l) => l.nomeCliente?.toLowerCase().trim())
      .filter((n): n is string => Boolean(n))
  )
  const clientes = nomesComDigital.size > 0
    ? clientesBase.map((c) => ({
        ...c,
        contaDigitalAtiva: nomesComDigital.has(c.nome.toLowerCase().trim()),
      }))
    : clientesBase

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

  // ─ CRUD Custos Operacionais ──────────────────────────────────
  const saveCusto = useCallback((custo: CustoOperacional) => {
    upsert<CustoOperacional>('vdf_custos_fixos', custo)
    setCustos(getAll<CustoOperacional>('vdf_custos_fixos'))
  }, [])

  const deleteCusto = useCallback((id: string) => {
    remove('vdf_custos_fixos', id)
    setCustos(getAll<CustoOperacional>('vdf_custos_fixos'))
  }, [])

  // ─ CRUD Equipamentos ─────────────────────────────────────────
  const saveEquipamento = useCallback((eq: Equipamento) => {
    upsert<Equipamento>('vdf_equipamentos', eq)
    setEquipamentos(getAll<Equipamento>('vdf_equipamentos'))
  }, [])

  const deleteEquipamento = useCallback((id: string) => {
    remove('vdf_equipamentos', id)
    setEquipamentos(getAll<Equipamento>('vdf_equipamentos'))
  }, [])

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
        periodo: allFechamentos[allFechamentos.length - 1]?.periodo || sheets.fechamentos[0]?.periodo || '',
        fechamentos: allFechamentos,
        historicalSheets,
        isLoadingHistorical,
        addHistoricalSheet,
        removeHistoricalSheet,
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
        custos,
        saveCusto,
        deleteCusto,
        equipamentos,
        saveEquipamento,
        deleteEquipamento,
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
