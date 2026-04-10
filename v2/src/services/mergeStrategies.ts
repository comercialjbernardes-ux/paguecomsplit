// ═══════════════════════════════════════════════════════════════
// Merge Strategies — Funcoes puras para combinar dados
// Sheets (fonte primaria de leitura) + localStorage (escrita manual)
// ═══════════════════════════════════════════════════════════════

import type { Vendedor, LancamentoCusto, ClienteCarteira } from '../types'
import type { SegmentOverride } from '../types'

/**
 * Merge de vendedores: local vence em conflito pelo mesmo id.
 * Rows do Sheets sem contraparte local entram como seeds com _seededFromSheets: true.
 * Rows locais sem contraparte Sheets (novos cadastros) tambem sao incluidos.
 */
export function mergeVendedores(
  sheetsRows: Vendedor[],
  localRows: Vendedor[],
): Vendedor[] {
  const localMap = new Map<number, Vendedor>(localRows.map((v) => [v.id, v]))

  // Sheets rows: usa local se existir (override), senao seed do Sheets
  const merged: Vendedor[] = sheetsRows.map((sv) => {
    const local = localMap.get(sv.id)
    if (local) {
      // Local vence, mas preserva dados financeiros do Sheets se o local nao os tiver
      return {
        ...sv,
        ...local,
        faturamentoMensal: local.faturamentoMensal || sv.faturamentoMensal,
        faturamentoAcumulado: local.faturamentoAcumulado || sv.faturamentoAcumulado,
      }
    }
    return { ...sv, _seededFromSheets: true }
  })

  // Vendedores locais que nao existem no Sheets (novos cadastros)
  const sheetsIds = new Set(sheetsRows.map((sv) => sv.id))
  const onlyLocal = localRows.filter((lv) => !sheetsIds.has(lv.id))
  merged.push(...onlyLocal)

  return merged
}

/**
 * Merge de lancamentos: concatena Sheets + local, deduplica por (data+descricao+valor).
 * Cada lancamento recebe source: 'sheets' | 'local'.
 */
export function mergeLancamentos(
  sheetsRows: LancamentoCusto[],
  localRows: LancamentoCusto[],
): LancamentoCusto[] {
  const tagged: LancamentoCusto[] = [
    ...sheetsRows.map((l) => ({ ...l, source: 'sheets' as const })),
    ...localRows.map((l) => ({ ...l, source: 'local' as const })),
  ]

  // Deduplica por chave composta (data + descricao normalizada + valor)
  const seen = new Set<string>()
  return tagged.filter((l) => {
    const key = `${l.data}|${l.descricao.trim().toLowerCase()}|${l.valor}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

/**
 * Aplica overrides de segmento aos clientes do Sheets.
 * Override local substitui o campo segmento do cliente.
 */
export function mergeSegmentOverrides(
  sheetsClientes: ClienteCarteira[],
  localOverrides: SegmentOverride[],
): ClienteCarteira[] {
  const overrideMap = new Map<number, string>(
    localOverrides.map((o) => [o.clienteId, o.segmento]),
  )

  return sheetsClientes.map((c) => {
    const override = overrideMap.get(c.id)
    if (override) return { ...c, segmento: override }
    return c
  })
}
