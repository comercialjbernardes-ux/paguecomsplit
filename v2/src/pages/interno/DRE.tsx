// ═══════════════════════════════════════════════════════════════
// DRE Gerencial — Modulo Interno
// Demonstracao de resultados com estrutura correta:
// Receitas Operacionais → Deduções → Resultado Liquido
// TPV é informativo (volume dos ECs), nao linha de resultado
// ═══════════════════════════════════════════════════════════════

import { useState, useMemo } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, Legend,
} from 'recharts'
import { FileBarChart, TrendingUp, TrendingDown, ArrowRight, CreditCard, Users, BookOpen } from 'lucide-react'
import { useInternoData } from '../../hooks/useInternoData'
import { useDataContext } from '../../contexts/dataContextValue'
import { LoadingState } from '../../components/LoadingState'
import { PeriodSelector } from '../../components/PeriodSelector'
import { formatCurrency, formatCurrencyShort, formatPercent } from '../../utils/format'
import { calcCustosMensalEfetivo, dataPertenceAoPeriodo } from '../../utils/custos'
import type { DadosFechamento } from '../../types'

export function InternoDRE() {
  const { fechamentos, fechamentoAtual, lancamentos, isLoading } = useInternoData()
  const { equipamentos, custos } = useDataContext()

  const [periodoSelecionado, setPeriodoSelecionado] = useState<string>('ultimo')
  const isAcumulado = periodoSelecionado === 'acumulado'

  // Fechamento "sintético" para modo acumulado
  const fechamentoAcumulado = useMemo((): DadosFechamento | null => {
    if (!isAcumulado || fechamentos.length === 0) return null
    const n = fechamentos.length
    const ultimo = fechamentos[fechamentos.length - 1]
    // Somas corretas para campos de fluxo (acumuláveis por período)
    const totalTPV    = fechamentos.reduce((s, f) => s + f.tpvTotal, 0)
    const totalMarkup = fechamentos.reduce((s, f) => s + f.markupPos, 0)
    return {
      periodo: `Acumulado (${n} ${n === 1 ? 'mês' : 'meses'})`,
      ecsAtivos: ultimo.ecsAtivos,           // snapshot do último mês (headcount, não acumulável)
      tpvTotal: totalTPV,
      // TPV Médio acumulado = TPV total ÷ ECs do último mês (evita viés de média aritmética)
      tpvMedio: ultimo.ecsAtivos > 0 ? totalTPV / ultimo.ecsAtivos : ultimo.tpvMedio,
      markupPos: totalMarkup,
      comissaoRede: fechamentos.reduce((s, f) => s + f.comissaoRede, 0),
      repasse: fechamentos.reduce((s, f) => s + f.repasse, 0),
      faturaDigital: fechamentos.reduce((s, f) => s + f.faturaDigital, 0),
      descontos: fechamentos.reduce((s, f) => s + f.descontos, 0),
      valorLiquido: fechamentos.reduce((s, f) => s + f.valorLiquido, 0),
      // Taxa de margem acumulada = Markup total ÷ TPV total (correto — evita média ponderada incorreta)
      taxaMargem: totalTPV > 0 ? totalMarkup / totalTPV : 0,
    }
  }, [fechamentos, isAcumulado])

  // Fechamento efetivo: acumulado, específico ou último
  const fechamentoEfetivo = useMemo((): DadosFechamento | null => {
    if (isAcumulado) return fechamentoAcumulado
    if (periodoSelecionado === 'ultimo') return fechamentoAtual
    return fechamentos.find((f) => f.periodo === periodoSelecionado) ?? fechamentoAtual
  }, [isAcumulado, periodoSelecionado, fechamentoAtual, fechamentoAcumulado, fechamentos])

  // Estrutura correta do DRE:
  // Receitas: Markup POS + Comissao Rede + Repasse
  // Deducoes: Fatura Conta Digital + Descontos + Deducoes Lancadas (local)
  // Resultado: Valor Liquido Ajustado (= Receitas - Todas Deducoes)
  const dreData = useMemo(() => {
    if (!fechamentoEfetivo) return null
    const f = fechamentoEfetivo

    // Margem real = Markup POS / TPV Total (quanto a empresa ganha sobre o volume processado)
    // Ex: R$28.759 markup / R$2.728.746 TPV = 1,054% — NAO dividir por receitas internas
    const margemCalculada = f.tpvTotal > 0
      ? (f.markupPos / f.tpvTotal) * 100
      : (f.taxaMargem ?? 0) * 100  // taxaMargem stored as decimal (0.01 = 1%)

    // Lancamentos manuais (source === 'local') filtrados pelo periodo atual
    // Em modo acumulado, inclui todos os lançamentos locais sem filtro de período
    const localNoPeriodo = lancamentos.filter(
      (l) => l.source === 'local' && (isAcumulado ? true : dataPertenceAoPeriodo(l.data, f.periodo))
    )

    // Descontos efetivos: usar campo agregado do fechamento (Resumo) se disponivel.
    // Caso o Resumo nao tenha label reconhecivel e f.descontos retorne 0,
    // soma os lancamentos individuais source:'sheets' da aba Descontos como fallback.
    // Evita dupla contagem: quando f.descontos > 0, os lancamentos ja estao no agregado.
    const sheetsDescontosPeriodo = f.descontos === 0
      ? lancamentos
          .filter((l) => l.source === 'sheets' && l.conta === 'Descontos' && (isAcumulado ? true : dataPertenceAoPeriodo(l.data, f.periodo)))
          .reduce((s, l) => s + Math.abs(l.valor), 0)
      : 0
    const descontosEfetivos = f.descontos > 0 ? f.descontos : sheetsDescontosPeriodo

    // Math.abs garante valor positivo mesmo se o usuário salvou a entrada
    // com sinal negativo — consistente com o bloco de exibição abaixo.
    const totalReceitasLocais = localNoPeriodo
      .filter((l) => l.tipo === 'receita')
      .reduce((s, l) => s + Math.abs(l.valor), 0)

    const totalDeducoesLocais = localNoPeriodo
      .filter((l) => l.tipo === 'despesa')
      .reduce((s, l) => s + Math.abs(l.valor), 0)

    // Equipamentos: custo mensal × número de períodos acumulados
    // Nota: aproximação — não há histórico de parcelasPagas por mês no modelo de dados
    const nPeriodos = isAcumulado ? fechamentos.length : 1
    const totalEquipMensal = equipamentos.reduce((s, eq) => {
      const restantes = eq.numeroParcelas - eq.parcelasPagas
      return s + (restantes > 0 ? eq.valorParcela : 0)
    }, 0) * nPeriodos

    // Custos operacionais: em acumulado, soma o custo efetivo de cada período individual
    // (inclui custos 'unico' que ocorreram em cada mês do intervalo, sem multiplicar prorate)
    const totalCustosOperacionais = isAcumulado
      ? fechamentos.reduce((s, fec) => s + calcCustosMensalEfetivo(custos, fec.periodo), 0)
      : calcCustosMensalEfetivo(custos, f.periodo)

    // Receitas: planilha + manuais
    const receitas: { id: string; descricao: string; valor: number; isLocal?: boolean }[] = [
      { id: 'markup', descricao: 'Markup POS', valor: f.markupPos },
      { id: 'comissao', descricao: 'Comissao de Rede', valor: f.comissaoRede },
      { id: 'repasse', descricao: 'Repasse', valor: f.repasse },
    ]
    if (totalReceitasLocais > 0) {
      receitas.push({ id: 'receitas-locais', descricao: 'Receitas Lancadas', valor: totalReceitasLocais, isLocal: true })
    }

    const totalReceitas = f.markupPos + f.comissaoRede + f.repasse + totalReceitasLocais

    const deducoes: { id: string; descricao: string; valor: number; isLocal?: boolean; isEquip?: boolean; isCustoOp?: boolean }[] = [
      { id: 'fatura', descricao: 'Cobranca Conta Digital', valor: f.faturaDigital },
      { id: 'descontos', descricao: 'Descontos do Periodo', valor: descontosEfetivos },
    ]
    if (totalEquipMensal > 0) {
      deducoes.push({ id: 'equip', descricao: isAcumulado ? `Ded. Equipamentos (${nPeriodos}x)` : 'Ded. Equipamentos/Maquinas', valor: totalEquipMensal, isEquip: true })
    }
    if (totalCustosOperacionais > 0) {
      deducoes.push({ id: 'custosOp', descricao: isAcumulado ? `Custos Operacionais (${nPeriodos}x)` : 'Custos Operacionais', valor: totalCustosOperacionais, isCustoOp: true })
    }
    if (totalDeducoesLocais > 0) {
      deducoes.push({ id: 'local', descricao: 'Deducoes Lancadas', valor: totalDeducoesLocais, isLocal: true })
    }

    const totalDeducoes = f.faturaDigital + descontosEfetivos + totalEquipMensal + totalCustosOperacionais + totalDeducoesLocais

    // valorLiquidoAjustado: reconstruido a partir dos componentes mapeados (totalReceitas - totalDeducoes).
    // Quando f.descontos=0 (label nao encontrado no Resumo), f.valorLiquido pode divergir de calculado
    // porque o Resumo ja embute os descontos reais enquanto f.descontos=0 no mapper.
    // Usar calculado garante consistencia matematica da tabela (Receita Bruta - Total Deducoes = Valor Liquido).
    // f.valorLiquido e mantido como referencia de conferencia mas nao e o valor exibido.
    const valorLiquidoCalculado = totalReceitas - totalDeducoes

    return {
      receitas,
      deducoes,
      totalReceitas,
      totalDeducoes,
      valorLiquido: f.valorLiquido,
      // Resultado reconstruido: garante que Receita Bruta - Total Deducoes = Valor Liquido na tabela
      valorLiquidoAjustado: valorLiquidoCalculado,
      calculado: valorLiquidoCalculado,
      margemCalculada,
      temReceitasLocais: totalReceitasLocais > 0,
      temDeducoesLocais: totalDeducoesLocais > 0,
      temEquip: totalEquipMensal > 0,
      temCustosOp: totalCustosOperacionais > 0,
      totalEquipMensal,
      totalCustosOperacionais,
      totalReceitasLocais,
      totalDeducoesLocais,
      descontosEfetivos,
    }
  }, [fechamentoEfetivo, fechamentos, lancamentos, equipamentos, custos, isAcumulado])

  // Waterfall chart: composicao do resultado (sem TPV — TPV e volume dos ECs, nao receita)
  const waterfallData = useMemo(() => {
    if (!dreData || !fechamentoEfetivo) return []
    const f = fechamentoEfetivo
    const entries: { name: string; valor: number; tipo: string }[] = [
      { name: 'Markup POS', valor: f.markupPos, tipo: 'positivo' },
      { name: 'Comissao', valor: f.comissaoRede, tipo: 'positivo' },
      { name: 'Repasse', valor: f.repasse, tipo: 'positivo' },
    ]
    if (dreData.temReceitasLocais) {
      entries.push({ name: 'Rec. Manuais', valor: dreData.totalReceitasLocais, tipo: 'positivo' })
    }
    entries.push(
      { name: 'Conta Digital', valor: -f.faturaDigital, tipo: 'negativo' },
      { name: 'Descontos', valor: -dreData.descontosEfetivos, tipo: 'negativo' },
    )
    if (dreData.temEquip) {
      entries.push({ name: 'Equipamentos', valor: -dreData.totalEquipMensal, tipo: 'negativo' })
    }
    if (dreData.temCustosOp) {
      entries.push({ name: 'Custos Op.', valor: -dreData.totalCustosOperacionais, tipo: 'negativo' })
    }
    if (dreData.temDeducoesLocais) {
      entries.push({ name: 'Ded. Manuais', valor: -dreData.totalDeducoesLocais, tipo: 'negativo' })
    }
    entries.push({ name: 'Liquido', valor: dreData.valorLiquidoAjustado, tipo: 'destaque' })
    return entries
  }, [dreData, fechamentoEfetivo])

  // Evolucao por periodo
  const evolucaoPeriodo = useMemo(() => {
    return fechamentos.map((f: DadosFechamento) => ({
      periodo: f.periodo,
      markup: f.markupPos,
      liquido: f.valorLiquido,
    }))
  }, [fechamentos])

  // Lancamentos locais do periodo efetivo (fonte: localStorage via DataContext)
  // Em modo acumulado inclui todos os lançamentos locais
  const lancamentosLocais = useMemo(() => {
    if (!fechamentoEfetivo) return []
    return lancamentos.filter(
      (l) => l.source === 'local' && (isAcumulado ? true : dataPertenceAoPeriodo(l.data, fechamentoEfetivo.periodo))
    )
  }, [lancamentos, fechamentoEfetivo, isAcumulado])

  const receitasLocais = useMemo(() =>
    lancamentosLocais.filter((l) => l.tipo === 'receita'),
  [lancamentosLocais])

  const despesasLocais = useMemo(() =>
    lancamentosLocais.filter((l) => l.tipo === 'despesa'),
  [lancamentosLocais])

  const totalReceitasLocais = receitasLocais.reduce((s, l) => s + Math.abs(l.valor), 0)
  const totalDespesasLocais = despesasLocais.reduce((s, l) => s + Math.abs(l.valor), 0)

  if (isLoading) return <LoadingState message="Carregando DRE..." />

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <FileBarChart className="w-7 h-7 text-blue-500" />
            DRE Gerencial
          </h1>
          <p className="text-gray-500 mt-1">
            Demonstrativo de resultado — {fechamentoEfetivo?.periodo || 'sem dados'}
            {isAcumulado && <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">acumulado</span>}
          </p>
        </div>
        {fechamentos.length > 0 && (
          <PeriodSelector
            fechamentos={fechamentos}
            value={periodoSelecionado}
            onChange={setPeriodoSelecionado}
          />
        )}
      </div>

      {fechamentoEfetivo && (
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
                  <p className="text-lg font-bold text-gray-800">{formatCurrency(fechamentoEfetivo.tpvTotal)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-blue-500 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-500">ECs Ativos</p>
                  <p className="text-lg font-bold text-gray-800">{fechamentoEfetivo.ecsAtivos}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <TrendingUp className="w-5 h-5 text-blue-500 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-500">TPV Medio por EC</p>
                  <p className="text-lg font-bold text-gray-800">{formatCurrency(fechamentoEfetivo.tpvMedio)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* KPIs do resultado */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <DRECard
              label="Markup POS"
              value={formatCurrency(fechamentoEfetivo.markupPos)}
              variacao={fechamentoEfetivo.variacaoMarkup}
              icon={<TrendingUp className="w-5 h-5" />}
              color="emerald"
            />
            <DRECard
              label="Repasse"
              value={formatCurrency(fechamentoEfetivo.repasse)}
              icon={<ArrowRight className="w-5 h-5" />}
              color="blue"
            />
            <DRECard
              label="Taxa de Margem"
              value={formatPercent(dreData?.margemCalculada ?? (fechamentoEfetivo.taxaMargem * 100), 2)}
              variacao={fechamentoEfetivo.variacaoMargem}
              icon={<TrendingUp className="w-5 h-5" />}
              color={
                (dreData?.margemCalculada ?? (fechamentoEfetivo.taxaMargem * 100)) >= 2 ? 'emerald'
                : (dreData?.margemCalculada ?? (fechamentoEfetivo.taxaMargem * 100)) >= 1 ? 'blue'
                : 'red'
              }
            />
            <DRECard
              label="Total Deducoes"
              value={`- ${formatCurrency(dreData?.totalDeducoes ?? (fechamentoEfetivo.faturaDigital + fechamentoEfetivo.descontos))}`}
              icon={<TrendingDown className="w-5 h-5" />}
              color="red"
            />
            <DRECard
              label="Valor Liquido"
              value={formatCurrency(dreData?.valorLiquidoAjustado ?? fechamentoEfetivo.valorLiquido)}
              icon={<ArrowRight className="w-5 h-5" />}
              color="navy"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Tabela DRE estruturada */}
            {dreData && (
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Demonstrativo — {fechamentoEfetivo.periodo}
                  {isAcumulado && <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">acumulado</span>}
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
                      <td className="py-2 px-3 font-semibold text-gray-800">Receita Bruta</td>
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
                        <td className={`py-2 px-3 pl-6 ${linha.isLocal ? 'text-amber-700 font-medium' : linha.isEquip ? 'text-orange-700 font-medium' : linha.isCustoOp ? 'text-purple-700 font-medium' : 'text-gray-700'}`}>
                          {linha.descricao}
                          {linha.isLocal && (
                            <span className="ml-2 text-xs bg-amber-100 text-amber-600 px-1.5 py-0.5 rounded">manual</span>
                          )}
                          {linha.isEquip && (
                            <span className="ml-2 text-xs bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded">equipamento</span>
                          )}
                          {linha.isCustoOp && (
                            <span className="ml-2 text-xs bg-purple-100 text-purple-600 px-1.5 py-0.5 rounded">custo op.</span>
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
          {fechamentoEfetivo && (
            <div className="bg-white rounded-xl p-4 border border-blue-100 flex justify-between items-center">
              <span className="font-semibold text-gray-800">Resultado Ajustado (Sheets + Manual)</span>
              <span className="text-xl font-bold text-blue-900">
                {formatCurrency(dreData?.valorLiquidoAjustado ?? fechamentoEfetivo.valorLiquido)}
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
      {!fechamentoEfetivo && !isLoading && (
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
    navy: 'bg-slate-100 text-slate-700',
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
