import Link from "next/link";
import { CTAWhatsApp } from "@/components/CTAWhatsApp";
import { Button } from "@/components/ui/button";
import type { Segment } from "@/lib/segments";

export function SegmentHero({ segment }: { segment: Segment }) {
  return (
    <section className="gradient-hero">
      <div className="container-page pt-14 pb-16 md:pt-20 md:pb-20">
        <p className="text-xs font-bold uppercase tracking-widest text-accent-600 mb-4">
          {segment.name} · Simples Nacional
        </p>
        <h1 className="font-display text-4xl md:text-6xl font-extrabold text-primary-600 leading-[1.05] tracking-tight max-w-4xl text-balance">
          {segment.headline.replace(", pague com split.", ", ")}
          <span className="text-accent-600">pague com split.</span>
        </h1>
        <p className="mt-6 text-lg md:text-2xl text-text/80 max-w-3xl text-pretty">
          {segment.hook_question}
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <CTAWhatsApp
            message={segment.whatsapp_message}
            label="Quero economizar"
            size="xl"
          />
          <Button asChild variant="ghost" size="xl">
            <Link href="#simulador">ou simule sua economia aqui ↓</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
