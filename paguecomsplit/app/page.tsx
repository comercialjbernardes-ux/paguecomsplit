import Link from "next/link";
import { ArrowRight, TrendingDown, Building2 } from "lucide-react";
import { NavBar } from "@/components/NavBar";
import { Footer } from "@/components/Footer";
import { SegmentGrid } from "@/components/SegmentGrid";
import { EconomySimulator } from "@/components/EconomySimulator";
import { TrustBadges } from "@/components/TrustBadges";
import { AnimatedNumber } from "@/components/AnimatedNumber";
import { HomeHero } from "@/components/sections/HomeHero";
import { SplitExplainer } from "@/components/sections/SplitExplainer";
import { Button } from "@/components/ui/button";

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

        {/* 3. Como funciona */}
        <section className="bg-white">
          <div className="container-page py-12 md:py-16">
            <div className="grid md:grid-cols-2 gap-10 items-center">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-accent-600 mb-3">
                  Como funciona
                </p>
                <h2 className="font-display text-3xl md:text-4xl font-bold text-primary-600 mb-4 text-balance">
                  O Cofre Digital separa o que é seu do que é de terceiros.
                </h2>
                <p className="text-text/80 leading-relaxed mb-4">
                  No POS SplitTech, cada pagamento é dividido automaticamente.
                  A parte do terceiro (parceiro, fornecedor, autônomo) cai
                  direto na conta dele — fora do seu DAS.
                </p>
                <p className="text-text/80 leading-relaxed mb-6">
                  Você passa a tributar só a sua margem real. O resto é
                  contabilizado onde deve ser: na pessoa certa.
                </p>
                <Button asChild variant="primary" size="lg">
                  <Link href="/como-funciona">
                    Entender em detalhes
                    <ArrowRight className="h-4 w-4" aria-hidden />
                  </Link>
                </Button>
              </div>

              <div className="grid gap-4">
                <FlowCard tone="warm" title="Sem split">
                  Cliente paga R$ 6.000 → tudo entra na sua conta → imposto
                  incide sobre R$ 6.000 → você repassa depois → tributou
                  receita que nunca foi sua.
                </FlowCard>
                <FlowCard tone="accent" title="Com Cofre Digital">
                  Cliente paga R$ 6.000 → split automático separa R$ 2.400 sua
                  / R$ 3.600 do terceiro → imposto incide só sobre R$ 2.400 →
                  cada parte tributa o que é dela.
                </FlowCard>
              </div>
            </div>
          </div>
        </section>

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
        <section className="container-page py-12 md:py-16">
          <div className="rounded-2xl bg-gradient-to-br from-primary-600 to-primary-800 text-white p-8 md:p-12 flex flex-col md:flex-row md:items-center gap-6 md:gap-10">
            <Building2 className="h-12 w-12 text-accent-300 flex-none" aria-hidden />
            <div className="flex-1">
              <p className="text-xs font-bold uppercase tracking-widest text-accent-300 mb-2">
                Para representantes
              </p>
              <h2 className="font-display text-2xl md:text-3xl font-bold mb-2 text-balance">
                Você é consultor, contador ou trabalha com vendas B2B?
              </h2>
              <p className="text-white/70 text-pretty">
                Distribua uma solução que vende sozinha. Cada cliente que você
                cadastra gera comissão recorrente enquanto ele usa o sistema.
              </p>
            </div>
            <Button asChild variant="default" size="lg" className="flex-none">
              <Link href="/representantes">
                Conhecer o modelo
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </Button>
          </div>
        </section>
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

function FlowCard({
  tone,
  title,
  children,
}: {
  tone: "warm" | "accent";
  title: string;
  children: React.ReactNode;
}) {
  const styles =
    tone === "warm"
      ? "border-warm-500/30 bg-warm-500/5"
      : "border-accent-500/30 bg-accent-50";
  const dot = tone === "warm" ? "bg-warm-500" : "bg-accent-500";
  const titleColor = tone === "warm" ? "text-warm-600" : "text-accent-700";
  const icon = tone === "warm" ? null : <TrendingDown className="h-5 w-5" aria-hidden />;

  return (
    <div className={`rounded-xl border-2 p-5 ${styles}`}>
      <div className="flex items-center gap-2 mb-2">
        <span className={`h-2.5 w-2.5 rounded-full ${dot}`} aria-hidden />
        <span className={`font-display text-sm font-bold uppercase tracking-widest ${titleColor}`}>
          {title}
        </span>
        {icon ? <span className={titleColor}>{icon}</span> : null}
      </div>
      <p className="text-sm text-text/80 leading-relaxed">{children}</p>
    </div>
  );
}
