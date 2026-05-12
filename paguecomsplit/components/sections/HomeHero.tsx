import Image from "next/image";
import Link from "next/link";
import { AlertOctagon } from "lucide-react";
import { CTAWhatsApp } from "@/components/CTAWhatsApp";
import { Button } from "@/components/ui/button";

type HomeHeroProps = {
  whatsappMessage: string;
};

export function HomeHero({ whatsappMessage }: HomeHeroProps) {
  return (
    <section className="gradient-hero">
      <div className="container-page pt-14 pb-14 md:pt-20 md:pb-16">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Copy */}
          <div className="lg:col-span-7">
            <p className="inline-flex items-center gap-2 rounded-full bg-warm-500/10 text-warm-700 px-3 py-1 text-xs font-bold uppercase tracking-widest mb-5">
              <AlertOctagon className="h-3.5 w-3.5" aria-hidden />
              Evite bitributação.
            </p>

            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-extrabold text-primary-600 leading-[1.05] tracking-tight text-balance">
              Pare de tributar a receita do seu parceiro.
            </h1>

            <p className="mt-5 text-lg md:text-xl text-text/80 max-w-xl text-pretty">
              Você fatura R$ 30k–R$ 360k/mês? A SplitTech administra a divisão
              do pagamento <strong>antes do DAS incidir</strong> — cada parte
              vai para o dono dela e você tributa só a sua margem real.
            </p>

            <p className="mt-5 text-sm font-semibold text-primary-600/80">
              Cappta · +R$ 7 bi/ano processados · Regulado BACEN
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <CTAWhatsApp
                message={whatsappMessage}
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

          {/* Imagem */}
          <div className="lg:col-span-5 order-first lg:order-last">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              <Image
                src="/hero/maquininha-split.svg"
                alt="Maquininha com split: cliente paga R$ 6.000, dividido em R$ 2.400 sua margem e R$ 3.600 do parceiro — antes do DAS incidir"
                width={480}
                height={480}
                priority
                className="w-full h-auto"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
