// ═══════════════════════════════════════════════════════════════
// Projecao de Crescimento — Modulo Interno
// Planejamento e simulador de cenarios de investimento
// Correcoes: crescimento continuo (sem reset em 36m) + modo manual
// ═══════════════════════════════════════════════════════════════

import { useState, useMemo, useCallback } from 'react'
import {
  Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, Area, AreaChart,
} from 'recharts'
import { TrendingUp, Sliders, Save, Trash2, Plus, Database, PenLine } from 'lucide-react'
import { useInternoData } from '../../hooks/useInternoData'
import { LoadingState } from '../../components/LoadingState'
import { formatCurrency, formatCurrencyShort, formatPercent } from '../../utils/format'
import { getScalar, setScalar } from '../../services/localStorageService'
import type { CenarioSalvo } from '../../types'

const STORAGE_KEY = 'vendafeita_cenarios'

export function InternoProjecao() {
  const { fechamentos, fechamentoAtual, isLoading } = useInternoData()

  // Simulador
  const [crescimento, setCrescimento] = useState(10) // % crescimento mensal
  const [meses, setMeses] = useState(12)
  const [investimento, setInvestimento] = useState(0)

  // Modo: 'sheets' usa ultimo fechamento, 'manual' usa valor digitado
  const [modo, setModo] = useState<'sheets' | 'manual'>('sheets')
  const [baseManual, setBaseManual] = useState<number>(
    () => getScalar<number>('vdf_projecao_base') || 0,
  )

  // Cenarios salvos (localStorage)
  const [cenarios, setCenarios] = useState<CenarioSalvo[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  // Base para projecao: modo manual usa valor digitado, modo sheets usa markupPos
  const baseValue = modo === 'manual'
    ? (baseManual || fechamentoAtual?.markupPos || 30000)
    : (fechamentoAtual?.markupPos || fechamentoAtual?.valorLiquido || 30000)

  const basePeriodo = fechamentoAtual?.periodo || 'ultimo fechamento'

  // Salva base manual no localStorage ao alterar
  const handleBaseManualChange = (v: number) => {
    setBaseManual(v)
    setScalar('vdf_projecao_base', v)
  }

  // Projecao calculada — crescimento continuo (nao resetar em 36m)
  const dadosProjecao = useMemo(() => {
    const mesesNomes = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']
    const result = []

    // Dados historicos dos fechamentos
    for (const f of fechamentos) {
      result.push({
        mes: f.periodo,
        realizado: f.markupPos || f.valorLiquido,
        projetado: null as number | null,
        otimista: null as number | null,
        pessimista: null as number | null,
      })
    }

    // Projecao futura — crescimento composto continuo
    for (let i = 0; i < meses; i++) {
      // Math.pow: aplica crescimento composto a partir do mes 1
      // Cada mes aplica a taxa sobre o mes anterior (sem reset)
      const fator = Math.pow(1 + crescimento / 100, i + 1)
      const valorProjetado = baseValue * fator + (investimento / meses)

      // Nome do mes: continua a sequencia do calendario real
      const mesAbs = result.length + i  // posicao absoluta no tempo
      const mesIndex = mesAbs % 12
      const label = mesesNomes[mesIndex] || `M${mesAbs + 1}`

      result.push({
        mes: label,
        realizado: null,
        projetado: valorProjetado,
        otimista: valorProjetado * 1.15,
        pessimista: valorProjetado * 0.85,
      })
    }

    return result
  }, [fechamentos, baseValue, crescimento, meses, investimento])

  // Total projetado
  const totalProjetado = useMemo(() => {
    return dadosProjecao
      .filter((d) => d.projetado !== null)
      .reduce((s, d) => s + (d.projetado || 0), 0)
  }, [dadosProjecao])

  // Salvar cenario
  const salvarCenario = useCallback(() => {
    const nome = prompt('Nome do cenario:')
    if (!nome) return
    const novo: CenarioSalvo = {
      id: Date.now().toString(),
      nome,
      crescimento,
      investimento,
      data: new Date().toLocaleDateString('pt-BR'),
    }
    const updated = [...cenarios, novo]
    setCenarios(updated)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  }, [cenarios, crescimento, investimento])

  // Remover cenario
  const removerCenario = useCallback((id: string) => {
    const updated = cenarios.filter((c) => c.id !== id)
    setCenarios(updated)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  }, [cenarios])

  // Carregar cenario
  const carregarCenario = useCallback((c: CenarioSalvo) => {
    setCrescimento(c.crescimento)
    setInvestimento(c.investimento)
  }, [])

  if (isLoading) return <LoadingState message="Carregando projecoes..." />

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <TrendingUp className="w-7 h-7 text-blue-500" />
          Projecao de Crescimento
        </h1>
        <p className="text-gray-500 mt-1">Planejamento e simulador de cenarios de investimento</p>
      </div>

      {/* Toggle modo base */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-gray-700">Base da projecao:</span>
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setModo('sheets')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
              modo === 'sheets' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            Planilha
          </button>
          <button
            onClick={() => setModo('manual')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
              modo === 'manual' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <PenLine className="w-3.5 h-3.5" />
            Manual
          </button>
        </div>
        {modo === 'manual' && (
          <input
            type="number"
            value={baseManual || ''}
            onChange={(e) => handleBaseManualChange(Number(e.target.value))}
            placeholder="Faturamento atual (R$)"
            className="input-field w-56"
            min={0}
            step={1000}
          />
        )}
      </div>

      {/* KPIs de projecao */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card-hover">
          <p className="text-sm text-gray-500">
            Markup POS Base {modo === 'manual' ? '(manual)' : `— ${basePeriodo}`}
          </p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(baseValue)}</p>
          <p className="text-xs text-gray-400 mt-1">
            {modo === 'manual' ? 'Valor inserido manualmente' : 'Receita principal do ultimo fechamento'}
          </p>
        </div>
        <div className="card-hover">
          <p className="text-sm text-gray-500">Total Projetado ({meses} meses)</p>
          <p className="text-2xl font-bold text-emerald-700 mt-1">{formatCurrency(totalProjetado)}</p>
          <p className="text-xs text-gray-400 mt-1">Crescimento de {formatPercent(crescimento)}/mes</p>
        </div>
        <div className="card-hover">
          <p className="text-sm text-gray-500">Valor Projetado Final</p>
          <p className="text-2xl font-bold text-blue-700 mt-1">
            {formatCurrency(dadosProjecao[dadosProjecao.length - 1]?.projetado || 0)}
          </p>
          <p className="text-xs text-gray-400 mt-1">Mes {meses} (crescimento composto)</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Simulador */}
        <div className="card space-y-6">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Sliders className="w-5 h-5 text-gray-400" />
            Simulador
          </h3>

          {/* Crescimento mensal */}
          <div>
            <div className="flex justify-between text-sm mb-2">
              <label className="font-medium text-gray-700">Crescimento mensal</label>
              <span className="text-emerald-600 font-semibold">{formatPercent(crescimento)}</span>
            </div>
            <input
              type="range" min={-10} max={50} step={0.5}
              value={crescimento}
              onChange={(e) => setCrescimento(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>-10%</span><span>50%</span>
            </div>
          </div>

          {/* Meses */}
          <div>
            <div className="flex justify-between text-sm mb-2">
              <label className="font-medium text-gray-700">Horizonte</label>
              <span className="text-blue-600 font-semibold">{meses} meses</span>
            </div>
            <input
              type="range" min={3} max={36} step={1}
              value={meses}
              onChange={(e) => setMeses(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>3m</span><span>36m</span>
            </div>
          </div>

          {/* Investimento */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Investimento total (R$)
            </label>
            <input
              type="number" min={0} step={1000}
              value={investimento}
              onChange={(e) => setInvestimento(Number(e.target.value))}
              className="input-field"
              placeholder="0"
            />
          </div>

          {/* Botao salvar */}
          <button onClick={salvarCenario} className="btn-primary w-full flex items-center justify-center gap-2">
            <Save className="w-4 h-4" />
            Salvar Cenario
          </button>
        </div>

        {/* Grafico de projecao */}
        <div className="card lg:col-span-2">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Projecao de Crescimento</h3>
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={dadosProjecao}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="mes" tick={{ fontSize: 10 }} />
              <YAxis tickFormatter={(v: number) => formatCurrencyShort(v)} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(value) => value !== null ? formatCurrency(Number(value)) : '—'} />
              <Legend />
              <Area
                type="monotone" dataKey="otimista" name="Otimista"
                stroke="transparent" fill="#00C896" fillOpacity={0.1}
              />
              <Area
                type="monotone" dataKey="pessimista" name="Pessimista"
                stroke="transparent" fill="#EF4444" fillOpacity={0.1}
              />
              <Line
                type="monotone" dataKey="realizado" name="Realizado"
                stroke="#0D1B2A" strokeWidth={2} dot={{ r: 4 }}
                connectNulls={false}
              />
              <Line
                type="monotone" dataKey="projetado" name="Projetado"
                stroke="#00C896" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 3 }}
                connectNulls={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Cenarios salvos */}
      {cenarios.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5 text-gray-400" />
            Cenarios Salvos
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {cenarios.map((c) => (
              <div key={c.id} className="bg-gray-50 rounded-xl p-4 flex items-start justify-between">
                <div
                  className="cursor-pointer flex-1"
                  onClick={() => carregarCenario(c)}
                >
                  <p className="font-medium text-gray-900">{c.nome}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Cresc. {formatPercent(c.crescimento)}/mes
                    {c.investimento > 0 && ` · Invest. ${formatCurrency(c.investimento)}`}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">{c.data}</p>
                </div>
                <button
                  onClick={() => removerCenario(c.id)}
                  className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
