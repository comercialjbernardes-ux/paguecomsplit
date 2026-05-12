"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { TrendingDown, Zap, ArrowRight } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { DiagnosticDialog } from "@/components/DiagnosticDialog";
import { segments, type SegmentExample } from "@/lib/segments";
import {
  ANEXOS,
  REVENUE_BANDS,
  SEGMENT_ANEXO,
  computeEffectiveRate,
  type AnexoKey,
  type RevenueBand,
} from "@/lib/simplesTaxRates";
import { formatBRL, formatPercent, cn } from "@/lib/utils";

type Props = {
  defaults?: SegmentExample;
  segmentName?: string;
  whatsappMessage?: string;
  className?: string;
  defaultSegmentSlug?: string;
};

const DEFAULT_SEGMENT_SLUG = "estetica";
const DEFAULT_BAND_ID = "30-60k";
const DIAG_OPEN_DELAY_MS = 5_000;
const DIAG_SESSION_KEY = "pcs_diag_seen";

export function EconomySimulator({
  defaults,
  segmentName,
  whatsappMessage,
  className,
  defaultSegmentSlug,
}: Props) {
  // Estado inicial: prioriza prop, depois default
  const initialSegment = defaultSegmentSlug ?? DEFAULT_SEGMENT_SLUG;
  const initialAnexo: AnexoKey = SEGMENT_ANEXO[initialSegment] ?? "III";
  const initialBand: RevenueBand =
    REVENUE_BANDS.find((b) => b.id === DEFAULT_BAND_ID) ?? REVENUE_BANDS[2];

  const [segmentSlug, setSegmentSlug] = useState<string>(initialSegment);
  const [bandId, setBandId] = useState<string>(initialBand.id);
  const [anexo, setAnexo] = useState<AnexoKey>(initialAnexo);
  const [repassePercent, setRepassePercent] = useState<number>(
    defaults?.repasse_percent ?? 40
  );

  // Quando o segmento muda, atualizar anexo e repasse padrao
  useEffect(() => {
    const seg = segments.find((s) => s.slug === segmentSlug);
    if (!seg) return;
    setAnexo(SEGMENT_ANEXO[segmentSlug] ?? "III");
    setRepassePercent(seg.example.repasse_percent);
  }, [segmentSlug]);

  const band = useMemo(
    () => REVENUE_BANDS.find((b) => b.id === bandId) ?? initialBand,
    [bandId, initialBand]
  );

  const calc = useMemo(() => {
    const annualRevenue = band.annualRevenue;
    const monthlyRevenue = band.monthlyMid;
    const repasse = annualRevenue * (repassePercent / 100);
    const effectiveRate = computeEffectiveRate(annualRevenue, anexo);
    const taxedWithout = annualRevenue * effectiveRate;
    const taxedWith = (annualRevenue - repasse) * effectiveRate;
    const annualSavings = Math.max(0, taxedWithout - taxedWith);
    const monthlySavings = annualSavings / 12;
    return {
      annualRevenue,
      monthlyRevenue,
      repasse,
      effectiveRate,
      taxedWithout,
      taxedWith,
      annualSavings,
      monthlySavings,
    };
  }, [band, anexo, repassePercent]);

  const maxBar = Math.max(calc.taxedWithout, 1);
  const widthWithout = 100;
  const widthWith = Math.max(2, (calc.taxedWith / maxBar) * 100);

  const segmentObj = useMemo(
    () => segments.find((s) => s.slug === segmentSlug),
    [segmentSlug]
  );

  const displaySegmentName = segmentName ?? segmentObj?.name;

  const message =
    whatsappMessage ??
    `Oi, simulei no paguecomsplit.com.br${displaySegmentName ? ` (segmento: ${displaySegmentName})` : ""} e a economia foi de ${formatBRL(calc.monthlySavings)}/mes. Quero entender melhor como funciona.`;

  // Diagnostic dialog state
  const [diagOpen, setDiagOpen] = useState(false);
  const autoOpenTriggered = useRef(false);

  // Auto-abre o diagnostico apos N segundos com economia > 0 (uma vez por sessao)
  useEffect(() => {
    if (autoOpenTriggered.current) return;
    if (typeof window === "undefined") return;
    const seen = window.sessionStorage.getItem(DIAG_SESSION_KEY);
    if (seen) {
      autoOpenTriggered.current = true;
      return;
    }
    if (calc.monthlySavings <= 0) return;
    const timer = window.setTimeout(() => {
      setDiagOpen(true);
      window.sessionStorage.setItem(DIAG_SESSION_KEY, "1");
      autoOpenTriggered.current = true;
    }, DIAG_OPEN_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [calc.monthlySavings]);

  function openDiagManually() {
    setDiagOpen(true);
    if (typeof window !== "undefined") {
      window.sessionStorage.setItem(DIAG_SESSION_KEY, "1");
    }
    autoOpenTriggered.current = true;
  }

  return (
    <div
      className={cn(
        "rounded-xl border border-slate-100 bg-white p-6 shadow-card md:p-8",
        className
      )}
    >
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Inputs */}
        <div className="space-y-5">
          <Field label="Segmento" hint="Cada segmento ja vem com Anexo e repasse tipico pre-preenchidos">
            <Select value={segmentSlug} onValueChange={setSegmentSlug}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {segments.map((s) => (
                  <SelectItem key={s.slug} value={s.slug}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field
            label="Faturamento mensal"
            value={`~ ${formatBRL(calc.monthlyRevenue, true)}`}
            hint="Faixas reais do Simples Nacional"
          >
            <Select value={bandId} onValueChange={setBandId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a faixa" />
              </SelectTrigger>
              <SelectContent>
                {REVENUE_BANDS.map((b) => (
                  <SelectItem key={b.id} value={b.id}>
                    {b.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field
            label="Anexo do Simples Nacional"
            value={formatPercent(calc.effectiveRate)}
            hint={ANEXOS[anexo].description}
          >
            <Select value={anexo} onValueChange={(v) => setAnexo(v as AnexoKey)}>
              <SelectTrigger>
                <SelectValue placeholder="Anexo" />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(ANEXOS) as AnexoKey[]).map((k) => (
                  <SelectItem key={k} value={k}>
                    {ANEXOS[k].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field
            label="% que pertence ao parceiro / fornecedor / autonomo"
            value={`${repassePercent}%`}
            hint="A parte da receita que hoje passa pela sua conta antes de ir para o dono dela"
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
        </div>

        {/* Outputs */}
        <div className="rounded-xl bg-primary-600 text-white p-6 md:p-7 flex flex-col">
          <div className="flex items-center gap-2 text-accent-300 mb-3">
            <TrendingDown className="h-5 w-5" aria-hidden />
            <span className="text-xs font-bold uppercase tracking-widest">
              Sua economia estimada
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
            Equivale a{" "}
            <strong className="text-white">
              {formatBRL(calc.annualSavings)}
            </strong>{" "}
            por ano deixando de pagar imposto sobre dinheiro que não é seu.
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

          <div className="mt-auto pt-6 space-y-2.5">
            <Button
              type="button"
              variant="default"
              size="lg"
              className="w-full"
              onClick={openDiagManually}
            >
              Quero um diagnóstico preciso
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Button>
            <p className="flex items-center gap-1.5 justify-center text-xs text-white/60">
              <Zap className="h-3.5 w-3.5" aria-hidden />
              Cálculo estimado — seu contador pode confirmar com os números reais.
            </p>
          </div>
        </div>
      </div>

      <DiagnosticDialog
        open={diagOpen}
        onOpenChange={setDiagOpen}
        context={{
          segment: segmentSlug,
          segmentName: segmentObj?.name,
          revenueBandId: band.id,
          revenueBandLabel: band.label,
          monthlySavings: Math.round(calc.monthlySavings),
          annualSavings: Math.round(calc.annualSavings),
        }}
      />

      {/* WhatsApp inline (alternativa, fora do dialog) — usa o message */}
      <p className="sr-only">{message}</p>
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
  value?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-2 gap-3">
        <span className="text-sm font-semibold text-text">{label}</span>
        {value ? (
          <span className="font-display text-base font-bold text-primary-600 tabular-nums">
            {value}
          </span>
        ) : null}
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
