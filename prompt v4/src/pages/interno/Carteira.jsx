import { useState, useMemo } from 'react'
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ZAxis,
} from 'recharts'
import { Users, Trophy, Filter } from 'lucide-react'
import { clientesCarteira, segmentos } from '../../data/interno'
import { vendedores } from '../../data/equipe'
import { formatCurrency, formatCurrencyShort } from '../../utils/formatters'

function ScatterTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="bg-[#0D1B2A] rounded-[8px] px-4 py-3 shadow-xl">
      <p className="text-white font-semibold text-sm mb-1">{d.nome}</p>
      <p className="text-white/60 text-xs">{d.segmento} · {d.vendedorNome}</p>
      <div className="mt-2 space-y-0.5">
        <p className="text-white/80 text-xs">Frequência: {d.frequenciaCompra}x / tri</p>
        <p className="text-white/80 text-xs">Ticket médio: {formatCurrency(d.ticketMedio)}</p>
        <p className="text-white/80 text-xs">Total acumulado: {formatCurrency(d.totalAcumulado)}</p>
      </div>
    </div>
  )
}

export function InternoCarteira() {
  const [segmentoFiltro, setSegmentoFiltro] = useState('Todos')
  const [vendedorFiltro, setVendedorFiltro] = useState(0)

  const filtrados = useMemo(() => {
    return clientesCarteira.filter((c) => {
      if (segmentoFiltro !== 'Todos' && c.segmento !== segmentoFiltro) return false
      if (vendedorFiltro !== 0 && c.vendedorId !== vendedorFiltro) return false
      return true
    })
  }, [segmentoFiltro, vendedorFiltro])

  const segmentosData = useMemo(() => {
    const map = {}
    const source = vendedorFiltro !== 0 ? clientesCarteira.filter((c) => c.vendedorId === vendedorFiltro) : clientesCarteira
    source.forEach((c) => {
      if (!map[c.segmento]) map[c.segmento] = { total: 0, count: 0 }
      map[c.segmento].total += c.ticketMedio
      map[c.segmento].count += 1
    })
    return Object.entries(map).map(([segmento, { total, count }]) => ({ segmento, count, ticketMedio: Math.round(total / count) })).sort((a, b) => b.ticketMedio - a.ticketMedio)
  }, [vendedorFiltro])

  const top10 = useMemo(() => [...filtrados].sort((a, b) => b.totalAcumulado - a.totalAcumulado).slice(0, 10), [filtrados])

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#0D1B2A]">Análise de Carteira</h1>
          <p className="text-slate-500 text-sm mt-1">Segmentos, clientes e dispersão de performance</p>
        </div>
      </div>

      <div className="flex items-center gap-4 mb-6 flex-wrap">
        <div className="flex items-center gap-2">
          <Filter size={16} strokeWidth={1.5} className="text-slate-400" />
          <span className="text-sm text-slate-500 font-medium">Filtros:</span>
        </div>
        <select value={segmentoFiltro} onChange={(e) => setSegmentoFiltro(e.target.value)}
          className="h-9 px-3 text-sm border border-[#E2E8F0] rounded-[8px] bg-white text-[#0D1B2A] font-medium focus:outline-none focus:ring-2 focus:ring-[#00C896]/30">
          {segmentos.map((s) => <option key={s} value={s}>{s === 'Todos' ? 'Todos os segmentos' : s}</option>)}
        </select>
        <select value={vendedorFiltro} onChange={(e) => setVendedorFiltro(Number(e.target.value))}
          className="h-9 px-3 text-sm border border-[#E2E8F0] rounded-[8px] bg-white text-[#0D1B2A] font-medium focus:outline-none focus:ring-2 focus:ring-[#00C896]/30">
          <option value={0}>Todos os vendedores</option>
          {vendedores.map((v) => <option key={v.id} value={v.id}>{v.nome}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        {segmentosData.map((s) => (
          <div key={s.segmento} onClick={() => setSegmentoFiltro(segmentoFiltro === s.segmento ? 'Todos' : s.segmento)}
            className={`bg-white border rounded-[12px] shadow-card p-5 cursor-pointer transition-all duration-150 hover:shadow-card-hover ${
              segmentoFiltro === s.segmento ? 'border-[#00C896] ring-2 ring-[#00C896]/20' : 'border-[#E2E8F0]'
            }`}>
            <p className="text-sm font-semibold text-[#0D1B2A] mb-2">{s.segmento}</p>
            <div className="flex items-baseline gap-1 mb-1">
              <span className="text-2xl font-bold text-[#0D1B2A]">{s.count}</span>
              <span className="text-xs text-slate-400">clientes</span>
            </div>
            <p className="text-xs text-slate-500">Ticket médio: <span className="font-semibold text-[#0D1B2A]">{formatCurrency(s.ticketMedio)}</span></p>
          </div>
        ))}
      </div>

      <div className="bg-white border border-[#E2E8F0] rounded-[12px] shadow-card overflow-hidden mb-8">
        <div className="px-6 py-4 border-b border-[#E2E8F0] flex items-center gap-2">
          <Users size={16} strokeWidth={1.5} className="text-[#0D1B2A]" />
          <h2 className="text-sm font-semibold text-[#0D1B2A]">Clientes</h2>
          <span className="text-xs text-slate-400 ml-auto">{filtrados.length} clientes</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#F8FAFC]">
                {['Nome', 'Segmento', 'Vendedor', 'Última Compra', 'Total Acumulado', 'Ticket Médio'].map((h) => (
                  <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {filtrados.map((c) => (
                <tr key={c.id} className="hover:bg-[#F0FDF9] transition-colors">
                  <td className="px-6 py-3.5 text-sm font-medium text-[#0D1B2A]">{c.nome}</td>
                  <td className="px-6 py-3.5">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#F8FAFC] text-slate-600 border border-[#E2E8F0]">{c.segmento}</span>
                  </td>
                  <td className="px-6 py-3.5 text-sm text-slate-500">{c.vendedorNome}</td>
                  <td className="px-6 py-3.5 text-sm text-slate-500 whitespace-nowrap">{new Date(c.ultimaCompra + 'T00:00').toLocaleDateString('pt-BR')}</td>
                  <td className="px-6 py-3.5 text-sm font-semibold text-[#0D1B2A]">{formatCurrency(c.totalAcumulado)}</td>
                  <td className="px-6 py-3.5 text-sm text-slate-500">{formatCurrency(c.ticketMedio)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white border border-[#E2E8F0] rounded-[12px] shadow-card overflow-hidden">
          <div className="px-6 py-4 border-b border-[#E2E8F0] flex items-center gap-2">
            <Trophy size={16} strokeWidth={1.5} className="text-[#00C896]" />
            <h2 className="text-sm font-semibold text-[#0D1B2A]">Top 10 Clientes</h2>
          </div>
          <div className="divide-y divide-[#E2E8F0]">
            {top10.map((c, i) => (
              <div key={c.id} className="flex items-center gap-4 px-6 py-3 hover:bg-[#F0FDF9] transition-colors">
                <span className={`text-lg font-black w-7 text-center ${i < 3 ? 'text-[#00C896]' : 'text-slate-300'}`}>{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#0D1B2A] truncate">{c.nome}</p>
                  <p className="text-xs text-slate-400">{c.segmento} · {c.vendedorNome}</p>
                </div>
                <span className="text-sm font-bold text-[#0D1B2A]">{formatCurrency(c.totalAcumulado)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-[#E2E8F0] rounded-[12px] shadow-card p-6">
          <h2 className="text-sm font-semibold text-[#0D1B2A] mb-1">Dispersão de Clientes</h2>
          <p className="text-xs text-slate-400 mb-4">Frequência de compra × Ticket médio</p>
          <ResponsiveContainer width="100%" height={380}>
            <ScatterChart margin={{ bottom: 10, left: 5, right: 10 }}>
              <CartesianGrid stroke="#E2E8F0" />
              <XAxis dataKey="frequenciaCompra" type="number" name="Frequência" axisLine={false} tickLine={false}
                tick={{ fill: '#94A3B8', fontSize: 11, fontFamily: 'Inter' }}
                label={{ value: 'Freq. compra (tri)', position: 'insideBottom', offset: -5, style: { fill: '#94A3B8', fontSize: 11, fontFamily: 'Inter' } }} domain={[0, 14]} />
              <YAxis dataKey="ticketMedio" type="number" name="Ticket Médio" axisLine={false} tickLine={false}
                tick={{ fill: '#94A3B8', fontSize: 11, fontFamily: 'Inter' }} tickFormatter={(v) => formatCurrencyShort(v)} width={70}
                label={{ value: 'Ticket médio', angle: -90, position: 'insideLeft', offset: 5, style: { fill: '#94A3B8', fontSize: 11, fontFamily: 'Inter' } }} />
              <ZAxis dataKey="totalAcumulado" range={[40, 300]} name="Total Acumulado" />
              <Tooltip content={<ScatterTooltip />} cursor={{ strokeDasharray: '4 4', stroke: '#CBD5E1' }} />
              <Scatter data={filtrados} fill="#00C896" fillOpacity={0.7} stroke="#0D1B2A" strokeWidth={1} />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
