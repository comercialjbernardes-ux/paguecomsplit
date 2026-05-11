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
import { representanteSchema, type RepresentanteInput } from "@/lib/schemas";
import { readRep } from "./RepTracker";
import { cn } from "@/lib/utils";

const PROFILES: { value: RepresentanteInput["profile"]; label: string }[] = [
  { value: "consultor_tributario", label: "Consultor tributário" },
  { value: "contador", label: "Contador" },
  { value: "corretor", label: "Corretor" },
  { value: "vendedor_autonomo", label: "Vendedor autônomo" },
  { value: "outro", label: "Outro" },
];

export function RepresentanteForm({ className }: { className?: string }) {
  const [state, setState] = useState<{
    status: "idle" | "loading" | "success" | "error";
    message?: string;
  }>({ status: "idle" });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<RepresentanteInput>({
    resolver: zodResolver(representanteSchema),
    defaultValues: { type: "representante" },
  });

  const profile = watch("profile");

  async function onSubmit(values: RepresentanteInput) {
    setState({ status: "loading" });
    try {
      const rep = readRep() ?? undefined;
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, rep }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.success) {
        setState({
          status: "error",
          message:
            data?.message ?? "Não foi possível enviar agora. Tente novamente.",
        });
        return;
      }
      setState({
        status: "success",
        message:
          "Cadastro recebido! Em até 1 dia útil você recebe seu material e links rastreados.",
      });
      reset({ type: "representante" });
    } catch {
      setState({
        status: "error",
        message: "Falha de conexão. Tente novamente em instantes.",
      });
    }
  }

  if (state.status === "success") {
    return (
      <div
        className={cn(
          "rounded-xl border-2 border-accent-300 bg-accent-50 p-6 md:p-8 text-center",
          className
        )}
      >
        <CheckCircle2 className="h-10 w-10 text-accent-600 mx-auto mb-3" aria-hidden />
        <h3 className="font-display text-xl font-bold text-primary-600 mb-2">
          Cadastro recebido!
        </h3>
        <p className="text-sm text-text/80">{state.message}</p>
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
      <div className="grid gap-5 md:grid-cols-2">
        <Group label="Nome completo" error={errors.name?.message}>
          <Input
            autoComplete="name"
            placeholder="Seu nome"
            {...register("name")}
            aria-invalid={!!errors.name}
          />
        </Group>

        <Group label="CPF / CNPJ" error={errors.document?.message}>
          <Input
            inputMode="numeric"
            placeholder="000.000.000-00"
            {...register("document")}
            aria-invalid={!!errors.document}
          />
        </Group>

        <Group label="WhatsApp" error={errors.whatsapp?.message}>
          <Input
            type="tel"
            inputMode="tel"
            autoComplete="tel-national"
            placeholder="(11) 99999-9999"
            {...register("whatsapp")}
            aria-invalid={!!errors.whatsapp}
          />
        </Group>

        <Group label="E-mail" error={errors.email?.message}>
          <Input
            type="email"
            autoComplete="email"
            placeholder="voce@exemplo.com.br"
            {...register("email")}
            aria-invalid={!!errors.email}
          />
        </Group>

        <Group label="Cidade / UF" error={errors.city?.message}>
          <Input
            autoComplete="address-level2"
            placeholder="São Paulo / SP"
            {...register("city")}
            aria-invalid={!!errors.city}
          />
        </Group>

        <Group label="Perfil" error={errors.profile?.message}>
          <Select
            value={profile}
            onValueChange={(v) =>
              setValue("profile", v as RepresentanteInput["profile"], {
                shouldValidate: true,
              })
            }
          >
            <SelectTrigger aria-invalid={!!errors.profile}>
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              {PROFILES.map((p) => (
                <SelectItem key={p.value} value={p.value}>
                  {p.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Group>
      </div>

      <Button
        type="submit"
        variant="default"
        size="lg"
        className="w-full"
        disabled={state.status === "loading"}
      >
        {state.status === "loading" ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            Enviando...
          </>
        ) : (
          "Quero ser representante"
        )}
      </Button>

      {state.status === "error" && state.message && (
        <p className="text-sm text-warm-600 text-center" role="alert">
          {state.message}
        </p>
      )}
    </form>
  );
}

function Group({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
      {error && (
        <p className="text-xs text-warm-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
