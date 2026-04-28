// ═══════════════════════════════════════════════════════════════
// Logs — Pagina de visualizacao de logs do sistema
// Filtros por nivel e texto | Exportacao JSON | Limpeza
// ═══════════════════════════════════════════════════════════════

import { useState, useMemo } from 'react'
import {
  AlertTriangle,
  Download,
  Trash2,
  ChevronDown,
  ChevronUp,
  Search,
} from 'lucide-react'
import { getLogs, clearLogs, exportLogs, type LogEntry, type LogLevel } from '../services/errorLogger'

// ─── Helpers ──────────────────────────────────────────────────

function formatTimestamp(iso: string): string {
  try {
    const d = new Date(iso)
    const dd = String(d.getDate()).padStart(2, '0')
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const yyyy = d.getFullYear()
    const HH = String(d.getHours()).padStart(2, '0')
    const MM = String(d.getMinutes()).padStart(2, '0')
    const SS = String(d.getSeconds()).padStart(2, '0')
    return `${dd}/${mm}/${yyyy} ${HH}:${MM}:${SS}`
  } catch {
    return iso
  }
}

const LEVEL_BADGE: Record<LogLevel, string> = {
  DEBUG:    'bg-gray-100 text-gray-600',
  INFO:     'bg-blue-100 text-blue-700',
  WARN:     'bg-yellow-100 text-yellow-700',
  ERROR:    'bg-red-100 text-red-700',
  CRITICAL: 'bg-red-200 text-red-900 font-bold',
}

const ALL_LEVELS: LogLevel[] = ['DEBUG', 'INFO', 'WARN', 'ERROR', 'CRITICAL']

// ─── Subcomponente: linha de log ──────────────────────────────

function LogRow({ entry }: { entry: LogEntry }) {
  const [stackOpen, setStackOpen] = useState(false)
  const [contextOpen, setContextOpen] = useState(false)

  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-white hover:bg-gray-50 transition-colors">
      {/* Linha principal */}
      <div className="flex items-start gap-3">
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold whitespace-nowrap flex-shrink-0 ${LEVEL_BADGE[entry.level]}`}
        >
          {entry.level}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 break-words">{entry.message}</p>
          <div className="flex items-center gap-3 mt-1 flex-wrap">
            <span className="text-xs text-gray-400">{formatTimestamp(entry.timestamp)}</span>
            <span className="text-xs text-gray-500 font-mono">{entry.location}</span>
          </div>
          {entry.url && (
            <p className="text-xs text-gray-400 mt-0.5 truncate" title={entry.url}>
              {entry.url}
            </p>
          )}
        </div>
      </div>

      {/* Bloco colapsavel: error */}
      {entry.error && (
        <div className="mt-3">
          <button
            onClick={() => setStackOpen((v) => !v)}
            className="flex items-center gap-1.5 text-xs text-red-600 hover:text-red-800 font-medium transition-colors"
          >
            {stackOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            {entry.error.name}: {entry.error.message}
          </button>
          {stackOpen && entry.error.stack && (
            <pre className="mt-2 text-xs font-mono bg-gray-50 border border-gray-200 rounded p-3 overflow-x-auto max-h-48 overflow-y-auto text-gray-700 whitespace-pre-wrap break-all">
              {entry.error.stack}
            </pre>
          )}
        </div>
      )}

      {/* Bloco colapsavel: context */}
      {entry.context && Object.keys(entry.context).length > 0 && (
        <div className="mt-2">
          <button
            onClick={() => setContextOpen((v) => !v)}
            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 font-medium transition-colors"
          >
            {contextOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            Contexto
          </button>
          {contextOpen && (
            <pre className="mt-2 text-xs font-mono bg-gray-50 border border-gray-200 rounded p-3 overflow-x-auto max-h-48 overflow-y-auto text-gray-700 whitespace-pre-wrap break-all">
              {JSON.stringify(entry.context, null, 2)}
            </pre>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Pagina principal ─────────────────────────────────────────

export function Logs() {
  const [allLogs, setAllLogs] = useState<LogEntry[]>(() => getLogs())
  const [levelFilter, setLevelFilter] = useState<LogLevel | 'ALL'>('ALL')
  const [searchText, setSearchText] = useState('')

  const filteredLogs = useMemo(() => {
    const reversed = [...allLogs].reverse() // mais recentes primeiro
    return reversed.filter((entry) => {
      if (levelFilter !== 'ALL' && entry.level !== levelFilter) return false
      if (searchText.trim()) {
        const q = searchText.toLowerCase()
        const inMessage = entry.message.toLowerCase().includes(q)
        const inLocation = entry.location.toLowerCase().includes(q)
        const inError = entry.error
          ? `${entry.error.name} ${entry.error.message}`.toLowerCase().includes(q)
          : false
        if (!inMessage && !inLocation && !inError) return false
      }
      return true
    })
  }, [allLogs, levelFilter, searchText])

  function handleExport() {
    try {
      const json = exportLogs()
      const blob = new Blob([json], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `vdf_logs_${new Date().toISOString().slice(0, 19).replace(/[T:]/g, '-')}.json`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      alert('Erro ao exportar logs. Tente novamente.')
    }
  }

  function handleClear() {
    if (!window.confirm('Deseja apagar todos os logs registrados?')) return
    clearLogs()
    setAllLogs([])
  }

  function handleRefresh() {
    setAllLogs(getLogs())
  }

  return (
    <div className="flex flex-col h-full min-h-0 bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-gray-500" />
            </div>
            <div>
              <h1 className="text-base font-bold text-gray-900">Log de Erros do Sistema</h1>
              <p className="text-xs text-gray-500">
                {allLogs.length} {allLogs.length === 1 ? 'entrada' : 'entradas'} registradas
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              className="text-sm text-gray-600 hover:text-gray-900 border border-gray-200 rounded-lg px-3 py-1.5 transition-colors"
            >
              Atualizar
            </button>
            <button
              onClick={handleExport}
              className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800 border border-blue-200 rounded-lg px-3 py-1.5 transition-colors"
            >
              <Download className="w-4 h-4" />
              Exportar JSON
            </button>
            <button
              onClick={handleClear}
              className="flex items-center gap-1.5 text-sm text-red-600 hover:text-red-800 border border-red-200 rounded-lg px-3 py-1.5 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Limpar Logs
            </button>
          </div>
        </div>

        {/* Filtros */}
        <div className="flex items-center gap-3 mt-4 flex-wrap">
          {/* Dropdown nivel */}
          <select
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value as LogLevel | 'ALL')}
            className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-400"
          >
            <option value="ALL">Todos os niveis</option>
            {ALL_LEVELS.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>

          {/* Busca por texto */}
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar por mensagem, local..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg bg-white text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
          </div>

          {filteredLogs.length !== allLogs.length && (
            <span className="text-xs text-gray-400">
              {filteredLogs.length} de {allLogs.length} exibidos
            </span>
          )}
        </div>
      </div>

      {/* Lista */}
      <div className="flex-1 overflow-y-auto p-6">
        {filteredLogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mb-3">
              <AlertTriangle className="w-6 h-6 text-gray-300" />
            </div>
            <p className="text-sm font-medium text-gray-500">
              {allLogs.length === 0 ? 'Nenhum log registrado' : 'Nenhum log encontrado para o filtro atual'}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredLogs.map((entry) => (
              <LogRow key={entry.id} entry={entry} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
