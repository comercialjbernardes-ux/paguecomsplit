// ═══════════════════════════════════════════════════════════════
// Settings — Configuracao da planilha + preview de dados
// Permite inserir/validar Sheet ID e visualizar dados importados
// ═══════════════════════════════════════════════════════════════

import { useState } from 'react'
import {
  Settings as SettingsIcon,
  Database,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Table2,
  FileSpreadsheet,
  Link2,
  Loader2,
  PlusCircle,
  Trash2,
  History,
  AlertTriangle,
} from 'lucide-react'
import { useDataContext } from '../contexts/dataContextValue'
import { ErrorBanner } from '../components/ErrorBanner'

export function SettingsPage() {
  const {
    connectionStatus,
    isLoading,
    error,
    fechamentos,
    vendedores,
    lancamentos,
    clientes,
    allTabs,
    connect,
    currentSheetId,
    setSheetId,
    historicalSheets,
    isLoadingHistorical,
    addHistoricalSheet,
    removeHistoricalSheet,
  } = useDataContext()

  const [inputSheetId, setInputSheetId] = useState(currentSheetId)
  const [activePreview, setActivePreview] = useState<string>('fechamentos')
  const [newHistSheetId, setNewHistSheetId] = useState('')
  const [histError, setHistError] = useState<string | null>(null)
  const [histSuccess, setHistSuccess] = useState<string | null>(null)

  const handleConnect = () => {
    setSheetId(inputSheetId)
    connect(inputSheetId)
  }

  const handleAddHistoricalSheet = async () => {
    if (!newHistSheetId.trim()) return
    setHistError(null)
    setHistSuccess(null)
    const result = await addHistoricalSheet(newHistSheetId.trim())
    if (result.success) {
      setHistSuccess(`Planilha "${result.label}" adicionada com sucesso!`)
      setNewHistSheetId('')
      setTimeout(() => setHistSuccess(null), 4000)
    } else {
      setHistError(result.error || 'Erro ao carregar planilha')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <SettingsIcon className="w-7 h-7 text-gray-400" />
          Configuracoes
        </h1>
        <p className="text-gray-500 mt-1">
          Gerencie a conexao com a planilha Google Sheets
        </p>
      </div>

      {/* Status da conexao */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Database className="w-5 h-5 text-gray-400" />
            Conexao com Planilha
          </h2>
          <div className="flex items-center gap-2">
            {connectionStatus.connected ? (
              <span className="badge-success flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Conectado
              </span>
            ) : (
              <span className="badge-error flex items-center gap-1">
                <XCircle className="w-3.5 h-3.5" />
                Desconectado
              </span>
            )}
          </div>
        </div>

        {/* Sheet ID input */}
        <div className="flex gap-3 mb-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ID da Planilha Google Sheets
            </label>
            <div className="relative">
              <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={inputSheetId}
                onChange={(e) => setInputSheetId(e.target.value)}
                placeholder="Ex: 1KTRmSWudADXNz6ncJ_ITusdCy_5RDzCV"
                className="input-field pl-10"
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Encontre o ID na URL da planilha: docs.google.com/spreadsheets/d/
              <span className="text-emerald-600 font-medium">ID_AQUI</span>/edit
            </p>
          </div>
          <div className="flex items-end">
            <button
              onClick={handleConnect}
              disabled={isLoading || !inputSheetId}
              className="btn-primary flex items-center gap-2"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              {connectionStatus.connected ? 'Reconectar' : 'Conectar'}
            </button>
          </div>
        </div>

        {/* Erro */}
        {error && <ErrorBanner message={error} onRetry={handleConnect} />}

        {/* Info da planilha */}
        {connectionStatus.connected && (
          <div className="bg-gray-50 rounded-xl p-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-gray-500 uppercase font-medium">Titulo</p>
                <p className="text-sm font-semibold text-gray-900 mt-0.5">
                  {connectionStatus.title}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-medium">
                  Abas encontradas
                </p>
                <p className="text-sm font-semibold text-gray-900 mt-0.5">
                  {allTabs.length} abas
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-medium">
                  Ultima sincronizacao
                </p>
                <p className="text-sm font-semibold text-gray-900 mt-0.5">
                  {connectionStatus.lastSync
                    ? connectionStatus.lastSync.toLocaleString('pt-BR')
                    : 'Nunca'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Planilhas Históricas — Comparativo Mensal */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <History className="w-5 h-5 text-violet-500" />
            Planilhas Historicas (Comparativo Mensal)
          </h2>
          {isLoadingHistorical && (
            <span className="flex items-center gap-1.5 text-sm text-gray-500">
              <Loader2 className="w-4 h-4 animate-spin" />
              Carregando...
            </span>
          )}
        </div>
        <p className="text-sm text-gray-500 mb-4">
          Adicione planilhas de meses anteriores para habilitar o Comparativo Mensal e o historico no DRE.
          Cada planilha deve ter o mesmo formato (aba Resumo ou Fechamento_*).
        </p>

        {/* Lista de planilhas históricas */}
        {historicalSheets.length > 0 && (
          <div className="space-y-2 mb-4">
            {historicalSheets.map((hs) => (
              <div key={hs.id} className="flex items-center gap-3 p-3 bg-violet-50 border border-violet-100 rounded-xl">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{hs.label}</p>
                  <p className="text-xs text-gray-400 truncate">{hs.id}</p>
                </div>
                <button
                  onClick={() => removeHistoricalSheet(hs.id)}
                  className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                  title="Remover planilha historica"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {historicalSheets.length === 0 && (
          <div className="text-center py-4 text-gray-400 text-sm mb-4">
            Nenhuma planilha historica cadastrada ainda.
          </div>
        )}

        {/* Formulario para adicionar */}
        <div className="flex gap-3">
          <div className="flex-1">
            <div className="relative">
              <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={newHistSheetId}
                onChange={(e) => setNewHistSheetId(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddHistoricalSheet()}
                placeholder="ID da planilha do mes anterior..."
                className="input-field pl-10"
              />
            </div>
          </div>
          <button
            onClick={handleAddHistoricalSheet}
            disabled={isLoadingHistorical || !newHistSheetId.trim()}
            className="btn-primary flex items-center gap-2 flex-shrink-0"
          >
            {isLoadingHistorical ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <PlusCircle className="w-4 h-4" />
            )}
            Adicionar
          </button>
        </div>

        {histSuccess && (
          <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-700 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            {histSuccess}
          </div>
        )}
        {histError && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            {histError}
          </div>
        )}

        {fechamentos.length > 1 && (
          <div className="mt-4 p-3 bg-gray-50 rounded-xl">
            <p className="text-xs font-medium text-gray-600 mb-2">Periodos carregados ({fechamentos.length}):</p>
            <div className="flex flex-wrap gap-2">
              {fechamentos.map((f) => (
                <span key={f.periodo} className="px-2 py-1 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-700">
                  {f.periodo}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Abas detectadas */}
      {connectionStatus.connected && allTabs.length > 0 && (
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
            <FileSpreadsheet className="w-5 h-5 text-gray-400" />
            Abas da Planilha
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {allTabs.map((tab) => (
              <div
                key={tab.sheetId}
                className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg text-sm"
              >
                <Table2 className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span className="truncate text-gray-700">{tab.title}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Preview de dados */}
      {connectionStatus.connected && (
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
            <Table2 className="w-5 h-5 text-gray-400" />
            Preview dos Dados
          </h2>

          {/* Tabs de preview */}
          <div className="flex gap-1 mb-4 bg-gray-100 rounded-lg p-1">
            {[
              { key: 'fechamentos', label: 'Fechamentos', count: fechamentos.length },
              { key: 'vendedores', label: 'Vendedores', count: vendedores.length },
              { key: 'lancamentos', label: 'Lancamentos', count: lancamentos.length },
              { key: 'clientes', label: 'Clientes', count: clientes.length },
            ].map((tab: { key: string; label: string; count: number }) => (
              <button
                key={tab.key}
                onClick={() => setActivePreview(tab.key)}
                className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  activePreview === tab.key
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
                <span className="ml-1.5 text-xs text-gray-400">({tab.count})</span>
              </button>
            ))}
          </div>

          {/* Tabela de preview */}
          <div className="overflow-x-auto">
            {activePreview === 'fechamentos' && (
              <FechamentosPreview data={fechamentos} />
            )}
            {activePreview === 'vendedores' && (
              <VendedoresPreview data={vendedores} />
            )}
            {activePreview === 'lancamentos' && (
              <LancamentosPreview data={lancamentos} />
            )}
            {activePreview === 'clientes' && (
              <ClientesPreview data={clientes} />
            )}
          </div>

          {/* Mensagem vazia */}
          {activePreview === 'fechamentos' && fechamentos.length === 0 && (
            <EmptyMessage tab="Fechamento" />
          )}
          {activePreview === 'vendedores' && vendedores.length === 0 && (
            <EmptyMessage tab="Vendedores" />
          )}
          {activePreview === 'lancamentos' && lancamentos.length === 0 && (
            <EmptyMessage tab="Lancamentos" />
          )}
          {activePreview === 'clientes' && clientes.length === 0 && (
            <EmptyMessage tab="Clientes" />
          )}
        </div>
      )}
    </div>
  )
}

// ─── Sub-componentes de preview ───────────────────────────────

function EmptyMessage({ tab }: { tab: string }) {
  return (
    <div className="text-center py-8 text-gray-400">
      <FileSpreadsheet className="w-10 h-10 mx-auto mb-2 opacity-50" />
      <p className="text-sm">
        Nenhum dado encontrado. Verifique se a aba "{tab}" existe na planilha.
      </p>
    </div>
  )
}

function FechamentosPreview({ data }: { data: { periodo: string; ecsAtivos: number; tpvTotal: number; markupPos: number; valorLiquido: number }[] }) {
  if (data.length === 0) return null
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-gray-200">
          <th className="text-left py-2 px-3 font-medium text-gray-500">Periodo</th>
          <th className="text-right py-2 px-3 font-medium text-gray-500">ECs Ativos</th>
          <th className="text-right py-2 px-3 font-medium text-gray-500">TPV Total</th>
          <th className="text-right py-2 px-3 font-medium text-gray-500">Markup POS</th>
          <th className="text-right py-2 px-3 font-medium text-gray-500">Valor Liquido</th>
        </tr>
      </thead>
      <tbody>
        {data.slice(0, 5).map((row) => (
          <tr key={row.periodo} className="border-b border-gray-100">
            <td className="py-2 px-3 font-medium">{row.periodo}</td>
            <td className="py-2 px-3 text-right">{row.ecsAtivos}</td>
            <td className="py-2 px-3 text-right">{formatCurrency(row.tpvTotal)}</td>
            <td className="py-2 px-3 text-right">{formatCurrency(row.markupPos)}</td>
            <td className="py-2 px-3 text-right">{formatCurrency(row.valorLiquido)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function VendedoresPreview({ data }: { data: { id: number; nome: string; regiao: string; metaMensal: number; comissaoBase: number }[] }) {
  if (data.length === 0) return null
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-gray-200">
          <th className="text-left py-2 px-3 font-medium text-gray-500">ID</th>
          <th className="text-left py-2 px-3 font-medium text-gray-500">Nome</th>
          <th className="text-left py-2 px-3 font-medium text-gray-500">Regiao</th>
          <th className="text-right py-2 px-3 font-medium text-gray-500">Meta Mensal</th>
          <th className="text-right py-2 px-3 font-medium text-gray-500">Comissao %</th>
        </tr>
      </thead>
      <tbody>
        {data.slice(0, 5).map((row) => (
          <tr key={row.id} className="border-b border-gray-100">
            <td className="py-2 px-3">{row.id}</td>
            <td className="py-2 px-3 font-medium">{row.nome}</td>
            <td className="py-2 px-3">{row.regiao}</td>
            <td className="py-2 px-3 text-right">{formatCurrency(row.metaMensal)}</td>
            <td className="py-2 px-3 text-right">{row.comissaoBase}%</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function LancamentosPreview({ data }: { data: { id: string; data: string; descricao: string; categoria: string; tipo: string; valor: number }[] }) {
  if (data.length === 0) return null
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-gray-200">
          <th className="text-left py-2 px-3 font-medium text-gray-500">Data</th>
          <th className="text-left py-2 px-3 font-medium text-gray-500">Descricao</th>
          <th className="text-left py-2 px-3 font-medium text-gray-500">Categoria</th>
          <th className="text-left py-2 px-3 font-medium text-gray-500">Tipo</th>
          <th className="text-right py-2 px-3 font-medium text-gray-500">Valor</th>
        </tr>
      </thead>
      <tbody>
        {data.slice(0, 5).map((row) => (
          <tr key={row.id} className="border-b border-gray-100">
            <td className="py-2 px-3">{row.data}</td>
            <td className="py-2 px-3 font-medium">{row.descricao}</td>
            <td className="py-2 px-3">{row.categoria}</td>
            <td className="py-2 px-3">
              <span className={row.tipo === 'receita' ? 'badge-success' : 'badge-error'}>
                {row.tipo}
              </span>
            </td>
            <td className="py-2 px-3 text-right">{formatCurrency(row.valor)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function ClientesPreview({ data }: { data: { id: number; nome: string; segmento: string; vendedor: string; volumeTotal: number; status: string }[] }) {
  if (data.length === 0) return null
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-gray-200">
          <th className="text-left py-2 px-3 font-medium text-gray-500">Nome</th>
          <th className="text-left py-2 px-3 font-medium text-gray-500">Segmento</th>
          <th className="text-left py-2 px-3 font-medium text-gray-500">Vendedor</th>
          <th className="text-right py-2 px-3 font-medium text-gray-500">Volume</th>
          <th className="text-left py-2 px-3 font-medium text-gray-500">Status</th>
        </tr>
      </thead>
      <tbody>
        {data.slice(0, 5).map((row) => (
          <tr key={row.id} className="border-b border-gray-100">
            <td className="py-2 px-3 font-medium">{row.nome}</td>
            <td className="py-2 px-3">{row.segmento}</td>
            <td className="py-2 px-3">{row.vendedor}</td>
            <td className="py-2 px-3 text-right">{formatCurrency(row.volumeTotal)}</td>
            <td className="py-2 px-3">
              <span
                className={
                  row.status === 'ativo'
                    ? 'badge-success'
                    : row.status === 'em risco'
                    ? 'badge-warning'
                    : 'badge-error'
                }
              >
                {row.status}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  }).format(value)
}
