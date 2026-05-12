import { NavBar } from "@/components/NavBar";
import { Footer } from "@/components/Footer";
import { SegmentGrid } from "@/components/SegmentGrid";
import { EconomySimulator } from "@/components/EconomySimulator";
import { TrustBadges } from "@/components/TrustBadges";
import { AnimatedNumber } from "@/components/AnimatedNumber";
import { HomeHero } from "@/components/sections/HomeHero";
import { SplitExplainer } from "@/components/sections/SplitExplainer";
import { HomeHowItWorks } from "@/components/sections/HomeHowItWorks";
import { RepresentantesTeaser } from "@/components/sections/RepresentantesTeaser";

const HOME_WHATSAPP =
  "Olá! Vi o paguecomsplit.com.br e quero entender como o split reduz meu imposto.";

export default function HomePage() {
  return (
    <>
      <NavBar />
      <main>
        {/* 1. Hero (com imagem) */}
        <HomeHero whatsappMessage={HOME_WHATSAPP} />

        {/* 2. O que e split */}
        <SplitExplainer />

        {/* 3. Como funciona — diagrama */}
        <HomeHowItWorks />

        {/* 4. Bitributacao silenciosa (numeros) */}
        <section className="bg-primary-600 text-white">
          <div className="container-page py-12 md:py-16">
            <p className="text-xs font-bold uppercase tracking-widest text-accent-300 mb-3 text-center">
              Bitributação silenciosa
            </p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-center text-balance max-w-3xl mx-auto">
              Negócios do Simples pagam imposto sobre dinheiro que repassam a terceiros — duas vezes.
            </h2>

            <div className="mt-10 grid gap-8 md:grid-cols-3">
              <StatBlock
                value={50}
                suffix="%+"
                label="Redução tributária possível"
                desc="dependendo do % de repasse e da faixa do Simples"
              />
              <StatBlock
                value={2}
                suffix="×"
                label="Imposto sobre o mesmo R$"
                desc="o terceiro tributa o repasse dele e você tributa o mesmo dinheiro de novo"
              />
              <StatBlock
                value={14}
                suffix=" anos"
                label="de infraestrutura Cappta"
                desc="mais de R$ 7 bi processados por ano, regulado pelo BACEN"
              />
            </div>
          </div>
        </section>

        {/* 5. Simulador */}
        <section id="simulador" className="container-page py-12 md:py-16">
          <div className="max-w-2xl mb-8">
            <p className="text-xs font-bold uppercase tracking-widest text-accent-600 mb-3">
              Simulador
            </p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-primary-600 mb-3 text-balance">
              Quanto você está pagando a mais?
            </h2>
            <p className="text-muted text-pretty">
              Ajuste os números para o seu negócio e veja a diferença em tempo
              real. Cálculo client-side, sem cadastro.
            </p>
          </div>
          <EconomySimulator whatsappMessage={HOME_WHATSAPP} />
        </section>

        {/* 6. Escolha seu segmento */}
        <section id="segmentos" className="bg-white border-y border-slate-100">
          <div className="container-page py-12 md:py-16">
            <div className="max-w-2xl mb-8">
              <p className="text-xs font-bold uppercase tracking-widest text-accent-600 mb-3">
                Aprofunde no seu segmento
              </p>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-primary-600 mb-3 text-balance">
                Clique no seu tipo de negócio e veja o cálculo já calibrado.
              </h2>
              <p className="text-muted text-pretty">
                Cada landing page traz a dor específica do seu segmento — com
                exemplo numérico real e depoimento, quando aplicável.
              </p>
            </div>
            <SegmentGrid />
          </div>
        </section>

        {/* 7. Trust */}
        <TrustBadges />

        {/* 8. Representantes teaser */}
        <RepresentantesTeaser />
      </main>
      <Footer />
    </>
  );
}

function StatBlock({
  value,
  prefix,
  suffix,
  label,
  desc,
}: {
  value: number;
  prefix?: string;
  suffix?: string;
  label: string;
  desc: string;
}) {
  return (
    <div className="text-center md:text-left">
      <p className="font-display text-5xl md:text-6xl font-extrabold text-white leading-none tracking-tight">
        {prefix}
        <AnimatedNumber value={value} />
        {suffix}
      </p>
      <p className="mt-3 font-semibold text-accent-300">{label}</p>
      <p className="text-sm text-white/60 mt-1 text-pretty">{desc}</p>
    </div>
  );
}

