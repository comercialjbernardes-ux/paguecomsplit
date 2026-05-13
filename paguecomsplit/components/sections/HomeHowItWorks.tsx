"use client";

import { Fragment } from "react";
import Link from "next/link";
import { DiagramaSplit } from "@/components/DiagramaSplit";
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
    tag: "Hoje: bitributação",
    nodes: [
      {
        icon: Wallet,
        title: "Cliente paga R$ 6.000",
        sub: "Cartão / PIX / link",
      },
      {
        icon: ArrowDown,
        title: "Tudo entra como sua receita",
        sub: "Você repassa depois ao parceiro",
      },
      {
        icon: Receipt,
        title: "DAS sobre R$ 6.000",
        sub: "Imposto sobre dinheiro que não era seu",
        emphasis: "R$ 810 de DAS",
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
        title: "A divisão é gerida na origem",
        sub: "R$ 2.400 sua · R$ 3.600 do parceiro",
      },
      {
        icon: CheckCircle2,
        title: "DAS só sobre R$ 2.400",
        sub: "Você tributa só a sua margem real",
        emphasis: "R$ 324 de DAS",
      },
    ],
  },
];

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
              Cada parte é separada antes de gerar imposto.
            </h2>
            <p className="text-text/80 leading-relaxed text-pretty">
              Mesma maquininha, mesma operação. A SplitTech administra a divisão
              do pagamento <strong>antes</strong> do DAS incidir — a parte do
              parceiro (fornecedor, autônomo) vai direto para a conta dele e
              você passa a tributar só a sua margem real.
            </p>
          </div>
          <div className="md:col-span-5 md:pt-2">
            <div className="rounded-xl bg-accent-50 border border-accent-200 p-5">
              <p className="text-xs font-bold uppercase tracking-widest text-accent-700 mb-1">
                Resultado prático
              </p>
              <p className="text-sm text-text/80 leading-relaxed">
                Não seja mais tributado pela receita do parceiro. Veja a mesma
                operação de R$ 6.000 lado a lado:
              </p>
            </div>
          </div>
        </div>

        {/* Diagrama SVG animado */}
        <div className="mb-10">
          <DiagramaSplit />
        </div>

        {/* Tabela semantica (sr-only para crawlers e leitores de tela) */}
        <table className="sr-only">
          <caption>
            Comparativo de DAS sobre uma operação de R$ 6.000, Anexo III faixa 3
            do Simples Nacional (alíquota nominal 13,5%)
          </caption>
          <thead>
            <tr>
              <th scope="col">Cenário</th>
              <th scope="col">Receita tributável</th>
              <th scope="col">DAS pago</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th scope="row">Hoje (sem split, bitributação)</th>
              <td>R$ 6.000</td>
              <td>R$ 810</td>
            </tr>
            <tr>
              <th scope="row">Com Cofre Digital (split antes do DAS)</th>
              <td>R$ 2.400</td>
              <td>R$ 324</td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <th scope="row" colSpan={2}>
                Economia por cliente
              </th>
              <td>R$ 486</td>
            </tr>
          </tfoot>
        </table>

        {/* Diagrama visual */}
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
              R$ 486 / cliente
            </p>
            <p className="text-sm text-text/70 mt-1 text-pretty max-w-xl">
              Multiplique pelo número de operações do seu negócio no mês.
              Costuma render entre <strong>R$ 1.000 e R$ 5.000/mês</strong> de
              economia, dependendo do segmento e da faixa do Simples.
            </p>
            <p className="text-xs text-muted mt-2">
              Exemplo baseado no <strong>Anexo III, faixa 3</strong> (R$ 360k–720k/ano,
              alíquota nominal 13,5%). Para o seu caso real, use o{" "}
              <a href="#simulador" className="underline hover:text-primary-600">
                simulador abaixo
              </a>
              .
            </p>
          </div>
          <Button asChild variant="primary" size="lg" className="flex-none">
            <Link href="/como-funciona">
              Ver como administramos o split
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
