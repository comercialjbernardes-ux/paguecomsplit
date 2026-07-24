/**
 * Tabelas oficiais do Simples Nacional (LC 123/2006) — Anexos I, III e V.
 * Faixas baseadas no RBT12 (Receita Bruta dos últimos 12 meses).
 *
 * IMPORTANTE: Esta tabela é canônica, mas a alíquota efetiva real depende de
 * fatores como Fator R, atividades concomitantes, etc. Os números aqui são
 * suficientes para uma SIMULAÇÃO comercial — para fechamento contábil real,
 * o contador do cliente deve refazer o cálculo.
 *
 * TODO: Antes do deploy de produção, validar a tabela com a contabilidade
 * do time SplitTech.
 */

export type SimplesFaixa = {
  /** Receita bruta anual máxima da faixa (R$). */
  maxAnnual: number;
  /** Alíquota nominal da faixa (decimal: 0.06 = 6%). */
  rate: number;
  /** Dedução em reais a ser subtraída do cálculo. */
  deducao: number;
};

export type AnexoKey = "I" | "III" | "V";

export const ANEXOS: Record<
  AnexoKey,
  { label: string; description: string; faixas: SimplesFaixa[] }
> = {
  I: {
    label: "Anexo I — Comércio",
    description: "Venda de mercadoria (restaurantes, petshops, construção, etc.)",
    faixas: [
      { maxAnnual: 180_000, rate: 0.04, deducao: 0 },
      { maxAnnual: 360_000, rate: 0.073, deducao: 5_940 },
      { maxAnnual: 720_000, rate: 0.095, deducao: 13_860 },
      { maxAnnual: 1_800_000, rate: 0.107, deducao: 22_500 },
      { maxAnnual: 3_600_000, rate: 0.143, deducao: 87_300 },
      { maxAnnual: 4_800_000, rate: 0.19, deducao: 378_000 },
    ],
  },
  III: {
    label: "Anexo III — Serviços (com Fator R)",
    description:
      "Serviços com folha de pagamento ≥ 28% da receita (estética, veterinária, odontologia, oficinas).",
    faixas: [
      { maxAnnual: 180_000, rate: 0.06, deducao: 0 },
      { maxAnnual: 360_000, rate: 0.112, deducao: 9_360 },
      { maxAnnual: 720_000, rate: 0.135, deducao: 17_640 },
      { maxAnnual: 1_800_000, rate: 0.16, deducao: 35_640 },
      { maxAnnual: 3_600_000, rate: 0.21, deducao: 125_640 },
      { maxAnnual: 4_800_000, rate: 0.33, deducao: 648_000 },
    ],
  },
  V: {
    label: "Anexo V — Serviços (sem Fator R)",
    description:
      "Serviços com folha de pagamento < 28% da receita — alíquota é mais pesada.",
    faixas: [
      { maxAnnual: 180_000, rate: 0.155, deducao: 0 },
      { maxAnnual: 360_000, rate: 0.18, deducao: 4_500 },
      { maxAnnual: 720_000, rate: 0.195, deducao: 9_900 },
      { maxAnnual: 1_800_000, rate: 0.205, deducao: 17_100 },
      { maxAnnual: 3_600_000, rate: 0.23, deducao: 62_100 },
      { maxAnnual: 4_800_000, rate: 0.305, deducao: 540_000 },
    ],
  },
};

/**
 * Faixas de faturamento mensal apresentadas ao usuário no simulador.
 * O valor `annualRevenue` é o ponto médio (ou topo) da faixa, usado
 * como aproximação para calcular a alíquota efetiva.
 */
export type RevenueBand = {
  id: string;
  label: string;
  monthlyMid: number;
  annualRevenue: number;
};

export const REVENUE_BANDS: RevenueBand[] = [
  {
    id: "ate-15k",
    label: "Até R$ 15.000 / mês (Simples — 1ª faixa)",
    monthlyMid: 12_000,
    annualRevenue: 144_000,
  },
  {
    id: "15-30k",
    label: "R$ 15.001 a R$ 30.000 / mês (2ª faixa)",
    monthlyMid: 22_500,
    annualRevenue: 270_000,
  },
  {
    id: "30-60k",
    label: "R$ 30.001 a R$ 60.000 / mês (3ª faixa)",
    monthlyMid: 45_000,
    annualRevenue: 540_000,
  },
  {
    id: "60-150k",
    label: "R$ 60.001 a R$ 150.000 / mês (4ª faixa)",
    monthlyMid: 100_000,
    annualRevenue: 1_200_000,
  },
  {
    id: "150-300k",
    label: "R$ 150.001 a R$ 300.000 / mês (5ª faixa)",
    monthlyMid: 220_000,
    annualRevenue: 2_640_000,
  },
  {
    id: "300-400k",
    label: "R$ 300.001 a R$ 400.000 / mês (6ª faixa)",
    monthlyMid: 350_000,
    annualRevenue: 4_200_000,
  },
];

/** Mapeamento padrão de segmento para Anexo. Pode ser sobrescrito pelo usuário. */
export const SEGMENT_ANEXO: Record<string, AnexoKey> = {
  restaurante: "I",
  veterinaria: "III",
  estetica: "III",
  odontologia: "III",
  petshop: "I",
  oficina: "III",
  construcao: "I",
  vestuario: "I",
  academia: "III",
  industria: "I",
};

/**
 * Calcula a alíquota efetiva do Simples Nacional a partir da receita anual
 * e do anexo. Retorna decimal (0.073 = 7,3%).
 *
 * Fórmula oficial: `(RBT12 × aliquota_nominal - deducao) / RBT12`
 */
export function computeEffectiveRate(
  annualRevenue: number,
  anexo: AnexoKey
): number {
  const faixas = ANEXOS[anexo].faixas;
  const faixa =
    faixas.find((f) => annualRevenue <= f.maxAnnual) ??
    faixas[faixas.length - 1];
  if (annualRevenue <= 0) return faixa.rate;
  const efetiva = (annualRevenue * faixa.rate - faixa.deducao) / annualRevenue;
  // Sanity: nunca negativo, nunca acima da nominal
  return Math.max(0.001, Math.min(faixa.rate, efetiva));
}
