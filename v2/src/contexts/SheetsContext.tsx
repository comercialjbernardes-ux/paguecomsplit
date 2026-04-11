// ═══════════════════════════════════════════════════════════════
// SheetsContext — Gerencia dados lidos da planilha Google Sheets
// Suporta o formato classico E o formato Comercial Bernardes
// (abas: Resumo, MKP de POS, Repasses, Descontos, Cobr. Conta Digital)
// ═══════════════════════════════════════════════════════════════

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react'
import { getSpreadsheetMetadata, readRange } from '../services/sheetsApi'
import {
  addLancamento as addLancamentoService,
  updateLancamento as updateLancamentoService,
  deleteLancamento as deleteLancamentoService,
} from '../services/sheetsCrud'
import type { LancamentoFormData } from '../services/sheetsCrud'
import {
  filterFechamentoTabs,
  extractPeriodoFromTab,
  mapRowsToFechamento,
  mapRowsToVendedores,
  mapRowsToLancamentos,
  mapRowsToClientes,
  mapRowsMKPdePOS,
  mapRowsRepasses,
  mapRowsDescontos,
  mapRowsCobrDigital,
} from '../services/sheetMappers'
import { SHEET_TABS } from '../config/sheets'
import { ENV } from '../config/env'
import type {
  DadosFechamento,
  Vendedor,
  LancamentoCusto,
  ClienteCarteira,
  SheetTab,
  SheetConnectionStatus,
} from '../types'

interface SheetsContextType {
  connectionStatus: SheetConnectionStatus
  isLoading: boolean
  error: string | null

  fechamentos: DadosFechamento[]
  vendedores: Vendedor[]
  lancamentos: LancamentoCusto[]
  clientes: ClienteCarteira[]
  allTabs: SheetTab[]

  connect: (sheetId?: string) => Promise<void>
  refetch: () => Promise<void>
  setSheetId: (id: string) => void
  currentSheetId: string

  addLancamento: (data: LancamentoFormData) => Promise<void>
  updateLancamento: (lancamento: LancamentoCusto, data: LancamentoFormData) => Promise<void>
  deleteLancamento: (lancamento: LancamentoCusto) => Promise<void>
}

const SheetsContext = createContext<SheetsContextType | null>(null)

/** Utilitario: encontra aba pelo nome (case-insensitive) */
function findTab(tabs: SheetTab[], name: string): SheetTab | undefined {
  return tabs.find((s) => s.title.toLowerCase() === name.toLowerCase())
}

export function SheetsProvider({ children }: { children: ReactNode }) {
  const [currentSheetId, setCurrentSheetId] = useState(ENV.SHEET_ID)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<SheetConnectionStatus>({
    connected: false,
    sheetId: '',
    title: '',
    tabs: [],
    lastSync: null,
  })

  const [fechamentos, setFechamentos] = useState<DadosFechamento[]>([])
  const [vendedores, setVendedores] = useState<Vendedor[]>([])
  const [lancamentos, setLancamentos] = useState<LancamentoCusto[]>([])
  const [clientes, setClientes] = useState<ClienteCarteira[]>([])
  const [allTabs, setAllTabs] = useState<SheetTab[]>([])

  const connect = useCallback(async (sheetId?: string) => {
    const id = sheetId || currentSheetId
    setIsLoading(true)
    setError(null)

    try {
      // ── 1. Metadados da planilha ──────────────────────────────
      const metadata = await getSpreadsheetMetadata(id)
      setAllTabs(metadata.sheets)

      // ── 2. Fechamentos ────────────────────────────────────────
      // Detecta abas de fechamento (Fechamento_* ou Resumo)
      const fechamentoTabs = filterFechamentoTabs(metadata.sheets)
      const fechamentoData: DadosFechamento[] = []

      for (const tab of fechamentoTabs) {
        try {
          const rows = await readRange(`'${tab.title}'!A:J`, id)
          const rowsTyped = rows as (string | number)[][]
          // Passa rows para extractPeriodoFromTab para suportar aba "Resumo"
          const periodo = extractPeriodoFromTab(tab.title, rowsTyped)
          const dados = mapRowsToFechamento(rowsTyped, periodo)
          fechamentoData.push(dados)
        } catch (err) {
          console.warn(`[Sheets] Erro ao ler aba "${tab.title}":`, err)
        }
      }
      setFechamentos(fechamentoData)

      // ── 3. Vendedores ─────────────────────────────────────────
      const vendedoresTab = findTab(metadata.sheets, SHEET_TABS.VENDEDORES)
      if (vendedoresTab) {
        try {
          const rows = await readRange(`'${SHEET_TABS.VENDEDORES}'!A:Z`, id)
          setVendedores(mapRowsToVendedores(rows as (string | number)[][]))
        } catch {
          console.warn('[Sheets] Aba Vendedores nao encontrada')
        }
      }

      // ── 4. Clientes ───────────────────────────────────────────
      // Tenta aba "Clientes" (formato classico) primeiro
      // Fallback: aba "MKP de POS" (formato Comercial Bernardes)
      const clientesTab = findTab(metadata.sheets, SHEET_TABS.CLIENTES)
      const mkpPosTab = findTab(metadata.sheets, SHEET_TABS.MKP_POS)

      if (clientesTab) {
        try {
          const rows = await readRange(`'${SHEET_TABS.CLIENTES}'!A:Z`, id)
          setClientes(mapRowsToClientes(rows as (string | number)[][]))
        } catch {
          console.warn('[Sheets] Erro ao ler aba Clientes')
        }
      } else if (mkpPosTab) {
        try {
          const rows = await readRange(`'${SHEET_TABS.MKP_POS}'!A:F`, id)
          const periodo = fechamentoData[0]?.periodo || 'atual'
          setClientes(mapRowsMKPdePOS(rows as (string | number)[][], periodo))
          console.info(`[Sheets] Clientes carregados da aba "${SHEET_TABS.MKP_POS}"`)
        } catch {
          console.warn('[Sheets] Erro ao ler aba MKP de POS')
        }
      }

      // ── 5. Lancamentos ────────────────────────────────────────
      // Tenta aba "Lancamentos" (formato classico) primeiro
      // Fallback: combina Repasses + Descontos + Cobr. Conta Digital
      const lancamentosTab = findTab(metadata.sheets, SHEET_TABS.LANCAMENTOS)

      if (lancamentosTab) {
        try {
          const rows = await readRange(`'${SHEET_TABS.LANCAMENTOS}'!A:Z`, id)
          setLancamentos(mapRowsToLancamentos(rows as (string | number)[][]))
        } catch {
          console.warn('[Sheets] Erro ao ler aba Lancamentos')
        }
      } else {
        // Combina lancamentos de Repasses + Descontos + Cobr. Conta Digital
        const combined: LancamentoCusto[] = []

        const repassesTab = findTab(metadata.sheets, SHEET_TABS.REPASSES)
        if (repassesTab) {
          try {
            const rows = await readRange(`'${SHEET_TABS.REPASSES}'!A:F`, id)
            combined.push(...mapRowsRepasses(rows as (string | number)[][]))
            console.info(`[Sheets] ${combined.length} repasses carregados`)
          } catch {
            console.warn('[Sheets] Erro ao ler aba Repasses')
          }
        }

        const descontosTab = findTab(metadata.sheets, SHEET_TABS.DESCONTOS)
        if (descontosTab) {
          try {
            const rows = await readRange(`'${SHEET_TABS.DESCONTOS}'!A:E`, id)
            const descontos = mapRowsDescontos(rows as (string | number)[][], fechamentoData[0]?.periodo || 'atual')
            combined.push(...descontos)
            console.info(`[Sheets] ${descontos.length} descontos carregados`)
          } catch {
            console.warn('[Sheets] Erro ao ler aba Descontos')
          }
        }

        const cobrTab = findTab(metadata.sheets, SHEET_TABS.COBR_DIGITAL)
        if (cobrTab) {
          try {
            const rows = await readRange(`'${SHEET_TABS.COBR_DIGITAL}'!A:C`, id)
            const cobr = mapRowsCobrDigital(rows as (string | number)[][], fechamentoData[0]?.periodo || 'atual')
            combined.push(...cobr)
            console.info(`[Sheets] ${cobr.length} cobranças digitais carregadas`)
          } catch {
            console.warn('[Sheets] Erro ao ler aba Cobr. Conta Digital')
          }
        }

        if (combined.length > 0) {
          setLancamentos(combined)
          console.info(`[Sheets] Total: ${combined.length} lancamentos combinados`)
        }
      }

      // ── 6. Status final ───────────────────────────────────────
      setConnectionStatus({
        connected: true,
        sheetId: id,
        title: metadata.title,
        tabs: metadata.sheets,
        lastSync: new Date(),
      })

      if (sheetId) setCurrentSheetId(sheetId)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido'
      setError(message)
      setConnectionStatus((prev) => ({ ...prev, connected: false }))
    } finally {
      setIsLoading(false)
    }
  }, [currentSheetId])

  const refetch = useCallback(() => connect(currentSheetId), [connect, currentSheetId])

  const setSheetId = useCallback((id: string) => {
    setCurrentSheetId(id)
  }, [])

  // ─── CRUD Lancamentos ───────────────────────────────────────

  const addLancamentoCb = useCallback(async (data: LancamentoFormData) => {
    await addLancamentoService(data, currentSheetId)
    await refetch()
  }, [currentSheetId, refetch])

  const updateLancamentoCb = useCallback(async (lancamento: LancamentoCusto, data: LancamentoFormData) => {
    await updateLancamentoService(lancamento, data, currentSheetId)
    await refetch()
  }, [currentSheetId, refetch])

  const deleteLancamentoCb = useCallback(async (lancamento: LancamentoCusto) => {
    await deleteLancamentoService(lancamento, currentSheetId)
    await refetch()
  }, [currentSheetId, refetch])

  // Auto-connect quando API Key estiver configurada
  useEffect(() => {
    if (ENV.GOOGLE_API_KEY && currentSheetId) {
      connect(currentSheetId)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <SheetsContext.Provider
      value={{
        connectionStatus,
        isLoading,
        error,
        fechamentos,
        vendedores,
        lancamentos,
        clientes,
        allTabs,
        connect,
        refetch,
        setSheetId,
        currentSheetId,
        addLancamento: addLancamentoCb,
        updateLancamento: updateLancamentoCb,
        deleteLancamento: deleteLancamentoCb,
      }}
    >
      {children}
    </SheetsContext.Provider>
  )
}

export function useSheetsData(): SheetsContextType {
  const context = useContext(SheetsContext)
  if (!context) {
    throw new Error('useSheetsData deve ser usado dentro de um SheetsProvider')
  }
  return context
}
