import { useState, useMemo } from 'react'
import { Trophy, ArrowUpRight, ArrowDownRight, Medal } from 'lucide-react'
import {
  vendedores,
  regioes,
  calcularAtingimento,
  formatCurrency,
  formatCurrencyShort,
} from '../../data/equipe'

type Periodo = 'mensal' | 'acumulado'

function PodioCard({
  vendedor,
  posicao,
  periodo,
}: {
  vendedor: (typeof vendedores)[0]
  posicao: 1 | 2 | 3
  periodo: Periodo
}) {
  const fat = periodo === 'mensal' ? vendedor.faturamentoMensal : vendedor.faturamentoAcumulado
  const meta = periodo === 'mensal' ? vendedor.metaMensal : vendedor.metaAcumulada
  const pct = calcularAtingimento(fat, meta)

  const heights = { 1: 'h-36', 2: 'h-28', 3: 'h-24' }
  const sizes = { 1: 'w-16 h-16 text-base', 2: 'w-12 h-12 text-sm', 3: 'w-12 h-12 text-sm' }
  const nameSizes = { 1: 'text-base', 2: 'text-sm', 3: 'text-sm' }
  const podiumColors = {
    1: 'bg-[#00C896]/10 border-[#00C896]/30',
    2: 'bg-slate-100 border-slate-200',
    3: 'bg-amber-50 border-amber-200',
  }
  const medalColors = {
    1: 'text-[#00C896]',
    2: 'text-slate-400',
    3: 'text-amber-500',
  }

  return (
    <div className={`flex flex-col items-center ${posicao === 1 ? 'order-2' : posicao === 2 ? 'order-1' : 'order-3'}`}>
      {/* Avatar + name */}
      <div className="flex flex-col items-center gap-2 mb-3">
        {posicao === 1 && (
          <Trophy size={24} strokeWidth={1.5} className="text-[#00C896] mb-1" />
        )}
        {posicao !== 1 && (
          <Medal size={20} strokeWidth={1.5} className={`${medalColors[posicao]} mb-1`} />
        )}
        <div
          className={`${sizes[posicao]} bg-[#0D1B2A] rounded-full flex items-center justify-center flex-shrink-0 ${
            posicao === 1 ? 'ring-2 ring-[#00C896] ring-offset-2' : ''
          }`}
        >
          <span className="text-white font-bold">{vendedor.avatar}</span>
        </div>
        <div className="text-center">
          <p className={`font-semibold text-[#0D1B2A] ${nameSizes[posicao]}`}>{vendedor.nome}</p>
          <p className="text-slate-400 text-xs">{vendedor.regiao}</p>
        </div>
      </div>

      {/* Podium block */}
      <div
        className={`w-32 ${heights[posicao]} border rounded-t-[8px] flex flex-col items-center justify-start pt-3 gap-1 ${podiumColors[posicao]}`}
      >
        <span
          className={`text-2xl font-black ${
            posicao === 1 ? 'text-[#00C896]' : posicao === 2 ? 'text-slate-500' : 'text-amber-500'
          }`}
        >
          #{posicao}
        </span>
        <p className="text-xs font-semibold text-[#0D1B2A]">{formatCurrencyShort(fat)}</p>
        <p className="text-xs text-slate-400">{pct}% meta</p>
      </div>
    </div>
  )
}

export function EquipeRanking() {
  const [periodo, setPeriodo] = useState<Periodo>('mensal')
  const [regiaoFiltro, setRegiaoFiltro] = useState('Todas')

  const ranked = useMemo(() => {
    const filtered =
      regiaoFiltro === 'Todas'
        ? vendedores
        : vendedores.filter((v) => v.regiao === regiaoFiltro)

    return [...filtered].sort((a, b) => {
      const fa = periodo === 'mensal' ? a.faturamentoMensal : a.faturamentoAcumulado
      const fb = periodo === 'mensal' ? b.faturamentoMensal : b.faturamentoAcumulado
      return fb - fa
    })
  }, [periodo, regiaoFiltro])

  const top3 = ranked.slice(0, 3)

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#0D1B2A]">Ranking de Vendedores</h1>
          <p className="text-slate-500 text-sm mt-1">Classificação por faturamento</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Filtro Região */}
          <select
            value={regiaoFiltro}
            onChange={(e) => setRegiaoFiltro(e.target.value)}
            className="h-9 px-3 pr-8 text-sm border border-[#E2E8F0] rounded-[8px] bg-white text-[#0D1B2A] font-medium focus:outline-none focus:ring-2 focus:ring-[#00C896]/30 focus:border-[#00C896] appearance-none cursor-pointer"
            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394A3B8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center' }}
          >
            {regioes.map((r) => (
              <option key={r} value={r}>{r === 'Todas' ? 'Todas as regiões' : r}</option>
            ))}
          </select>

          {/* Toggle Período */}
          <div className="flex bg-white border border-[#E2E8F0] rounded-[8px] p-1 gap-1">
            {(['mensal', 'acumulado'] as Periodo[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriodo(p)}
                className={`px-4 py-1.5 rounded-[6px] text-sm font-medium transition-all duration-150 ${
                  periodo === p
                    ? 'bg-[#0D1B2A] text-white shadow-sm'
                    : 'text-slate-500 hover:text-[#0D1B2A]'
                }`}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Pódio */}
      {top3.length >= 3 && (
        <div className="card p-8 mb-8">
          <div className="flex items-end justify-center gap-4">
            {top3.map((v, i) => (
              <PodioCard
                key={v.id}
                vendedor={v}
                posicao={(i + 1) as 1 | 2 | 3}
                periodo={periodo}
              />
            ))}
          </div>
        </div>
      )}

      {/* Tabela completa */}
      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-[#E2E8F0] flex items-center justify-between">
          <h2 className="text-base font-semibold text-[#0D1B2A]">Classificação Completa</h2>
          <p className="text-slate-400 text-xs">{ranked.length} vendedores</p>
        </div>
        <div>
          {ranked.map((v, idx) => {
            const fat = periodo === 'mensal' ? v.faturamentoMensal : v.faturamentoAcumulado
            const pct = calcularAtingimento(
              fat,
              periodo === 'mensal' ? v.metaMensal : v.metaAcumulada
            )
            const posicao = idx + 1
            const isTop3 = posicao <= 3
            const isPositivo = v.variacaoMes >= 0

            return (
              <div
                key={v.id}
                className="flex items-center gap-4 px-6 py-4 border-b border-[#E2E8F0] last:border-0 hover:bg-[#F0FDF9] transition-colors duration-100"
              >
                {/* Posição */}
                <div className="w-10 flex-shrink-0 text-center">
                  <span
                    className={`text-xl font-black ${
                      posicao === 1
                        ? 'text-[#00C896]'
                        : posicao === 2
                        ? 'text-slate-400'
                        : posicao === 3
                        ? 'text-amber-500'
                        : 'text-slate-300'
                    }`}
                  >
                    {posicao}
                  </span>
                </div>

                {/* Avatar */}
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    isTop3 ? 'bg-[#0D1B2A]' : 'bg-slate-100'
                  }`}
                >
                  <span
                    className={`text-xs font-bold ${isTop3 ? 'text-white' : 'text-slate-500'}`}
                  >
                    {v.avatar}
                  </span>
                </div>

                {/* Info */}
                <div className="flex-1">
                  <p className="text-sm font-semibold text-[#0D1B2A]">{v.nome}</p>
                  <p className="text-xs text-slate-400">{v.regiao}</p>
                </div>

                {/* Faturamento */}
                <div className="text-right">
                  <p className="text-sm font-bold text-[#0D1B2A]">{formatCurrency(fat)}</p>
                  <div className="flex items-center justify-end gap-0.5 mt-0.5">
                    {isPositivo ? (
                      <ArrowUpRight size={12} strokeWidth={2} className="text-[#10B981]" />
                    ) : (
                      <ArrowDownRight size={12} strokeWidth={2} className="text-[#EF4444]" />
                    )}
                    <span
                      className={`text-xs font-medium ${
                        isPositivo ? 'text-[#10B981]' : 'text-[#EF4444]'
                      }`}
                    >
                      {Math.abs(v.variacaoMes)}%
                    </span>
                  </div>
                </div>

                {/* % Atingimento */}
                <div className="w-24 text-right">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      pct >= 100
                        ? 'bg-[#ECFDF5] text-[#065F46]'
                        : pct >= 70
                        ? 'bg-[#FFFBEB] text-[#92400E]'
                        : 'bg-[#FEF2F2] text-[#991B1B]'
                    }`}
                  >
                    {pct}%
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
