import type { Metadata } from "next";
import { ArrowRight, Users, Check, ShieldCheck } from "lucide-react";
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
    desc: "Você indica o cliente e pronto. Existe um plano criado especialmente para esse perfil, sem complicações.",
    bg: "linear-gradient(160deg, #E6FAF4 0%, #C9F1DF 100%)",
  },
  {
    number: "2",
    title: "Representação Comercial",
    desc: "Para quem quer ir além e representar a empresa de forma ativa. Um plano robusto para quem enxerga o potencial do negócio.",
    bg: "linear-gradient(160deg, #EFF4F9 0%, #DCE6F0 100%)",
  },
];

export default function RepresentantesPage() {
  return (
    <>
      <NavBar />
      <main>
        {/* 1. Hero */}
        <section className="gradient-hero overflow-hidden">
          <div className="container-page relative pt-14 pb-16 md:pt-20 md:pb-20">
            <div className="max-w-3xl mx-auto text-center">
              <p className="inline-flex items-center gap-2 rounded-full bg-accent-50 border border-accent-200 text-accent-700 px-4 py-1.5 text-xs font-bold uppercase tracking-[.2em] mb-5">
                <Users className="h-3.5 w-3.5" aria-hidden />
                Para representantes e contadores
              </p>
              <h1 className="font-display text-4xl md:text-5xl lg:text-[58px] font-extrabold text-primary-600 leading-[1.05] tracking-tight text-balance">
                Você apresenta. O cliente vê o número.{" "}
                <span className="text-accent-600">Você fecha.</span>
              </h1>
              <p className="mt-6 text-lg md:text-xl text-text/75 max-w-2xl mx-auto text-pretty">
                Vender split é vender economia certa. Você mostra quanto o
                cliente está perdendo de DAS todo mês — e ele decide. Sem
                produto pra entregar, sem suporte pra fazer.
              </p>

              <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
                <CTAWhatsApp
                  message="Oi, quero entender o programa de representantes da SplitTech."
                  label="Quero conversar antes"
                  size="xl"
                />
              </div>

              <ul className="mt-7 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-text/65">
                <li className="inline-flex items-center gap-2">
                  <Check className="h-4 w-4 text-accent-700" strokeWidth={2.5} aria-hidden />
                  Comissão por ativação
                </li>
                <li className="inline-flex items-center gap-2">
                  <Check className="h-4 w-4 text-accent-700" strokeWidth={2.5} aria-hidden />
                  Recorrência mensal
                </li>
                <li className="inline-flex items-center gap-2">
                  <Check className="h-4 w-4 text-accent-700" strokeWidth={2.5} aria-hidden />
                  Sem teto de comissão
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* 2. Modalidades */}
        <section className="container-page py-14 md:py-20">
          <div className="max-w-2xl mx-auto text-center mb-12">
            <p className="text-xs font-bold uppercase tracking-[.2em] text-accent-600 mb-3">
              Modalidades de parceria
            </p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-primary-600 text-balance leading-[1.05]">
              Trabalhamos com duas modalidades de parceria.
            </h2>
            <p className="mt-4 text-text/70 text-pretty">
              Uma delas pode ser exatamente o que você procura.
            </p>
          </div>

          <ul className="grid gap-5 md:grid-cols-2 max-w-4xl mx-auto" role="list">
            {MODALITIES.map((m) => (
              <li
                key={m.title}
                className="group relative overflow-hidden rounded-3xl border-2 border-slate-200/60 p-6 md:p-8 transition-all duration-500 ease-out hover:-translate-y-2 hover:border-accent-400 hover:shadow-pop"
                style={{ background: m.bg }}
              >
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{ background: "radial-gradient(circle at 70% 0%, rgba(0,200,150,.22), transparent 65%)" }}
                  aria-hidden
                />
                <span
                  className="relative inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-primary-600 font-display font-extrabold text-2xl shadow-[0_4px_12px_-4px_rgba(10,37,64,.12)] mb-5 transition-all group-hover:bg-primary-600 group-hover:text-accent-200 group-hover:scale-105"
                  aria-hidden
                >
                  {m.number}
                </span>
                <h3 className="relative font-display text-xl md:text-2xl font-bold text-primary-600 mb-2 leading-tight transition-colors group-hover:text-accent-700">
                  {m.title}
                </h3>
                <p className="relative text-[15px] text-text/70 leading-relaxed text-pretty">
                  {m.desc}
                </p>
              </li>
            ))}
          </ul>
        </section>

        {/* 3. Entrevista prévia — banner */}
        <section className="container-page pb-14 md:pb-20">
          <div
            className="rounded-3xl border-2 border-accent-300 p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center gap-5 md:gap-8"
            style={{ background: "linear-gradient(135deg, #E6FAF4 0%, #B9F2DF 100%)" }}
          >
            <div className="flex-1">
              <p className="text-[11px] font-bold uppercase tracking-[.25em] text-accent-700 mb-1">
                Como começar
              </p>
              <p className="font-display text-2xl md:text-3xl font-extrabold text-primary-600 leading-tight tracking-tight mb-2">
                Em ambas, começa com uma{" "}
                <span className="text-accent-700">entrevista prévia</span>.
              </p>
              <p className="text-[15px] text-text/75 text-pretty">
                Entre em contato e descubra qual modalidade é melhor para o seu
                perfil — leva uns 15 minutos.
              </p>
            </div>
            <CTAWhatsApp
              message="Oi, quero entender as modalidades de representação da SplitTech e descobrir qual é melhor para mim."
              label="Quero entrar em contato"
              size="lg"
            />
          </div>
        </section>

        {/* 4. Form de cadastro */}
        <section className="bg-white border-y border-slate-100">
          <div className="container-page py-14 md:py-20">
            <div className="grid gap-10 lg:grid-cols-5 items-start">
              <div className="lg:col-span-2">
                <p className="text-xs font-bold uppercase tracking-[.2em] text-accent-600 mb-3">
                  Cadastro de representante
                </p>
                <h2 className="font-display text-3xl md:text-4xl font-bold text-primary-600 mb-4 text-balance leading-[1.05]">
                  Deixe seus dados.
                </h2>
                <p className="text-text/70 leading-relaxed mb-6 text-pretty">
                  Preencha o formulário e o time comercial entra em contato
                  para alinhar a modalidade ideal e os próximos passos.
                </p>
                <p className="inline-flex items-center gap-2 rounded-full bg-accent-50 border border-accent-200 text-accent-700 px-3 py-1.5 text-xs font-bold uppercase tracking-[.18em]">
                  <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
                  Entrevista prévia obrigatória
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden />
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
