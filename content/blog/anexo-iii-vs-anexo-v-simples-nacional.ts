import type { BlogPost } from "@/lib/blog";

export const post: BlogPost = {
  slug: "anexo-iii-vs-anexo-v-simples-nacional",
  title: "Anexo III vs Anexo V no Simples Nacional: qual é o seu e por quê importa",
  description:
    "O Anexo do Simples define sua alíquota — e a diferença entre III (6%) e V (14,3%) pode ser R$ 28.000/ano a mais ou a menos de DAS. Entenda qual se aplica ao seu negócio.",
  publishedAt: "2025-07-08",
  author: "SplitTech",
  category: "Tributação",
  keywords: [
    "anexo III simples nacional",
    "anexo V simples nacional",
    "qual anexo simples nacional",
    "aliquota simples nacional servicos",
    "diferenca anexo III V simples",
  ],
  sections: [
    {
      type: "p",
      text: "O Simples Nacional tem 5 Anexos. Dependendo da atividade da sua empresa, você cai em um deles — e a diferença de alíquota entre o Anexo III e o Anexo V pode ser de 6% para 14,3% na mesma faixa de faturamento. Isso é mais que o dobro de DAS.",
    },
    {
      type: "h2",
      text: "Quais negócios se enquadram no Anexo III?",
    },
    {
      type: "p",
      text: "O Anexo III cobre serviços com menor alíquota. Entre os segmentos que costumam se enquadrar aqui:",
    },
    {
      type: "ul",
      items: [
        "Academias e atividades de educação física",
        "Agências de viagens e turismo",
        "Escolas de idiomas e cursos livres",
        "Agências de notícias",
        "Instalação, manutenção e reparação de equipamentos (algumas CNAEs)",
        "Restaurantes e serviços de alimentação (dependendo da CNAE)",
      ],
    },
    {
      type: "h2",
      text: "Quais negócios se enquadram no Anexo V?",
    },
    {
      type: "p",
      text: "O Anexo V tem alíquotas mais altas e abrange serviços intelectuais e especializados:",
    },
    {
      type: "ul",
      items: [
        "Medicina e saúde em geral (clínicas, consultórios)",
        "Estética e cuidados pessoais especializados",
        "Engenharia, arquitetura e tecnologia da informação",
        "Contabilidade e auditoria",
        "Odontologia",
        "Veterinária",
      ],
    },
    {
      type: "h2",
      text: "Por que a diferença é tão grande?",
    },
    {
      type: "p",
      text: "O Simples Nacional diferencia os Anexos porque considera o 'fator R' — a relação entre a folha de salários e o faturamento da empresa. Empresas com folha alta em relação ao faturamento podem migrar do Anexo V para o III. Se o seu faturamento tem muito de parceiros externos (não empregados), o fator R pode ser desfavorável.",
    },
    {
      type: "callout",
      text: "Se você está no Anexo V e tem parceiros autônomos, cada ponto percentual de alíquota que você paga sobre a receita deles é dinheiro desperdiçado.",
    },
    {
      type: "h2",
      text: "Tabela comparativa — 1ª faixa (até R$ 180k/ano)",
    },
    {
      type: "ul",
      items: [
        "Anexo I (comércio): 4%",
        "Anexo II (indústria): 4,5%",
        "Anexo III (serviços 1): 6%",
        "Anexo IV (construção/limpeza): 4,5%",
        "Anexo V (serviços 2): 15,5% (com dedução parcial, alíquota efetiva a partir de ~14,3%)",
      ],
    },
    {
      type: "h2",
      text: "A relação com o split de pagamento",
    },
    {
      type: "p",
      text: "Quanto maior a alíquota do seu Anexo, mais caro é tributar a receita do parceiro. Para empresas no Anexo V, reduzir a base de cálculo via split tem impacto mais que proporcional — exatamente porque a alíquota é alta.",
    },
    {
      type: "p",
      text: "Uma clínica de estética no Anexo V — 14,3% — que repassa 60% do faturamento para profissionais parceiras economiza quase R$ 28.000/ano ao tirar esses R$ 198.000 anuais da base do DAS. Uma operação equivalente no Anexo III economizaria R$ 11.880 (6% sobre os mesmos R$ 198k).",
    },
    {
      type: "h2",
      text: "Como confirmar seu Anexo",
    },
    {
      type: "ol",
      items: [
        "Acesse o Portal do Simples Nacional (simei.receita.fazenda.gov.br)",
        "Consulte a CNAE principal da sua empresa",
        "Verifique em qual Anexo essa CNAE se enquadra (tabelas na LC 123/2006)",
        "Calcule o fator R: folha de salários ÷ faturamento bruto — se > 28%, pode se qualificar para o Anexo III mesmo com CNAE do V",
        "Consulte seu contador para confirmar",
      ],
    },
    {
      type: "cta",
      label: "Quero calcular minha economia real",
      message:
        "Oi, li o artigo sobre Anexo III vs V no Simples Nacional e quero entender qual é o meu e quanto posso economizar com split.",
    },
  ],
};
