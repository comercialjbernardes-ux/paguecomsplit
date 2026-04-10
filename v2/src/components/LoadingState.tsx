// ═══════════════════════════════════════════════════════════════
// LoadingState — Skeleton/Spinner reutilizavel
// ═══════════════════════════════════════════════════════════════

import { Loader2 } from 'lucide-react'

interface LoadingStateProps {
  /** Mensagem exibida abaixo do spinner */
  message?: string
  /** Exibir como tela cheia ou inline */
  fullScreen?: boolean
}

export function LoadingState({
  message = 'Carregando...',
  fullScreen = false,
}: LoadingStateProps) {
  if (fullScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-emerald-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-500 text-sm">{message}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center py-12">
      <div className="text-center">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin mx-auto mb-3" />
        <p className="text-gray-500 text-sm">{message}</p>
      </div>
    </div>
  )
}

/** Skeleton card para KPIs */
export function SkeletonCard() {
  return (
    <div className="card animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-24 mb-3" />
      <div className="h-8 bg-gray-200 rounded w-32 mb-2" />
      <div className="h-3 bg-gray-200 rounded w-16" />
    </div>
  )
}

/** Skeleton table */
export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="card animate-pulse space-y-3">
      <div className="h-4 bg-gray-200 rounded w-48 mb-4" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4">
          <div className="h-4 bg-gray-200 rounded flex-1" />
          <div className="h-4 bg-gray-200 rounded w-20" />
          <div className="h-4 bg-gray-200 rounded w-24" />
          <div className="h-4 bg-gray-200 rounded w-16" />
        </div>
      ))}
    </div>
  )
}
