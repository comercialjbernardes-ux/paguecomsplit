// ═══════════════════════════════════════════════════════════════
// ExportMenu — Menu dropdown para exportacao de relatorios
// Suporta PDF, Excel e CSV com selecao de tipo de relatorio
// ═══════════════════════════════════════════════════════════════

import { useState, useRef, useEffect } from 'react'
import {
  Download,
  FileText,
  FileSpreadsheet,
  FileDown,
  ChevronDown,
  Loader2,
  Check,
} from 'lucide-react'
import { exportReport, type ExportFormat, type ReportType, type ReportData } from '../services/exportService'

interface ExportMenuProps {
  data: ReportData
  /** Tipo de relatorio padrao (pode ser alterado no dropdown) */
  defaultReportType?: ReportType
  /** Nome do arquivo de saida (sem extensao) */
  fileName?: string
  /** Classe CSS adicional */
  className?: string
}

const formatOptions: { value: ExportFormat; label: string; icon: React.ReactNode; desc: string }[] = [
  { value: 'pdf', label: 'PDF', icon: <FileText className="w-4 h-4" />, desc: 'Relatorio formatado' },
  { value: 'excel', label: 'Excel', icon: <FileSpreadsheet className="w-4 h-4" />, desc: 'Planilha .xlsx' },
  { value: 'csv', label: 'CSV', icon: <FileDown className="w-4 h-4" />, desc: 'Dados brutos' },
]

const reportTypes: { value: ReportType; label: string }[] = [
  { value: 'completo', label: 'Relatorio Completo' },
  { value: 'fechamento', label: 'DRE / Fechamento' },
  { value: 'vendedores', label: 'Vendedores' },
  { value: 'lancamentos', label: 'Lancamentos' },
  { value: 'clientes', label: 'Carteira de Clientes' },
]

export function ExportMenu({
  data,
  defaultReportType = 'completo',
  fileName = 'relatorio-venda-feita',
  className = '',
}: ExportMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedReport, setSelectedReport] = useState<ReportType>(defaultReportType)
  const [isExporting, setIsExporting] = useState(false)
  const [exportedFormat, setExportedFormat] = useState<ExportFormat | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  // Fechar menu ao clicar fora
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleExport = async (format: ExportFormat) => {
    setIsExporting(true)
    setExportedFormat(null)

    try {
      exportReport(data, {
        format,
        reportType: selectedReport,
        fileName: `${fileName}-${selectedReport}`,
        titulo: reportTypes.find((r) => r.value === selectedReport)?.label || 'Relatorio',
      })
      setExportedFormat(format)
      setTimeout(() => setExportedFormat(null), 2000)
    } catch (err) {
      console.error('[Export] Erro ao exportar:', err)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div ref={menuRef} className={`relative ${className}`}>
      {/* Botao principal */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="btn-primary flex items-center gap-2"
        disabled={isExporting}
      >
        {isExporting ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Download className="w-4 h-4" />
        )}
        <span>Exportar</span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-xl shadow-lg border border-gray-200 z-50 overflow-hidden">
          {/* Seletor de tipo de relatorio */}
          <div className="p-3 border-b border-gray-100">
            <label className="block text-xs font-medium text-gray-500 uppercase mb-1.5">
              Tipo de relatorio
            </label>
            <select
              value={selectedReport}
              onChange={(e) => setSelectedReport(e.target.value as ReportType)}
              className="input-field text-sm"
            >
              {reportTypes.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>

          {/* Formatos de exportacao */}
          <div className="p-2">
            <p className="px-2 py-1 text-xs font-medium text-gray-500 uppercase">
              Formato
            </p>
            {formatOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => handleExport(opt.value)}
                disabled={isExporting}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors text-left disabled:opacity-50"
              >
                <div className="p-1.5 bg-gray-100 rounded-lg text-gray-600">
                  {exportedFormat === opt.value ? (
                    <Check className="w-4 h-4 text-emerald-500" />
                  ) : (
                    opt.icon
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{opt.label}</p>
                  <p className="text-xs text-gray-400">{opt.desc}</p>
                </div>
                {exportedFormat === opt.value && (
                  <span className="text-xs text-emerald-600 font-medium">Pronto!</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
