// ═══════════════════════════════════════════════════════════════
// AuthGuard — Protecao de rotas
// Redireciona para /login se o usuario nao esta autenticado
// ═══════════════════════════════════════════════════════════════

import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { LoadingState } from './LoadingState'

interface AuthGuardProps {
  children: React.ReactNode
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return <LoadingState fullScreen message="Verificando autenticacao..." />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}
