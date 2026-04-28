// ═══════════════════════════════════════════════════════════════
// Sidebar — Navegacao lateral conforme fluxograma
// Modulo Equipe (verde) | Modulo Interno (azul) | Config (laranja)
// ═══════════════════════════════════════════════════════════════

import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Trophy,
  DollarSign,
  FileBarChart,
  TrendingUp,
  Wallet,
  Users,
  Receipt,
  ClipboardList,
  Settings,
  Sliders,
  LogOut,
  ChevronDown,
  ChevronRight,
  Wrench,
  BarChart2,
  FileText,
  ScrollText,
} from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'

interface NavItem {
  label: string
  path: string
  icon: React.ReactNode
}

interface NavSection {
  title: string
  color: string // cor do badge do modulo
  bgColor: string // cor de fundo do badge
  items: NavItem[]
}

const sections: NavSection[] = [
  {
    title: 'Equipe',
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-50',
    items: [
      {
        label: 'Dashboard de Resultados',
        path: '/equipe/dashboard',
        icon: <LayoutDashboard className="w-4 h-4" />,
      },
      {
        label: 'Ranking',
        path: '/equipe/ranking',
        icon: <Trophy className="w-4 h-4" />,
      },
      {
        label: 'Comissionamento',
        path: '/equipe/comissionamento',
        icon: <DollarSign className="w-4 h-4" />,
      },
    ],
  },
  {
    title: 'Interno',
    color: 'text-blue-700',
    bgColor: 'bg-blue-50',
    items: [
      {
        label: 'DRE Gerencial',
        path: '/interno/dre',
        icon: <FileBarChart className="w-4 h-4" />,
      },
      {
        label: 'Projecao de Crescimento',
        path: '/interno/projecao',
        icon: <TrendingUp className="w-4 h-4" />,
      },
      {
        label: 'Custos e Receitas',
        path: '/interno/custos',
        icon: <Wallet className="w-4 h-4" />,
      },
      {
        label: 'Analise de Carteira',
        path: '/interno/carteira',
        icon: <Users className="w-4 h-4" />,
      },
      {
        label: 'Lancamentos',
        path: '/interno/transacoes',
        icon: <Receipt className="w-4 h-4" />,
      },
      {
        label: 'Gestao de Custos',
        path: '/interno/gestao-custos',
        icon: <Wrench className="w-4 h-4" />,
      },
    ],
  },
  {
    title: 'Relatorios',
    color: 'text-violet-700',
    bgColor: 'bg-violet-50',
    items: [
      {
        label: 'Gerar Relatorios',
        path: '/relatorios',
        icon: <ClipboardList className="w-4 h-4" />,
      },
      {
        label: 'Comparativo Mensal',
        path: '/comparativo',
        icon: <BarChart2 className="w-4 h-4" />,
      },
      {
        label: 'Relatorio Executivo',
        path: '/relatorio-executivo',
        icon: <FileText className="w-4 h-4" />,
      },
    ],
  },
  {
    title: 'Configuracao',
    color: 'text-orange-700',
    bgColor: 'bg-orange-50',
    items: [
      {
        label: 'Parametrizacao',
        path: '/parametrizacao',
        icon: <Sliders className="w-4 h-4" />,
      },
      {
        label: 'Configuracoes',
        path: '/settings',
        icon: <Settings className="w-4 h-4" />,
      },
    ],
  },
  {
    title: 'Sistema',
    color: 'text-gray-700',
    bgColor: 'bg-gray-100',
    items: [
      {
        label: 'Logs do Sistema',
        path: '/logs',
        icon: <ScrollText className="w-4 h-4" />,
      },
    ],
  },
]

export function Sidebar() {
  const { user, signOut } = useAuth()
  const location = useLocation()
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set())

  const toggleSection = (title: string) => {
    setCollapsedSections((prev) => {
      const next = new Set(prev)
      if (next.has(title)) {
        next.delete(title)
      } else {
        next.add(title)
      }
      return next
    })
  }

  // Verificar se algum item da secao esta ativo
  const isSectionActive = (section: NavSection) =>
    section.items.some((item) => location.pathname.startsWith(item.path))

  return (
    <aside className="w-64 bg-navy-500 text-white flex flex-col min-h-screen">
      {/* Logo */}
      <div className="p-6 border-b border-navy-400">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold leading-tight">Venda Feita</h1>
            <p className="text-xs text-navy-200">Dashboard Financeiro</p>
          </div>
        </div>
      </div>

      {/* Navegacao */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        {sections.map((section) => {
          const isCollapsed = collapsedSections.has(section.title)
          const isActive = isSectionActive(section)

          return (
            <div key={section.title} className="mb-4">
              {/* Titulo da secao */}
              <button
                onClick={() => toggleSection(section.title)}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-navy-200 hover:text-white transition-colors"
              >
                <span
                  className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-bold ${section.bgColor} ${section.color}`}
                >
                  {section.title.charAt(0)}
                </span>
                <span className="flex-1 text-left">{section.title}</span>
                {isCollapsed ? (
                  <ChevronRight className="w-3.5 h-3.5" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5" />
                )}
                {isActive && isCollapsed && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                )}
              </button>

              {/* Items */}
              {!isCollapsed && (
                <div className="mt-1 space-y-0.5">
                  {section.items.map((item) => (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                          isActive
                            ? 'bg-emerald-500/20 text-emerald-400 font-medium'
                            : 'text-navy-100 hover:bg-navy-400/50 hover:text-white'
                        }`
                      }
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </nav>

      {/* Usuario */}
      <div className="border-t border-navy-400 p-4">
        {user ? (
          <div className="flex items-center gap-3">
            {user.picture ? (
              <img
                src={user.picture}
                alt={user.name}
                className="w-9 h-9 rounded-full ring-2 ring-navy-400"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-emerald-500 flex items-center justify-center text-sm font-bold">
                {user.name?.charAt(0) || '?'}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user.name}</p>
              <p className="text-xs text-navy-200 truncate">{user.email}</p>
            </div>
            <button
              onClick={signOut}
              className="p-1.5 text-navy-200 hover:text-red-400 transition-colors rounded-lg hover:bg-navy-400/50"
              title="Sair"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="text-center text-sm text-navy-200">
            Nao autenticado
          </div>
        )}
      </div>
    </aside>
  )
}
