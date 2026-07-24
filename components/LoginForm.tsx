"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Loader2, Lock, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const loginSchema = z.object({
  email: z.string().trim().email("E-mail inválido."),
  password: z.string().min(1, "Informe a senha."),
});

type LoginInput = z.infer<typeof loginSchema>;

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(values: LoginInput) {
    setLoading(true);
    setServerError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data?.success) {
        setServerError(data?.message ?? "Erro ao entrar. Tente novamente.");
        return;
      }

      // Redireciona para o portal (full navigation para garantir cookies)
      window.location.href = "/portal";
    } catch {
      setServerError("Falha de conexão. Verifique sua internet e tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      {/* E-mail */}
      <div className="space-y-2">
        <Label htmlFor="login-email">E-mail</Label>
        <div className="relative">
          <Mail
            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted pointer-events-none"
            aria-hidden
          />
          <Input
            id="login-email"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="voce@email.com"
            className={cn("pl-10", errors.email && "border-warm-500 focus-visible:ring-warm-500")}
            {...register("email")}
            aria-invalid={!!errors.email}
          />
        </div>
        {errors.email && (
          <p className="text-xs text-warm-600" role="alert">
            {errors.email.message}
          </p>
        )}
      </div>

      {/* Senha */}
      <div className="space-y-2">
        <Label htmlFor="login-password">Senha</Label>
        <div className="relative">
          <Lock
            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted pointer-events-none"
            aria-hidden
          />
          <Input
            id="login-password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder="••••••••"
            className={cn(
              "pl-10 pr-10",
              errors.password && "border-warm-500 focus-visible:ring-warm-500"
            )}
            {...register("password")}
            aria-invalid={!!errors.password}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink transition-colors"
            aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" aria-hidden />
            ) : (
              <Eye className="h-4 w-4" aria-hidden />
            )}
          </button>
        </div>
        {errors.password && (
          <p className="text-xs text-warm-600" role="alert">
            {errors.password.message}
          </p>
        )}
      </div>

      {/* Erro de servidor */}
      {serverError && (
        <div
          className="rounded-lg bg-warm-500/10 border border-warm-500/30 px-4 py-3 text-sm text-warm-600"
          role="alert"
        >
          {serverError}
        </div>
      )}

      <Button
        type="submit"
        variant="default"
        size="lg"
        className="w-full"
        disabled={loading}
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            Entrando…
          </>
        ) : (
          "Acessar minha conta"
        )}
      </Button>

      <p className="text-xs text-center text-muted">
        Problemas para acessar?{" "}
        <a
          href="https://wa.me/553195719123?text=Preciso+de+ajuda+para+acessar+o+portal+paguecomsplit"
          target="_blank"
          rel="noopener noreferrer"
          className="text-accent-600 hover:underline font-semibold"
        >
          Fale com o suporte
        </a>
      </p>
    </form>
  );
}
