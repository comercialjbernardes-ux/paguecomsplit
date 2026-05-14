"use client";

import Link from "next/link";
import { motion } from "framer-motion";
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
  ArrowRight,
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
    <ul
      className={cn(
        "grid gap-4 sm:grid-cols-2 lg:grid-cols-4",
        className
      )}
      role="list"
    >
      {segments.map((s, i) => {
        const Icon = ICONS[s.slug] ?? Sparkles;
        const highlighted = highlightSlug === s.slug;
        return (
          <motion.li
            key={s.slug}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.35, delay: i * 0.04 }}
          >
            <Link
              href={`/${s.slug}`}
              className={cn(
                "group relative flex h-full flex-col rounded-xl border bg-white p-5 shadow-soft transition-all hover:-translate-y-0.5 hover:border-accent-300 hover:shadow-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                highlighted
                  ? "border-accent-500 ring-2 ring-accent-200"
                  : "border-slate-100"
              )}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-accent-50 text-accent-600 transition-colors group-hover:bg-accent-100">
                  <Icon className="h-6 w-6" aria-hidden />
                </span>
                <ArrowRight
                  className="h-4 w-4 text-muted opacity-0 transition-all group-hover:translate-x-1 group-hover:opacity-100"
                  aria-hidden
                />
              </div>
              <h3 className="font-display text-lg font-bold text-primary-600 mb-1 leading-tight">
                {s.name}
              </h3>
              <p className="text-sm text-muted leading-snug text-pretty">
                {s.pain}
              </p>
            </Link>
          </motion.li>
        );
      })}
    </ul>
  );
}
