/**
 * EmptyState — exibido no lugar de tabelas/gráficos sem dados.
 */
export function EmptyState({ icon: Icon, title = 'Nenhum dado disponível', description }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <Icon size={40} strokeWidth={1.5} className="text-[#E2E8F0] mb-4" />
      <h3 className="text-base font-semibold text-[#6B7280] mb-2">{title}</h3>
      <p className="text-slate-400 text-sm max-w-xs leading-relaxed">{description}</p>
    </div>
  )
}
