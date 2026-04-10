// ═══════════════════════════════════════════════════════════════
// DRE Gerencial — Modulo Interno
// Demonstracao de resultados com estrutura correta:
// Receitas Operacionais → Deduções → Resultado Liquido
// TPV é informativo (volume dos ECs), nao linha de resultado
// ═══════════════════════════════════════════════════════════════

import { useMemo } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, Legend,
} from 'recharts'
import { FileBarChart, TrendingUp, TrendingDown, ArrowRight, CreditCard, Users } from 'lucide-react'
import { useInternoData } from '../../hooks/useInternoData'
import { LoadingState } from '../../components/LoadingState'
import { formatCurrency, formatCurrencyShort, formatPercent } from '../../utils/format'
import type { DadosFechamento } from '../../types'

export function InternoDRE() {
  const { fechamentos, fechamentoAtual, isLoading } = useInternoData()

  // Estrutura correta do DRE:
  // Receitas: Markup POS + Comissao Rede + Repasse
  // Deducoes: Fatura Conta Digital + Descontos
  // Resultado: Valor Liquido (= Receitas - Deducoes)
  const dreData = useMemo(() => {
    if (!fechamentoAtual) return null
    const f = fechamentoAtual

    const totalReceitas = f.markupPos + f.comissaoRede + f.repasse
    const totalDeducoes = f.faturaDigital + f.descontos

    return {
      receitas: [
        { id: 'markup', descricao: 'Markup POS', valor: f.markupPos },
        { id: 'comissao', descricao: 'Comissao de Rede', valor: f.comissaoRede },
        { id: 'repasse', descricao: 'Repasse', valor: f.repasse },
      ],
      deducoes: [
        { id: 'fatura', descricao: 'Cobranca Conta Digital', valor: f.faturaDigital },
        { id: 'descontos', descricao: 'Descontos do Periodo', valor: f.descontos },
      ],
      totalReceitas,
      totalDeducoes,
      valorLiquido: f.valorLiquido,
      // Verificacao: totalReceitas - totalDeducoes deve bater com valorLiquido
      calculado: totalReceitas - totalDeducoes,
    }
  }, [fechamentoAtual])

  // Waterfall chart: composicao do resultado (sem TPV — TPV e volume dos ECs, nao receita)
  const waterfallData = useMemo(() => {
    if (!fechamentoAtual) return []
    const f = fechamentoAtual
    return [
      { name: 'Markup POS', valor: f.markupPos, tipo: 'positivo' },
      { name: 'Comissao', valor: f.comissaoRede, tipo: 'positivo' },
      { name: 'Repasse', valor: f.repasse, tipo: 'positivo' },
      { name: 'Conta Digital', valor: -f.faturaDigital, tipo: 'negativo' },
      { name: 'Descontos', valor: -f.descontos, tipo: 'negativo' },
      { name: 'Liquido', valor: f.valorLiquido, tipo: 'destaque' },
    ]
  }, [fechamentoAtual])

  // Evolucao por periodo
  const evolucaoPeriodo = useMemo(() => {
    return fechamentos.map((f: DadosFechamento) => ({
      periodo: f.periodo,
      markup: f.markupPos,
      liquido: f.valorLiquido,
    }))
  }, [fechamentos])

  if (isLoading) return <LoadingState message="Carregando DRE..." />

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <FileBarChart className="w-7 h-7 text-blue-500" />
          DRE Gerencial
        </h1>
        <p className="text-gray-500 mt-1">Demonstrativo de resultado — {fechamentoAtual?.periodo || 'sem dados'}</p>
      </div>

      {fechamentoAtual && (
        <>
          {/* Contexto operacional (informativo — TPV e ECs nao sao receita da empresa) */}
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
            <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-3">
              Contexto Operacional (volume dos ECs — nao e receita da empresa)
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3">
                <CreditCard className="w-5 h-5 text-blue-500 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-500">TPV Total</p>
                  <p className="text-lg font-bold text-gray-800">{formatCurrency(fechamentoAtual.tpvTotal)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-blue-500 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-500">ECs Ativos</p>
                  <p className="text-lg font-bold text-gray-800">{fechamentoAtual.ecsAtivos}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <TrendingUp className="w-5 h-5 text-blue-500 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-500">TPV Medio por EC</p>
                  <p className="text-lg font-bold text-gray-800">{formatCurrency(fechamentoAtual.tpvMedio)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* KPIs do resultado */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <DRECard
              label="Markup POS"
              value={formatCurrency(fechamentoAtual.markupPos)}
              variacao={fechamentoAtual.variacaoMarkup}
              icon={<TrendingUp className="w-5 h-5" />}
              color="emerald"
            />
            <DRECard
              label="Taxa de Margem"
              value={formatPercent(fechamentoAtual.taxaMargem, 2)}
              variacao={fechamentoAtual.variacaoMargem}
              icon={<TrendingUp className="w-5 h-5" />}
              color="blue"
            />
            <DRECard
              label="Total Deducoes"
              value={`- ${formatCurrency(fechamentoAtual.faturaDigital + fechamentoAtual.descontos)}`}
              icon={<TrendingDown className="w-5 h-5" />}
              color="red"
            />
            <DRECard
              label="Valor Liquido"
              value={formatCurrency(fechamentoAtual.valorLiquido)}
              icon={<ArrowRight className="w-5 h-5" />}
              color="navy"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Tabela DRE estruturada */}
            {dreData && (
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Demonstrativo — {fechamentoAtual.periodo}
                </h3>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 px-3 font-medium text-gray-500">Descricao</th>
                      <th className="text-right py-2 px-3 font-medium text-gray-500">Valor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Secao: Receitas Operacionais */}
                    <tr className="bg-gray-50">
                      <td colSpan={2} className="py-2 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        Receitas Operacionais
                      </td>
                    </tr>
                    {dreData.receitas.map((linha) => (
                      <tr key={linha.id} className="border-b border-gray-50">
                        <td className="py-2 px-3 pl-6 text-gray-700">{linha.descricao}</td>
                        <td className="py-2 px-3 text-right font-medium text-emerald-700">
                          {formatCurrency(linha.valor)}
                        </td>
                      </tr>
                    ))}
                    <tr className="border-b-2 border-gray-200">
                      <td className="py-2 px-3 font-semibold text-gray-800">Total Receitas</td>
                      <td className="py-2 px-3 text-right font-bold text-emerald-800">
                        {formatCurrency(dreData.totalReceitas)}
                      </td>
                    </tr>

                    {/* Secao: Deducoes */}
                    <tr className="bg-gray-50">
                      <td colSpan={2} className="py-2 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        Deducoes
                      </td>
                    </tr>
                    {dreData.deducoes.map((linha) => (
                      <tr key={linha.id} className="border-b border-gray-50">
                        <td className="py-2 px-3 pl-6 text-gray-700">{linha.descricao}</td>
                        <td className="py-2 px-3 text-right font-medium text-red-600">
                          - {formatCurrency(linha.valor)}
                        </td>
                      </tr>
                    ))}
                    <tr className="border-b-2 border-gray-200">
                      <td className="py-2 px-3 font-semibold text-gray-800">Total Deducoes</td>
                      <td className="py-2 px-3 text-right font-bold text-red-700">
                        - {formatCurrency(dreData.totalDeducoes)}
                      </td>
                    </tr>

                    {/* Resultado Liquido */}
                    <tr className="bg-blue-50">
                      <td className="py-3 px-3 font-bold text-blue-900 flex items-center gap-2">
                        <ArrowRight className="w-4 h-4 inline" />
                        Valor Liquido a Receber
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-blue-900 text-base">
                        {formatCurrency(dreData.valorLiquido)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {/* Waterfall Chart */}
            {waterfallData.length > 0 && (
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Composicao do Resultado</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={waterfallData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                    <YAxis tickFormatter={(v: number) => formatCurrencyShort(v)} tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Bar dataKey="valor" radius={[4, 4, 0, 0]}>
                      {waterfallData.map((entry, i) => (
                        <Cell
                          key={i}
                          fill={
                            entry.tipo === 'positivo' ? '#00C896'
                            : entry.tipo === 'negativo' ? '#EF4444'
                            : '#3B82F6'
                          }
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </>
      )}

      {/* Evolucao por periodo (so aparece com 2+ fechamentos) */}
      {evolucaoPeriodo.length > 1 && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Evolucao por Periodo</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={evolucaoPeriodo}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="periodo" tick={{ fontSize: 11 }} />
              <YAxis tickFormatter={(v: number) => formatCurrencyShort(v)} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Legend />
              <Bar dataKey="markup" name="Markup POS" fill="#00C896" radius={[4, 4, 0, 0]} />
              <Bar dataKey="liquido" name="Valor Liquido" fill="#3B82F6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Vazio */}
      {!fechamentoAtual && !isLoading && (
        <div className="card text-center py-12">
          <FileBarChart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-500">Sem dados de fechamento</h3>
          <p className="text-sm text-gray-400 mt-1">Conecte uma planilha com abas de fechamento.</p>
        </div>
      )}
    </div>
  )
}

function DRECard({ label, value, variacao, icon, color }: {
  label: string; value: string; variacao?: number; icon: React.ReactNode
  color: 'emerald' | 'blue' | 'red' | 'navy'
}) {
  const bgMap = {
    emerald: 'bg-emerald-50 text-emerald-600',
    blue: 'bg-blue-50 text-blue-600',
    red: 'bg-red-50 text-red-600',
    navy: 'bg-navy-50 text-navy-600',
  }
  return (
    <div className="card-hover">
      <div className="flex items-center justify-between mb-2">
        <div className={`p-2 rounded-lg ${bgMap[color]}`}>{icon}</div>
        {variacao !== undefined && (
          <span className={`text-xs font-medium ${variacao >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
            {variacao >= 0 ? '+' : ''}{formatPercent(variacao)}
          </span>
        )}
      </div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-xl font-bold text-gray-900 mt-1">{value}</p>
    </div>
  )
}
