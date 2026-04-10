// ═══════════════════════════════════════════════════════════════
// Hook: useEquipeData
// Retorna dados do Modulo Equipe a partir da planilha
// ═══════════════════════════════════════════════════════════════

import { useMemo } from 'react'
import { useDataContext } from '../contexts/DataContext'
import type { Vendedor, DadosMensais } from '../types'

interface EquipeData {
  vendedores: Vendedor[]
  dadosMensais: DadosMensais[]
  regioes: string[]
  isLoading: boolean
  error: string | null
}

export function useEquipeData(): EquipeData {
  const { vendedores, fechamentos, isLoading, error } = useDataContext()

  // Extrair lista de regioes unicas
  const regioes = useMemo(() => {
    const set = new Set<string>(vendedores.map((v) => v.regiao).filter(Boolean))
    return Array.from(set).sort()
  }, [vendedores])

  // Converter fechamentos em DadosMensais
  const dadosMensais = useMemo((): DadosMensais[] => {
    return fechamentos.map((f) => ({
      mes: f.periodo,
      realizado: f.tpvTotal,
      meta: 0, // sera calculado a partir das metas dos vendedores
    }))
  }, [fechamentos])

  return {
    vendedores,
    dadosMensais,
    regioes,
    isLoading,
    error,
  }
}
