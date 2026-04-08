import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from './components/Layout'
import { EquipeDashboard } from './pages/equipe/Dashboard'
import { EquipeRanking } from './pages/equipe/Ranking'
import { EquipeComissionamento } from './pages/equipe/Comissionamento'
import { InternoDRE } from './pages/interno/DRE'
import { InternoProjecao } from './pages/interno/Projecao'
import { InternoCustos } from './pages/interno/Custos'
import { InternoCarteira } from './pages/interno/Carteira'
import { Welcome } from './pages/Welcome'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Tela de boas-vindas (sem dados) */}
        <Route path="/welcome" element={<Welcome />} />

        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/equipe/dashboard" replace />} />
          <Route path="equipe/dashboard" element={<EquipeDashboard />} />
          <Route path="equipe/ranking" element={<EquipeRanking />} />
          <Route path="equipe/comissionamento" element={<EquipeComissionamento />} />
          <Route path="interno/dre" element={<InternoDRE />} />
          <Route path="interno/projecao" element={<InternoProjecao />} />
          <Route path="interno/custos" element={<InternoCustos />} />
          <Route path="interno/carteira" element={<InternoCarteira />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
