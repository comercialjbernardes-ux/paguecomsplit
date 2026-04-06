import { create } from 'zustand'
import Papa from 'papaparse'
import * as XLSX from 'xlsx'
import { COLUNAS_OBRIGATORIAS } from '../data/schema'

const useDataStore = create((set) => ({
  dados: [],
  meta: {
    periodo: null,
    totalRegistros: 0,
    dataImportacao: null,
  },
  loading: false,
  erro: null,

  importarArquivo: async (file) => {
    set({ loading: true, erro: null })

    try {
      const nome = file.name.toLowerCase()
      let rawData

      if (nome.endsWith('.csv')) {
        rawData = await parseCsv(file)
      } else if (nome.endsWith('.xlsx') || nome.endsWith('.xls')) {
        rawData = await parseXlsx(file)
      } else {
        const msg = 'Formato não suportado. Use CSV ou XLSX.'
        window.vfLog?.(msg, 'error')
        set({ loading: false, erro: msg })
        return
      }

      if (!rawData || rawData.length === 0) {
        const msg = 'Arquivo vazio ou sem dados válidos.'
        window.vfLog?.(msg, 'error')
        set({ loading: false, erro: msg })
        return
      }

      const colunas = Object.keys(rawData[0]).map(c => c.trim().toLowerCase())
      const faltantes = COLUNAS_OBRIGATORIAS.filter(col => !colunas.includes(col))

      if (faltantes.length > 0) {
        faltantes.forEach(col => window.vfLog?.(`Coluna faltante: ${col}`, 'error'))
        const msg = `Colunas faltantes: ${faltantes.join(', ')}`
        set({ loading: false, erro: msg })
        return
      }

      const dados = rawData.map(row => {
        const normalized = {}
        for (const key of Object.keys(row)) {
          normalized[key.trim().toLowerCase()] = row[key]
        }
        return {
          ...normalized,
          valor_venda: parseFloat(normalized.valor_venda) || 0,
          comissao_percentual: parseFloat(normalized.comissao_percentual) || 0,
          meta_individual: parseFloat(normalized.meta_individual) || 0,
          data_fechamento: parseDate(normalized.data_fechamento),
        }
      })

      const datas = dados
        .map(d => d.data_fechamento)
        .filter(d => d instanceof Date && !isNaN(d))
        .sort((a, b) => a - b)

      const periodo = datas.length > 0
        ? { inicio: datas[0], fim: datas[datas.length - 1] }
        : null

      set({
        dados,
        meta: {
          periodo,
          totalRegistros: dados.length,
          dataImportacao: new Date(),
        },
        loading: false,
        erro: null,
      })

      window.vfLog?.(`${dados.length} registros importados`, 'info')
    } catch (err) {
      const msg = `Erro ao importar: ${err.message}`
      window.vfLog?.(msg, 'error')
      set({ loading: false, erro: msg })
    }
  },

  limparDados: () => {
    set({
      dados: [],
      meta: { periodo: null, totalRegistros: 0, dataImportacao: null },
      loading: false,
      erro: null,
    })
  },
}))

function parseCsv(file) {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => resolve(result.data),
      error: (err) => reject(err),
    })
  })
}

function parseXlsx(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const workbook = XLSX.read(e.target.result, { type: 'array' })
        const sheetName = workbook.SheetNames[0]
        const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName])
        resolve(data)
      } catch (err) {
        reject(err)
      }
    }
    reader.onerror = () => reject(new Error('Falha ao ler arquivo'))
    reader.readAsArrayBuffer(file)
  })
}

function parseDate(value) {
  if (value instanceof Date) return value
  if (typeof value === 'number') {
    // Excel serial date
    const epoch = new Date(1899, 11, 30)
    return new Date(epoch.getTime() + value * 86400000)
  }
  if (typeof value === 'string') {
    // Try DD/MM/YYYY
    const parts = value.match(/^(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{4})$/)
    if (parts) {
      return new Date(parseInt(parts[3]), parseInt(parts[2]) - 1, parseInt(parts[1]))
    }
    const d = new Date(value)
    return isNaN(d.getTime()) ? null : d
  }
  return null
}

export default useDataStore
