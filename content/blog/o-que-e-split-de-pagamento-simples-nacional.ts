import type { BlogPost } from "@/lib/blog";

export const post: BlogPost = {
  slug: "o-que-e-split-de-pagamento-simples-nacional",
  title: "O que é split de pagamento no Simples Nacional?",
  description:
    "Split de pagamento divide a transação na origem — antes do dinheiro virar receita tributável. Entenda como funciona e por que isso reduz o DAS de quem tem parceiros.",
  publishedAt: "2025-06-10",
  author: "SplitTech",
  category: "Conceito",
  keywords: [
    "split de pagamento simples nacional",
    "o que é split pagamento",
    "split pagamento como funciona",
    "dividir pagamento antes das impostos",
  ],
  sections: [
    {
      type: "p",
      text: "Se você tem um negócio no Simples Nacional e repassa parte do que recebe a um parceiro — um garçom, uma profissional autônoma, um empreiteiro — existe uma boa chance de estar pagando DAS sobre dinheiro que não é seu.",
    },
    {
      type: "p",
      text: "O split de pagamento resolve isso na origem. Em vez de receber o valor total e depois transferir a parte do parceiro, a divisão acontece antes do pagamento entrar na sua conta — e, portanto, antes de virar receita tributável para você.",
    },
    {
      type: "h2",
      text: "Como funciona tecnicamente",
    },
    {
      type: "p",
      text: "Quando o cliente passa o cartão na maquininha, o sistema de adquirência já sabe que aquele pagamento de, digamos, R$ 1.000 deve ser dividido: R$ 600 para o estabelecimento e R$ 400 para o parceiro. Cada parte segue para a conta de destino respectiva.",
    },
    {
      type: "p",
      text: "Cada parte é separada antes de gerar imposto. Isso é tecnicamente possível porque a infraestrutura de adquirência (no caso da SplitTech, via Cappta) suporta múltiplos beneficiários por transação — algo regulado pelo Banco Central.",
    },
    {
      type: "h2",
      text: "Por que isso importa para o Simples Nacional?",
    },
    {
      type: "p",
      text: "No Simples Nacional, o DAS é calculado sobre o faturamento bruto. Se você recebe R$ 100k/mês mas R$ 60k são repasses a parceiros, você deveria tributar R$ 40k — não R$ 100k. Sem split, você tributa o bruto e depois repassa. Com split, você tributa só o que é seu.",
    },
    {
      type: "callout",
      text: "Não seja mais tributado pela receita do parceiro. O dinheiro que nunca foi seu não deveria gerar imposto para você.",
    },
    {
      type: "h2",
      text: "Quem se beneficia?",
    },
    {
      type: "ul",
      items: [
        "Restaurantes que repassam a gorjeta dos garçons (10% do faturamento)",
        "Clínicas de estética com profissionais parceiras (nail, lash, designer de sobrancelha)",
        "Clínicas veterinárias com veterinários autônomos",
        "Oficinas mecânicas que repassam o custo das peças",
        "Lojas de material de construção com empreiteiros terceirizados",
        "Consultórios odontológicos com protéticos e especialistas",
        "Petshops com groomers parceiros",
      ],
    },
    {
      type: "h2",
      text: "Isso é legal?",
    },
    {
      type: "p",
      text: "Sim. O split de pagamento é prática padrão do mercado de adquirência, regulado pelo Banco Central. A SplitTech opera sobre infraestrutura Cappta (mais de 14 anos de mercado, mais de R$ 7 bilhões por ano processados). O parecer jurídico do escritório Barcellos Tucunduva valida a tese tributária.",
    },
    {
      type: "p",
      text: "O ponto central é simples: o dinheiro que pertence ao parceiro nunca foi seu. A divisão na origem apenas deixa os números espelharem a realidade econômica da operação.",
    },
    {
      type: "h2",
      text: "Como simular a economia",
    },
    {
      type: "p",
      text: "Use o simulador na home de paguecomsplit.com.br: escolha seu segmento, informe o faturamento mensal e o percentual que vai para parceiros. O resultado mostra a economia estimada com base nas alíquotas reais do seu Anexo do Simples.",
    },
    {
      type: "cta",
      label: "Quero calcular minha economia",
      message:
        "Oi, li o artigo sobre split de pagamento no Simples Nacional e quero calcular a economia para o meu CNPJ.",
    },
  ],
};
