// ═══════════════════════════════════════════════════════════════
// PeriodSelector — Seletor de período reutilizável
// Opções: Último período | Resultado Acumulado | Cada mês
// ═══════════════════════════════════════════════════════════════

import { Calendar } from 'lucide-react'
import type { DadosFechamento } from '../types'

interface PeriodSelectorProps {
  fechamentos: DadosFechamento[]
  value: string   // 'ultimo' | 'acumulado' | 'Mar2026'
  onChange: (v: string) => void
  className?: string
}

export function PeriodSelector({ fechamentos, value, onChange, className = '' }: PeriodSelectorProps) {
  const ultimoPeriodo = fechamentos.length > 0 ? fechamentos[fechamentos.length - 1].periodo : ''

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
      <span className="text-sm text-gray-600 whitespace-nowrap font-medium">Período:</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="border border-emerald-400 rounded-lg px-3 py-1.5 text-sm bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-200 hover:border-emerald-500 transition-colors cursor-pointer"
      >
        <option value="ultimo">Último período{ultimoPeriodo ? ` (${ultimoPeriodo})` : ''}</option>
        <option value="acumulado">Resultado Acumulado</option>
        {fechamentos.length > 1 && <option disabled value="">────────────</option>}
        {[...fechamentos].reverse().map((f) => (
          <option key={f.periodo} value={f.periodo}>{f.periodo}</option>
        ))}
      </select>
    </div>
  )
}
