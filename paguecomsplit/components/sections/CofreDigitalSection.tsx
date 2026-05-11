"use client";

import { motion } from "framer-motion";
import { ArrowDown, TrendingDown, TrendingUp } from "lucide-react";
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

  return (
    <section className="container-page py-16 md:py-24">
      <div className="max-w-2xl mb-12">
        <p className="text-xs font-bold uppercase tracking-widest text-accent-600 mb-3">
          Cofre Digital
        </p>
        <h2 className="font-display text-3xl md:text-4xl font-bold text-primary-600 mb-3 text-balance">
          Antes do imposto incidir, o dinheiro do terceiro já saiu.
        </h2>
        <p className="text-muted text-pretty">
          Compare o mesmo pagamento, com e sem split, usando números do seu
          segmento.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <FlowColumn
          tone="warm"
          tag="Sem split"
          title="Hoje você tributa tudo"
          steps={[
            `Cliente paga ${formatBRL(monthlyRevenue, true)}`,
            "Tudo entra na sua conta",
            `Simples incide sobre ${formatBRL(monthlyRevenue, true)} (${formatPercent(example.tax_rate)})`,
            `Imposto: ${formatBRL(taxWithout)}`,
            `Você repassa ${formatBRL(monthlyRepasse)} para ${thirdParty} depois`,
          ]}
          footer={{
            label: "Lucro líquido depois do repasse",
            value: formatBRL(monthlyMargin - taxWithout),
          }}
        />

        <FlowColumn
          tone="accent"
          tag="Com Cofre Digital"
          title="Cada um tributa o que é seu"
          steps={[
            `Cliente paga ${formatBRL(monthlyRevenue, true)}`,
            `Split automático: ${formatBRL(monthlyMargin)} sua conta`,
            `${formatBRL(monthlyRepasse)} vai direto para ${thirdParty}`,
            `Simples incide só sobre ${formatBRL(monthlyMargin)}`,
            `Imposto: ${formatBRL(taxWith)}`,
          ]}
          footer={{
            label: "Lucro líquido real",
            value: formatBRL(monthlyMargin - taxWith),
          }}
          highlight
        />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
        className="mt-8 rounded-xl border-2 border-accent-300 bg-accent-50 p-6 md:p-7 text-center"
      >
        <p className="text-sm font-semibold text-accent-700 uppercase tracking-widest mb-2">
          Economia mensal nessa única transação
        </p>
        <p className="font-display text-4xl md:text-5xl font-extrabold text-accent-700">
          + {formatBRL(savings)}
        </p>
        <p className="text-sm text-text/70 mt-2 max-w-md mx-auto text-pretty">
          O dinheiro do terceiro nunca passa pela sua tributação — porque,
          juridicamente, ele nunca foi receita sua.
        </p>
      </motion.div>
    </section>
  );
}

function FlowColumn({
  tone,
  tag,
  title,
  steps,
  footer,
  highlight,
}: {
  tone: "warm" | "accent";
  tag: string;
  title: string;
  steps: string[];
  footer: { label: string; value: string };
  highlight?: boolean;
}) {
  const ring = highlight ? "ring-2 ring-accent-200" : "";
  const border = tone === "warm" ? "border-warm-500/40" : "border-accent-500/40";
  const tagBg = tone === "warm" ? "bg-warm-500/10 text-warm-600" : "bg-accent-500/10 text-accent-700";
  const titleColor = tone === "warm" ? "text-warm-600" : "text-accent-700";
  const Icon = tone === "warm" ? TrendingUp : TrendingDown;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.4 }}
      className={`rounded-xl border-2 ${border} bg-white p-6 md:p-7 ${ring}`}
    >
      <div className="flex items-center justify-between mb-3">
        <span className={`inline-flex items-center gap-1.5 rounded-full ${tagBg} px-3 py-1 text-xs font-bold uppercase tracking-widest`}>
          <Icon className="h-3.5 w-3.5" aria-hidden />
          {tag}
        </span>
      </div>

      <h3 className={`font-display text-xl font-bold ${titleColor} mb-5`}>
        {title}
      </h3>

      <ol className="space-y-3">
        {steps.map((step, i) => (
          <li key={i} className="flex gap-3 text-sm text-text/80">
            <span className="flex-none mt-0.5">
              {i < steps.length - 1 ? (
                <ArrowDown className="h-4 w-4 text-muted/60" aria-hidden />
              ) : (
                <ArrowDown className="h-4 w-4 text-muted/40" aria-hidden />
              )}
            </span>
            <span className="leading-relaxed">{step}</span>
          </li>
        ))}
      </ol>

      <div className="mt-6 pt-4 border-t border-slate-100">
        <p className="text-xs uppercase tracking-widest text-muted mb-1">
          {footer.label}
        </p>
        <p className={`font-display text-2xl font-extrabold ${titleColor}`}>
          {footer.value}
        </p>
      </div>
    </motion.div>
  );
}
