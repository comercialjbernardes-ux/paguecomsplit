const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://paguecomsplit.com.br";

const ORG_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${SITE_URL}/#organization`,
  name: "SplitTech",
  alternateName: "paguecomsplit",
  url: SITE_URL,
  logo: `${SITE_URL}/og-default.png`,
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
    </>
  );
}
