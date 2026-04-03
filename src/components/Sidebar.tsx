import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  Trophy,
  DollarSign,
  TrendingUp,
  ChevronRight,
  FileText,
  LineChart,
  Wallet,
  Briefcase,
  X,
} from 'lucide-react'

interface NavItem {
  label: string
  to: string
  icon: React.ReactNode
}

interface NavSection {
  title: string
  items: NavItem[]
}

const sections: NavSection[] = [
  {
    title: 'Equipe',
    items: [
      {
        label: 'Dashboard',
        to: '/equipe/dashboard',
        icon: <LayoutDashboard size={18} strokeWidth={1.5} />,
      },
      {
        label: 'Ranking',
        to: '/equipe/ranking',
        icon: <Trophy size={18} strokeWidth={1.5} />,
      },
      {
        label: 'Comissionamento',
        to: '/equipe/comissionamento',
        icon: <DollarSign size={18} strokeWidth={1.5} />,
      },
    ],
  },
  {
    title: 'Interno',
    items: [
      {
        label: 'DRE Gerencial',
        to: '/interno/dre',
        icon: <FileText size={18} strokeWidth={1.5} />,
      },
      {
        label: 'Projeção',
        to: '/interno/projecao',
        icon: <LineChart size={18} strokeWidth={1.5} />,
      },
      {
        label: 'Custos e Receitas',
        to: '/interno/custos',
        icon: <Wallet size={18} strokeWidth={1.5} />,
      },
      {
        label: 'Carteira',
        to: '/interno/carteira',
        icon: <Briefcase size={18} strokeWidth={1.5} />,
      },
    ],
  },
]

interface SidebarProps {
  /** Controla visibilidade em mobile (ignorado em ≥ lg, sempre visível) */
  open?: boolean
  /** Callback para fechar o sidebar em mobile */
  onClose?: () => void
}

export function Sidebar({ open = false, onClose }: SidebarProps) {
  return (
    <aside
      className={[
        // Layout base
        'w-60 min-h-screen bg-[#0D1B2A] flex flex-col flex-shrink-0',
        // Mobile: posição fixa, z-50, desliza para dentro/fora
        'fixed inset-y-0 left-0 z-50',
        'transform transition-transform duration-300 ease-in-out',
        open ? 'translate-x-0' : '-translate-x-full',
        // Desktop (≥ 1024px): estático, sempre visível
        'lg:static lg:translate-x-0 lg:z-auto',
      ].join(' ')}
    >
      {/* Logo */}
      <div className="px-6 py-6 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#00C896] rounded-lg flex items-center justify-center">
            <TrendingUp size={16} strokeWidth={1.5} className="text-white" />
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-tight">Venda</p>
            <p className="text-[#00C896] font-bold text-sm leading-tight">Feita</p>
          </div>
        </div>
        {/* Botão fechar — só aparece em mobile */}
        <button
          onClick={onClose}
          className="lg:hidden text-white/50 hover:text-white transition-colors p-1 rounded-[8px] hover:bg-white/10"
        >
          <X size={18} strokeWidth={1.5} />
        </button>
      </div>

      {/* Nav sections */}
      <div className="flex-1 px-3 py-4 space-y-5 overflow-y-auto">
        {sections.map((section) => (
          <div key={section.title}>
            <p className="text-white/40 text-xs font-semibold uppercase tracking-wider px-3 mb-2">
              {section.title}
            </p>
            <nav className="flex flex-col gap-1">
              {section.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-[8px] text-sm font-medium transition-all duration-150 group ${
                      isActive
                        ? 'bg-[#00C896]/15 text-[#00C896]'
                        : 'text-white/70 hover:bg-white/5 hover:text-white'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <span
                        className={
                          isActive
                            ? 'text-[#00C896]'
                            : 'text-white/50 group-hover:text-white/80'
                        }
                      >
                        {item.icon}
                      </span>
                      <span>{item.label}</span>
                      {isActive && (
                        <ChevronRight
                          size={14}
                          strokeWidth={1.5}
                          className="ml-auto text-[#00C896]"
                        />
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </nav>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center">
            <Users size={14} strokeWidth={1.5} className="text-white/70" />
          </div>
          <div>
            <p className="text-white/90 text-xs font-medium">Gerente</p>
            <p className="text-white/40 text-xs">admin@vendafeita.com</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
