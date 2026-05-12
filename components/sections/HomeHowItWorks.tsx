"use client";

import { Fragment } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Wallet,
  ArrowDown,
  Receipt,
  Split,
  CheckCircle2,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";

type FlowNode = {
  icon: LucideIcon;
  title: string;
  sub: string;
  emphasis?: string;
};

type FlowRow = {
  tone: "warm" | "accent";
  tag: string;
  nodes: FlowNode[];
};

const ROWS: FlowRow[] = [
  {
    tone: "warm",
    tag: "Sem split",
    nodes: [
      {
        icon: Wallet,
        title: "Cliente paga R$ 6.000",
        sub: "Cartão / PIX / link",
      },
      {
        icon: ArrowDown,
        title: "Tudo cai na sua conta",
        sub: "Você precisa repassar depois",
      },
      {
        icon: Receipt,
        title: "Imposto sobre R$ 6.000",
        sub: "DAS = R$ 360 (6%)",
        emphasis: "R$ 360 de DAS",
      },
    ],
  },
  {
    tone: "accent",
    tag: "Com Cofre Digital",
    nodes: [
      {
        icon: Wallet,
        title: "Cliente paga R$ 6.000",
        sub: "Mesma maquininha",
      },
      {
        icon: Split,
        title: "Split automático",
        sub: "R$ 2.400 sua · R$ 3.600 terceiro",
      },
      {
        icon: CheckCircle2,
        title: "Imposto só sobre R$ 2.400",
        sub: "DAS = R$ 144 (6%)",
        emphasis: "R$ 144 de DAS",
      },
    ],
  },
] as const;

const TONES = {
  warm: {
    border: "border-warm-500/40",
    bg: "bg-warm-500/5",
    text: "text-warm-600",
    tagBg: "bg-warm-500/10 text-warm-700",
    nodeBg: "bg-white",
    nodeBorder: "border-warm-500/30",
    iconBg: "bg-warm-500/10 text-warm-600",
    arrow: "text-warm-500/60",
    emphasis: "text-warm-600",
  },
  accent: {
    border: "border-accent-500/40",
    bg: "bg-accent-50",
    text: "text-accent-700",
    tagBg: "bg-accent-500/10 text-accent-700",
    nodeBg: "bg-white",
    nodeBorder: "border-accent-500/30",
    iconBg: "bg-accent-500/10 text-accent-700",
    arrow: "text-accent-500/60",
    emphasis: "text-accent-700",
  },
} as const;

export function HomeHowItWorks() {
  return (
    <section className="bg-white">
      <div className="container-page py-12 md:py-16">
        <div className="grid md:grid-cols-12 gap-8 md:gap-10 items-start mb-10">
          <div className="md:col-span-7">
            <p className="text-xs font-bold uppercase tracking-widest text-accent-600 mb-3">
              Como funciona
            </p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-primary-600 mb-3 text-balance">
              O Cofre Digital separa o que é seu do que é de terceiros.
            </h2>
            <p className="text-text/80 leading-relaxed text-pretty">
              No POS SplitTech, cada pagamento é dividido automaticamente. A
              parte do terceiro (parceiro, fornecedor, autônomo) cai direto na
              conta dele — fora do seu DAS. Você passa a tributar só a sua
              margem real.
            </p>
          </div>
          <div className="md:col-span-5 md:pt-2">
            <div className="rounded-xl bg-primary-50 border border-primary-100 p-5">
              <p className="text-xs font-bold uppercase tracking-widest text-primary-600 mb-1">
                Mesma maquininha
              </p>
              <p className="text-sm text-text/80 leading-relaxed">
                Um único pagamento, dois caminhos diferentes. Veja em uma
                operação real de R$ 6.000:
              </p>
            </div>
          </div>
        </div>

        {/* Diagrama */}
        <div className="space-y-5">
          {ROWS.map((row, rowIdx) => {
            const t = TONES[row.tone];
            return (
              <motion.div
                key={row.tag}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.5, delay: rowIdx * 0.15 }}
                className={`rounded-2xl border-2 ${t.border} ${t.bg} p-5 md:p-6`}
              >
                <div className="flex items-center gap-2 mb-4">
                  <span
                    className={`inline-flex items-center rounded-full ${t.tagBg} px-3 py-1 text-xs font-bold uppercase tracking-widest`}
                  >
                    {row.tag}
                  </span>
                </div>

                <div className="grid md:grid-cols-[1fr_auto_1fr_auto_1fr] gap-4 md:gap-3 items-stretch">
                  {row.nodes.map((node, i) => (
                    <Fragment key={`${row.tag}-${i}`}>
                      <div
                        className={`rounded-xl ${t.nodeBg} border ${t.nodeBorder} p-4`}
                      >
                        <span
                          className={`inline-flex h-9 w-9 items-center justify-center rounded-lg ${t.iconBg} mb-3`}
                        >
                          <node.icon className="h-4 w-4" aria-hidden />
                        </span>
                        <p className="font-display text-sm md:text-base font-bold text-primary-600 leading-tight">
                          {node.title}
                        </p>
                        <p className="text-xs text-muted leading-relaxed mt-1">
                          {node.sub}
                        </p>
                        {node.emphasis ? (
                          <p
                            className={`mt-2 font-display text-sm font-extrabold ${t.emphasis}`}
                          >
                            {node.emphasis}
                          </p>
                        ) : null}
                      </div>
                      {i < row.nodes.length - 1 ? (
                        <div
                          className="hidden md:flex items-center justify-center"
                          aria-hidden
                        >
                          <ArrowRight className={`h-6 w-6 ${t.arrow}`} />
                        </div>
                      ) : null}
                    </Fragment>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Banner economia */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.4 }}
          className="mt-6 rounded-2xl border-2 border-accent-300 bg-accent-50 p-6 md:p-7 flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6"
        >
          <div className="flex-1">
            <p className="text-xs font-bold uppercase tracking-widest text-accent-700 mb-1">
              Economia nesta única transação
            </p>
            <p className="font-display text-3xl md:text-4xl font-extrabold text-accent-700 leading-tight">
              R$ 216 / cliente
            </p>
            <p className="text-sm text-text/70 mt-1 text-pretty max-w-xl">
              Multiplique pelo número de operações do seu negócio no mês.
              Costuma render entre <strong>R$ 1.000 e R$ 5.000/mês</strong> de
              economia, dependendo do segmento e da faixa do Simples.
            </p>
          </div>
          <Button asChild variant="primary" size="lg" className="flex-none">
            <Link href="/como-funciona">
              Entender em detalhes
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
