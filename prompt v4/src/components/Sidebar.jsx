import { NavLink, useNavigate } from 'react-router-dom'
import {
  TrendingUp, LayoutDashboard, Trophy, DollarSign,
  FileText, CreditCard, Users, Settings, Upload,
} from 'lucide-react'
import useDataStore from '../context/DataContext'

const NAV_GROUPS = [
  {
    label: 'EQUIPE',
    items: [
      { to: '/equipe/dashboard', icon: LayoutDashboard, label: 'Dashboard de Resultados' },
      { to: '/equipe/ranking',   icon: Trophy,           label: 'Ranking' },
      { to: '/equipe/comissionamento', icon: DollarSign, label: 'Comissionamento' },
    ],
  },
  {
    label: 'INTERNO',
    items: [
      { to: '/interno/dre',      icon: FileText,    label: 'DRE Gerencial' },
      { to: '/interno/projecao', icon: TrendingUp,  label: 'Projeção' },
      { to: '/interno/custos',   icon: CreditCard,  label: 'Custos e Receitas' },
      { to: '/interno/carteira', icon: Users,       label: 'Análise de Carteira' },
    ],
  },
  {
    label: 'CONFIG',
    items: [
      { to: '/parametrizacao', icon: Settings, label: 'Parametrização' },
    ],
  },
]

export default function Sidebar() {
  const limparDados = useDataStore(state => state.limparDados)
  const navigate = useNavigate()

  const handleImportar = () => {
    limparDados()
    navigate('/')
  }

  return (
    <aside
      className="fixed left-0 top-0 h-screen flex flex-col"
      style={{ width: 240, background: '#0D1B2A', zIndex: 100 }}
    >
      {/* Logo */}
      <div className="px-5 pt-5 pb-4">
        <div className="flex items-center gap-2">
          <TrendingUp size={22} color="#00C896" />
          <span style={{ fontFamily: 'Inter', fontSize: 16, fontWeight: 700, color: '#fff' }}>
            VENDA FEITA
          </span>
        </div>
        <p style={{ fontFamily: 'Inter', fontSize: 11, fontWeight: 400, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>
          Dashboard Interno
        </p>
      </div>

      <div style={{ height: 1, background: 'rgba(255,255,255,0.08)', margin: '0 0 8px 0' }} />

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 pb-4">
        {NAV_GROUPS.map(group => (
          <div key={group.label} className="mb-4">
            <p style={{
              fontFamily: 'Inter',
              fontSize: 10,
              fontWeight: 600,
              color: 'rgba(255,255,255,0.4)',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              padding: '8px 12px 4px',
            }}>
              {group.label}
            </p>
            {group.items.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '8px 12px',
                  borderRadius: 8,
                  textDecoration: 'none',
                  fontFamily: 'Inter',
                  fontSize: 14,
                  fontWeight: 500,
                  color: isActive ? '#fff' : 'rgba(255,255,255,0.7)',
                  background: isActive ? 'rgba(0,200,150,0.12)' : 'transparent',
                  borderLeft: isActive ? '3px solid #00C896' : '3px solid transparent',
                  marginBottom: 2,
                  transition: 'all 150ms ease',
                })}
                className="sidebar-item"
              >
                {({ isActive }) => (
                  <>
                    <item.icon
                      size={16}
                      color={isActive ? '#00C896' : 'rgba(255,255,255,0.5)'}
                    />
                    {item.label}
                  </>
                )}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-3 pb-5">
        <div style={{ height: 1, background: 'rgba(255,255,255,0.08)', marginBottom: 12 }} />
        <button
          onClick={handleImportar}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-colors"
          style={{
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: 8,
            fontFamily: 'Inter',
            fontSize: 13,
            fontWeight: 500,
            color: '#fff',
            background: 'transparent',
            cursor: 'pointer',
            transition: 'background 150ms ease',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          <Upload size={15} />
          Importar Planilha
        </button>
      </div>
    </aside>
  )
}
