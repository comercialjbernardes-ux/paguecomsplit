// ═══════════════════════════════════════════════════════════════
// AuthContext — Gerencia estado de autenticacao Google OAuth2
// Provê user, token, isAuthenticated, signIn, signOut
// ═══════════════════════════════════════════════════════════════

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react'
import {
  initGoogleAuth,
  signIn as googleSignIn,
  signOut as googleSignOut,
  onAuthStateChange,
  getAccessToken,
} from '../services/googleAuth'
import type { GoogleUser } from '../types'

interface AuthContextType {
  user: GoogleUser | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  signIn: () => void
  signOut: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<GoogleUser | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Inicializar Google Auth
  useEffect(() => {
    let mounted = true

    initGoogleAuth()
      .then(() => {
        if (mounted) {
          setIsLoading(false)
          // Verificar se ja tem token valido
          const existingToken = getAccessToken()
          if (existingToken) {
            setToken(existingToken)
          }
        }
      })
      .catch((err: Error) => {
        if (mounted) {
          setError(err.message)
          setIsLoading(false)
        }
      })

    // Escutar mudancas de auth
    const unsubscribe = onAuthStateChange((newUser, newToken) => {
      if (mounted) {
        setUser(newUser)
        setToken(newToken)
        setIsLoading(false)
        setError(null)
      }
    })

    return () => {
      mounted = false
      unsubscribe()
    }
  }, [])

  const signIn = useCallback(() => {
    setIsLoading(true)
    setError(null)
    googleSignIn()
  }, [])

  const signOut = useCallback(() => {
    googleSignOut()
    setUser(null)
    setToken(null)
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: Boolean(user && token),
        isLoading,
        error,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider')
  }
  return context
}
