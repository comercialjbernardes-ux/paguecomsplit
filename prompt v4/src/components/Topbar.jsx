import { useLocation } from 'react-router-dom'
import useDataStore from '../context/DataContext'

const ROUTE_TITLES = {
  '/equipe/dashboard':      'Dashboard de Resultados',
  '/equipe/ranking':        'Ranking',
  '/equipe/comissionamento':'Comissionamento',
  '/interno/dre':           'DRE Gerencial',
  '/interno/projecao':      'Projeção',
  '/interno/custos':        'Custos e Receitas',
  '/interno/carteira':      'Análise de Carteira',
  '/parametrizacao':        'Parametrização',
}

function formatPeriodo(periodo) {
  if (!periodo) return null
  const opts = { month: 'long', year: 'numeric' }
  const inicio = periodo.inicio.toLocaleDateString('pt-BR', opts)
  const fim = periodo.fim.toLocaleDateString('pt-BR', opts)
  return inicio === fim ? inicio : `${inicio} – ${fim}`
}

export default function Topbar() {
  const { pathname } = useLocation()
  const { dados, meta } = useDataStore()

  const titulo = ROUTE_TITLES[pathname] || 'Dashboard'
  const periodo = formatPeriodo(meta.periodo)

  const vendedoresAtivos = dados.length > 0
    ? [...new Set(dados.map(d => d.vendedor).filter(Boolean))].length
    : 0

  const temDados = dados.length > 0

  return (
    <header
      className="fixed flex items-center justify-between px-6"
      style={{
        left: 240,
        top: 0,
        right: 0,
        height: 64,
        background: '#fff',
        borderBottom: '1px solid #E2E8F0',
        zIndex: 90,
      }}
    >
      {/* Título */}
      <h1 style={{ fontFamily: 'Inter', fontSize: 18, fontWeight: 600, color: '#0D1B2A', margin: 0 }}>
        {titulo}
      </h1>

      {/* Direita */}
      <div className="flex items-center gap-3" style={{ fontFamily: 'Inter', fontSize: 13 }}>
        {periodo && (
          <>
            <span
              className="px-3 py-1 rounded-full"
              style={{
                background: 'rgba(0,200,150,0.1)',
                color: '#00A37A',
                fontWeight: 600,
                fontSize: 12,
              }}
            >
              {periodo}
            </span>
            <span style={{ color: '#E2E8F0' }}>|</span>
          </>
        )}

        <div className="flex items-center gap-2">
          <span
            className="inline-block rounded-full"
            style={{
              width: 8,
              height: 8,
              background: temDados ? '#00C896' : '#9CA3AF',
              flexShrink: 0,
            }}
          />
          <span style={{ color: '#6B7280', fontSize: 13 }}>
            {temDados ? `${vendedoresAtivos} vendedor${vendedoresAtivos !== 1 ? 'es' : ''} ativo${vendedoresAtivos !== 1 ? 's' : ''}` : 'Sem dados'}
          </span>
        </div>
      </div>
    </header>
  )
}
