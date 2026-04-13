// ═══════════════════════════════════════════════════════════════
// Custos e Receitas — Modulo Interno
// Caixa projetado, extratos e categorias
// Conforme fluxograma: importacao de extrato, multi-contas, cat.
// ═══════════════════════════════════════════════════════════════

import { useState, useMemo } from 'react'
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import { Wallet, Search, Filter, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { useInternoData } from '../../hooks/useInternoData'
import { LoadingState } from '../../components/LoadingState'
import { formatCurrency, getChartColor, parseDateBR } from '../../utils/format'

export function InternoCustos() {
  const { lancamentos, categorias, contas, isLoading } = useInternoData()
  const [filtroCategoria, setFiltroCategoria] = useState('todas')
  const [filtroConta, setFiltroConta] = useState('todas')
  const [filtroTipo, setFiltroTipo] = useState<'todos' | 'receita' | 'despesa'>('todos')
  const [busca, setBusca] = useState('')

  // Lancamentos filtrados — ordenados por data (mais antigo primeiro)
  const filtrados = useMemo(() => {
    return lancamentos
      .filter((l) => {
        if (filtroCategoria !== 'todas' && l.categoria !== filtroCategoria) return false
        if (filtroConta !== 'todas' && l.conta !== filtroConta) return false
        if (filtroTipo !== 'todos' && l.tipo !== filtroTipo) return false
        if (busca && !l.descricao.toLowerCase().includes(busca.toLowerCase())) return false
        return true
      })
      .sort((a, b) => parseDateBR(a.data).getTime() - parseDateBR(b.data).getTime())
  }, [lancamentos, filtroCategoria, filtroConta, filtroTipo, busca])

  // Totais — ERRO 01: separar receita bruta, custo conta digital e receita liquida
  const totais = useMemo(() => {
    const receitaBruta = filtrados.filter((l) => l.tipo === 'receita').reduce((s, l) => s + l.valor, 0)
    const custoContaDigital = filtrados
      .filter((l) => l.categoria === 'Conta Digital')
      .reduce((s, l) => s + l.valor, 0)
    const receitaLiquida = receitaBruta - custoContaDigital
    const despesas = filtrados.filter((l) => l.tipo === 'despesa').reduce((s, l) => s + l.valor, 0)
    return { receitaBruta, custoContaDigital, receitaLiquida, despesas, saldo: receitaBruta - despesas }
  }, [filtrados])

  // Dados por categoria (pizza)
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

  // Dados por conta (barras)
  const porConta = useMemo(() => {
    const map = new Map<string, { receitas: number; despesas: number }>()
    filtrados.forEach((l) => {
      const conta = l.conta || 'Sem conta'
      const curr = map.get(conta) || { receitas: 0, despesas: 0 }
      if (l.tipo === 'receita') curr.receitas += l.valor
      else curr.despesas += Math.abs(l.valor)
      map.set(conta, curr)
    })
    return Array.from(map.entries()).map(([name, data]) => ({
      name, ...data,
    }))
  }, [filtrados])

  if (isLoading) return <LoadingState message="Carregando custos e receitas..." />

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <Wallet className="w-7 h-7 text-blue-500" />
          Custos e Receitas
        </h1>
        <p className="text-gray-500 mt-1">Caixa projetado, extratos e categorias</p>
      </div>

      {/* KPIs — ERRO 01: receita bruta / custo conta digital / receita liquida / saldo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card-hover">
          <div className="flex items-center gap-2 mb-2">
            <ArrowUpRight className="w-5 h-5 text-emerald-500" />
            <span className="text-sm text-gray-500">Receita Bruta</span>
          </div>
          <p className="text-2xl font-bold text-emerald-700">{formatCurrency(totais.receitaBruta)}</p>
          <p className="text-xs text-gray-400 mt-1">Total de receitas do periodo</p>
        </div>
        <div className="card-hover border border-orange-100">
          <div className="flex items-center gap-2 mb-2">
            <ArrowDownRight className="w-5 h-5 text-orange-500" />
            <span className="text-sm text-gray-500">Custo Conta Digital</span>
          </div>
          <p className="text-2xl font-bold text-orange-600">- {formatCurrency(totais.custoContaDigital)}</p>
          <p className="text-xs text-gray-400 mt-1">Cobr. de contas digitais ativas</p>
        </div>
        <div className="card-hover border border-blue-100">
          <div className="flex items-center gap-2 mb-2">
            <Wallet className="w-5 h-5 text-blue-500" />
            <span className="text-sm text-gray-500">Receita Liquida</span>
          </div>
          <p className={`text-2xl font-bold ${totais.receitaLiquida >= 0 ? 'text-blue-700' : 'text-red-700'}`}>
            {formatCurrency(totais.receitaLiquida)}
          </p>
          <p className="text-xs text-gray-400 mt-1">Bruta - Custo Conta Digital</p>
        </div>
        <div className="card-hover">
          <div className="flex items-center gap-2 mb-2">
            <ArrowDownRight className="w-5 h-5 text-red-500" />
            <span className="text-sm text-gray-500">Saldo Total</span>
          </div>
          <p className={`text-2xl font-bold ${totais.saldo >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
            {formatCurrency(totais.saldo)}
          </p>
          <p className="text-xs text-gray-400 mt-1">Receita - Todas despesas</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="card">
        <div className="flex flex-wrap gap-3 items-center">
          <Filter className="w-4 h-4 text-gray-400" />
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text" value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar lancamento..."
              className="input-field pl-10"
            />
          </div>
          <select value={filtroCategoria} onChange={(e) => setFiltroCategoria(e.target.value)} className="input-field w-auto">
            <option value="todas">Todas categorias</option>
            {categorias.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={filtroConta} onChange={(e) => setFiltroConta(e.target.value)} className="input-field w-auto">
            <option value="todas">Todas contas</option>
            {contas.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value as 'todos' | 'receita' | 'despesa')} className="input-field w-auto">
            <option value="todos">Todos tipos</option>
            <option value="receita">Receitas</option>
            <option value="despesa">Despesas</option>
          </select>
        </div>
      </div>

      {/* Graficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pizza por categoria */}
        {porCategoria.length > 0 && (
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Por Categoria</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={porCategoria} cx="50%" cy="50%"
                  outerRadius={100} dataKey="value"
                  paddingAngle={2} label={({ name, percent }) => `${String(name || '')} (${((Number(percent) || 0) * 100).toFixed(0)}%)`}
                >
                  {porCategoria.map((_, i) => (
                    <Cell key={i} fill={getChartColor(i)} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Barras por conta */}
        {porConta.length > 0 && (
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Por Conta</h3>
            <ResponsiveContainer width="100%" height={300}>
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

      {/* Tabela de lancamentos */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Lancamentos ({filtrados.length})
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-3 font-medium text-gray-500">Data</th>
                <th className="text-left py-3 px-3 font-medium text-gray-500">CNPJ</th>
                <th className="text-left py-3 px-3 font-medium text-gray-500">Nome Fantasia / Descricao</th>
                <th className="text-left py-3 px-3 font-medium text-gray-500">Categoria</th>
                <th className="text-left py-3 px-3 font-medium text-gray-500">Tipo</th>
                <th className="text-right py-3 px-3 font-medium text-gray-500">Valor</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-gray-400">
                    Nenhum lancamento encontrado
                  </td>
                </tr>
              ) : (
                filtrados.map((l) => (
                  <tr key={l.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-3 px-3 text-gray-500">{l.data}</td>
                    <td className="py-3 px-3 text-gray-500 text-xs font-mono">{l.cnpjCliente || '—'}</td>
                    <td className="py-3 px-3 font-medium">{l.nomeCliente || l.descricao}</td>
                    <td className="py-3 px-3 text-gray-500">{l.categoria}</td>
                    <td className="py-3 px-3">
                      <span className={l.tipo === 'receita' ? 'badge-success' : 'badge-error'}>
                        {l.tipo}
                      </span>
                    </td>
                    <td className={`py-3 px-3 text-right font-medium ${l.tipo === 'receita' ? 'text-emerald-700' : 'text-red-700'}`}>
                      {l.tipo === 'receita' ? '+' : '-'}{formatCurrency(Math.abs(l.valor))}
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
