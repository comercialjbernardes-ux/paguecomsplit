// ═══════════════════════════════════════════════════════════════
// LocalStorageService — Persistencia local tipada
// Chaves: vdf_vendedores, vdf_lancamentos, vdf_metas,
//         vdf_segment_overrides, vdf_regras_comissao
// ═══════════════════════════════════════════════════════════════

export type LocalKey =
  | 'vdf_vendedores'
  | 'vdf_lancamentos'
  | 'vdf_metas'
  | 'vdf_segment_overrides'
  | 'vdf_regras_comissao'
  | 'vdf_projecao_base'

/** Retorna todos os registros de uma chave. Retorna [] em caso de erro. */
export function getAll<T>(key: LocalKey): T[] {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return []
    return JSON.parse(raw) as T[]
  } catch (e) {
    console.warn(`[LocalStorage] Erro ao ler "${key}":`, e)
    return []
  }
}

/** Retorna um valor escalar (nao array). Retorna null em caso de erro. */
export function getScalar<T>(key: LocalKey): T | null {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    return JSON.parse(raw) as T
  } catch (e) {
    console.warn(`[LocalStorage] Erro ao ler "${key}":`, e)
    return null
  }
}

/** Salva um valor escalar. */
export function setScalar<T>(key: LocalKey, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (e) {
    console.warn(`[LocalStorage] Erro ao salvar "${key}":`, e)
  }
}

/** Insere ou atualiza um registro (usa campo `id` para deduplicar). */
export function upsert<T extends { id: string | number }>(key: LocalKey, item: T): void {
  try {
    const existing = getAll<T>(key)
    const idx = existing.findIndex((e) => e.id === item.id)
    if (idx >= 0) {
      existing[idx] = item
    } else {
      existing.push(item)
    }
    localStorage.setItem(key, JSON.stringify(existing))
  } catch (e) {
    console.warn(`[LocalStorage] Erro ao salvar em "${key}":`, e)
  }
}

/** Remove um registro pelo id. */
export function remove(key: LocalKey, id: string | number): void {
  try {
    const existing = getAll<{ id: string | number }>(key)
    const updated = existing.filter((e) => e.id !== id)
    localStorage.setItem(key, JSON.stringify(updated))
  } catch (e) {
    console.warn(`[LocalStorage] Erro ao remover de "${key}":`, e)
  }
}

/** Limpa todos os dados de uma chave. */
export function clear(key: LocalKey): void {
  try {
    localStorage.removeItem(key)
  } catch (e) {
    console.warn(`[LocalStorage] Erro ao limpar "${key}":`, e)
  }
}

/** Verifica se uma chave existe e tem dados. */
export function hasData(key: LocalKey): boolean {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return false
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed)) return parsed.length > 0
    return parsed !== null && parsed !== undefined
  } catch {
    return false
  }
}
