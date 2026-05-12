import type { Metadata } from "next";
import Link from "next/link";
import { Vault, ArrowRight, ShieldCheck, Building2 } from "lucide-react";
import { NavBar } from "@/components/NavBar";
import { Footer } from "@/components/Footer";
import { StepByStep } from "@/components/sections/StepByStep";
import { TrustBadges } from "@/components/TrustBadges";
import { Button } from "@/components/ui/button";
import { CTAWhatsApp } from "@/components/CTAWhatsApp";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://paguecomsplit.com.br";

export const metadata: Metadata = {
  title: "Como funciona o Cofre Digital",
  description:
    "Cada parte é separada antes de gerar imposto. A SplitTech administra a divisão do pagamento antes do DAS incidir — você tributa só a sua margem real.",
  alternates: { canonical: `${SITE_URL}/como-funciona` },
  openGraph: {
    title: "Como funciona o Cofre Digital | paguecomsplit.com.br",
    description:
      "Split de pagamento, infraestrutura Cappta e parecer Barcellos Tucunduva — em linguagem direta, sem juridiquês.",
    url: `${SITE_URL}/como-funciona`,
    type: "article",
    locale: "pt_BR",
  },
};

const FAQS = [
  {
    q: "O split é regulamentado?",
    a: "Sim. A operação roda sobre infraestrutura Cappta (+14 anos, +R$ 7 bi/ano processados), regulada pelo Banco Central. Split é a prática padrão do mercado de adquirência para repasses a múltiplos beneficiários — não é gambiarra, é norma.",
  },
  {
    q: "Por que a parte do parceiro fica fora da minha receita tributável?",
    a: "Porque o valor que pertence ao parceiro nunca foi seu. Quando a divisão é gerida na origem da transação, o dinheiro do parceiro vai direto para a conta dele — antes de virar receita sua. Você passa a tributar só a sua margem real.",
  },
  {
    q: "Preciso de um contrato com o parceiro?",
    a: "Sim. O parecer pressupõe contratos formais com cada parceiro envolvido na divisão. Profissionais autônomos, fornecedores, empreiteiros — todos precisam estar contratados de forma que a parte que pertence a cada um seja identificável.",
  },
  {
    q: "Funciona com qualquer empresa no Simples Nacional?",
    a: "Funciona quando você tem repasses recorrentes a parceiros identificáveis. Restaurantes (gorjeta), clínicas (profissionais parceiros), oficinas (peças), construção (empreiteiros), etc. Se você não tem repasse, não há economia. Use o simulador para ver o seu caso.",
  },
  {
    q: "Posso ver o parecer jurídico completo?",
    a: "Sim. O resumo está no modal das landing pages. A versão integral é compartilhada pelo time comercial mediante solicitação no WhatsApp.",
  },
];

export default function ComoFuncionaPage() {
  return (
    <>
      <NavBar />
      <main>
        <section className="gradient-hero">
          <div className="container-page pt-14 pb-14 md:pt-20 md:pb-16">
            <p className="text-xs font-bold uppercase tracking-widest text-accent-600 mb-4">
              Como funciona
            </p>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-extrabold text-primary-600 leading-[1.05] tracking-tight max-w-3xl text-balance">
              Cada parte é separada antes de gerar imposto.
            </h1>
            <p className="mt-5 text-lg md:text-xl text-text/80 max-w-2xl text-pretty">
              Em 3 ideias: o problema, o fluxo, o amparo. Sem juridiquês.
            </p>
            <p className="mt-5 text-sm font-semibold text-primary-600/80">
              Cappta · +R$ 7 bi/ano processados · Regulado BACEN
            </p>
          </div>
        </section>

        <section className="container-page py-12 md:py-16">
          <div className="grid gap-6 md:grid-cols-3 max-w-5xl">
            <Card
              icon={<Vault className="h-7 w-7" aria-hidden />}
              title="O conceito"
              body="O Cofre Digital recebe o pagamento, separa a parte do parceiro, e só depois deposita a sua. A divisão é gerida na origem da transação."
            />
            <Card
              icon={<ShieldCheck className="h-7 w-7" aria-hidden />}
              title="A regulação"
              body="Infraestrutura Cappta, regulada pelo BACEN. A mesma base usada por adquirentes consolidados — split é a prática padrão do mercado de adquirência."
            />
            <Card
              icon={<Building2 className="h-7 w-7" aria-hidden />}
              title="A consequência"
              body="Você passa a tributar só a sua margem real. O dinheiro do seu parceiro nunca virou sua receita — e nunca entra no seu DAS."
            />
          </div>
        </section>

        <StepByStep />

        <section className="bg-white border-y border-slate-100">
          <div className="container-page py-12 md:py-16">
            <div className="max-w-3xl">
              <p className="text-xs font-bold uppercase tracking-widest text-accent-600 mb-3">
                Perguntas frequentes
              </p>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-primary-600 mb-8 text-balance">
                As dúvidas que sempre aparecem.
              </h2>
              <dl className="space-y-6">
                {FAQS.map((f) => (
                  <div
                    key={f.q}
                    className="rounded-xl border border-slate-100 bg-bg p-5 md:p-6"
                  >
                    <dt className="font-display text-lg font-bold text-primary-600 mb-2">
                      {f.q}
                    </dt>
                    <dd className="text-text/80 leading-relaxed text-pretty">
                      {f.a}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </section>

        <TrustBadges />

        <section className="container-page py-12 md:py-16">
          <div className="rounded-2xl bg-primary-600 text-white p-8 md:p-12 text-center">
            <h2 className="font-display text-2xl md:text-3xl font-bold mb-3 text-balance">
              Não seja mais tributado pela receita do parceiro.
            </h2>
            <p className="text-white/70 mb-6 max-w-xl mx-auto text-pretty">
              Calcule sua economia em 30 segundos ou fale direto com um
              especialista no WhatsApp — a gente refaz a conta com os seus
              números reais.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Button asChild variant="default" size="lg">
                <Link href="/#simulador">
                  Calcular minha economia
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
              </Button>
              <CTAWhatsApp
                message="Oi, li como funciona o split em paguecomsplit.com.br e quero falar com um especialista."
                label="Quero falar com especialista"
                variant="primary"
                size="lg"
              />
            </div>
          </div>
        </section>

        <FaqJsonLd />
      </main>
      <Footer />
    </>
  );
}

function Card({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-soft">
      <span className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-accent-50 text-accent-600 mb-4">
        {icon}
      </span>
      <h3 className="font-display text-lg font-bold text-primary-600 mb-2">
        {title}
      </h3>
      <p className="text-sm text-muted leading-relaxed text-pretty">{body}</p>
    </div>
  );
}

function FaqJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
