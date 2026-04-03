import { TrendingUp, Upload, Download, FileSpreadsheet } from 'lucide-react'

// CSV modelo para download
const CSV_MODELO = [
  'data,descricao,valor,categoria,vendedor,tipo',
  '2025-03-01,Venda Plano Plus,5800.00,Software,Ana Beatriz,receita',
  '2025-03-02,Suporte Premium,1200.00,Serviço,Carlos Eduardo,receita',
  '2025-03-03,Aluguel Escritório,3500.00,Infraestrutura,,despesa',
  '2025-03-04,Licença SaaS,2400.00,Software,Fernanda Rocha,receita',
].join('\n')

function downloadCSV() {
  const blob = new Blob([CSV_MODELO], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'modelo_vendafeita.csv'
  a.click()
  URL.revokeObjectURL(url)
}

const COLUNAS_ESPERADAS = [
  { col: 'data', desc: 'Data do lançamento (YYYY-MM-DD)' },
  { col: 'descricao', desc: 'Descrição do item' },
  { col: 'valor', desc: 'Valor numérico (ex: 5800.00)' },
  { col: 'categoria', desc: 'Categoria do lançamento' },
  { col: 'vendedor', desc: 'Nome do vendedor (opcional)' },
  { col: 'tipo', desc: '"receita" ou "despesa"' },
]

export function Welcome() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center px-4 py-12">
      {/* Logo + branding */}
      <div className="flex flex-col items-center gap-3 mb-10">
        <div className="w-16 h-16 bg-[#00C896] rounded-2xl flex items-center justify-center shadow-lg">
          <TrendingUp size={32} strokeWidth={1.5} className="text-white" />
        </div>
        <h1
          className="font-bold tracking-tight text-[#0D1B2A]"
          style={{ fontFamily: 'Inter', fontSize: '32px', fontWeight: 700 }}
        >
          VENDA FEITA
        </h1>
        <p className="text-slate-500 text-sm text-center max-w-xs">
          Inteligência comercial para times de alta performance
        </p>
      </div>

      {/* Upload zone */}
      <div
        className="w-full max-w-md border-2 border-dashed border-[#E2E8F0] rounded-[12px] bg-white
          hover:border-[#00C896] hover:bg-[#F0FDF9] transition-all duration-200 cursor-pointer
          flex flex-col items-center justify-center gap-4 mb-6"
        style={{ width: '360px', height: '240px' }}
        onClick={() => document.getElementById('wv-file-input')?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault()
          const file = e.dataTransfer.files[0]
          if (file) console.log('Arquivo recebido:', file.name)
        }}
      >
        <div className="w-14 h-14 bg-[#E6FAF5] rounded-full flex items-center justify-center">
          <Upload size={24} strokeWidth={1.5} className="text-[#00C896]" />
        </div>
        <div className="text-center">
          <p className="font-semibold text-[#0D1B2A] text-sm">
            Arraste sua planilha aqui
          </p>
          <p className="text-slate-400 text-xs mt-1">
            ou clique para selecionar um arquivo
          </p>
          <p className="text-slate-300 text-xs mt-2">CSV · XLSX · XLS</p>
        </div>
        <input
          id="wv-file-input"
          type="file"
          accept=".csv,.xlsx,.xls"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) console.log('Arquivo selecionado:', file.name)
          }}
        />
      </div>

      {/* Colunas esperadas */}
      <div className="w-full max-w-md mb-6">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
          Colunas esperadas na planilha
        </p>
        <div className="card p-4 space-y-2">
          {COLUNAS_ESPERADAS.map(({ col, desc }) => (
            <div key={col} className="flex items-start gap-3">
              <code
                className="flex-shrink-0 text-xs bg-[#F1F5F9] text-[#0D1B2A] px-2 py-0.5 rounded font-mono border border-[#E2E8F0]"
                style={{ fontFamily: 'Inter Mono, monospace' }}
              >
                {col}
              </code>
              <span className="text-xs text-slate-500 leading-relaxed">{desc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Botão modelo */}
      <button
        onClick={downloadCSV}
        className="flex items-center gap-2 px-5 py-2.5 rounded-[8px] border border-[#E2E8F0] bg-white
          text-sm font-medium text-slate-600 hover:border-[#00C896] hover:text-[#00C896]
          transition-all duration-150"
      >
        <Download size={16} strokeWidth={1.5} />
        Baixar planilha modelo
        <FileSpreadsheet size={15} strokeWidth={1.5} className="text-slate-300" />
      </button>
    </div>
  )
}
