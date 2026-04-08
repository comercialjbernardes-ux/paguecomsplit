import { useState, useMemo } from 'react'
import {
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { Plus, X, FileText } from 'lucide-react'
import { linhasDRE, waterfallData } from '../../data/interno'
import { formatCurrency } from '../../utils/calculos'

function varPct(mesAtual, acumulado) {
  if (acumulado === 0) return '—'
  const mensal = acumulado / 12
  if (mensal === 0) return '—'
  const pct = ((mesAtual - mensal) / Math.abs(mensal)) * 100
  return `${pct >= 0 ? '+' : ''}${pct.toFixed(1)}%`
}

function varColor(mesAtual, acumulado, tipo) {
  const mensal = acumulado / 12
  if (mensal === 0) return 'text-slate-500'
  const diff = mesAtual - mensal
  if (tipo === 'despesa' || tipo === 'custo') {
    return diff <= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'
  }
  return diff >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'
}

function WaterfallTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="bg-[#0D1B2A] rounded-[8px] px-4 py-3 shadow-xl">
      <p className="text-white/60 text-xs mb-1">{d.name}</p>
      <p className="text-white font-semibold text-sm">{formatCurrency(d.valor)}</p>
    </div>
  )
}

function buildWaterfall() {
  let running = 0
  return waterfallData.map((item) => {
    if (item.tipo === 'subtotal' || item.tipo === 'destaque') {
      running = item.valor
      return { ...item, base: 0, height: item.valor }
    }
    const base = running
    running += item.valor
    if (item.valor >= 0) {
      return { ...item, base, height: item.valor }
    }
    return { ...item, base: base + item.valor, height: Math.abs(item.valor) }
  })
}

export function InternoDRE() {
  const [lancamentos, setLancamentos] = useState([])
  const [modalAberto, setModalAberto] = useState(false)
  const [formDesc, setFormDesc] = useState('')
  const [formValor, setFormValor] = useState('')
  const [formTipo, setFormTipo] = useState('receita')

  const wfData = useMemo(() => buildWaterfall(), [])

  const linhasComLancamentos = useMemo(() => {
    const receitaExtra = lancamentos.filter((l) => l.tipo === 'receita').reduce((s, l) => s + l.valor, 0)
    const despesaExtra = lancamentos.filter((l) => l.tipo === 'despesa').reduce((s, l) => s + l.valor, 0)

    return linhasDRE.map((linha) => {
      if (linha.id === 'receita_bruta') return { ...linha, mesAtual: linha.mesAtual + receitaExtra }
      if (linha.id === 'despesas_op') return { ...linha, mesAtual: linha.mesAtual - despesaExtra }
      return linha
    })
  }, [lancamentos])

  function handleAddLancamento() {
    if (!formDesc.trim() || !formValor) return
    const novo = {
      id: crypto.randomUUID(),
      descricao: formDesc.trim(),
      valor: parseFloat(formValor),
      tipo: formTipo,
      data: new Date().toISOString().slice(0, 10),
    }
    setLancamentos((prev) => [...prev, novo])
    setFormDesc('')
    setFormValor('')
    setFormTipo('receita')
    setModalAberto(false)
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#0D1B2A]">DRE Gerencial</h1>
          <p className="text-slate-500 text-sm mt-1">Demonstrativo de Resultados do Exercício</p>
        </div>
        <button
          onClick={() => setModalAberto(true)}
          className="flex items-center gap-2 h-9 px-4 bg-[#0D1B2A] text-white text-sm font-medium rounded-[8px] hover:bg-[#162A3E] transition-colors"
        >
          <Plus size={16} strokeWidth={1.5} />
          Adicionar Lançamento
        </button>
      </div>

      <div className="bg-white border border-[#E2E8F0] rounded-[12px] shadow-card p-6 mb-8">
        <div className="flex items-center gap-2 mb-6">
          <FileText size={18} strokeWidth={1.5} className="text-[#0D1B2A]" />
          <h2 className="text-base font-semibold text-[#0D1B2A]">Demonstrativo</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-[#E2E8F0]">
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider w-[40%]">Descrição</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Mês Atual</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Acumulado</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Var. %</th>
              </tr>
            </thead>
            <tbody>
              {linhasComLancamentos.map((linha) => {
                const isSubtotal = linha.tipo === 'subtotal'
                const isDestaque = linha.tipo === 'destaque'
                const rowBg = isSubtotal ? 'bg-[#F7F8FA]' : ''
                const textWeight = isSubtotal ? 'font-semibold' : isDestaque ? 'font-bold' : 'font-normal'
                const textColor = isDestaque ? 'text-[#00C896]' : 'text-[#0D1B2A]'
                const descColor = isDestaque ? 'text-[#00C896] font-bold' : isSubtotal ? 'text-[#0D1B2A] font-semibold' : 'text-[#0D1B2A]'

                return (
                  <tr key={linha.id} className={`border-b border-[#E2E8F0] ${rowBg}`}>
                    <td className={`py-3.5 px-4 text-sm ${descColor}`}>
                      {(linha.tipo === 'despesa' || linha.tipo === 'custo') && !isSubtotal && (
                        <span className="text-slate-300 mr-2">−</span>
                      )}
                      {linha.descricao}
                    </td>
                    <td className={`py-3.5 px-4 text-sm text-right ${textWeight} ${textColor}`}>{formatCurrency(Math.abs(linha.mesAtual))}</td>
                    <td className={`py-3.5 px-4 text-sm text-right ${textWeight} ${textColor}`}>{formatCurrency(Math.abs(linha.acumulado))}</td>
                    <td className={`py-3.5 px-4 text-sm text-right font-medium ${varColor(linha.mesAtual, linha.acumulado, linha.tipo)}`}>
                      {varPct(linha.mesAtual, linha.acumulado)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {lancamentos.length > 0 && (
        <div className="bg-white border border-[#E2E8F0] rounded-[12px] shadow-card p-6 mb-8">
          <h2 className="text-sm font-semibold text-[#0D1B2A] mb-4">Lançamentos Manuais</h2>
          <div className="space-y-2">
            {lancamentos.map((l) => (
              <div key={l.id} className="flex items-center justify-between py-2 px-3 bg-[#F7F8FA] rounded-[8px]">
                <div className="flex items-center gap-3">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                    l.tipo === 'receita' ? 'bg-[#ECFDF5] text-[#065F46]' : 'bg-[#FEF2F2] text-[#991B1B]'
                  }`}>
                    {l.tipo === 'receita' ? 'Receita' : 'Despesa'}
                  </span>
                  <span className="text-sm text-[#0D1B2A]">{l.descricao}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-sm font-semibold ${l.tipo === 'receita' ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                    {l.tipo === 'receita' ? '+' : '-'}{formatCurrency(l.valor)}
                  </span>
                  <button onClick={() => setLancamentos((prev) => prev.filter((x) => x.id !== l.id))} className="text-slate-300 hover:text-[#EF4444] transition-colors">
                    <X size={14} strokeWidth={1.5} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white border border-[#E2E8F0] rounded-[12px] shadow-card p-6">
        <h2 className="text-base font-semibold text-[#0D1B2A] mb-1">Composição do Resultado</h2>
        <p className="text-xs text-slate-400 mb-6">Gráfico waterfall — contribuição de cada linha</p>
        <ResponsiveContainer width="100%" height={320}>
          <ComposedChart data={wfData} barSize={48}>
            <CartesianGrid vertical={false} stroke="#E2E8F0" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 11, fontFamily: 'Inter' }} interval={0} angle={-20} textAnchor="end" height={50} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 11, fontFamily: 'Inter' }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} width={60} />
            <Tooltip content={<WaterfallTooltip />} cursor={false} />
            <Bar dataKey="base" stackId="a" fill="transparent" />
            <Bar dataKey="height" stackId="a" radius={[4, 4, 0, 0]}>
              {wfData.map((entry, i) => (
                <Cell key={i} fill={entry.tipo === 'negativo' ? '#EF4444' : entry.tipo === 'destaque' ? '#00C896' : entry.tipo === 'subtotal' ? '#0D1B2A' : '#00C896'} />
              ))}
            </Bar>
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {modalAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30" onClick={() => setModalAberto(false)} />
          <div className="relative bg-white rounded-[12px] shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-base font-semibold text-[#0D1B2A]">Novo Lançamento</h3>
              <button onClick={() => setModalAberto(false)} className="text-slate-400 hover:text-slate-600">
                <X size={18} strokeWidth={1.5} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Tipo</label>
                <div className="flex bg-[#F7F8FA] border border-[#E2E8F0] rounded-[8px] p-1 gap-1">
                  {['receita', 'despesa'].map((t) => (
                    <button
                      key={t}
                      onClick={() => setFormTipo(t)}
                      className={`flex-1 py-2 rounded-[6px] text-sm font-medium transition-all ${
                        formTipo === t
                          ? t === 'receita' ? 'bg-[#00C896] text-white shadow-sm' : 'bg-[#EF4444] text-white shadow-sm'
                          : 'text-slate-500'
                      }`}
                    >
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Descrição</label>
                <input type="text" value={formDesc} onChange={(e) => setFormDesc(e.target.value)} placeholder="Ex: Venda extra, Consultoria..."
                  className="w-full h-10 px-3 text-sm border border-[#E2E8F0] rounded-[8px] focus:outline-none focus:ring-2 focus:ring-[#00C896]/30 focus:border-[#00C896] placeholder:text-slate-300" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Valor (R$)</label>
                <input type="number" value={formValor} onChange={(e) => setFormValor(e.target.value)} placeholder="0" min={0}
                  className="w-full h-10 px-3 text-sm border border-[#E2E8F0] rounded-[8px] focus:outline-none focus:ring-2 focus:ring-[#00C896]/30 focus:border-[#00C896] placeholder:text-slate-300" />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setModalAberto(false)} className="px-4 py-2 text-sm font-medium text-slate-500 hover:text-[#0D1B2A] transition-colors">Cancelar</button>
              <button onClick={handleAddLancamento} disabled={!formDesc.trim() || !formValor}
                className="px-5 py-2 text-sm font-medium bg-[#0D1B2A] text-white rounded-[8px] hover:bg-[#162A3E] disabled:opacity-40 disabled:cursor-not-allowed transition-all">
                Adicionar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
