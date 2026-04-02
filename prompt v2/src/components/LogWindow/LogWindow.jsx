import { useState, useEffect, useRef, useCallback } from 'react'
import { Terminal, X, Copy, Check } from 'lucide-react'

const MAX_LOGS = 500

export default function LogWindow() {
  const [logs, setLogs] = useState([])
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const listRef = useRef(null)

  const addLog = useCallback((mensagem, tipo = 'info') => {
    const entry = {
      id: Date.now() + Math.random(),
      timestamp: new Date(),
      tipo,
      mensagem: String(mensagem),
    }
    setLogs(prev => {
      const next = [...prev, entry]
      return next.length > MAX_LOGS ? next.slice(-MAX_LOGS) : next
    })
  }, [])

  useEffect(() => {
    window.vfLog = (mensagem, tipo) => addLog(mensagem, tipo)

    const onError = (event) => {
      addLog(`${event.message} (${event.filename}:${event.lineno})`, 'error')
    }

    const onRejection = (event) => {
      addLog(`Unhandled Promise: ${event.reason}`, 'error')
    }

    window.addEventListener('error', onError)
    window.addEventListener('unhandledrejection', onRejection)

    addLog('Sistema iniciado', 'info')

    return () => {
      window.removeEventListener('error', onError)
      window.removeEventListener('unhandledrejection', onRejection)
      delete window.vfLog
    }
  }, [addLog])

  useEffect(() => {
    if (open && listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight
    }
  }, [logs, open])

  const errorCount = logs.filter(l => l.tipo === 'error').length

  const formatTime = (d) =>
    d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })

  const handleCopy = async () => {
    const now = new Date()
    const last100 = logs.slice(-100)
    const text = [
      `=== Log Venda Feita Dashboard ===`,
      `Data/Hora: ${now.toLocaleString('pt-BR')}`,
      `Versão: VF-1.0`,
      `User-Agent: ${navigator.userAgent}`,
      `Total de logs: ${last100.length}`,
      ``,
      ...last100.map(l =>
        `[${formatTime(l.timestamp)}] [${l.tipo.toUpperCase()}] ${l.mensagem}`
      ),
    ].join('\n')

    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      addLog('Falha ao copiar logs', 'error')
    }
  }

  const tipoColor = {
    info: 'text-brand-emerald',
    warn: 'text-amber-500',
    error: 'text-red-500',
  }

  return (
    <div className="fixed bottom-4 right-4 z-[9999]" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div
        className="overflow-hidden transition-all duration-200 ease-in-out origin-bottom-right"
        style={{
          width: open ? 380 : 44,
          height: open ? 320 : 44,
          borderRadius: open ? 12 : 9999,
        }}
      >
        {!open ? (
          <button
            onClick={() => setOpen(true)}
            className="relative w-[44px] h-[44px] rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
            style={{ background: '#0D1B2A' }}
          >
            <Terminal size={18} color="#00C896" />
            {errorCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                {errorCount}
              </span>
            )}
          </button>
        ) : (
          <div className="flex flex-col w-full h-full shadow-xl" style={{ borderRadius: 12 }}>
            {/* Header */}
            <div
              className="flex items-center justify-between px-3 py-2 shrink-0"
              style={{ background: '#0D1B2A', borderRadius: '12px 12px 0 0' }}
            >
              <div className="flex items-center gap-2">
                <Terminal size={14} color="#00C896" />
                <span className="text-white font-semibold" style={{ fontSize: 13 }}>
                  Log do Sistema
                </span>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="text-neutral-400 hover:text-white transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Log list */}
            <div
              ref={listRef}
              className="flex-1 overflow-y-auto bg-white px-3 py-2 space-y-1"
            >
              {logs.length === 0 && (
                <p className="text-neutral-400 text-xs text-center py-4">Nenhum log registrado</p>
              )}
              {logs.map(log => (
                <div key={log.id} className="flex items-start gap-2 text-xs leading-relaxed" style={{ fontFamily: "'JetBrains Mono', Menlo, monospace", fontSize: 12 }}>
                  <span className="text-neutral-400 shrink-0">{formatTime(log.timestamp)}</span>
                  <span className={`shrink-0 font-semibold uppercase ${tipoColor[log.tipo]}`}>
                    {log.tipo}
                  </span>
                  <span className="text-neutral-900 break-all">{log.mensagem}</span>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="shrink-0 px-3 py-2 bg-neutral-50 border-t border-neutral-200" style={{ borderRadius: '0 0 12px 12px' }}>
              <button
                onClick={handleCopy}
                className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded border border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-100 transition-colors"
              >
                {copied ? <Check size={13} /> : <Copy size={13} />}
                {copied ? 'Copiado!' : 'Copiar Log'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
