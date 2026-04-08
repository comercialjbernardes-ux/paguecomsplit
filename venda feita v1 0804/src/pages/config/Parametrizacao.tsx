// ═══════════════════════════════════════════════════════════════
// Parametrizacao — Hub de configuracoes avancadas
// Agrupa: Regras de Comissao e Cadastro de Vendedores
// ═══════════════════════════════════════════════════════════════

import { useState } from 'react'
import { Sliders, DollarSign, Users } from 'lucide-react'
import { RegrasComissaoPage } from './RegrasComissao'
import { CadastroVendedoresPage } from './CadastroVendedores'

type TabParam = 'comissoes' | 'vendedores'

export function ParametrizacaoPage() {
  const [activeTab, setActiveTab] = useState<TabParam>('comissoes')

  const tabs = [
    { key: 'comissoes' as TabParam, label: 'Regras de Comissao', icon: <DollarSign className="w-4 h-4" /> },
    { key: 'vendedores' as TabParam, label: 'Cadastro de Vendedores', icon: <Users className="w-4 h-4" /> },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <Sliders className="w-7 h-7 text-orange-500" />
          Parametrizacao
        </h1>
        <p className="text-gray-500 mt-1">
          Configure regras de comissionamento e gerencie a equipe de vendas
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-md transition-colors ${
              activeTab === tab.key
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Conteudo da tab */}
      {activeTab === 'comissoes' && <RegrasComissaoPage />}
      {activeTab === 'vendedores' && <CadastroVendedoresPage />}
    </div>
  )
}
