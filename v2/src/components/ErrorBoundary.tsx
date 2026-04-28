// ═══════════════════════════════════════════════════════════════
// ErrorBoundary — Class component para captura de erros React
// Registra via logger.critical e exibe UI de fallback
// ═══════════════════════════════════════════════════════════════

import { Component, type ReactNode, type ErrorInfo } from 'react'
import { logger } from '../services/errorLogger'
import { AlertTriangle } from 'lucide-react'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  errorMessage: string
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, errorMessage: '' }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, errorMessage: error.message }
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    logger.critical(error.message, 'ErrorBoundary', error, {
      componentStack: info.componentStack ?? undefined,
    })
  }

  handleReload = (): void => {
    window.location.reload()
  }

  render(): ReactNode {
    if (!this.state.hasError) {
      return this.props.children
    }

    if (this.props.fallback) {
      return this.props.fallback
    }

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-xl border border-red-200 shadow-sm p-8 max-w-md w-full">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900">Algo deu errado</h2>
              <p className="text-sm text-gray-500">Um erro inesperado ocorreu na aplicacao</p>
            </div>
          </div>

          {this.state.errorMessage && (
            <div className="bg-red-50 border border-red-100 rounded-lg p-3 mb-6">
              <p className="text-sm text-red-700 font-mono break-all">
                {this.state.errorMessage}
              </p>
            </div>
          )}

          <button
            onClick={this.handleReload}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium py-2.5 px-4 rounded-lg transition-colors"
          >
            Recarregar pagina
          </button>
        </div>
      </div>
    )
  }
}
