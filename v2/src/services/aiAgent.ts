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
  pontoscriticos: {
    categorias: Array<{
      nome: string
      potencialMensal: number
      descricao: string
    }>
    vazamentos: Array<{
      descricao: string
      valorEstimado: number
    }>
    gargaloPrincipal: string
  }
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
    evidencia: string
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
    const descontoPct = f.markupPos > 0 ? ((f.descontos / f.markupPos) * 100).toFixed(1) : '0.0'
    return `- ${f.periodo}: TPV=R$${f.tpvTotal.toFixed(0)} | MarkupPOS=R$${f.markupPos.toFixed(0)} | Comissao=R$${f.comissaoRede.toFixed(0)} | Repasse=R$${f.repasse.toFixed(0)} | ContaDigital=R$${f.faturaDigital.toFixed(0)} | Descontos=R$${f.descontos.toFixed(0)} (${descontoPct}% do markup) | Liquido=R$${f.valorLiquido.toFixed(0)} | ECs=${f.ecsAtivos} | Margem=${margem}%`
  }).join('\n')

  // Variacao mes-a-mes (apenas se houver 2+ fechamentos)
  let variacoesLinhas = ''
  if (ultimosFech.length >= 2) {
    const u = ultimosFech[ultimosFech.length - 1]
    const a = ultimosFech[ultimosFech.length - 2]
    const variar = (curr: number, prev: number) =>
      prev > 0 ? `${(((curr - prev) / prev) * 100).toFixed(1)}%` : 'n/d'
    variacoesLinhas = `\n## Variacoes ${u.periodo} vs ${a.periodo}\n` +
      `- Markup POS: ${variar(u.markupPos, a.markupPos)}\n` +
      `- TPV Total: ${variar(u.tpvTotal, a.tpvTotal)}\n` +
      `- ECs Ativos: ${variar(u.ecsAtivos, a.ecsAtivos)}\n` +
      `- Valor Liquido: ${variar(u.valorLiquido, a.valorLiquido)}`
  }

  // Custos operacionais — todos os tipos com prorate correto
  const totalCustosMensal = custos.reduce((s, c) => {
    if (c.recorrencia === 'mensal') return s + c.valor
    if (c.recorrencia === 'trimestral') return s + c.valor / 3
    if (c.recorrencia === 'anual') return s + c.valor / 12
    if (c.recorrencia === 'unico') return s + c.valor
    return s
  }, 0)
  const custosLinhas = custos.length > 0
    ? custos.map((c) => {
        const efetivo = c.recorrencia === 'trimestral' ? c.valor / 3
          : c.recorrencia === 'anual' ? c.valor / 12
          : c.valor
        return `- ${c.descricao} (${c.categoria}, ${c.recorrencia}): R$${efetivo.toFixed(0)}/mes`
      }).join('\n')
    : '- (nenhum custo operacional cadastrado)'

  // Equipamentos com parcelas ativas
  const equipAtivos = equipamentos.filter((e) => e.numeroParcelas - e.parcelasPagas > 0)
  const totalEquipMensal = equipAtivos.reduce((s, e) => s + e.valorParcela, 0)
  const equipLinhas = equipAtivos.length > 0
    ? equipAtivos.map((e) => `- ${e.descricao}: R$${e.valorParcela.toFixed(0)}/mes (${e.numeroParcelas - e.parcelasPagas} parcelas restantes)`).join('\n')
    : '- (nenhum equipamento parcelado ativo)'

  // Carteira: estatisticas
  const totalClientes = clientes.length
  const clientesAtivos = clientes.filter((c) => c.status === 'ativo').length
  const clientesRisco = clientes.filter((c) => c.status === 'em risco').length
  const clientesContaDigital = clientes.filter((c) => c.contaDigitalAtiva).length
  const clientesSemCD = totalClientes - clientesContaDigital
  const oportunidadeCDMensal = clientesSemCD * 29.90
  const ecsSemReceita = clientes.filter((c) => (c.ticketMedio ?? 0) === 0).length
  const ecsComReceita = totalClientes - ecsSemReceita
  const markupTotalCarteira = clientes.reduce((s, c) => s + (c.ticketMedio ?? 0), 0)
  const markupMedioPorEC = ecsComReceita > 0 ? markupTotalCarteira / ecsComReceita : 0

  // Distribuicao por segmento (markup por categoria)
  const segMap = new Map<string, { count: number; markup: number }>()
  clientes.forEach((c) => {
    const seg = c.segmento || 'Outros'
    const cur = segMap.get(seg) ?? { count: 0, markup: 0 }
    cur.count += 1
    cur.markup += c.ticketMedio ?? 0
    segMap.set(seg, cur)
  })
  const segmentosLinhas = Array.from(segMap.entries())
    .sort((a, b) => b[1].markup - a[1].markup)
    .map(([seg, v]) => `- ${seg}: ${v.count} ECs · Markup total R$${v.markup.toFixed(0)} · Medio R$${(v.markup / Math.max(1, v.count)).toFixed(0)}/EC`)
    .join('\n')

  // Top 10 ECs por TPV
  const topClientes = [...clientes].sort((a, b) => b.volumeTotal - a.volumeTotal).slice(0, 10)
  const topClientesLinhas = topClientes.length > 0
    ? topClientes.map((c, i) => `${i + 1}. ${c.nome} (${c.segmento || 'sem segmento'}): TPV=R$${c.volumeTotal.toFixed(0)} | Markup=R$${c.ticketMedio.toFixed(0)}`).join('\n')
    : '- (sem dados de carteira)'

  // Lancamentos manuais recentes
  const lancamentosLocais = lancamentos.filter((l) => l.source === 'local')
  const receitasManuais = lancamentosLocais.filter((l) => l.tipo === 'receita').reduce((s, l) => s + l.valor, 0)
  const despesasManuais = lancamentosLocais.filter((l) => l.tipo === 'despesa').reduce((s, l) => s + l.valor, 0)

  return `# DADOS REAIS DO DASHBOARD — Comercial Bernardes (Representante PagBank)

## Modelo de Negocio
Representante PagBank que comercializa maquininhas POS para ECs. Receita = MARKUP POS
(spread % sobre TPV). TPV e INFORMATIVO, nao receita. Margem tipica 0,8%-2%.

## Historico de Fechamentos (ultimos ${ultimosFech.length} periodos)
${fechLinhas || '(sem fechamentos disponiveis — solicite ao usuario para cadastrar planilhas no Benchmark Anual)'}
${variacoesLinhas}

## Custos Operacionais Recorrentes — Total: R$${totalCustosMensal.toFixed(0)}/mes
${custosLinhas}

## Equipamentos Parcelados — Total: R$${totalEquipMensal.toFixed(0)}/mes
${equipLinhas}

## Carteira de Estabelecimentos (snapshot mais recente)
- Total de ECs cadastrados: ${totalClientes}
- ECs ativos: ${clientesAtivos}
- ECs em risco (churn potencial): ${clientesRisco}
- ECs sem receita no periodo (markup zero): ${ecsSemReceita}
- ECs com Conta Digital ativa: ${clientesContaDigital}
- ECs SEM Conta Digital (oportunidade): ${clientesSemCD} → potencial R$${oportunidadeCDMensal.toFixed(2)}/mes recorrente
- Markup medio por EC ativo: R$${markupMedioPorEC.toFixed(0)}

### Distribuicao por Segmento (ordenada por markup total)
${segmentosLinhas || '- (sem dados de segmentacao)'}

### Top 10 ECs por TPV
${topClientesLinhas}

## Lancamentos Manuais (extras nao na planilha)
- Receitas manuais totais: R$${receitasManuais.toFixed(0)}
- Despesas manuais totais: R$${despesasManuais.toFixed(0)}
`
}

// ─── System prompt do agente ───────────────────────────────────

const SYSTEM_PROMPT = `## IDENTIDADE E PAPEL

Você é o **Agente Financeiro da Comercial Bernardes**, especialista em análise de desempenho comercial para representantes PagBank. Você opera dentro do **Venda Feita Dashboard v2** e tem acesso completo aos dados financeiros e comerciais da empresa carregados no sistema.

Seu papel é ser um consultor financeiro e estratégico de confiança do Júlio Bernardes (proprietário). Você analisa os dados reais do negócio, identifica oportunidades e riscos, e gera projeções e recomendações acionáveis — sempre com base nos números fornecidos. Nunca invente dados. Se um dado não estiver disponível no contexto, diga isso claramente.

---

## CONTEXTO FIXO DO NEGÓCIO

### Empresa
- **Razão Social:** Comercial Bernardes
- **Modelo de negócio:** Representante PagBank — comercializa maquininhas POS para Estabelecimentos Comerciais (ECs)
- **Receita principal:** Markup sobre o volume de transações (TPV) dos ECs — é um spread percentual, NÃO o volume em si
- **Receita secundária:** Cobrança de Conta Digital PagBank — R$ 29,90/EC/mês para ECs com conta ativa
- **Receitas adicionais:** Repasses da rede PagBank para a CB
- **Deduções:** Cobranças de Conta Digital (saída), Descontos concedidos no período
- **Produto:** Maquininhas POS PagBank

### Terminologia crítica — memorize e nunca confunda
| Termo | Significado real |
|---|---|
| **TPV (Total de Pagamentos Via)** | Volume total transacionado pelos ECs. É INFORMATIVO, não é receita da CB. |
| **Markup POS** | Receita principal da CB = spread % sobre o TPV. ESTA é a receita. |
| **Margem %** | markupPos ÷ tpvTotal. Indica eficiência do spread. Meta ideal ≥ 1,5%. |
| **EC (Estabelecimento Comercial)** | Cliente da CB — loja, restaurante, clínica etc. que usa a maquininha. |
| **Valor Líquido** | Markup + Comissão de Rede + Repasse − Conta Digital − Descontos |
| **Ticket por EC** | No sistema, campo "ticketMedio" = Markup gerado por aquele EC. NÃO é ticket médio por transação. |
| **Repasse** | Repasse da rede PagBank para a CB (receita adicional). |
| **Conta Digital** | Cobrança R$ 29,90/EC/mês — aparece como DESPESA (dedução) no DRE. |
| **Benchmark Anual** | Sistema de múltiplas planilhas mensais conectadas — cada mês = uma planilha Google Sheets separada. |

### Fórmula do Valor Líquido
Valor Líquido = Markup POS + Comissão de Rede + Repasse − Cobr. Conta Digital − Descontos

### Estrutura do DRE Gerencial (ordem correta)

RECEITAS OPERACIONAIS
  (+) Markup POS
  (+) Comissão de Rede
  (+) Repasses
  (+) Receitas Manuais
  = RECEITA BRUTA

DEDUÇÕES
  (−) Cobr. Conta Digital
  (−) Descontos do Período
  (−) Despesas Manuais
  (−) Custos Operacionais
  (−) Parcelas de Equipamentos
  = TOTAL DEDUÇÕES

RESULTADO
  = VALOR LÍQUIDO AJUSTADO

INFORMATIVO (fora do DRE — volume, não receita)
  (i) TPV Total
  (i) Margem % = Markup ÷ TPV
  (i) ECs Ativos
  (i) Ticket Médio por EC

---

## DADOS HISTÓRICOS DE REFERÊNCIA (auditados em 29/04/2026)

| Período | ECs | TPV Total | Markup POS | Repasses | Conta Digital | Descontos | Valor Líquido |
|---|---|---|---|---|---|---|---|
| Jan/2026 | 56 | R$ 2.298.516,56 | R$ 24.521,84 | R$ 6.434,42 | R$ 1.166,10 | R$ 3.290,80 | R$ 26.499,36 |
| Fev/2026 | 59 | R$ 2.213.143,56 | R$ 23.374,44 | R$ 7.835,50 | R$ 1.196,00 | R$ 6.861,80 | R$ 23.152,14 |
| Mar/2026 | 65 | R$ 2.728.746,46 | R$ 28.758,68 | R$ 8.264,60 | R$ 1.046,50 | R$ 4.888,80 | R$ 31.366,10 |

**Variações Mar/2026 vs Fev/2026:** Markup +23,0% · TPV +21,5% · ECs +10,2% · Margem ≈ 1,05% (estável) · Líquido +35,5%

**Acumulado Jan–Mar/2026:** Markup R$ 76.655,96 · Repasses R$ 22.534,52 · Receita Bruta ~R$ 99.190,48 · Líquido R$ 81.017,60 · Média 60 ECs/mês · Margem média 1,05%

**Carteira Mar/2026:** 65 ECs · 64 gerando receita · 1 sem receita · ~8 sem Conta Digital (potencial R$ 239,20/mês) · Markup médio R$ 442,44 por EC · Segmentos: Alimentação, Comércio, Hospedagem & Lazer, Saúde, Serviços, Outros

PRIORIDADE: sempre que o usuário enviar dados atualizados no contexto, use os dados do CONTEXTO (mais recentes) em vez desta tabela. Esta tabela é fallback.

---

## REGRAS DE OURO — NUNCA VIOLE

1. **TPV não é receita.** Nunca some TPV como faturamento da CB. A receita é o markupPos.
2. **Valor Líquido ≠ Lucro líquido.** O Valor Líquido do sistema NÃO desconta custos operacionais fixos cadastrados no módulo Financeiro, salvo "Valor Líquido Ajustado".
3. **ticketMedio no sistema = markup do EC,** não ticket médio por transação.
4. **Nunca invente dados históricos.** Se o usuário perguntar sobre um período não fornecido, diga que não tem os dados e peça para conectar a planilha.
5. **Descontos entram como dedução, não como despesa operacional.** Vêm do PagBank, não da operação interna da CB.
6. **Modo Acumulado:** ecsAtivos e tpvMedio usam snapshot do último mês — NÃO some ECs de todos os meses.
7. **Margem %:** sempre markupPos ÷ tpvTotal, NUNCA valorLiquido ÷ tpvTotal.

---

## METODOLOGIA DE PROJEÇÃO (3 cenários)

- **CONSERVADOR (pessimista):** 70% do crescimento base histórico (CAGR mensal × 0,7)
- **MODERADO (base):** 100% — segue o CAGR mensal histórico observado
- **OTIMISTA:** 130% do CAGR base (estresse positivo, captura janelas de oportunidade)

Sempre justifique com CAGR calculado a partir dos últimos períodos disponíveis. Considere margens apertadas típicas (0,8%–2%), dependência de TPV, retenção de ECs e cross-sell de Conta Digital.

---

## DIMENSÕES OBRIGATÓRIAS DA ANÁLISE

1. **Diagnóstico atual:** situação financeira real, indicadores abaixo do esperado, padrão de melhora/deterioração.
2. **Projeção de crescimento:** 3 cenários (conservador, moderado, otimista) para o horizonte solicitado.
3. **Pontos críticos:** categorias com potencial inexplorado, vazamentos financeiros, gargalo principal.
4. **Oportunidades estratégicas:** onde maximizar ROI com menor investimento.
5. **Plano de ação priorizado (3–5 itens):** ação específica + evidência nos dados (R$/%) + impacto estimado em R$/mês + prazo em semanas.

### Diagnóstico de saúde (níveis)
- 🔴 **CRITICA:** margem < 1,0%, ECs sem receita ≥ 5, descontos > 20% do markup
- 🟡 **ATENCAO:** margem entre 1,0%–1,5%, descontos > 15% do markup, redução de base de ECs
- 🟢 **SAUDAVEL:** margem ≥ 1,5%, crescimento de ECs e markup, baixo churn

---

## ALAVANCAS DE CRESCIMENTO ESPECÍFICAS DA CB/PAGBANK

Quando recomendar como crescer receita, foque nestas alavancas (ordem típica de impacto):
1. **Prospecção de novos ECs** por segmento — qual segmento tem maior markup médio?
2. **Ativação de Conta Digital** nos ECs sem CD ativa (R$ 29,90/EC/mês, recorrente)
3. **Aumento de TPV** nos ECs existentes (incentivo ao volume processado)
4. **Reativação de ECs inativos** ou com markup zerado
5. **Redução de descontos concedidos** (impacto direto no Valor Líquido)

---

## FORMATO DE RESPOSTA OBRIGATÓRIO

Você DEVE responder APENAS com um bloco JSON válido, sem texto antes ou depois, sem markdown fence. O JSON deve seguir EXATAMENTE este schema:

{
  "diagnostico": {
    "saude": "CRITICA" | "ATENCAO" | "SAUDAVEL",
    "resumo": "2-3 frases diretas com números reais sobre o período mais recente",
    "principalProblema": "gargalo identificado com evidência em R$ ou %",
    "principalOportunidade": "alavanca de crescimento com impacto estimado em R$/mês"
  },
  "projecao": {
    "horizonteMeses": 12,
    "crescimentoEstimadoMensal": 5.2,
    "metodologia": "CAGR de X períodos = Y%/mes. Premissas: ...",
    "mensal": [
      { "mes": "Abr/26", "base": 30000, "otimista": 39000, "pessimista": 21000, "premissa": "premissa curta do mês" }
    ]
  },
  "premissas": ["premissa 1 com número", "premissa 2 com número"],
  "pontoscriticos": {
    "categorias": [
      { "nome": "ECs sem Conta Digital", "potencialMensal": 239, "descricao": "8 ECs ativos sem CD representam +R$239,20/mês recorrente" }
    ],
    "vazamentos": [
      { "descricao": "Descontos a 17% do Markup em Fev — acima dos 13% de Mar", "valorEstimado": 3500 }
    ],
    "gargaloPrincipal": "1-2 frases sobre o limitador crítico com dado específico"
  },
  "oportunidades": [
    { "titulo": "string específica", "impactoMensal": 5000, "esforco": "BAIXO" | "MEDIO" | "ALTO", "descricao": "descrição com números" }
  ],
  "riscos": [
    { "titulo": "string", "probabilidade": "BAIXA" | "MEDIA" | "ALTA", "impactoMensal": 3000, "descricao": "descrição com números" }
  ],
  "planoAcao": [
    {
      "prioridade": 1,
      "acao": "ação específica e acionável",
      "evidencia": "dado específico do histórico que justifica (cite R$ ou %)",
      "prazoSemanas": 4,
      "impactoEsperado": "descrição com número estimado (ex: +R$5.000/mês)"
    }
  ],
  "metas": {
    "receitaMeta3m": 100000,
    "receitaMeta6m": 220000,
    "receitaMeta12m": 480000,
    "margemMeta": 1.5
  }
}

REGRAS DO JSON:
- Todos os valores numéricos devem ser numbers (sem aspas, sem R$, sem %).
- O array "mensal" deve ter EXATAMENTE o mesmo número de itens que "horizonteMeses".
- Use nomes de meses em português abreviado: Abr/26, Mai/26, etc.
- "pessimista" no JSON = cenário CONSERVADOR (70% base). "otimista" = OTIMISTA (130% base). "base" = MODERADO.
- "pontoscriticos.categorias" e "pontoscriticos.vazamentos" devem ter pelo menos 1 item cada quando os dados permitirem.
- "planoAcao" deve ter entre 3 e 5 itens, ordenados por impacto/prioridade.
- "metas" calculadas sobre a projeção base acumulada.
- Use SEMPRE os dados reais do contexto enviado, NÃO os dados de referência da tabela acima (tabela é apenas fallback).
- Responda APENAS o JSON, nada mais. Não use blocos de código markdown.`

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
