"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, Wallet, Split, Receipt, ArrowDown } from "lucide-react";
import type { SegmentExample } from "@/lib/segments";
import { formatBRL, formatPercent } from "@/lib/utils";

type Props = {
  example: SegmentExample;
  thirdParty: string;
};

export function CofreDigitalSection({ example, thirdParty }: Props) {
  const monthlyRevenue = example.annual_revenue / 12;
  const monthlyRepasse = example.repasse_value / 12;
  const monthlyMargin = monthlyRevenue - monthlyRepasse;
  const taxWithout = monthlyRevenue * example.tax_rate;
  const taxWith = monthlyMargin * example.tax_rate;
  const savings = taxWithout - taxWith;
  const partyShort = thirdParty.split(" (")[0];

  return (
    <section id="cofre" className="bg-white">
      <div className="container-page py-14 md:py-24">
        <div className="max-w-3xl mx-auto text-center mb-14 md:mb-16">
          <p className="text-xs font-bold uppercase tracking-[.2em] text-accent-600 mb-3">
            Cofre Digital
          </p>
          <h2 className="font-display text-3xl md:text-5xl font-bold text-primary-600 mb-4 text-balance leading-[1.05]">
            Cada parte é separada antes de gerar imposto.
          </h2>
          <p className="text-lg text-text/75 leading-relaxed text-pretty">
            Mesmo pagamento, dois caminhos. Os números abaixo são calibrados para o seu segmento.
          </p>
          <p className="mt-5 inline-flex items-center gap-2 rounded-full bg-accent-50 border border-accent-200 text-accent-700 px-4 py-1.5 text-xs font-bold uppercase tracking-widest">
            <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
            Resultado prático · veja lado a lado
          </p>
        </div>

        {/* 2 colunas: Hoje × Com Cofre */}
        <div className="grid lg:grid-cols-2 gap-6 md:gap-8 items-stretch">
          {/* HOJE */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.4 }}
            className="relative rounded-3xl border-2 border-warm-500/30 p-6 md:p-8 overflow-hidden"
            style={{ background: "linear-gradient(160deg, #FFF4ED 0%, #FFE0CB 100%)" }}
          >
            <div className="absolute -top-20 -right-16 w-64 h-64 rounded-full bg-warm-500/15 blur-3xl" aria-hidden />
            <div className="relative">
              <span className="inline-flex items-center gap-2 rounded-full bg-warm-500/15 text-warm-700 px-3 py-1 text-xs font-bold uppercase tracking-[.2em] mb-5">
                Hoje: bitributação
              </span>
              <h3 className="font-display text-xl md:text-2xl font-bold text-primary-600 mb-6 leading-tight text-balance">
                Tudo cai na sua conta — e tudo é tributado.
              </h3>

              <ul className="space-y-4 mb-6" role="list">
                <FlowStep tone="warm" icon={<Wallet className="h-4 w-4" />} title={`Cliente paga ${formatBRL(monthlyRevenue, true)}`} sub="Cartão · PIX · link" />
                <FlowStep tone="warm" icon={<ArrowDown className="h-4 w-4" />} title="Tudo entra como sua receita" sub={`Você repassa ${formatBRL(monthlyRepasse)} para ${partyShort} depois`} />
                <FlowStep tone="warm" icon={<Receipt className="h-4 w-4" />} title={`DAS sobre ${formatBRL(monthlyRevenue, true)}`} sub={`Alíquota ${formatPercent(example.tax_rate)} sobre o bruto`} />
              </ul>

              <div className="inline-flex items-baseline gap-3 rounded-xl bg-warm-500/15 border border-warm-500/30 px-5 py-3.5">
                <span className="text-[11px] font-bold uppercase tracking-[.2em] text-warm-700">Imposto mensal</span>
                <span className="font-display text-2xl md:text-3xl font-extrabold text-warm-600 tabular-nums">{formatBRL(taxWithout)}</span>
              </div>
            </div>
          </motion.div>

          {/* COM COFRE */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="relative rounded-3xl border-2 border-accent-300 p-6 md:p-8 overflow-hidden"
            style={{ background: "linear-gradient(160deg, #E6FAF4 0%, #C9F1DF 100%)" }}
          >
            <div className="absolute -top-20 -left-16 w-64 h-64 rounded-full bg-accent-500/15 blur-3xl" aria-hidden />
            <div className="relative">
              <span className="inline-flex items-center gap-2 rounded-full bg-accent-500/15 text-accent-700 px-3 py-1 text-xs font-bold uppercase tracking-[.2em] mb-5">
                Com Cofre Digital
              </span>
              <h3 className="font-display text-xl md:text-2xl font-bold text-primary-600 mb-6 leading-tight text-balance">
                Cada parte é separada na origem — e cada um tributa só o que é seu.
              </h3>

              <ul className="space-y-4 mb-6" role="list">
                <FlowStep tone="accent" icon={<Wallet className="h-4 w-4" />} title={`Cliente paga ${formatBRL(monthlyRevenue, true)}`} sub="Mesma maquininha" />
                <FlowStep tone="accent" icon={<Split className="h-4 w-4" />} title="A divisão é gerida na origem" sub={`${formatBRL(monthlyMargin)} sua · ${formatBRL(monthlyRepasse)} de ${partyShort}`} />
                <FlowStep tone="accent" icon={<CheckCircle2 className="h-4 w-4" />} title={`DAS só sobre ${formatBRL(monthlyMargin)}`} sub="Você tributa só a sua margem real" />
              </ul>

              <div className="inline-flex items-baseline gap-3 rounded-xl bg-accent-500/15 border border-accent-300 px-5 py-3.5">
                <span className="text-[11px] font-bold uppercase tracking-[.2em] text-accent-700">Imposto mensal</span>
                <span className="font-display text-2xl md:text-3xl font-extrabold text-accent-700 tabular-nums">{formatBRL(taxWith)}</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Banner economia */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="mt-10 rounded-3xl border-2 border-accent-300 p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center gap-5 md:gap-8"
          style={{ background: "linear-gradient(135deg, #E6FAF4 0%, #B9F2DF 100%)" }}
        >
          <div className="flex-1">
            <p className="text-[11px] font-bold uppercase tracking-[.25em] text-accent-700 mb-1">
              Economia nesta operação típica
            </p>
            <p className="font-display text-4xl md:text-5xl font-extrabold text-accent-700 leading-tight tracking-tight">
              + {formatBRL(savings)} <span className="text-2xl md:text-3xl text-accent-700/70 font-medium">/mês</span>
            </p>
            <p className="text-[15px] text-text/75 mt-2 text-pretty max-w-2xl">
              O dinheiro do seu parceiro nunca virou sua receita tributável. Você passa a pagar DAS só sobre o que de fato é seu.
            </p>
          </div>
          <Link href="#simulador" className="btn btn-dark btn-lg flex-none">
            Calcular com meus números
            <ArrowRight className="h-4 w-4 arrow" aria-hidden />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

function FlowStep({
  tone,
  icon,
  title,
  sub,
}: {
  tone: "warm" | "accent";
  icon: React.ReactNode;
  title: string;
  sub: string;
}) {
  const cls = tone === "warm"
    ? "bg-warm-500/15 text-warm-600"
    : "bg-accent-500/15 text-accent-700";
  return (
    <li className="flex items-start gap-4">
      <span className={`flex-none inline-flex h-8 w-8 items-center justify-center rounded-full mt-0.5 ${cls}`}>
        {icon}
      </span>
      <div>
        <p className="font-display font-bold text-primary-600 text-[15px] md:text-[17px]">{title}</p>
        <p className="text-sm text-text/65 mt-0.5">{sub}</p>
      </div>
    </li>
  );
}
