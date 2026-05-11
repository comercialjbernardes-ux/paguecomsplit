const ORG_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "SplitTech — paguecomsplit.com.br",
  url: "https://paguecomsplit.com.br",
  logo: "https://paguecomsplit.com.br/og-default.png",
  description:
    "Solução de maquininha com split de pagamento que reduz a tributação de negócios no Simples Nacional ao separar automaticamente o repasse a terceiros antes da incidência de impostos.",
  sameAs: [],
  contactPoint: [
    {
      "@type": "ContactPoint",
      contactType: "sales",
      areaServed: "BR",
      availableLanguage: ["Portuguese"],
    },
  ],
};

export function OrganizationJsonLd() {
  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(ORG_JSON_LD) }}
    />
  );
}
