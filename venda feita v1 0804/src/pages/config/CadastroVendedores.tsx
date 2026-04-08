// ═══════════════════════════════════════════════════════════════
// Cadastro de Vendedores — CRUD de vendedores via Google Sheets
// Gerencia vendedores, regioes, metas e comissoes
// ═══════════════════════════════════════════════════════════════

import { useState, useMemo, useCallback } from 'react'
import {
  Users, Plus, Pencil, Trash2, Save, X,
  Search, MapPin, Target, AlertTriangle, Check,
  Loader2,
} from 'lucide-react'
import { useSheetsData } from '../../contexts/SheetsContext'
import { useEquipeData } from '../../hooks/useEquipeData'
import { appendRows, updateRange, deleteRows, getSpreadsheetMetadata } from '../../services/sheetsApi'
import { SHEET_TABS } from '../../config/sheets'
import { formatCurrency, formatPercent } from '../../utils/format'
import type { Vendedor, SheetTab } from '../../types'

interface VendedorForm {
  nome: string
  regiao: string
  metaMensal: number
  metaAcumulada: number
  comissaoBase: number
  bonus: number
}

const emptyForm: VendedorForm = {
  nome: '',
  regiao: '',
  metaMensal: 0,
  metaAcumulada: 0,
  comissaoBase: 0,
  bonus: 0,
}

export function CadastroVendedoresPage() {
  const { vendedores, regioes } = useEquipeData()
  const { currentSheetId, refetch } = useSheetsData()
  const [busca, setBusca] = useState('')
  const [filtroRegiao, setFiltroRegiao] = useState('todas')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [form, setForm] = useState<VendedorForm>(emptyForm)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const showFeedback = useCallback((type: 'success' | 'error', message: string) => {
    setFeedback({ type, message })
    setTimeout(() => setFeedback(null), 3000)
  }, [])

  // Filtrar vendedores
  const filtrados = useMemo(() => {
    return vendedores.filter((v) => {
      if (busca && !v.nome.toLowerCase().includes(busca.toLowerCase())) return false
      if (filtroRegiao !== 'todas' && v.regiao !== filtroRegiao) return false
      return true
    })
  }, [vendedores, busca, filtroRegiao])

  // Resumo
  const resumo = useMemo(() => ({
    total: vendedores.length,
    totalRegioes: regioes.length,
    metaMedia: vendedores.length > 0
      ? vendedores.reduce((s, v) => s + v.metaMensal, 0) / vendedores.length
      : 0,
  }), [vendedores, regioes])

  const resetForm = () => {
    setForm(emptyForm)
    setEditingId(null)
    setIsCreating(false)
  }

  const startEdit = (v: Vendedor) => {
    setEditingId(v.id)
    setForm({
      nome: v.nome,
      regiao: v.regiao,
      metaMensal: v.metaMensal,
      metaAcumulada: v.metaAcumulada,
      comissaoBase: v.comissaoBase,
      bonus: v.bonus,
    })
    setIsCreating(false)
  }

  const startCreate = () => {
    resetForm()
    setIsCreating(true)
  }

  const handleSave = async () => {
    if (!form.nome.trim()) {
      showFeedback('error', 'Nome do vendedor e obrigatorio')
      return
    }
    if (!form.regiao.trim()) {
      showFeedback('error', 'Regiao e obrigatoria')
      return
    }

    setIsLoading(true)
    try {
      if (isCreating) {
        // Adicionar novo vendedor
        const newId = vendedores.length > 0
          ? Math.max(...vendedores.map((v) => v.id)) + 1
          : 1
        const row = [
          newId,
          form.nome.trim(),
          form.regiao.trim(),
          form.metaMensal,
          form.metaAcumulada,
          form.comissaoBase,
          form.bonus,
        ]
        await appendRows(`'${SHEET_TABS.VENDEDORES}'!A:G`, [row], currentSheetId)
        showFeedback('success', `Vendedor "${form.nome}" adicionado com sucesso`)
      } else if (editingId !== null) {
        // Encontrar o vendedor para obter a linha na planilha
        const vendedor = vendedores.find((v) => v.id === editingId)
        if (!vendedor?._sheetRow) {
          showFeedback('error', 'Vendedor sem referencia de linha na planilha')
          setIsLoading(false)
          return
        }
        const row = [
          vendedor.id,
          form.nome.trim(),
          form.regiao.trim(),
          form.metaMensal,
          form.metaAcumulada,
          form.comissaoBase,
          form.bonus,
        ]
        await updateRange(
          `'${SHEET_TABS.VENDEDORES}'!A${vendedor._sheetRow}:G${vendedor._sheetRow}`,
          [row],
          currentSheetId
        )
        showFeedback('success', `Vendedor "${form.nome}" atualizado com sucesso`)
      }

      await refetch()
      resetForm()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro desconhecido'
      showFeedback('error', `Erro ao salvar: ${msg}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (vendedor: Vendedor) => {
    if (!vendedor._sheetRow) {
      showFeedback('error', 'Vendedor sem referencia de linha na planilha')
      return
    }

    if (!confirm(`Tem certeza que deseja excluir "${vendedor.nome}"?`)) return

    setIsLoading(true)
    try {
      // Buscar sheetId da aba Vendedores
      const metadata = await getSpreadsheetMetadata(currentSheetId)
      const tab = metadata.sheets.find(
        (s: SheetTab) => s.title.toLowerCase() === SHEET_TABS.VENDEDORES.toLowerCase()
      )
      if (!tab) throw new Error('Aba Vendedores nao encontrada')

      await deleteRows(tab.sheetId, vendedor._sheetRow - 1, vendedor._sheetRow, currentSheetId)
      await refetch()
      showFeedback('success', `Vendedor "${vendedor.nome}" removido`)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro desconhecido'
      showFeedback('error', `Erro ao excluir: ${msg}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <Users className="w-7 h-7 text-orange-500" />
            Cadastro de Vendedores
          </h1>
          <p className="text-gray-500 mt-1">
            Gerencie a equipe de vendas — dados salvos diretamente na planilha
          </p>
        </div>
        {!isCreating && editingId === null && (
          <button onClick={startCreate} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Novo Vendedor
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

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card-hover">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-5 h-5 text-blue-500" />
            <span className="text-sm text-gray-500">Total Vendedores</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{resumo.total}</p>
        </div>
        <div className="card-hover">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="w-5 h-5 text-emerald-500" />
            <span className="text-sm text-gray-500">Regioes</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{resumo.totalRegioes}</p>
        </div>
        <div className="card-hover">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-5 h-5 text-orange-500" />
            <span className="text-sm text-gray-500">Meta Media</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(resumo.metaMedia)}</p>
        </div>
      </div>

      {/* Formulario */}
      {(isCreating || editingId !== null) && (
        <div className="card border-2 border-orange-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {isCreating ? 'Novo Vendedor' : 'Editar Vendedor'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
              <input
                type="text"
                value={form.nome}
                onChange={(e) => setForm({ ...form, nome: e.target.value })}
                className="input-field"
                placeholder="Nome completo"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Regiao *</label>
              <input
                type="text"
                value={form.regiao}
                onChange={(e) => setForm({ ...form, regiao: e.target.value })}
                className="input-field"
                placeholder="Ex: Sudeste, Sul..."
                list="regioes-list"
              />
              <datalist id="regioes-list">
                {regioes.map((r) => <option key={r} value={r} />)}
              </datalist>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Meta Mensal (R$)</label>
              <input
                type="number"
                value={form.metaMensal}
                onChange={(e) => setForm({ ...form, metaMensal: Number(e.target.value) })}
                className="input-field"
                step="1000"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Meta Acumulada (R$)</label>
              <input
                type="number"
                value={form.metaAcumulada}
                onChange={(e) => setForm({ ...form, metaAcumulada: Number(e.target.value) })}
                className="input-field"
                step="1000"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Comissao Base (%)</label>
              <input
                type="number"
                value={form.comissaoBase}
                onChange={(e) => setForm({ ...form, comissaoBase: Number(e.target.value) })}
                className="input-field"
                step="0.1"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bonus (%)</label>
              <input
                type="number"
                value={form.bonus}
                onChange={(e) => setForm({ ...form, bonus: Number(e.target.value) })}
                className="input-field"
                step="0.1"
                min="0"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button onClick={resetForm} className="btn-outline flex items-center gap-2" disabled={isLoading}>
              <X className="w-4 h-4" />
              Cancelar
            </button>
            <button onClick={handleSave} className="btn-primary flex items-center gap-2" disabled={isLoading}>
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {editingId !== null ? 'Atualizar' : 'Cadastrar'}
            </button>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="card">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar vendedor..."
              className="input-field pl-10"
            />
          </div>
          <select
            value={filtroRegiao}
            onChange={(e) => setFiltroRegiao(e.target.value)}
            className="input-field w-auto"
          >
            <option value="todas">Todas regioes</option>
            {regioes.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
      </div>

      {/* Tabela */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Vendedores ({filtrados.length})
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-3 font-medium text-gray-500">ID</th>
                <th className="text-left py-3 px-3 font-medium text-gray-500">Nome</th>
                <th className="text-left py-3 px-3 font-medium text-gray-500">Regiao</th>
                <th className="text-right py-3 px-3 font-medium text-gray-500">Meta Mensal</th>
                <th className="text-right py-3 px-3 font-medium text-gray-500">Comissao</th>
                <th className="text-right py-3 px-3 font-medium text-gray-500">Bonus</th>
                <th className="text-center py-3 px-3 font-medium text-gray-500">Acoes</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-gray-400">
                    Nenhum vendedor encontrado
                  </td>
                </tr>
              ) : (
                filtrados.map((v) => (
                  <tr key={v.id} className="border-b border-gray-50 hover:bg-gray-50 group">
                    <td className="py-3 px-3 text-gray-400">{v.id}</td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold">
                          {v.avatar}
                        </div>
                        <span className="font-medium text-gray-900">{v.nome}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-gray-500">{v.regiao}</td>
                    <td className="py-3 px-3 text-right">{formatCurrency(v.metaMensal)}</td>
                    <td className="py-3 px-3 text-right">{formatPercent(v.comissaoBase)}</td>
                    <td className="py-3 px-3 text-right">{formatPercent(v.bonus)}</td>
                    <td className="py-3 px-3">
                      <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => startEdit(v)}
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(v)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Excluir"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
