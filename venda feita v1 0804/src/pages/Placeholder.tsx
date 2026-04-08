// ═══════════════════════════════════════════════════════════════
// Placeholder — Paginas ainda nao implementadas (Partes 3-4)
// ═══════════════════════════════════════════════════════════════

import { Construction } from 'lucide-react'

interface PlaceholderProps {
  title: string
  description: string
  module: 'equipe' | 'interno' | 'config'
  parte?: string
}

const moduleColors = {
  equipe: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    icon: 'text-emerald-400',
    border: 'border-emerald-200',
  },
  interno: {
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    icon: 'text-blue-400',
    border: 'border-blue-200',
  },
  config: {
    bg: 'bg-orange-50',
    text: 'text-orange-700',
    icon: 'text-orange-400',
    border: 'border-orange-200',
  },
}

function PlaceholderPage({ title, description, module, parte = 'Parte 3-4' }: PlaceholderProps) {
  const colors = moduleColors[module]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        <p className="text-gray-500 mt-1">{description}</p>
      </div>

      <div className={`${colors.bg} border ${colors.border} rounded-xl p-8 text-center`}>
        <Construction className={`w-12 h-12 ${colors.icon} mx-auto mb-4`} />
        <h2 className={`text-lg font-semibold ${colors.text} mb-2`}>
          Em construcao — {parte}
        </h2>
        <p className="text-sm text-gray-500 max-w-md mx-auto">
          Esta pagina sera implementada nas proximas entregas.
        </p>
      </div>
    </div>
  )
}

export function Parametrizacao() {
  return (
    <PlaceholderPage
      title="Parametrizacao"
      description="Regras de comissionamento, cadastro de vendedores e produtos"
      module="config"
      parte="Parte 4"
    />
  )
}
