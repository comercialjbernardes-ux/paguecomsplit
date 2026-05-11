import type { Metadata } from "next";
import {
  Coins,
  Repeat,
  Infinity as InfinityIcon,
  Link2,
  Share2,
  LineChart,
  ArrowRight,
} from "lucide-react";
import { NavBar } from "@/components/NavBar";
import { Footer } from "@/components/Footer";
import { RepresentanteForm } from "@/components/RepresentanteForm";
import { CTAWhatsApp } from "@/components/CTAWhatsApp";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://paguecomsplit.com.br";

export const metadata: Metadata = {
  title: "Para Representantes",
  description:
    "Distribua uma solução que vende sozinha. Comissão recorrente por cliente ativado no split de pagamento da SplitTech.",
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

const MODEL = [
  {
    icon: Coins,
    title: "Comissão por ativação",
    desc: "Valor fixo por cada cliente que você cadastra e que efetivamente ativa a maquininha.",
  },
  {
    icon: Repeat,
    title: "Recorrência mensal",
    desc: "Você recebe um % sobre o volume processado pelo cliente, enquanto ele estiver ativo.",
  },
  {
    icon: InfinityIcon,
    title: "Sem teto",
    desc: "Quantos clientes você quiser na sua carteira. Sua receita escala com a sua rede.",
  },
];

const DISTRIBUTION = [
  "Você recebe seus links segmentados exclusivos (ex: paguecomsplit.com.br/estetica?rep=seu-codigo)",
  "Envia para o prospect certo, no canal certo",
  "Prospect converte via LP ou WhatsApp",
  "Lead entra automaticamente na sua carteira",
  "Você acompanha conversões e comissões no painel",
];

const MATERIAL = [
  {
    icon: Link2,
    title: "Links rastreados",
    desc: "Um link por segmento com o seu código de representante embutido.",
  },
  {
    icon: Share2,
    title: "Conteúdo segmentado",
    desc: "Posts, copies para WhatsApp e roteiros prontos por segmento.",
  },
  {
    icon: LineChart,
    title: "Simulador como ferramenta",
    desc: "Use o simulador de economia em reuniões para mostrar o ganho na hora.",
  },
];

export default function RepresentantesPage() {
  return (
    <>
      <NavBar />
      <main>
        {/* 1. Proposta de valor */}
        <section className="gradient-hero">
          <div className="container-page pt-16 pb-20 md:pt-24 md:pb-24">
            <p className="text-xs font-bold uppercase tracking-widest text-accent-600 mb-4">
              Para representantes
            </p>
            <h1 className="font-display text-4xl md:text-6xl font-extrabold text-primary-600 leading-[1.05] tracking-tight max-w-3xl text-balance">
              Distribua uma solução que <span className="text-accent-600">vende sozinha</span>.
            </h1>
            <p className="mt-6 text-lg md:text-2xl text-text/80 max-w-3xl text-pretty">
              Cada cliente que você cadastra gera comissão recorrente enquanto
              ele usa o sistema. Sem produto para entregar, sem suporte para
              fazer — só vender economia tributária.
            </p>

            <div className="mt-8">
              <CTAWhatsApp
                message="Olá! Quero entender o programa de representantes da SplitTech."
                label="Quero conversar antes"
                size="xl"
                variant="outline"
              />
            </div>
          </div>
        </section>

        {/* 2. Modelo de negocio */}
        <section className="container-page py-16 md:py-24">
          <div className="max-w-2xl mb-10">
            <p className="text-xs font-bold uppercase tracking-widest text-accent-600 mb-3">
              Modelo de negócio
            </p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-primary-600 text-balance">
              Você ganha duas vezes — e depois sempre.
            </h2>
          </div>
          <ul className="grid gap-5 md:grid-cols-3" role="list">
            {MODEL.map((m) => (
              <li
                key={m.title}
                className="rounded-xl border border-slate-100 bg-white p-6 shadow-soft"
              >
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-accent-50 text-accent-600 mb-4">
                  <m.icon className="h-6 w-6" aria-hidden />
                </span>
                <h3 className="font-display text-lg font-bold text-primary-600 mb-2">
                  {m.title}
                </h3>
                <p className="text-sm text-muted leading-relaxed text-pretty">
                  {m.desc}
                </p>
              </li>
            ))}
          </ul>
        </section>

        {/* 3. Como funciona a distribuicao */}
        <section className="bg-white border-y border-slate-100">
          <div className="container-page py-16 md:py-20">
            <div className="max-w-2xl mb-10">
              <p className="text-xs font-bold uppercase tracking-widest text-accent-600 mb-3">
                Distribuição
              </p>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-primary-600 text-balance">
                Como funciona o fluxo de indicação.
              </h2>
            </div>

            <ol className="space-y-4 max-w-3xl">
              {DISTRIBUTION.map((step, i) => (
                <li
                  key={i}
                  className="flex gap-4 rounded-xl bg-bg p-4 border border-slate-100"
                >
                  <span
                    className="flex-none inline-flex h-8 w-8 items-center justify-center rounded-full bg-accent-500 text-white font-display font-bold text-sm"
                    aria-hidden
                  >
                    {i + 1}
                  </span>
                  <p className="text-text/80 leading-relaxed pt-1 text-pretty">
                    {step}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* 4. Material de apoio */}
        <section className="container-page py-16 md:py-20">
          <div className="max-w-2xl mb-10">
            <p className="text-xs font-bold uppercase tracking-widest text-accent-600 mb-3">
              Material de apoio
            </p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-primary-600 text-balance">
              Você não vende sozinho.
            </h2>
          </div>

          <ul className="grid gap-5 md:grid-cols-3" role="list">
            {MATERIAL.map((m) => (
              <li
                key={m.title}
                className="rounded-xl border border-slate-100 bg-white p-6"
              >
                <m.icon className="h-8 w-8 text-primary-600 mb-3" aria-hidden />
                <h3 className="font-display text-lg font-bold text-primary-600 mb-2">
                  {m.title}
                </h3>
                <p className="text-sm text-muted leading-relaxed text-pretty">
                  {m.desc}
                </p>
              </li>
            ))}
          </ul>
        </section>

        {/* 5. Form de cadastro */}
        <section className="bg-bg">
          <div className="container-page py-16 md:py-24">
            <div className="grid gap-10 lg:grid-cols-5">
              <div className="lg:col-span-2">
                <p className="text-xs font-bold uppercase tracking-widest text-accent-600 mb-3">
                  Cadastro de representante
                </p>
                <h2 className="font-display text-3xl md:text-4xl font-bold text-primary-600 mb-4 text-balance">
                  Comece em 1 dia útil.
                </h2>
                <p className="text-text/70 leading-relaxed mb-6 text-pretty">
                  Após o cadastro, o time comercial entra em contato para
                  alinhar valores, gerar seus links rastreados e te enviar o
                  material de apoio.
                </p>
                <p className="inline-flex items-center gap-2 text-sm text-accent-700 font-semibold">
                  Sem custo de adesão · sem mensalidade
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
