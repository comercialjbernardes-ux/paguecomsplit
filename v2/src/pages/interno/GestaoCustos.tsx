// ═══════════════════════════════════════════════════════════════
// Gestao de Custos Operacionais — Modulo Interno
// Custos fixos/variaveis + depreciacao de equipamentos
// ═══════════════════════════════════════════════════════════════

import { useState } from 'react'
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
} from 'recharts'
import { Wrench, Plus, Trash2, Package, ChevronDown, ChevronUp } from 'lucide-react'
import { useDataContext } from '../../contexts/dataContextValue'
import { formatCurrency, getChartColor } from '../../utils/format'
import { calcCustosMensalEfetivo, labelRecorrencia } from '../../utils/custos'
import type { CustoOperacional, Equipamento } from '../../types'

const CATEGORIAS: CustoOperacional['categoria'][] = ['Fixo', 'Variavel', 'Financeiro', 'Fornecedor']
const RECORRENCIAS: CustoOperacional['recorrencia'][] = ['unico', 'mensal', 'trimestral', 'anual']

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

export function InternoGestaoCustos() {
  const { custos, saveCusto, deleteCusto, equipamentos, saveEquipamento, deleteEquipamento } = useDataContext()

  const [aba, setAba] = useState<'custos' | 'equipamentos'>('custos')
  const [formCusto, setFormCusto] = useState<CustoOperacional | null>(null)
  const [formEq, setFormEq] = useState<Equipamento | null>(null)
  const [showFormCusto, setShowFormCusto] = useState(false)
  const [showFormEq, setShowFormEq] = useState(false)

  // Totais de custos por categoria
  const totalPorCategoria = CATEGORIAS.map((cat) => ({
    name: cat,
    value: custos.filter((c) => c.categoria === cat).reduce((s, c) => s + c.valor, 0),
  })).filter((d) => d.value > 0)

  // Custo mensal efetivo = mensais + prorate trimestral/anual (sem filtro de período para visão geral)
  const totalCustosMensal = calcCustosMensalEfetivo(custos)
  const totalCustosTodos = custos.reduce((s, c) => s + c.valor, 0)

  // Equipamentos: parcelas restantes e custo mensal
  const totalParcelasRestantes = equipamentos.reduce((s, eq) => {
    const restantes = eq.numeroParcelas - eq.parcelasPagas
    return s + (restantes > 0 ? restantes * eq.valorParcela : 0)
  }, 0)
  const custoMensalEquip = equipamentos.reduce((s, eq) => {
    const restantes = eq.numeroParcelas - eq.parcelasPagas
    return s + (restantes > 0 ? eq.valorParcela : 0)
  }, 0)

  // Submit custo
  function handleSaveCusto() {
    if (!formCusto || !formCusto.descricao || formCusto.valor <= 0) return
    saveCusto(formCusto)
    setFormCusto(null)
    setShowFormCusto(false)
  }

  // Submit equipamento
  function handleSaveEq() {
    if (!formEq || !formEq.descricao || formEq.valorTotal <= 0) return
    const valorParcela = formEq.numeroParcelas > 0
      ? Number((formEq.valorTotal / formEq.numeroParcelas).toFixed(2))
      : formEq.valorTotal
    saveEquipamento({ ...formEq, valorParcela })
    setFormEq(null)
    setShowFormEq(false)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <Wrench className="w-7 h-7 text-blue-500" />
          Gestao de Custos
        </h1>
        <p className="text-gray-500 mt-1">Custos operacionais e depreciacao de equipamentos</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card-hover">
          <p className="text-sm text-gray-500">Impacto Mensal Efetivo</p>
          <p className="text-2xl font-bold text-red-700 mt-1">{formatCurrency(totalCustosMensal)}</p>
          <p className="text-xs text-gray-400 mt-1">{custos.length} custo(s) — mensais + prorate trimestral/anual</p>
        </div>
        <div className="card-hover">
          <p className="text-sm text-gray-500">Total Custos Cadastrados</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(totalCustosTodos)}</p>
          <p className="text-xs text-gray-400 mt-1">{custos.length} registros</p>
        </div>
        <div className="card-hover">
          <p className="text-sm text-gray-500">Custo Mensal Equipamentos</p>
          <p className="text-2xl font-bold text-orange-700 mt-1">{formatCurrency(custoMensalEquip)}</p>
          <p className="text-xs text-gray-400 mt-1">{equipamentos.filter((e) => e.parcelasPagas < e.numeroParcelas).length} em amortizacao</p>
        </div>
        <div className="card-hover">
          <p className="text-sm text-gray-500">Saldo Restante Equipamentos</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(totalParcelasRestantes)}</p>
          <p className="text-xs text-gray-400 mt-1">Total a pagar em parcelas</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setAba('custos')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${aba === 'custos' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
        >
          Custos Operacionais
        </button>
        <button
          onClick={() => setAba('equipamentos')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${aba === 'equipamentos' ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
        >
          <Package className="w-4 h-4" />
          Equipamentos
        </button>
      </div>

      {/* Aba Custos */}
      {aba === 'custos' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Grafico pizza */}
            {totalPorCategoria.length > 0 && (
              <div className="card">
                <h3 className="text-base font-semibold text-gray-900 mb-3">Por Categoria</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={totalPorCategoria} cx="50%" cy="50%"
                      outerRadius={80} dataKey="value" paddingAngle={2}
                      label={({ name, percent }) => `${name} (${((Number(percent) || 0) * 100).toFixed(0)}%)`}
                    >
                      {totalPorCategoria.map((_, i) => (
                        <Cell key={i} fill={getChartColor(i)} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => formatCurrency(Number(v))} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Formulario + lista */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-gray-900">Lancamentos</h3>
                <button
                  onClick={() => { setFormCusto(novoCusto()); setShowFormCusto(true) }}
                  className="btn-primary flex items-center gap-1.5 text-sm"
                >
                  <Plus className="w-4 h-4" /> Novo Custo
                </button>
              </div>

              {/* Formulario inline */}
              {showFormCusto && formCusto && (
                <div className="card border border-blue-200 bg-blue-50/30 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-gray-600 mb-1 block">Descricao</label>
                      <input
                        type="text" value={formCusto.descricao}
                        onChange={(e) => setFormCusto({ ...formCusto, descricao: e.target.value })}
                        className="input-field" placeholder="Ex: Aluguel, Folha, etc."
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600 mb-1 block">Valor (R$)</label>
                      <input
                        type="number" value={formCusto.valor || ''}
                        onChange={(e) => setFormCusto({ ...formCusto, valor: Number(e.target.value) })}
                        className="input-field" min={0} step={10}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600 mb-1 block">Categoria</label>
                      <select
                        value={formCusto.categoria}
                        onChange={(e) => setFormCusto({ ...formCusto, categoria: e.target.value as CustoOperacional['categoria'] })}
                        className="input-field"
                      >
                        {CATEGORIAS.map((c) => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600 mb-1 block">Recorrencia</label>
                      <select
                        value={formCusto.recorrencia}
                        onChange={(e) => setFormCusto({ ...formCusto, recorrencia: e.target.value as CustoOperacional['recorrencia'] })}
                        className="input-field"
                      >
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
                      <th className="text-left py-2 px-3 font-medium text-gray-500">Descricao</th>
                      <th className="text-left py-2 px-3 font-medium text-gray-500">Categoria</th>
                      <th className="text-left py-2 px-3 font-medium text-gray-500">Recorrencia</th>
                      <th className="text-right py-2 px-3 font-medium text-gray-500">Valor</th>
                      <th className="py-2 px-3" />
                    </tr>
                  </thead>
                  <tbody>
                    {custos.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center py-8 text-gray-400">
                          Nenhum custo cadastrado
                        </td>
                      </tr>
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
                          <td className="py-2 px-3 text-right font-medium text-red-700">
                            - {formatCurrency(c.valor)}
                          </td>
                          <td className="py-2 px-3 text-right">
                            <button onClick={() => deleteCusto(c.id)} className="p-1 text-gray-400 hover:text-red-500 transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
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

      {/* Aba Equipamentos */}
      {aba === 'equipamentos' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-gray-900">Equipamentos e Amortizacao</h3>
            <button
              onClick={() => { setFormEq(novoEquipamento()); setShowFormEq(true) }}
              className="btn-primary flex items-center gap-1.5 text-sm"
            >
              <Plus className="w-4 h-4" /> Novo Equipamento
            </button>
          </div>

          {/* Formulario equipamento */}
          {showFormEq && formEq && (
            <div className="card border border-orange-200 bg-orange-50/30 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Descricao</label>
                  <input
                    type="text" value={formEq.descricao}
                    onChange={(e) => setFormEq({ ...formEq, descricao: e.target.value })}
                    className="input-field" placeholder="Ex: Maquina POS, Servidor..."
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Valor Total (R$)</label>
                  <input
                    type="number" value={formEq.valorTotal || ''}
                    onChange={(e) => {
                      const v = Number(e.target.value)
                      setFormEq({
                        ...formEq,
                        valorTotal: v,
                        valorParcela: v > 0 && formEq.numeroParcelas > 0 ? Number((v / formEq.numeroParcelas).toFixed(2)) : formEq.valorParcela,
                      })
                    }}
                    className="input-field" min={0} step={100}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Numero de Parcelas</label>
                  <input
                    type="number" value={formEq.numeroParcelas}
                    onChange={(e) => {
                      const n = Math.max(1, Number(e.target.value))
                      setFormEq({
                        ...formEq,
                        numeroParcelas: n,
                        valorParcela: formEq.valorTotal > 0 ? Number((formEq.valorTotal / n).toFixed(2)) : formEq.valorParcela,
                      })
                    }}
                    className="input-field" min={1} step={1}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Parcelas Pagas</label>
                  <input
                    type="number" value={formEq.parcelasPagas}
                    onChange={(e) => setFormEq({ ...formEq, parcelasPagas: Math.min(Number(e.target.value), formEq.numeroParcelas) })}
                    className="input-field" min={0} step={1} max={formEq.numeroParcelas}
                  />
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
                  <th className="text-left py-2 px-3 font-medium text-gray-500">Descricao</th>
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
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-gray-400">
                      Nenhum equipamento cadastrado
                    </td>
                  </tr>
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
                        <td className="py-2 px-3 text-right text-emerald-700">
                          {formatCurrency(eq.parcelasPagas * eq.valorParcela)}
                        </td>
                        <td className="py-2 px-3 text-right text-red-700">
                          {restantes > 0 ? formatCurrency(restantes * eq.valorParcela) : '—'}
                        </td>
                        <td className="py-2 px-3 text-right font-medium">
                          {restantes > 0 ? formatCurrency(eq.valorParcela) : (
                            <span className="text-emerald-600 text-xs font-semibold">Quitado</span>
                          )}
                        </td>
                        <td className="py-2 px-3 text-right">
                          <div className="flex items-center gap-1 justify-end">
                            {restantes > 0 && (
                              <button
                                onClick={() => saveEquipamento({ ...eq, parcelasPagas: eq.parcelasPagas + 1 })}
                                title="Registrar parcela paga"
                                className="p-1 text-emerald-400 hover:text-emerald-600 transition-colors"
                              >
                                <ChevronUp className="w-4 h-4" />
                              </button>
                            )}
                            {eq.parcelasPagas > 0 && (
                              <button
                                onClick={() => saveEquipamento({ ...eq, parcelasPagas: eq.parcelasPagas - 1 })}
                                title="Desfazer ultima parcela"
                                className="p-1 text-gray-400 hover:text-orange-500 transition-colors"
                              >
                                <ChevronDown className="w-4 h-4" />
                              </button>
                            )}
                            <button onClick={() => deleteEquipamento(eq.id)} className="p-1 text-gray-400 hover:text-red-500 transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
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
    </div>
  )
}
