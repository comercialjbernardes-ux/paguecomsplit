import { useState, useMemo } from 'react'
import {
  DollarSign,
  Users,
  TrendingUp,
  ChevronDown,
  CheckCircle,
  Clock,
  AlertCircle,
  Building2,
  MapPin,
  Package,
  Search,
} from 'lucide-react'
import { vendedores, carteiraPorVendedor } from '../../data/equipe'
import {
  calcularComissaoVendedor,
  calcularComissaoProduto,
  calcularComissaoTotalProdutos,
  calcularFaturamentoProdutos,
  statusPagamentoPorId,
  formatCurrency,
  formatPct,
} from '../../utils/calculos'

function StatusPgtoBadge({ status }) {
  const map = {
    pago: { icon: <CheckCircle size={12} strokeWidth={1.5} />, label: 'Pago', cls: 'bg-[#ECFDF5] text-[#065F46]' },
    pendente: { icon: <Clock size={12} strokeWidth={1.5} />, label: 'Pendente', cls: 'bg-[#FFFBEB] text-[#92400E]' },
    parcial: { icon: <AlertCircle size={12} strokeWidth={1.5} />, label: 'Parcial', cls: 'bg-[#EFF6FF] text-[#1E40AF]' },
  }
  const { icon, label, cls } = map[status]
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${cls}`}>
      {icon}{label}
    </span>
  )
}

function StatusClienteBadge({ status }) {
  const map = {
    ativo:    { label: 'Ativo',    cls: 'bg-[#ECFDF5] text-[#065F46]' },
    'em risco': { label: 'Em risco', cls: 'bg-[#FEF2F2] text-[#991B1B]' },
    novo:     { label: 'Novo',    cls: 'bg-[#EFF6FF] text-[#1E40AF]' },
  }
  const { label, cls } = map[status]
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cls}`}>
      {label}
    </span>
  )
}

function SelectVendedor({ value, onChange }) {
  const [open, setOpen] = useState(false)
  const selected = vendedores.find((v) => String(v.id) === value)

  return (
    <div className="relative w-full">
      <button
        onClick={() => setOpen((o) => !o)}
        className={`w-full flex items-center gap-3 h-14 px-5 text-[15px] border-2 rounded-[12px] bg-white transition-all duration-150 ${
          open ? 'border-[#00C896] shadow-[0_0_0_3px_rgba(0,200,150,0.15)]' : 'border-[#E2E8F0] hover:border-slate-300'
        }`}
      >
        {selected ? (
          <>
            <div className="w-8 h-8 bg-[#0D1B2A] rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs font-bold">{selected.avatar}</span>
            </div>
            <div className="flex-1 text-left">
              <p className="font-semibold text-[#0D1B2A] leading-tight">{selected.nome}</p>
              <p className="text-xs text-slate-400">{selected.regiao}</p>
            </div>
          </>
        ) : (
          <>
            <Search size={18} strokeWidth={1.5} className="text-slate-300 flex-shrink-0" />
            <span className="flex-1 text-left text-slate-400 font-normal">Selecionar vendedor</span>
          </>
        )}
        <ChevronDown size={18} strokeWidth={1.5} className={`text-slate-400 transition-transform duration-200 flex-shrink-0 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-[#E2E8F0] rounded-[12px] shadow-card-hover z-20 overflow-hidden">
            {selected && (
              <button
                onClick={() => { onChange(''); setOpen(false) }}
                className="w-full flex items-center gap-3 px-5 py-3 text-sm text-slate-400 hover:bg-[#F8FAFC] border-b border-[#E2E8F0] transition-colors"
              >
                Limpar seleção
              </button>
            )}
            {vendedores.map((v) => (
              <button
                key={v.id}
                onClick={() => { onChange(String(v.id)); setOpen(false) }}
                className={`w-full flex items-center gap-3 px-5 py-3 transition-colors hover:bg-[#F0FDF9] ${String(v.id) === value ? 'bg-[#E6FAF5]' : ''}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${String(v.id) === value ? 'bg-[#00C896]' : 'bg-[#0D1B2A]'}`}>
                  <span className="text-white text-xs font-bold">{v.avatar}</span>
                </div>
                <div className="text-left flex-1">
                  <p className={`text-sm font-medium ${String(v.id) === value ? 'text-[#00C896]' : 'text-[#0D1B2A]'}`}>{v.nome}</p>
                  <p className="text-xs text-slate-400">{v.regiao}</p>
                </div>
                {String(v.id) === value && <CheckCircle size={16} strokeWidth={1.5} className="text-[#00C896] flex-shrink-0" />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export function EquipeComissionamento() {
  const [periodo, setPeriodo] = useState('mensal')
  const [vendedorId, setVendedorId] = useState('')

  const vendedor = useMemo(() => vendedores.find((v) => String(v.id) === vendedorId) ?? null, [vendedorId])
  const carteira = useMemo(() => (vendedor ? carteiraPorVendedor[vendedor.id] : null), [vendedor])
  const comissao = useMemo(() => (vendedor ? calcularComissaoVendedor(vendedor, periodo) : null), [vendedor, periodo])
  const totalComissaoProdutos = useMemo(() => (carteira ? calcularComissaoTotalProdutos(carteira.produtos) : 0), [carteira])
  const totalFaturamentoProdutos = useMemo(() => (carteira ? calcularFaturamentoProdutos(carteira.produtos) : 0), [carteira])

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#0D1B2A]">Comissionamento</h1>
          <p className="text-slate-500 text-sm mt-1">Comissões e carteira de clientes por vendedor</p>
        </div>
        <div className="flex bg-white border border-[#E2E8F0] rounded-[8px] p-1 gap-1">
          {['mensal', 'acumulado'].map((p) => (
            <button
              key={p}
              onClick={() => setPeriodo(p)}
              className={`px-4 py-1.5 rounded-[6px] text-sm font-medium transition-all duration-150 ${
                periodo === p ? 'bg-[#0D1B2A] text-white shadow-sm' : 'text-slate-500 hover:text-[#0D1B2A]'
              }`}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="card p-6 mb-8">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Vendedor</p>
        <SelectVendedor value={vendedorId} onChange={setVendedorId} />
      </div>

      {!vendedor && (
        <div className="card py-16 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-[#F8FAFC] rounded-full flex items-center justify-center mb-4">
            <Users size={28} strokeWidth={1.5} className="text-slate-300" />
          </div>
          <p className="text-slate-500 font-medium mb-1">Nenhum vendedor selecionado</p>
          <p className="text-slate-400 text-sm">Selecione um vendedor acima para ver o detalhamento de comissões e carteira.</p>
        </div>
      )}

      {vendedor && comissao && carteira && (
        <>
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="card p-6">
              <div className="flex items-start justify-between mb-4">
                <p className="text-slate-500 text-sm font-medium">Faturamento</p>
                <div className="w-9 h-9 bg-[#E6FAF5] rounded-[8px] flex items-center justify-center">
                  <TrendingUp size={18} strokeWidth={1.5} className="text-[#00C896]" />
                </div>
              </div>
              <p className="text-[28px] font-bold text-[#0D1B2A] leading-none mb-2">{formatCurrency(comissao.fat)}</p>
              <div className="flex items-center justify-between">
                <p className="text-slate-400 text-xs">Meta: {formatCurrency(comissao.meta)}</p>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                  comissao.atingimentoPct >= 100 ? 'bg-[#ECFDF5] text-[#065F46]' : comissao.atingimentoPct >= 70 ? 'bg-[#FFFBEB] text-[#92400E]' : 'bg-[#FEF2F2] text-[#991B1B]'
                }`}>
                  {comissao.atingimentoPct}%
                </span>
              </div>
            </div>

            <div className="card p-6">
              <div className="flex items-start justify-between mb-4">
                <p className="text-slate-500 text-sm font-medium">Comissão Total Calculada</p>
                <div className="w-9 h-9 bg-[#FFFBEB] rounded-[8px] flex items-center justify-center">
                  <DollarSign size={18} strokeWidth={1.5} className="text-amber-500" />
                </div>
              </div>
              <p className="text-[28px] font-bold text-[#0D1B2A] leading-none mb-2">{formatCurrency(comissao.comissaoTotal)}</p>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-slate-400 text-xs">Base: {formatCurrency(comissao.comissaoBase)}</span>
                {comissao.bonusValor > 0 && (
                  <span className="text-[#00C896] text-xs font-semibold">+ Bônus: {formatCurrency(comissao.bonusValor)}</span>
                )}
              </div>
            </div>

            <div className="card p-6">
              <div className="flex items-start justify-between mb-4">
                <p className="text-slate-500 text-sm font-medium">Total de Clientes</p>
                <div className="w-9 h-9 bg-[#EFF6FF] rounded-[8px] flex items-center justify-center">
                  <Building2 size={18} strokeWidth={1.5} className="text-blue-500" />
                </div>
              </div>
              <p className="text-[28px] font-bold text-[#0D1B2A] leading-none mb-2">{carteira.clientes.length}</p>
              <div className="flex items-center gap-3 text-xs text-slate-400">
                <span className="text-[#10B981] font-medium">{carteira.clientes.filter((c) => c.status === 'ativo').length} ativos</span>
                <span>·</span>
                <span className="text-[#EF4444] font-medium">{carteira.clientes.filter((c) => c.status === 'em risco').length} em risco</span>
                <span>·</span>
                <span className="text-blue-500 font-medium">{carteira.clientes.filter((c) => c.status === 'novo').length} novos</span>
              </div>
            </div>
          </div>

          <div className="card overflow-hidden mb-8">
            <div className="px-6 py-4 border-b border-[#E2E8F0] flex items-center gap-3">
              <div className="w-8 h-8 bg-[#E6FAF5] rounded-[8px] flex items-center justify-center">
                <Package size={15} strokeWidth={1.5} className="text-[#00C896]" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-[#0D1B2A]">Produtos Vendidos</h2>
                <p className="text-xs text-slate-400">{carteira.produtos.length} produtos · {periodo}</p>
              </div>
              <div className="ml-auto flex items-center gap-1">
                <StatusPgtoBadge status={statusPagamentoPorId(vendedor.id)} />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#F8FAFC]">
                    {['Produto', 'Valor Vendido', '% Comissão', 'Valor Comissão'].map((h) => (
                      <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]">
                  {carteira.produtos.map((p, i) => {
                    const valComissao = calcularComissaoProduto(p.valorVendido, p.pctComissao)
                    return (
                      <tr key={i} className="hover:bg-[#F0FDF9] transition-colors duration-100">
                        <td className="px-6 py-4"><span className="text-sm font-medium text-[#0D1B2A]">{p.produto}</span></td>
                        <td className="px-6 py-4 text-sm font-semibold text-[#0D1B2A]">{formatCurrency(p.valorVendido)}</td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#F8FAFC] text-slate-600 border border-[#E2E8F0]">{formatPct(p.pctComissao)}</span>
                        </td>
                        <td className="px-6 py-4 text-sm font-semibold text-[#0D1B2A]">{formatCurrency(valComissao)}</td>
                      </tr>
                    )
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-[#F8FAFC] border-t-2 border-[#E2E8F0]">
                    <td className="px-6 py-4"><span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total</span></td>
                    <td className="px-6 py-4"><span className="text-sm font-bold text-[#0D1B2A]">{formatCurrency(totalFaturamentoProdutos)}</span></td>
                    <td className="px-6 py-4" />
                    <td className="px-6 py-4">
                      <span style={{ fontFamily: 'Inter', fontSize: '18px', fontWeight: 700, color: '#00C896' }}>{formatCurrency(totalComissaoProdutos)}</span>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          <div className="card overflow-hidden">
            <div className="px-6 py-4 border-b border-[#E2E8F0] flex items-center gap-3">
              <div className="w-8 h-8 bg-[#EFF6FF] rounded-[8px] flex items-center justify-center">
                <Building2 size={15} strokeWidth={1.5} className="text-blue-500" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-[#0D1B2A]">Panorama da Carteira</h2>
                <p className="text-xs text-slate-400">{carteira.clientes.length} clientes ativos em {vendedor.regiao}</p>
              </div>
            </div>
            <div className="divide-y divide-[#E2E8F0]">
              {carteira.clientes.map((c, i) => (
                <div key={i} className="flex items-center gap-4 px-6 py-4 hover:bg-[#F0FDF9] transition-colors duration-100">
                  <div className="w-10 h-10 bg-[#F8FAFC] border border-[#E2E8F0] rounded-[8px] flex items-center justify-center flex-shrink-0">
                    <Building2 size={16} strokeWidth={1.5} className="text-slate-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#0D1B2A] truncate">{c.nome}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <MapPin size={11} strokeWidth={1.5} className="text-slate-400 flex-shrink-0" />
                      <span className="text-xs text-slate-400">{c.cidade}</span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-semibold text-[#0D1B2A]">{formatCurrency(c.volumeMensal)}</p>
                    <p className="text-xs text-slate-400">vol. mensal</p>
                  </div>
                  <div className="flex-shrink-0">
                    <StatusClienteBadge status={c.status} />
                  </div>
                </div>
              ))}
            </div>
            <div className="px-6 py-4 bg-[#F8FAFC] border-t-2 border-[#E2E8F0] flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Volume Total Mensal</span>
              <span style={{ fontFamily: 'Inter', fontSize: '18px', fontWeight: 700, color: '#00C896' }}>
                {formatCurrency(carteira.clientes.reduce((s, c) => s + c.volumeMensal, 0))}
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
