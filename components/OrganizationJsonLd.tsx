const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://paguecomsplit.com.br";

const ORG_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${SITE_URL}/#organization`,
  name: "SplitTech",
  alternateName: "paguecomsplit",
  url: SITE_URL,
  logo: `${SITE_URL}/og-image.png`,
  description:
    "Maquininha com split de pagamento que reduz a tributação de negócios no Simples Nacional ao separar o repasse a terceiros antes da incidência do DAS. Infraestrutura Cappta, regulada pelo BACEN.",
  sameAs: [
    "https://www.instagram.com/paguecomsplit/",
    "https://www.linkedin.com/company/splittech-br/",
  ],
  contactPoint: [
    {
      "@type": "ContactPoint",
      contactType: "sales",
      areaServed: "BR",
      availableLanguage: ["Portuguese"],
    },
  ],
};

const WEBSITE_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${SITE_URL}/#website`,
  url: SITE_URL,
  name: "paguecomsplit",
  description:
    "Split de pagamento para PMEs do Simples Nacional. Você tributa só a sua margem real.",
  publisher: { "@id": `${SITE_URL}/#organization` },
  inLanguage: "pt-BR",
};

const SERVICE_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "Service",
  "@id": `${SITE_URL}/#service`,
  name: "Maquininha SplitTech com Cofre Digital",
  serviceType: "Adquirência com split de pagamento",
  provider: { "@id": `${SITE_URL}/#organization` },
  areaServed: { "@type": "Country", name: "Brasil" },
  audience: {
    "@type": "BusinessAudience",
    audienceType:
      "Pequenas e médias empresas optantes pelo Simples Nacional com repasse a parceiros",
  },
  description:
    "Maquininha de cartão que administra a divisão do pagamento na origem da transação — antes do DAS incidir. Cada parte vai para o dono dela, você tributa só a sua margem real.",
};

const FAQ_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "O que é split de pagamento?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Split de pagamento é a gestão da divisão do pagamento na origem da transação — antes do dinheiro virar receita tributável. Cada parte vai direto para o dono dela, e cada um tributa só o que é seu.",
      },
    },
    {
      "@type": "Question",
      name: "O que é bitributação no Simples Nacional?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Bitributação no Simples Nacional ocorre quando você recebe o pagamento do cliente, repassa parte a um parceiro, e ambos pagam DAS sobre o mesmo valor. Você paga sobre o faturamento bruto (incluindo o repasse), e o parceiro paga sobre o que recebeu de você.",
      },
    },
    {
      "@type": "Question",
      name: "Como funciona o Cofre Digital?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "O Cofre Digital recebe o pagamento, separa a parte do parceiro e deposita apenas a sua margem na sua conta — antes do pagamento virar receita tributável. A divisão é administrada na origem, eliminando a bitributação. Infraestrutura Cappta, regulada pelo Banco Central.",
      },
    },
    {
      "@type": "Question",
      name: "Quanto posso economizar no DAS?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "A economia depende do seu percentual de repasse e da sua faixa do Simples Nacional. No exemplo médio (faturamento R$ 45k/mês, 40% pertencendo a parceiros, Anexo III faixa 3), a economia anual passa de R$ 22 mil. Use o simulador em paguecomsplit.com.br para calcular o seu caso específico.",
      },
    },
    {
      "@type": "Question",
      name: "O split de pagamento é regulado pelo BACEN?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Sim. A operação roda sobre infraestrutura Cappta (mais de 14 anos de mercado, mais de R$ 7 bilhões processados por ano), regulada pelo Banco Central do Brasil. Há também parecer técnico-tributário do escritório Barcellos Tucunduva sobre a estrutura.",
      },
    },
  ],
};

const BREADCRUMB_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      name: "Home",
      item: SITE_URL,
    },
    {
      "@type": "ListItem",
      position: 2,
      name: "Como funciona",
      item: `${SITE_URL}/como-funciona`,
    },
    {
      "@type": "ListItem",
      position: 3,
      name: "Simulador de economia",
      item: `${SITE_URL}/#simulador`,
    },
  ],
};

export function OrganizationJsonLd() {
  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ORG_JSON_LD) }}
      />
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(WEBSITE_JSON_LD) }}
      />
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(SERVICE_JSON_LD) }}
      />
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_JSON_LD) }}
      />
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(BREADCRUMB_JSON_LD) }}
      />
    </>
  );
}
