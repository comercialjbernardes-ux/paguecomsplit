import type { BlogPost } from "@/lib/blog";

export const post: BlogPost = {
  slug: "bitributacao-simples-nacional-como-evitar",
  title: "Bitributação no Simples Nacional: o que é e como evitar",
  description:
    "Negócios com parceiros pagam DAS sobre a receita do parceiro e o parceiro também paga — dois impostos sobre o mesmo R$. Entenda a bitributação silenciosa e como o split resolve.",
  publishedAt: "2025-06-17",
  author: "SplitTech",
  category: "Tributação",
  keywords: [
    "bitributacao simples nacional",
    "como evitar bitributacao",
    "DAS sobre repasse parceiro",
    "tributacao indevida simples nacional",
  ],
  sections: [
    {
      type: "p",
      text: "Bitributação é quando o mesmo valor econômico gera imposto duas vezes. No Simples Nacional, ela acontece toda vez que você recebe um pagamento pelo cliente, tributa o valor bruto no DAS, e depois repassa parte para um parceiro — que também paga imposto sobre a parte dele.",
    },
    {
      type: "p",
      text: "O mesmo R$ 400 gerou DAS para você e DAS para o parceiro. Isso é bitributação.",
    },
    {
      type: "h2",
      text: "Por que isso acontece no Simples Nacional?",
    },
    {
      type: "p",
      text: "O Simples Nacional calcula o DAS sobre o faturamento bruto — tudo que entra na conta da empresa. Se você fatura R$ 50k/mês mas R$ 30k são repasses a parceiros, o sistema tributário ainda vê R$ 50k como base de cálculo, a não ser que você tome providências ativas.",
    },
    {
      type: "p",
      text: "Sem gestão ativa, o repasse acontece depois do faturamento já ter sido registrado. O imposto incidiu antes da transferência. Você pagou DAS sobre o dinheiro do parceiro.",
    },
    {
      type: "h2",
      text: "Quão silenciosa é essa bitributação?",
    },
    {
      type: "p",
      text: "A maioria dos donos de negócio não percebe porque o extrato bancário mostra apenas o valor bruto recebido. A partição entre 'o que é meu' e 'o que é do parceiro' não aparece automaticamente em nenhum relatório do Simples.",
    },
    {
      type: "ul",
      items: [
        "Restaurante com 40 funcionários recebendo gorjeta: R$ 2.400–R$ 4.000/mês de DAS indevido por ano",
        "Clínica de estética com 5 profissionais parceiras: até R$ 28.000/ano de DAS sobre receita que não é da clínica",
        "Oficina com R$ 420k de faturamento e 55% em peças: R$ 13.860/ano tributados indevidamente",
      ],
    },
    {
      type: "h2",
      text: "Como o split de pagamento resolve",
    },
    {
      type: "p",
      text: "Evite bitributação gerindo a divisão antes do DAS incidir. Com split, quando o cliente paga, cada parte da transação já segue para o dono dela — antes do pagamento entrar no seu caixa e virar receita tributável.",
    },
    {
      type: "p",
      text: "Cada parte é separada antes de gerar imposto. Isso significa que a base de cálculo do seu DAS reflete só o que efetivamente é sua receita. O parceiro tributa o dele; você tributa o seu.",
    },
    {
      type: "callout",
      text: "A diferença entre bitributação e split não é contábil — é estrutural. A solução acontece na origem da transação, não no final do mês.",
    },
    {
      type: "h2",
      text: "O que você precisa para usar split",
    },
    {
      type: "ol",
      items: [
        "Ter parceiros identificáveis (profissionais autônomos, fornecedores recorrentes, empreiteiros)",
        "Ter contratos formais com esses parceiros",
        "Trocar para uma maquininha com infraestrutura de split (como a SplitTech via Cappta)",
        "Fazer o diagnóstico com seus números reais para confirmar a economia",
      ],
    },
    {
      type: "h2",
      text: "Resposta jurídica: é possível?",
    },
    {
      type: "p",
      text: "Sim. O parecer do escritório Barcellos Tucunduva valida a tese: quando a divisão ocorre na origem da transação e os contratos estão formalizados, a parte do parceiro não compõe a receita tributável do estabelecimento.",
    },
    {
      type: "cta",
      label: "Quero um diagnóstico gratuito",
      message:
        "Oi, li o artigo sobre bitributação no Simples Nacional e quero entender quanto estou pagando de DAS indevido.",
    },
  ],
};
