// ═══════════════════════════════════════════════════════════════
// DataContext — Provider unificado de dados
// Combina SheetsContext (leitura) + localStorage (escrita manual)
// API surface identica ao SheetsContext para compatibilidade
// ═══════════════════════════════════════════════════════════════

import {
  useState,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react'
import { useSheetsData } from './SheetsContext'
import { DataContext } from './dataContextValue'
import type { HistoricalSheet } from './dataContextValue'
import {
  getAll,
  upsert,
  remove,
  clear,
} from '../services/localStorageService'
import {
  mergeVendedores,
  mergeLancamentos,
  mergeSegmentOverrides,
} from '../services/mergeStrategies'
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
  MetaPeriodo,
  SegmentOverride,
  CustoOperacional,
  Equipamento,
} from '../types'

// ─── Tipos internos ──────────────────────────────────────────────────────────

/** Snapshot completo de dados de uma planilha mensal histórica */
interface HistoricalSheetData {
  fechamentos: DadosFechamento[]
  vendedores:  Vendedor[]
  lancamentos: LancamentoCusto[]
  clientes:    ClienteCarteira[]
}

// ─── Helpers de módulo (sem estado React) ────────────────────────────────────

/** Abreviaturas canônicas de mês — usadas para gerar periodo como "Jan2026" */
const MESES_ABBR = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']
const MESES_LABEL = [
  'Janeiro','Fevereiro','Março','Abril','Maio','Junho',
  'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro',
]

/** Utilitario: encontra aba pelo nome (case-insensitive) */
function findTabLocal(tabs: SheetTab[], name: string): SheetTab | undefined {
  return tabs.find(s => s.title.toLowerCase() === name.toLowerCase())
}

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

/**
 * Carrega todos os dados de uma planilha mensal histórica.
 * Replica o pipeline de SheetsContext.connect() para uso no DataContext.
 * Suporta o mesmo fallback de abas (MKP de POS, Repasses etc).
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
      logger.warn(`Erro ao ler aba "${tab.title}"`, 'DataContext.loadHistoricalSheetData', { tabTitle: tab.title })
    }
  }

  // ── Vendedores ──────────────────────────────────────────────
  let vendedores: Vendedor[] = []
  if (findTabLocal(meta.sheets, SHEET_TABS.VENDEDORES)) {
    try {
      const rows = await readRange(`'${SHEET_TABS.VENDEDORES}'!A:Z`, sheetId) as (string | number)[][]
      vendedores = mapRowsToVendedores(rows)
    } catch {
      logger.warn('Erro ao ler aba Vendedores', 'DataContext.loadHistoricalSheetData')
    }
  }

  // ── Clientes (fallback: MKP de POS) ────────────────────────
  let clientes: ClienteCarteira[] = []
  if (findTabLocal(meta.sheets, SHEET_TABS.CLIENTES)) {
    try {
      const rows = await readRange(`'${SHEET_TABS.CLIENTES}'!A:Z`, sheetId) as (string | number)[][]
      clientes = mapRowsToClientes(rows)
    } catch {
      logger.warn('Erro ao ler aba Clientes', 'DataContext.loadHistoricalSheetData')
    }
  } else if (findTabLocal(meta.sheets, SHEET_TABS.MKP_POS)) {
    try {
      const rows = await readRange(`'${SHEET_TABS.MKP_POS}'!A:F`, sheetId) as (string | number)[][]
      clientes = mapRowsMKPdePOS(rows, canonicalPeriodo)
    } catch {
      logger.warn('Erro ao ler aba MKP de POS', 'DataContext.loadHistoricalSheetData')
    }
  }

  // ── Lancamentos (fallback: Repasses + Descontos + Digital) ──
  let lancamentos: LancamentoCusto[] = []
  if (findTabLocal(meta.sheets, SHEET_TABS.LANCAMENTOS)) {
    try {
      const rows = await readRange(`'${SHEET_TABS.LANCAMENTOS}'!A:Z`, sheetId) as (string | number)[][]
      lancamentos = mapRowsToLancamentos(rows)
    } catch {
      logger.warn('Erro ao ler aba Lancamentos', 'DataContext.loadHistoricalSheetData')
    }
  } else {
    const combined: LancamentoCusto[] = []
    if (findTabLocal(meta.sheets, SHEET_TABS.REPASSES)) {
      try {
        const rows = await readRange(`'${SHEET_TABS.REPASSES}'!A:F`, sheetId) as (string | number)[][]
        combined.push(...mapRowsRepasses(rows))
      } catch {
        logger.warn('Erro ao ler aba Repasses', 'DataContext.loadHistoricalSheetData')
      }
    }
    if (findTabLocal(meta.sheets, SHEET_TABS.DESCONTOS)) {
      try {
        const rows = await readRange(`'${SHEET_TABS.DESCONTOS}'!A:F`, sheetId) as (string | number)[][]
        combined.push(...mapRowsDescontos(rows, canonicalPeriodo))
      } catch {
        logger.warn('Erro ao ler aba Descontos', 'DataContext.loadHistoricalSheetData')
      }
    }
    if (findTabLocal(meta.sheets, SHEET_TABS.COBR_DIGITAL)) {
      try {
        const rows = await readRange(`'${SHEET_TABS.COBR_DIGITAL}'!A:E`, sheetId) as (string | number)[][]
        combined.push(...mapRowsCobrDigital(rows, canonicalPeriodo))
      } catch {
        logger.warn('Erro ao ler aba Cobr. Conta Digital', 'DataContext.loadHistoricalSheetData')
      }
    }
    lancamentos = combined
  }

  return { fechamentos, vendedores, lancamentos, clientes }
}

// ─── DataProvider ────────────────────────────────────────────────────────────

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

  // ─ Planilhas históricas para benchmark anual ─────────────────
  const [historicalSheets, setHistoricalSheets] = useState<HistoricalSheet[]>(() => {
    try {
      const saved = localStorage.getItem('vdf_historical_sheets')
      if (!saved) return []
      const parsed = JSON.parse(saved) as unknown[]
      // Retrocompatibilidade: ignora itens antigos sem month/year
      return parsed.filter(
        (s): s is HistoricalSheet =>
          typeof s === 'object' && s !== null &&
          'id' in s && 'month' in s && 'year' in s
      )
    } catch { return [] }
  })

  // Mapa por chave composta "YYYY-MM" → dados completos da planilha daquele mês
  const [historicalDataMap, setHistoricalDataMap] = useState<Record<string, HistoricalSheetData>>({})
  const [isLoadingHistorical, setIsLoadingHistorical] = useState(false)

  // ─ Carrega planilhas históricas salvas ao inicializar ────────
  // Agora carrega TODOS os dados (fechamentos + vendedores + clientes + lancamentos)
  useEffect(() => {
    const stored = (() => {
      try {
        const s = localStorage.getItem('vdf_historical_sheets')
        if (!s) return []
        const parsed = JSON.parse(s) as unknown[]
        return parsed.filter(
          (e): e is HistoricalSheet =>
            typeof e === 'object' && e !== null && 'id' in e && 'month' in e && 'year' in e
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
      })
    ).then((results) => {
      if (cancelled) return
      const map: Record<string, HistoricalSheetData> = {}
      results.forEach(r => { map[r.mapKey] = r.data })
      setHistoricalDataMap(map)
      setIsLoadingHistorical(false)
    })
    return () => { cancelled = true }
  }, [])

  // ─ addHistoricalSheet — carrega dados completos da planilha ──
  const addHistoricalSheet = useCallback(async (id: string, month: number, year: number) => {
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
        // Substitui se já existia planilha para o mesmo mês/ano
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
      logger.error('Falha ao carregar planilha histórica', 'DataContext.addHistoricalSheet', err instanceof Error ? err : new Error(String(err)), { sheetId: id, month, year })
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

  // ─ Dados históricos computados ───────────────────────────────

  /** Fechamentos de todos os meses históricos — merge + dedup + ordem cronológica.
   *  Fonte exclusiva: Benchmark Anual. Planilha primária ignorada para exibição. */
  const allFechamentos = useMemo(() => {
    const base = Object.values(historicalDataMap).flatMap(d => d.fechamentos)
    const seen = new Set<string>()
    return sortFechamentos(base.filter(f => {
      if (seen.has(f.periodo)) return false
      seen.add(f.periodo)
      return true
    }))
  }, [historicalDataMap])

  /**
   * Vendedores históricos: dedup por id, mês mais recente vence.
   * Servem de fallback quando a planilha principal não está conectada.
   */
  const historicalVendedores = useMemo(() => {
    // Ordena chaves desc para que o mês mais recente apareça primeiro
    const sortedKeys = Object.keys(historicalDataMap).sort().reverse()
    const seen = new Set<number>()
    const result: Vendedor[] = []
    for (const key of sortedKeys) {
      for (const v of historicalDataMap[key].vendedores) {
        if (!seen.has(v.id)) {
          seen.add(v.id)
          result.push(v)
        }
      }
    }
    return result
  }, [historicalDataMap])

  /**
   * Lancamentos históricos: todos os meses concatenados.
   * São transações aditivas — cada mês contribui com seus registros.
   */
  const historicalLancamentos = useMemo(() => {
    return Object.values(historicalDataMap)
      .flatMap(d => d.lancamentos)
      .map(l => ({ ...l, source: 'sheets' as const }))
  }, [historicalDataMap])

  /**
   * Clientes históricos: apenas o mês mais recente disponível.
   * A carteira é um snapshot — usar o mais atual é o mais relevante.
   */
  const historicalClientes = useMemo(() => {
    const latestKey = Object.keys(historicalDataMap).sort().at(-1)
    return latestKey ? historicalDataMap[latestKey].clientes : []
  }, [historicalDataMap])

  // ─ Dados mesclados ────────────────────────────────────────────

  /**
   * Vendedores: fonte exclusiva é o Benchmark Anual (historicalVendedores) + edições locais.
   * Planilha primária ignorada para exibição.
   */
  const vendedores = useMemo(() => {
    return mergeVendedores(historicalVendedores, localVendedores)
  }, [localVendedores, historicalVendedores])

  /**
   * Lancamentos: fonte exclusiva é o Benchmark Anual (historicalLancamentos) + lançamentos locais manuais.
   * Planilha primária ignorada para exibição.
   */
  const lancamentos = useMemo(() => {
    return mergeLancamentos(historicalLancamentos, localLancamentos)
  }, [localLancamentos, historicalLancamentos])

  /**
   * Clientes: fonte exclusiva é o snapshot mais recente do Benchmark Anual.
   * Planilha primária ignorada para exibição.
   */
  const clientes = useMemo(() => {
    const baseClientes = historicalClientes
    const clientesBase = mergeSegmentOverrides(baseClientes, segmentOverrides)
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
  }, [historicalClientes, segmentOverrides, lancamentos])

  // isOffline: não aplicável no modelo Benchmark Anual — sempre false.
  const isOffline = false

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

  // ─ getClientesPorPeriodo ─────────────────────────────────────
  /**
   * Retorna clientes do snapshot do período informado (ex: "Mar2026").
   * Converte o período para a chave do historicalDataMap ("YYYY-MM"),
   * aplica segment overrides e enriquecimento de contaDigitalAtiva.
   * Fallback: snapshot mais recente (clientes global).
   */
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
    const base = historicalDataMap[mapKey]?.clientes ?? []
    if (base.length === 0) return clientes
    // Aplica overrides de segmento
    const withOverrides = mergeSegmentOverrides(base, segmentOverrides)
    // Enriquece contaDigitalAtiva igual ao memo clientes
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
  }, [historicalDataMap, segmentOverrides, lancamentos, clientes])

  // ─ Segment Overrides ────────────────────────────────────────
  const saveSegmentOverride = useCallback((override: SegmentOverride) => {
    upsert<SegmentOverride & { id: number }>(
      'vdf_segment_overrides',
      { ...override, id: override.clienteId },
    )
    setSegmentOverrides(getAll<SegmentOverride>('vdf_segment_overrides'))
  }, [])

  const removeSegmentOverride = useCallback((clienteId: number) => {
    remove('vdf_segment_overrides', clienteId)
    setSegmentOverrides(getAll<SegmentOverride>('vdf_segment_overrides'))
  }, [])

  // Fechamentos em ordem cronológica — fonte exclusiva: Benchmark Anual
  const fechamentosPatched = allFechamentos

  const periodoAtual = useMemo(
    () => allFechamentos[allFechamentos.length - 1]?.periodo ?? '',
    [allFechamentos],
  )

  // Value memoizado — evita re-render de todos os consumidores quando
  // apenas uma parte do estado muda.
  const contextValue = useMemo(
    () => ({
      // connectionStatus reflete o estado do Benchmark Anual, não da planilha primária.
      connectionStatus: {
        ...sheets.connectionStatus,
        connected: Object.keys(historicalDataMap).length > 0,
        title: 'Benchmark Anual',
      },
      isLoading: isLoadingHistorical,
      error: null,
      isOffline,
      periodo: periodoAtual,
      fechamentos: fechamentosPatched,
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
      removeSegmentOverride,
      getClientesPorPeriodo,
      custos,
      saveCusto,
      deleteCusto,
      equipamentos,
      saveEquipamento,
      deleteEquipamento,
    }),
    [
      sheets.connectionStatus,
      sheets.allTabs,
      sheets.refetch,
      sheets.setSheetId,
      sheets.currentSheetId,
      historicalDataMap,
      periodoAtual,
      fechamentosPatched,
      historicalSheets,
      isLoadingHistorical,
      addHistoricalSheet,
      removeHistoricalSheet,
      vendedores,
      lancamentos,
      clientes,
      connect,
      saveVendedor,
      deleteVendedor,
      saveLancamento,
      deleteLancamento,
      metas,
      saveMeta,
      saveSegmentOverride,
      removeSegmentOverride,
      getClientesPorPeriodo,
      custos,
      saveCusto,
      deleteCusto,
      equipamentos,
      saveEquipamento,
      deleteEquipamento,
    ],
  )

  return (
    <DataContext.Provider value={contextValue}>
      {children}
    </DataContext.Provider>
  )
}
