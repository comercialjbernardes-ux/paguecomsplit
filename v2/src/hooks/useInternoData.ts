// ═══════════════════════════════════════════════════════════════
// Hook: useInternoData
// Retorna dados do Modulo Interno a partir da planilha
// ═══════════════════════════════════════════════════════════════

import { useMemo, useCallback } from 'react'
import { useDataContext } from '../contexts/dataContextValue'
import { dataPertenceAoPeriodo } from '../utils/custos'
import type { LancamentoCusto, ClienteCarteira, DadosFechamento } from '../types'

interface InternoData {
  fechamentos: DadosFechamento[]
  fechamentoAtual: DadosFechamento | null
  lancamentos: LancamentoCusto[]
  clientes: ClienteCarteira[]
  categorias: string[]
  contas: string[]
  segmentos: string[]
  /** Total de receitas lancadas manualmente (source === 'local') — período do fechamentoAtual */
  totalReceitasLocais: number
  /** Total de despesas lancadas manualmente (source === 'local') — período do fechamentoAtual */
  totalDespesasLocais: number
  /**
   * Retorna totais de lançamentos locais para um período específico (ex: período selecionado
   * pelo usuário no Dashboard). Permite que cada tela compute valores do período correto
   * sem depender do fechamentoAtual global.
   */
  getLocaisPorPeriodo: (periodo: string) => { receitas: number; despesas: number }
  isLoading: boolean
  error: string | null
}

export function useInternoData(): InternoData {
  const { fechamentos, lancamentos, clientes, isLoading, error } = useDataContext()

  // DataContext.allFechamentos já entrega os fechamentos em ordem cronológica
  // (sortFechamentos por YYYY*12+mes). Pegar o último elemento é suficiente e correto.
  // NÃO usar localeCompare aqui — as abreviações PT ('Abr','Ago','Dez'...) têm
  // ordem alfabética ≠ cronológica, o que resultaria em 'Set' como "mais recente"
  // mesmo existindo 'Out', 'Nov' e 'Dez' posteriores.
  const fechamentoAtual = useMemo(() => {
    if (fechamentos.length === 0) return null
    return fechamentos[fechamentos.length - 1] ?? null
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

  // Lancamentos manuais (source === 'local') do periodo atual — agregacoes centralizadas
  // Filtrados por fechamentoAtual.periodo para que DRE e Dashboard exibam apenas o mes corrente.
  // Math.abs garante valor positivo mesmo se o usuario inseriu despesa como número negativo.
  const totalReceitasLocais = useMemo(() => {
    const periodo = fechamentoAtual?.periodo
    return lancamentos
      .filter((l) => l.tipo === 'receita' && l.source === 'local' && (periodo ? dataPertenceAoPeriodo(l.data, periodo) : true))
      .reduce((s, l) => s + Math.abs(l.valor), 0)
  }, [lancamentos, fechamentoAtual])

  const totalDespesasLocais = useMemo(() => {
    const periodo = fechamentoAtual?.periodo
    return lancamentos
      .filter((l) => l.tipo === 'despesa' && l.source === 'local' && (periodo ? dataPertenceAoPeriodo(l.data, periodo) : true))
      .reduce((s, l) => s + Math.abs(l.valor), 0)
  }, [lancamentos, fechamentoAtual])

  // Helper memoizado para calcular entradas locais de qualquer período específico.
  // useCallback garante referência estável — evita re-execução desnecessária de
  // useMemos que dependem desta função (ex: kpis no Dashboard).
  const getLocaisPorPeriodo = useCallback(
    (periodo: string): { receitas: number; despesas: number } => {
      const locais = lancamentos.filter((l) => l.source === 'local' && dataPertenceAoPeriodo(l.data, periodo))
      return {
        receitas: locais.filter((l) => l.tipo === 'receita').reduce((s, l) => s + Math.abs(l.valor), 0),
        despesas: locais.filter((l) => l.tipo === 'despesa').reduce((s, l) => s + Math.abs(l.valor), 0),
      }
    },
    [lancamentos],
  )

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
    getLocaisPorPeriodo,
    isLoading,
    error,
  }
}
