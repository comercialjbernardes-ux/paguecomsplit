// ═══════════════════════════════════════════════════════════════
// Google OAuth2 via Google Identity Services (GIS)
// Gerencia autenticacao e ciclo de vida do token
// ═══════════════════════════════════════════════════════════════

import { ENV } from '../config/env'
import { SHEETS_SCOPE, PROFILE_SCOPE } from '../config/sheets'
import type { GoogleUser } from '../types'

// Tipos do Google Identity Services (window.google)
declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient(config: {
            client_id: string
            scope: string
            callback: (response: TokenResponse) => void
            error_callback?: (error: { type: string; message: string }) => void
          }): TokenClient
        }
      }
    }
  }
}

interface TokenResponse {
  access_token: string
  expires_in: number
  scope: string
  token_type: string
  error?: string
}

interface TokenClient {
  requestAccessToken(config?: { prompt?: string }): void
}

// ─── Estado interno ───────────────────────────────────────────

let tokenClient: TokenClient | null = null
let accessToken: string | null = null
let tokenExpiry: number | null = null
let refreshTimer: ReturnType<typeof setTimeout> | null = null

type AuthCallback = (user: GoogleUser | null, token: string | null) => void
const listeners: Set<AuthCallback> = new Set()

// ─── API publica ──────────────────────────────────────────────

/**
 * Inicializa o cliente OAuth2 do Google
 * Deve ser chamado uma vez quando o app carrega
 */
export function initGoogleAuth(): Promise<void> {
  return new Promise((resolve, reject) => {
    const checkGoogle = () => {
      if (window.google?.accounts?.oauth2) {
        tokenClient = window.google.accounts.oauth2.initTokenClient({
          client_id: ENV.GOOGLE_CLIENT_ID,
          scope: `${SHEETS_SCOPE} ${PROFILE_SCOPE}`,
          callback: handleTokenResponse,
          error_callback: (error) => {
            console.error('[Auth] Erro OAuth:', error)
            notifyListeners(null, null)
          },
        })
        resolve()
      } else {
        // GIS script ainda nao carregou, tentar novamente
        setTimeout(checkGoogle, 100)
      }
    }

    // Timeout de 10s para o script carregar
    const timeout = setTimeout(() => {
      reject(new Error('Google Identity Services nao carregou em 10s'))
    }, 10000)

    checkGoogle()

    // Limpar timeout quando resolver
    const originalResolve = resolve
    resolve = (() => {
      clearTimeout(timeout)
      originalResolve()
    }) as typeof resolve
  })
}

/**
 * Inicia o fluxo de login (abre popup Google)
 */
export function signIn(): void {
  if (!tokenClient) {
    console.error('[Auth] Token client nao inicializado. Chame initGoogleAuth() primeiro.')
    return
  }
  tokenClient.requestAccessToken({ prompt: 'consent' })
}

/**
 * Faz logout: limpa token e notifica listeners
 */
export function signOut(): void {
  accessToken = null
  tokenExpiry = null
  if (refreshTimer) {
    clearTimeout(refreshTimer)
    refreshTimer = null
  }
  notifyListeners(null, null)
}

/**
 * Retorna o access token atual (ou null se nao autenticado)
 */
export function getAccessToken(): string | null {
  if (accessToken && tokenExpiry && Date.now() < tokenExpiry) {
    return accessToken
  }
  return null
}

/**
 * Registra callback para mudancas no estado de autenticacao
 */
export function onAuthStateChange(callback: AuthCallback): () => void {
  listeners.add(callback)
  return () => listeners.delete(callback)
}

// ─── Funcoes internas ─────────────────────────────────────────

async function handleTokenResponse(response: TokenResponse): Promise<void> {
  if (response.error) {
    console.error('[Auth] Erro no token:', response.error)
    notifyListeners(null, null)
    return
  }

  accessToken = response.access_token
  tokenExpiry = Date.now() + response.expires_in * 1000

  // Agendar refresh 5 min antes de expirar
  scheduleTokenRefresh(response.expires_in)

  // Buscar perfil do usuario
  try {
    const user = await fetchUserProfile(response.access_token)
    notifyListeners(user, response.access_token)
  } catch (error) {
    console.error('[Auth] Erro ao buscar perfil:', error)
    notifyListeners(null, response.access_token)
  }
}

async function fetchUserProfile(token: string): Promise<GoogleUser> {
  const res = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: { Authorization: `Bearer ${token}` },
  })

  if (!res.ok) {
    throw new Error(`Erro ao buscar perfil: ${res.status}`)
  }

  const data = await res.json()
  return {
    id: data.id,
    name: data.name,
    email: data.email,
    picture: data.picture,
  }
}

function scheduleTokenRefresh(expiresIn: number): void {
  if (refreshTimer) {
    clearTimeout(refreshTimer)
  }

  // Refresh 5 minutos antes de expirar
  const refreshIn = Math.max((expiresIn - 300) * 1000, 60000)

  refreshTimer = setTimeout(() => {
    if (tokenClient) {
      // prompt: 'none' suprime a tela de consentimento no refresh silencioso.
      // String vazia '' pode abrir popup inesperado de login.
      tokenClient.requestAccessToken({ prompt: 'none' })
    }
  }, refreshIn)
}

function notifyListeners(user: GoogleUser | null, token: string | null): void {
  listeners.forEach((cb) => cb(user, token))
}
