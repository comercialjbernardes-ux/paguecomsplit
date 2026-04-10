// ═══════════════════════════════════════════════════════════════
// ErrorBanner — Banner de erro com botao de retry
// ═══════════════════════════════════════════════════════════════

import { AlertTriangle, RefreshCw } from 'lucide-react'

interface ErrorBannerProps {
  message: string
  onRetry?: () => void
}

export function ErrorBanner({ message, onRetry }: ErrorBannerProps) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
      <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        <p className="text-sm font-medium text-red-800">Ocorreu um erro</p>
        <p className="text-sm text-red-600 mt-1">{message}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-1.5 text-sm text-red-700 hover:text-red-900 font-medium transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Tentar novamente
        </button>
      )}
    </div>
  )
}
