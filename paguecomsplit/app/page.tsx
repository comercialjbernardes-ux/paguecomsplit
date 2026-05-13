import { NavBar } from "@/components/NavBar";
import { Footer } from "@/components/Footer";
import { SegmentGrid } from "@/components/SegmentGrid";
import { EconomySimulator } from "@/components/EconomySimulator";
import { TrustBadges } from "@/components/TrustBadges";
import { AnimatedNumber } from "@/components/AnimatedNumber";
import { HomeHero } from "@/components/sections/HomeHero";
import { NarrativaPonte } from "@/components/sections/NarrativaPonte";
import { SplitExplainer } from "@/components/sections/SplitExplainer";
import { HomeHowItWorks } from "@/components/sections/HomeHowItWorks";
import { RepresentantesTeaser } from "@/components/sections/RepresentantesTeaser";

const HOME_WHATSAPP =
  "Oi, vi o paguecomsplit.com.br e quero entender como deixar de pagar DAS sobre a receita do meu parceiro.";

export default function HomePage() {
  return (
    <>
      <NavBar />
      <main>
        {/* 1. Hero (com imagem) */}
        <HomeHero whatsappMessage={HOME_WHATSAPP} />

        {/* 1.5 Narrativa-ponte (tom conversa, prepara terreno) */}
        <NarrativaPonte />

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
              Você paga DAS sobre dinheiro que repassa. O seu parceiro paga DAS sobre o mesmo dinheiro. Isso é bitributação.
            </h2>

            <div className="mt-10 grid gap-8 md:grid-cols-3">
              <StatBlock
                value={50}
                suffix="%+"
                label="Redução possível no DAS"
                desc="dependendo do % que pertence ao parceiro e da sua faixa do Simples"
              />
              <StatBlock
                value={2}
                suffix="×"
                label="Você + seu parceiro pagam"
                desc="o mesmo R$ que passou na maquininha vira imposto duas vezes — uma na sua conta, outra na do parceiro"
              />
              <StatBlock
                value={22104}
                prefix="R$ "
                label="Economia anual média"
                desc="exemplo calibrado para quem fatura R$ 45k/mês com 40% do faturamento pertencendo a parceiros (Anexo III, faixa 3)"
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
              Quanto você está perdendo de DAS por mês?
            </h2>
            <p className="text-muted text-pretty">
              Escolha seu segmento e veja o resultado em tempo real. O
              simulador respeita as faixas reais do Simples Nacional.
            </p>
          </div>
          <EconomySimulator whatsappMessage={HOME_WHATSAPP} />
        </section>

        {/* 6. Escolha seu segmento */}
        <section id="segmentos" className="bg-white border-y border-slate-100">
          <div className="container-page py-12 md:py-16">
            <div className="max-w-2xl mb-8">
              <p className="text-xs font-bold uppercase tracking-widest text-accent-600 mb-3">
                Aprofunde no seu caso
              </p>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-primary-600 mb-3 text-balance">
                Cada segmento, uma dor específica.
              </h2>
              <p className="text-muted text-pretty">
                Veja o cálculo já calibrado para o seu negócio, com o exemplo
                real e depoimento, quando aplicável.
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

