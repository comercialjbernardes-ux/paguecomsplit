// ═══════════════════════════════════════════════════════════════
// Categorias de Lancamentos — fonte unica de verdade
// Usado em: Transacoes (form), Custos, DRE, Relatorios
// ═══════════════════════════════════════════════════════════════

export const CATEGORIAS_RECEITA = [
  'Vendas POS',
  'Comissao de Rede',
  'Repasse',
  'Bonificacao',
  'Outros',
] as const

export const CATEGORIAS_DESPESA = [
  'Folha',
  'Marketing',
  'Infraestrutura',
  'Impostos',
  'Fornecedores',
  'Aluguel',
  'Fretes e Logistica',
  'Tecnologia',
  'Outros',
] as const

export const TODAS_CATEGORIAS = [...CATEGORIAS_RECEITA, ...CATEGORIAS_DESPESA] as const

export type CategoriaReceita = (typeof CATEGORIAS_RECEITA)[number]
export type CategoriaDespesa = (typeof CATEGORIAS_DESPESA)[number]
export type Categoria = CategoriaReceita | CategoriaDespesa

/** Retorna a lista correta conforme o tipo do lancamento */
export function categoriasParaTipo(tipo: 'receita' | 'despesa'): readonly string[] {
  return tipo === 'receita' ? CATEGORIAS_RECEITA : CATEGORIAS_DESPESA
}
