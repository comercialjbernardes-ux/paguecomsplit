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
import { HomeMicroFaq } from "@/components/sections/HomeMicroFaq";
import { RepresentantesTeaser } from "@/components/sections/RepresentantesTeaser";
import { segments } from "@/lib/segments";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://paguecomsplit.com.br";

const HOME_WHATSAPP =
  "Oi, vi o paguecomsplit.com.br e quero entender como deixar de pagar DAS sobre a receita do meu parceiro.";

export default function HomePage() {
  return (
    <>
      <NavBar />
      <main>
        {/* 1. Hero */}
        <HomeHero whatsappMessage={HOME_WHATSAPP} />

        {/* 1.5 Narrativa-ponte */}
        <NarrativaPonte />

        {/* 2. O que é split */}
        <SplitExplainer />

        {/* 3. Como funciona — diagrama */}
        <HomeHowItWorks />

        {/* 4. Bitributação silenciosa (bloco escuro com 3 stats) */}
        <section className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white overflow-hidden">
          <div className="absolute -top-40 -right-40 w-[480px] h-[480px] rounded-full bg-accent-500/15 blur-3xl" aria-hidden />
          <div className="absolute -bottom-40 -left-40 w-[420px] h-[420px] rounded-full bg-warm-500/10 blur-3xl" aria-hidden />

          <div className="relative container-page py-16 md:py-24">
            <p className="text-xs font-bold uppercase tracking-[.25em] text-accent-300 mb-4 text-center">
              Bitributação silenciosa
            </p>
            <h2 className="font-display text-3xl md:text-5xl font-bold text-center text-balance max-w-4xl mx-auto leading-[1.1]">
              Você paga DAS sobre dinheiro que repassa. O seu parceiro paga DAS
              sobre o mesmo dinheiro.{" "}
              <span className="text-warm-500">Isso é bitributação.</span>
            </h2>

            <div className="mt-14 grid gap-10 md:gap-6 md:grid-cols-3">
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
        <section id="simulador" className="container-page py-14 md:py-20">
          <div className="max-w-2xl mx-auto text-center mb-12">
            <p className="text-xs font-bold uppercase tracking-[.2em] text-accent-600 mb-3">
              Simulador
            </p>
            <h2 className="font-display text-3xl md:text-5xl font-bold text-primary-600 mb-4 text-balance leading-[1.05]">
              Quanto você poderia economizar por mês?
            </h2>
            <p className="text-lg text-muted text-pretty">
              Escolha seu segmento e veja o resultado em tempo real. O simulador
              respeita as faixas reais do Simples Nacional.
            </p>
          </div>
          <EconomySimulator whatsappMessage={HOME_WHATSAPP} />
        </section>

        {/* 6. Segmentos */}
        <section id="segmentos" className="bg-white border-y border-slate-100">
          <div className="container-page py-12 md:py-16">
            <div className="max-w-2xl mx-auto text-center mb-10">
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
            <nav aria-label="Segmentos atendidos">
              <SegmentGrid />
            </nav>
          </div>
        </section>

        {/* 7. Trust badges */}
        <TrustBadges />

        {/* 7.5 Micro-FAQ */}
        <HomeMicroFaq />

        {/* 8. Representantes */}
        <RepresentantesTeaser />
      </main>
      <Footer />

      {/* ItemList JSON-LD */}
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: "Segmentos atendidos pelo Split de Pagamento SplitTech",
            itemListOrder: "https://schema.org/ItemListOrderAscending",
            numberOfItems: segments.length,
            itemListElement: segments.map((s, i) => ({
              "@type": "ListItem",
              position: i + 1,
              name: s.name,
              url: `${SITE_URL}/${s.slug}`,
              description: s.pain,
            })),
          }),
        }}
      />
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
    <div className="relative text-center md:text-left">
      <div className="absolute -left-4 top-0 h-full w-0.5 bg-gradient-to-b from-accent-300/60 via-accent-400/30 to-transparent hidden md:block" aria-hidden />
      <p className="font-display text-6xl md:text-7xl font-extrabold text-white leading-[.9] tracking-tight tabular-nums">
        {prefix}
        <AnimatedNumber value={value} />
        {suffix && <span className="text-accent-300">{suffix}</span>}
      </p>
      <p className="mt-4 font-display font-bold text-lg text-accent-300">{label}</p>
      <p className="text-sm text-white/55 mt-2 text-pretty leading-relaxed">{desc}</p>
    </div>
  );
}
