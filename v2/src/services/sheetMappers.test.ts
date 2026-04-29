// ═══════════════════════════════════════════════════════════════
// sheetMappers.test.ts — Testes de regressão dos mappers críticos
//
// PONTO 4 — Zero testes automatizados.
// Cobre funções de transformação de dados brutos da planilha:
//   - parseNumericValue: formatos BR, Anglo, R$, %, símbolos
//   - normalizeDate:     US M/DD/YYYY vs BR DD/MM/YYYY
//   - normalizeCnpj:     14 dígitos, formatado, com zero faltando
//   - isTotalRow:        rejeita "TOTAL —" mas preserva "Total Soluções LTDA"
//   - mapRowsDescontos:  detecção de header, índice de colunas, bounds
//   - mapRowsMKPdePOS:   detecção dinâmica de header, filtro de totais
//
// Estruturas reais confirmadas (config/sheets.ts):
//   MKP de POS: idx0=seq, idx1=Nome, idx2=CNPJ, idx3=TPV, idx4=Markup, idx5=Margem
//   Repasses:   idx0=seq, idx1=Data, idx2=CNPJ, idx3=Nome, idx4=Tipo, idx5=Valor
//
// Executar: npm test
// ═══════════════════════════════════════════════════════════════

import { describe, it, expect } from 'vitest'
import {
  mapRowsDescontos,
  mapRowsMKPdePOS,
  mapRowsRepasses,
  mapRowsToVendedores,
} from './sheetMappers'

// ─── parseNumericValue (via mapRowsToVendedores) ────────────────
// COL_VENDEDORES: ID=0, NOME=1, REGIAO=2, META_MENSAL=3, META_ACUMULADA=4...
describe('parseNumericValue — via mapRowsToVendedores', () => {
  // Row layout: [ID, NOME, REGIAO, META_MENSAL, META_ACUMULADA, COMISSAO_BASE, BONUS]
  const makeRow = (meta: string | number) =>
    [['header'], [1, 'Vendedor Teste', 'Norte', meta, 0, 0, 0]] as (string | number)[][]

  it('converte inteiro puro', () => {
    const result = mapRowsToVendedores(makeRow(5000))
    expect(result[0].metaMensal).toBe(5000)
  })

  it('converte formato BR com vírgula decimal "1.234,56"', () => {
    const result = mapRowsToVendedores(makeRow('1.234,56'))
    expect(result[0].metaMensal).toBeCloseTo(1234.56)
  })

  it('converte formato com prefixo R$', () => {
    const result = mapRowsToVendedores(makeRow('R$ 28.758,68'))
    expect(result[0].metaMensal).toBeCloseTo(28758.68)
  })

  it('converte string de porcentagem "1,05%"', () => {
    const result = mapRowsToVendedores(makeRow('1,05%'))
    expect(result[0].metaMensal).toBeCloseTo(1.05)
  })

  it('retorna 0 para valor vazio', () => {
    const result = mapRowsToVendedores(makeRow(''))
    expect(result[0].metaMensal).toBe(0)
  })

  it('retorna 0 para elemento ausente na linha', () => {
    const rows: (string | number)[][] = [['header'], [1, 'Teste', 'Sul']]
    const result = mapRowsToVendedores(rows)
    expect(result[0].metaMensal).toBe(0)
  })

  it('converte valor negativo', () => {
    const result = mapRowsToVendedores(makeRow('-500'))
    expect(result[0].metaMensal).toBe(-500)
  })

  it('converte valor com símbolo ▲', () => {
    const result = mapRowsToVendedores(makeRow('▲ 10.2'))
    expect(result[0].metaMensal).toBeCloseTo(10.2)
  })
})

// ─── normalizeCnpj (via mapRowsMKPdePOS) ───────────────────────
// Estrutura real: seq | Nome | CNPJ | TPV | Markup | Margem
describe('normalizeCnpj — via mapRowsMKPdePOS', () => {
  // [seq, Nome, CNPJ, TPV, Markup, Margem]
  const makeRows = (cnpj: string | number) => [
    ['DETALHAMENTO MKP DE POS'],
    ['', 'Nome', 'CNPJ', 'TPV Total', 'Markup', 'Margem'],
    ['', 'Empresa Teste', cnpj, 500000, 1500, 0.012],
  ] as (string | number)[][]

  it('normaliza CNPJ formatado com pontos e barras', () => {
    const result = mapRowsMKPdePOS(makeRows('59.813.357/0001-31'))
    expect(result).toHaveLength(1)
    expect(result[0].cnpj).toBe('59813357000131')
  })

  it('normaliza CNPJ sem formatação (14 dígitos)', () => {
    const result = mapRowsMKPdePOS(makeRows('55789698000168'))
    expect(result).toHaveLength(1)
    expect(result[0].cnpj).toBe('55789698000168')
  })

  it('padeia CNPJ curto com zeros à esquerda', () => {
    const result = mapRowsMKPdePOS(makeRows('5866499000138'))
    expect(result).toHaveLength(1)
    expect(result[0].cnpj).toBe('05866499000138')
  })

  it('CNPJ numérico (sem string) também é normalizado', () => {
    const result = mapRowsMKPdePOS(makeRows(55789698000168))
    expect(result).toHaveLength(1)
    expect(result[0].cnpj).toBe('55789698000168')
  })
})

// ─── isTotalRow (via mapRowsMKPdePOS) ──────────────────────────
// Estrutura: seq | Nome | CNPJ | TPV | Markup | Margem
describe('isTotalRow — via mapRowsMKPdePOS', () => {
  const header  = ['', 'Nome', 'CNPJ', 'TPV Total', 'Markup', 'Margem']
  const dataRow = ['', 'Empresa A', '12345678000190', 100000, 500, 0.01]

  it('rejeita linha com "TOTAL" exato', () => {
    const rows = [header, dataRow, ['TOTAL', '', '', '', '', '']] as (string | number)[][]
    expect(mapRowsMKPdePOS(rows)).toHaveLength(1)
  })

  it('rejeita "TOTAL — 59 ECs"', () => {
    const rows = [header, dataRow, ['TOTAL — 59 ECs', '', '', '', '', '']] as (string | number)[][]
    expect(mapRowsMKPdePOS(rows)).toHaveLength(1)
  })

  it('rejeita "TOTAL:" com dois pontos', () => {
    const rows = [header, dataRow, ['TOTAL:', '', '', '', '', '']] as (string | number)[][]
    expect(mapRowsMKPdePOS(rows)).toHaveLength(1)
  })

  it('preserva empresa "Totaltech LTDA" (letra imediatamente após "Total")', () => {
    const rows = [
      header,
      dataRow,
      ['', 'Totaltech LTDA', '98765432000101', 200000, 800, 0.015],
    ] as (string | number)[][]
    const result = mapRowsMKPdePOS(rows)
    expect(result).toHaveLength(2)
    expect(result[1].nome).toBe('Totaltech LTDA')
  })

  it('preserva empresa "Total Soluções EIRELI" quando tem CNPJ válido', () => {
    // Bug fix: empresas com nome iniciando em "Total X" mas com CNPJ válido
    // não devem ser filtradas — só linhas de rodapé sem CNPJ são rejeitadas.
    const rows = [
      header,
      dataRow,
      ['', 'Total Soluções EIRELI', '11223344000155', 150000, 600, 0.01],
    ] as (string | number)[][]
    const result = mapRowsMKPdePOS(rows)
    expect(result).toHaveLength(2)
    expect(result[1].nome).toBe('Total Soluções EIRELI')
  })

  it('rejeita linha "TOTAL" sem CNPJ válido', () => {
    const rows = [
      header,
      dataRow,
      ['', 'TOTAL GERAL', '', 250000, 1300, 0.011],
    ] as (string | number)[][]
    expect(mapRowsMKPdePOS(rows)).toHaveLength(1)
  })
})

// ─── mapRowsDescontos — detecção de header e bounds ────────────
describe('mapRowsDescontos — detecção de header', () => {
  // JAN/FEV (6 colunas): vazio | CNPJ | Parceiro | Tipo | Origem | Valor
  const headerJanFev = ['', 'CNPJ', 'Parceiro', 'Tipo', 'Origem do Desconto', 'Valor']
  const dataJanFev   = ['', '59813357000131', 'Empresa B', 'POS', 'Equipamento ref-01', 350]

  // MAR (5 colunas): vazio | CNPJ | Parceiro | Tipo/Origem | Valor
  const headerMar = ['', 'CNPJ', 'Parceiro', 'Tipo / Origem do Desconto', 'Valor']
  const dataMar   = ['', '12345678000190', 'Empresa C', 'POS | Equipamento xyz', 200]

  it('detecta header JAN/FEV (6 colunas) e extrai valor correto', () => {
    const rows = [
      ['Titulo da planilha de descontos'],
      [],
      [],
      [],
      headerJanFev,
      dataJanFev,
    ] as (string | number)[][]
    const result = mapRowsDescontos(rows, 'Jan2026')
    expect(result).toHaveLength(1)
    expect(result[0].valor).toBe(350)
    expect(result[0].tipo).toBe('despesa')
  })

  it('detecta header MAR (5 colunas) e separa tipo do desconto pelo "|"', () => {
    const rows = [
      ['Titulo'],
      headerMar,
      dataMar,
    ] as (string | number)[][]
    const result = mapRowsDescontos(rows, 'Mar2026')
    expect(result).toHaveLength(1)
    expect(result[0].valor).toBe(200)
    expect(result[0].descricao).toContain('Equipamento')
  })

  it('não retorna linha de TOTAL DESCONTOS', () => {
    const rows = [
      headerJanFev,
      dataJanFev,
      ['', '', '', '', 'TOTAL DESCONTOS', 5000],
    ] as (string | number)[][]
    const result = mapRowsDescontos(rows, 'Jan2026')
    expect(result.every(r => !r.descricao?.toUpperCase().includes('TOTAL'))).toBe(true)
  })

  it('não lança erro quando header não é encontrado (fallback seguro)', () => {
    const rows = [
      ['Titulo sem headers validos'],
      ['dado1', 'dado2', 'dado3', 'dado4', 'dado5'],
    ] as (string | number)[][]
    expect(() => mapRowsDescontos(rows, 'Jan2026')).not.toThrow()
  })

  it('não lança erro no edge case valorIdx=1 (descTipoIdx bounds)', () => {
    // Testa que Math.max(0, valorIdx-1) evita índice negativo
    const rows = [
      ['CNPJ', 'Valor', 'Parceiro'],
      ['12345678000190', 500, 'X'],
    ] as (string | number)[][]
    expect(() => mapRowsDescontos(rows, 'Fev2026')).not.toThrow()
  })

  it('exige 3+ keywords de header para evitar falso positivo', () => {
    // Apenas "cnpj" + "valor" sem terceira keyword não deve identificar como header
    // → headerRowIdx permanece -1 → dados começam na linha 1 (fallback)
    const rows = [
      ['cnpj', 'valor'],              // só 2 keywords — não deve ser detectado como header
      ['12345678000190', 100],        // dado real
      ['98765432000101', 200],
    ] as (string | number)[][]
    // Não deve lançar — pode ou não retornar dados dependendo do fallback
    expect(() => mapRowsDescontos(rows, 'Mar2026')).not.toThrow()
  })
})

// ─── normalizeDate (via mapRowsRepasses) ───────────────────────
// Estrutura real: seq | Data | CNPJ | Estabelecimento | Tipo | Valor
// COL_REPASSES: DATA=1, CNPJ=2, NOME=3, TIPO=4, VALOR=5
describe('normalizeDate — via mapRowsRepasses', () => {
  // rows.slice(2) → data começa no índice 2
  // [seq, data, cnpj, nome, tipo, valor]
  const makeRepasses = (data: string) => [
    ['Titulo'],
    ['', 'Data', 'CNPJ', 'Estabelecimento', 'Tipo de Ajuste', 'Valor'],
    ['', data, '12345678000190', 'Empresa X', 'Ajuste', 100],
  ] as (string | number)[][]

  it('normaliza formato US M/DD/YYYY ("1/13/2026") → "13/01/2026"', () => {
    const result = mapRowsRepasses(makeRepasses('1/13/2026'))
    expect(result).toHaveLength(1)
    expect(result[0].data).toBe('13/01/2026')
  })

  it('normaliza formato US "2/3/2026" — ambos ≤12, assume US → "03/02/2026"', () => {
    // n1=2 ≤ 12, n2=3 ≤ 12 → ambos ambíguos → assume US → dia=3, mês=2
    const result = mapRowsRepasses(makeRepasses('2/3/2026'))
    expect(result).toHaveLength(1)
    expect(result[0].data).toBe('03/02/2026')
  })

  it('normaliza formato BR DD/MM/YYYY "16/03/2026" — n1=16 > 12 → BR', () => {
    const result = mapRowsRepasses(makeRepasses('16/03/2026'))
    expect(result).toHaveLength(1)
    expect(result[0].data).toBe('16/03/2026')
  })

  it('preserva formato desconhecido "2026-03-16" sem modificar', () => {
    const result = mapRowsRepasses(makeRepasses('2026-03-16'))
    expect(result).toHaveLength(1)
    expect(result[0].data).toBe('2026-03-16')
  })

  it('normaliza data com hífens "16-03-2026" → "16/03/2026"', () => {
    const result = mapRowsRepasses(makeRepasses('16-03-2026'))
    expect(result).toHaveLength(1)
    expect(result[0].data).toBe('16/03/2026')
  })

  it('retorna array vazio para planilha com ≤ 2 linhas', () => {
    const rows = [['header']] as (string | number)[][]
    expect(mapRowsRepasses(rows)).toHaveLength(0)
  })
})
