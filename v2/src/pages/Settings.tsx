// ═══════════════════════════════════════════════════════════════
// Settings — Benchmark Anual + preview de dados
// O Benchmark Anual é a fonte principal de leitura de planilhas.
// Cada mês cadastrado carrega: fechamentos, vendedores, clientes e lancamentos.
// ═══════════════════════════════════════════════════════════════

import { useState, useRef } from 'react'
import {
  Settings as SettingsIcon,
  CheckCircle2,
  Table2,
  FileSpreadsheet,
  Loader2,
  Trash2,
  AlertTriangle,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  Plus,
  Download,
  Upload,
  HardDrive,
} from 'lucide-react'
import { useDataContext } from '../contexts/dataContextValue'
import type { HistoricalSheet } from '../contexts/dataContextValue'
import { exportLocalBackup, importLocalBackup, getBackupStats } from '../services/backupService'

// ─── Constantes ───────────────────────────────────────────────
const MESES = [
  'Jan','Fev','Mar','Abr','Mai','Jun',
  'Jul','Ago','Set','Out','Nov','Dez',
]
const MESES_FULL = [
  'Janeiro','Fevereiro','Março','Abril','Maio','Junho',
  'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro',
]

// ─── MonthSlot ────────────────────────────────────────────────
interface MonthSlotProps {
  month: number
  year: number
  sheet: HistoricalSheet | undefined
  isAdding: boolean
  isLoading: boolean
  inputId: string
  onOpenAdd: () => void
  onCancelAdd: () => void
  onConfirmAdd: () => void
  onInputChange: (v: string) => void
  onRemove: () => void
}

function MonthSlot({
  month, sheet, isAdding, isLoading, inputId,
  onOpenAdd, onCancelAdd, onConfirmAdd, onInputChange, onRemove,
}: MonthSlotProps) {
  const monthName = MESES[month - 1]

  if (sheet) {
    return (
      <div className="flex flex-col rounded-xl border-2 border-emerald-300 bg-emerald-50 p-3 min-h-[96px]">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-bold text-emerald-700 uppercase tracking-wide">{monthName}</span>
          <button
            onClick={onRemove}
            className="p-0.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
            title="Remover planilha"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="flex items-center gap-1 mb-1">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
          <span className="text-xs text-emerald-700 font-semibold truncate">{sheet.monthLabel}</span>
        </div>
        {/* B-11: mostrar reticencias apenas quando o ID for longo */}
        <p className="text-[10px] text-gray-400 truncate leading-tight">
          {sheet.id.length > 22 ? `${sheet.id.slice(0, 22)}…` : sheet.id}
        </p>
      </div>
    )
  }

  if (isAdding) {
    return (
      <div className="flex flex-col rounded-xl border-2 border-blue-400 bg-blue-50 p-3 min-h-[96px]">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-blue-700 uppercase tracking-wide">{monthName}</span>
          <button onClick={onCancelAdd} className="text-[10px] text-gray-400 hover:text-gray-600 font-bold">✕</button>
        </div>
        <input
          autoFocus
          type="text"
          value={inputId}
          onChange={e => onInputChange(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && onConfirmAdd()}
          placeholder="ID da planilha…"
          className="w-full text-[11px] px-2 py-1.5 border border-blue-300 rounded-lg bg-white outline-none focus:border-blue-500 placeholder-gray-400 mb-1.5"
        />
        <button
          onClick={onConfirmAdd}
          disabled={!inputId.trim() || isLoading}
          className="w-full flex items-center justify-center gap-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-[11px] font-semibold py-1 rounded-lg transition-colors"
        >
          {isLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Confirmar'}
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={onOpenAdd}
      className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 hover:border-blue-300 hover:bg-blue-50 transition-all min-h-[96px] group"
    >
      <span className="text-xs font-bold text-gray-500 group-hover:text-blue-600 uppercase tracking-wide mb-2">{monthName}</span>
      <div className="w-7 h-7 rounded-full border-2 border-dashed border-gray-300 group-hover:border-blue-400 flex items-center justify-center">
        <Plus className="w-3.5 h-3.5 text-gray-400 group-hover:text-blue-500" />
      </div>
    </button>
  )
}

// ─── DataBackupSection ────────────────────────────────────────
/**
 * PONTO 2 — localStorage como único storage de dados críticos.
 * Permite exportar todos os dados locais para um arquivo JSON e
 * restaurá-los a partir de um backup existente.
 */
function DataBackupSection() {
  const [importStatus, setImportStatus] = useState<{
    type: 'success' | 'error' | null
    message: string
  }>({ type: null, message: '' })
  const [isImporting, setIsImporting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const stats = getBackupStats()
  const totalItems = stats.reduce((sum, s) => sum + s.itemCount, 0)
  const keysWithData = stats.filter(s => s.hasData).length

  const handleExport = () => {
    exportLocalBackup()
  }

  const handleImportClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setIsImporting(true)
    setImportStatus({ type: null, message: '' })
    const result = await importLocalBackup(file)
    setIsImporting(false)
    if (result.success) {
      const date = result.exportedAt
        ? new Date(result.exportedAt).toLocaleDateString('pt-BR')
        : 'data desconhecida'
      setImportStatus({
        type: 'success',
        message: `${result.keysRestored.length} chaves restauradas (backup de ${date}). Recarregue a página para aplicar.`,
      })
    } else {
      setImportStatus({ type: 'error', message: result.error || 'Erro ao importar.' })
    }
    // Limpa o input para permitir reimportar o mesmo arquivo
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <div className="card border-amber-200 bg-amber-50/40">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <HardDrive className="w-5 h-5 text-amber-500" />
            Backup de Dados Locais
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Exporte todos os dados locais para um arquivo JSON. Importe para restaurar em outro
            dispositivo ou após limpar o cache do navegador.
          </p>
        </div>
        <span className="text-xs font-medium text-amber-700 bg-amber-100 border border-amber-200 px-2 py-1 rounded-lg whitespace-nowrap">
          {keysWithData} chaves · {totalItems} itens
        </span>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
        >
          <Download className="w-4 h-4" />
          Exportar Backup
        </button>

        <button
          onClick={handleImportClick}
          disabled={isImporting}
          className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-gray-50 text-gray-700 text-sm font-medium rounded-lg border border-gray-200 transition-colors disabled:opacity-50"
        >
          {isImporting
            ? <Loader2 className="w-4 h-4 animate-spin" />
            : <Upload className="w-4 h-4" />
          }
          {isImporting ? 'Importando…' : 'Importar Backup'}
        </button>

        {/* Input file oculto */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,application/json"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {importStatus.type && (
        <div className={`mt-3 p-3 rounded-lg text-sm flex items-start gap-2 ${
          importStatus.type === 'success'
            ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
            : 'bg-red-50 border border-red-200 text-red-700'
        }`}>
          {importStatus.type === 'success'
            ? <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
            : <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          }
          {importStatus.message}
          {importStatus.type === 'success' && (
            <button
              onClick={() => window.location.reload()}
              className="ml-auto text-xs font-semibold text-emerald-700 underline whitespace-nowrap"
            >
              Recarregar agora
            </button>
          )}
        </div>
      )}
    </div>
  )
}

// ─── MonthlyBenchmarkGrid ─────────────────────────────────────
function MonthlyBenchmarkGrid() {
  const { historicalSheets, isLoadingHistorical, addHistoricalSheet, removeHistoricalSheet } = useDataContext()

  const currentYear = new Date().getFullYear()
  const [selectedYear, setSelectedYear] = useState(currentYear)
  const [addingMonth, setAddingMonth] = useState<number | null>(null)
  const [loadingMonth, setLoadingMonth] = useState<number | null>(null)
  const [inputId, setInputId] = useState('')
  const [slotError, setSlotError] = useState<string | null>(null)

  const sheetsForYear = historicalSheets.filter(s => s.year === selectedYear)
  const filledCount = sheetsForYear.length
  const getSheet = (month: number) => sheetsForYear.find(s => s.month === month)

  const handleOpenAdd = (month: number) => {
    setAddingMonth(month)
    setInputId('')
    setSlotError(null)
  }

  const handleConfirm = async (month: number) => {
    if (!inputId.trim()) return
    setLoadingMonth(month)
    setSlotError(null)
    const result = await addHistoricalSheet(inputId.trim(), month, selectedYear)
    setLoadingMonth(null)
    if (result.success) {
      setAddingMonth(null)
      setInputId('')
    } else {
      setSlotError(`${MESES_FULL[month - 1]}: ${result.error}`)
    }
  }

  const handleRemove = (month: number) => {
    const sheet = getSheet(month)
    if (sheet) removeHistoricalSheet(sheet.id)
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-violet-500" />
            Benchmark Anual
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Adicione a planilha de cada mês — todos os dados serão carregados automaticamente em todas as abas
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setSelectedYear(y => y - 1); setAddingMonth(null) }}
            className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
          >
            <ChevronLeft className="w-4 h-4 text-gray-500" />
          </button>
          <span className="text-base font-bold text-gray-900 w-12 text-center">{selectedYear}</span>
          <button
            onClick={() => { setSelectedYear(y => y + 1); setAddingMonth(null) }}
            className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
          >
            <ChevronRight className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Barra de progresso */}
      <div className="flex items-center gap-3 mb-5">
        <div className="flex-1 bg-gray-100 rounded-full h-2">
          <div
            className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${(filledCount / 12) * 100}%` }}
          />
        </div>
        <span className="text-sm font-semibold text-gray-600 whitespace-nowrap">
          {filledCount}/12 meses
        </span>
      </div>

      {/* Grade 12 meses */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
        {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
          <MonthSlot
            key={month}
            month={month}
            year={selectedYear}
            sheet={getSheet(month)}
            isAdding={addingMonth === month}
            isLoading={loadingMonth === month || (isLoadingHistorical && addingMonth === month)}
            inputId={addingMonth === month ? inputId : ''}
            onOpenAdd={() => handleOpenAdd(month)}
            onCancelAdd={() => { setAddingMonth(null); setSlotError(null) }}
            onConfirmAdd={() => handleConfirm(month)}
            onInputChange={setInputId}
            onRemove={() => handleRemove(month)}
          />
        ))}
      </div>

      {slotError && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          {slotError}
        </div>
      )}

      {/* B-12: usar === null em vez de !addingMonth para evitar falsos positivos com 0 */}
      {filledCount === 0 && addingMonth === null && (
        <p className="text-center text-xs text-gray-400 mt-4">
          Clique em qualquer mês para adicionar a planilha Google Sheets correspondente.
        </p>
      )}
    </div>
  )
}

export function SettingsPage() {
  const {
    fechamentos,
    vendedores,
    lancamentos,
    clientes,
    historicalSheets,
  } = useDataContext()

  const [activePreview, setActivePreview] = useState<string>('fechamentos')

  // Preview só aparece quando há pelo menos um mês importado no Benchmark Anual.
  // Dados da planilha primária (auto-connect) não devem poluir a visualização.
  const hasAnyData = historicalSheets.length > 0 && (
    fechamentos.length > 0 || vendedores.length > 0 || lancamentos.length > 0 || clientes.length > 0
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <SettingsIcon className="w-7 h-7 text-gray-400" />
          Configuracoes
        </h1>
        <p className="text-gray-500 mt-1">
          Gerencie as planilhas mensais do benchmark — cada mês alimenta todas as abas do dashboard
        </p>
      </div>

      {/* Backup de dados locais — proteção contra perda de configuração */}
      <DataBackupSection />

      {/* Benchmark Anual — fonte principal de dados */}
      <MonthlyBenchmarkGrid />

      {/* Periodos disponíveis no Comparativo */}
      {fechamentos.length > 1 && (
        <div className="card">
          <p className="text-xs font-medium text-gray-600 mb-2">
            Períodos disponíveis no Comparativo ({fechamentos.length}):
          </p>
          <div className="flex flex-wrap gap-2">
            {fechamentos.map((f) => (
              <span key={f.periodo} className="px-2 py-1 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-700">
                {f.periodo}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Meses cadastrados — resumo */}
      {historicalSheets.length > 0 && (
        <div className="card">
          <h2 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-gray-400" />
            Planilhas cadastradas
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {historicalSheets
              .slice()
              .sort((a, b) => a.year !== b.year ? a.year - b.year : a.month - b.month)
              .map((hs) => (
                <div
                  key={`${hs.year}-${hs.month}`}
                  className="flex items-center gap-2 px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-lg"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                  <span className="text-xs font-medium text-emerald-800 truncate">{hs.label}</span>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Preview de dados — aparece quando há dados históricos carregados */}
      {hasAnyData && (
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
            ].map((tab) => (
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
            {activePreview === 'fechamentos' && <FechamentosPreview data={fechamentos} />}
            {activePreview === 'vendedores' && <VendedoresPreview data={vendedores} />}
            {activePreview === 'lancamentos' && <LancamentosPreview data={lancamentos} />}
            {activePreview === 'clientes' && <ClientesPreview data={clientes} />}
          </div>

          {activePreview === 'fechamentos' && fechamentos.length === 0 && <EmptyMessage tab="Fechamento" />}
          {activePreview === 'vendedores' && vendedores.length === 0 && <EmptyMessage tab="Vendedores" />}
          {activePreview === 'lancamentos' && lancamentos.length === 0 && <EmptyMessage tab="Lancamentos" />}
          {activePreview === 'clientes' && clientes.length === 0 && <EmptyMessage tab="Clientes" />}
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
        {data.slice(0, 10).map((row) => (
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
        {data.slice(0, 10).map((row) => (
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
        {data.slice(0, 10).map((row) => (
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
        {data.slice(0, 10).map((row) => (
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
