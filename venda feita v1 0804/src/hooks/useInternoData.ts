// ═══════════════════════════════════════════════════════════════
// Hook: useInternoData
// Retorna dados do Modulo Interno a partir da planilha
// ═══════════════════════════════════════════════════════════════

import { useMemo } from 'react'
import { useSheetsData } from '../contexts/SheetsContext'
import type { LancamentoCusto, ClienteCarteira, DadosFechamento } from '../types'

interface InternoData {
  fechamentos: DadosFechamento[]
  fechamentoAtual: DadosFechamento | null
  lancamentos: LancamentoCusto[]
  clientes: ClienteCarteira[]
  categorias: string[]
  contas: string[]
  segmentos: string[]
  isLoading: boolean
  error: string | null
}

export function useInternoData(): InternoData {
  const { fechamentos, lancamentos, clientes, isLoading, error } = useSheetsData()

  // Ultimo fechamento = periodo mais recente
  const fechamentoAtual = useMemo(() => {
    if (fechamentos.length === 0) return null
    return fechamentos[fechamentos.length - 1]
  }, [fechamentos])

  // Categorias unicas dos lancamentos
  const categorias = useMemo(() => {
    const set = new Set<string>(lancamentos.map((l) => l.categoria).filter(Boolean))
    return Array.from(set).sort()
  }, [lancamentos])

  // Contas unicas dos lancamentos
  const contas = useMemo(() => {
    const set = new Set<string>(lancamentos.map((l) => l.conta).filter(Boolean))
    return Array.from(set).sort()
  }, [lancamentos])

  // Segmentos unicos dos clientes
  const segmentos = useMemo(() => {
    const set = new Set<string>(clientes.map((c) => c.segmento).filter(Boolean))
    return Array.from(set).sort()
  }, [clientes])

  return {
    fechamentos,
    fechamentoAtual,
    lancamentos,
    clientes,
    categorias,
    contas,
    segmentos,
    isLoading,
    error,
  }
}
