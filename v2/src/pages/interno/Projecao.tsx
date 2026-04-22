// ═══════════════════════════════════════════════════════════════
// Projecao de Crescimento — Agente IA Financeiro
// Powered by Anthropic Claude. Gera projecoes inteligentes
// baseadas nos dados reais do negocio (BYO API key).
// ═══════════════════════════════════════════════════════════════

import { useState, useMemo, useCallback } from 'react'
import {
  Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, Area, ComposedChart,
} from 'recharts'
import {
  Sparkles, KeyRound, Send, Loader2, AlertTriangle,
  TrendingUp, Target, Lightbulb, ShieldAlert, CheckCircle2,
  Eye, EyeOff, Trash2, RefreshCw, Brain, ArrowRight,
} from 'lucide-react'
import { useInternoData } from '../../hooks/useInternoData'
import { useDataContext } from '../../contexts/dataContextValue'
import { LoadingState } from '../../components/LoadingState'
import { formatCurrency, formatCurrencyShort } from '../../utils/format'
import {
  getApiKey, setApiKey, clearApiKey, getModel, setModel,
  buildBusinessContext, chamarAgenteIA,
  type ProjecaoIA,
} from '../../services/aiAgent'

// Sugestoes pre-definidas
const QUICK_PROMPTS = [
  {
    id: 'analise_completa',
    titulo: 'Analise Completa',
    descricao: 'Diagnostico + projecao 12m + pontos criticos + oportunidades + plano de acao',
    icone: <Brain className="w-4 h-4" />,
    prompt: 'Realize a analise completa de projecao de crescimento. Quero as 5 dimensoes: (1) diagnostico atual do negocio com indicadores abaixo do esperado, (2) projecao para 3, 6 e 12 meses nos cenarios conservador, moderado e otimista com base no historico real, (3) pontos criticos que limitam meu crescimento hoje — vazamentos financeiros e gargalo principal, (4) oportunidades estrategicas com maior retorno potencial e menor investimento, (5) plano de acao priorizado de 3 a 5 acoes concretas com evidencia dos dados e impacto financeiro estimado em R$.',
    horizonte: 12,
  },
  {
    id: 'plano6m',
    titulo: 'Plano Agressivo 6 meses',
    descricao: 'Como acelerar o markup em 6 meses — quais alavancas usar',
    icone: <Target className="w-4 h-4" />,
    prompt: 'Quero crescer agressivamente nos proximos 6 meses. Analise meus dados e me diga: quais sao as 3-5 alavancas concretas para acelerar o crescimento? Quanto cada uma pode adicionar de markup mensal? Qual o esforco/risco de cada uma? Cite os numeros do meu historico que justificam cada alavanca.',
    horizonte: 6,
  },
  {
    id: 'breakeven',
    titulo: 'Analise de Break-even',
    descricao: 'Qual TPV minimo para cobrir todos os custos?',
    icone: <ShieldAlert className="w-4 h-4" />,
    prompt: 'Faca uma analise de break-even completa. Qual o TPV minimo mensal necessario para cobrir TODOS os custos operacionais (incluindo equipamentos parcelados)? Quanto cada EC adicional precisa contribuir? Quando vou atingir esse break-even na trajetoria atual? Identifique os principais vazamentos financeiros que aumentam o ponto de equilibrio.',
    horizonte: 12,
  },
  {
    id: 'oportunidades',
    titulo: 'Oportunidades Ocultas',
    descricao: 'Cross-sell, upsell, ECs subutilizados e alavancas de maior retorno',
    icone: <Lightbulb className="w-4 h-4" />,
    prompt: 'Analise minha carteira de ECs e identifique oportunidades ocultas com maior retorno e menor investimento: ECs sem Conta Digital, ECs com queda de TPV, ECs em risco de churn, oportunidades de upsell. Quantifique o impacto potencial de cada acao em receita mensal e priorize por esforco x retorno.',
    horizonte: 6,
  },
] as const

const HISTORY_KEY = 'vdf_ai_historico'
const MAX_HISTORY = 5

interface AnaliseSalva {
  id: string
  pergunta: string
  resultado: ProjecaoIA
  data: string
}

export function InternoProjecao() {
  const { fechamentos, clientes, lancamentos, isLoading } = useInternoData()
  const { custos, equipamentos } = useDataContext()

  // Estado da configuracao
  const [apiKeyState, setApiKeyState] = useState<string>(() => getApiKey() || '')
  const [showKey, setShowKey] = useState(false)
  const [showConfig, setShowConfig] = useState<boolean>(() => !getApiKey())
  const [modelState, setModelState] = useState<string>(() => getModel())

  // Estado da conversa
  const [perguntaCustom, setPerguntaCustom] = useState('')
  const [horizonteCustom, setHorizonteCustom] = useState(12)
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [resultado, setResultado] = useState<ProjecaoIA | null>(null)
  const [perguntaAtual, setPerguntaAtual] = useState<string>('')

  // Historico de analises (localStorage)
  const [historico, setHistorico] = useState<AnaliseSalva[]>(() => {
    try {
      const raw = localStorage.getItem(HISTORY_KEY)
      return raw ? JSON.parse(raw) : []
    } catch {
      return []
    }
  })

  // Snapshot dos dados para o agente
  const businessContext = useMemo(() => {
    return buildBusinessContext({
      fechamentos,
      custos,
      equipamentos,
      clientes,
      lancamentos,
    })
  }, [fechamentos, custos, equipamentos, clientes, lancamentos])

  // Salvar API key
  const handleSaveKey = () => {
    if (!apiKeyState.trim()) return
    setApiKey(apiKeyState.trim())
    setModel(modelState)
    setShowConfig(false)
    setErro(null)
  }

  const handleClearKey = () => {
    if (!confirm('Remover chave da API? Voce precisara configurar novamente.')) return
    clearApiKey()
    setApiKeyState('')
    setShowConfig(true)
  }

  // Chamar agente
  const executar = useCallback(async (pergunta: string, horizonte: number) => {
    if (!getApiKey()) {
      setShowConfig(true)
      setErro('Configure sua chave da API Anthropic antes de continuar.')
      return
    }
    if (fechamentos.length === 0) {
      setErro('Nenhum fechamento disponivel. Adicione planilhas ao Benchmark Anual nas Configuracoes.')
      return
    }

    setLoading(true)
    setErro(null)
    setPerguntaAtual(pergunta)

    try {
      const proj = await chamarAgenteIA({
        contextoNegocio: businessContext,
        pergunta,
        horizonteMeses: horizonte,
      })
      setResultado(proj)

      // Salva no historico
      const nova: AnaliseSalva = {
        id: Date.now().toString(),
        pergunta,
        resultado: proj,
        data: new Date().toLocaleString('pt-BR'),
      }
      const updated = [nova, ...historico].slice(0, MAX_HISTORY)
      setHistorico(updated)
      localStorage.setItem(HISTORY_KEY, JSON.stringify(updated))
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Erro desconhecido'
      setErro(msg)
    } finally {
      setLoading(false)
    }
  }, [businessContext, fechamentos.length, historico])

  const handleQuickPrompt = (qp: typeof QUICK_PROMPTS[number]) => {
    executar(qp.prompt, qp.horizonte)
  }

  const handleCustomSubmit = () => {
    if (!perguntaCustom.trim()) return
    executar(perguntaCustom.trim(), horizonteCustom)
  }

  const carregarHistorico = (h: AnaliseSalva) => {
    setResultado(h.resultado)
    setPerguntaAtual(h.pergunta)
    setErro(null)
  }

  const removerHistorico = (id: string) => {
    const updated = historico.filter((h) => h.id !== id)
    setHistorico(updated)
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated))
  }

  // Dados do grafico de projecao
  const graficoDados = useMemo(() => {
    if (!resultado) return []
    const historicos = fechamentos.slice(-6).map((f) => ({
      mes: f.periodo,
      realizado: f.markupPos,
      base: null as number | null,
      otimista: null as number | null,
      pessimista: null as number | null,
    }))
    const projetados = resultado.projecao.mensal.map((m) => ({
      mes: m.mes,
      realizado: null as number | null,
      base: m.base,
      otimista: m.otimista,
      pessimista: m.pessimista,
    }))
    return [...historicos, ...projetados]
  }, [resultado, fechamentos])

  if (isLoading) return <LoadingState message="Carregando dados..." />

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <div className="relative">
              <Brain className="w-7 h-7 text-purple-500" />
              <Sparkles className="w-3.5 h-3.5 text-amber-400 absolute -top-1 -right-1" />
            </div>
            Projecao Inteligente de Crescimento
          </h1>
          <p className="text-gray-500 mt-1">
            Agente IA financeiro especializado — analisa seus dados e gera projecoes acionaveis
          </p>
        </div>
        <button
          onClick={() => setShowConfig(!showConfig)}
          className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
        >
          <KeyRound className="w-4 h-4" />
          {getApiKey() ? 'Configuracao' : 'Configurar Agente'}
        </button>
      </div>

      {/* Configuracao do Agente */}
      {showConfig && (
        <div className="card border-2 border-purple-100 bg-gradient-to-br from-purple-50/40 to-blue-50/40">
          <div className="flex items-center gap-2 mb-3">
            <KeyRound className="w-5 h-5 text-purple-600" />
            <h3 className="text-lg font-semibold text-gray-900">Configurar Agente IA</h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Esta funcionalidade usa a API da Anthropic (Claude). Sua chave fica armazenada apenas
            no seu navegador (localStorage) e nunca e enviada para nossos servidores. Obtenha uma chave em{' '}
            <a
              href="https://console.anthropic.com/settings/keys"
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-600 underline hover:text-purple-800"
            >
              console.anthropic.com
            </a>
            .
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Chave da API Anthropic
              </label>
              <div className="relative">
                <input
                  type={showKey ? 'text' : 'password'}
                  value={apiKeyState}
                  onChange={(e) => setApiKeyState(e.target.value)}
                  placeholder="sk-ant-api03-..."
                  className="input-field pr-10 font-mono text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Modelo (opcional)
              </label>
              <select
                value={modelState}
                onChange={(e) => setModelState(e.target.value)}
                className="input-field"
              >
                <option value="claude-sonnet-4-5">Claude Sonnet 4.5 (recomendado)</option>
                <option value="claude-opus-4-5">Claude Opus 4.5 (mais profundo, mais caro)</option>
                <option value="claude-haiku-4-5">Claude Haiku 4.5 (mais rapido)</option>
              </select>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={handleSaveKey}
                disabled={!apiKeyState.trim()}
                className="btn-primary flex items-center gap-2 disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                Salvar Configuracao
              </button>
              {getApiKey() && (
                <button
                  onClick={handleClearKey}
                  className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Remover Chave
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Quick Prompts */}
      {!loading && (
        <div>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Analises Rapidas
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {QUICK_PROMPTS.map((qp) => (
              <button
                key={qp.id}
                onClick={() => handleQuickPrompt(qp)}
                disabled={loading || !getApiKey()}
                className="text-left p-4 bg-white border border-gray-200 rounded-xl hover:border-purple-300 hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 rounded-lg bg-purple-50 text-purple-600 group-hover:bg-purple-100">
                    {qp.icone}
                  </div>
                  <h3 className="text-sm font-semibold text-gray-900">{qp.titulo}</h3>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">{qp.descricao}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Pergunta customizada */}
      {!loading && (
        <div className="card">
          <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-500" />
            Pergunta Personalizada
          </h3>
          <div className="space-y-3">
            <textarea
              value={perguntaCustom}
              onChange={(e) => setPerguntaCustom(e.target.value)}
              placeholder="Ex: Qual o impacto de adicionar 10 ECs novos por mes? Como otimizar a margem para 1.8%? Vale a pena investir R$ 50k em maquinas?"
              rows={3}
              className="input-field resize-none"
            />
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <label className="text-xs text-gray-500">Horizonte:</label>
                <select
                  value={horizonteCustom}
                  onChange={(e) => setHorizonteCustom(Number(e.target.value))}
                  className="text-sm border border-gray-200 rounded-lg px-2 py-1 bg-white"
                >
                  <option value={3}>3 meses</option>
                  <option value={6}>6 meses</option>
                  <option value={12}>12 meses</option>
                  <option value={24}>24 meses</option>
                </select>
              </div>
              <button
                onClick={handleCustomSubmit}
                disabled={!perguntaCustom.trim() || !getApiKey()}
                className="btn-primary flex items-center gap-2 disabled:opacity-50 ml-auto"
              >
                <Send className="w-4 h-4" />
                Consultar Agente
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Erro */}
      {erro && (
        <div className="card border border-red-200 bg-red-50">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-red-900">Erro ao consultar agente</h4>
              <p className="text-sm text-red-700 mt-1">{erro}</p>
            </div>
            <button
              onClick={() => setErro(null)}
              className="text-red-400 hover:text-red-600"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="card text-center py-12">
          <Loader2 className="w-10 h-10 text-purple-500 animate-spin mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-900">Agente analisando seus dados...</h3>
          <p className="text-sm text-gray-500 mt-1">
            Pode levar 10-30 segundos. Estou cruzando fechamentos, custos e carteira.
          </p>
        </div>
      )}

      {/* Resultado da analise */}
      {resultado && !loading && (
        <div className="space-y-6">
          {/* Pergunta */}
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-100 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-purple-600 uppercase tracking-wide">Sua pergunta</p>
                <p className="text-sm text-gray-700 mt-1">{perguntaAtual}</p>
              </div>
            </div>
          </div>

          {/* Diagnostico */}
          <DiagnosticoCard diag={resultado.diagnostico} />

          {/* Pontos Criticos de Melhoria */}
          {resultado.pontoscriticos && (
            <PontoscriticosCard dados={resultado.pontoscriticos} />
          )}

          {/* Grafico de projecao */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Projecao de Markup POS</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Crescimento estimado: <strong className="text-purple-600">{resultado.projecao.crescimentoEstimadoMensal.toFixed(2)}%/mes</strong>
                  {' · '}
                  Horizonte: <strong>{resultado.projecao.horizonteMeses} meses</strong>
                </p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={320}>
              <ComposedChart data={graficoDados}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="mes" tick={{ fontSize: 10 }} />
                <YAxis tickFormatter={(v: number) => formatCurrencyShort(v)} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(value) => value !== null ? formatCurrency(Number(value)) : '—'} />
                <Legend />
                <Area
                  type="monotone" dataKey="otimista" name="Otimista"
                  stroke="#10b981" fill="#10b981" fillOpacity={0.1} strokeWidth={1}
                  connectNulls={false}
                />
                <Area
                  type="monotone" dataKey="pessimista" name="Conservador"
                  stroke="#ef4444" fill="#ef4444" fillOpacity={0.1} strokeWidth={1}
                  connectNulls={false}
                />
                <Line
                  type="monotone" dataKey="realizado" name="Realizado"
                  stroke="#0D1B2A" strokeWidth={2.5} dot={{ r: 4 }}
                  connectNulls={false}
                />
                <Line
                  type="monotone" dataKey="base" name="Moderado"
                  stroke="#8b5cf6" strokeWidth={2.5} strokeDasharray="5 5" dot={{ r: 3 }}
                  connectNulls={false}
                />
              </ComposedChart>
            </ResponsiveContainer>

            {/* Metodologia */}
            <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-100">
              <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Metodologia</p>
              <p className="text-sm text-gray-700">{resultado.projecao.metodologia}</p>
            </div>
          </div>

          {/* Metas */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <MetaCard label="Meta 3 meses" valor={resultado.metas.receitaMeta3m} cor="blue" />
            <MetaCard label="Meta 6 meses" valor={resultado.metas.receitaMeta6m} cor="purple" />
            <MetaCard label="Meta 12 meses" valor={resultado.metas.receitaMeta12m} cor="emerald" />
            <MetaCard label="Margem alvo" valor={resultado.metas.margemMeta} cor="amber" isPct />
          </div>

          {/* Premissas */}
          {resultado.premissas.length > 0 && (
            <div className="card">
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-500" />
                Premissas da Analise
              </h3>
              <ul className="space-y-2">
                {resultado.premissas.map((p, i) => (
                  <li key={i} className="text-sm text-gray-600 flex gap-2">
                    <span className="text-blue-400">•</span>
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Oportunidades */}
          {resultado.oportunidades.length > 0 && (
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-amber-500" />
                Oportunidades Identificadas
              </h3>
              <div className="space-y-3">
                {resultado.oportunidades.map((o, i) => (
                  <div key={i} className="border border-emerald-100 bg-emerald-50/40 rounded-lg p-3">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <h4 className="text-sm font-semibold text-gray-900">{o.titulo}</h4>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-xs font-bold text-emerald-700">
                          + {formatCurrency(o.impactoMensal)}/mes
                        </span>
                        <EsforcoBadge nivel={o.esforco} />
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed">{o.descricao}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Riscos */}
          {resultado.riscos.length > 0 && (
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-red-500" />
                Riscos Mapeados
              </h3>
              <div className="space-y-3">
                {resultado.riscos.map((r, i) => (
                  <div key={i} className="border border-red-100 bg-red-50/40 rounded-lg p-3">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <h4 className="text-sm font-semibold text-gray-900">{r.titulo}</h4>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-xs font-bold text-red-700">
                          - {formatCurrency(r.impactoMensal)}/mes
                        </span>
                        <ProbabilidadeBadge nivel={r.probabilidade} />
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed">{r.descricao}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Plano de Acao */}
          {resultado.planoAcao.length > 0 && (
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-purple-500" />
                Plano de Acao Priorizado
              </h3>
              <div className="space-y-3">
                {resultado.planoAcao
                  .sort((a, b) => a.prioridade - b.prioridade)
                  .map((acao) => (
                    <div key={acao.prioridade} className="flex items-start gap-3 p-3 border border-purple-100 bg-purple-50/30 rounded-lg">
                      <div className="flex-shrink-0 w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                        {acao.prioridade}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-900">{acao.acao}</p>
                        {acao.evidencia && (
                          <p className="text-xs text-blue-700 mt-1 italic">
                            📊 {acao.evidencia}
                          </p>
                        )}
                        <div className="flex items-center gap-3 mt-1.5">
                          <span className="text-xs text-purple-700 font-medium flex items-center gap-1">
                            <ArrowRight className="w-3 h-3" />
                            {acao.impactoEsperado}
                          </span>
                          <span className="text-xs text-gray-500">
                            Prazo: {acao.prazoSemanas} {acao.prazoSemanas === 1 ? 'semana' : 'semanas'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Botao nova analise */}
          <div className="flex justify-center">
            <button
              onClick={() => {
                setResultado(null)
                setPerguntaAtual('')
                setPerguntaCustom('')
              }}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Nova Analise
            </button>
          </div>
        </div>
      )}

      {/* Historico */}
      {!loading && historico.length > 0 && (
        <div className="card">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Analises Recentes</h3>
          <div className="space-y-2">
            {historico.map((h) => (
              <div
                key={h.id}
                className="flex items-start gap-3 p-3 border border-gray-100 hover:border-purple-200 hover:bg-purple-50/20 rounded-lg cursor-pointer transition-colors group"
                onClick={() => carregarHistorico(h)}
              >
                <Sparkles className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-700 truncate">{h.pergunta}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{h.data}</p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    removerHistorico(h.id)
                  }}
                  className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Estado vazio */}
      {!resultado && !loading && !erro && fechamentos.length === 0 && (
        <div className="card text-center py-12">
          <Brain className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-500">Sem dados para analisar</h3>
          <p className="text-sm text-gray-400 mt-1">
            Adicione planilhas mensais no Benchmark Anual (Configuracoes) para o agente comecar.
          </p>
        </div>
      )}
    </div>
  )
}

// ─── Componentes auxiliares ────────────────────────────────────

function PontoscriticosCard({ dados }: { dados: ProjecaoIA['pontoscriticos'] }) {
  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <AlertTriangle className="w-5 h-5 text-orange-500" />
        Pontos Criticos de Melhoria
      </h3>

      {/* Gargalo Principal */}
      <div className="bg-orange-50 border border-orange-100 rounded-lg p-3 mb-4">
        <p className="text-xs font-semibold text-orange-600 uppercase tracking-wide mb-1">Gargalo Principal</p>
        <p className="text-sm text-gray-800">{dados.gargaloPrincipal}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Vazamentos Financeiros */}
        {dados.vazamentos.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Vazamentos Financeiros</p>
            <div className="space-y-1">
              {dados.vazamentos.map((v, i) => (
                <div key={i} className="flex items-start justify-between gap-2 py-2 border-b border-gray-50 last:border-0">
                  <span className="text-sm text-gray-700 flex-1">{v.descricao}</span>
                  <span className="text-sm font-bold text-red-700 flex-shrink-0 whitespace-nowrap">
                    - {formatCurrency(v.valorEstimado)}/mes
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Categorias com Maior Potencial */}
        {dados.categorias.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Maior Potencial Inexplorado</p>
            <div className="space-y-2">
              {dados.categorias.map((c, i) => (
                <div key={i} className="border border-amber-100 bg-amber-50/40 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-semibold text-gray-900">{c.nome}</span>
                    <span className="text-sm font-bold text-amber-700">+ {formatCurrency(c.potencialMensal)}/mes</span>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">{c.descricao}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function DiagnosticoCard({ diag }: { diag: ProjecaoIA['diagnostico'] }) {
  const config = {
    CRITICA: { bg: 'bg-red-50 border-red-200', text: 'text-red-900', badge: 'bg-red-500', label: 'CRITICA' },
    ATENCAO: { bg: 'bg-amber-50 border-amber-200', text: 'text-amber-900', badge: 'bg-amber-500', label: 'ATENCAO' },
    SAUDAVEL: { bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-900', badge: 'bg-emerald-500', label: 'SAUDAVEL' },
  }[diag.saude]

  return (
    <div className={`border-2 rounded-xl p-5 ${config.bg}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className={`text-lg font-bold ${config.text}`}>Diagnostico do Negocio</h3>
        <span className={`px-3 py-1 rounded-full text-white text-xs font-bold ${config.badge}`}>
          {config.label}
        </span>
      </div>
      <p className={`text-sm leading-relaxed mb-4 ${config.text}`}>{diag.resumo}</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="bg-white/70 rounded-lg p-3 border border-white">
          <p className="text-xs font-semibold text-red-600 uppercase tracking-wide mb-1">Principal Problema</p>
          <p className="text-sm text-gray-700">{diag.principalProblema}</p>
        </div>
        <div className="bg-white/70 rounded-lg p-3 border border-white">
          <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wide mb-1">Principal Oportunidade</p>
          <p className="text-sm text-gray-700">{diag.principalOportunidade}</p>
        </div>
      </div>
    </div>
  )
}

function MetaCard({ label, valor, cor, isPct }: {
  label: string; valor: number; cor: 'blue' | 'purple' | 'emerald' | 'amber'; isPct?: boolean
}) {
  const colorMap = {
    blue: 'text-blue-700 bg-blue-50 border-blue-100',
    purple: 'text-purple-700 bg-purple-50 border-purple-100',
    emerald: 'text-emerald-700 bg-emerald-50 border-emerald-100',
    amber: 'text-amber-700 bg-amber-50 border-amber-100',
  }
  return (
    <div className={`border rounded-xl p-4 ${colorMap[cor]}`}>
      <p className="text-xs font-semibold uppercase tracking-wide opacity-80">{label}</p>
      <p className="text-xl font-bold mt-1">
        {isPct ? `${valor.toFixed(2)}%` : formatCurrency(valor)}
      </p>
    </div>
  )
}

function EsforcoBadge({ nivel }: { nivel: 'BAIXO' | 'MEDIO' | 'ALTO' }) {
  const map = {
    BAIXO: 'bg-emerald-100 text-emerald-700',
    MEDIO: 'bg-amber-100 text-amber-700',
    ALTO: 'bg-red-100 text-red-700',
  }
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded ${map[nivel]}`}>
      {nivel}
    </span>
  )
}

function ProbabilidadeBadge({ nivel }: { nivel: 'BAIXA' | 'MEDIA' | 'ALTA' }) {
  const map = {
    BAIXA: 'bg-emerald-100 text-emerald-700',
    MEDIA: 'bg-amber-100 text-amber-700',
    ALTA: 'bg-red-100 text-red-700',
  }
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded ${map[nivel]}`}>
      {nivel}
    </span>
  )
}
