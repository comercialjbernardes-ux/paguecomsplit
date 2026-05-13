"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Loader2, MessageCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { diagnosticSchema, type DiagnosticInput } from "@/lib/schemas";
import { readRep } from "./RepTracker";
import { buildWhatsAppHref, formatBRL } from "@/lib/utils";

const FALLBACK_NUMBER = "553195719123";

type DiagnosticContext = {
  segment?: string;
  segmentName?: string;
  revenueBandId?: string;
  revenueBandLabel?: string;
  monthlySavings?: number;
  annualSavings?: number;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  context: DiagnosticContext;
};

export function DiagnosticDialog({ open, onOpenChange, context }: Props) {
  const [serverState, setServerState] = useState<
    { status: "idle" | "loading" | "success" | "error"; message?: string }
  >({ status: "idle" });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<DiagnosticInput>({
    resolver: zodResolver(diagnosticSchema),
    defaultValues: {
      type: "diagnostico",
      segment: context.segment as DiagnosticInput["segment"] | undefined,
      monthly_revenue_band: context.revenueBandId,
      estimated_monthly_savings: context.monthlySavings,
    },
  });

  function buildWhatsAppMessage(name: string, cnpj?: string) {
    const parts: string[] = [
      `Oi, sou ${name}, simulei no paguecomsplit.com.br.`,
    ];
    if (cnpj) parts.push(`CNPJ: ${cnpj}.`);
    if (context.segmentName) parts.push(`Segmento: ${context.segmentName}.`);
    if (context.revenueBandLabel)
      parts.push(`Faturamento: ${context.revenueBandLabel}.`);
    if (context.monthlySavings)
      parts.push(
        `Economia estimada: ${formatBRL(context.monthlySavings)}/mês (~${formatBRL(
          context.annualSavings ?? context.monthlySavings * 12
        )}/ano).`
      );
    parts.push("Quero o diagnóstico com a minha folha real.");
    return parts.join(" ");
  }

  async function onSubmit(values: DiagnosticInput) {
    setServerState({ status: "loading" });
    try {
      const rep = readRep() ?? undefined;
      const payload: DiagnosticInput = {
        ...values,
        type: "diagnostico",
        rep,
      };
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.success) {
        setServerState({
          status: "error",
          message:
            data?.message ??
            "Nao foi possivel enviar agora. Tente o WhatsApp ao lado.",
        });
        return;
      }
      setServerState({ status: "success" });
      // Redireciona para WhatsApp com mensagem preenchida
      const number =
        process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || FALLBACK_NUMBER;
      const href = buildWhatsAppHref(
        number,
        buildWhatsAppMessage(values.name, values.cnpj || undefined)
      );
      // Pequeno delay para mostrar sucesso antes do redirect
      setTimeout(() => {
        window.open(href, "_blank", "noopener,noreferrer");
      }, 600);
    } catch {
      setServerState({
        status: "error",
        message: "Falha de conexao. Tente novamente em alguns segundos.",
      });
    }
  }

  function handleClose(next: boolean) {
    onOpenChange(next);
    if (!next) {
      reset({
        type: "diagnostico",
        segment: context.segment as DiagnosticInput["segment"] | undefined,
        monthly_revenue_band: context.revenueBandId,
        estimated_monthly_savings: context.monthlySavings,
      });
      setServerState({ status: "idle" });
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="inline-flex items-center gap-2 text-accent-600">
            <Sparkles className="h-4 w-4" aria-hidden />
            <span className="text-xs font-bold uppercase tracking-widest">
              Diagnóstico preciso
            </span>
          </div>
          <DialogTitle className="font-display text-2xl font-extrabold text-primary-600">
            {context.monthlySavings
              ? `Você pode economizar ${formatBRL(context.monthlySavings)}/mês`
              : "Um especialista refaz o cálculo com seus números reais."}
          </DialogTitle>
          <DialogDescription>
            Deixe seu WhatsApp. A gente refaz o cálculo com a sua folha real
            e o seu Anexo correto — sem custo, sem compromisso.
          </DialogDescription>
        </DialogHeader>

        {serverState.status === "success" ? (
          <div className="rounded-xl border-2 border-accent-300 bg-accent-50 p-5 text-center">
            <CheckCircle2
              className="h-9 w-9 text-accent-600 mx-auto mb-2"
              aria-hidden
            />
            <p className="font-display text-base font-bold text-primary-600 mb-1">
              Estamos te levando ao WhatsApp...
            </p>
            <p className="text-sm text-text/80">
              Se a janela não abrir, clique no botão abaixo.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="diag-name">Seu nome</Label>
              <Input
                id="diag-name"
                autoComplete="name"
                placeholder="Como devemos te chamar?"
                {...register("name")}
                aria-invalid={!!errors.name}
              />
              {errors.name && (
                <p className="text-xs text-warm-600" role="alert">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="diag-whatsapp">WhatsApp</Label>
              <Input
                id="diag-whatsapp"
                type="tel"
                inputMode="tel"
                autoComplete="tel-national"
                placeholder="(11) 99999-9999"
                {...register("whatsapp")}
                aria-invalid={!!errors.whatsapp}
              />
              {errors.whatsapp && (
                <p className="text-xs text-warm-600" role="alert">
                  {errors.whatsapp.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="diag-cnpj">
                CNPJ <span className="text-muted font-normal">(opcional)</span>
              </Label>
              <Input
                id="diag-cnpj"
                inputMode="numeric"
                placeholder="00.000.000/0000-00"
                {...register("cnpj")}
                aria-invalid={!!errors.cnpj}
              />
              {errors.cnpj && (
                <p className="text-xs text-warm-600" role="alert">
                  {errors.cnpj.message}
                </p>
              )}
              <p className="text-[11px] text-muted">
                Acelera o diagnóstico — a gente já puxa o seu Anexo correto e
                a faixa real do Simples.
              </p>
            </div>

            <Button
              type="submit"
              variant="default"
              size="lg"
              className="w-full"
              disabled={serverState.status === "loading"}
            >
              {serverState.status === "loading" ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  Enviando...
                </>
              ) : (
                <>
                  <MessageCircle className="h-4 w-4" aria-hidden />
                  Receber diagnóstico no WhatsApp
                </>
              )}
            </Button>

            {serverState.status === "error" && serverState.message && (
              <p className="text-xs text-warm-600 text-center" role="alert">
                {serverState.message}
              </p>
            )}

            <p className="text-[11px] text-muted text-center text-pretty">
              Você só recebe contato pelo WhatsApp. Sem spam, sem ligação de robô.
            </p>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
