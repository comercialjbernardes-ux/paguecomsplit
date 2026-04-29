// ═══════════════════════════════════════════════════════════════
// TransactionForm — Modal para adicionar/editar lancamentos
// Campos baseados nas colunas reais da planilha (Parte 1)
// Validacoes conforme regras de negocio do fluxograma
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect } from 'react'
import { X, Loader2, Save, Plus } from 'lucide-react'
import type { LancamentoCusto } from '../types'
import type { LancamentoFormData, ValidationError } from '../services/sheetsCrud'
import { validateLancamento } from '../services/sheetsCrud'
import { categoriasParaTipo } from '../constants/categorias'

interface TransactionFormProps {
  isOpen: boolean
  /** Lancamento para editar (null = criar novo) */
  editItem: LancamentoCusto | null
  /**
   * Data padrão para novos lançamentos no formato ISO (AAAA-MM-DD).
   * Quando informada, pré-preenche o campo Data com o 1º dia do período selecionado,
   * garantindo que o lançamento caia no mês correto sem o usuário precisar ajustar.
   * Se omitida, usa a data de hoje.
   */
  defaultDate?: string
  /** Contas disponiveis (lidas da planilha) */
  contas: string[]
  /** Salvando na planilha */
  isSaving: boolean
  /** Callback ao salvar */
  onSave: (data: LancamentoFormData) => void
  /** Callback ao fechar */
  onClose: () => void
}

const TODAY_ISO = new Date().toISOString().split('T')[0]

const EMPTY_FORM: LancamentoFormData = {
  data: TODAY_ISO,
  descricao: '',
  categoria: '',
  tipo: 'despesa',
  valor: 0,
  conta: '',
}

export function TransactionForm({
  isOpen,
  editItem,
  defaultDate,
  contas,
  isSaving,
  onSave,
  onClose,
}: TransactionFormProps) {
  const [form, setForm] = useState<LancamentoFormData>(EMPTY_FORM)
  const [errors, setErrors] = useState<ValidationError[]>([])

  const isEdit = editItem !== null

  // Preencher formulario ao editar ou resetar para novo lançamento.
  // EditItem.data pode ser DD/MM/AAAA (sheets) ou AAAA-MM-DD (ISO local)
  // O input type="date" exige AAAA-MM-DD, entao convertemos se necessario.
  // Para novos lançamentos, usa defaultDate (1º dia do período selecionado)
  // se fornecido, garantindo que o lançamento caia no mês correto.
  useEffect(() => {
    if (editItem) {
      const dataIso = (() => {
        const d = editItem.data || ''
        if (/^\d{4}-\d{2}-\d{2}$/.test(d)) return d  // ja e ISO
        if (/^\d{2}\/\d{2}\/\d{4}$/.test(d)) {
          const [dd, mm, yyyy] = d.split('/')
          return `${yyyy}-${mm}-${dd}`
        }
        return TODAY_ISO
      })()
      setForm({
        data: dataIso,
        descricao: editItem.descricao,
        categoria: editItem.categoria,
        tipo: editItem.tipo,
        valor: Math.abs(editItem.valor),
        conta: editItem.conta,
      })
    } else {
      setForm({ ...EMPTY_FORM, data: defaultDate ?? TODAY_ISO })
    }
    setErrors([])
  }, [editItem, isOpen, defaultDate])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const formFinal = { ...form }

    const validationErrors = validateLancamento(formFinal)
    if (validationErrors.length > 0) {
      setErrors(validationErrors)
      return
    }

    setErrors([])
    onSave(formFinal)
  }

  const getFieldError = (field: string): string | undefined => {
    return errors.find((e) => e.field === field)?.message
  }

  const updateField = <K extends keyof LancamentoFormData>(
    field: K,
    value: LancamentoFormData[K]
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => prev.filter((e) => e.field !== field))
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={!isSaving ? onClose : undefined}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            {isEdit ? (
              <>
                <Save className="w-5 h-5 text-blue-500" />
                Editar Lancamento
              </>
            ) : (
              <>
                <Plus className="w-5 h-5 text-emerald-500" />
                Novo Lancamento
              </>
            )}
          </h3>
          <button
            onClick={onClose}
            disabled={isSaving}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Data */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data *
            </label>
            <input
              type="date"
              value={form.data}
              onChange={(e) => updateField('data', e.target.value)}
              className={`input-field ${getFieldError('data') ? 'border-red-400 focus:ring-red-500' : ''}`}
            />
            {getFieldError('data') && (
              <p className="text-xs text-red-600 mt-1">{getFieldError('data')}</p>
            )}
          </div>

          {/* Descricao */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descricao *
            </label>
            <input
              type="text"
              value={form.descricao}
              onChange={(e) => updateField('descricao', e.target.value)}
              placeholder="Ex: Pagamento fornecedor X"
              className={`input-field ${getFieldError('descricao') ? 'border-red-400 focus:ring-red-500' : ''}`}
            />
            {getFieldError('descricao') && (
              <p className="text-xs text-red-600 mt-1">{getFieldError('descricao')}</p>
            )}
          </div>

          {/* Tipo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo *
            </label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => updateField('tipo', 'receita')}
                className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all border ${
                  form.tipo === 'receita'
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                    : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                }`}
              >
                Receita
              </button>
              <button
                type="button"
                onClick={() => updateField('tipo', 'despesa')}
                className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all border ${
                  form.tipo === 'despesa'
                    ? 'bg-red-50 border-red-300 text-red-700'
                    : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                }`}
              >
                Despesa
              </button>
            </div>
          </div>

          {/* Valor */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Valor (R$) *
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={form.valor || ''}
              onChange={(e) => updateField('valor', parseFloat(e.target.value) || 0)}
              placeholder="0,00"
              className={`input-field ${getFieldError('valor') ? 'border-red-400 focus:ring-red-500' : ''}`}
            />
            {getFieldError('valor') && (
              <p className="text-xs text-red-600 mt-1">{getFieldError('valor')}</p>
            )}
          </div>

          {/* Categoria — baseada no enum controlado por tipo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Categoria *
            </label>
            <select
              value={form.categoria}
              onChange={(e) => updateField('categoria', e.target.value)}
              className={`input-field ${getFieldError('categoria') ? 'border-red-400' : ''}`}
            >
              <option value="">Selecione...</option>
              {categoriasParaTipo(form.tipo).map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            {getFieldError('categoria') && (
              <p className="text-xs text-red-600 mt-1">{getFieldError('categoria')}</p>
            )}
          </div>

          {/* Conta — select se houver opcoes, input livre caso contrario */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Conta <span className="text-gray-400 font-normal">(opcional)</span>
            </label>
            {contas.length > 0 ? (
              <select
                value={form.conta}
                onChange={(e) => updateField('conta', e.target.value)}
                className="input-field"
              >
                <option value="">Selecione ou deixe em branco</option>
                {contas.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={form.conta}
                onChange={(e) => updateField('conta', e.target.value)}
                placeholder="Ex: Conta Principal, Caixa..."
                className="input-field"
              />
            )}
          </div>

          {/* Botoes */}
          <div className="flex gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="btn-outline flex-1"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="btn-primary flex-1 flex items-center justify-center gap-2"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  {isEdit ? 'Atualizar' : 'Salvar'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
