import { useState, useRef } from 'react'
import { BarChart2, Upload, FileSpreadsheet, ArrowRight, Loader2 } from 'lucide-react'
import useDataStore from '../context/DataContext'
import { COLUNAS_OBRIGATORIAS } from '../data/schema'

export default function ImportScreen({ onEntrar }) {
  const { dados, loading, erro, importarArquivo } = useDataStore()
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef(null)

  const imported = dados.length > 0

  const handleFile = (file) => {
    if (file) importarArquivo(file)
  }

  const onDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    handleFile(file)
  }

  const onDragOver = (e) => {
    e.preventDefault()
    setDragging(true)
  }

  const onDragLeave = () => setDragging(false)

  const onInputChange = (e) => {
    handleFile(e.target.files[0])
    e.target.value = ''
  }

  return (
    <div className="min-h-screen bg-[#F7F8FA] flex items-center justify-center px-4">
      <div className="flex flex-col items-center max-w-md w-full">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-1">
          <BarChart2 size={32} color="#00C896" />
          <span className="font-bold text-[#0D1B2A]" style={{ fontSize: 24 }}>
            VENDA FEITA
          </span>
        </div>
        <p className="text-[#6B7280] text-sm mb-8">Dashboard Interno</p>

        {/* Drop zone */}
        {!imported && (
          <>
            <div
              onDrop={onDrop}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onClick={() => inputRef.current?.click()}
              className={`
                w-[280px] h-[180px] rounded-lg flex flex-col items-center justify-center gap-3 cursor-pointer
                border-2 border-dashed transition-all duration-200
                ${dragging
                  ? 'border-[#00C896] bg-[#F0FDF9]'
                  : 'border-[#E2E8F0] bg-white hover:border-[#00C896] hover:bg-[#F0FDF9]'
                }
              `}
            >
              {loading ? (
                <Loader2 size={28} className="text-brand-emerald animate-spin" />
              ) : (
                <>
                  <Upload size={28} className="text-neutral-400" />
                  <div className="text-center px-4">
                    <p className="text-sm font-medium text-[#0D1B2A]">
                      Arraste sua planilha de fechamento aqui
                    </p>
                    <p className="text-xs text-[#6B7280] mt-1">CSV ou Excel (.xlsx)</p>
                  </div>
                </>
              )}
            </div>

            <input
              ref={inputRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={onInputChange}
              className="hidden"
            />

            {/* Colunas esperadas */}
            <div className="mt-4 text-center">
              <p className="text-[10px] text-[#6B7280] mb-1">Colunas esperadas:</p>
              <p className="text-[10px] text-[#6B7280] leading-relaxed max-w-[300px]">
                {COLUNAS_OBRIGATORIAS.join(', ')}
              </p>
            </div>
          </>
        )}

        {/* Erro */}
        {erro && (
          <div className="mt-4 px-4 py-3 bg-[#FEE2E2] text-[#991B1B] text-xs rounded-lg w-full text-center">
            {erro}
          </div>
        )}

        {/* Preview */}
        {imported && (
          <div className="w-full mt-2">
            <div className="flex items-center gap-2 mb-3">
              <FileSpreadsheet size={16} className="text-brand-emerald" />
              <span className="text-sm font-semibold text-[#0D1B2A]">
                Preview — {dados.length} registros
              </span>
            </div>

            <div className="overflow-x-auto rounded-lg border border-[#E2E8F0] bg-white shadow-card">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-[#F7F8FA]">
                    {COLUNAS_OBRIGATORIAS.map(col => (
                      <th
                        key={col}
                        className="px-3 py-2 text-left font-semibold text-[#6B7280] whitespace-nowrap border-b border-[#E2E8F0]"
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {dados.slice(0, 5).map((row, i) => (
                    <tr key={i} className="border-b border-[#F7F8FA] last:border-0">
                      {COLUNAS_OBRIGATORIAS.map(col => (
                        <td key={col} className="px-3 py-2 text-[#111827] whitespace-nowrap">
                          {formatCell(row[col])}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <button
              onClick={onEntrar}
              className="mt-6 w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-white font-semibold text-sm transition-colors"
              style={{ background: '#00C896' }}
              onMouseEnter={e => e.currentTarget.style.background = '#00A37A'}
              onMouseLeave={e => e.currentTarget.style.background = '#00C896'}
            >
              Entrar no Dashboard
              <ArrowRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function formatCell(value) {
  if (value === null || value === undefined) return '—'
  if (value instanceof Date) {
    return isNaN(value.getTime()) ? '—' : value.toLocaleDateString('pt-BR')
  }
  if (typeof value === 'number') {
    return value.toLocaleString('pt-BR', { maximumFractionDigits: 2 })
  }
  return String(value)
}
