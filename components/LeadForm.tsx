"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Loader2 } from "lucide-react";
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
import { leadSchema, type LeadInput } from "@/lib/schemas";
import { segments, REVENUE_RANGES } from "@/lib/segments";
import { readRep } from "./RepTracker";
import { cn } from "@/lib/utils";

type Props = {
  defaultSegment?: string;
  className?: string;
};

export function LeadForm({ defaultSegment, className }: Props) {
  const [serverState, setServerState] = useState<
    { status: "idle" | "loading" | "success" | "error"; message?: string }
  >({ status: "idle" });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<LeadInput>({
    resolver: zodResolver(leadSchema),
    defaultValues: {
      type: "cliente",
      segment: defaultSegment as LeadInput["segment"] | undefined,
    },
  });

  const segment = watch("segment");
  const revenue = watch("monthly_revenue_range");

  async function onSubmit(values: LeadInput) {
    setServerState({ status: "loading" });
    try {
      const rep = readRep() ?? undefined;
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, rep }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.success) {
        setServerState({
          status: "error",
          message:
            data?.message ??
            "Não foi possível enviar agora. Tente o WhatsApp ao lado.",
        });
        return;
      }
      setServerState({
        status: "success",
        message:
          "Recebemos! Um especialista vai te chamar no WhatsApp em instantes.",
      });
      reset({
        type: "cliente",
        segment: defaultSegment as LeadInput["segment"] | undefined,
      });
    } catch {
      setServerState({
        status: "error",
        message: "Falha de conexão. Tente novamente em alguns segundos.",
      });
    }
  }

  if (serverState.status === "success") {
    return (
      <div
        className={cn(
          "rounded-xl border-2 border-accent-300 bg-accent-50 p-6 md:p-8 text-center",
          className
        )}
      >
        <CheckCircle2 className="h-10 w-10 text-accent-600 mx-auto mb-3" aria-hidden />
        <h3 className="font-display text-xl font-bold text-primary-600 mb-2">
          Recebemos seu contato!
        </h3>
        <p className="text-sm text-text/80">{serverState.message}</p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className={cn(
        "rounded-xl border border-slate-100 bg-white p-6 md:p-8 shadow-card space-y-5",
        className
      )}
    >
      <div className="space-y-2">
        <Label htmlFor="lead-name">Nome completo</Label>
        <Input
          id="lead-name"
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

      <div className="space-y-2">
        <Label htmlFor="lead-whatsapp">WhatsApp</Label>
        <Input
          id="lead-whatsapp"
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

      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Segmento</Label>
          <Select
            value={segment}
            onValueChange={(v) =>
              setValue("segment", v as LeadInput["segment"], {
                shouldValidate: true,
              })
            }
          >
            <SelectTrigger aria-invalid={!!errors.segment}>
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
          {errors.segment && (
            <p className="text-xs text-warm-600" role="alert">
              {errors.segment.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Faturamento mensal</Label>
          <Select
            value={revenue}
            onValueChange={(v) =>
              setValue(
                "monthly_revenue_range",
                v as LeadInput["monthly_revenue_range"],
                { shouldValidate: true }
              )
            }
          >
            <SelectTrigger aria-invalid={!!errors.monthly_revenue_range}>
              <SelectValue placeholder="Faixa estimada" />
            </SelectTrigger>
            <SelectContent>
              {REVENUE_RANGES.map((r) => (
                <SelectItem key={r.value} value={r.value}>
                  {r.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.monthly_revenue_range && (
            <p className="text-xs text-warm-600" role="alert">
              {errors.monthly_revenue_range.message}
            </p>
          )}
        </div>
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
          "Falar com um especialista"
        )}
      </Button>

      {serverState.status === "error" && serverState.message && (
        <p className="text-sm text-warm-600 text-center" role="alert">
          {serverState.message}
        </p>
      )}

      <p className="text-xs text-muted text-center text-pretty">
        Ao enviar, você concorda em receber contato comercial sobre o split de
        pagamento. Sem spam.
      </p>
    </form>
  );
}
