export type SegmentExample = {
  annual_revenue: number;
  repasse_percent: number;
  repasse_value: number;
  tax_rate: number;
  annual_savings: number;
  monthly_savings: number;
};

export type SegmentTestimonial = {
  name: string;
  role: string;
  city: string;
  text: string;
  segment: string;
};

export type Segment = {
  slug: string;
  name: string;
  headline: string;
  pain: string;
  third_party: string;
  hook_question: string;
  example: SegmentExample;
  testimonial?: SegmentTestimonial;
  whatsapp_message: string;
  meta_title: string;
  meta_description: string;
  keywords: string[];
};

export const segments: Segment[] = [
  {
    slug: "restaurante",
    name: "Restaurantes",
    headline: "Restaurantes: a gorjeta do garçom fora do seu DAS.",
    pain: "Você está pagando imposto sobre a gorjeta do seu garçom.",
    third_party: "Gorjeta dos garçons (10%)",
    hook_question:
      "Quanto da gorjeta do seu garçom virou DAS este ano?",
    example: {
      annual_revenue: 480000,
      repasse_percent: 10,
      repasse_value: 48000,
      tax_rate: 0.06,
      annual_savings: 2880,
      monthly_savings: 240,
    },
    whatsapp_message:
      "Oi, vi o paguecomsplit.com.br e quero entender como tirar a gorjeta do garçom do meu DAS.",
    meta_title:
      "Split de Pagamento para Restaurantes | Gorjeta fora do DAS",
    meta_description:
      "A gorjeta do seu garçom não é sua receita. A SplitTech administra a divisão antes do DAS incidir — você tributa só a sua margem real.",
    keywords: [
      "split pagamento restaurante",
      "reduzir imposto restaurante simples nacional",
      "maquininha restaurante gorjeta",
    ],
  },
  {
    slug: "veterinaria",
    name: "Veterinárias",
    headline: "Veterinárias: o honorário do parceiro fora do seu DAS.",
    pain:
      "O honorário do veterinário parceiro infla seu faturamento tributável.",
    third_party: "Veterinários autônomos parceiros",
    hook_question:
      "Quanto do honorário do veterinário parceiro entrou no seu DAS?",
    example: {
      annual_revenue: 360000,
      repasse_percent: 55,
      repasse_value: 198000,
      tax_rate: 0.06,
      annual_savings: 11880,
      monthly_savings: 990,
    },
    whatsapp_message:
      "Oi, vi o paguecomsplit.com.br e quero entender como tirar o honorário do veterinário parceiro do meu faturamento tributável.",
    meta_title:
      "Split de Pagamento para Veterinárias | Honorário fora do DAS",
    meta_description:
      "O honorário do veterinário parceiro não é sua receita. A SplitTech administra a divisão antes do DAS incidir — você tributa só a sua margem real.",
    keywords: [
      "split pagamento veterinaria",
      "reduzir imposto clinica veterinaria",
      "maquininha veterinaria simples nacional",
    ],
  },
  {
    slug: "estetica",
    name: "Clínicas de Estética",
    headline: "Estética: cada profissional parceira fora do seu DAS.",
    pain:
      "Cada profissional parceira eleva seu DAS indevidamente.",
    third_party:
      "Profissionais parceiros (nail, lash, design de sobrancelha, etc.)",
    hook_question:
      "Quantas profissionais parceiras estão inflando seu DAS hoje?",
    example: {
      annual_revenue: 330000,
      repasse_percent: 60,
      repasse_value: 198000,
      tax_rate: 0.143,
      annual_savings: 28300,
      monthly_savings: 2358,
    },
    whatsapp_message:
      "Oi, vi o paguecomsplit.com.br e quero entender como tirar as profissionais parceiras do meu DAS.",
    meta_title:
      "Split de Pagamento para Clínicas de Estética | DAS só sobre o que é seu",
    meta_description:
      "Cada profissional parceira tributa o que é dela. A SplitTech administra a divisão antes do DAS incidir — você não paga mais imposto pela receita do outro.",
    keywords: [
      "split pagamento estetica",
      "reduzir imposto clinica estetica",
      "maquininha estetica simples nacional",
    ],
  },
  {
    slug: "odontologia",
    name: "Odontologia",
    headline: "Odontologia: o protético e o especialista fora do seu DAS.",
    pain:
      "O trabalho do protético e dos especialistas está no seu DAS.",
    third_party: "Especialistas terceirizados e laboratórios protéticos",
    hook_question:
      "Quanto o trabalho do protético custa no seu DAS todo mês?",
    example: {
      annual_revenue: 600000,
      repasse_percent: 40,
      repasse_value: 240000,
      tax_rate: 0.06,
      annual_savings: 14400,
      monthly_savings: 1200,
    },
    whatsapp_message:
      "Oi, vi o paguecomsplit.com.br e quero entender como tirar o protético e os especialistas do meu DAS.",
    meta_title:
      "Split de Pagamento para Odontologia | Protético fora do DAS",
    meta_description:
      "O trabalho do protético e dos especialistas não é sua receita. A SplitTech administra a divisão antes do DAS incidir — você tributa só a sua margem real.",
    keywords: [
      "split pagamento odontologia",
      "reduzir imposto consultorio dentista",
      "maquininha odontologia simples nacional",
    ],
  },
  {
    slug: "petshop",
    name: "Petshops",
    headline: "Petshops: banho e tosa do parceiro fora da sua receita.",
    pain:
      "O banho e tosa do parceiro infla seu faturamento tributável.",
    third_party: "Groomers e veterinários parceiros",
    hook_question:
      "Quanto o banho e tosa do parceiro custa no seu DAS?",
    example: {
      annual_revenue: 240000,
      repasse_percent: 50,
      repasse_value: 120000,
      tax_rate: 0.06,
      annual_savings: 7200,
      monthly_savings: 600,
    },
    whatsapp_message:
      "Oi, vi o paguecomsplit.com.br e quero entender como tirar o banho e tosa do parceiro do meu DAS.",
    meta_title:
      "Split de Pagamento para Petshops | Banho e tosa fora do DAS",
    meta_description:
      "O banho e tosa do parceiro não é sua receita. A SplitTech administra a divisão antes do DAS incidir — você tributa só a sua margem real.",
    keywords: [
      "split pagamento petshop",
      "reduzir imposto petshop simples nacional",
      "maquininha petshop groomer",
    ],
  },
  {
    slug: "oficina",
    name: "Oficinas Mecânicas",
    headline: "Oficinas: as peças repassadas não são sua receita tributável.",
    pain:
      "As peças que você repassa ao cliente entram como sua receita.",
    third_party: "Fornecedores de peças e mecânicos parceiros",
    hook_question:
      "Quanto das peças que você repassa entrou no seu DAS?",
    example: {
      annual_revenue: 420000,
      repasse_percent: 55,
      repasse_value: 231000,
      tax_rate: 0.06,
      annual_savings: 13860,
      monthly_savings: 1155,
    },
    whatsapp_message:
      "Oi, vi o paguecomsplit.com.br e quero entender como tirar as peças repassadas da minha receita tributável.",
    meta_title:
      "Split de Pagamento para Oficinas Mecânicas | Peças fora da receita",
    meta_description:
      "As peças que você repassa não são sua receita. A SplitTech administra a divisão antes do DAS incidir — você tributa só a sua margem real.",
    keywords: [
      "split pagamento oficina mecanica",
      "reduzir imposto oficina simples nacional",
      "maquininha oficina mecanica",
    ],
  },
  {
    slug: "construcao",
    name: "Material de Construção",
    headline: "Construção: o serviço do empreiteiro fora do seu DAS.",
    pain: "O serviço do empreiteiro parceiro entra como sua receita.",
    third_party: "Empreiteiros e mão de obra terceirizada",
    hook_question:
      "Quanto do serviço do empreiteiro entrou no seu DAS este ano?",
    example: {
      annual_revenue: 720000,
      repasse_percent: 45,
      repasse_value: 324000,
      tax_rate: 0.06,
      annual_savings: 19440,
      monthly_savings: 1620,
    },
    whatsapp_message:
      "Oi, vi o paguecomsplit.com.br e quero entender como tirar o empreiteiro parceiro do meu DAS.",
    meta_title:
      "Split de Pagamento para Material de Construção | Empreiteiro fora do DAS",
    meta_description:
      "O empreiteiro parceiro tributa o trabalho dele. A SplitTech administra a divisão antes do DAS incidir — você tributa só a sua margem real.",
    keywords: [
      "split pagamento construcao",
      "reduzir imposto material construcao simples nacional",
    ],
  },
];

export function getSegmentBySlug(slug: string): Segment | undefined {
  return segments.find((s) => s.slug === slug);
}

export const SIMPLES_TAX_RATES = [
  { label: "Anexo III — 6%", value: 0.06 },
  { label: "Anexo III — 11,2%", value: 0.112 },
  { label: "Anexo V — 14,3%", value: 0.143 },
  { label: "Anexo V — 19,5%", value: 0.195 },
  { label: "Anexo V — 30%", value: 0.30 },
] as const;

export const REVENUE_RANGES = [
  { label: "Até R$ 20 mil/mês", value: "<20k" },
  { label: "R$ 20 mil a R$ 50 mil/mês", value: "20-50k" },
  { label: "R$ 50 mil a R$ 100 mil/mês", value: "50-100k" },
  { label: "R$ 100 mil a R$ 200 mil/mês", value: "100-200k" },
  { label: "Acima de R$ 200 mil/mês", value: ">200k" },
] as const;
