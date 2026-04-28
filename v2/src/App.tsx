// ═══════════════════════════════════════════════════════════════
// App — Roteamento principal do Venda Feita Dashboard
// Estrutura conforme fluxograma:
//   /login -> Login
//   / -> Layout (Sidebar + Outlet)
//     /equipe/* -> Modulo Equipe (verde)
//     /interno/* -> Modulo Interno (azul)
//     /relatorios -> Relatorios e Exportacao
//     /parametrizacao -> Configuracao (laranja)
//     /settings -> Configuracoes
// ═══════════════════════════════════════════════════════════════

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from './components/Layout'
import { AuthGuard } from './components/AuthGuard'
import { LoginPage } from './pages/Login'
import { SettingsPage } from './pages/Settings'
import { EquipeDashboard } from './pages/equipe/Dashboard'
import { EquipeRanking } from './pages/equipe/Ranking'
import { EquipeComissionamento } from './pages/equipe/Comissionamento'
import { InternoDRE } from './pages/interno/DRE'
import { InternoProjecao } from './pages/interno/Projecao'
import { InternoCustos } from './pages/interno/Custos'
import { InternoCarteira } from './pages/interno/Carteira'
import { InternoTransacoes } from './pages/interno/Transacoes'
import { RelatoriosPage } from './pages/Relatorios'
import { ParametrizacaoPage } from './pages/config/Parametrizacao'
import { InternoGestaoCustos } from './pages/interno/GestaoCustos'
import { ComparativoMensalPage } from './pages/ComparativoMensal'
import { RelatorioExecutivoPage } from './pages/RelatorioExecutivo'
import { Logs } from './pages/Logs'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rota publica: Login */}
        <Route path="/login" element={<LoginPage />} />

        {/* Rotas protegidas: Dashboard */}
        <Route
          path="/"
          element={
            <AuthGuard>
              <Layout />
            </AuthGuard>
          }
        >
          {/* Redirect raiz para Dashboard de Resultados */}
          <Route index element={<Navigate to="/equipe/dashboard" replace />} />

          {/* ── Modulo Equipe (verde) ─────────────────────── */}
          <Route path="equipe/dashboard" element={<EquipeDashboard />} />
          <Route path="equipe/ranking" element={<EquipeRanking />} />
          <Route path="equipe/comissionamento" element={<EquipeComissionamento />} />

          {/* ── Modulo Interno (azul) ─────────────────────── */}
          <Route path="interno/dre" element={<InternoDRE />} />
          <Route path="interno/projecao" element={<InternoProjecao />} />
          <Route path="interno/custos" element={<InternoCustos />} />
          <Route path="interno/carteira" element={<InternoCarteira />} />
          <Route path="interno/transacoes" element={<InternoTransacoes />} />
          <Route path="interno/gestao-custos" element={<InternoGestaoCustos />} />

          {/* ── Relatorios ────────────────────────────────── */}
          <Route path="relatorios" element={<RelatoriosPage />} />
          <Route path="comparativo" element={<ComparativoMensalPage />} />
          <Route path="relatorio-executivo" element={<RelatorioExecutivoPage />} />

          {/* ── Configuracao (laranja) ────────────────────── */}
          <Route path="parametrizacao" element={<ParametrizacaoPage />} />
          <Route path="settings" element={<SettingsPage />} />

          {/* ── Sistema ───────────────────────────────────── */}
          <Route path="logs" element={<Logs />} />
        </Route>

        {/* Fallback: redireciona para raiz */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
