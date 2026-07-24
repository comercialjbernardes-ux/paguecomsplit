"use client";

import { useState } from "react";
import { MessageCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { segments } from "@/lib/segments";
import { buildWhatsAppHref } from "@/lib/utils";
import { trackEvent } from "@/components/Analytics";

const REVENUE_OPTIONS = [
  { value: "ate-30k", label: "Até R$ 30k/mês" },
  { value: "30-60k", label: "R$ 30k – 60k/mês" },
  { value: "60-120k", label: "R$ 60k – 120k/mês" },
  { value: "120-360k", label: "R$ 120k – 360k/mês" },
] as const;

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultSegment?: string;
  monthlySavings?: number;
};

export function PopupCaptura({
  open,
  onOpenChange,
  defaultSegment,
  monthlySavings,
}: Props) {
  const [nome, setNome] = useState("");
  const [segmento, setSegmento] = useState(defaultSegment ?? "");
  const [faturamento, setFaturamento] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const number =
      process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "553195719123";
    const segObj = segments.find((s) => s.slug === segmento);
    const parts: string[] = ["Oi, simulei no paguecomsplit.com.br."];
    if (nome) parts.push(`Meu nome é ${nome}.`);
    if (segObj) parts.push(`Segmento: ${segObj.name}.`);
    else if (segmento === "outros") parts.push("Segmento: Outro.");
    if (faturamento) {
      const rev = REVENUE_OPTIONS.find((r) => r.value === faturamento);
      if (rev) parts.push(`Faturamento: ${rev.label}.`);
    }
    parts.push("Quero o diagnóstico com os meus números reais.");
    const href = buildWhatsAppHref(number, parts.join(" "));
    trackEvent("submit_popup", { segmento });
    onOpenChange(false);
    window.open(href, "_blank", "noopener,noreferrer");
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (v) trackEvent("abertura_popup");
        onOpenChange(v);
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="inline-flex items-center gap-2 text-accent-600 mb-1">
            <Sparkles className="h-4 w-4" aria-hidden />
            <span className="text-xs font-bold uppercase tracking-widest">
              Diagnóstico gratuito
            </span>
          </div>
          <DialogTitle className="font-display text-xl font-extrabold text-primary-600 leading-tight">
            Quer saber o valor exato para o seu CNPJ?
          </DialogTitle>
          <DialogDescription>
            O simulador usa médias do segmento. Um diagnóstico com seu CNPJ
            real leva 15 minutos.
          </DialogDescription>
        </DialogHeader>

        {monthlySavings && monthlySavings > 0 ? (
          <p className="text-sm text-text/70 -mt-1 mb-1">
            Economia estimada:{" "}
            <strong className="text-primary-600">
              R${" "}
              {monthlySavings.toLocaleString("pt-BR", {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              })}
              /mês
            </strong>{" "}
            — o valor real pode ser maior.
          </p>
        ) : null}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="pc-nome">Seu nome</Label>
            <Input
              id="pc-nome"
              autoComplete="name"
              placeholder="Como devemos te chamar?"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="pc-segmento">Segmento</Label>
            <Select value={segmento} onValueChange={setSegmento} required>
              <SelectTrigger id="pc-segmento">
                <SelectValue placeholder="Selecione seu segmento" />
              </SelectTrigger>
              <SelectContent>
                {segments.map((s) => (
                  <SelectItem key={s.slug} value={s.slug}>
                    {s.name}
                  </SelectItem>
                ))}
                <SelectItem value="outros">Outros</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="pc-faturamento">Faturamento mensal</Label>
            <Select
              value={faturamento}
              onValueChange={setFaturamento}
              required
            >
              <SelectTrigger id="pc-faturamento">
                <SelectValue placeholder="Selecione a faixa" />
              </SelectTrigger>
              <SelectContent>
                {REVENUE_OPTIONS.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            type="submit"
            variant="default"
            size="lg"
            className="w-full cta-glow-primary cta-shimmer"
          >
            <MessageCircle className="h-4 w-4" aria-hidden />
            Quero meu diagnóstico gratuito
          </Button>

          <p className="text-[11px] text-muted text-center text-pretty">
            Sem spam. Você só recebe contato pelo WhatsApp informado ao
            especialista.
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
}
