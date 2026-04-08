import { useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { TrendingUp, Upload, Download, FileSpreadsheet } from 'lucide-react'
import useDataStore from '../context/DataContext'

const CSV_MODELO = [
  'vendedor,regiao,produto,valor_venda,data_fechamento,meta_individual,comissao_percentual,tipo_produto,cliente,segmento_cliente',
  'Ana Beatriz Lima,Sul,Plano Empresarial Plus,74200,2026-03-15,160000,4.0,SaaS,Grupo Alfa Ltda,Varejo',
  'Lucas Andrade,Sudeste,Licença SaaS Anual,58600,2026-03-18,200000,3.5,SaaS,Psi Corp S.A.,Tecnologia',
  'Fernanda Rocha,Centro-Oeste,Suporte Premium,31800,2026-03-20,150000,3.0,Serviço,Kappa Energia,Indústria',
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

const COLUNAS = [
  { col: 'vendedor',            desc: 'Nome do vendedor' },
  { col: 'regiao',              desc: 'Região de atuação' },
  { col: 'produto',             desc: 'Nome do produto vendido' },
  { col: 'valor_venda',         desc: 'Valor da venda (número)' },
  { col: 'data_fechamento',     desc: 'Data (DD/MM/YYYY ou YYYY-MM-DD)' },
  { col: 'meta_individual',     desc: 'Meta mensal do vendedor' },
  { col: 'comissao_percentual', desc: 'Percentual de comissão (ex: 3.5)' },
  { col: 'tipo_produto',        desc: 'Categoria do produto' },
  { col: 'cliente',             desc: 'Nome do cliente' },
  { col: 'segmento_cliente',    desc: 'Segmento do cliente' },
]

export default function Welcome() {
  const navigate   = useNavigate()
  const fileRef    = useRef(null)
  const { importarArquivo, loading, erro, dados } = useDataStore()

  async function handleFile(file) {
    if (!file) return
    await importarArquivo(file)
  }

  // Se dados já foram carregados, navegar para o dashboard
  if (dados.length > 0) {
    navigate('/equipe/dashboard', { replace: true })
    return null
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center px-4 py-12">
      {/* Branding */}
      <div className="flex flex-col items-center gap-3 mb-10">
        <div className="w-16 h-16 bg-[#00C896] rounded-2xl flex items-center justify-center shadow-lg">
          <TrendingUp size={32} strokeWidth={1.5} className="text-white" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-[#0D1B2A]">VENDA FEITA</h1>
        <p className="text-slate-500 text-sm text-center max-w-xs">
          Inteligência comercial para times de alta performance
        </p>
      </div>

      {/* Drop zone */}
      <div
        className={`w-full max-w-md border-2 border-dashed rounded-[12px] bg-white flex flex-col items-center justify-center gap-4 mb-6 cursor-pointer transition-all duration-200 ${
          loading
            ? 'border-[#00C896] bg-[#F0FDF9]'
            : 'border-[#E2E8F0] hover:border-[#00C896] hover:bg-[#F0FDF9]'
        }`}
        style={{ height: 220 }}
        onClick={() => !loading && fileRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); handleFile(e.dataTransfer.files[0]) }}
      >
        <div className={`w-14 h-14 rounded-full flex items-center justify-center ${loading ? 'bg-[#00C896]' : 'bg-[#E6FAF5]'}`}>
          <Upload size={24} strokeWidth={1.5} className={loading ? 'text-white animate-bounce' : 'text-[#00C896]'} />
        </div>
        <div className="text-center">
          {loading ? (
            <p className="font-semibold text-[#0D1B2A] text-sm">Importando dados...</p>
          ) : (
            <>
              <p className="font-semibold text-[#0D1B2A] text-sm">Arraste sua planilha aqui</p>
              <p className="text-slate-400 text-xs mt-1">ou clique para selecionar</p>
            </>
          )}
          <p className="text-slate-300 text-xs mt-2">CSV · XLSX · XLS</p>
        </div>
        <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls" className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])} />
      </div>

      {/* Erro */}
      {erro && (
        <div className="w-full max-w-md mb-4 bg-[#FEF2F2] border border-[#FCA5A5] rounded-[8px] px-4 py-3">
          <p className="text-sm text-[#991B1B] font-medium">{erro}</p>
        </div>
      )}

      {/* Colunas esperadas */}
      <div className="w-full max-w-md mb-6">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
          Colunas obrigatórias na planilha
        </p>
        <div className="card p-4 space-y-2">
          {COLUNAS.map(({ col, desc }) => (
            <div key={col} className="flex items-start gap-3">
              <code className="flex-shrink-0 text-xs bg-[#F1F5F9] text-[#0D1B2A] px-2 py-0.5 rounded font-mono border border-[#E2E8F0]">
                {col}
              </code>
              <span className="text-xs text-slate-500 leading-relaxed">{desc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Download modelo */}
      <button onClick={downloadCSV}
        className="flex items-center gap-2 px-5 py-2.5 rounded-[8px] border border-[#E2E8F0] bg-white text-sm font-medium text-slate-600 hover:border-[#00C896] hover:text-[#00C896] transition-all duration-150">
        <Download size={16} strokeWidth={1.5} />
        Baixar planilha modelo
        <FileSpreadsheet size={15} strokeWidth={1.5} className="text-slate-300" />
      </button>
    </div>
  )
}
