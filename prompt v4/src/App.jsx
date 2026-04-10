import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LogWindow from './components/LogWindow/LogWindow'
import ImportScreen from './components/ImportScreen'
import Layout from './components/Layout'
import Placeholder from './components/Placeholder'
import useDataStore from './context/DataContext'

function DashboardRoutes() {
  return (
    <Layout>
      <Routes>
        <Route index element={<Navigate to="/equipe/dashboard" replace />} />
        <Route path="equipe/dashboard"       element={<Placeholder titulo="Dashboard de Resultados" />} />
        <Route path="equipe/ranking"         element={<Placeholder titulo="Ranking" />} />
        <Route path="equipe/comissionamento" element={<Placeholder titulo="Comissionamento" />} />
        <Route path="interno/dre"            element={<Placeholder titulo="DRE Gerencial" />} />
        <Route path="interno/projecao"       element={<Placeholder titulo="Projeção" />} />
        <Route path="interno/custos"         element={<Placeholder titulo="Custos e Receitas" />} />
        <Route path="interno/carteira"       element={<Placeholder titulo="Análise de Carteira" />} />
        <Route path="parametrizacao"         element={<Placeholder titulo="Parametrização" />} />
        <Route path="*"                      element={<Navigate to="/equipe/dashboard" replace />} />
      </Routes>
    </Layout>
  )
}

function AppContent() {
  const dados = useDataStore(state => state.dados)

  if (!dados.length) {
    return <ImportScreen onEntrar={() => {}} />
  }

  return <DashboardRoutes />
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
      <LogWindow />
    </BrowserRouter>
  )
}
