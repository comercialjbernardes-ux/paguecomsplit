// ═══════════════════════════════════════════════════════════════
// DeleteConfirmDialog — Dialogo de confirmacao para exclusao
// Conforme fluxograma: confirmacao antes de excluir lancamento
// ═══════════════════════════════════════════════════════════════

import { AlertTriangle, X, Loader2 } from 'lucide-react'

interface DeleteConfirmDialogProps {
  isOpen: boolean
  title?: string
  message: string
  itemName?: string
  isDeleting: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function DeleteConfirmDialog({
  isOpen,
  title = 'Confirmar exclusao',
  message,
  itemName,
  isDeleting,
  onConfirm,
  onCancel,
}: DeleteConfirmDialogProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={!isDeleting ? onCancel : undefined}
      />

      {/* Dialog */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          </div>
          <button
            onClick={onCancel}
            disabled={isDeleting}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <p className="text-sm text-gray-600">{message}</p>
          {itemName && (
            <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm font-medium text-gray-900">{itemName}</p>
            </div>
          )}
          <p className="text-xs text-red-600 mt-3">
            Esta acao nao pode ser desfeita. A linha sera removida permanentemente da planilha.
          </p>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 pt-0">
          <button
            onClick={onCancel}
            disabled={isDeleting}
            className="btn-outline flex-1"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium
                       hover:bg-red-700 transition-colors focus:outline-none focus:ring-2
                       focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50
                       disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Excluindo...
              </>
            ) : (
              'Excluir'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
