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
} from '../config/sheets'
import { periodoToDate } from '../utils/format'
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
    // Usa \p{L}+ (Unicode letter) em vez de \w+ para capturar meses com
    // acentos/cedilha como "Março", "Fevereiro", "Outubro" corretamente.
    // \w não reconhece ç/ã/etc, causando match parcial (ex: "o2026" em "Março/2026").
    const match = row3.match(/(\p{L}+)\/(\d{4})/u)
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
    // NOTA: busca por 'descontos do' em vez de 'desconto' para evitar colisão
    // com o cabeçalho de seção "DESCONTOS & COBRANÇAS" que aparece antes dos dados.
    // Todas as planilhas têm "Descontos do Período (ver aba Descontos)" em col B,
    // enquanto o cabeçalho de seção não contém 'do'.
    descontos: Math.abs(
      findValue('descontos do') ||
      findValue('(-) desc') ||
      findValue('ajuste negativo') ||
      findValue('desc. concedido') ||
      findValue('abatimento') ||
      findValue('deducao')
    ),
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

  return rows.slice(1)
    // Filtra linhas completamente em branco ou sem nome — evita Vendedores fantasma
    .filter((row) => {
      const nome = String(row[COL_VENDEDORES.NOME] || '').trim()
      return nome.length > 0
    })
    .map((row, index) => ({
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
  if (rows.length <= 2) return []

  // Detecta a linha de cabeçalho escaneando as primeiras 5 linhas
  // A aba real pode ter: Row1=título, Row2=vazio ou sublabel, Row3=headers
  let headerRowIdx = -1
  for (let i = 0; i < Math.min(5, rows.length); i++) {
    const cells = (rows[i] || []).map((h) => String(h || '').toLowerCase())
    // Considera linha de header se contiver ao menos 2 das palavras-chave
    const hits = cells.filter((c) => /cnpj|nome|estabelec|tpv|markup|margem/.test(c)).length
    if (hits >= 2) { headerRowIdx = i; break }
  }

  // Se não encontrou header, assume que os dados começam em rows[2] (skip título+header)
  const dataStart = headerRowIdx >= 0 ? headerRowIdx + 1 : 2

  // Mapeamento de colunas a partir do header encontrado (ou fallback fixo)
  // Fallback correto para planilha real: Col A=seq, B=CNPJ(número), C=Nome/Estabelecimento
  const headers = headerRowIdx >= 0
    ? (rows[headerRowIdx] || []).map((h) => String(h || '').toLowerCase())
    : []
  const nomeIdx = headers.findIndex((h) => /nome|estabelec/i.test(h))
  const cnpjIdx = headers.findIndex((h) => /cnpj/i.test(h))
  const tpvIdx  = headers.findIndex((h) => /tpv/i.test(h))
  const mkpIdx  = headers.findIndex((h) => /markup/i.test(h))
  const mrgIdx  = headers.findIndex((h) => /margem/i.test(h))

  // Fallback: índice 1 = Nome/Estabelecimento (Col B), índice 2 = CNPJ (Col C)
  const CNPJi   = cnpjIdx >= 0 ? cnpjIdx : 2
  const NOMEi   = nomeIdx >= 0 ? nomeIdx : 1
  const TPVi    = tpvIdx  >= 0 ? tpvIdx  : COL_MKP_POS.TPV
  const MARKUPi = mkpIdx  >= 0 ? mkpIdx  : COL_MKP_POS.MARKUP
  const MARGEMi = mrgIdx  >= 0 ? mrgIdx  : COL_MKP_POS.MARGEM

  return rows
    .slice(dataStart)
    // Filtra linhas de header que possam ter escapado (texto "cnpj", "nome", "estabelec")
    .filter((row) => {
      if (row.length < 3) return false
      const cell = String(row[NOMEi] || '').toLowerCase()
      if (/^(cnpj|nome|estabelec|header|detalhamento)/.test(cell)) return false
      // Precisa ter ao menos nome ou CNPJ preenchido
      return Boolean(row[NOMEi] || row[CNPJi])
    })
    .map((row, index) => {
      const tpv    = parseNumericValue(row[TPVi])
      const markup = parseNumericValue(row[MARKUPi])
      const margem = parseNumericValue(row[MARGEMi])

      return {
        id: index + 1,
        cnpj: normalizeCnpj(row[CNPJi]),
        nome: String(row[NOMEi] || ''),
        segmento: inferirSegmento(String(row[NOMEi] || '')),
        vendedor: 'Comercial Bernardes',
        volumeTotal: tpv,
        /** ticketMedio = markup do EC (faturamento CB por EC), nao ticket por transacao */
        ticketMedio: markup,
        margem,
        ultimaCompra: periodo,
        status: 'ativo' as const,
        // margem do sheet é decimal (0.012 = 1,2%); markup > 0 indica EC ativo
        frequencia: markup > 500 ? 3 : markup > 100 ? 2 : 1,
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
 *
 * DIFERENÇAS ENTRE PLANILHAS:
 *  - JAN/FEV: data no formato americano M/DD/YYYY ("1/13/2026")
 *  - MAR+:    data no formato brasileiro DD/MM/YYYY ("16/03/2026")
 *  - JAN/FEV: CNPJ sem formatação ("55789698000168")
 *  - MAR+:    CNPJ formatado ("59.813.357/0001-31")
 * Ambos são normalizados aqui.
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
    .map((row, index) => {
      const cnpjRaw   = String(row[COL_REPASSES.CNPJ] || '')
      const cnpj      = normalizeCnpj(cnpjRaw)
      const nome      = String(row[COL_REPASSES.NOME] || '')
      const tipoAj    = String(row[COL_REPASSES.TIPO] || '')
      const dataRow   = normalizeDate(String(row[COL_REPASSES.DATA] || ''))
      return {
        id: `REP-${cnpj.slice(-6) || index + 1}-${index}`,
        data: dataRow,
        descricao: nome,                          // Estabelecimento como descrição principal
        categoria: 'Repasse',
        tipo: 'receita' as const,
        valor: Math.abs(parseNumericValue(row[COL_REPASSES.VALOR])),
        conta: 'Repasses',
        cnpjCliente: cnpj  || undefined,
        nomeCliente: nome  || undefined,
        tipoAjuste:  tipoAj || undefined,
        source: 'sheets' as const,
        _sheetRow: index + 2,
      }
    })
}

// ─── Descontos → Lancamentos (despesas) ──────────────────────

/**
 * Mapeia linhas da aba "Descontos" para LancamentoCusto[]
 *
 * Estrutura confirmada (JAN/FEV/MAR):
 *   Rows 1-5: cabeçalho (título, vazio, desc, vazio, header)
 *   Rows 6+:  dados (vazio | CNPJ | Parceiro | Tipo | Origem/Descrição | Valor)
 *   Última linha: total
 *     - JAN/FEV: "TOTAL DESCONTOS" na col D (idx 3)
 *     - MAR:     "TOTAL DESCONTOS" na col A (idx 0)
 *
 * CORREÇÃO: VALOR estava mapeado para idx 4 (texto de descrição) → sempre 0.
 * Correto: TIPO=3, DESCRICAO=4, VALOR=5.
 * Detecção do total: verifica "TOTAL" em qualquer célula da linha.
 */
export function mapRowsDescontos(rows: (string | number)[][], periodo = 'atual'): LancamentoCusto[] {
  if (rows.length <= 5) return []

  return rows
    .slice(5) // pula cabeçalho
    .filter((row) => {
      // Detecta linha de total em QUALQUER coluna (JAN/FEV: col D; MAR: col A)
      const isTotal = row.some((cell) => String(cell || '').toUpperCase().includes('TOTAL'))
      // Requer ao menos 6 colunas E valor numérico na col F (idx 5)
      const hasValue = row.length >= 6 && Boolean(row[COL_DESCONTOS.VALOR])
      return hasValue && !isTotal
    })
    .map((row, index) => {
      const tipo      = String(row[COL_DESCONTOS.TIPO]      || '').toLowerCase()
      const descricao = String(row[COL_DESCONTOS.DESCRICAO] || row[COL_DESCONTOS.TIPO] || 'Desconto')
      const desc      = descricao.toLowerCase()
      // Categorização baseada em tipo (col D) + descrição (col E)
      const categoria = desc.includes('aluguel') || tipo.includes('aluguel') ? 'Aluguel'
        : tipo === 'chip' || desc.includes('chip') || desc.includes('mensalidade') ? 'Infraestrutura'
        : tipo === 'pos' ? 'Equipamentos'
        : 'Fornecedores'
      return {
        id: `DESC-${index + 1}`,
        data: periodoToDate(periodo),
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
  // Detecta colunas dinamicamente escaneando as primeiras 8 linhas.
  // Exige que Nome E Valor estejam na MESMA linha para confirmar o cabeçalho,
  // evitando falso-positivo em linhas de título como "Parceiro: Comercial Bernardes".
  // Planilha real: Col A=vazio, Col B=Nome, Col C=Conta Ativa?, Col D=Valor
  let NOMEi  = 1 // fallback correto para planilha real (Col B)
  let VALORi = 3 // fallback correto para planilha real (Col D)

  for (let i = 0; i < Math.min(8, rows.length); i++) {
    const cells = (rows[i] || []).map((c) => String(c || '').toLowerCase())
    // Exige AMBOS presentes na mesma linha: nome e valor
    const nomeH  = cells.findIndex((c) => /estabelec|nome do/i.test(c))
    const valorH = cells.findIndex((c) => /valor/i.test(c))
    if (nomeH >= 0 && valorH >= 0) {
      NOMEi  = nomeH
      VALORi = valorH
      break
    }
  }

  return rows
    .map((row, index) => ({ row, index }))
    .filter(({ row }) => {
      const nome = String(row[NOMEi] || '').trim()
      const valor = parseNumericValue(row[VALORi])
      const upper = nome.toUpperCase()
      const isHeader =
        upper.includes('COBRAN') ||
        upper.includes('ESTABELECIMENTO') ||
        upper.includes('TOTAL') ||
        upper.includes('PARCEIRO') ||
        upper.includes('NOME') ||
        nome === ''
      return nome !== '' && valor !== 0 && !isHeader
    })
    .map(({ row, index }) => {
      const nome = String(row[NOMEi] || '')
      return {
        id: `COBR-${index + 1}`,
        data: periodoToDate(periodo),
        descricao: `Conta Digital — ${nome}`,
        categoria: 'Conta Digital',
        tipo: 'despesa' as const,
        valor: Math.abs(parseNumericValue(row[VALORi])),
        conta: 'Cobr. Conta Digital',
        nomeCliente: nome || undefined,
        source: 'sheets' as const,
        _sheetRow: index + 1,
      }
    })
}

// ─── Lancamentos (formato classico) ──────────────────────────

/**
 * Mapeia linhas da aba "Lancamentos" para LancamentoCusto[]
 */
export function mapRowsToLancamentos(rows: (string | number)[][]): LancamentoCusto[] {
  if (rows.length <= 1) return []

  return rows.slice(1)
    // Filtra linhas em branco — sem descrição E sem valor → descarta para não poluir DRE
    .filter((row) => {
      const descricao = String(row[COL_LANCAMENTOS.DESCRICAO] || '').trim()
      const valor     = parseNumericValue(row[COL_LANCAMENTOS.VALOR])
      return descricao.length > 0 || valor !== 0
    })
    .map((row, index) => ({
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
 * Normaliza CNPJ para 14 dígitos sem formatação.
 * Remove pontos, barras e hifens; adiciona zeros à esquerda se necessário.
 * Trata: "59.813.357/0001-31" → "59813357000131"
 *        "55789698000168"     → "55789698000168"
 *        "5866499000138"      → "05866499000138" (zero faltando)
 */
function normalizeCnpj(cnpj: string | number | undefined): string {
  const digits = String(cnpj || '').replace(/\D/g, '')
  if (!digits) return ''
  return digits.padStart(14, '0')
}

/**
 * Normaliza data para o formato DD/MM/YYYY.
 *
 * JAN/FEV usam formato americano M/DD/YYYY ("1/13/2026", "2/3/2026").
 * MAR+    usam formato brasileiro DD/MM/YYYY ("16/03/2026").
 *
 * Regra de detecção (sem ambiguidade):
 *  - Se o PRIMEIRO número > 12 → definitivamente DD/MM/YYYY (dia primeiro)
 *  - Se o SEGUNDO número > 12 → definitivamente M/DD/YYYY (mês primeiro)
 *  - Ambos ≤ 12 (ex: "2/12/2026") → assume M/DD/YYYY (padrão histórico JAN/FEV)
 *    pois os dados de JAN e FEV usam consistentemente o formato americano.
 */
function normalizeDate(dateStr: string): string {
  const d = dateStr.trim()
  const parts = d.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/)
  if (!parts) return d // formato desconhecido — preserva como está
  const n1 = parseInt(parts[1], 10)
  const n2 = parseInt(parts[2], 10)
  const year = parts[3]
  let day: number, month: number
  if (n1 > 12) {
    // Primeiro número > 12 → obrigatoriamente dia (BR: DD/MM/YYYY)
    day = n1; month = n2
  } else if (n2 > 12) {
    // Segundo número > 12 → obrigatoriamente dia (US: M/DD/YYYY)
    day = n2; month = n1
  } else {
    // Ambos ≤ 12: assume formato americano M/DD/YYYY (padrão JAN/FEV)
    day = n2; month = n1
  }
  return `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`
}

/**
 * Converte valor da planilha para numero.
 * Trata: "R$ 28.758,68", "1,05%", "-R$ 4.888,80", "▲ 10.2%"
 */
function parseNumericValue(value: string | number | undefined | null): number {
  if (value === undefined || value === null || value === '') return 0
  if (typeof value === 'number') return value

  const stripped = String(value)
    .replace(/R\$\s?/g, '')
    .replace(/%/g, '')
    .replace(/[▲▼\s]/g, '')
    .trim()

  // Detecta formato: BR tem vírgula decimal ("1.234,56"), Anglo tem ponto decimal ("1,234.56")
  // Se a string tem vírgula → formato BR: remover pontos (milhar), trocar vírgula por ponto
  // Se a string NÃO tem vírgula → formato Anglo ou inteiro BR: preservar ponto como decimal
  let cleaned: string
  if (stripped.includes(',')) {
    // Formato BR: "1.234,56" → "1234.56"
    cleaned = stripped.replace(/\./g, '').replace(',', '.')
  } else {
    // Formato Anglo ou sem separadores: "1234.56" → "1234.56"
    cleaned = stripped
  }
  cleaned = cleaned.replace(/[^\d.\-]/g, '').trim()

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
