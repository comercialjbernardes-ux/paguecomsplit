import type { LucideIcon } from 'lucide-react'

interface EmptyStateProps {
  icon: LucideIcon
  title?: string
  description: string
}

/**
 * Exibido no lugar de tabelas/gráficos quando não há dados disponíveis.
 * Ícone 40px, cor #E2E8F0 | Título Inter 16px/600, #6B7280 | Instrução contextual.
 */
export function EmptyState({
  icon: Icon,
  title = 'Nenhum dado disponível',
  description,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <Icon size={40} strokeWidth={1.5} className="text-[#E2E8F0] mb-4" />
      <h3
        className="font-semibold mb-2"
        style={{ fontFamily: 'Inter', fontSize: '16px', color: '#6B7280' }}
      >
        {title}
      </h3>
      <p className="text-slate-400 text-sm max-w-xs leading-relaxed">{description}</p>
    </div>
  )
}
