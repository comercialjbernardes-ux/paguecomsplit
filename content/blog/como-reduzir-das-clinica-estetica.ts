import type { BlogPost } from "@/lib/blog";

export const post: BlogPost = {
  slug: "como-reduzir-das-clinica-estetica",
  title: "Como reduzir o DAS de clínica de estética com split de pagamento",
  description:
    "Clínicas com profissionais parceiras pagam DAS sobre a receita delas. Veja como o split elimina essa bitributação e qual é a economia real para o seu CNPJ.",
  publishedAt: "2025-06-24",
  author: "SplitTech",
  category: "Segmento",
  keywords: [
    "reduzir DAS clinica estetica",
    "split pagamento estetica simples nacional",
    "imposto clinica estetica parceiras",
    "como reduzir imposto clinica estetica",
  ],
  sections: [
    {
      type: "p",
      text: "Se a sua clínica de estética tem nail designers, lash techs, designers de sobrancelha ou qualquer profissional autônoma operando no espaço, você está pagando DAS sobre a receita delas. Cada profissional parceira eleva seu DAS indevidamente.",
    },
    {
      type: "p",
      text: "A lógica é a seguinte: o cliente paga R$ 300 no cartão. R$ 180 são da profissional parceira. Sem split, tudo entra no seu caixa, o Simples vê R$ 300 como sua receita, e você tributa os R$ 180 que não são seus.",
    },
    {
      type: "h2",
      text: "Quanto custa em DAS por parceira?",
    },
    {
      type: "p",
      text: "Depende do Anexo da sua clínica. Clínicas de estética costumam se enquadrar no Anexo III (6% na 1ª faixa) ou Anexo V (14,3% em diante). Com o exemplo abaixo, veja a diferença:",
    },
    {
      type: "ul",
      items: [
        "Faturamento bruto mensal: R$ 27.500 (incluindo as parceiras)",
        "Parcela que pertence às profissionais parceiras: 60% = R$ 16.500",
        "Alíquota Anexo V — 14,3%",
        "DAS indevido por mês: R$ 16.500 × 14,3% = R$ 2.358",
        "DAS indevido por ano: R$ 28.300",
      ],
    },
    {
      type: "callout",
      text: "R$ 28.300/ano é dinheiro que foi para a Receita Federal sendo que a receita não era sua. Com o split certo, esse valor fica na clínica.",
    },
    {
      type: "h2",
      text: "O que muda com o split de pagamento",
    },
    {
      type: "p",
      text: "Não seja mais tributado pela receita do parceiro. Quando a divisão é gerida na origem da transação, cada profissional parceira recebe a parte dela diretamente — antes do pagamento entrar no caixa da clínica.",
    },
    {
      type: "p",
      text: "A clínica passa a tributar apenas a sua margem real — o espaço, a gestão, os serviços que são dela. As parceiras tributam o trabalho delas. Cada uma tributa o que é seu.",
    },
    {
      type: "h2",
      text: "O que muda na operação?",
    },
    {
      type: "p",
      text: "Praticamente nada. O cliente continua pagando no cartão, na mesma maquininha. A diferença é que a infraestrutura SplitTech (via Cappta, regulada BACEN) já separa o pagamento na origem.",
    },
    {
      type: "ul",
      items: [
        "Mesma maquininha, mesma experiência de pagamento para o cliente",
        "Sem planilha no final do mês: repasses geridos na origem",
        "Sem mensalidade da plataforma",
        "Diagnóstico gratuito em 15 minutos com seus números reais",
      ],
    },
    {
      type: "h2",
      text: "Precisa de contratos?",
    },
    {
      type: "p",
      text: "Sim. O split pressupõe que a relação com cada profissional parceira esteja formalizada — contrato de parceria ou locação de espaço. Isso é necessário tanto para a operação quanto para o respaldo jurídico.",
    },
    {
      type: "h2",
      text: "Como saber se a sua clínica se qualifica?",
    },
    {
      type: "p",
      text: "O critério central: você tem parceiras autônomas que atendem clientes no seu espaço? Se sim, há uma boa chance de a economia ser relevante. Use o simulador para um cálculo estimado, ou peça um diagnóstico com seus dados reais.",
    },
    {
      type: "cta",
      label: "Quero o diagnóstico da minha clínica",
      message:
        "Oi, li o artigo sobre reduzir DAS de clínica de estética e quero entender a economia para a minha clínica.",
    },
  ],
};
