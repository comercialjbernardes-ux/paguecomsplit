// ═══════════════════════════════════════════════════════════════
// Acesso tipado as variaveis de ambiente
// ═══════════════════════════════════════════════════════════════

export const ENV = {
  /** Google OAuth2 Client ID */
  get GOOGLE_CLIENT_ID(): string {
    return import.meta.env.VITE_GOOGLE_CLIENT_ID || ''
  },

  /** Google API Key para leitura publica */
  get GOOGLE_API_KEY(): string {
    return import.meta.env.VITE_GOOGLE_API_KEY || ''
  },

  /** ID padrao da planilha Google Sheets */
  get SHEET_ID(): string {
    return import.meta.env.VITE_SHEET_ID || '1KTRmSWudADXNz6ncJ_ITusdCy_5RDzCV'
  },

  /** Verifica se as credenciais estao configuradas */
  get isConfigured(): boolean {
    return Boolean(this.GOOGLE_CLIENT_ID && this.GOOGLE_API_KEY)
  },
}
