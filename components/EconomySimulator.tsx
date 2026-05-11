"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { TrendingDown, Zap } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CTAWhatsApp } from "@/components/CTAWhatsApp";
import { SIMPLES_TAX_RATES, type SegmentExample } from "@/lib/segments";
import { formatBRL, formatPercent, cn } from "@/lib/utils";

type Props = {
  defaults?: SegmentExample;
  segmentName?: string;
  whatsappMessage?: string;
  className?: string;
};

const DEFAULT_VALUES: SegmentExample = {
  annual_revenue: 600_000,
  repasse_percent: 40,
  repasse_value: 240_000,
  tax_rate: 0.06,
  annual_savings: 14_400,
  monthly_savings: 1_200,
};

const MIN_MONTHLY = 10_000;
const MAX_MONTHLY = 200_000;
const STEP_MONTHLY = 1_000;

export function EconomySimulator({
  defaults,
  segmentName,
  whatsappMessage,
  className,
}: Props) {
  const seed = defaults ?? DEFAULT_VALUES;

  const initialMonthly = Math.max(
    MIN_MONTHLY,
    Math.min(MAX_MONTHLY, Math.round(seed.annual_revenue / 12 / 1000) * 1000)
  );

  const [monthlyRevenue, setMonthlyRevenue] = useState<number>(initialMonthly);
  const [repassePercent, setRepassePercent] = useState<number>(
    seed.repasse_percent
  );
  const [taxRate, setTaxRate] = useState<number>(seed.tax_rate);

  const calc = useMemo(() => {
    const annualRevenue = monthlyRevenue * 12;
    const repasse = annualRevenue * (repassePercent / 100);
    const taxedWithout = annualRevenue * taxRate;
    const taxedWith = (annualRevenue - repasse) * taxRate;
    const annualSavings = taxedWithout - taxedWith;
    const monthlySavings = annualSavings / 12;
    return {
      annualRevenue,
      repasse,
      taxedWithout,
      taxedWith,
      annualSavings,
      monthlySavings,
    };
  }, [monthlyRevenue, repassePercent, taxRate]);

  const maxBar = Math.max(calc.taxedWithout, 1);
  const widthWithout = 100;
  const widthWith = Math.max(2, (calc.taxedWith / maxBar) * 100);

  const message =
    whatsappMessage ??
    `Ola! Simulei no paguecomsplit.com.br e ${segmentName ? `no meu segmento (${segmentName})` : "no meu caso"} a economia foi de ${formatBRL(calc.monthlySavings)}/mes. Quero saber mais.`;

  return (
    <div
      className={cn(
        "rounded-xl border border-slate-100 bg-white p-6 shadow-card md:p-8",
        className
      )}
    >
      <div className="grid gap-8 md:grid-cols-2">
        {/* Inputs */}
        <div className="space-y-6">
          <Field label="Faturamento mensal" value={formatBRL(monthlyRevenue)}>
            <Slider
              min={MIN_MONTHLY}
              max={MAX_MONTHLY}
              step={STEP_MONTHLY}
              value={[monthlyRevenue]}
              onValueChange={(v) => setMonthlyRevenue(v[0] ?? MIN_MONTHLY)}
            />
            <div className="flex justify-between text-xs text-muted mt-2">
              <span>{formatBRL(MIN_MONTHLY)}</span>
              <span>{formatBRL(MAX_MONTHLY)}+</span>
            </div>
          </Field>

          <Field
            label="% repassado a terceiros"
            value={`${repassePercent}%`}
            hint="Parte da receita que pertence a parceiros, fornecedores ou autonomos"
          >
            <Slider
              min={5}
              max={80}
              step={1}
              value={[repassePercent]}
              onValueChange={(v) => setRepassePercent(v[0] ?? 10)}
            />
            <div className="flex justify-between text-xs text-muted mt-2">
              <span>5%</span>
              <span>80%</span>
            </div>
          </Field>

          <Field label="Aliquota Simples Nacional" value={formatPercent(taxRate)}>
            <Select
              value={String(taxRate)}
              onValueChange={(v) => setTaxRate(Number(v))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione a faixa" />
              </SelectTrigger>
              <SelectContent>
                {SIMPLES_TAX_RATES.map((r) => (
                  <SelectItem key={r.value} value={String(r.value)}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </div>

        {/* Outputs */}
        <div className="rounded-xl bg-primary-600 text-white p-6 md:p-7 flex flex-col">
          <div className="flex items-center gap-2 text-accent-300 mb-3">
            <TrendingDown className="h-5 w-5" aria-hidden />
            <span className="text-xs font-bold uppercase tracking-widest">
              Sua economia
            </span>
          </div>

          <motion.p
            key={calc.monthlySavings}
            initial={{ opacity: 0.5, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="font-display text-4xl md:text-5xl font-extrabold leading-none"
          >
            {formatBRL(calc.monthlySavings)}
            <span className="text-lg font-medium opacity-70"> /mês</span>
          </motion.p>

          <p className="text-sm text-white/70 mt-2">
            Equivale a <strong className="text-white">{formatBRL(calc.annualSavings)}</strong> por ano deixando de pagar imposto sobre dinheiro que não é seu.
          </p>

          <div className="h-px bg-white/10 my-5" />

          <p className="text-xs uppercase tracking-widest text-white/60 mb-3">
            Imposto pago hoje × com split
          </p>

          <div className="space-y-3">
            <BarRow
              label="Hoje (sem split)"
              value={calc.taxedWithout}
              width={widthWithout}
              tone="danger"
            />
            <BarRow
              label="Com Cofre Digital"
              value={calc.taxedWith}
              width={widthWith}
              tone="success"
            />
          </div>

          <div className="mt-auto pt-6">
            <CTAWhatsApp
              message={message}
              label="Quero essa economia"
              variant="default"
              size="lg"
              className="w-full"
            />
            <p className="flex items-center gap-1.5 justify-center text-xs text-white/60 mt-3">
              <Zap className="h-3.5 w-3.5" aria-hidden />
              Cálculo estimado · revise com seu contador
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  hint,
  children,
}: {
  label: string;
  value: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-2">
        <span className="text-sm font-semibold text-text">{label}</span>
        <span className="font-display text-lg font-bold text-primary-600">
          {value}
        </span>
      </div>
      {children}
      {hint ? <p className="text-xs text-muted mt-2">{hint}</p> : null}
    </div>
  );
}

function BarRow({
  label,
  value,
  width,
  tone,
}: {
  label: string;
  value: number;
  width: number;
  tone: "danger" | "success";
}) {
  const color = tone === "danger" ? "bg-warm-500" : "bg-accent-500";
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-white/80">{label}</span>
        <span className="font-semibold tabular-nums">{formatBRL(value)}</span>
      </div>
      <div className="h-2.5 w-full rounded-full bg-white/10 overflow-hidden">
        <motion.div
          className={cn("h-full rounded-full", color)}
          initial={{ width: 0 }}
          animate={{ width: `${width}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}
