import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const brl = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 0,
});

const brlCents = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatBRL(value: number, withCents = false): string {
  if (!Number.isFinite(value)) return "R$ 0";
  return (withCents ? brlCents : brl).format(value);
}

export function formatPercent(value: number, fractionDigits = 1): string {
  const v = value > 1 ? value : value * 100;
  return `${v.toFixed(fractionDigits).replace(".", ",")}%`;
}

export function buildWhatsAppHref(phoneE164: string, message: string): string {
  const digits = phoneE164.replace(/\D/g, "");
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${digits}?text=${encoded}`;
}
