// ═══════════════════════════════════════════════════════════════
// Comissionamento — Modulo Equipe
// Remuneracao por representante, panorama da carteira, margem
// Conforme fluxograma: seletor vendedor + calculos + tabela
// ═══════════════════════════════════════════════════════════════

import { useState, useMemo } from 'react'
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
} from 'recharts'
import { DollarSign, User, TrendingUp, Percent } from 'lucide-react'
import { useEquipeData } from '../../hooks/useEquipeData'
import { LoadingState } from '../../components/LoadingState'
import { formatCurrency, formatPercent, calcAtingimento } from '../../utils/format'
import type { Vendedor } from '../../types'

export function EquipeComissionamento() {
  const { vendedores, isLoading } = useEquipeData()
  const [vendedorId, setVendedorId] = useState<number | null>(null)

  // Vendedor selecionado (ou o primeiro)
  const vendedorSelecionado = useMemo((): Vendedor | null => {
    if (vendedores.length === 0) return null
    if (vendedorId === null) return vendedores[0]
    return vendedores.find((v) => v.id === vendedorId) || vendedores[0]
  }, [vendedores, vendedorId])

  // Calculos de comissao
  const comissao = useMemo(() => {
    if (!vendedorSelecionado) return null
    const v = vendedorSelecionado
    const fat = v.faturamentoMensal
    const meta = v.metaMensal
    const atingimento = calcAtingimento(fat, meta)
    const comissaoBase = fat * (v.comissaoBase / 100)
    const bonusValor = atingimento >= 100 ? fat * (v.bonus / 100) : 0
    const total = comissaoBase + bonusValor

    return {
      faturamento: fat,
      meta,
      atingimento,
      comissaoBase,
      pctBase: v.comissaoBase,
      bonusValor,
      pctBonus: v.bonus,
      elegivel: atingimento >= 100,
      total,
      margem: fat > 0 ? (total / fat) * 100 : 0,
    }
  }, [vendedorSelecionado])

  // Dados da pizza
  const pieData = useMemo(() => {
    if (!comissao) return []
    return [
      { name: 'Comissao Base', value: comissao.comissaoBase, color: '#00C896' },
      { name: 'Bonus', value: comissao.bonusValor, color: '#3B82F6' },
    ].filter((d) => d.value > 0)
  }, [comissao])

  // Resumo todos vendedores
  const resumoGeral = useMemo(() => {
    return vendedores.map((v) => {
      const fat = v.faturamentoMensal
      const ating = calcAtingimento(fat, v.metaMensal)
      const base = fat * (v.comissaoBase / 100)
      const bonus = ating >= 100 ? fat * (v.bonus / 100) : 0
      return {
        id: v.id,
        nome: v.nome,
        avatar: v.avatar,
        regiao: v.regiao,
        faturamento: fat,
        atingimento: ating,
        comissaoTotal: base + bonus,
        pctComissao: fat > 0 ? ((base + bonus) / fat) * 100 : 0,
      }
    }).sort((a, b) => b.comissaoTotal - a.comissaoTotal)
  }, [vendedores])

  if (isLoading) return <LoadingState message="Carregando comissionamento..." />

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <DollarSign className="w-7 h-7 text-emerald-500" />
          Comissionamento
        </h1>
        <p className="text-gray-500 mt-1">Remuneracao por representante e panorama da carteira</p>
      </div>

      {/* Seletor de vendedor */}
      {vendedores.length > 0 && (
        <div className="card">
          <h3 className="text-sm font-medium text-gray-500 mb-3">Selecione o vendedor</h3>
          <div className="flex flex-wrap gap-2">
            {vendedores.map((v) => (
              <button
                key={v.id}
                onClick={() => setVendedorId(v.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${
                  vendedorSelecionado?.id === v.id
                    ? 'bg-emerald-500 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  vendedorSelecionado?.id === v.id ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {v.avatar}
                </div>
                {v.nome.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Detalhes do vendedor selecionado */}
      {vendedorSelecionado && comissao && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Perfil e KPIs */}
          <div className="space-y-4">
            <div className="card">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xl font-bold">
                  {vendedorSelecionado.avatar}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-lg">{vendedorSelecionado.nome}</p>
                  <p className="text-sm text-gray-500">{vendedorSelecionado.regiao}</p>
                </div>
              </div>
              <div className="space-y-3">
                <InfoRow icon={<DollarSign className="w-4 h-4" />} label="Faturamento" value={formatCurrency(comissao.faturamento)} />
                <InfoRow icon={<TrendingUp className="w-4 h-4" />} label="Meta" value={formatCurrency(comissao.meta)} />
                <InfoRow icon={<Percent className="w-4 h-4" />} label="Atingimento" value={formatPercent(comissao.atingimento)} highlight={comissao.atingimento >= 100} />
                <InfoRow icon={<User className="w-4 h-4" />} label="Comissao Base" value={`${comissao.pctBase}%`} />
                <InfoRow icon={<User className="w-4 h-4" />} label="Bonus" value={`${comissao.pctBonus}%`} />
              </div>
            </div>

            {/* Comissao Total */}
            <div className="card bg-emerald-50 border-emerald-200">
              <p className="text-sm text-emerald-700 font-medium">Comissao Total</p>
              <p className="text-3xl font-bold text-emerald-800 mt-1">{formatCurrency(comissao.total)}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className={comissao.elegivel ? 'badge-success' : 'badge-warning'}>
                  {comissao.elegivel ? 'Bonus atingido' : 'Bonus nao atingido'}
                </span>
                <span className="text-xs text-emerald-600">
                  Margem: {formatPercent(comissao.margem)}
                </span>
              </div>
            </div>
          </div>

          {/* Grafico pizza */}
          <div className="card lg:col-span-2">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Composicao da Comissao</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%" cy="50%"
                    innerRadius={60} outerRadius={90}
                    dataKey="value"
                    paddingAngle={4}
                  >
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-col justify-center space-y-4">
                <div className="p-4 bg-emerald-50 rounded-xl">
                  <p className="text-xs text-gray-500 uppercase font-medium">Comissao Base ({comissao.pctBase}%)</p>
                  <p className="text-xl font-bold text-gray-900 mt-1">{formatCurrency(comissao.comissaoBase)}</p>
                </div>
                <div className="p-4 bg-blue-50 rounded-xl">
                  <p className="text-xs text-gray-500 uppercase font-medium">Bonus ({comissao.pctBonus}%)</p>
                  <p className="text-xl font-bold text-gray-900 mt-1">{formatCurrency(comissao.bonusValor)}</p>
                  {!comissao.elegivel && (
                    <p className="text-xs text-amber-600 mt-1">Atinja 100% da meta para desbloquear</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabela resumo todos vendedores */}
      {resumoGeral.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Panorama Geral de Comissoes</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-3 font-medium text-gray-500">Vendedor</th>
                  <th className="text-left py-3 px-3 font-medium text-gray-500">Regiao</th>
                  <th className="text-right py-3 px-3 font-medium text-gray-500">Faturamento</th>
                  <th className="text-right py-3 px-3 font-medium text-gray-500">% Ating.</th>
                  <th className="text-right py-3 px-3 font-medium text-gray-500">Comissao</th>
                  <th className="text-right py-3 px-3 font-medium text-gray-500">% Margem</th>
                </tr>
              </thead>
              <tbody>
                {resumoGeral.map((r) => (
                  <tr
                    key={r.id}
                    className={`border-b border-gray-50 hover:bg-gray-50 cursor-pointer ${vendedorSelecionado?.id === r.id ? 'bg-emerald-50' : ''}`}
                    onClick={() => setVendedorId(r.id)}
                  >
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center text-xs font-bold">
                          {r.avatar}
                        </div>
                        <span className="font-medium">{r.nome}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-gray-500">{r.regiao}</td>
                    <td className="py-3 px-3 text-right font-medium">{formatCurrency(r.faturamento)}</td>
                    <td className="py-3 px-3 text-right">
                      <span className={r.atingimento >= 100 ? 'badge-success' : 'badge-warning'}>
                        {formatPercent(r.atingimento)}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-semibold text-emerald-700">{formatCurrency(r.comissaoTotal)}</td>
                    <td className="py-3 px-3 text-right text-gray-500">{formatPercent(r.pctComissao)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

function InfoRow({ icon, label, value, highlight }: { icon: React.ReactNode; label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2 text-gray-500">
        {icon}
        <span className="text-sm">{label}</span>
      </div>
      <span className={`text-sm font-medium ${highlight ? 'text-emerald-600' : 'text-gray-900'}`}>{value}</span>
    </div>
  )
}
