"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { TrendingDown, Zap, ArrowRight, Calculator } from "lucide-react";
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
import { PopupCaptura } from "@/components/PopupCaptura";
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
const DIAG_SESSION_KEY = "pcs_diag_seen";
const POPUP_OPEN_DELAY_MS = 2_500;
const POPUP_SESSION_KEY = "pcs_popup_seen";

export function EconomySimulator({
  defaults,
  segmentName,
  whatsappMessage,
  className,
  defaultSegmentSlug,
}: Props) {
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

  const hydratedFromUrl = useRef(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const pSeg = params.get("sim_segmento");
    const pBand = params.get("sim_faixa");
    const pAnexo = params.get("sim_anexo");
    const pRep = params.get("sim_repasse");

    let mutated = false;
    if (pSeg && segments.find((s) => s.slug === pSeg)) { setSegmentSlug(pSeg); mutated = true; }
    if (pBand && REVENUE_BANDS.some((b) => b.id === pBand)) { setBandId(pBand); mutated = true; }
    if (pAnexo && (pAnexo === "I" || pAnexo === "III" || pAnexo === "V")) { setAnexo(pAnexo); mutated = true; }
    if (pRep && Number.isFinite(Number(pRep))) {
      setRepassePercent(Math.min(80, Math.max(5, Number(pRep))));
      mutated = true;
    }
    hydratedFromUrl.current = mutated;
  }, []);

  const isFirstSegmentChange = useRef(true);
  useEffect(() => {
    if (isFirstSegmentChange.current) {
      isFirstSegmentChange.current = false;
      if (hydratedFromUrl.current) return;
    }
    const seg = segments.find((s) => s.slug === segmentSlug);
    if (!seg) return;
    setAnexo(SEGMENT_ANEXO[segmentSlug] ?? "III");
    setRepassePercent(seg.example.repasse_percent);
  }, [segmentSlug]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    params.set("sim_segmento", segmentSlug);
    params.set("sim_faixa", bandId);
    params.set("sim_anexo", anexo);
    params.set("sim_repasse", String(repassePercent));
    const url = `${window.location.pathname}?${params.toString()}#simulador`;
    const handle = window.setTimeout(() => {
      window.history.replaceState(null, "", url);
    }, 500);
    return () => window.clearTimeout(handle);
  }, [segmentSlug, bandId, anexo, repassePercent]);

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
    return { annualRevenue, monthlyRevenue, repasse, effectiveRate, taxedWithout, taxedWith, annualSavings, monthlySavings };
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
    `Oi, simulei no paguecomsplit.com.br${displaySegmentName ? ` (segmento: ${displaySegmentName})` : ""} e a economia foi de ${formatBRL(calc.monthlySavings)}/mês. Quero entender melhor como funciona.`;

  const [diagOpen, setDiagOpen] = useState(false);
  const autoOpenTriggered = useRef(false);
  const [popupOpen, setPopupOpen] = useState(false);
  const popupTriggered = useRef(false);
  const [simulatorReached, setSimulatorReached] = useState(false);
  const simulatorRef = useRef<HTMLDivElement>(null);

  // Só dispara via evento de scroll real — nunca no carregamento
  useEffect(() => {
    if (typeof window === "undefined") return;

    function onScroll() {
      const el = simulatorRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      // Considera "atingido" quando o topo do simulador estiver a menos de 70% da altura da tela
      if (rect.top < window.innerHeight * 0.7) {
        setSimulatorReached(true);
        window.removeEventListener("scroll", onScroll, { passive: true } as EventListenerOptions);
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll, { passive: true } as EventListenerOptions);
  }, []);

  // Abre popup só após o usuário ter rolado até o simulador
  useEffect(() => {
    if (!simulatorReached) return;
    if (popupTriggered.current) return;
    if (typeof window === "undefined") return;
    const seen = window.sessionStorage.getItem(POPUP_SESSION_KEY);
    if (seen) {
      popupTriggered.current = true;
      return;
    }
    if (calc.monthlySavings <= 0) return;
    const timer = window.setTimeout(() => {
      setPopupOpen(true);
      window.sessionStorage.setItem(POPUP_SESSION_KEY, "1");
      popupTriggered.current = true;
    }, POPUP_OPEN_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [simulatorReached, calc.monthlySavings]);

  function openDiagManually() {
    setDiagOpen(true);
    if (typeof window !== "undefined") {
      window.sessionStorage.setItem(DIAG_SESSION_KEY, "1");
    }
    autoOpenTriggered.current = true;
  }

  return (
    <div ref={simulatorRef} className={cn("relative rounded-3xl overflow-hidden border border-slate-200/70 bg-white shadow-pop", className)}>
      {/* TOP BAR */}
      <div className="sim-topbar flex items-center justify-between px-6 md:px-8 py-5 border-b border-slate-200/70">
        <div className="shimmer" />
        <div className="relative flex items-center gap-4">
          <span className="sim-icon-wrap">
            <span className="sim-icon inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-accent-400 to-accent-600 text-white shadow-[0_8px_20px_-4px_rgba(0,200,150,.55)] ring-1 ring-white/30">
              <Calculator className="h-5 w-5" aria-hidden />
            </span>
          </span>
          <div>
            <p className="font-display font-extrabold text-primary-600 text-[17px] leading-tight tracking-tight">
              Simulador de Economia
            </p>
            <p className="text-xs text-muted mt-1">
              Baseado nas alíquotas reais do Simples Nacional
            </p>
          </div>
        </div>
        <span className="live-badge relative hidden sm:inline-flex items-center gap-2 rounded-full bg-accent-500 text-white px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[.18em] z-[1]">
          <span className="relative flex h-2 w-2">
            <span className="absolute inset-0 rounded-full bg-white animate-ping opacity-80" />
            <span className="relative h-2 w-2 rounded-full bg-white" />
          </span>
          Ao vivo
        </span>
      </div>

      <div className="grid lg:grid-cols-12">
        {/* INPUTS */}
        <div className="lg:col-span-7 p-6 md:p-8 space-y-7">
          <Field label="Segmento" hint="Cada segmento já vem com Anexo e repasse típico pré-preenchidos">
            <Select value={segmentSlug} onValueChange={setSegmentSlug}>
              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>
                {segments.map((s) => (
                  <SelectItem key={s.slug} value={s.slug}>{s.name}</SelectItem>
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
              <SelectTrigger><SelectValue placeholder="Selecione a faixa" /></SelectTrigger>
              <SelectContent>
                {REVENUE_BANDS.map((b) => (
                  <SelectItem key={b.id} value={b.id}>{b.label}</SelectItem>
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
              <SelectTrigger><SelectValue placeholder="Anexo" /></SelectTrigger>
              <SelectContent>
                {(Object.keys(ANEXOS) as AnexoKey[]).map((k) => (
                  <SelectItem key={k} value={k}>{ANEXOS[k].label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field
            label="% que pertence ao parceiro / fornecedor / autônomo"
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

        {/* OUTPUTS (dark) */}
        <div className="lg:col-span-5 relative bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white p-6 md:p-8 overflow-hidden">
          <div className="absolute inset-0 pointer-events-none opacity-[.07]" aria-hidden style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.6) 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
          <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-accent-500/25 blur-3xl" aria-hidden />
          <div className="absolute -bottom-24 -left-24 w-64 h-64 rounded-full bg-accent-500/15 blur-3xl" aria-hidden />

          <div className="relative flex flex-col h-full">
            <div className="flex items-center gap-2 text-accent-300 mb-5">
              <TrendingDown className="h-4 w-4" aria-hidden />
              <span className="text-[11px] font-bold uppercase tracking-[.25em]">Sua economia estimada</span>
            </div>

            <motion.p
              key={calc.monthlySavings}
              initial={{ opacity: 0.5, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="font-display text-[44px] md:text-[56px] xl:text-[64px] font-extrabold leading-[.95] tabular-nums tracking-tight"
            >
              {formatBRL(calc.monthlySavings)}
              <span className="text-2xl font-medium text-white/55 tracking-normal"> /mês</span>
            </motion.p>

            <p className="text-sm text-white/70 mt-4 leading-relaxed">
              Equivale a <strong className="text-accent-300 font-bold">{formatBRL(calc.annualSavings)}</strong> por ano deixando de pagar imposto sobre dinheiro que não é seu.
            </p>

            <div className="h-px bg-white/10 my-6" />

            <p className="text-[11px] uppercase tracking-[.25em] text-white/45 mb-4">Imposto pago hoje × com split</p>

            <div className="space-y-4">
              <BarRow label="Hoje (sem split)" value={calc.taxedWithout} width={widthWithout} tone="danger" />
              <BarRow label="Com Cofre Digital" value={calc.taxedWith} width={widthWith} tone="success" />
            </div>

            <div className="mt-auto pt-8 space-y-3">
              <Button
                type="button"
                variant="default"
                size="lg"
                className="w-full btn-primary cta-glow-primary cta-shimmer"
                onClick={openDiagManually}
              >
                Quero um diagnóstico preciso
                <ArrowRight className="h-4 w-4 arrow" aria-hidden />
              </Button>
              <p className="flex items-start gap-2 text-xs text-white/55 leading-relaxed">
                <Zap className="h-3.5 w-3.5 mt-0.5 flex-none text-accent-300" aria-hidden />
                Cálculo baseado nas alíquotas reais do Simples Nacional. Diagnóstico exato em 15 minutos — sem compromisso.
              </p>
            </div>
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

      <PopupCaptura
        open={popupOpen}
        onOpenChange={setPopupOpen}
        defaultSegment={segmentSlug}
        monthlySavings={Math.round(calc.monthlySavings)}
      />

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
        <span className="text-sm font-semibold text-primary-600">{label}</span>
        {value ? (
          <span className="font-display text-base font-bold text-accent-700 tabular-nums">
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
  const color = tone === "danger" ? "bg-gradient-to-r from-warm-600 to-warm-500" : "bg-gradient-to-r from-accent-600 to-accent-300";
  const dotColor = tone === "danger" ? "bg-warm-500" : "bg-accent-400";
  return (
    <div>
      <div className="flex justify-between items-baseline text-sm mb-1.5">
        <span className="text-white/80 inline-flex items-center gap-1.5">
          <span className={cn("h-2 w-2 rounded-full", dotColor)} />
          {label}
        </span>
        <span className="font-display font-bold tabular-nums text-base">{formatBRL(value)}</span>
      </div>
      <div className="h-3 w-full rounded-full bg-white/10 overflow-hidden">
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
