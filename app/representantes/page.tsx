import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { NavBar } from "@/components/NavBar";
import { Footer } from "@/components/Footer";
import { RepresentanteForm } from "@/components/RepresentanteForm";
import { CTAWhatsApp } from "@/components/CTAWhatsApp";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://paguecomsplit.com.br";

export const metadata: Metadata = {
  title: "Para Representantes",
  description:
    "Você apresenta o cálculo. O cliente vê quanto está perdendo de DAS. Você fecha. Comissão por ativação + recorrência sem teto.",
  alternates: { canonical: `${SITE_URL}/representantes` },
  openGraph: {
    title: "Para Representantes | paguecomsplit.com.br",
    description:
      "Comissão por ativação + recorrência mensal sem teto. Material de apoio segmentado e painel de conversões.",
    url: `${SITE_URL}/representantes`,
    type: "website",
    locale: "pt_BR",
  },
};

const MODALITIES = [
  {
    number: "1",
    title: "Indicação",
    desc: "Para o representante que deseja apenas indicar clientes. Existe um plano específico para esse modelo, simples e objetivo.",
  },
  {
    number: "2",
    title: "Representação Comercial",
    desc: "Para o representante que quer atuar de forma ativa, representando a empresa. Um plano estruturado para quem quer ir além da indicação.",
  },
];

export default function RepresentantesPage() {
  return (
    <>
      <NavBar />
      <main>
        {/* 1. Proposta de valor */}
        <section className="gradient-hero">
          <div className="container-page pt-14 pb-14 md:pt-20 md:pb-16">
            <p className="text-xs font-bold uppercase tracking-widest text-accent-600 mb-4">
              Para representantes e contadores
            </p>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-extrabold text-primary-600 leading-[1.05] tracking-tight max-w-3xl text-balance">
              Você apresenta. O cliente vê o número. <span className="text-accent-600">Você fecha.</span>
            </h1>
            <p className="mt-5 text-lg md:text-xl text-text/80 max-w-3xl text-pretty">
              Vender split é vender economia certa. Você mostra quanto o
              cliente está perdendo de DAS todo mês — e ele decide. Sem
              produto pra entregar, sem suporte pra fazer.
            </p>

            <div className="mt-7">
              <CTAWhatsApp
                message="Oi, quero entender o programa de representantes da SplitTech."
                label="Quero conversar antes"
                size="xl"
                variant="outline"
              />
            </div>
          </div>
        </section>

        {/* 2. Modalidades */}
        <section className="container-page py-12 md:py-16">
          <div className="max-w-2xl mb-10">
            <p className="text-xs font-bold uppercase tracking-widest text-accent-600 mb-3">
              Modalidades de parceria
            </p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-primary-600 text-balance">
              Trabalhamos com duas modalidades de parceria.
            </h2>
          </div>

          <ul className="grid gap-5 md:grid-cols-2 max-w-3xl" role="list">
            {MODALITIES.map((m) => (
              <li
                key={m.title}
                className="rounded-xl border border-slate-100 bg-white p-6 shadow-soft"
              >
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-accent-500 text-white font-display font-bold text-lg mb-4">
                  {m.number}
                </span>
                <h3 className="font-display text-xl font-bold text-primary-600 mb-2">
                  {m.title}
                </h3>
                <p className="text-sm text-muted leading-relaxed text-pretty">
                  {m.desc}
                </p>
              </li>
            ))}
          </ul>
        </section>

        {/* 3. Entrevista + CTA */}
        <section className="bg-white border-y border-slate-100">
          <div className="container-page py-12 md:py-16 max-w-3xl">
            <p className="text-text/80 leading-relaxed text-pretty mb-2">
              Em ambas as modalidades, é necessário passar por uma{" "}
              <strong className="text-primary-600">entrevista prévia</strong>.
            </p>
            <p className="text-text/80 leading-relaxed text-pretty mb-8">
              Entre em contato e descubra qual modalidade é melhor para você.
            </p>
            <CTAWhatsApp
              message="Oi, quero entender as modalidades de representação da SplitTech e descobrir qual é melhor para mim."
              label="Quero entrar em contato"
              size="lg"
            />
          </div>
        </section>

        {/* 4. Form de cadastro */}
        <section className="bg-bg">
          <div className="container-page py-12 md:py-16">
            <div className="grid gap-10 lg:grid-cols-5">
              <div className="lg:col-span-2">
                <p className="text-xs font-bold uppercase tracking-widest text-accent-600 mb-3">
                  Cadastro de representante
                </p>
                <h2 className="font-display text-3xl md:text-4xl font-bold text-primary-600 mb-4 text-balance">
                  Deixe seus dados.
                </h2>
                <p className="text-text/70 leading-relaxed mb-6 text-pretty">
                  Preencha o formulário e o time comercial entra em contato
                  para alinhar a modalidade ideal e os próximos passos.
                </p>
                <p className="inline-flex items-center gap-2 text-sm text-accent-700 font-semibold">
                  Entrevista prévia obrigatória
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </p>
              </div>
              <div className="lg:col-span-3">
                <RepresentanteForm />
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
