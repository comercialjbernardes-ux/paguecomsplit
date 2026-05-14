import Image from "next/image";
import Link from "next/link";
import { AlertOctagon } from "lucide-react";
import { CTAWhatsApp } from "@/components/CTAWhatsApp";
import { Button } from "@/components/ui/button";

type HomeHeroProps = {
  whatsappMessage: string;
};

// F3 — A/B test feature flag (ativar quando Google Ads tiver tráfego suficiente)
// NEXT_PUBLIC_HERO_VARIANT=A → "Pare de tributar a receita do seu parceiro."
// NEXT_PUBLIC_HERO_VARIANT=B → "Reduza até 50% do seu DAS sem mudar nada na operação."
const HERO_VARIANT = process.env.NEXT_PUBLIC_HERO_VARIANT ?? "A";

const H1_VARIANTS: Record<string, React.ReactNode> = {
  A: (
    <>
      Pare de tributar a{" "}
      <span className="text-warm-500">receita do seu parceiro.</span>
    </>
  ),
  B: (
    <>
      Reduza até <span className="text-warm-500">50% do seu DAS</span> sem
      mudar nada na operação.
    </>
  ),
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
              {H1_VARIANTS[HERO_VARIANT] ?? H1_VARIANTS["A"]}
            </h1>

            <p className="mt-5 text-lg md:text-xl text-text/80 max-w-xl text-pretty">
              A SplitTech administra a divisão do pagamento{" "}
              <strong>antes do DAS incidir</strong> — cada parte vai para o
              dono dela e você tributa só a sua receita. Não seja mais
              tributado pela receita do seu parceiro.
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
                fetchPriority="high"
                className="w-full h-auto"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
