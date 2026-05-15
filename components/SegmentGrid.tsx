"use client";

import Link from "next/link";
import {
  UtensilsCrossed,
  Stethoscope,
  Sparkles,
  Smile,
  Dog,
  Wrench,
  HardHat,
  Shirt,
  Dumbbell,
  Factory,
  type LucideIcon,
} from "lucide-react";
import { segments } from "@/lib/segments";
import { cn } from "@/lib/utils";

const ICONS: Record<string, LucideIcon> = {
  restaurante: UtensilsCrossed,
  veterinaria: Stethoscope,
  estetica: Sparkles,
  odontologia: Smile,
  petshop: Dog,
  oficina: Wrench,
  construcao: HardHat,
  vestuario: Shirt,
  academia: Dumbbell,
  industria: Factory,
};

type Props = {
  className?: string;
  highlightSlug?: string;
};

export function SegmentGrid({ className, highlightSlug }: Props) {
  return (
    <ul className={cn("grid gap-4 sm:grid-cols-2 lg:grid-cols-4", className)} role="list">
      {segments.map((s, i) => {
        const Icon = ICONS[s.slug] ?? Sparkles;
        const highlighted = highlightSlug === s.slug;
        const bgClass = `seg-bg-${((i % 7) + 1)}`;
        return (
          <li key={s.slug}>
            <Link
              href={`/${s.slug}`}
              className={cn(
                "seg-card",
                bgClass,
                highlighted && "ring-2 ring-accent-200"
              )}
            >
              <div className="seg-glow" />
              <div className="seg-check">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <span className="seg-icon mb-5">
                <Icon className="h-6 w-6" aria-hidden />
              </span>
              <h3 className="font-display text-lg font-bold text-primary-600 mb-1.5 leading-tight">
                {s.name}
              </h3>
              <p className="text-sm text-text/70 leading-relaxed text-pretty">{s.pain}</p>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
