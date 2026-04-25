// ═══════════════════════════════════════════════════════════════
// Hook: useEquipeData
// Retorna dados do Modulo Equipe a partir da planilha
// ═══════════════════════════════════════════════════════════════

import { useMemo } from 'react'
import { useDataContext } from '../contexts/dataContextValue'
import type { Vendedor, DadosMensais } from '../types'

interface EquipeData {
  vendedores: Vendedor[]
  dadosMensais: DadosMensais[]
  regioes: string[]
  isLoading: boolean
  error: string | null
}

export function useEquipeData(): EquipeData {
  const { vendedores, fechamentos, clientes, isLoading, error } = useDataContext()

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

  // Enriquecer vendedores com faturamentoMensal calculado a partir dos clientes
  // Cada cliente.ticketMedio = markup CB gerado por esse EC no período atual
  // Somando por vendedor obtemos o faturamento real de cada representante
  const vendedoresEnriquecidos = useMemo((): Vendedor[] => {
    if (clientes.length === 0) return vendedores
    return vendedores.map((v) => {
      // Normaliza para lowercase + trim para tolerar diferenças de capitalização
      // entre o campo "Vendedor" da planilha e o campo "Nome" do cadastro
      const nomeNorm = v.nome.trim().toLowerCase()
      const faturamentoMensal = clientes
        .filter((c) => c.vendedor.trim().toLowerCase() === nomeNorm)
        .reduce((s, c) => s + (c.ticketMedio ?? 0), 0)
      return { ...v, faturamentoMensal }
    })
  }, [vendedores, clientes])

  return {
    vendedores: vendedoresEnriquecidos,
    dadosMensais,
    regioes,
    isLoading,
    error,
  }
}
