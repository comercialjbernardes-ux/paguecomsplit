// ═══════════════════════════════════════════════════════════════
// backupService — Exportação e importação de todos os dados locais
//
// PONTO 2 — localStorage como único storage de dados críticos
// Solução: backup via JSON exportável (download) e restaurável (upload).
// Todas as chaves críticas são incluídas num único arquivo datado.
//
// Fluxo de exportação:
//   1. Lê cada chave do localStorage
//   2. Gera JSON com versão + timestamp + payload
//   3. Dispara download automático no browser
//
// Fluxo de importação:
//   1. Usuário seleciona arquivo .json
//   2. Valida versão do backup
//   3. Restaura cada chave no localStorage
//   4. Retorna lista de chaves restauradas (app deve recarregar)
// ═══════════════════════════════════════════════════════════════

/** Todas as chaves persistidas localmente — backing crítico do sistema */
export const BACKUP_KEYS = [
  'vdf_vendedores',
  'vdf_lancamentos',
  'vdf_metas',
  'vdf_segment_overrides',
  'vdf_regras_comissao',
  'vdf_projecao_base',
  'vdf_custos_fixos',
  'vdf_equipamentos',
  'vdf_historical_sheets',
] as const

export type BackupKey = (typeof BACKUP_KEYS)[number]

export interface LocalBackup {
  /** Versão do formato de backup — incrementar se o schema mudar */
  version: '1'
  exportedAt: string
  /** Nome/e-mail do usuário no momento do backup (para identificação visual) */
  userHint?: string
  data: Partial<Record<BackupKey, unknown>>
}

/**
 * Exporta todos os dados do localStorage para um arquivo JSON.
 * Dispara download automático com nome datado.
 */
export function exportLocalBackup(userHint?: string): void {
  const backup: LocalBackup = {
    version: '1',
    exportedAt: new Date().toISOString(),
    userHint,
    data: {},
  }

  for (const key of BACKUP_KEYS) {
    const raw = localStorage.getItem(key)
    if (raw !== null) {
      try {
        backup.data[key] = JSON.parse(raw)
      } catch {
        // Valor não-JSON: armazena como string bruta
        backup.data[key] = raw
      }
    }
  }

  const json = JSON.stringify(backup, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `venda-feita-backup-${new Date().toISOString().slice(0, 10)}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export interface ImportResult {
  success: boolean
  keysRestored: string[]
  exportedAt?: string
  userHint?: string
  error?: string
}

/**
 * Importa um backup JSON e restaura todas as chaves no localStorage.
 * Após importar, o app deve ser recarregado para refletir os novos dados.
 */
export async function importLocalBackup(file: File): Promise<ImportResult> {
  return new Promise((resolve) => {
    if (!file.name.endsWith('.json') && file.type !== 'application/json') {
      resolve({ success: false, keysRestored: [], error: 'Selecione um arquivo .json válido.' })
      return
    }

    const reader = new FileReader()

    reader.onerror = () => {
      resolve({ success: false, keysRestored: [], error: 'Erro ao ler o arquivo.' })
    }

    reader.onload = (e) => {
      try {
        const text = e.target?.result as string
        const parsed = JSON.parse(text) as Partial<LocalBackup>

        if (parsed.version !== '1' || !parsed.data || typeof parsed.data !== 'object') {
          resolve({
            success: false,
            keysRestored: [],
            error: 'Arquivo inválido ou versão de backup incompatível (esperado version: "1").',
          })
          return
        }

        const backup = parsed as LocalBackup
        const keysRestored: string[] = []

        for (const key of BACKUP_KEYS) {
          if (Object.prototype.hasOwnProperty.call(backup.data, key)) {
            const value = backup.data[key]
            localStorage.setItem(key, JSON.stringify(value))
            keysRestored.push(key)
          }
        }

        resolve({
          success: true,
          keysRestored,
          exportedAt: backup.exportedAt,
          userHint: backup.userHint,
        })
      } catch (err) {
        resolve({
          success: false,
          keysRestored: [],
          error: `Erro ao processar backup: ${err instanceof Error ? err.message : String(err)}`,
        })
      }
    }

    reader.readAsText(file)
  })
}

/** Retorna quantas chaves têm dados no localStorage (para exibir na UI) */
export function getBackupStats(): { key: BackupKey; hasData: boolean; itemCount: number }[] {
  return BACKUP_KEYS.map((key) => {
    const raw = localStorage.getItem(key)
    if (!raw) return { key, hasData: false, itemCount: 0 }
    try {
      const parsed = JSON.parse(raw)
      const itemCount = Array.isArray(parsed) ? parsed.length : 1
      return { key, hasData: true, itemCount }
    } catch {
      return { key, hasData: true, itemCount: 1 }
    }
  })
}
