// ═══════════════════════════════════════════════════════════════
// Financeiro — Modulo Interno (unificado)
// Lancamentos, Custos Operacionais e Equipamentos em abas
// ═══════════════════════════════════════════════════════════════

import { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import {
  Wallet, Search, Filter, ArrowUpRight, ArrowDownRight,
  Receipt, Plus, Edit3, Trash2, RefreshCw,
  ChevronLeft, ChevronRight, ChevronDown, ChevronUp,
  Package, Wrench, CreditCard, Tag, Send,
} from 'lucide-react'
import { useInternoData } from '../../hooks/useInternoData'
import { useDataContext } from '../../contexts/dataContextValue'
import { TransactionForm } from '../../components/TransactionForm'
import { DeleteConfirmDialog } from '../../components/DeleteConfirmDialog'
import { LoadingState } from '../../components/LoadingState'
import { ErrorBanner } from '../../components/ErrorBanner'
import { PeriodSelector } from '../../components/PeriodSelector'
import { formatCurrency, getChartColor, parseDateBR } from '../../utils/format'
import { calcCustosMensalEfetivo, labelRecorrencia, dataPertenceAoPeriodo } from '../../utils/custos'
import type { LancamentoCusto, CustoOperacional, Equipamento } from '../../types'
import type { LancamentoFormData } from '../../services/sheetsCrud'

const PAGE_SIZE = 15
const CATEGORIAS_CUSTO: CustoOperacional['categoria'][] = ['Fixo', 'Variavel', 'Financeiro', 'Fornecedor']
const RECORRENCIAS: CustoOperacional['recorrencia'][] = ['unico', 'mensal', 'trimestral', 'anual']

export function InternoCustos() {
  // ── Aba ativa ──────────────────────────────────────────────────
  const [aba, setAba] = useState<'lancamentos' | 'custos' | 'equipamentos'>('lancamentos')

  // ── Estado lancamentos ─────────────────────────────────────────
  const [busca, setBusca] = useState('')
  const [filtroCategoria, setFiltroCategoria] = useState('todas')
  const [filtroTipo, setFiltroTipo] = useState<'todos' | 'receita' | 'despesa'>('todos')
  const [filtroConta, setFiltroConta] = useState('todas')
  const [pagina, setPagina] = useState(1)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editItem, setEditItem] = useState<LancamentoCusto | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [deleteItem, setDeleteItem] = useState<LancamentoCusto | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  // ── Estado custos operacionais ─────────────────────────────────
  const [formCusto, setFormCusto] = useState<CustoOperacional | null>(null)
  const [showFormCusto, setShowFormCusto] = useState(false)

  // ── Estado equipamentos ────────────────────────────────────────
  const [formEq, setFormEq] = useState<Equipamento | null>(null)
  const [showFormEq, setShowFormEq] = useState(false)

  // ── Hooks e contexto ───────────────────────────────────────────
  const { lancamentos, categorias, contas, isLoading, error, fechamentos, fechamentoAtual } = useInternoData()
  const {
    custos, saveCusto, deleteCusto,
    equipamentos, saveEquipamento, deleteEquipamento,
    refetch, saveLancamento, deleteLancamento,
    historicalSheets,
  } = useDataContext()

  const isBenchmarkMode = historicalSheets.length > 0

  // ── Período selecionado ────────────────────────────────────────
  const [periodoSelecionado, setPeriodoSelecionado] = useState<string>('ultimo')
  const isAcumulado = periodoSelecionado === 'acumulado'

  const periodoEfetivo = useMemo(() => {
    if (isAcumulado) return null
    if (periodoSelecionado === 'ultimo') return fechamentoAtual?.periodo ?? null
    return periodoSelecionado
  }, [isAcumulado, periodoSelecionado, fechamentoAtual])

  // Data padrão para o formulário de novo lançamento:
  // 1º dia do período selecionado (ou hoje se acumulado / sem período)
  const defaultFormDate = useMemo(() => {
    if (isAcumulado || !periodoEfetivo) return new Date().toISOString().split('T')[0]
    const MESES_NUM: Record<string, string> = {
      jan: '01', fev: '02', mar: '03', abr: '04', mai: '05', jun: '06',
      jul: '07', ago: '08', set: '09', out: '10', nov: '11', dez: '12',
    }
    const m = periodoEfetivo.match(/^([A-Za-z]{3})(\d{4})$/)
    if (!m) return new Date().toISOString().split('T')[0]
    const month = MESES_NUM[m[1].toLowerCase()]
    if (!month) return new Date().toISOString().split('T')[0]
    return `${m[2]}-${month}-01`
  }, [periodoEfetivo, isAcumulado])

  // ── useMemos ───────────────────────────────────────────────────

  const filtrados = useMemo(() => {
    return lancamentos
      .filter((l) => {
        // Filtro de período: se um período específico estiver selecionado
        if (!isAcumulado && periodoEfetivo) {
          if (!dataPertenceAoPeriodo(l.data, periodoEfetivo)) return false
        }
        if (filtroCategoria !== 'todas' && l.categoria !== filtroCategoria) return false
        if (filtroConta !== 'todas' && l.conta !== filtroConta) return false
        if (filtroTipo !== 'todos' && l.tipo !== filtroTipo) return false
        if (busca) {
          const q = busca.toLowerCase()
          const matchDesc = l.descricao.toLowerCase().includes(q)
          const matchNome = (l.nomeCliente || '').toLowerCase().includes(q)
          const matchCnpj = (l.cnpjCliente || '').includes(q)
          const matchCat  = l.categoria.toLowerCase().includes(q)
          if (!matchDesc && !matchNome && !matchCnpj && !matchCat) return false
        }
        return true
      })
      .sort((a, b) => parseDateBR(b.data).getTime() - parseDateBR(a.data).getTime())
  }, [lancamentos, filtroCategoria, filtroConta, filtroTipo, busca, isAcumulado, periodoEfetivo])

  const totalPages = Math.max(1, Math.ceil(filtrados.length / PAGE_SIZE))

  const paginados = useMemo(() => {
    const start = (pagina - 1) * PAGE_SIZE
    return filtrados.slice(start, start + PAGE_SIZE)
  }, [filtrados, pagina])

  const custoMensalEfetivo = useMemo(() => calcCustosMensalEfetivo(custos), [custos])

  const custoMensalEquip = useMemo(() => {
    return equipamentos.reduce((s, eq) => {
      const restantes = eq.numeroParcelas - eq.parcelasPagas
      return s + (restantes > 0 ? eq.valorParcela : 0)
    }, 0)
  }, [equipamentos])

  const custoMensalTotal = custoMensalEfetivo + custoMensalEquip

  // ── Lançamentos do período (sem filtros de UI) ──────────────────
  const lancamentosPeriodo = useMemo(() => {
    if (isAcumulado || !periodoEfetivo) return lancamentos
    return lancamentos.filter((l) => dataPertenceAoPeriodo(l.data, periodoEfetivo))
  }, [lancamentos, isAcumulado, periodoEfetivo])

  // KPIs do período selecionado (respeita filtro de período, ignora filtros de UI)
  const totaisGlobal = useMemo(() => {
    const receitas = lancamentosPeriodo.filter((l) => l.tipo === 'receita').reduce((s, l) => s + Math.abs(l.valor), 0)
    const despesas = lancamentosPeriodo.filter((l) => l.tipo === 'despesa').reduce((s, l) => s + Math.abs(l.valor), 0)
    return { receitas, despesas, saldo: receitas - despesas }
  }, [lancamentosPeriodo])

  // ── Totais por conta (período-aware) ────────────────────────────
  const totaisContas = useMemo(() => {
    const byAccount = (conta: string) => {
      const items = lancamentosPeriodo.filter((l) => l.conta === conta)
      const receitas = items.filter((l) => l.tipo === 'receita').reduce((s, l) => s + Math.abs(l.valor), 0)
      const despesas = items.filter((l) => l.tipo === 'despesa').reduce((s, l) => s + Math.abs(l.valor), 0)
      return { receitas, despesas, count: items.length }
    }
    return {
      cobrDigital: byAccount('Cobr. Conta Digital'),
      descontos:   byAccount('Descontos'),
      repasses:    byAccount('Repasses'),
    }
  }, [lancamentosPeriodo])

  const resultadoFinal = totaisGlobal.saldo - custoMensalTotal

  const porCategoria = useMemo(() => {
    const map = new Map<string, number>()
    filtrados.forEach((l) => {
      const cat = l.categoria || 'Sem categoria'
      map.set(cat, (map.get(cat) || 0) + Math.abs(l.valor))
    })
    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
  }, [filtrados])

  const porConta = useMemo(() => {
    const map = new Map<string, { receitas: number; despesas: number }>()
    filtrados.forEach((l) => {
      const conta = l.conta || 'Sem conta'
      const curr = map.get(conta) || { receitas: 0, despesas: 0 }
      if (l.tipo === 'receita') curr.receitas += l.valor
      else curr.despesas += Math.abs(l.valor)
      map.set(conta, curr)
    })
    return Array.from(map.entries()).map(([name, data]) => ({ name, ...data }))
  }, [filtrados])

  const totalPorCategoriaCusto = useMemo(() =>
    CATEGORIAS_CUSTO.map((cat) => ({
      name: cat,
      value: custos.filter((c) => c.categoria === cat).reduce((s, c) => s + c.valor, 0),
    })).filter((d) => d.value > 0),
  [custos])

  const totalParcelasRestantes = useMemo(() =>
    equipamentos.reduce((s, eq) => {
      const restantes = eq.numeroParcelas - eq.parcelasPagas
      return s + (restantes > 0 ? restantes * eq.valorParcela : 0)
    }, 0),
  [equipamentos])

  // ── Feedback com timer ─────────────────────────────────────────
  const feedbackTimerRef = useRef<number | null>(null)

  const showFeedback = useCallback((type: 'success' | 'error', message: string) => {
    setFeedback({ type, message })
    if (feedbackTimerRef.current !== null) window.clearTimeout(feedbackTimerRef.current)
    feedbackTimerRef.current = window.setTimeout(() => {
      setFeedback(null)
      feedbackTimerRef.current = null
    }, 4000)
  }, [])

  useEffect(() => {
    return () => {
      if (feedbackTimerRef.current !== null) window.clearTimeout(feedbackTimerRef.current)
    }
  }, [])

  // ── Handlers CRUD lancamentos ──────────────────────────────────

  function normalizarData(dataStr: string): string {
    if (/^\d{4}-\d{2}-\d{2}$/.test(dataStr)) {
      const [y, m, d] = dataStr.split('-')
      return `${d}/${m}/${y}`
    }
    return dataStr
  }

  const handleSaveLancamento = (data: LancamentoFormData) => {
    setIsSaving(true)
    const dataNormalizada = normalizarData(data.data)
    try {
      if (editItem) {
        saveLancamento({ ...editItem, ...data, data: dataNormalizada, source: 'local' })
        showFeedback('success', `Lançamento "${data.descricao}" atualizado`)
      } else {
        const novo: LancamentoCusto = {
          id: `L${Date.now().toString(36).toUpperCase()}`,
          ...data,
          data: dataNormalizada,
          conta: data.conta || 'Geral',
          source: 'local',
        }
        saveLancamento(novo)
        showFeedback('success', `Lançamento "${data.descricao}" criado`)
      }
      setIsFormOpen(false)
      setEditItem(null)
      setPagina(1)  // volta para página 1 para o novo lançamento ficar visível
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
      if (deleteItem.source === 'sheets') {
        showFeedback('error', 'Lançamentos da planilha não podem ser excluídos aqui')
        setIsDeleteOpen(false)
        setDeleteItem(null)
        return
      }
      deleteLancamento(deleteItem.id)
      showFeedback('success', `Lançamento "${deleteItem.descricao}" excluído`)
      setIsDeleteOpen(false)
      setDeleteItem(null)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao excluir'
      showFeedback('error', msg)
    } finally {
      setIsDeleting(false)
    }
  }

  // ── Handlers CRUD custos operacionais ─────────────────────────

  function novoCusto(): CustoOperacional {
    return {
      id: Date.now().toString(),
      data: new Date().toLocaleDateString('pt-BR'),
      descricao: '',
      categoria: 'Fixo',
      valor: 0,
      recorrencia: 'mensal',
    }
  }

  function handleEditCusto(custo: CustoOperacional) {
    setFormCusto({ ...custo })
    setShowFormCusto(true)
  }

  function handleSaveCusto() {
    if (!formCusto || !formCusto.descricao || formCusto.valor <= 0) return
    try {
      saveCusto(formCusto)
      const isEdit = custos.some((c) => c.id === formCusto.id)
      showFeedback('success', `Custo "${formCusto.descricao}" ${isEdit ? 'atualizado' : 'criado'}`)
    } catch (err) {
      showFeedback('error', err instanceof Error ? err.message : 'Erro ao salvar custo')
    }
    setFormCusto(null)
    setShowFormCusto(false)
  }

  function handleDeleteCusto(custo: CustoOperacional) {
    try {
      deleteCusto(custo.id)
      showFeedback('success', `Custo "${custo.descricao}" excluído`)
    } catch (err) {
      showFeedback('error', err instanceof Error ? err.message : 'Erro ao excluir custo')
    }
  }

  function handleDeleteEq(eq: Equipamento) {
    try {
      deleteEquipamento(eq.id)
      showFeedback('success', `Equipamento "${eq.descricao}" excluído`)
    } catch (err) {
      showFeedback('error', err instanceof Error ? err.message : 'Erro ao excluir equipamento')
    }
  }

  // ── Handlers CRUD equipamentos ─────────────────────────────────

  function novoEquipamento(): Equipamento {
    return {
      id: Date.now().toString(),
      dataCompra: new Date().toLocaleDateString('pt-BR'),
      descricao: '',
      valorTotal: 0,
      numeroParcelas: 1,
      valorParcela: 0,
      parcelasPagas: 0,
    }
  }

  function handleSaveEq() {
    if (!formEq || !formEq.descricao || formEq.valorTotal <= 0) return
    const valorParcela = formEq.numeroParcelas > 0
      ? Number((formEq.valorTotal / formEq.numeroParcelas).toFixed(2))
      : formEq.valorTotal
    try {
      saveEquipamento({ ...formEq, valorParcela })
      showFeedback('success', `Equipamento "${formEq.descricao}" salvo`)
    } catch (err) {
      showFeedback('error', err instanceof Error ? err.message : 'Erro ao salvar equipamento')
    }
    setFormEq(null)
    setShowFormEq(false)
  }

  // ── Render ─────────────────────────────────────────────────────

  if (isLoading) return <LoadingState message="Carregando dados financeiros..." />

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <Wallet className="w-7 h-7 text-blue-500" />
            Financeiro
          </h1>
          <p className="text-gray-500 mt-1">
            Lançamentos, custos operacionais e equipamentos
            {periodoEfetivo && !isAcumulado && <span className="ml-2 text-xs text-gray-400">— {periodoEfetivo}</span>}
            {isAcumulado && <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">acumulado</span>}
          </p>
        </div>
        <div className="flex gap-3 flex-wrap items-center">
          {fechamentos.length > 0 && (
            <PeriodSelector
              fechamentos={fechamentos}
              value={periodoSelecionado}
              onChange={(v) => { setPeriodoSelecionado(v); setPagina(1) }}
            />
          )}
          {!isBenchmarkMode && (
            <button onClick={() => refetch()} className="btn-outline flex items-center gap-2" title="Recarregar da planilha">
              <RefreshCw className="w-4 h-4" />
              Sincronizar
            </button>
          )}
          <button onClick={() => { setEditItem(null); setIsFormOpen(true) }} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Novo Lançamento
          </button>
        </div>
      </div>

      {/* ── Feedback ── */}
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

      {/* ── KPIs (mostrados uma vez no topo, independente da aba) ── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="card-hover">
          <div className="flex items-center gap-2 mb-2">
            <ArrowUpRight className="w-4 h-4 text-emerald-500" />
            <span className="text-sm text-gray-500">Receitas</span>
          </div>
          <p className="text-xl font-bold text-emerald-700">{formatCurrency(totaisGlobal.receitas)}</p>
          <p className="text-xs text-gray-400 mt-1">Total de entradas</p>
        </div>
        <div className="card-hover">
          <div className="flex items-center gap-2 mb-2">
            <ArrowDownRight className="w-4 h-4 text-red-500" />
            <span className="text-sm text-gray-500">Despesas</span>
          </div>
          <p className="text-xl font-bold text-red-700">{formatCurrency(totaisGlobal.despesas)}</p>
          <p className="text-xs text-gray-400 mt-1">Total de saídas</p>
        </div>
        <div className="card-hover">
          <div className="flex items-center gap-2 mb-2">
            <Wallet className="w-4 h-4 text-blue-500" />
            <span className="text-sm text-gray-500">Saldo Operacional</span>
          </div>
          <p className={`text-xl font-bold ${totaisGlobal.saldo >= 0 ? 'text-blue-700' : 'text-red-700'}`}>
            {formatCurrency(totaisGlobal.saldo)}
          </p>
          <p className="text-xs text-gray-400 mt-1">Receitas - Despesas</p>
        </div>
        <div className="card-hover">
          <div className="flex items-center gap-2 mb-2">
            <Wrench className="w-4 h-4 text-orange-500" />
            <span className="text-sm text-gray-500">Custo Mensal</span>
          </div>
          <p className="text-xl font-bold text-orange-700">- {formatCurrency(custoMensalTotal)}</p>
          <p className="text-xs text-gray-400 mt-1">Operacional + equipamentos</p>
        </div>
        <div className={`card-hover ${resultadoFinal >= 0 ? 'border-emerald-200' : 'border-red-200'}`}>
          <div className="flex items-center gap-2 mb-2">
            <ArrowUpRight className={`w-4 h-4 ${resultadoFinal >= 0 ? 'text-emerald-500' : 'text-red-500'}`} />
            <span className="text-sm text-gray-500">Resultado Final</span>
          </div>
          <p className={`text-xl font-bold ${resultadoFinal >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
            {formatCurrency(resultadoFinal)}
          </p>
          <p className="text-xs text-gray-400 mt-1">Saldo - custos mensais</p>
        </div>
      </div>

      {/* ── Breakdown: Cobr. Conta Digital | Descontos | Repasses ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        {/* Cobr. Conta Digital */}
        <button
          className="card-hover border-l-4 border-l-blue-400 text-left w-full"
          onClick={() => { setFiltroConta('Cobr. Conta Digital'); setAba('lancamentos') }}
          title="Filtrar lançamentos por Cobr. Conta Digital"
        >
          <div className="flex items-center gap-2 mb-2">
            <CreditCard className="w-4 h-4 text-blue-500 shrink-0" />
            <span className="text-sm text-gray-500 font-medium">Cobr. Conta Digital</span>
            {totaisContas.cobrDigital.count > 0 && (
              <span className="ml-auto text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full font-medium">
                {totaisContas.cobrDigital.count}
              </span>
            )}
          </div>
          {totaisContas.cobrDigital.receitas > 0 && (
            <p className="text-lg font-bold text-blue-700">
              + {formatCurrency(totaisContas.cobrDigital.receitas)}
            </p>
          )}
          {totaisContas.cobrDigital.despesas > 0 && (
            <p className={`font-bold ${totaisContas.cobrDigital.receitas > 0 ? 'text-sm text-red-600' : 'text-lg text-red-700'}`}>
              - {formatCurrency(totaisContas.cobrDigital.despesas)}
            </p>
          )}
          {totaisContas.cobrDigital.count === 0 && (
            <p className="text-lg font-bold text-gray-400">—</p>
          )}
          <p className="text-xs text-gray-400 mt-1">
            {periodoEfetivo ? periodoEfetivo : isAcumulado ? 'Acumulado' : 'Todos os períodos'}
          </p>
        </button>

        {/* Descontos */}
        <button
          className="card-hover border-l-4 border-l-red-400 text-left w-full"
          onClick={() => { setFiltroConta('Descontos'); setAba('lancamentos') }}
          title="Filtrar lançamentos por Descontos"
        >
          <div className="flex items-center gap-2 mb-2">
            <Tag className="w-4 h-4 text-red-500 shrink-0" />
            <span className="text-sm text-gray-500 font-medium">Descontos</span>
            {totaisContas.descontos.count > 0 && (
              <span className="ml-auto text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full font-medium">
                {totaisContas.descontos.count}
              </span>
            )}
          </div>
          {totaisContas.descontos.despesas > 0 && (
            <p className="text-lg font-bold text-red-700">
              - {formatCurrency(totaisContas.descontos.despesas)}
            </p>
          )}
          {totaisContas.descontos.receitas > 0 && (
            <p className={`font-bold ${totaisContas.descontos.despesas > 0 ? 'text-sm text-emerald-600' : 'text-lg text-emerald-700'}`}>
              + {formatCurrency(totaisContas.descontos.receitas)}
            </p>
          )}
          {totaisContas.descontos.count === 0 && (
            <p className="text-lg font-bold text-gray-400">—</p>
          )}
          <p className="text-xs text-gray-400 mt-1">
            {periodoEfetivo ? periodoEfetivo : isAcumulado ? 'Acumulado' : 'Todos os períodos'}
          </p>
        </button>

        {/* Repasses */}
        <button
          className="card-hover border-l-4 border-l-emerald-400 text-left w-full"
          onClick={() => { setFiltroConta('Repasses'); setAba('lancamentos') }}
          title="Filtrar lançamentos por Repasses"
        >
          <div className="flex items-center gap-2 mb-2">
            <Send className="w-4 h-4 text-emerald-500 shrink-0" />
            <span className="text-sm text-gray-500 font-medium">Repasses</span>
            {totaisContas.repasses.count > 0 && (
              <span className="ml-auto text-xs bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full font-medium">
                {totaisContas.repasses.count}
              </span>
            )}
          </div>
          {totaisContas.repasses.receitas > 0 && (
            <p className="text-lg font-bold text-emerald-700">
              + {formatCurrency(totaisContas.repasses.receitas)}
            </p>
          )}
          {totaisContas.repasses.despesas > 0 && (
            <p className={`font-bold ${totaisContas.repasses.receitas > 0 ? 'text-sm text-red-600' : 'text-lg text-red-700'}`}>
              - {formatCurrency(totaisContas.repasses.despesas)}
            </p>
          )}
          {totaisContas.repasses.count === 0 && (
            <p className="text-lg font-bold text-gray-400">—</p>
          )}
          <p className="text-xs text-gray-400 mt-1">
            {periodoEfetivo ? periodoEfetivo : isAcumulado ? 'Acumulado' : 'Todos os períodos'}
          </p>
        </button>

      </div>

      {/* ── Tabs ── */}
      <div className="flex gap-2 border-b border-gray-200 pb-0">
        {([
          { id: 'lancamentos', label: 'Lançamentos', icon: <Receipt className="w-4 h-4" /> },
          { id: 'custos', label: 'Custos Operacionais', icon: <Wrench className="w-4 h-4" /> },
          { id: 'equipamentos', label: 'Equipamentos', icon: <Package className="w-4 h-4" /> },
        ] as const).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setAba(tab.id)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              aba === tab.id
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            {tab.icon}
            {tab.label}
            {tab.id === 'lancamentos' && lancamentos.length > 0 && (
              <span className="ml-1 text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full">{lancamentos.length}</span>
            )}
            {tab.id === 'custos' && custos.length > 0 && (
              <span className="ml-1 text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full">{custos.length}</span>
            )}
            {tab.id === 'equipamentos' && equipamentos.length > 0 && (
              <span className="ml-1 text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full">{equipamentos.length}</span>
            )}
          </button>
        ))}
      </div>

      {/* ══ ABA: LANCAMENTOS ══ */}
      {aba === 'lancamentos' && (
        <div className="space-y-4">
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
                  placeholder="Buscar por descrição, CNPJ, categoria..."
                  className="input-field pl-10"
                />
              </div>
              <select value={filtroCategoria} onChange={(e) => { setFiltroCategoria(e.target.value); setPagina(1) }} className="input-field w-auto">
                <option value="todas">Todas categorias</option>
                {categorias.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <select value={filtroConta} onChange={(e) => { setFiltroConta(e.target.value); setPagina(1) }} className="input-field w-auto">
                <option value="todas">Todas contas</option>
                {contas.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <select value={filtroTipo} onChange={(e) => { setFiltroTipo(e.target.value as 'todos' | 'receita' | 'despesa'); setPagina(1) }} className="input-field w-auto">
                <option value="todos">Todos tipos</option>
                <option value="receita">Receitas</option>
                <option value="despesa">Despesas</option>
              </select>
            </div>
          </div>

          {/* Graficos (pizza + barras) */}
          {(porCategoria.length > 0 || porConta.length > 0) && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {porCategoria.length > 0 && (
                <div className="card">
                  <h3 className="text-base font-semibold text-gray-900 mb-4">Por Categoria</h3>
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie
                        data={porCategoria} cx="50%" cy="50%"
                        outerRadius={90} dataKey="value" paddingAngle={2}
                        label={({ name, percent }) => `${String(name || '')} (${((Number(percent) || 0) * 100).toFixed(0)}%)`}
                      >
                        {porCategoria.map((_, i) => <Cell key={i} fill={getChartColor(i)} />)}
                      </Pie>
                      <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
              {porConta.length > 0 && (
                <div className="card">
                  <h3 className="text-base font-semibold text-gray-900 mb-4">Por Conta</h3>
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={porConta}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis tickFormatter={(v: number) => formatCurrency(v)} tick={{ fontSize: 10 }} />
                      <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                      <Legend />
                      <Bar dataKey="receitas" name="Receitas" fill="#00C896" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="despesas" name="Despesas" fill="#EF4444" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          )}

          {/* Tabela CRUD com paginação */}
          <div className="card">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-3 font-medium text-gray-500">Data</th>
                    <th className="text-left py-3 px-3 font-medium text-gray-500">CNPJ</th>
                    <th className="text-left py-3 px-3 font-medium text-gray-500">Estabelecimento / Descrição</th>
                    <th className="text-left py-3 px-3 font-medium text-gray-500">Tipo de Ajuste</th>
                    <th className="text-left py-3 px-3 font-medium text-gray-500">Categoria</th>
                    <th className="text-left py-3 px-3 font-medium text-gray-500">Conta</th>
                    <th className="text-left py-3 px-3 font-medium text-gray-500">Tipo</th>
                    <th className="text-right py-3 px-3 font-medium text-gray-500">Valor</th>
                    <th className="text-center py-3 px-3 font-medium text-gray-500">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {paginados.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="text-center py-12 text-gray-400">
                        <Receipt className="w-10 h-10 mx-auto mb-2 opacity-50" />
                        <p>Nenhum lançamento encontrado</p>
                        <button onClick={() => { setEditItem(null); setIsFormOpen(true) }} className="text-emerald-600 hover:text-emerald-700 font-medium mt-2 text-sm">
                          + Adicionar primeiro lançamento
                        </button>
                      </td>
                    </tr>
                  ) : (
                    paginados.map((l) => (
                      <tr key={l.id} className="border-b border-gray-50 hover:bg-gray-50 group">
                        <td className="py-3 px-3 text-gray-500 whitespace-nowrap">{l.data}</td>
                        <td className="py-3 px-3 text-gray-500 text-xs font-mono whitespace-nowrap">{l.cnpjCliente || '—'}</td>
                        <td className="py-3 px-3 font-medium text-gray-900 max-w-[200px] truncate">
                          {l.nomeCliente || l.descricao}
                          {l.source === 'sheets' && (
                            <span className="ml-2 text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">Sheets</span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-gray-500 whitespace-nowrap">{l.tipoAjuste || '—'}</td>
                        <td className="py-3 px-3 text-gray-500">{l.categoria}</td>
                        <td className="py-3 px-3 text-gray-500">{l.conta}</td>
                        <td className="py-3 px-3">
                          <span className={l.tipo === 'receita' ? 'badge-success' : 'badge-error'}>{l.tipo}</span>
                        </td>
                        <td className={`py-3 px-3 text-right font-medium whitespace-nowrap ${l.tipo === 'receita' ? 'text-emerald-700' : 'text-red-700'}`}>
                          {l.tipo === 'receita' ? '+' : '-'}{formatCurrency(Math.abs(l.valor))}
                        </td>
                        <td className="py-3 px-3">
                          {l.source !== 'sheets' && (
                            <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => { setEditItem(l); setIsFormOpen(true) }} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg" title="Editar">
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button onClick={() => { setDeleteItem(l); setIsDeleteOpen(true) }} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg" title="Excluir">
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

            {/* Paginação */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-4">
                <p className="text-sm text-gray-500">
                  Mostrando {(pagina - 1) * PAGE_SIZE + 1}–{Math.min(pagina * PAGE_SIZE, filtrados.length)} de {filtrados.length}
                </p>
                <div className="flex items-center gap-1">
                  <button onClick={() => setPagina((p) => Math.max(1, p - 1))} disabled={pagina === 1} className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-30 rounded-lg hover:bg-gray-100">
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
                            className={`w-8 h-8 text-sm rounded-lg transition-colors ${pagina === p ? 'bg-emerald-500 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                          >
                            {p}
                          </button>
                        </span>
                      )
                    })}
                  <button onClick={() => setPagina((p) => Math.min(totalPages, p + 1))} disabled={pagina === totalPages} className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-30 rounded-lg hover:bg-gray-100">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══ ABA: CUSTOS OPERACIONAIS ══ */}
      {aba === 'custos' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Grafico pizza */}
            {totalPorCategoriaCusto.length > 0 && (
              <div className="card">
                <h3 className="text-base font-semibold text-gray-900 mb-3">Por Categoria</h3>
                <p className="text-xs text-gray-400 mb-3">Impacto mensal: <span className="font-semibold text-red-700">{formatCurrency(custoMensalEfetivo)}</span></p>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={totalPorCategoriaCusto} cx="50%" cy="50%"
                      outerRadius={80} dataKey="value" paddingAngle={2}
                      label={({ name, percent }) => `${String(name || '')} (${((Number(percent) || 0) * 100).toFixed(0)}%)`}
                    >
                      {totalPorCategoriaCusto.map((_, i) => <Cell key={i} fill={getChartColor(i)} />)}
                    </Pie>
                    <Tooltip formatter={(v) => formatCurrency(Number(v))} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Lista + CRUD */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-gray-900">Custos Cadastrados</h3>
                <button
                  onClick={() => { setFormCusto(novoCusto()); setShowFormCusto(true) }}
                  className="btn-primary flex items-center gap-1.5 text-sm"
                  disabled={showFormCusto}
                >
                  <Plus className="w-4 h-4" /> Novo Custo
                </button>
              </div>

              {/* Formulário inline */}
              {showFormCusto && formCusto && (
                <div className="card border border-blue-200 bg-blue-50/30 space-y-3">
                  <p className="text-sm font-semibold text-blue-700">
                    {custos.some((c) => c.id === formCusto.id) ? 'Editando custo' : 'Novo custo'}
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-gray-600 mb-1 block">Descrição</label>
                      <input type="text" value={formCusto.descricao} onChange={(e) => setFormCusto({ ...formCusto, descricao: e.target.value })} className="input-field" placeholder="Ex: Aluguel, Folha..." />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600 mb-1 block">Valor (R$)</label>
                      <input type="number" value={formCusto.valor || ''} onChange={(e) => setFormCusto({ ...formCusto, valor: Number(e.target.value) })} className="input-field" min={0} step={10} />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600 mb-1 block">Categoria</label>
                      <select value={formCusto.categoria} onChange={(e) => setFormCusto({ ...formCusto, categoria: e.target.value as CustoOperacional['categoria'] })} className="input-field">
                        {CATEGORIAS_CUSTO.map((c) => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600 mb-1 block">Recorrência</label>
                      <select value={formCusto.recorrencia} onChange={(e) => setFormCusto({ ...formCusto, recorrencia: e.target.value as CustoOperacional['recorrencia'] })} className="input-field">
                        {RECORRENCIAS.map((r) => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={handleSaveCusto} className="btn-primary text-sm">Salvar</button>
                    <button onClick={() => { setShowFormCusto(false); setFormCusto(null) }} className="btn-secondary text-sm">Cancelar</button>
                  </div>
                </div>
              )}

              {/* Tabela custos */}
              <div className="card overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 px-3 font-medium text-gray-500">Descrição</th>
                      <th className="text-left py-2 px-3 font-medium text-gray-500">Categoria</th>
                      <th className="text-left py-2 px-3 font-medium text-gray-500">Recorrência</th>
                      <th className="text-right py-2 px-3 font-medium text-gray-500">Valor</th>
                      <th className="py-2 px-3" />
                    </tr>
                  </thead>
                  <tbody>
                    {custos.length === 0 ? (
                      <tr><td colSpan={5} className="text-center py-8 text-gray-400">Nenhum custo cadastrado</td></tr>
                    ) : (
                      custos.map((c) => (
                        <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50">
                          <td className="py-2 px-3 font-medium">{c.descricao}</td>
                          <td className="py-2 px-3 text-gray-500">
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                              c.categoria === 'Fixo' ? 'bg-blue-100 text-blue-700'
                              : c.categoria === 'Variavel' ? 'bg-yellow-100 text-yellow-700'
                              : c.categoria === 'Financeiro' ? 'bg-red-100 text-red-700'
                              : 'bg-gray-100 text-gray-700'
                            }`}>{c.categoria}</span>
                          </td>
                          <td className="py-2 px-3 text-gray-500 text-xs">{labelRecorrencia(c.recorrencia)}</td>
                          <td className="py-2 px-3 text-right font-medium text-red-700">- {formatCurrency(c.valor)}</td>
                          <td className="py-2 px-3">
                            <div className="flex items-center justify-end gap-1">
                              <button onClick={() => handleEditCusto(c)} className="p-1 text-gray-400 hover:text-blue-500" title="Editar"><Edit3 className="w-4 h-4" /></button>
                              <button onClick={() => handleDeleteCusto(c)} className="p-1 text-gray-400 hover:text-red-500" title="Excluir"><Trash2 className="w-4 h-4" /></button>
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
        </div>
      )}

      {/* ══ ABA: EQUIPAMENTOS ══ */}
      {aba === 'equipamentos' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-gray-900">Equipamentos e Amortização</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Custo mensal: <span className="font-semibold text-orange-700">{formatCurrency(custoMensalEquip)}</span>
                {' · '}Saldo restante: <span className="font-semibold">{formatCurrency(totalParcelasRestantes)}</span>
              </p>
            </div>
            <button onClick={() => { setFormEq(novoEquipamento()); setShowFormEq(true) }} className="btn-primary flex items-center gap-1.5 text-sm">
              <Plus className="w-4 h-4" /> Novo Equipamento
            </button>
          </div>

          {/* Formulário equipamento */}
          {showFormEq && formEq && (
            <div className="card border border-orange-200 bg-orange-50/30 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Descrição</label>
                  <input type="text" value={formEq.descricao} onChange={(e) => setFormEq({ ...formEq, descricao: e.target.value })} className="input-field" placeholder="Ex: Máquina POS, Servidor..." />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Valor Total (R$)</label>
                  <input
                    type="number" value={formEq.valorTotal || ''}
                    onChange={(e) => {
                      const v = Number(e.target.value)
                      setFormEq({ ...formEq, valorTotal: v, valorParcela: v > 0 && formEq.numeroParcelas > 0 ? Number((v / formEq.numeroParcelas).toFixed(2)) : formEq.valorParcela })
                    }}
                    className="input-field" min={0} step={100}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Número de Parcelas</label>
                  <input
                    type="number" value={formEq.numeroParcelas}
                    onChange={(e) => {
                      const n = Math.max(1, Number(e.target.value))
                      setFormEq({ ...formEq, numeroParcelas: n, valorParcela: formEq.valorTotal > 0 ? Number((formEq.valorTotal / n).toFixed(2)) : formEq.valorParcela })
                    }}
                    className="input-field" min={1} step={1}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Parcelas Pagas</label>
                  <input type="number" value={formEq.parcelasPagas} onChange={(e) => setFormEq({ ...formEq, parcelasPagas: Math.min(Number(e.target.value), formEq.numeroParcelas) })} className="input-field" min={0} step={1} max={formEq.numeroParcelas} />
                </div>
              </div>
              {formEq.valorTotal > 0 && formEq.numeroParcelas > 0 && (
                <p className="text-sm text-orange-700 font-medium">
                  Parcela mensal: {formatCurrency(formEq.valorTotal / formEq.numeroParcelas)} × {formEq.numeroParcelas}x
                </p>
              )}
              <div className="flex gap-2">
                <button onClick={handleSaveEq} className="btn-primary text-sm">Salvar</button>
                <button onClick={() => { setShowFormEq(false); setFormEq(null) }} className="btn-secondary text-sm">Cancelar</button>
              </div>
            </div>
          )}

          {/* Tabela equipamentos */}
          <div className="card overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 px-3 font-medium text-gray-500">Descrição</th>
                  <th className="text-right py-2 px-3 font-medium text-gray-500">Valor Total</th>
                  <th className="text-right py-2 px-3 font-medium text-gray-500">Parcelas</th>
                  <th className="text-right py-2 px-3 font-medium text-gray-500">Pago</th>
                  <th className="text-right py-2 px-3 font-medium text-gray-500">Restante</th>
                  <th className="text-right py-2 px-3 font-medium text-gray-500">Mensal</th>
                  <th className="py-2 px-3" />
                </tr>
              </thead>
              <tbody>
                {equipamentos.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-8 text-gray-400">Nenhum equipamento cadastrado</td></tr>
                ) : (
                  equipamentos.map((eq) => {
                    const restantes = eq.numeroParcelas - eq.parcelasPagas
                    const pct = eq.numeroParcelas > 0 ? (eq.parcelasPagas / eq.numeroParcelas) * 100 : 0
                    return (
                      <tr key={eq.id} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="py-2 px-3 font-medium">{eq.descricao}</td>
                        <td className="py-2 px-3 text-right">{formatCurrency(eq.valorTotal)}</td>
                        <td className="py-2 px-3 text-right">
                          <div className="flex flex-col items-end gap-1">
                            <span>{eq.parcelasPagas}/{eq.numeroParcelas}</span>
                            <div className="w-16 h-1.5 bg-gray-200 rounded-full">
                              <div className="h-1.5 bg-emerald-500 rounded-full" style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                        </td>
                        <td className="py-2 px-3 text-right text-emerald-700">{formatCurrency(eq.parcelasPagas * eq.valorParcela)}</td>
                        <td className="py-2 px-3 text-right text-red-700">{restantes > 0 ? formatCurrency(restantes * eq.valorParcela) : '—'}</td>
                        <td className="py-2 px-3 text-right font-medium">
                          {restantes > 0 ? formatCurrency(eq.valorParcela) : <span className="text-emerald-600 text-xs font-semibold">Quitado</span>}
                        </td>
                        <td className="py-2 px-3">
                          <div className="flex items-center gap-1 justify-end">
                            {restantes > 0 && (
                              <button onClick={() => saveEquipamento({ ...eq, parcelasPagas: eq.parcelasPagas + 1 })} title="Registrar parcela paga" className="p-1 text-emerald-400 hover:text-emerald-600">
                                <ChevronUp className="w-4 h-4" />
                              </button>
                            )}
                            {eq.parcelasPagas > 0 && (
                              <button onClick={() => saveEquipamento({ ...eq, parcelasPagas: eq.parcelasPagas - 1 })} title="Desfazer última parcela" className="p-1 text-gray-400 hover:text-orange-500">
                                <ChevronDown className="w-4 h-4" />
                              </button>
                            )}
                            <button onClick={() => handleDeleteEq(eq)} className="p-1 text-gray-400 hover:text-red-500" title="Excluir"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Modais ── */}
      <TransactionForm
        isOpen={isFormOpen}
        editItem={editItem}
        defaultDate={defaultFormDate}
        contas={contas}
        isSaving={isSaving}
        onSave={handleSaveLancamento}
        onClose={() => { setIsFormOpen(false); setEditItem(null) }}
      />
      <DeleteConfirmDialog
        isOpen={isDeleteOpen}
        message="Tem certeza que deseja excluir este lançamento?"
        itemName={deleteItem ? `${deleteItem.descricao} — ${formatCurrency(Math.abs(deleteItem.valor))}` : ''}
        isDeleting={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => { setIsDeleteOpen(false); setDeleteItem(null) }}
      />
    </div>
  )
}
