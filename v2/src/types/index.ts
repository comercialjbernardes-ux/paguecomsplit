// ═══════════════════════════════════════════════════════════════
// Venda Feita — Tipos TypeScript
// Baseados no fluxograma e na planilha Google Sheets
// ═══════════════════════════════════════════════════════════════

// ─── Modulo Equipe ────────────────────────────────────────────

export interface Vendedor {
  id: number
  nome: string
  regiao: string
  avatar: string // iniciais (ex: "AB")
  faturamentoMensal: number
  metaMensal: number
  faturamentoAcumulado: number
  metaAcumulada: number
  variacaoMes: number // % vs mes anterior
  comissaoBase: number // % de comissao base
  bonus: number // % bonus ao atingir meta
  _sheetRow?: number // linha na planilha (uso interno)
  _seededFromSheets?: boolean // semeado do Sheets no first-run
  source?: 'sheets' | 'local'
}

export interface ProdutoVenda {
  produto: string
  valorVendido: number
  pctComissao: number // % de comissao especifica do produto
}

export interface Cliente {
  nome: string
  cidade: string
  volumeMensal: number
  status: 'ativo' | 'em risco' | 'novo'
}

export interface CarteiraVendedor {
  produtos: ProdutoVenda[]
  clientes: Cliente[]
}

export interface DadosMensais {
  mes: string
  realizado: number
  meta: number
}

// ─── Modulo Interno ───────────────────────────────────────────

export interface LinhaDRE {
  id: string
  descricao: string
  mesAtual: number
  acumulado: number
  tipo: 'receita' | 'despesa' | 'custo' | 'subtotal' | 'destaque'
}

export interface LancamentoManual {
  id: string
  descricao: string
  valor: number
  tipo: 'receita' | 'despesa'
  data: string
}

export interface DadoProjecao {
  mes: string
  realizado: number | null
  projetado: number
}

export interface LancamentoCusto {
  id: string
  data: string
  descricao: string
  categoria: string
  tipo: 'receita' | 'despesa'
  valor: number
  conta: string
  cnpjCliente?: string  // CNPJ do EC (quando disponível — Repasses e Cobr. Digital)
  nomeCliente?: string  // Nome/Estabelecimento do EC (quando disponível)
  tipoAjuste?: string   // Tipo de Ajuste (quando disponível — Repasses)
  _sheetRow?: number
  source?: 'sheets' | 'local'
}

export interface ClienteCarteira {
  id: number
  cnpj?: string           // CNPJ do estabelecimento (COL_MKP_POS.CNPJ)
  nome: string
  segmento: string
  vendedor: string
  volumeTotal: number
  /** markup do EC = faturamento CB por este EC (nao ticket por transacao) */
  ticketMedio: number
  margem?: number         // margem percentual do EC (COL_MKP_POS.MARGEM)
  contaDigitalAtiva?: boolean  // EC tem conta digital ativa (Cobr. Conta Digital)
  ultimaCompra: string
  status: 'ativo' | 'inativo' | 'em risco'
  frequencia: number // compras por mes
  _sheetRow?: number
}

export interface CenarioSalvo {
  id: string
  nome: string
  crescimento: number
  investimento: number
  data: string
}

export interface MetaPeriodo {
  periodo: string // ex: "Mar2026"
  meta: number
  editedAt: string // ISO date string
}

export interface SegmentOverride {
  clienteId: number
  segmento: string
}

// ─── Dados da Planilha (raw) ──────────────────────────────────

export interface DadosFechamento {
  periodo: string // ex: "Mar2026"
  ecsAtivos: number
  tpvTotal: number
  tpvMedio: number
  markupPos: number
  taxaMargem: number
  comissaoRede: number
  repasse: number
  faturaDigital: number
  descontos: number
  valorLiquido: number
  variacaoEcs?: number
  variacaoTpv?: number
  variacaoMarkup?: number
  variacaoMargem?: number
}

// ─── Gestao de Custos Operacionais ───────────────────────────

export interface CustoOperacional {
  id: string
  data: string           // DD/MM/AAAA
  descricao: string
  categoria: 'Fixo' | 'Variavel' | 'Financeiro' | 'Fornecedor'
  valor: number
  recorrencia: 'unico' | 'mensal' | 'trimestral' | 'anual'
}

export interface Equipamento {
  id: string
  dataCompra: string     // DD/MM/AAAA
  descricao: string
  valorTotal: number
  numeroParcelas: number
  valorParcela: number
  parcelasPagas: number
}

// ─── Auth ─────────────────────────────────────────────────────

export interface GoogleUser {
  id: string
  name: string
  email: string
  picture: string
}

// ─── Relatorios / Export ──────────────────────────────────────

export interface ReportData {
  fechamentos: DadosFechamento[]
  vendedores: Vendedor[]
  lancamentos: LancamentoCusto[]
  clientes: ClienteCarteira[]
}

// ─── Sheets ───────────────────────────────────────────────────

export interface SheetTab {
  sheetId: number
  title: string
  index: number
}

export interface SheetConnectionStatus {
  connected: boolean
  sheetId: string
  title: string
  tabs: SheetTab[]
  lastSync: Date | null
}
