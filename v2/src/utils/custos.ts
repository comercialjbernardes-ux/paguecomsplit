// ═══════════════════════════════════════════════════════════════
// Utilitarios de custos operacionais
// Calcula o custo mensal efetivo considerando todas as recorrencias:
//   mensal      → valor integral
//   trimestral  → valor / 3 (prorate mensal)
//   anual       → valor / 12 (prorate mensal)
//   unico       → apenas no mes/ano em que foi lancado (requer periodo)
// ═══════════════════════════════════════════════════════════════

import type { CustoOperacional } from '../types'

const MESES_ABREV = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez']

/**
 * Parseia um periodo no formato "Mar2026" e retorna { mes (0-based), ano }.
 * Retorna null se o formato nao for reconhecido.
 */
function parsePeriodo(periodo: string): { mes: number; ano: number } | null {
  const match = periodo.match(/^([A-Za-z]{3})(\d{4})$/)
  if (!match) return null
  const mes = MESES_ABREV.indexOf(match[1].toLowerCase())
  if (mes === -1) return null
  return { mes, ano: parseInt(match[2]) }
}

/**
 * Parseia uma data no formato "DD/MM/AAAA" e retorna { mes (0-based), ano }.
 * Retorna null se o formato nao for reconhecido.
 */
function parseDataCusto(data: string): { mes: number; ano: number } | null {
  const parts = data.split('/')
  if (parts.length !== 3) return null
  const mes = parseInt(parts[1]) - 1  // 0-based
  const anoStr = parts[2]
  const ano = parseInt(anoStr.length === 2 ? `20${anoStr}` : anoStr)
  if (isNaN(mes) || isNaN(ano) || mes < 0 || mes > 11) return null
  return { mes, ano }
}

/**
 * Calcula o total mensal efetivo de todos os custos operacionais,
 * aplicando prorate correto por tipo de recorrencia.
 *
 * @param custos   Lista de CustoOperacional do DataContext
 * @param periodo  Periodo atual no formato "Mar2026" (necessario para custos 'unico')
 */
export function calcCustosMensalEfetivo(
  custos: CustoOperacional[],
  periodo?: string,
): number {
  const periodoData = periodo ? parsePeriodo(periodo) : null

  return custos.reduce((total, c) => {
    switch (c.recorrencia) {
      case 'mensal':
        return total + c.valor

      case 'trimestral':
        // Prorate: distribui o custo trimestral em 3 partes mensais iguais
        return total + c.valor / 3

      case 'anual':
        // Prorate: distribui o custo anual em 12 partes mensais iguais
        return total + c.valor / 12

      case 'unico': {
        // Custo pontual: so aparece no mes/ano em que foi lancado
        if (!periodoData) return total  // sem periodo → ignorar (exibicao generica)
        const custoPeriodo = parseDataCusto(c.data)
        if (!custoPeriodo) return total
        if (custoPeriodo.mes === periodoData.mes && custoPeriodo.ano === periodoData.ano) {
          return total + c.valor
        }
        return total
      }

      default:
        return total
    }
  }, 0)
}

/**
 * Variante sem periodo — exclui custos 'unico' (usado em resumos gerais
 * onde nao ha um periodo especifico, ex: barras de Carteira).
 */
export function calcCustosMensalSemUnico(custos: CustoOperacional[]): number {
  return calcCustosMensalEfetivo(custos, undefined)
}

/**
 * Verifica se uma data no formato "DD/MM/AAAA" pertence ao periodo "MesAAAA"
 * (ex: "Mar2026"). Usado para filtrar lancamentos manuais no DRE por periodo.
 *
 * Retorna true  → data esta no mesmo mes/ano do periodo.
 * Retorna false → data fora do periodo, ou formato invalido.
 * Retorna true  → se o periodo nao puder ser parseado (nao filtrar).
 */
export function dataPertenceAoPeriodo(data: string, periodo: string): boolean {
  const periodoData = parsePeriodo(periodo)
  if (!periodoData) return true // periodo desconhecido → nao filtrar

  const dataData = parseDataCusto(data)
  if (!dataData) return false  // data invalida → excluir

  return dataData.mes === periodoData.mes && dataData.ano === periodoData.ano
}

/**
 * Retorna o label de exibicao para a recorrencia de um custo.
 */
export function labelRecorrencia(recorrencia: CustoOperacional['recorrencia']): string {
  const map: Record<CustoOperacional['recorrencia'], string> = {
    mensal: 'mensal',
    trimestral: 'trimestral (÷3/mês)',
    anual: 'anual (÷12/mês)',
    unico: 'único',
  }
  return map[recorrencia] ?? recorrencia
}
