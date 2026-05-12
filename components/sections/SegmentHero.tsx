import Link from "next/link";
import { AlertOctagon } from "lucide-react";
import { CTAWhatsApp } from "@/components/CTAWhatsApp";
import { Button } from "@/components/ui/button";
import type { Segment } from "@/lib/segments";

export function SegmentHero({ segment }: { segment: Segment }) {
  return (
    <section className="gradient-hero">
      <div className="container-page pt-14 pb-14 md:pt-20 md:pb-16">
        <p className="inline-flex items-center gap-2 rounded-full bg-warm-500/10 text-warm-700 px-3 py-1 text-xs font-bold uppercase tracking-widest mb-5">
          <AlertOctagon className="h-3.5 w-3.5" aria-hidden />
          Evite bitributação.
        </p>

        <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-extrabold text-primary-600 leading-[1.05] tracking-tight max-w-4xl text-balance">
          {segment.headline}
        </h1>

        <p className="mt-5 text-lg md:text-xl text-text/80 max-w-2xl text-pretty">
          Não seja mais tributado pela receita do parceiro. A SplitTech
          administra a divisão do pagamento <strong>antes do DAS incidir</strong>{" "}
          — você passa a tributar só a sua margem real.
        </p>

        <p className="mt-5 text-sm font-semibold text-primary-600/80">
          Cappta · +R$ 7 bi/ano processados · Regulado BACEN
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <CTAWhatsApp
            message={segment.whatsapp_message}
            label="Quero economizar agora"
            size="xl"
          />
          <Button asChild variant="outline" size="xl">
            <Link href="#simulador">Calcular minha economia</Link>
          </Button>
        </div>

        <p className="mt-5 text-xs text-muted">
          Cancele quando quiser · Maquininha grátis · Suporte humano em
          português
        </p>
      </div>
    </section>
  );
}
