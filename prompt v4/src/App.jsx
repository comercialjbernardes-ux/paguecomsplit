import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LogWindow from './components/LogWindow/LogWindow'
import Layout from './components/Layout'
import Placeholder from './components/Placeholder'
import Welcome from './pages/Welcome'

// Equipe
import { EquipeDashboard }       from './pages/equipe/Dashboard'
import { EquipeRanking }         from './pages/equipe/Ranking'
import { EquipeComissionamento } from './pages/equipe/Comissionamento'

// Interno
import { InternoDRE }      from './pages/interno/DRE'
import { InternoProjecao } from './pages/interno/Projecao'
import { InternoCustos }   from './pages/interno/Custos'
import { InternoCarteira } from './pages/interno/Carteira'

// Config
import { Parametrizacao } from './pages/Parametrizacao'
import { ConfigProvider }  from './context/ConfigContext'

export default function App() {
  return (
    <ConfigProvider>
      <BrowserRouter>
        <Routes>
          {/* Tela de boas-vindas / importação */}
          <Route path="/welcome" element={<Welcome />} />
          <Route path="/" element={<Navigate to="/welcome" replace />} />

          {/* Dashboard principal */}
          <Route path="/" element={<Layout />}>
            <Route path="equipe/dashboard"       element={<EquipeDashboard />} />
            <Route path="equipe/ranking"         element={<EquipeRanking />} />
            <Route path="equipe/comissionamento" element={<EquipeComissionamento />} />
            <Route path="interno/dre"            element={<InternoDRE />} />
            <Route path="interno/projecao"       element={<InternoProjecao />} />
            <Route path="interno/custos"         element={<InternoCustos />} />
            <Route path="interno/carteira"       element={<InternoCarteira />} />
            <Route path="parametrizacao"         element={<Parametrizacao />} />
            <Route path="*"                      element={<Navigate to="/equipe/dashboard" replace />} />
          </Route>
        </Routes>
        <LogWindow />
      </BrowserRouter>
    </ConfigProvider>
  )
}
