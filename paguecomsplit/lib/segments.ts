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
    headline: "Restaurante, pague com split.",
    pain: "Você está pagando imposto sobre a gorjeta do seu garçom.",
    third_party: "Gorjeta dos garçons (10%)",
    hook_question:
      "Você sabia que a gorjeta do garçom aumenta seu faturamento tributável no Simples?",
    example: {
      annual_revenue: 480000,
      repasse_percent: 10,
      repasse_value: 48000,
      tax_rate: 0.06,
      annual_savings: 2880,
      monthly_savings: 240,
    },
    whatsapp_message:
      "Olá! Vi o site paguecomsplit.com.br e quero saber como reduzir imposto no meu restaurante.",
    meta_title:
      "Split de Pagamento para Restaurantes | Reduza Impostos no Simples Nacional",
    meta_description:
      "Pare de pagar imposto sobre a gorjeta dos seus garçons. Conheça o split de pagamento da SplitTech e economize no Simples Nacional.",
    keywords: [
      "split pagamento restaurante",
      "reduzir imposto restaurante simples nacional",
      "maquininha restaurante gorjeta",
    ],
  },
  {
    slug: "veterinaria",
    name: "Veterinárias",
    headline: "Veterinária, pague com split.",
    pain:
      "O honorário do veterinário parceiro está inflando seu faturamento tributável.",
    third_party: "Veterinários autônomos parceiros",
    hook_question:
      "Você tributa o honorário do veterinário que atende no seu espaço como se fosse sua receita?",
    example: {
      annual_revenue: 360000,
      repasse_percent: 55,
      repasse_value: 198000,
      tax_rate: 0.06,
      annual_savings: 11880,
      monthly_savings: 990,
    },
    whatsapp_message:
      "Olá! Vi o site paguecomsplit.com.br e quero saber como reduzir imposto na minha veterinária.",
    meta_title:
      "Split de Pagamento para Veterinárias | Reduza Impostos no Simples Nacional",
    meta_description:
      "Pare de pagar imposto sobre os honorários dos veterinários parceiros. Split de pagamento SplitTech para clínicas veterinárias.",
    keywords: [
      "split pagamento veterinaria",
      "reduzir imposto clinica veterinaria",
      "maquininha veterinaria simples nacional",
    ],
  },
  {
    slug: "estetica",
    name: "Clínicas de Estética",
    headline: "Clínica de estética, pague com split.",
    pain:
      "Cada profissional parceira que trabalha com você eleva seu DAS indevidamente.",
    third_party:
      "Profissionais parceiros (nail, lash, design de sobrancelha, etc.)",
    hook_question:
      "Cada profissional que trabalha no seu espaço está custando imposto a mais no seu DAS?",
    example: {
      annual_revenue: 330000,
      repasse_percent: 60,
      repasse_value: 198000,
      tax_rate: 0.143,
      annual_savings: 28300,
      monthly_savings: 2358,
    },
    whatsapp_message:
      "Olá! Vi o site paguecomsplit.com.br e quero saber como reduzir imposto na minha clínica de estética.",
    meta_title:
      "Split de Pagamento para Clínicas de Estética | Reduza Impostos no Simples",
    meta_description:
      "Pare de pagar imposto sobre o faturamento das suas profissionais parceiras. Split de pagamento SplitTech para estética.",
    keywords: [
      "split pagamento estetica",
      "reduzir imposto clinica estetica",
      "maquininha estetica simples nacional",
    ],
  },
  {
    slug: "odontologia",
    name: "Odontologia",
    headline: "Odontologia, pague com split.",
    pain:
      "O trabalho do protético e dos especialistas terceirizados está no seu DAS.",
    third_party: "Especialistas terceirizados e laboratórios protéticos",
    hook_question:
      "Você paga imposto sobre o valor do trabalho protético como se fosse sua receita?",
    example: {
      annual_revenue: 600000,
      repasse_percent: 40,
      repasse_value: 240000,
      tax_rate: 0.06,
      annual_savings: 14400,
      monthly_savings: 1200,
    },
    whatsapp_message:
      "Olá! Vi o site paguecomsplit.com.br e quero saber como reduzir imposto no meu consultório odontológico.",
    meta_title:
      "Split de Pagamento para Odontologia | Reduza Impostos no Simples Nacional",
    meta_description:
      "Pare de tributar o trabalho do protético e especialistas terceirizados. Split de pagamento SplitTech para clínicas odontológicas.",
    keywords: [
      "split pagamento odontologia",
      "reduzir imposto consultorio dentista",
      "maquininha odontologia simples nacional",
    ],
  },
  {
    slug: "petshop",
    name: "Petshops",
    headline: "Petshop, pague com split.",
    pain:
      "O banho e tosa do parceiro está inflando seu faturamento tributável.",
    third_party: "Groomers e veterinários parceiros",
    hook_question:
      "O serviço do groomer parceiro aumenta seu faturamento tributável no Simples?",
    example: {
      annual_revenue: 240000,
      repasse_percent: 50,
      repasse_value: 120000,
      tax_rate: 0.06,
      annual_savings: 7200,
      monthly_savings: 600,
    },
    whatsapp_message:
      "Olá! Vi o site paguecomsplit.com.br e quero saber como reduzir imposto no meu petshop.",
    meta_title:
      "Split de Pagamento para Petshops | Reduza Impostos no Simples Nacional",
    meta_description:
      "Pare de pagar imposto sobre o serviço dos seus parceiros de banho e tosa. Split de pagamento SplitTech para petshops.",
    keywords: [
      "split pagamento petshop",
      "reduzir imposto petshop simples nacional",
      "maquininha petshop groomer",
    ],
  },
  {
    slug: "oficina",
    name: "Oficinas Mecânicas",
    headline: "Oficina mecânica, pague com split.",
    pain:
      "As peças que você repassa ao cliente estão no seu faturamento tributável.",
    third_party: "Fornecedores de peças e mecânicos parceiros",
    hook_question:
      "Você tributa as peças que repassa para o cliente como se fossem sua receita de serviço?",
    example: {
      annual_revenue: 420000,
      repasse_percent: 55,
      repasse_value: 231000,
      tax_rate: 0.06,
      annual_savings: 13860,
      monthly_savings: 1155,
    },
    whatsapp_message:
      "Olá! Vi o site paguecomsplit.com.br e quero saber como reduzir imposto na minha oficina mecânica.",
    meta_title:
      "Split de Pagamento para Oficinas Mecânicas | Reduza Impostos no Simples",
    meta_description:
      "Pare de tributar as peças repassadas ao cliente. Split de pagamento SplitTech para oficinas mecânicas.",
    keywords: [
      "split pagamento oficina mecanica",
      "reduzir imposto oficina simples nacional",
      "maquininha oficina mecanica",
    ],
  },
  {
    slug: "construcao",
    name: "Material de Construção",
    headline: "Construção, pague com split.",
    pain: "O serviço do empreiteiro parceiro está entrando como sua receita.",
    third_party: "Empreiteiros e mão de obra terceirizada",
    hook_question:
      "O serviço do empreiteiro que você indica entra como receita sua no Simples?",
    example: {
      annual_revenue: 720000,
      repasse_percent: 45,
      repasse_value: 324000,
      tax_rate: 0.06,
      annual_savings: 19440,
      monthly_savings: 1620,
    },
    whatsapp_message:
      "Olá! Vi o site paguecomsplit.com.br e quero saber como reduzir imposto no meu negócio de material de construção.",
    meta_title:
      "Split de Pagamento para Material de Construção | Reduza Impostos no Simples",
    meta_description:
      "Pare de tributar mão de obra terceirizada como receita própria. Split de pagamento SplitTech para material de construção.",
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
