// ═══════════════════════════════════════════════════════════════
// Regras de Comissao — Parametrizacao de comissoes por produto
// Gerencia regras de comissao, bonus e faixas por produto
// ═══════════════════════════════════════════════════════════════

import { useState, useMemo, useCallback } from 'react'
import {
  DollarSign, Plus, Pencil, Trash2, Save, X,
  AlertTriangle, Check, Percent, Target,
} from 'lucide-react'

interface RegraComissao {
  id: string
  produto: string
  comissaoBase: number      // % base
  bonusMeta: number         // % bonus ao atingir meta
  metaMinima: number        // valor minimo para bonus
  faixas: FaixaComissao[]
}

interface FaixaComissao {
  de: number
  ate: number
  percentual: number
}

const STORAGE_KEY = 'venda-feita-regras-comissao'

function loadRegras(): RegraComissao[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : defaultRegras()
  } catch {
    return defaultRegras()
  }
}

function saveRegras(regras: RegraComissao[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(regras))
}

function defaultRegras(): RegraComissao[] {
  return [
    {
      id: 'POS',
      produto: 'POS Maquininha',
      comissaoBase: 1.5,
      bonusMeta: 0.5,
      metaMinima: 50000,
      faixas: [
        { de: 0, ate: 30000, percentual: 1.0 },
        { de: 30001, ate: 80000, percentual: 1.5 },
        { de: 80001, ate: 999999999, percentual: 2.0 },
      ],
    },
    {
      id: 'LINK',
      produto: 'Link de Pagamento',
      comissaoBase: 1.0,
      bonusMeta: 0.3,
      metaMinima: 20000,
      faixas: [
        { de: 0, ate: 15000, percentual: 0.8 },
        { de: 15001, ate: 50000, percentual: 1.0 },
        { de: 50001, ate: 999999999, percentual: 1.3 },
      ],
    },
    {
      id: 'CONTA',
      produto: 'Conta Digital',
      comissaoBase: 0.5,
      bonusMeta: 0.2,
      metaMinima: 10000,
      faixas: [
        { de: 0, ate: 10000, percentual: 0.3 },
        { de: 10001, ate: 30000, percentual: 0.5 },
        { de: 30001, ate: 999999999, percentual: 0.8 },
      ],
    },
  ]
}

export function RegrasComissaoPage() {
  const [regras, setRegras] = useState<RegraComissao[]>(loadRegras)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  // Formulario
  const [formProduto, setFormProduto] = useState('')
  const [formComissao, setFormComissao] = useState(0)
  const [formBonus, setFormBonus] = useState(0)
  const [formMetaMin, setFormMetaMin] = useState(0)
  const [formFaixas, setFormFaixas] = useState<FaixaComissao[]>([])

  const showFeedback = useCallback((type: 'success' | 'error', message: string) => {
    setFeedback({ type, message })
    setTimeout(() => setFeedback(null), 3000)
  }, [])

  const resetForm = () => {
    setFormProduto('')
    setFormComissao(0)
    setFormBonus(0)
    setFormMetaMin(0)
    setFormFaixas([])
    setEditingId(null)
    setIsCreating(false)
  }

  const startEdit = (regra: RegraComissao) => {
    setEditingId(regra.id)
    setFormProduto(regra.produto)
    setFormComissao(regra.comissaoBase)
    setFormBonus(regra.bonusMeta)
    setFormMetaMin(regra.metaMinima)
    setFormFaixas([...regra.faixas])
    setIsCreating(false)
  }

  const startCreate = () => {
    resetForm()
    setIsCreating(true)
    setFormFaixas([{ de: 0, ate: 50000, percentual: 1.0 }])
  }

  const handleSave = () => {
    if (!formProduto.trim()) {
      showFeedback('error', 'Nome do produto e obrigatorio')
      return
    }

    // M-10A: validar ordenação e continuidade das faixas
    if (formFaixas.length > 1) {
      for (let i = 1; i < formFaixas.length; i++) {
        if (formFaixas[i].de !== formFaixas[i - 1].ate + 1) {
          showFeedback('error', `Faixa ${i + 1}: "De" deve ser exatamente ${formFaixas[i - 1].ate + 1} (continuidade obrigatoria)`)
          return
        }
        if (formFaixas[i].de > formFaixas[i].ate) {
          showFeedback('error', `Faixa ${i + 1}: valor "Ate" deve ser maior que "De"`)
          return
        }
      }
    }

    const newRegra: RegraComissao = {
      id: editingId || `PROD_${Date.now().toString(36).toUpperCase()}`,
      produto: formProduto.trim(),
      comissaoBase: formComissao,
      bonusMeta: formBonus,
      metaMinima: formMetaMin,
      faixas: formFaixas,
    }

    let updated: RegraComissao[]
    if (editingId) {
      updated = regras.map((r) => r.id === editingId ? newRegra : r)
      showFeedback('success', 'Regra atualizada com sucesso')
    } else {
      updated = [...regras, newRegra]
      showFeedback('success', 'Nova regra criada com sucesso')
    }

    setRegras(updated)
    saveRegras(updated)
    resetForm()
  }

  const handleDelete = (id: string) => {
    const updated = regras.filter((r) => r.id !== id)
    setRegras(updated)
    saveRegras(updated)
    showFeedback('success', 'Regra removida')
  }

  const addFaixa = () => {
    const lastFaixa = formFaixas[formFaixas.length - 1]
    // M-10B: bloquear quando a ultima faixa ja e "infinita" (ate >= 999999999)
    if (lastFaixa && lastFaixa.ate >= 999999999) {
      showFeedback('error', 'A ultima faixa ja cobre todos os valores — remova o limite superior antes de adicionar outra')
      return
    }
    const newDe = lastFaixa ? lastFaixa.ate + 1 : 0
    setFormFaixas([...formFaixas, { de: newDe, ate: newDe + 50000, percentual: 1.0 }])
  }

  const removeFaixa = (index: number) => {
    setFormFaixas(formFaixas.filter((_, i) => i !== index))
  }

  const updateFaixa = (index: number, field: keyof FaixaComissao, value: number) => {
    const updated = formFaixas.map((f, i) => i === index ? { ...f, [field]: value } : f)
    setFormFaixas(updated)
  }

  // Resumo
  const resumo = useMemo(() => ({
    totalProdutos: regras.length,
    comissaoMedia: regras.length > 0
      ? regras.reduce((s, r) => s + r.comissaoBase, 0) / regras.length
      : 0,
    bonusMedio: regras.length > 0
      ? regras.reduce((s, r) => s + r.bonusMeta, 0) / regras.length
      : 0,
  }), [regras])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <DollarSign className="w-7 h-7 text-orange-500" />
            Regras de Comissao
          </h1>
          <p className="text-gray-500 mt-1">
            Gerencie as regras de comissionamento por produto
          </p>
        </div>
        {!isCreating && !editingId && (
          <button onClick={startCreate} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Nova Regra
          </button>
        )}
      </div>

      {/* Feedback */}
      {feedback && (
        <div className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium ${
          feedback.type === 'success'
            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {feedback.type === 'success' ? <Check className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
          {feedback.message}
        </div>
      )}

      {/* KPIs resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card-hover">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-5 h-5 text-orange-500" />
            <span className="text-sm text-gray-500">Produtos</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{resumo.totalProdutos}</p>
        </div>
        <div className="card-hover">
          <div className="flex items-center gap-2 mb-2">
            <Percent className="w-5 h-5 text-emerald-500" />
            <span className="text-sm text-gray-500">Comissao Media</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{resumo.comissaoMedia.toFixed(2)}%</p>
        </div>
        <div className="card-hover">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-5 h-5 text-blue-500" />
            <span className="text-sm text-gray-500">Bonus Medio</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{resumo.bonusMedio.toFixed(2)}%</p>
        </div>
      </div>

      {/* Formulario de edicao/criacao */}
      {(isCreating || editingId) && (
        <div className="card border-2 border-orange-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {isCreating ? 'Nova Regra de Comissao' : 'Editar Regra'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Produto</label>
              <input
                type="text"
                value={formProduto}
                onChange={(e) => setFormProduto(e.target.value)}
                className="input-field"
                placeholder="Ex: POS Maquininha"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Comissao Base (%)</label>
              <input
                type="number"
                value={formComissao}
                onChange={(e) => setFormComissao(Number(e.target.value))}
                className="input-field"
                step="0.1"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bonus Meta (%)</label>
              <input
                type="number"
                value={formBonus}
                onChange={(e) => setFormBonus(Number(e.target.value))}
                className="input-field"
                step="0.1"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Meta Minima (R$)</label>
              <input
                type="number"
                value={formMetaMin}
                onChange={(e) => setFormMetaMin(Number(e.target.value))}
                className="input-field"
                step="1000"
                min="0"
              />
            </div>
          </div>

          {/* Faixas de comissao */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">Faixas de Comissao</label>
              <button onClick={addFaixa} className="text-xs text-emerald-600 hover:text-emerald-800 font-medium flex items-center gap-1">
                <Plus className="w-3 h-3" />
                Adicionar faixa
              </button>
            </div>
            <div className="space-y-2">
              {formFaixas.map((faixa, i) => (
                <div key={i} className="flex items-center gap-2 bg-gray-50 p-3 rounded-lg">
                  <span className="text-xs text-gray-500 w-8">#{i + 1}</span>
                  <span className="text-xs text-gray-500">De R$</span>
                  <input
                    type="number"
                    value={faixa.de}
                    onChange={(e) => updateFaixa(i, 'de', Number(e.target.value))}
                    className="input-field w-28"
                  />
                  <span className="text-xs text-gray-500">ate R$</span>
                  <input
                    type="number"
                    value={faixa.ate}
                    onChange={(e) => updateFaixa(i, 'ate', Number(e.target.value))}
                    className="input-field w-28"
                  />
                  <span className="text-xs text-gray-500">=</span>
                  <input
                    type="number"
                    value={faixa.percentual}
                    onChange={(e) => updateFaixa(i, 'percentual', Number(e.target.value))}
                    className="input-field w-20"
                    step="0.1"
                  />
                  <span className="text-xs text-gray-500">%</span>
                  {formFaixas.length > 1 && (
                    <button onClick={() => removeFaixa(i)} className="text-red-400 hover:text-red-600 p-1">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Acoes */}
          <div className="flex justify-end gap-3">
            <button onClick={resetForm} className="btn-outline flex items-center gap-2">
              <X className="w-4 h-4" />
              Cancelar
            </button>
            <button onClick={handleSave} className="btn-primary flex items-center gap-2">
              <Save className="w-4 h-4" />
              {editingId ? 'Atualizar' : 'Criar Regra'}
            </button>
          </div>
        </div>
      )}

      {/* Lista de regras */}
      <div className="space-y-4">
        {regras.map((regra) => (
          <div key={regra.id} className="card-hover">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{regra.produto}</h3>
                <p className="text-sm text-gray-400">ID: {regra.id}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => startEdit(regra)}
                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(regra.id)}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="bg-emerald-50 p-3 rounded-lg text-center">
                <p className="text-xs text-emerald-600 font-medium">Comissao Base</p>
                <p className="text-lg font-bold text-emerald-700">{regra.comissaoBase}%</p>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg text-center">
                <p className="text-xs text-blue-600 font-medium">Bonus Meta</p>
                <p className="text-lg font-bold text-blue-700">+{regra.bonusMeta}%</p>
              </div>
              <div className="bg-orange-50 p-3 rounded-lg text-center">
                <p className="text-xs text-orange-600 font-medium">Meta Minima</p>
                <p className="text-lg font-bold text-orange-700">R$ {regra.metaMinima.toLocaleString('pt-BR')}</p>
              </div>
            </div>

            {/* Faixas */}
            {regra.faixas.length > 0 && (
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase mb-2">Faixas progressivas</p>
                <div className="flex gap-2 flex-wrap">
                  {regra.faixas.map((f, i) => (
                    <div key={i} className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs">
                      <span className="text-gray-500">
                        R$ {f.de.toLocaleString('pt-BR')} — R$ {f.ate >= 999999999 ? '∞' : f.ate.toLocaleString('pt-BR')}
                      </span>
                      <span className="ml-2 font-bold text-emerald-700">{f.percentual}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {regras.length === 0 && (
        <div className="card text-center py-12">
          <DollarSign className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-500">Nenhuma regra cadastrada</h3>
          <p className="text-sm text-gray-400 mt-1">Clique em "Nova Regra" para comecar.</p>
        </div>
      )}
    </div>
  )
}
