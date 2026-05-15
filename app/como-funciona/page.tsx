import type { Metadata } from "next";
import Link from "next/link";
import { Vault, ArrowRight, ShieldCheck, Building2, Check } from "lucide-react";
import { NavBar } from "@/components/NavBar";
import { Footer } from "@/components/Footer";
import { StepByStep } from "@/components/sections/StepByStep";
import { TrustBadges } from "@/components/TrustBadges";
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

const CARDS = [
  {
    icon: Vault,
    title: "O conceito",
    body: "O Cofre Digital recebe o pagamento, separa a parte do parceiro, e só depois deposita a sua. A divisão é gerida na origem da transação.",
    bg: "linear-gradient(160deg, #EFF4F9 0%, #DCE6F0 100%)",
  },
  {
    icon: ShieldCheck,
    title: "A regulação",
    body: "Infraestrutura Cappta, regulada pelo BACEN. A mesma base usada por adquirentes consolidados — split é a prática padrão do mercado de adquirência.",
    bg: "linear-gradient(160deg, #E6FAF4 0%, #C9F1DF 100%)",
  },
  {
    icon: Building2,
    title: "A consequência",
    body: "Você passa a tributar só a sua margem real. O dinheiro do seu parceiro nunca virou sua receita — e nunca entra no seu DAS.",
    bg: "linear-gradient(160deg, #FFF4ED 0%, #FFE0CB 100%)",
  },
];

export default function ComoFuncionaPage() {
  return (
    <>
      <NavBar />
      <main>
        {/* Hero */}
        <section className="gradient-hero overflow-hidden">
          <div className="container-page relative pt-14 pb-16 md:pt-20 md:pb-20">
            <div className="max-w-3xl mx-auto text-center">
              <p className="inline-flex items-center gap-2 rounded-full bg-accent-50 border border-accent-200 text-accent-700 px-4 py-1.5 text-xs font-bold uppercase tracking-[.2em] mb-5">
                <Check className="h-3.5 w-3.5" strokeWidth={3} aria-hidden />
                Como funciona
              </p>
              <h1 className="font-display text-4xl md:text-5xl lg:text-[58px] font-extrabold text-primary-600 leading-[1.05] tracking-tight text-balance">
                Cada parte é separada antes de gerar imposto.
              </h1>
              <p className="mt-6 text-lg md:text-xl text-text/75 max-w-2xl mx-auto text-pretty">
                Em 3 ideias: <strong className="text-primary-600">o problema</strong>,{" "}
                <strong className="text-primary-600">o fluxo</strong>,{" "}
                <strong className="text-primary-600">o amparo</strong>. Sem juridiquês.
              </p>
              <div className="mt-7 inline-flex items-center gap-2 rounded-full bg-primary-600 text-white px-4 py-2 text-xs font-semibold shadow-pop">
                <ShieldCheck className="h-3.5 w-3.5 text-accent-300" aria-hidden />
                Cappta · +R$ 7 bi/ano · Regulado BACEN
              </div>
            </div>
          </div>
        </section>

        {/* 3 cards conceito/regulação/consequência */}
        <section className="container-page py-14 md:py-20">
          <ul className="grid gap-5 md:grid-cols-3" role="list">
            {CARDS.map((c) => (
              <li
                key={c.title}
                className="group relative overflow-hidden rounded-3xl border-2 border-slate-200/60 p-6 md:p-7 transition-all duration-500 ease-out hover:-translate-y-2 hover:border-accent-400 hover:shadow-pop"
                style={{ background: c.bg }}
              >
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{ background: "radial-gradient(circle at 70% 0%, rgba(0,200,150,.22), transparent 65%)" }}
                  aria-hidden
                />
                <span className="relative inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-accent-700 mb-5 shadow-[0_4px_12px_-4px_rgba(10,37,64,.12)] transition-all group-hover:bg-primary-600 group-hover:text-accent-200 group-hover:scale-105">
                  <c.icon className="h-7 w-7" aria-hidden />
                </span>
                <h3 className="relative font-display text-xl font-bold text-primary-600 mb-2 leading-tight transition-colors group-hover:text-accent-700">
                  {c.title}
                </h3>
                <p className="relative text-[15px] text-text/70 leading-relaxed text-pretty">
                  {c.body}
                </p>
              </li>
            ))}
          </ul>
        </section>

        {/* Passo a passo (reusa componente v2) */}
        <StepByStep />

        {/* FAQ */}
        <section className="bg-white border-y border-slate-100">
          <div className="container-page py-14 md:py-20">
            <div className="max-w-2xl mx-auto text-center mb-12">
              <p className="text-xs font-bold uppercase tracking-[.25em] text-accent-600 mb-3">
                Perguntas frequentes
              </p>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-primary-600 text-balance leading-[1.1]">
                As dúvidas que sempre aparecem.
              </h2>
            </div>

            <dl className="space-y-3 max-w-3xl mx-auto">
              {FAQS.map((f) => (
                <details
                  key={f.q}
                  className="faq-item group rounded-2xl border border-slate-200/70 bg-white p-6 md:p-7 hover:border-accent-300 open:border-accent-300"
                >
                  <summary className="font-display text-lg font-bold text-primary-600 cursor-pointer flex items-center justify-between gap-3">
                    <span>{f.q}</span>
                    <span className="chev flex-none inline-flex h-8 w-8 items-center justify-center rounded-full bg-accent-50 text-accent-700 group-hover:bg-accent-100" aria-hidden>
                      <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
                    </span>
                  </summary>
                  <dd className="mt-4 text-text/80 leading-relaxed text-pretty">{f.a}</dd>
                </details>
              ))}
            </dl>
          </div>
        </section>

        {/* Trust badges */}
        <TrustBadges />

        {/* CTA final */}
        <section className="container-page py-14 md:py-20">
          <div className="relative rounded-3xl bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white p-6 md:p-10 lg:p-14 overflow-hidden shadow-pop">
            <div className="absolute -top-32 -right-24 w-80 h-80 rounded-full bg-accent-500/25 blur-3xl" aria-hidden />
            <div className="absolute -bottom-28 left-1/3 w-72 h-72 rounded-full bg-accent-300/10 blur-3xl" aria-hidden />

            <div className="relative max-w-2xl mx-auto text-center">
              <p className="text-xs font-bold uppercase tracking-[.25em] text-accent-300 mb-4">
                Próximo passo
              </p>
              <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-extrabold mb-4 text-balance leading-[1.05]">
                Não seja mais tributado pela receita do parceiro.
              </h2>
              <p className="text-white/70 mb-7 max-w-xl mx-auto text-pretty">
                Calcule sua economia em 30 segundos ou fale direto com um
                especialista — a gente refaz a conta com os seus números reais.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <CTAWhatsApp
                  message="Oi, li como funciona o split em paguecomsplit.com.br e quero falar com um especialista."
                  label="Quero falar com especialista"
                  size="lg"
                />
                <Link
                  href="/#simulador"
                  className="btn btn-on-dark-outline btn-lg cta-glow-light cta-shimmer cta-shimmer-dark"
                >
                  Calcular minha economia
                  <ArrowRight className="h-4 w-4 arrow" aria-hidden />
                </Link>
              </div>
            </div>
          </div>
        </section>

        <FaqJsonLd />
      </main>
      <Footer />
    </>
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
