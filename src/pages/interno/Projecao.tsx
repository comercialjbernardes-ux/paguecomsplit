import { useState, useMemo, useCallback } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { Save, Trash2, Sliders, Target } from 'lucide-react'
import { dadosProjecaoBase } from '../../data/interno'
import type { CenarioSalvo } from '../../data/interno'
import { formatCurrency } from '../../utils/calculos'

const EBITDA_BASE = 443300 // mensal
const STORAGE_KEY = 'vf_cenarios'

function formatCurrencyShort(v: number): string {
  if (v >= 1_000_000) return `R$ ${(v / 1_000_000).toFixed(2)}M`
  if (v >= 1_000) return `R$ ${(v / 1_000).toFixed(0)}K`
  return formatCurrency(v)
}

function ProjecaoTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[#0D1B2A] rounded-[8px] px-4 py-3 shadow-xl">
      <p className="text-white/60 text-xs mb-2">{label}</p>
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center gap-2 text-sm">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-white/70">{p.name === 'realizado' ? 'Realizado' : 'Projetado'}:</span>
          <span className="text-white font-semibold">{formatCurrencyShort(p.value)}</span>
        </div>
      ))}
    </div>
  )
}

function loadCenarios(): CenarioSalvo[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  } catch {
    return []
  }
}

export function InternoProjecao() {
  const [metaAnual, setMetaAnual] = useState(16_800_000)
  const [crescimento, setCrescimento] = useState(10)
  const [reducaoCustos, setReducaoCustos] = useState(5)
  const [novosVendedores, setNovosVendedores] = useState(3)
  const [cenarios, setCenarios] = useState<CenarioSalvo[]>(() => loadCenarios())
  const [metasMensais, setMetasMensais] = useState<number[]>(() =>
    dadosProjecaoBase.map(() => Math.round(metaAnual / 12))
  )

  // Recalculate monthly breakdown when annual changes
  const handleMetaAnualChange = useCallback((val: number) => {
    setMetaAnual(val)
    setMetasMensais(dadosProjecaoBase.map(() => Math.round(val / 12)))
  }, [])

  const handleMetaMensalChange = useCallback((idx: number, val: number) => {
    setMetasMensais((prev) => {
      const next = [...prev]
      next[idx] = val
      return next
    })
    setMetaAnual(metasMensais.reduce((s, v, i) => s + (i === idx ? val : v), 0))
  }, [metasMensais])

  const dadosGrafico = useMemo(() => {
    return dadosProjecaoBase.map((d, i) => ({
      mes: d.mes,
      realizado: d.realizado,
      projetado: metasMensais[i],
    }))
  }, [metasMensais])

  const ebitdaProjetado = useMemo(() => {
    const receita = EBITDA_BASE * (1 + crescimento / 100)
    const custos = receita * (reducaoCustos / 100)
    const vendedorContrib = novosVendedores * 12000
    return Math.round(receita + custos + vendedorContrib)
  }, [crescimento, reducaoCustos, novosVendedores])

  function salvarCenario() {
    const nome = prompt('Nome do cenário:')
    if (!nome?.trim()) return
    const novo: CenarioSalvo = {
      nome: nome.trim(),
      data: new Date().toISOString().slice(0, 10),
      crescimento,
      reducaoCustos,
      novosVendedores,
      ebitdaProjetado,
    }
    const updated = [...cenarios, novo]
    setCenarios(updated)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  }

  function removerCenario(idx: number) {
    const updated = cenarios.filter((_, i) => i !== idx)
    setCenarios(updated)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#0D1B2A]">Projeção de Crescimento</h1>
        <p className="text-slate-500 text-sm mt-1">Metas, projeções e simulação de cenários</p>
      </div>

      {/* Painel de Metas */}
      <div className="bg-white border border-[#E2E8F0] rounded-[12px] shadow-card p-6 mb-8">
        <div className="flex items-center gap-2 mb-6">
          <Target size={18} strokeWidth={1.5} className="text-[#00C896]" />
          <h2 className="text-base font-semibold text-[#0D1B2A]">Painel de Metas</h2>
        </div>

        {/* Meta anual input */}
        <div className="flex items-center gap-4 mb-6">
          <label className="text-sm font-medium text-slate-500 whitespace-nowrap">Meta anual (R$)</label>
          <input
            type="number"
            value={metaAnual}
            onChange={(e) => handleMetaAnualChange(Number(e.target.value))}
            className="w-56 h-10 px-3 text-sm font-semibold text-[#0D1B2A] border border-[#E2E8F0] rounded-[8px] focus:outline-none focus:ring-2 focus:ring-[#00C896]/30 focus:border-[#00C896]"
          />
          <span className="text-xs text-slate-400">
            = {formatCurrency(Math.round(metaAnual / 12))} / mês
          </span>
        </div>

        {/* Breakdown mensal editável */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#E2E8F0]">
                {dadosProjecaoBase.map((d) => (
                  <th key={d.mes} className="py-2 px-2 text-xs font-semibold text-slate-400 uppercase text-center">
                    {d.mes}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                {metasMensais.map((val, i) => (
                  <td key={i} className="py-2 px-1 text-center">
                    <input
                      type="number"
                      value={val}
                      onChange={(e) => handleMetaMensalChange(i, Number(e.target.value))}
                      className="w-full text-center text-xs font-medium text-[#0D1B2A] h-8 border border-[#E2E8F0] rounded-[6px] focus:outline-none focus:ring-1 focus:ring-[#00C896]/30 focus:border-[#00C896]"
                    />
                  </td>
                ))}
              </tr>
              {/* Realizado row */}
              <tr>
                {dadosProjecaoBase.map((d, i) => (
                  <td key={i} className="py-1 px-1 text-center">
                    <span className={`text-xs ${d.realizado ? 'text-slate-500' : 'text-slate-300'}`}>
                      {d.realizado ? formatCurrencyShort(d.realizado) : '—'}
                    </span>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Gráfico de linha dupla */}
      <div className="bg-white border border-[#E2E8F0] rounded-[12px] shadow-card p-6 mb-8">
        <h2 className="text-base font-semibold text-[#0D1B2A] mb-1">Realizado vs Projetado</h2>
        <p className="text-xs text-slate-400 mb-6">Comparativo mensal</p>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={dadosGrafico}>
            <CartesianGrid vertical={false} stroke="#E2E8F0" />
            <XAxis
              dataKey="mes"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94A3B8', fontSize: 12, fontFamily: 'Inter' }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94A3B8', fontSize: 12, fontFamily: 'Inter' }}
              tickFormatter={(v) => formatCurrencyShort(v)}
              width={80}
            />
            <Tooltip content={<ProjecaoTooltip />} />
            <Legend
              wrapperStyle={{ paddingTop: '12px', fontSize: '12px', fontFamily: 'Inter' }}
              formatter={(value) => (
                <span style={{ color: '#64748B' }}>{value === 'realizado' ? 'Realizado' : 'Projetado'}</span>
              )}
            />
            <Line
              type="monotone"
              dataKey="realizado"
              stroke="#0D1B2A"
              strokeWidth={2.5}
              dot={{ r: 4, fill: '#0D1B2A' }}
              connectNulls={false}
              name="realizado"
            />
            <Line
              type="monotone"
              dataKey="projetado"
              stroke="#00C896"
              strokeWidth={2.5}
              strokeDasharray="8 4"
              dot={{ r: 4, fill: '#00C896', strokeDasharray: '' }}
              name="projetado"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Simulador de Cenários */}
      <div className="bg-[#F7F8FA] border border-[#E2E8F0] rounded-[12px] p-6 mb-8">
        <div className="flex items-center gap-2 mb-6">
          <Sliders size={18} strokeWidth={1.5} className="text-[#0D1B2A]" />
          <h2 className="text-base font-semibold text-[#0D1B2A]">Simulador de Cenários</h2>
        </div>

        <div className="grid grid-cols-3 gap-6 mb-6">
          {/* Crescimento de receita */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-slate-600">Crescimento de receita</label>
              <span className="text-sm font-bold text-[#0D1B2A]">+{crescimento}%</span>
            </div>
            <input
              type="range"
              min={-20}
              max={100}
              value={crescimento}
              onChange={(e) => setCrescimento(Number(e.target.value))}
              className="w-full h-2 bg-[#E2E8F0] rounded-full appearance-none cursor-pointer accent-[#00C896]"
            />
            <div className="flex justify-between text-xs text-slate-400 mt-1">
              <span>-20%</span>
              <span>+100%</span>
            </div>
          </div>

          {/* Redução de custos */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-slate-600">Redução de custos</label>
              <span className="text-sm font-bold text-[#0D1B2A]">{reducaoCustos}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={30}
              value={reducaoCustos}
              onChange={(e) => setReducaoCustos(Number(e.target.value))}
              className="w-full h-2 bg-[#E2E8F0] rounded-full appearance-none cursor-pointer accent-[#00C896]"
            />
            <div className="flex justify-between text-xs text-slate-400 mt-1">
              <span>0%</span>
              <span>30%</span>
            </div>
          </div>

          {/* Novos vendedores */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-slate-600">Novos vendedores</label>
              <span className="text-sm font-bold text-[#0D1B2A]">+{novosVendedores}</span>
            </div>
            <input
              type="range"
              min={0}
              max={20}
              value={novosVendedores}
              onChange={(e) => setNovosVendedores(Number(e.target.value))}
              className="w-full h-2 bg-[#E2E8F0] rounded-full appearance-none cursor-pointer accent-[#00C896]"
            />
            <div className="flex justify-between text-xs text-slate-400 mt-1">
              <span>0</span>
              <span>20</span>
            </div>
          </div>
        </div>

        {/* Resultado EBITDA projetado */}
        <div className="bg-white border border-[#E2E8F0] rounded-[12px] p-6 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">EBITDA Mensal Projetado</p>
            <p className="text-[32px] font-bold text-[#00C896] leading-none">
              {formatCurrency(ebitdaProjetado)}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              vs base {formatCurrency(EBITDA_BASE)} ({ebitdaProjetado > EBITDA_BASE ? '+' : ''}{(((ebitdaProjetado - EBITDA_BASE) / EBITDA_BASE) * 100).toFixed(1)}%)
            </p>
          </div>
          <button
            onClick={salvarCenario}
            className="flex items-center gap-2 h-10 px-5 bg-[#0D1B2A] text-white text-sm font-medium rounded-[8px] hover:bg-[#162A3E] transition-colors"
          >
            <Save size={16} strokeWidth={1.5} />
            Salvar cenário
          </button>
        </div>
      </div>

      {/* Cenários Salvos */}
      {cenarios.length > 0 && (
        <div className="bg-white border border-[#E2E8F0] rounded-[12px] shadow-card overflow-hidden">
          <div className="px-6 py-4 border-b border-[#E2E8F0]">
            <h2 className="text-sm font-semibold text-[#0D1B2A]">Cenários Salvos</h2>
          </div>
          <div className="divide-y divide-[#E2E8F0]">
            {cenarios.map((c, i) => (
              <div key={i} className="flex items-center gap-4 px-6 py-3 hover:bg-[#F0FDF9] transition-colors">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-[#0D1B2A]">{c.nome}</p>
                  <p className="text-xs text-slate-400">{c.data}</p>
                </div>
                <span className="text-xs text-slate-500">+{c.crescimento}% receita</span>
                <span className="text-xs text-slate-500">{c.reducaoCustos}% custos</span>
                <span className="text-xs text-slate-500">+{c.novosVendedores} vendedores</span>
                <span className="text-sm font-bold text-[#00C896]">{formatCurrency(c.ebitdaProjetado)}</span>
                <button
                  onClick={() => removerCenario(i)}
                  className="text-slate-300 hover:text-[#EF4444] transition-colors"
                >
                  <Trash2 size={14} strokeWidth={1.5} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
