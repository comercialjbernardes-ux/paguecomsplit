import type { BlogPost } from "@/lib/blog";

export const post: BlogPost = {
  slug: "imposto-gorjeta-restaurante-simples",
  title: "Imposto sobre gorjeta em restaurante: quem paga e como evitar",
  description:
    "Restaurantes no Simples Nacional pagam DAS sobre a gorjeta dos garçons. Entenda por que isso acontece e como o split de pagamento resolve o problema na origem.",
  publishedAt: "2025-07-01",
  author: "SplitTech",
  category: "Segmento",
  keywords: [
    "imposto gorjeta restaurante simples nacional",
    "DAS sobre gorjeta garcom",
    "split pagamento restaurante gorjeta",
    "reduzir imposto restaurante simples",
  ],
  sections: [
    {
      type: "p",
      text: "Você está pagando imposto sobre a gorjeta do seu garçom. Todo restaurante no Simples Nacional com gorjeta embutida ou sugerida enfrenta o mesmo problema: o valor da gorjeta entra na nota, entra no faturamento bruto e vira base de cálculo do DAS.",
    },
    {
      type: "p",
      text: "O garçom recebe os 10% — e você pagou DAS sobre eles antes de repassar.",
    },
    {
      type: "h2",
      text: "Por que a gorjeta entra no seu DAS?",
    },
    {
      type: "p",
      text: "No Brasil, a gorjeta pode ser incluída na nota fiscal (gorjeta compulsória) ou gerida fora dela (gorjeta espontânea). Em ambos os casos, se o valor passa pela conta da empresa antes de chegar ao garçom, o Simples Nacional tende a tributar o bruto.",
    },
    {
      type: "p",
      text: "A decisão do STF de 2017 (RE 565.160) isentou a gorjeta do IRPJ/CSLL para empresas no lucro real/presumido, mas o Simples Nacional tem mecânica diferente — o DAS incide sobre o faturamento bruto, e a gorjeta compõe esse faturamento enquanto não houver separação na origem.",
    },
    {
      type: "h2",
      text: "Quanto isso representa em DAS por ano?",
    },
    {
      type: "p",
      text: "Veja um exemplo real:",
    },
    {
      type: "ul",
      items: [
        "Faturamento bruto mensal: R$ 40.000",
        "Gorjeta dos garçons (10%): R$ 4.000/mês",
        "Alíquota Simples (Anexo III, 6%): R$ 4.000 × 6% = R$ 240/mês",
        "DAS indevido por ano: R$ 2.880",
      ],
    },
    {
      type: "p",
      text: "Para um restaurante com faturamento de R$ 100k/mês, a conta dobra: quase R$ 6.000 ao ano em DAS sobre gorjeta de garçons.",
    },
    {
      type: "h2",
      text: "Como o split resolve",
    },
    {
      type: "p",
      text: "Pare de pagar imposto sobre a gorjeta do seu garçom. Com split de pagamento, cada transação já é dividida na maquininha — a parte da gorjeta segue diretamente para o fundo dos garçons antes de entrar no caixa do restaurante.",
    },
    {
      type: "p",
      text: "Cada parte é separada antes de gerar imposto. O DAS do restaurante incide sobre a receita real do estabelecimento. A gorjeta é gerida como o que ela é: renda dos garçons, não receita do CNPJ.",
    },
    {
      type: "callout",
      text: "A gorjeta do garçom não é sua receita. Ela nunca deveria ter entrado na base do seu DAS.",
    },
    {
      type: "h2",
      text: "E se a gorjeta for espontânea (não incluída na nota)?",
    },
    {
      type: "p",
      text: "Gorjetas espontâneas pagas em dinheiro pelos clientes não passam pelo seu faturamento e portanto não geram DAS. O problema está nas gorjetas cobradas no cartão ou incluídas na nota fiscal — essas sim transitam pelo seu caixa e geram tributação.",
    },
    {
      type: "h2",
      text: "O que muda na operação do restaurante?",
    },
    {
      type: "ul",
      items: [
        "Mesma maquininha para o cliente — zero atrito no atendimento",
        "Divisão gerida automaticamente a cada transação",
        "Garçons recebem diretamente, sem planilha de final de mês",
        "Documentação adequada para o repasse (respaldo BACEN)",
      ],
    },
    {
      type: "cta",
      label: "Quero calcular a gorjeta fora do meu DAS",
      message:
        "Oi, li o artigo sobre imposto na gorjeta e quero entender como tirar a gorjeta dos garçons do meu DAS.",
    },
  ],
};
