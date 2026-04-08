// ═══════════════════════════════════════════════════════════════
// Mapeamento de abas e colunas da planilha Google Sheets
// Fonte unica de verdade para posicoes de dados
// ═══════════════════════════════════════════════════════════════

/**
 * Padrao regex para identificar abas de fechamento mensal.
 * Aceita o formato classico "Fechamento_Mar2026" E o formato
 * real da planilha Comercial Bernardes ("Resumo").
 */
export const SHEET_TAB_PATTERN = /^(Fechamento|Resumo)/i

/** Nomes das abas (padrao + abas da planilha real Comercial Bernardes) */
export const SHEET_TABS = {
  // Abas padrao (formato classico)
  VENDEDORES: 'Vendedores',
  CONFIG: 'Config',
  CLIENTES: 'Clientes',
  LANCAMENTOS: 'Lancamentos',
  DRE: 'DRE',
  PROJECAO: 'Projecao',
  // Abas da planilha real (Comercial Bernardes)
  RESUMO: 'Resumo',
  MKP_POS: 'MKP de POS',
  REPASSES: 'Repasses',
  DESCONTOS: 'Descontos',
  COBR_DIGITAL: 'Cobr. Conta Digital',
} as const

/**
 * Mapeamento de colunas da aba de Fechamento
 * Cada constante representa o indice da coluna (0-based) na planilha
 * Baseado nos dados reais: Fechamento_Comercial Bernardes_Marco_2026
 */
export const COL_FECHAMENTO = {
  METRICA: 0,          // Nome da metrica (coluna A)
  VALOR: 1,            // Valor da metrica (coluna B)
  VARIACAO: 2,         // Variacao % vs mes anterior (coluna C)
} as const

/**
 * Labels esperados na coluna de metricas do Fechamento
 * Usados para localizar cada dado na planilha
 */
export const METRICAS_FECHAMENTO = {
  ECS_ATIVOS: 'ECs Ativos',
  TPV_TOTAL: 'TPV Total',
  TPV_MEDIO: 'TPV Médio por EC',
  MARKUP_POS: 'Markup POS',
  TAXA_MARGEM: 'Taxa de Margem',
  COMISSAO_REDE: 'Comissão Rede',
  REPASSE: 'Repasse',
  FATURA_DIGITAL: 'Faturamento Conta Digital',
  DESCONTOS: 'Descontos do Período',
  VALOR_LIQUIDO: 'Valor Líquido Devido',
} as const

/** Colunas da aba Vendedores */
export const COL_VENDEDORES = {
  ID: 0,
  NOME: 1,
  REGIAO: 2,
  META_MENSAL: 3,
  META_ACUMULADA: 4,
  COMISSAO_BASE: 5,
  BONUS: 6,
} as const

/** Colunas da aba Lancamentos */
export const COL_LANCAMENTOS = {
  ID: 0,
  DATA: 1,
  DESCRICAO: 2,
  CATEGORIA: 3,
  TIPO: 4,
  VALOR: 5,
  CONTA: 6,
} as const

/** Colunas da aba Clientes */
export const COL_CLIENTES = {
  ID: 0,
  NOME: 1,
  SEGMENTO: 2,
  VENDEDOR: 3,
  VOLUME_TOTAL: 4,
  TICKET_MEDIO: 5,
  ULTIMA_COMPRA: 6,
  STATUS: 7,
  FREQUENCIA: 8,
} as const

/**
 * Colunas da aba "MKP de POS" (Comercial Bernardes)
 * Linha 1: título, Linha 2: headers, Linha 3+: dados
 * Estrutura real confirmada: Col A=vazio/seq, B=Nome, C=CNPJ(numérico), D=TPV, E=Markup, F=Margem
 */
export const COL_MKP_POS = {
  CNPJ: 2,
  NOME: 1,
  TPV: 3,
  MARKUP: 4,
  MARGEM: 5,
} as const

/**
 * Colunas da aba "Repasses" (Comercial Bernardes)
 * Linha 1: título, Linha 2: header, Linhas 3+: dados
 * Estrutura real: Col A=Data, B=EC, C=CNPJ, D=Tipo, E=intermediária, F=Valor
 */
export const COL_REPASSES = {
  DATA: 0,
  CNPJ: 2,
  NOME: 1,
  TIPO: 3,
  VALOR: 5,
} as const

/**
 * Colunas da aba "Descontos" (Comercial Bernardes)
 * Linhas 1-5: cabeçalho, Linhas 6+: dados
 */
export const COL_DESCONTOS = {
  CNPJ: 1,
  PARCEIRO: 2,
  DESCRICAO: 3,
  VALOR: 4,
} as const

/**
 * Colunas da aba "Cobr. Conta Digital" (Comercial Bernardes)
 * Linhas iniciais: cabeçalho, depois dados
 */
export const COL_COBR_DIGITAL = {
  NOME: 0,
  ATIVA: 1,
  VALOR: 2,
} as const

/** URL base da Google Sheets API v4 */
export const SHEETS_API_BASE = 'https://sheets.googleapis.com/v4/spreadsheets'

/** Escopo OAuth para leitura e escrita na planilha */
export const SHEETS_SCOPE = 'https://www.googleapis.com/auth/spreadsheets'

/** Escopo OAuth para perfil do usuario */
export const PROFILE_SCOPE = 'https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email'
