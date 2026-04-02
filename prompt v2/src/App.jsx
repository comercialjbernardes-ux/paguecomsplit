import { useState } from 'react'
import LogWindow from './components/LogWindow/LogWindow'
import ImportScreen from './components/ImportScreen'
import useDataStore from './context/DataContext'

function App() {
  const dados = useDataStore(state => state.dados)
  const [entrou, setEntrou] = useState(false)

  const showDashboard = dados.length > 0 && entrou

  return (
    <>
      {!showDashboard ? (
        <ImportScreen onEntrar={() => setEntrou(true)} />
      ) : (
        <div className="min-h-screen bg-neutral-50">
          <header className="bg-brand-navy text-white px-6 py-4">
            <h1 className="text-xl font-semibold">Venda Feita Dashboard</h1>
          </header>
          <main className="p-6">
            <p className="text-neutral-500">
              {dados.length} registros carregados. Dashboard em construção...
            </p>
          </main>
        </div>
      )}
      <LogWindow />
    </>
  )
}

export default App
