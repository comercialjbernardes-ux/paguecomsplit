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
import { FileBarChart, TrendingUp, TrendingDown, ArrowRight, CreditCard, Users, BookOpen } from 'lucide-react'
import { useInternoData } from '../../hooks/useInternoData'
import { useDataContext } from '../../contexts/DataContext'
import { LoadingState } from '../../components/LoadingState'
import { formatCurrency, formatCurrencyShort, formatPercent } from '../../utils/format'
import type { DadosFechamento } from '../../types'
import { PRECO_CONTA_DIGITAL } from '../../constants/empresa'

export function InternoDRE() {
  const { fechamentos, fechamentoAtual, lancamentos, clientes, isLoading } = useInternoData()
  const { equipamentos } = useDataContext()

  // Estrutura correta do DRE:
  // Receitas: Markup POS + Comissao Rede + Repasse
  // Deducoes: Fatura Conta Digital + Descontos + Deducoes Lancadas (local)
  // Resultado: Valor Liquido Ajustado (= Receitas - Todas Deducoes)
  const dreData = useMemo(() => {
    if (!fechamentoAtual) return null
    const f = fechamentoAtual

    const totalReceitas = f.markupPos + f.comissaoRede + f.repasse

    // Margem real = Markup POS / TPV Total (quanto a empresa ganha sobre o volume processado)
    // Ex: R$28.759 markup / R$2.728.746 TPV = 1,054% — NAO dividir por receitas internas
    const margemCalculada = f.tpvTotal > 0
      ? (f.markupPos / f.tpvTotal) * 100
      : (f.taxaMargem ?? 0) * 100  // taxaMargem stored as decimal (0.01 = 1%)

    // ERRO 05: deducoes locais (lancamentos manuais de despesa)
    const totalDeducoesLocais = lancamentos
      .filter((l) => l.tipo === 'despesa' && l.source === 'local')
      .reduce((s, l) => s + l.valor, 0)

    // ERRO 02: deducoes de equipamentos com parcelas ativas
    const totalEquipMensal = equipamentos.reduce((s, eq) => {
      const restantes = eq.numeroParcelas - eq.parcelasPagas
      return s + (restantes > 0 ? eq.valorParcela : 0)
    }, 0)

    const deducoes: { id: string; descricao: string; valor: number; isLocal?: boolean; isEquip?: boolean }[] = [
      { id: 'fatura', descricao: 'Cobranca Conta Digital', valor: f.faturaDigital },
      { id: 'descontos', descricao: 'Descontos do Periodo', valor: f.descontos },
    ]
    if (totalEquipMensal > 0) {
      deducoes.push({ id: 'equip', descricao: 'Ded. Equipamentos/Maquinas', valor: totalEquipMensal, isEquip: true })
    }
    if (totalDeducoesLocais > 0) {
      deducoes.push({ id: 'local', descricao: 'Deducoes Lancadas', valor: totalDeducoesLocais, isLocal: true })
    }

    const totalDeducoes = f.faturaDigital + f.descontos + totalEquipMensal + totalDeducoesLocais

    return {
      receitas: [
        { id: 'markup', descricao: 'Markup POS', valor: f.markupPos },
        { id: 'comissao', descricao: 'Comissao de Rede', valor: f.comissaoRede },
        { id: 'repasse', descricao: 'Repasse', valor: f.repasse },
      ],
      deducoes,
      totalReceitas,
      totalDeducoes,
      valorLiquido: f.valorLiquido,
      valorLiquidoAjustado: f.valorLiquido - totalDeducoesLocais - totalEquipMensal,
      calculado: totalReceitas - totalDeducoes,
      margemCalculada,
      temDeducoesLocais: totalDeducoesLocais > 0,
      temEquip: totalEquipMensal > 0,
      totalEquipMensal,
    }
  }, [fechamentoAtual, lancamentos, equipamentos])

  // Waterfall chart: composicao do resultado (sem TPV — TPV e volume dos ECs, nao receita)
  const waterfallData = useMemo(() => {
    if (!dreData) return []
    const f = fechamentoAtual!
    const entries: { name: string; valor: number; tipo: string }[] = [
      { name: 'Markup POS', valor: f.markupPos, tipo: 'positivo' },
      { name: 'Comissao', valor: f.comissaoRede, tipo: 'positivo' },
      { name: 'Repasse', valor: f.repasse, tipo: 'positivo' },
      { name: 'Conta Digital', valor: -f.faturaDigital, tipo: 'negativo' },
      { name: 'Descontos', valor: -f.descontos, tipo: 'negativo' },
    ]
    if (dreData.temEquip) {
      entries.push({ name: 'Equipamentos', valor: -dreData.totalEquipMensal, tipo: 'negativo' })
    }
    if (dreData.temDeducoesLocais) {
      const localTotal = dreData.totalDeducoes - f.faturaDigital - f.descontos - dreData.totalEquipMensal
      entries.push({ name: 'Ded. Manuais', valor: -localTotal, tipo: 'negativo' })
    }
    entries.push({ name: 'Liquido', valor: dreData.valorLiquidoAjustado, tipo: 'destaque' })
    return entries
  }, [dreData, fechamentoAtual])

  // Evolucao por periodo
  const evolucaoPeriodo = useMemo(() => {
    return fechamentos.map((f: DadosFechamento) => ({
      periodo: f.periodo,
      markup: f.markupPos,
      liquido: f.valorLiquido,
    }))
  }, [fechamentos])

  // Lancamentos locais do periodo atual (fonte: localStorage via DataContext)
  const lancamentosLocais = useMemo(() => {
    return lancamentos.filter((l) => l.source === 'local')
  }, [lancamentos])

  const receitasLocais = useMemo(() =>
    lancamentosLocais.filter((l) => l.tipo === 'receita'),
  [lancamentosLocais])

  const despesasLocais = useMemo(() =>
    lancamentosLocais.filter((l) => l.tipo === 'despesa'),
  [lancamentosLocais])

  const totalReceitasLocais = receitasLocais.reduce((s, l) => s + l.valor, 0)
  const totalDespesasLocais = despesasLocais.reduce((s, l) => s + l.valor, 0)

  // Receita recorrente = ECs com conta digital ativa × R$29,90/mes
  const ecsComContaDigital = useMemo(() =>
    clientes.filter((c) => c.contaDigitalAtiva), [clientes])
  const receitaRecorrente = ecsComContaDigital.length * PRECO_CONTA_DIGITAL

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
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <DRECard
              label="Markup POS"
              value={formatCurrency(fechamentoAtual.markupPos)}
              variacao={fechamentoAtual.variacaoMarkup}
              icon={<TrendingUp className="w-5 h-5" />}
              color="emerald"
            />
            <DRECard
              label="Repasse"
              value={formatCurrency(fechamentoAtual.repasse)}
              icon={<ArrowRight className="w-5 h-5" />}
              color="blue"
            />
            <DRECard
              label="Taxa de Margem"
              value={formatPercent(dreData?.margemCalculada ?? fechamentoAtual.taxaMargem, 2)}
              variacao={fechamentoAtual.variacaoMargem}
              icon={<TrendingUp className="w-5 h-5" />}
              color={
                (dreData?.margemCalculada ?? fechamentoAtual.taxaMargem) >= 2 ? 'emerald'
                : (dreData?.margemCalculada ?? fechamentoAtual.taxaMargem) >= 1 ? 'blue'
                : 'red'
              }
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

          {/* Receita Recorrente Garantida */}
          {receitaRecorrente > 0 && (
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide">Receita Fixa Conta Digital</p>
                <p className="text-2xl font-bold text-blue-700 mt-1">{formatCurrency(receitaRecorrente)}</p>
                <p className="text-sm text-blue-500 mt-1">
                  {ecsComContaDigital.length} ECs × R$29,90 — garantido independente do TPV
                </p>
              </div>
              <CreditCard className="w-10 h-10 text-blue-300 flex-shrink-0" />
            </div>
          )}

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
                        <td className={`py-2 px-3 pl-6 ${linha.isLocal ? 'text-amber-700 font-medium' : linha.isEquip ? 'text-orange-700 font-medium' : 'text-gray-700'}`}>
                          {linha.descricao}
                          {linha.isLocal && (
                            <span className="ml-2 text-xs bg-amber-100 text-amber-600 px-1.5 py-0.5 rounded">manual</span>
                          )}
                          {linha.isEquip && (
                            <span className="ml-2 text-xs bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded">equipamento</span>
                          )}
                        </td>
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
                        {dreData.temDeducoesLocais && (
                          <span className="text-xs font-normal text-amber-600 ml-1">(ajustado)</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-blue-900 text-base">
                        {formatCurrency(dreData.valorLiquidoAjustado)}
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

      {/* Lancamentos Manuais — separados do DRE base */}
      {lancamentosLocais.length > 0 && (
        <div className="card border border-amber-200 bg-amber-50/40">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="w-5 h-5 text-amber-600" />
            <h3 className="text-lg font-semibold text-gray-900">Lancamentos Manuais</h3>
            <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
              {lancamentosLocais.length} registro(s) local
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="bg-white rounded-xl p-4 border border-emerald-100">
              <p className="text-xs font-semibold text-emerald-700 uppercase mb-2">Receitas Adicionais</p>
              {receitasLocais.length === 0 ? (
                <p className="text-sm text-gray-400">Nenhuma receita manual</p>
              ) : (
                <>
                  {receitasLocais.map((l) => (
                    <div key={l.id} className="flex justify-between text-sm py-1 border-b border-gray-50 last:border-0">
                      <span className="text-gray-700">{l.descricao}</span>
                      <span className="text-emerald-700 font-medium">+ {formatCurrency(l.valor)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between text-sm font-bold pt-2 mt-1 border-t border-emerald-200">
                    <span>Total receitas manuais</span>
                    <span className="text-emerald-700">+ {formatCurrency(totalReceitasLocais)}</span>
                  </div>
                </>
              )}
            </div>
            <div className="bg-white rounded-xl p-4 border border-red-100">
              <p className="text-xs font-semibold text-red-700 uppercase mb-2">Despesas Adicionais</p>
              {despesasLocais.length === 0 ? (
                <p className="text-sm text-gray-400">Nenhuma despesa manual</p>
              ) : (
                <>
                  {despesasLocais.map((l) => (
                    <div key={l.id} className="flex justify-between text-sm py-1 border-b border-gray-50 last:border-0">
                      <span className="text-gray-700">{l.descricao}</span>
                      <span className="text-red-700 font-medium">- {formatCurrency(l.valor)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between text-sm font-bold pt-2 mt-1 border-t border-red-200">
                    <span>Total despesas manuais</span>
                    <span className="text-red-700">- {formatCurrency(totalDespesasLocais)}</span>
                  </div>
                </>
              )}
            </div>
          </div>
          {fechamentoAtual && (
            <div className="bg-white rounded-xl p-4 border border-blue-100 flex justify-between items-center">
              <span className="font-semibold text-gray-800">Resultado Ajustado (Sheets + Manual)</span>
              <span className="text-xl font-bold text-blue-900">
                {formatCurrency(fechamentoAtual.valorLiquido + totalReceitasLocais - totalDespesasLocais)}
              </span>
            </div>
          )}
        </div>
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
