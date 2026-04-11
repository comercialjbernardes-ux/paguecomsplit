// ═══════════════════════════════════════════════════════════════
// Transacoes — Gestao de Lancamentos (CRUD)
// Conforme fluxograma: tabela completa + add/edit/delete
// Grava diretamente na planilha Google Sheets via API
// ═══════════════════════════════════════════════════════════════

import { useState, useMemo, useCallback } from 'react'
import {
  Receipt, Plus, Search, Filter, Edit3, Trash2,
  ArrowUpRight, ArrowDownRight, RefreshCw, ChevronLeft, ChevronRight,
} from 'lucide-react'
import { useInternoData } from '../../hooks/useInternoData'
import { useDataContext } from '../../contexts/DataContext'
import { TransactionForm } from '../../components/TransactionForm'
import { DeleteConfirmDialog } from '../../components/DeleteConfirmDialog'
import { LoadingState } from '../../components/LoadingState'
import { ErrorBanner } from '../../components/ErrorBanner'
import type { LancamentoFormData } from '../../services/sheetsCrud'
import { formatCurrency } from '../../utils/format'
import type { LancamentoCusto } from '../../types'

const PAGE_SIZE = 15

export function InternoTransacoes() {
  const { lancamentos, categorias, contas, isLoading, error } = useInternoData()
  const { refetch, saveLancamento, deleteLancamento } = useDataContext()

  // Estado do CRUD
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editItem, setEditItem] = useState<LancamentoCusto | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [deleteItem, setDeleteItem] = useState<LancamentoCusto | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  // Filtros
  const [busca, setBusca] = useState('')
  const [filtroCategoria, setFiltroCategoria] = useState('todas')
  const [filtroTipo, setFiltroTipo] = useState<'todos' | 'receita' | 'despesa'>('todos')
  const [filtroConta, setFiltroConta] = useState('todas')
  const [pagina, setPagina] = useState(1)

  // Lancamentos filtrados
  const filtrados = useMemo(() => {
    return lancamentos.filter((l) => {
      if (filtroCategoria !== 'todas' && l.categoria !== filtroCategoria) return false
      if (filtroConta !== 'todas' && l.conta !== filtroConta) return false
      if (filtroTipo !== 'todos' && l.tipo !== filtroTipo) return false
      if (busca && !l.descricao.toLowerCase().includes(busca.toLowerCase())
          && !l.categoria.toLowerCase().includes(busca.toLowerCase())) return false
      return true
    })
  }, [lancamentos, filtroCategoria, filtroConta, filtroTipo, busca])

  // Paginacao
  const totalPages = Math.max(1, Math.ceil(filtrados.length / PAGE_SIZE))
  const paginados = useMemo(() => {
    const start = (pagina - 1) * PAGE_SIZE
    return filtrados.slice(start, start + PAGE_SIZE)
  }, [filtrados, pagina])

  // Totais
  const totais = useMemo(() => {
    const receitas = filtrados.filter((l) => l.tipo === 'receita').reduce((s, l) => s + l.valor, 0)
    const despesas = filtrados.filter((l) => l.tipo === 'despesa').reduce((s, l) => s + Math.abs(l.valor), 0)
    return { receitas, despesas, saldo: receitas - despesas }
  }, [filtrados])

  // Limpar feedback apos 4 segundos
  const showFeedback = useCallback((type: 'success' | 'error', message: string) => {
    setFeedback({ type, message })
    setTimeout(() => setFeedback(null), 4000)
  }, [])

  // ─── Handlers CRUD ──────────────────────────────────────────

  const handleOpenNew = () => {
    setEditItem(null)
    setIsFormOpen(true)
  }

  const handleOpenEdit = (item: LancamentoCusto) => {
    setEditItem(item)
    setIsFormOpen(true)
  }

  const handleOpenDelete = (item: LancamentoCusto) => {
    setDeleteItem(item)
    setIsDeleteOpen(true)
  }

  const handleSave = (data: LancamentoFormData) => {
    setIsSaving(true)
    try {
      if (editItem) {
        // Atualiza lancamento local preservando id e source originais
        saveLancamento({ ...editItem, ...data, source: 'local' })
        showFeedback('success', `Lancamento "${data.descricao}" atualizado`)
      } else {
        // Novo lancamento local com ID unico
        const novo: LancamentoCusto = {
          id: `L${Date.now().toString(36).toUpperCase()}`,
          ...data,
          conta: data.conta || 'Geral',
          source: 'local',
        }
        saveLancamento(novo)
        showFeedback('success', `Lancamento "${data.descricao}" criado`)
      }
      setIsFormOpen(false)
      setEditItem(null)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao salvar'
      showFeedback('error', msg)
    } finally {
      setIsSaving(false)
    }
  }

  const handleConfirmDelete = () => {
    if (!deleteItem) return
    setIsDeleting(true)
    try {
      // Apenas lançamentos locais podem ser excluidos
      if (deleteItem.source === 'sheets') {
        showFeedback('error', 'Lancamentos da planilha nao podem ser excluidos aqui')
        setIsDeleteOpen(false)
        setDeleteItem(null)
        return
      }
      deleteLancamento(deleteItem.id)
      showFeedback('success', `Lancamento "${deleteItem.descricao}" excluido`)
      setIsDeleteOpen(false)
      setDeleteItem(null)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao excluir'
      showFeedback('error', msg)
    } finally {
      setIsDeleting(false)
    }
  }

  if (isLoading) return <LoadingState message="Carregando lancamentos..." />

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <Receipt className="w-7 h-7 text-blue-500" />
            Gestao de Lancamentos
          </h1>
          <p className="text-gray-500 mt-1">
            Adicionar, editar e excluir lancamentos na planilha
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => refetch()}
            className="btn-outline flex items-center gap-2"
            title="Recarregar dados"
          >
            <RefreshCw className="w-4 h-4" />
            Sincronizar
          </button>
          <button
            onClick={handleOpenNew}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Novo Lancamento
          </button>
        </div>
      </div>

      {/* Feedback */}
      {feedback && (
        <div className={`rounded-xl p-4 text-sm font-medium ${
          feedback.type === 'success'
            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {feedback.message}
        </div>
      )}

      {error && <ErrorBanner message={error} onRetry={refetch} />}

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card-hover">
          <p className="text-sm text-gray-500">Total Lancamentos</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{filtrados.length}</p>
        </div>
        <div className="card-hover">
          <div className="flex items-center gap-2 mb-1">
            <ArrowUpRight className="w-4 h-4 text-emerald-500" />
            <span className="text-sm text-gray-500">Receitas</span>
          </div>
          <p className="text-2xl font-bold text-emerald-700">{formatCurrency(totais.receitas)}</p>
        </div>
        <div className="card-hover">
          <div className="flex items-center gap-2 mb-1">
            <ArrowDownRight className="w-4 h-4 text-red-500" />
            <span className="text-sm text-gray-500">Despesas</span>
          </div>
          <p className="text-2xl font-bold text-red-700">{formatCurrency(totais.despesas)}</p>
        </div>
        <div className="card-hover">
          <p className="text-sm text-gray-500">Saldo</p>
          <p className={`text-2xl font-bold ${totais.saldo >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
            {formatCurrency(totais.saldo)}
          </p>
        </div>
      </div>

      {/* Filtros */}
      <div className="card">
        <div className="flex flex-wrap gap-3 items-center">
          <Filter className="w-4 h-4 text-gray-400" />
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={busca}
              onChange={(e) => { setBusca(e.target.value); setPagina(1) }}
              placeholder="Buscar por descricao ou categoria..."
              className="input-field pl-10"
            />
          </div>
          <select
            value={filtroCategoria}
            onChange={(e) => { setFiltroCategoria(e.target.value); setPagina(1) }}
            className="input-field w-auto"
          >
            <option value="todas">Todas categorias</option>
            {categorias.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select
            value={filtroConta}
            onChange={(e) => { setFiltroConta(e.target.value); setPagina(1) }}
            className="input-field w-auto"
          >
            <option value="todas">Todas contas</option>
            {contas.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select
            value={filtroTipo}
            onChange={(e) => { setFiltroTipo(e.target.value as 'todos' | 'receita' | 'despesa'); setPagina(1) }}
            className="input-field w-auto"
          >
            <option value="todos">Todos tipos</option>
            <option value="receita">Receitas</option>
            <option value="despesa">Despesas</option>
          </select>
        </div>
      </div>

      {/* Tabela */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-3 font-medium text-gray-500">Data</th>
                <th className="text-left py-3 px-3 font-medium text-gray-500">Descricao</th>
                <th className="text-left py-3 px-3 font-medium text-gray-500">Categoria</th>
                <th className="text-left py-3 px-3 font-medium text-gray-500">Conta</th>
                <th className="text-left py-3 px-3 font-medium text-gray-500">Tipo</th>
                <th className="text-right py-3 px-3 font-medium text-gray-500">Valor</th>
                <th className="text-center py-3 px-3 font-medium text-gray-500">Acoes</th>
              </tr>
            </thead>
            <tbody>
              {paginados.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-400">
                    <Receipt className="w-10 h-10 mx-auto mb-2 opacity-50" />
                    <p>Nenhum lancamento encontrado</p>
                    <button onClick={handleOpenNew} className="text-emerald-600 hover:text-emerald-700 font-medium mt-2 text-sm">
                      + Adicionar primeiro lancamento
                    </button>
                  </td>
                </tr>
              ) : (
                paginados.map((l) => (
                  <tr key={l.id} className="border-b border-gray-50 hover:bg-gray-50 group">
                    <td className="py-3 px-3 text-gray-500 whitespace-nowrap">{l.data}</td>
                    <td className="py-3 px-3 font-medium text-gray-900 max-w-[250px] truncate">
                      <span>{l.descricao}</span>
                      {l.source === 'sheets' && (
                        <span className="ml-2 text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">Sheets</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-gray-500">{l.categoria}</td>
                    <td className="py-3 px-3 text-gray-500">{l.conta}</td>
                    <td className="py-3 px-3">
                      <span className={l.tipo === 'receita' ? 'badge-success' : 'badge-error'}>
                        {l.tipo}
                      </span>
                    </td>
                    <td className={`py-3 px-3 text-right font-medium whitespace-nowrap ${
                      l.tipo === 'receita' ? 'text-emerald-700' : 'text-red-700'
                    }`}>
                      {l.tipo === 'receita' ? '+' : '-'}{formatCurrency(Math.abs(l.valor))}
                    </td>
                    <td className="py-3 px-3">
                      {l.source !== 'sheets' && (
                        <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleOpenEdit(l)}
                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenDelete(l)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Excluir"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Paginacao */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-4">
            <p className="text-sm text-gray-500">
              Mostrando {(pagina - 1) * PAGE_SIZE + 1}–{Math.min(pagina * PAGE_SIZE, filtrados.length)} de {filtrados.length}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPagina((p) => Math.max(1, p - 1))}
                disabled={pagina === 1}
                className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-30 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === totalPages || Math.abs(p - pagina) <= 1)
                .map((p, idx, arr) => {
                  const prev = arr[idx - 1]
                  const showEllipsis = prev !== undefined && p - prev > 1
                  return (
                    <span key={p}>
                      {showEllipsis && <span className="px-1 text-gray-400">...</span>}
                      <button
                        onClick={() => setPagina(p)}
                        className={`w-8 h-8 text-sm rounded-lg transition-colors ${
                          pagina === p
                            ? 'bg-emerald-500 text-white'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        {p}
                      </button>
                    </span>
                  )
                })}
              <button
                onClick={() => setPagina((p) => Math.min(totalPages, p + 1))}
                disabled={pagina === totalPages}
                className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-30 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal: Formulario */}
      <TransactionForm
        isOpen={isFormOpen}
        editItem={editItem}
        contas={contas}
        isSaving={isSaving}
        onSave={handleSave}
        onClose={() => { setIsFormOpen(false); setEditItem(null) }}
      />

      {/* Modal: Confirmacao de exclusao */}
      <DeleteConfirmDialog
        isOpen={isDeleteOpen}
        message="Tem certeza que deseja excluir este lancamento?"
        itemName={deleteItem ? `${deleteItem.descricao} — ${formatCurrency(Math.abs(deleteItem.valor))}` : ''}
        isDeleting={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => { setIsDeleteOpen(false); setDeleteItem(null) }}
      />
    </div>
  )
}
