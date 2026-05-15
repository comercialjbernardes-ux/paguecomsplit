import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { segments, getSegmentBySlug, type Segment } from "@/lib/segments";
import { NavBar } from "@/components/NavBar";
import { Footer } from "@/components/Footer";
import { SegmentHero } from "@/components/sections/SegmentHero";
import { ProblemSection } from "@/components/sections/ProblemSection";
import { CofreDigitalSection } from "@/components/sections/CofreDigitalSection";
import { StepByStep } from "@/components/sections/StepByStep";
import { DifferentialsGrid } from "@/components/sections/DifferentialsGrid";
import { TestimonialBlock } from "@/components/sections/TestimonialBlock";
import { EconomySimulator } from "@/components/EconomySimulator";
import { LeadForm } from "@/components/LeadForm";
import { TrustBadges } from "@/components/TrustBadges";
import { CTAWhatsApp } from "@/components/CTAWhatsApp";
import { SegmentGrid } from "@/components/SegmentGrid";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://paguecomsplit.com.br";

type Params = { segmento: string };

export function generateStaticParams(): Params[] {
  return segments.map((s) => ({ segmento: s.slug }));
}

export function generateMetadata({
  params,
}: {
  params: Params;
}): Metadata {
  const segment = getSegmentBySlug(params.segmento);
  if (!segment) return {};
  const url = `${SITE_URL}/${segment.slug}`;
  return {
    title: segment.meta_title,
    description: segment.meta_description,
    keywords: segment.keywords,
    alternates: { canonical: url },
    openGraph: {
      title: segment.meta_title,
      description: segment.meta_description,
      url,
      type: "website",
      locale: "pt_BR",
    },
    twitter: {
      card: "summary_large_image",
      title: segment.meta_title,
      description: segment.meta_description,
    },
  };
}

export default function SegmentPage({ params }: { params: Params }) {
  const segment = getSegmentBySlug(params.segmento);
  if (!segment) notFound();

  return (
    <>
      <SegmentJsonLd segment={segment} />
      <NavBar />
      <main>
        {/* Breadcrumb */}
        <nav
          aria-label="Breadcrumb"
          className="container-page pt-4 pb-0"
        >
          <ol className="flex items-center gap-1.5 text-xs text-muted">
            <li>
              <a href="/" className="hover:text-primary-600 transition-colors">
                paguecomsplit.com.br
              </a>
            </li>
            <li aria-hidden className="text-muted/40">/</li>
            <li>
              <span className="font-semibold text-primary-600">{segment.name}</span>
            </li>
          </ol>
        </nav>

        {/* 1. Hero */}
        <SegmentHero segment={segment} />

        {/* 2. Problema */}
        <ProblemSection segment={segment} />

        {/* 3. Simulador */}
        <section id="simulador" className="bg-white border-y border-slate-100">
          <div className="container-page py-14 md:py-20">
            <div className="max-w-2xl mx-auto text-center mb-12">
              <p className="text-xs font-bold uppercase tracking-[.2em] text-accent-600 mb-3">
                Simulador
              </p>
              <h2 className="font-display text-3xl md:text-5xl font-bold text-primary-600 mb-4 text-balance leading-[1.05]">
                Quanto você poderia economizar por mês?
              </h2>
              <p className="text-lg text-muted text-pretty">
                Já carregamos os valores típicos de{" "}
                {segment.name.toLowerCase()}. Você só ajusta o seu faturamento
                e vê o resultado.
              </p>
            </div>
            <EconomySimulator
              defaults={segment.example}
              segmentName={segment.name}
              defaultSegmentSlug={segment.slug}
              whatsappMessage={segment.whatsapp_message}
            />
          </div>
        </section>

        {/* 4. Cofre Digital */}
        <CofreDigitalSection
          example={segment.example}
          thirdParty={segment.third_party}
        />

        {/* 5. Passo a passo */}
        <StepByStep />

        {/* 6. Diferenciais */}
        <DifferentialsGrid />

        {/* 7. Prova social — somente se houver depoimento */}
        {segment.testimonial ? (
          <TestimonialBlock testimonial={segment.testimonial} />
        ) : null}

        {/* 8. Credibilidade */}
        <TrustBadges />

        {/* 9. Formulario de captura */}
        <section className="bg-bg">
          <div className="container-page py-14 md:py-20">
            <div className="grid gap-10 lg:grid-cols-5 items-start">
              <div className="lg:col-span-2">
                <p className="text-xs font-bold uppercase tracking-[.2em] text-accent-600 mb-3">
                  Falar com um especialista
                </p>
                <h2 className="font-display text-3xl md:text-4xl font-bold text-primary-600 mb-4 text-balance leading-[1.05]">
                  Não seja mais tributado pela receita do parceiro.
                </h2>
                <p className="text-text/70 leading-relaxed mb-6 text-pretty">
                  Preencha ao lado ou chame direto no WhatsApp. A gente refaz
                  o cálculo com a sua folha real e o seu Anexo correto — sem
                  custo, sem compromisso.
                </p>
                <CTAWhatsApp
                  message={segment.whatsapp_message}
                  label="Quero falar com especialista"
                  size="lg"
                />
              </div>
              <div className="lg:col-span-3">
                <LeadForm defaultSegment={segment.slug} />
              </div>
            </div>
          </div>
        </section>

        {/* Outros segmentos */}
        <section className="container-page py-14 md:py-20">
          <div className="max-w-2xl mx-auto text-center mb-10">
            <p className="text-xs font-bold uppercase tracking-[.2em] text-accent-600 mb-3">
              Outros segmentos
            </p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-primary-600 text-balance leading-[1.05]">
              O split também tira do DAS:
            </h2>
          </div>
          <SegmentGrid highlightSlug={segment.slug} />
        </section>
      </main>
      <Footer />
    </>
  );
}

function SegmentJsonLd({ segment }: { segment: Segment }) {
  const service = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: `Split de pagamento SplitTech para ${segment.name}`,
    serviceType: "Adquirência com split de pagamento",
    provider: {
      "@type": "Organization",
      name: "SplitTech",
      url: SITE_URL,
    },
    areaServed: "BR",
    description: segment.meta_description,
    audience: { "@type": "BusinessAudience", audienceType: segment.name },
  };

  const faq = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: `Como o split de pagamento ajuda ${segment.name.toLowerCase()}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: segment.pain +
            " Com o Cofre Digital, cada parte é separada antes de gerar imposto — a parte de " +
            segment.third_party.toLowerCase() +
            " vai direto para o dono dela e você tributa só a sua margem real.",
        },
      },
      {
        "@type": "Question",
        name: "Isso é legal? Tem amparo jurídico?",
        acceptedAnswer: {
          "@type": "Answer",
          text:
            "Sim. A operação tem parecer da Barcellos Tucunduva Advogados, opera sobre infraestrutura Cappta (14+ anos) e é regulada pelo Banco Central do Brasil.",
        },
      },
      {
        "@type": "Question",
        name: "Quanto eu posso economizar?",
        acceptedAnswer: {
          "@type": "Answer",
          text:
            "Depende do seu % de repasse e da sua alíquota no Simples. No exemplo calibrado para o seu segmento, a economia anual estimada é de " +
            new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(
              segment.example.annual_savings
            ) + ".",
        },
      },
    ],
  };

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      {
        "@type": "ListItem",
        position: 2,
        name: segment.name,
        item: `${SITE_URL}/${segment.slug}`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(service) }}
      />
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faq) }}
      />
    </>
  );
}
