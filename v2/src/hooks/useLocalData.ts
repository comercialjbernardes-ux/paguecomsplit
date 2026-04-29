// ═══════════════════════════════════════════════════════════════
// useLocalData — CRUD de todos os dados persistidos no localStorage
//
// PONTO 3 — DataContext como objeto deus (refatoração).
// Responsabilidade única: encapsular leitura + escrita de dados
// locais (vendedores, lançamentos, metas, segmentos, custos, equipamentos).
//
// DataContext consome este hook para manter sua responsabilidade
// focada em computação e composição, não em persistência.
// ═══════════════════════════════════════════════════════════════

import { useState, useCallback } from 'react'
import {
  getAll,
  upsert,
  remove,
} from '../services/localStorageService'
import type {
  Vendedor,
  LancamentoCusto,
  MetaPeriodo,
  SegmentOverride,
  CustoOperacional,
  Equipamento,
} from '../types'

export function useLocalData() {
  // ─ Estado ────────────────────────────────────────────────────
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

  // ─ CRUD Vendedores ───────────────────────────────────────────
  const saveVendedor = useCallback((vendedor: Vendedor) => {
    upsert<Vendedor>('vdf_vendedores', vendedor)
    setLocalVendedores(getAll<Vendedor>('vdf_vendedores'))
  }, [])

  const deleteVendedor = useCallback((id: number) => {
    remove('vdf_vendedores', id)
    setLocalVendedores(getAll<Vendedor>('vdf_vendedores'))
  }, [])

  // ─ CRUD Lancamentos ──────────────────────────────────────────
  const saveLancamento = useCallback((lancamento: LancamentoCusto) => {
    upsert<LancamentoCusto>('vdf_lancamentos', { ...lancamento, source: 'local' })
    setLocalLancamentos(getAll<LancamentoCusto>('vdf_lancamentos'))
  }, [])

  const deleteLancamento = useCallback((id: string) => {
    remove('vdf_lancamentos', id)
    setLocalLancamentos(getAll<LancamentoCusto>('vdf_lancamentos'))
  }, [])

  // ─ Metas ─────────────────────────────────────────────────────
  const saveMeta = useCallback((periodo: string, meta: number) => {
    const item = { periodo, meta, editedAt: new Date().toISOString(), id: periodo }
    upsert<typeof item>('vdf_metas', item)
    setMetas(getAll<MetaPeriodo>('vdf_metas'))
  }, [])

  // ─ Segment Overrides ─────────────────────────────────────────
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

  // ─ CRUD Custos ───────────────────────────────────────────────
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

  return {
    // Estado
    localVendedores,
    localLancamentos,
    metas,
    segmentOverrides,
    custos,
    equipamentos,
    // Vendedores
    saveVendedor,
    deleteVendedor,
    // Lancamentos
    saveLancamento,
    deleteLancamento,
    // Metas
    saveMeta,
    // Segmentos
    saveSegmentOverride,
    removeSegmentOverride,
    // Custos
    saveCusto,
    deleteCusto,
    // Equipamentos
    saveEquipamento,
    deleteEquipamento,
  }
}
