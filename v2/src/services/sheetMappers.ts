// ═══════════════════════════════════════════════════════════════
// Mapeadores: transformam dados brutos da planilha em tipos TS
// Suporta o formato classico (Col A=label, Col B=valor) E o
// formato real da planilha Comercial Bernardes (Col B=label, Col C=valor)
//
// DEPLOY MENSAL:
// 1. Converter .xlsx para Google Sheets nativo no Drive
// 2. Copiar novo Sheet ID para .env → VITE_SHEET_ID
// 3. App → Configuracoes → Conectar (limpa dados anteriores automaticamente)
// 4. Verificar periodo no banner (ex: "Abr/2026")
// 5. Verificar DRE: TPV, Markup POS, Valor Liquido
// 6. Exportar PDF → conferir deducoes como valores negativos
// PROIBIDO: datas hardcoded — todas as datas vem de extractPeriodoFromTab()
// ═══════════════════════════════════════════════════════════════

import {
  SHEET_TAB_PATTERN,
  COL_VENDEDORES,
  COL_LANCAMENTOS,
  COL_CLIENTES,
  COL_MKP_POS,
  COL_REPASSES,
  COL_DESCONTOS,
  COL_COBR_DIGITAL,
} from '../config/sheets'
import type {
  DadosFechamento,
  Vendedor,
  LancamentoCusto,
  ClienteCarteira,
  SheetTab,
} from '../types'

// ─── Fechamento (dados da planilha principal) ─────────────────

/**
 * Extrai o periodo do nome da aba ou dos dados internos da aba.
 *
 * - Formato classico: "Fechamento_Mar2026" -> "Mar2026"
 * - Formato Resumo:   extrai da linha 3, col B
 *   ex: "Comercial Bernardes · Março/2026 · 31/03/2026" -> "Mar2026"
 */
export function extractPeriodoFromTab(
  tabTitle: string,
  rows?: (string | number)[][]
): string {
  // Tenta extrair do titulo da aba (ex: "Fechamento_Mar2026")
  const fromTitle = tabTitle.replace(SHEET_TAB_PATTERN, '').replace(/^[_\s-]+/, '')
  if (fromTitle && fromTitle !== tabTitle && fromTitle.length > 0) return fromTitle

  // Para aba "Resumo": extrai da linha 3, coluna B (indice 2 = row 3, col B = index 1)
  if (rows && rows.length > 2) {
    const row3 = String(rows[2]?.[1] || rows[2]?.[0] || '')
    const match = row3.match(/(\w+)\/(\d{4})/u)
    if (match) {
      const monthMap: Record<string, string> = {
        janeiro: 'Jan', fevereiro: 'Fev', março: 'Mar', abril: 'Abr',
        maio: 'Mai', junho: 'Jun', julho: 'Jul', agosto: 'Ago',
        setembro: 'Set', outubro: 'Out', novembro: 'Nov', dezembro: 'Dez',
      }
      const abbr = monthMap[match[1].toLowerCase()] || match[1]
      return `${abbr}${match[2]}`
    }
  }

  return tabTitle
}

/**
 * Identifica quais abas sao de fechamento mensal
 */
export function filterFechamentoTabs(tabs: SheetTab[]): SheetTab[] {
  return tabs.filter((t) => SHEET_TAB_PATTERN.test(t.title))
}

/**
 * Mapeia dados brutos de uma aba de fechamento para DadosFechamento.
 *
 * Suporta dois formatos:
 * 1. Formato classico: Col A = label, Col B = valor, Col C = variacao%
 * 2. Formato Comercial Bernardes (aba "Resumo"):
 *    - Col B (idx 1) = label, Col C (idx 2) = valor
 *    - Excecao: Col A (idx 0) = "VALOR LIQUIDO A RECEBER", Col C (idx 2) = valor
 *    - Variacoes na secao comparativo: Col E (idx 4) = label, Col G (idx 6) = "▲ 10.2%"
 */
export function mapRowsToFechamento(
  rows: (string | number)[][],
  periodo: string
): DadosFechamento {
  /**
   * Busca um label em Col A OU Col B de qualquer linha.
   * Retorna o valor de Col C (Resumo) ou Col B (classico).
   */
  const findValue = (label: string): number => {
    const lc = label.toLowerCase()
    for (const row of rows) {
      const a = String(row[0] || '').toLowerCase()
      const b = String(row[1] || '').toLowerCase()

      if (a.includes(lc)) {
        // Label em Col A → valor em Col C (formato Resumo) ou Col B (formato classico)
        const valC = parseNumericValue(row[2])
        const valB = parseNumericValue(row[1])
        return valC !== 0 ? valC : valB
      }
      if (b.includes(lc)) {
        // Label em Col B → valor em Col C (formato Resumo)
        return parseNumericValue(row[2])
      }
    }
    return 0
  }

  /**
   * Busca variacao percentual.
   * Primeiro verifica secao comparativo (Col E = label, Col G = "▲ 10.2%").
   * Depois verifica formato classico (Col A = label, Col C = variacao).
   */
  const findVariacao = (label: string): number | undefined => {
    const lc = label.toLowerCase()

    // Formato Resumo: comparativo em Col E (idx 4), variacao em Col G (idx 6)
    for (const row of rows) {
      const e = String(row[4] || '').toLowerCase()
      if (e.includes(lc)) {
        const varStr = String(row[6] || '')
        if (!varStr) return undefined
        const num = parseFloat(
          varStr.replace(/[▲▼\s%]/g, '').replace(',', '.')
        )
        return isNaN(num) ? undefined : num
      }
    }

    // Formato classico: Col A = label, Col C = variacao
    for (const row of rows) {
      const a = String(row[0] || '').toLowerCase()
      if (a.includes(lc)) {
        if (row[2] === undefined || row[2] === '') return undefined
        return parseNumericValue(row[2])
      }
    }

    return undefined
  }

  return {
    periodo,
    ecsAtivos: findValue('ecs ativ') || findValue('clientes ativ'),
    tpvTotal: findValue('tpv total') || findValue('tpv'),
    tpvMedio: findValue('tpv m') || findValue('medio por ec'),
    markupPos: findValue('markup'),
    taxaMargem: findValue('margem') || findValue('taxa de margem'),
    comissaoRede: findValue('comiss') || findValue('rede'),
    repasse: findValue('repasse') || findValue('transfer'),
    faturaDigital: Math.abs(findValue('digital') || findValue('conta digital')),
    descontos: Math.abs(findValue('desconto')),
    valorLiquido: findValue('líquido') || findValue('liquido') || findValue('valor l'),
    variacaoEcs: findVariacao('ecs ativ') ?? findVariacao('clientes ativ'),
    variacaoTpv: findVariacao('tpv total') ?? findVariacao('tpv'),
    variacaoMarkup: findVariacao('markup'),
    variacaoMargem: findVariacao('margem'),
  }
}

// ─── Vendedores ───────────────────────────────────────────────

/**
 * Mapeia linhas da aba "Vendedores" para Vendedor[]
 * Pula a primeira linha (header)
 */
export function mapRowsToVendedores(rows: (string | number)[][]): Vendedor[] {
  if (rows.length <= 1) return []

  return rows.slice(1).map((row, index) => ({
    id: Number(row[COL_VENDEDORES.ID]) || index + 1,
    nome: String(row[COL_VENDEDORES.NOME] || ''),
    regiao: String(row[COL_VENDEDORES.REGIAO] || ''),
    avatar: generateAvatar(String(row[COL_VENDEDORES.NOME] || '')),
    faturamentoMensal: 0,
    metaMensal: parseNumericValue(row[COL_VENDEDORES.META_MENSAL]),
    faturamentoAcumulado: 0,
    metaAcumulada: parseNumericValue(row[COL_VENDEDORES.META_ACUMULADA]),
    variacaoMes: 0,
    comissaoBase: parseNumericValue(row[COL_VENDEDORES.COMISSAO_BASE]),
    bonus: parseNumericValue(row[COL_VENDEDORES.BONUS]),
    _sheetRow: index + 2,
  }))
}

// ─── MKP de POS → Clientes ───────────────────────────────────

/**
 * Mapeia linhas da aba "MKP de POS" para ClienteCarteira[]
 *
 * Estrutura da aba:
 *   Row 1: titulo "DETALHAMENTO MKP DE POS"
 *   Row 2: headers (CNPJ EC | Nome | TPV Total | Markup | Margem)
 *   Row 3+: dados
 */
export function mapRowsMKPdePOS(rows: (string | number)[][], periodo = 'atual'): ClienteCarteira[] {
  // Pula 2 linhas iniciais (titulo + header)
  if (rows.length <= 2) return []

  return rows
    .slice(2)
    .filter((row) => row.length >= 3 && row[COL_MKP_POS.NOME])
    .map((row, index) => {
      const tpv = parseNumericValue(row[COL_MKP_POS.TPV])
      const markup = parseNumericValue(row[COL_MKP_POS.MARKUP])
      const margem = parseNumericValue(row[COL_MKP_POS.MARGEM])

      return {
        id: index + 1,
        cnpj: String(row[COL_MKP_POS.CNPJ] || ''),
        nome: String(row[COL_MKP_POS.NOME] || ''),
        segmento: inferirSegmento(String(row[COL_MKP_POS.NOME] || '')),
        vendedor: 'Comercial Bernardes',
        volumeTotal: tpv,
        /** ticketMedio = markup do EC (faturamento CB por EC), nao ticket por transacao */
        ticketMedio: markup,
        margem,
        ultimaCompra: periodo,
        status: 'ativo' as const,
        frequencia: margem > 1.2 ? 3 : margem > 0.8 ? 2 : 1,
        _sheetRow: index + 3,
      }
    })
}

// ─── Repasses → Lancamentos (receitas) ───────────────────────

/**
 * Mapeia linhas da aba "Repasses" para LancamentoCusto[]
 *
 * Estrutura: Row 1 = header, Rows 2+ = dados
 * Colunas: Data | CNPJ | Estabelecimento | Tipo de Ajuste | Valor
 */
export function mapRowsRepasses(rows: (string | number)[][]): LancamentoCusto[] {
  if (rows.length <= 2) return []

  return rows
    .slice(2) // pula linha de título + linha de cabeçalho
    .filter((row) => {
      if (row.length < 4) return false
      // Rejeita linhas de header que vazem (contém texto de coluna como "CNPJ" ou "Estabelecimento")
      const nome = String(row[COL_REPASSES.NOME] || '').toLowerCase()
      if (nome.includes('cnpj') || nome.includes('estabelec') || nome === '') return false
      // Rejeita se o valor for falsy (0, vazio, undefined)
      return Boolean(row[COL_REPASSES.VALOR])
    })
    .map((row, index) => ({
      id: `REP-${String(row[COL_REPASSES.CNPJ] || index + 1).replace(/\D/g, '').slice(-6)}-${index}`,
      data: String(row[COL_REPASSES.DATA] || ''),
      descricao: `${String(row[COL_REPASSES.TIPO] || '')} — ${String(row[COL_REPASSES.NOME] || '')}`,
      // categoria sempre 'Repasse' para distinguir da receita agregada do DRE (fechamento.repasse)
      categoria: 'Repasse',
      tipo: 'receita' as const,
      valor: Math.abs(parseNumericValue(row[COL_REPASSES.VALOR])),
      conta: 'Repasses',
      source: 'sheets' as const,
      _sheetRow: index + 2,
    }))
}

// ─── Descontos → Lancamentos (despesas) ──────────────────────

/**
 * Mapeia linhas da aba "Descontos" para LancamentoCusto[]
 *
 * Estrutura:
 *   Rows 1-5: cabecalho e headers
 *   Rows 6+: dados (blank | CNPJ | Parceiro | Descricao | Valor)
 *   Ultima linha: total (Col A contém "TOTAL")
 */
export function mapRowsDescontos(rows: (string | number)[][], periodo = 'atual'): LancamentoCusto[] {
  if (rows.length <= 5) return []

  return rows
    .slice(5) // pula cabecalho
    .filter((row) => {
      const colA = String(row[0] || '').toUpperCase()
      const hasValue = row.length >= 5 && row[COL_DESCONTOS.VALOR]
      const isTotal = colA.includes('TOTAL')
      return hasValue && !isTotal
    })
    .map((row, index) => {
      const descricao = String(row[COL_DESCONTOS.DESCRICAO] || 'Desconto')
      const desc = descricao.toLowerCase()
      const categoria = desc.includes('aluguel') ? 'Aluguel'
        : desc.includes('tarifa') ? 'Infraestrutura'
        : 'Fornecedores'
      return {
        id: `DESC-${index + 1}`,
        data: periodo,
        descricao,
        categoria,
        tipo: 'despesa' as const,
        valor: Math.abs(parseNumericValue(row[COL_DESCONTOS.VALOR])),
        conta: 'Descontos',
        source: 'sheets' as const,
        _sheetRow: index + 6,
      }
    })
}

// ─── Cobr. Conta Digital → Lancamentos (despesas) ────────────

/**
 * Mapeia linhas da aba "Cobr. Conta Digital" para LancamentoCusto[]
 *
 * Estrutura: linhas de cabecalho no inicio, depois dados:
 *   Nome do Estabelecimento | Conta Ativa? | Valor
 * Identifica linhas de dados: Col A nao vazio e Col C tem valor numerico
 */
export function mapRowsCobrDigital(rows: (string | number)[][], periodo = 'atual'): LancamentoCusto[] {
  return rows
    .map((row, index) => ({ row, index }))
    .filter(({ row }) => {
      const nome = String(row[COL_COBR_DIGITAL.NOME] || '').trim()
      const valor = parseNumericValue(row[COL_COBR_DIGITAL.VALOR])
      const isHeader =
        nome.toUpperCase().includes('COBRAN') ||
        nome.toUpperCase().includes('ESTABELECIMENTO') ||
        nome.toUpperCase().includes('TOTAL') ||
        nome.toUpperCase().includes('PARCEIRO') ||
        nome === ''
      return nome !== '' && valor !== 0 && !isHeader
    })
    .map(({ row, index }) => ({
      id: `COBR-${index + 1}`,
      data: periodo,
      descricao: `Conta Digital — ${String(row[COL_COBR_DIGITAL.NOME] || '')}`,
      categoria: 'Conta Digital',
      tipo: 'despesa' as const,
      valor: Math.abs(parseNumericValue(row[COL_COBR_DIGITAL.VALOR])),
      conta: 'Cobr. Conta Digital',
      source: 'sheets' as const,
      _sheetRow: index + 1,
    }))
}

// ─── Lancamentos (formato classico) ──────────────────────────

/**
 * Mapeia linhas da aba "Lancamentos" para LancamentoCusto[]
 */
export function mapRowsToLancamentos(rows: (string | number)[][]): LancamentoCusto[] {
  if (rows.length <= 1) return []

  return rows.slice(1).map((row, index) => ({
    id: String(row[COL_LANCAMENTOS.ID] || `lanc-${index + 1}`),
    data: String(row[COL_LANCAMENTOS.DATA] || ''),
    descricao: String(row[COL_LANCAMENTOS.DESCRICAO] || ''),
    categoria: String(row[COL_LANCAMENTOS.CATEGORIA] || ''),
    tipo: (String(row[COL_LANCAMENTOS.TIPO] || '').toLowerCase().includes('receita')
      ? 'receita'
      : 'despesa') as 'receita' | 'despesa',
    valor: parseNumericValue(row[COL_LANCAMENTOS.VALOR]),
    conta: String(row[COL_LANCAMENTOS.CONTA] || ''),
    _sheetRow: index + 2,
  }))
}

// ─── Clientes / Carteira (formato classico) ──────────────────

/**
 * Mapeia linhas da aba "Clientes" para ClienteCarteira[]
 */
export function mapRowsToClientes(rows: (string | number)[][]): ClienteCarteira[] {
  if (rows.length <= 1) return []

  return rows.slice(1).map((row, index) => {
    const statusRaw = String(row[COL_CLIENTES.STATUS] || 'ativo').toLowerCase()
    let status: 'ativo' | 'inativo' | 'em risco' = 'ativo'
    if (statusRaw.includes('inativ')) status = 'inativo'
    else if (statusRaw.includes('risco')) status = 'em risco'

    return {
      id: Number(row[COL_CLIENTES.ID]) || index + 1,
      nome: String(row[COL_CLIENTES.NOME] || ''),
      segmento: String(row[COL_CLIENTES.SEGMENTO] || ''),
      vendedor: String(row[COL_CLIENTES.VENDEDOR] || ''),
      volumeTotal: parseNumericValue(row[COL_CLIENTES.VOLUME_TOTAL]),
      ticketMedio: parseNumericValue(row[COL_CLIENTES.TICKET_MEDIO]),
      ultimaCompra: String(row[COL_CLIENTES.ULTIMA_COMPRA] || ''),
      status,
      frequencia: parseNumericValue(row[COL_CLIENTES.FREQUENCIA]),
      _sheetRow: index + 2,
    }
  })
}

// ─── Helpers ──────────────────────────────────────────────────

/**
 * Converte valor da planilha para numero.
 * Trata: "R$ 28.758,68", "1,05%", "-R$ 4.888,80", "▲ 10.2%"
 */
function parseNumericValue(value: string | number | undefined | null): number {
  if (value === undefined || value === null || value === '') return 0
  if (typeof value === 'number') return value

  const cleaned = String(value)
    .replace(/R\$\s?/g, '')
    .replace(/%/g, '')
    .replace(/[▲▼\s]/g, '')
    .replace(/\./g, '')         // remove separador de milhar brasileiro
    .replace(',', '.')          // troca virgula decimal por ponto
    .replace(/[^\d.\-]/g, '')   // remove tudo que nao e numero, ponto ou menos
    .trim()

  const num = parseFloat(cleaned)
  return isNaN(num) ? 0 : num
}

/**
 * Gera iniciais do nome para avatar (ex: "Ana Beatriz" -> "AB")
 */
function generateAvatar(nome: string): string {
  const parts = nome.trim().split(/\s+/)
  if (parts.length === 0) return '??'
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

/**
 * Infere segmento do estabelecimento pelo nome (para MKP de POS)
 * Normaliza acentos antes de comparar para garantir match correto
 */
function inferirSegmento(nome: string): string {
  // Normaliza: lowercase + remove acentos
  const n = nome.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')

  if (n.includes('restaurante') || n.includes('churrascaria') || n.includes('pizza') ||
      n.includes('hamburguer') || n.includes('lanches') || n.includes('lanchonete') ||
      n.includes('bar') || n.includes('cafeteria') || n.includes('padaria') ||
      n.includes('confeitaria') || n.includes('acai') || n.includes('sorveteria') ||
      n.includes('acougue') || n.includes('hortifruti') || n.includes('grill') ||
      n.includes('espetinho') || n.includes('sushi') || n.includes('emporio') ||
      n.includes('sabor') || n.includes('frango') || n.includes('donuts') ||
      n.includes('peixaria') || n.includes('doceria') || n.includes('birosca') ||
      n.includes('boteco') || n.includes('gourmet')) {
    return 'Alimentacao'
  }
  if (n.includes('mercado') || n.includes('supermercado') || n.includes('comercio') ||
      n.includes('mercearia') || n.includes('loja') || n.includes('shop') ||
      n.includes('farmacia') || n.includes('drogaria') || n.includes('papelaria') ||
      n.includes('colchao') || n.includes('eletro') || n.includes('presentes') ||
      n.includes('industria') || n.includes('madeira') || n.includes('vestuario') ||
      n.includes('moda') || n.includes('calcados') || n.includes('utilidades') ||
      n.includes('bazar') || n.includes('materiais') || n.includes('pet')) {
    return 'Comercio'
  }
  if (n.includes('clinica') || n.includes('saude') || n.includes('medic') ||
      n.includes('otica') || n.includes('drogaria') || n.includes('farmacia')) {
    return 'Saude'
  }
  if (n.includes('servicos') || n.includes('servico') || n.includes('oficina') ||
      n.includes('mecanica') || n.includes('borracharia') || n.includes('estetica') ||
      n.includes('barbearia') || n.includes('lavanderia') || n.includes('grafica') ||
      n.includes('master') || n.includes('games') || n.includes('tech') ||
      n.includes('consultoria') || n.includes('transporte') || n.includes('logistica')) {
    return 'Servicos'
  }
  if (n.includes('pousada') || n.includes('hotel') || n.includes('lazer') ||
      n.includes('pesk') || n.includes('resort') || n.includes('spa')) {
    return 'Hospedagem & Lazer'
  }
  return 'Outros'
}
