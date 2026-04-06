import { useState } from 'react'
import { Copy, Check, X, AlertCircle } from 'lucide-react'

// Buffer de logs em memória (compartilhado com LogWindow via window.vfLog)
const _logs = []

export function addLog(message) {
  _logs.push(`[${new Date().toISOString()}] ${message}`)
  if (_logs.length > 100) _logs.shift()
}

// Intercepta também o window.vfLog do LogWindow existente
if (typeof window !== 'undefined') {
  const _origVfLog = window.vfLog
  window.vfLog = (msg, type = 'info') => {
    addLog(`[${type.toUpperCase()}] ${msg}`)
    _origVfLog?.(msg, type)
  }
}

export default function ErrorReport({ onClose }) {
  const [copied, setCopied] = useState(false)

  const now = new Date().toLocaleString('pt-BR')
  const ua  = navigator.userAgent

  const reportText = [
    '=== RELATÓRIO DE ERRO — VENDA FEITA DASHBOARD ===',
    `Versão: VF-4.0 | Data: ${now}`,
    `Browser: ${ua}`,
    '',
    '=== ÚLTIMOS LOGS ===',
    _logs.length > 0 ? _logs.slice(-50).join('\n') : '(Sem logs registrados)',
    '',
  ].join('\n')

  function handleCopy() {
    navigator.clipboard.writeText(reportText).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-[12px] shadow-xl w-full max-w-2xl flex flex-col max-h-[80vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E8F0]">
          <div className="flex items-center gap-2">
            <AlertCircle size={18} strokeWidth={1.5} className="text-[#EF4444]" />
            <h3 className="text-base font-semibold text-[#0D1B2A]">Relatório de Erro</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors rounded-[8px] p-1 hover:bg-slate-100">
            <X size={18} strokeWidth={1.5} />
          </button>
        </div>
        <pre className="flex-1 overflow-auto bg-[#F8FAFC] mx-6 my-4 rounded-[8px] border border-[#E2E8F0] p-4 text-xs font-mono text-slate-600 whitespace-pre-wrap leading-relaxed">
          {reportText}
        </pre>
        <div className="flex justify-end gap-3 px-6 pb-5">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-500 hover:text-[#0D1B2A] transition-colors">
            Fechar
          </button>
          <button onClick={handleCopy}
            className={`flex items-center gap-2 px-4 py-2 rounded-[8px] text-sm font-medium transition-all duration-200 ${
              copied ? 'bg-[#ECFDF5] text-[#065F46]' : 'bg-[#0D1B2A] text-white hover:bg-[#162A3E]'
            }`}
          >
            {copied ? <><Check size={15} strokeWidth={1.5} />Copiado!</> : <><Copy size={15} strokeWidth={1.5} />Copiar Relatório</>}
          </button>
        </div>
      </div>
    </div>
  )
}
