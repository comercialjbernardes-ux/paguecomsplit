import { useState } from 'react'
import { Settings, Users, DollarSign, Target, RotateCcw, Save, Check } from 'lucide-react'
import { vendedores } from '../data/equipe'
import { useConfig } from '../context/ConfigContext'
import { formatCurrency, formatPct } from '../utils/formatters'

const TABS = [
  { id: 'vendedores', label: 'Vendedores', icon: Users },
  { id: 'comissionamento', label: 'Comissionamento', icon: DollarSign },
  { id: 'metas', label: 'Metas', icon: Target },
]

function SaveToast({ show }) {
  if (!show) return null
  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-[#0D1B2A] text-white text-sm font-medium px-4 py-3 rounded-[10px] shadow-xl animate-fade-in">
      <Check size={16} strokeWidth={1.5} className="text-[#00C896]" />
      Configurações salvas!
    </div>
  )
}

function TabVendedores() {
  const { config, setMetaVendedor } = useConfig()

  return (
    <div className="card overflow-hidden">
      <div className="px-6 py-4 border-b border-[#E2E8F0]">
        <h2 className="text-sm font-semibold text-[#0D1B2A]">Metas Individuais</h2>
        <p className="text-xs text-slate-400 mt-0.5">Defina a meta mensal para cada vendedor</p>
      </div>
      <table className="w-full">
        <thead>
          <tr className="bg-[#F8FAFC]">
            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Vendedor</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Região</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Meta Padrão</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Meta Customizada</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#E2E8F0]">
          {vendedores.map((v) => {
            const custom = config.metasCustomizadas[v.id]
            return (
              <tr key={v.id} className="hover:bg-[#F0FDF9] transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-[#0D1B2A] rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xs font-bold">{v.avatar}</span>
                    </div>
                    <span className="text-sm font-medium text-[#0D1B2A]">{v.nome}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-slate-500">{v.regiao}</td>
                <td className="px-6 py-4 text-sm text-slate-400">{formatCurrency(v.metaMensal)}</td>
                <td className="px-6 py-4">
                  <input
                    type="number"
                    value={custom ?? v.metaMensal}
                    onChange={(e) => setMetaVendedor(v.id, Number(e.target.value))}
                    className="w-40 h-9 px-3 text-sm font-medium text-[#0D1B2A] border border-[#E2E8F0] rounded-[8px] focus:outline-none focus:ring-2 focus:ring-[#00C896]/30 focus:border-[#00C896]"
                  />
                  {custom && custom !== v.metaMensal && (
                    <span className="ml-2 text-xs text-[#00C896] font-medium">✓ alterado</span>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function TabComissionamento() {
  const { config, setComissaoVendedor, setBonusVendedor } = useConfig()

  return (
    <div className="card overflow-hidden">
      <div className="px-6 py-4 border-b border-[#E2E8F0]">
        <h2 className="text-sm font-semibold text-[#0D1B2A]">Regras de Comissionamento</h2>
        <p className="text-xs text-slate-400 mt-0.5">Configure comissão base e bônus por vendedor</p>
      </div>
      <table className="w-full">
        <thead>
          <tr className="bg-[#F8FAFC]">
            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Vendedor</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Comissão Base (%)</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Bônus por Meta (%)</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Comissão Total Máx.</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#E2E8F0]">
          {vendedores.map((v) => {
            const comissao = config.comissoesCustomizadas[v.id] ?? v.comissaoBase
            const bonus = config.bonusCustomizados[v.id] ?? v.bonus
            return (
              <tr key={v.id} className="hover:bg-[#F0FDF9] transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-[#0D1B2A] rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xs font-bold">{v.avatar}</span>
                    </div>
                    <span className="text-sm font-medium text-[#0D1B2A]">{v.nome}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step="0.1"
                      value={comissao}
                      onChange={(e) => setComissaoVendedor(v.id, parseFloat(e.target.value))}
                      className="w-24 h-9 px-3 text-sm font-medium text-[#0D1B2A] border border-[#E2E8F0] rounded-[8px] focus:outline-none focus:ring-2 focus:ring-[#00C896]/30 focus:border-[#00C896]"
                    />
                    <span className="text-xs text-slate-400">%</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step="0.1"
                      value={bonus}
                      onChange={(e) => setBonusVendedor(v.id, parseFloat(e.target.value))}
                      className="w-24 h-9 px-3 text-sm font-medium text-[#0D1B2A] border border-[#E2E8F0] rounded-[8px] focus:outline-none focus:ring-2 focus:ring-[#00C896]/30 focus:border-[#00C896]"
                    />
                    <span className="text-xs text-slate-400">%</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm font-semibold text-[#00C896]">{formatPct(comissao + bonus)}</span>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function TabMetas() {
  const { config, updateConfig } = useConfig()

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <h2 className="text-sm font-semibold text-[#0D1B2A] mb-1">Configurações Globais</h2>
        <p className="text-xs text-slate-400 mb-6">Aplicadas quando não há personalização individual</p>
        <div className="grid grid-cols-3 gap-6">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Meta Mensal Padrão (R$)</label>
            <input
              type="number"
              value={config.metaGlobalPadrao}
              onChange={(e) => updateConfig({ metaGlobalPadrao: Number(e.target.value) })}
              className="w-full h-10 px-3 text-sm font-semibold text-[#0D1B2A] border border-[#E2E8F0] rounded-[8px] focus:outline-none focus:ring-2 focus:ring-[#00C896]/30 focus:border-[#00C896]"
            />
            <p className="text-xs text-slate-400 mt-1">{formatCurrency(config.metaGlobalPadrao)}</p>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Comissão Base Padrão (%)</label>
            <input
              type="number"
              step="0.1"
              value={config.comissaoBasePadrao}
              onChange={(e) => updateConfig({ comissaoBasePadrao: parseFloat(e.target.value) })}
              className="w-full h-10 px-3 text-sm font-semibold text-[#0D1B2A] border border-[#E2E8F0] rounded-[8px] focus:outline-none focus:ring-2 focus:ring-[#00C896]/30 focus:border-[#00C896]"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Bônus Padrão (%)</label>
            <input
              type="number"
              step="0.1"
              value={config.bonusPadrao}
              onChange={(e) => updateConfig({ bonusPadrao: parseFloat(e.target.value) })}
              className="w-full h-10 px-3 text-sm font-semibold text-[#0D1B2A] border border-[#E2E8F0] rounded-[8px] focus:outline-none focus:ring-2 focus:ring-[#00C896]/30 focus:border-[#00C896]"
            />
          </div>
        </div>
      </div>

      <div className="card p-6">
        <h2 className="text-sm font-semibold text-[#0D1B2A] mb-1">Resumo das Metas</h2>
        <p className="text-xs text-slate-400 mb-4">Visualização consolidada da equipe</p>
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-[#F7F8FA] rounded-[10px] p-4">
            <p className="text-xs text-slate-400 mb-1">Meta Total Equipe / Mês</p>
            <p className="text-xl font-bold text-[#0D1B2A]">
              {formatCurrency(vendedores.reduce((s, v) => s + (config.metasCustomizadas[v.id] ?? v.metaMensal), 0))}
            </p>
          </div>
          <div className="bg-[#F7F8FA] rounded-[10px] p-4">
            <p className="text-xs text-slate-400 mb-1">Meta Total / Ano</p>
            <p className="text-xl font-bold text-[#0D1B2A]">
              {formatCurrency(vendedores.reduce((s, v) => s + (config.metasCustomizadas[v.id] ?? v.metaMensal), 0) * 12)}
            </p>
          </div>
          <div className="bg-[#F7F8FA] rounded-[10px] p-4">
            <p className="text-xs text-slate-400 mb-1">Comissão Máx. / Mês</p>
            <p className="text-xl font-bold text-[#00C896]">
              {formatCurrency(
                vendedores.reduce((s, v) => {
                  const meta = config.metasCustomizadas[v.id] ?? v.metaMensal
                  const c = config.comissoesCustomizadas[v.id] ?? v.comissaoBase
                  const b = config.bonusCustomizados[v.id] ?? v.bonus
                  return s + meta * ((c + b) / 100)
                }, 0)
              )}
            </p>
          </div>
          <div className="bg-[#F7F8FA] rounded-[10px] p-4">
            <p className="text-xs text-slate-400 mb-1">Vendedores Configurados</p>
            <p className="text-xl font-bold text-[#0D1B2A]">{vendedores.length}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export function Parametrizacao() {
  const [tab, setTab] = useState('vendedores')
  const [saved, setSaved] = useState(false)
  const { resetConfig } = useConfig()

  function handleSave() {
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#0D1B2A]">Parametrização</h1>
          <p className="text-slate-500 text-sm mt-1">Configure metas, comissões e regras da equipe</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={resetConfig}
            className="flex items-center gap-2 h-9 px-4 text-sm font-medium text-slate-500 border border-[#E2E8F0] rounded-[8px] bg-white hover:border-slate-300 hover:text-[#0D1B2A] transition-colors"
          >
            <RotateCcw size={14} strokeWidth={1.5} />
            Restaurar padrões
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 h-9 px-4 text-sm font-medium bg-[#0D1B2A] text-white rounded-[8px] hover:bg-[#162A3E] transition-colors"
          >
            <Save size={14} strokeWidth={1.5} />
            Salvar configurações
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white border border-[#E2E8F0] rounded-[10px] p-1 mb-8 w-fit">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-5 py-2 rounded-[8px] text-sm font-medium transition-all duration-150 ${
              tab === id ? 'bg-[#0D1B2A] text-white shadow-sm' : 'text-slate-500 hover:text-[#0D1B2A]'
            }`}
          >
            <Icon size={15} strokeWidth={1.5} />
            {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === 'vendedores'      && <TabVendedores />}
      {tab === 'comissionamento' && <TabComissionamento />}
      {tab === 'metas'           && <TabMetas />}

      <SaveToast show={saved} />
    </div>
  )
}
