// ═══════════════════════════════════════════════════════════════
// Agente IA Financeiro — Anthropic Claude API (BYO key)
// Gera projecoes de crescimento inteligentes baseadas nos dados reais
// do negocio. Chave armazenada apenas no localStorage do usuario.
// ═══════════════════════════════════════════════════════════════

import type {
  DadosFechamento,
  CustoOperacional,
  Equipamento,
  ClienteCarteira,
  LancamentoCusto,
} from '../types'
import { getScalar, setScalar } from './localStorageService'

const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages'
const DEFAULT_MODEL = 'claude-sonnet-4-5'

// ─── API Key management ────────────────────────────────────────

export function getApiKey(): string | null {
  return getScalar<string>('vdf_ai_apikey')
}

export function setApiKey(key: string): void {
  setScalar('vdf_ai_apikey', key.trim())
}

export function clearApiKey(): void {
  localStorage.removeItem('vdf_ai_apikey')
}

export function getModel(): string {
  return getScalar<string>('vdf_ai_model') || DEFAULT_MODEL
}

export function setModel(model: string): void {
  setScalar('vdf_ai_model', model)
}

// ─── Tipo da resposta estruturada ──────────────────────────────

export interface ProjecaoIA {
  diagnostico: {
    saude: 'CRITICA' | 'ATENCAO' | 'SAUDAVEL'
    resumo: string
    principalProblema: string
    principalOportunidade: string
  }
  projecao: {
    horizonteMeses: number
    crescimentoEstimadoMensal: number
    metodologia: string
    mensal: Array<{
      mes: string
      base: number
      otimista: number
      pessimista: number
      premissa: string
    }>
  }
  premissas: string[]
  oportunidades: Array<{
    titulo: string
    impactoMensal: number
    esforco: 'BAIXO' | 'MEDIO' | 'ALTO'
    descricao: string
  }>
  riscos: Array<{
    titulo: string
    probabilidade: 'BAIXA' | 'MEDIA' | 'ALTA'
    impactoMensal: number
    descricao: string
  }>
  planoAcao: Array<{
    prioridade: number
    acao: string
    prazoSemanas: number
    impactoEsperado: string
  }>
  metas: {
    receitaMeta3m: number
    receitaMeta6m: number
    receitaMeta12m: number
    margemMeta: number
  }
}

// ─── Construcao do contexto do negocio ─────────────────────────

interface BusinessSnapshot {
  fechamentos: DadosFechamento[]
  custos: CustoOperacional[]
  equipamentos: Equipamento[]
  clientes: ClienteCarteira[]
  lancamentos: LancamentoCusto[]
}

export function buildBusinessContext(snap: BusinessSnapshot): string {
  const { fechamentos, custos, equipamentos, clientes, lancamentos } = snap

  // Ultimos 6 fechamentos (mais relevantes para projecao)
  const ultimosFech = fechamentos.slice(-6)
  const fechLinhas = ultimosFech.map((f) => {
    const margem = f.tpvTotal > 0 ? ((f.markupPos / f.tpvTotal) * 100).toFixed(2) : '0.00'
    return `- ${f.periodo}: TPV=R$${f.tpvTotal.toFixed(0)} | Markup=R$${f.markupPos.toFixed(0)} | Comissao=R$${f.comissaoRede.toFixed(0)} | Repasse=R$${f.repasse.toFixed(0)} | FaturaDigital=R$${f.faturaDigital.toFixed(0)} | Descontos=R$${f.descontos.toFixed(0)} | Liquido=R$${f.valorLiquido.toFixed(0)} | ECs=${f.ecsAtivos} | Margem=${margem}%`
  }).join('\n')

  // Custos operacionais mensais
  const custosMensais = custos.filter((c) => c.recorrencia === 'mensal')
  const totalCustosMensal = custosMensais.reduce((s, c) => s + c.valor, 0)
  const custosLinhas = custosMensais.length > 0
    ? custosMensais.map((c) => `- ${c.descricao} (${c.categoria}): R$${c.valor.toFixed(0)}/mes`).join('\n')
    : '- (nenhum custo operacional cadastrado)'

  // Equipamentos com parcelas ativas
  const equipAtivos = equipamentos.filter((e) => e.numeroParcelas - e.parcelasPagas > 0)
  const totalEquipMensal = equipAtivos.reduce((s, e) => s + e.valorParcela, 0)
  const equipLinhas = equipAtivos.length > 0
    ? equipAtivos.map((e) => `- ${e.descricao}: R$${e.valorParcela.toFixed(0)}/mes (${e.numeroParcelas - e.parcelasPagas} parcelas restantes)`).join('\n')
    : '- (nenhum equipamento parcelado ativo)'

  // Top 10 clientes
  const topClientes = [...clientes]
    .sort((a, b) => b.volumeTotal - a.volumeTotal)
    .slice(0, 10)
  const totalClientes = clientes.length
  const clientesAtivos = clientes.filter((c) => c.status === 'ativo').length
  const clientesRisco = clientes.filter((c) => c.status === 'em risco').length
  const clientesContaDigital = clientes.filter((c) => c.contaDigitalAtiva).length

  const topClientesLinhas = topClientes.length > 0
    ? topClientes.map((c, i) => `${i + 1}. ${c.nome} (${c.segmento || 'sem segmento'}): TPV=R$${c.volumeTotal.toFixed(0)} | Markup=R$${c.ticketMedio.toFixed(0)}`).join('\n')
    : '- (sem dados de carteira)'

  // Lancamentos manuais recentes
  const lancamentosLocais = lancamentos.filter((l) => l.source === 'local')
  const receitasManuais = lancamentosLocais.filter((l) => l.tipo === 'receita').reduce((s, l) => s + l.valor, 0)
  const despesasManuais = lancamentosLocais.filter((l) => l.tipo === 'despesa').reduce((s, l) => s + l.valor, 0)

  return `# DADOS DO NEGOCIO — Comercial Bernardes (Marketplace de POS)

## Modelo de Negocio
Marketplace de POS. A empresa intermedeia transacoes em estabelecimentos comerciais (ECs).
Recebe markup sobre o TPV (volume processado), comissao de rede, repasse e cobranca
de conta digital. Margem real = Markup POS / TPV Total (tipico 0.8% a 2%).

## Historico de Fechamentos (ultimos ${ultimosFech.length} periodos)
${fechLinhas || '(sem fechamentos disponiveis)'}

## Custos Operacionais Recorrentes — Total: R$${totalCustosMensal.toFixed(0)}/mes
${custosLinhas}

## Equipamentos Parcelados — Total: R$${totalEquipMensal.toFixed(0)}/mes
${equipLinhas}

## Carteira de Estabelecimentos
- Total de ECs cadastrados: ${totalClientes}
- ECs ativos: ${clientesAtivos}
- ECs em risco (churn potencial): ${clientesRisco}
- ECs com Conta Digital ativa: ${clientesContaDigital} (oportunidade em ${totalClientes - clientesContaDigital})

### Top 10 ECs por TPV
${topClientesLinhas}

## Lancamentos Manuais (extras nao na planilha)
- Receitas manuais totais: R$${receitasManuais.toFixed(0)}
- Despesas manuais totais: R$${despesasManuais.toFixed(0)}
`
}

// ─── System prompt do agente ───────────────────────────────────

const SYSTEM_PROMPT = `Voce e um Agente Financeiro Senior especializado em adquirencia e marketplaces de POS. Seu papel e analisar os dados REAIS do negocio do cliente (Comercial Bernardes) e gerar projecoes de crescimento inteligentes, especificas e acionaveis.

DIRETRIZES OBRIGATORIAS:
1. SEMPRE base suas analises nos numeros reais fornecidos no contexto. Nunca invente dados.
2. Cite valores especificos em reais (R$) ao fazer recomendacoes.
3. Considere as caracteristicas do modelo de adquirencia: margens apertadas (0.8%-2%), dependencia de TPV, importancia de retencao de ECs, oportunidades de cross-sell (Conta Digital).
4. Use frameworks: CAGR, payback period, break-even, analise de sensibilidade.
5. Para projecoes, considere o crescimento historico real dos fechamentos, NAO um numero arbitrario.
6. Cenario PESSIMISTA: 70% do crescimento base. Cenario OTIMISTA: 130% do crescimento base.
7. Seja especifico e acionavel — evite generalidades como "melhorar marketing".

FORMATO DE RESPOSTA OBRIGATORIO:
Voce DEVE responder APENAS com um bloco JSON valido, sem texto antes ou depois, sem markdown fence. O JSON deve seguir EXATAMENTE este schema:

{
  "diagnostico": {
    "saude": "CRITICA" | "ATENCAO" | "SAUDAVEL",
    "resumo": "2-3 frases sobre o estado atual do negocio",
    "principalProblema": "principal gargalo identificado",
    "principalOportunidade": "principal alavanca de crescimento"
  },
  "projecao": {
    "horizonteMeses": 12,
    "crescimentoEstimadoMensal": 5.2,
    "metodologia": "explicacao curta de como chegou neste numero (CAGR historico, premissas, etc)",
    "mensal": [
      { "mes": "Mai/26", "base": 30000, "otimista": 33000, "pessimista": 27000, "premissa": "string curta" }
    ]
  },
  "premissas": ["premissa 1", "premissa 2"],
  "oportunidades": [
    { "titulo": "string", "impactoMensal": 5000, "esforco": "BAIXO" | "MEDIO" | "ALTO", "descricao": "string" }
  ],
  "riscos": [
    { "titulo": "string", "probabilidade": "BAIXA" | "MEDIA" | "ALTA", "impactoMensal": 3000, "descricao": "string" }
  ],
  "planoAcao": [
    { "prioridade": 1, "acao": "string especifica", "prazoSemanas": 4, "impactoEsperado": "string com numero" }
  ],
  "metas": {
    "receitaMeta3m": 100000,
    "receitaMeta6m": 220000,
    "receitaMeta12m": 480000,
    "margemMeta": 1.8
  }
}

REGRAS DO JSON:
- Todos os valores numericos devem ser numbers (sem aspas, sem R$, sem %).
- O array "mensal" deve ter exatamente o mesmo numero de itens que "horizonteMeses".
- Use nomes de meses em portugues abreviado: Jan/26, Fev/26, etc.
- Calcule "metas" baseado na projecao base acumulada.
- Responda APENAS o JSON, nada mais. Nao use blocos de codigo markdown.`

// ─── Chamada a API ─────────────────────────────────────────────

export interface AgentRequest {
  contextoNegocio: string
  pergunta: string
  horizonteMeses?: number
}

export async function chamarAgenteIA(req: AgentRequest): Promise<ProjecaoIA> {
  const apiKey = getApiKey()
  if (!apiKey) {
    throw new Error('Chave da API Anthropic nao configurada. Configure em "Configurar Agente IA".')
  }

  const userMessage = `${req.contextoNegocio}

---

## Solicitacao do Usuario
${req.pergunta}

${req.horizonteMeses ? `## Horizonte de projecao
${req.horizonteMeses} meses` : ''}

Lembre-se: responda APENAS o JSON valido, sem texto adicional, sem markdown fence.`

  const response = await fetch(ANTHROPIC_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: getModel(),
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [
        { role: 'user', content: userMessage },
      ],
    }),
  })

  if (!response.ok) {
    const errText = await response.text()
    let msg = `Erro ${response.status} na API Anthropic`
    try {
      const errJson = JSON.parse(errText)
      msg = errJson?.error?.message || msg
    } catch {
      /* ignore */
    }
    throw new Error(msg)
  }

  const data = await response.json()
  const conteudo = data?.content?.[0]?.text || ''

  if (!conteudo) {
    throw new Error('Resposta vazia do agente IA.')
  }

  // Limpa markdown fences se vierem
  const limpo = conteudo
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim()

  try {
    const parsed = JSON.parse(limpo) as ProjecaoIA
    return parsed
  } catch (e) {
    console.error('[aiAgent] Falha ao parsear JSON:', limpo)
    throw new Error('A resposta do agente nao veio em formato valido. Tente novamente.')
  }
}
