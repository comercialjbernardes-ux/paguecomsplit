// ═══════════════════════════════════════════════════════════════
// errorLogger — Servico singleton de logging persistente
// Persiste em localStorage (vdf_error_logs), max 200 entradas
// Captura global via window.onerror e unhandledrejection
// ═══════════════════════════════════════════════════════════════

// ─── Tipos ────────────────────────────────────────────────────

export type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'CRITICAL'

export interface LogEntry {
  id: string
  timestamp: string           // ISO 8601
  level: LogLevel
  message: string
  location: string            // ex: "SheetsContext.connect"
  error?: {
    name: string
    message: string
    stack?: string
  }
  context?: Record<string, unknown>
  url?: string                // window.location.href no momento do erro
}

// ─── Constantes ───────────────────────────────────────────────

const MAX_LOG_ENTRIES = 200
const STORAGE_KEY = 'vdf_error_logs'

// ─── Emojis por nivel ─────────────────────────────────────────

const LEVEL_EMOJI: Record<LogLevel, string> = {
  DEBUG:    '🔵',
  INFO:     '🟢',
  WARN:     '🟡',
  ERROR:    '🔴',
  CRITICAL: '💀',
}

// ─── Helpers internos ─────────────────────────────────────────

function generateId(): string {
  try {
    return crypto.randomUUID()
  } catch {
    return Date.now().toString(36) + Math.random().toString(36).slice(2)
  }
}

function readFromStorage(): LogEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    return JSON.parse(raw) as LogEntry[]
  } catch {
    return []
  }
}

function writeToStorage(entries: LogEntry[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
  } catch {
    // Falha silenciosa — nao pode lançar excecao
  }
}

function appendEntry(entry: LogEntry): void {
  try {
    const existing = readFromStorage()
    existing.push(entry)
    // Rolling buffer: remove o mais antigo quando ultrapassa o limite
    const trimmed = existing.length > MAX_LOG_ENTRIES
      ? existing.slice(existing.length - MAX_LOG_ENTRIES)
      : existing
    writeToStorage(trimmed)
  } catch {
    // Falha silenciosa
  }
}

function buildEntry(
  level: LogLevel,
  message: string,
  location: string,
  error?: Error | unknown,
  context?: Record<string, unknown>,
  captureUrl = false,
): LogEntry {
  const entry: LogEntry = {
    id: generateId(),
    timestamp: new Date().toISOString(),
    level,
    message,
    location,
  }

  if (error !== undefined && error !== null) {
    if (error instanceof Error) {
      entry.error = {
        name: error.name,
        message: error.message,
        stack: error.stack,
      }
    } else {
      entry.error = {
        name: 'UnknownError',
        message: String(error),
      }
    }
  }

  if (context && Object.keys(context).length > 0) {
    entry.context = context
  }

  if (captureUrl) {
    try {
      entry.url = window.location.href
    } catch {
      // Ignora se nao disponivel
    }
  }

  return entry
}

function logToConsole(entry: LogEntry): void {
  try {
    const emoji = LEVEL_EMOJI[entry.level]
    const prefix = `${emoji} [${entry.level}] [${entry.location}]`
    const msg = `${prefix} ${entry.message}`

    if (entry.level === 'DEBUG') {
      console.debug(msg, entry.context ?? '')
    } else if (entry.level === 'INFO') {
      console.info(msg, entry.context ?? '')
    } else if (entry.level === 'WARN') {
      console.warn(msg, entry.error ?? entry.context ?? '')
    } else {
      console.error(msg, entry.error ?? entry.context ?? '')
    }
  } catch {
    // Falha silenciosa
  }
}

// ─── API publica ──────────────────────────────────────────────

function log(
  level: LogLevel,
  message: string,
  location: string,
  error?: Error | unknown,
  context?: Record<string, unknown>,
): void {
  try {
    const captureUrl = level === 'ERROR' || level === 'CRITICAL'
    const entry = buildEntry(level, message, location, error, context, captureUrl)
    logToConsole(entry)
    appendEntry(entry)
  } catch {
    // Nunca lança excecao
  }
}

export const logger = {
  debug(message: string, location: string, context?: Record<string, unknown>): void {
    log('DEBUG', message, location, undefined, context)
  },

  info(message: string, location: string, context?: Record<string, unknown>): void {
    log('INFO', message, location, undefined, context)
  },

  warn(message: string, location: string, context?: Record<string, unknown>): void {
    log('WARN', message, location, undefined, context)
  },

  error(
    message: string,
    location: string,
    error?: Error | unknown,
    context?: Record<string, unknown>,
  ): void {
    log('ERROR', message, location, error, context)
  },

  critical(
    message: string,
    location: string,
    error?: Error | unknown,
    context?: Record<string, unknown>,
  ): void {
    log('CRITICAL', message, location, error, context)
  },
}

// ─── Leitura / Exportacao ─────────────────────────────────────

export function getLogs(): LogEntry[] {
  return readFromStorage()
}

export function clearLogs(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // Falha silenciosa
  }
}

export function exportLogs(): string {
  try {
    return JSON.stringify(getLogs(), null, 2)
  } catch {
    return '[]'
  }
}

// ─── Captura global ───────────────────────────────────────────

/**
 * Instala handlers globais para erros nao capturados.
 * Deve ser chamado uma vez, antes do render.
 */
export function installGlobalHandlers(): void {
  try {
    window.onerror = (message, source, lineno, colno, error) => {
      logger.critical(
        String(message),
        `window.onerror (${source ?? 'unknown'}:${lineno ?? 0}:${colno ?? 0})`,
        error ?? undefined,
      )
      return false // nao suprime o comportamento padrao
    }

    window.addEventListener('unhandledrejection', (event) => {
      const reason = event.reason
      const message =
        reason instanceof Error
          ? reason.message
          : String(reason ?? 'Promise rejeitada sem motivo')
      logger.critical(
        message,
        'window.unhandledrejection',
        reason instanceof Error ? reason : undefined,
        reason && !(reason instanceof Error) ? { reason: String(reason) } : undefined,
      )
    })
  } catch {
    // Falha silenciosa — nao pode impedir o boot da app
  }
}
