// ═══════════════════════════════════════════════════════════════
// Hook: useInternoData
// Retorna dados do Modulo Interno a partir da planilha
// ═══════════════════════════════════════════════════════════════

import { useMemo } from 'react'
import { useDataContext } from '../contexts/DataContext'
import type { LancamentoCusto, ClienteCarteira, DadosFechamento } from '../types'

interface InternoData {
  fechamentos: DadosFechamento[]
  fechamentoAtual: DadosFechamento | null
  lancamentos: LancamentoCusto[]
  clientes: ClienteCarteira[]
  categorias: string[]
  contas: string[]
  segmentos: string[]
  /** Total de receitas lancadas manualmente (source === 'local') */
  totalReceitasLocais: number
  /** Total de despesas lancadas manualmente (source === 'local') */
  totalDespesasLocais: number
  isLoading: boolean
  error: string | null
}

export function useInternoData(): InternoData {
  const { fechamentos, lancamentos, clientes, isLoading, error } = useDataContext()

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

  // Lancamentos manuais (source === 'local') — agregacoes centralizadas
  // para que TODOS os consumidores (DRE, Dashboard, Custos) leiam os mesmos valores
  const totalReceitasLocais = useMemo(() =>
    lancamentos
      .filter((l) => l.tipo === 'receita' && l.source === 'local')
      .reduce((s, l) => s + l.valor, 0),
  [lancamentos])

  const totalDespesasLocais = useMemo(() =>
    lancamentos
      .filter((l) => l.tipo === 'despesa' && l.source === 'local')
      .reduce((s, l) => s + l.valor, 0),
  [lancamentos])

  return {
    fechamentos,
    fechamentoAtual,
    lancamentos,
    clientes,
    categorias,
    contas,
    segmentos,
    totalReceitasLocais,
    totalDespesasLocais,
    isLoading,
    error,
  }
}
