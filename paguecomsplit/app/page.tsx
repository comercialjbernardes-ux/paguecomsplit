import Link from "next/link";
import { ArrowRight, TrendingDown, Building2, Sparkles } from "lucide-react";
import { NavBar } from "@/components/NavBar";
import { Footer } from "@/components/Footer";
import { SegmentGrid } from "@/components/SegmentGrid";
import { EconomySimulator } from "@/components/EconomySimulator";
import { CTAWhatsApp } from "@/components/CTAWhatsApp";
import { TrustBadges } from "@/components/TrustBadges";
import { AnimatedNumber } from "@/components/AnimatedNumber";
import { Button } from "@/components/ui/button";

const HOME_WHATSAPP =
  "Olá! Vi o paguecomsplit.com.br e quero entender como o split reduz meu imposto.";

export default function HomePage() {
  return (
    <>
      <NavBar />
      <main>
        {/* Hero */}
        <section className="gradient-hero">
          <div className="container-page pt-16 pb-20 md:pt-24 md:pb-28">
            <div className="max-w-3xl">
              <p className="inline-flex items-center gap-2 rounded-full bg-accent-50 text-accent-700 px-3 py-1 text-xs font-bold uppercase tracking-widest mb-6">
                <Sparkles className="h-3.5 w-3.5" aria-hidden />
                Split de pagamento · Simples Nacional
              </p>
              <h1 className="font-display text-5xl md:text-7xl font-extrabold text-primary-600 leading-[1.05] tracking-tight text-balance">
                Pague com <span className="text-accent-600">Split</span>.
              </h1>
              <p className="mt-6 text-xl md:text-2xl text-text/80 max-w-2xl text-pretty">
                Pare de pagar imposto sobre dinheiro que não é seu. O Cofre
                Digital separa o repasse a terceiros <strong>antes</strong> do
                Simples incidir — você tributa só a sua margem real.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <CTAWhatsApp
                  message={HOME_WHATSAPP}
                  label="Quero economizar"
                  size="xl"
                />
                <Button asChild variant="outline" size="xl">
                  <Link href="#simulador">Simular minha economia</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Segmentos */}
        <section id="segmentos" className="container-page py-16 md:py-24">
          <div className="max-w-2xl mb-10">
            <p className="text-xs font-bold uppercase tracking-widest text-accent-600 mb-3">
              Escolha seu segmento
            </p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-primary-600 mb-3 text-balance">
              Clique no seu tipo de negócio e veja como funciona para você.
            </h2>
            <p className="text-muted text-pretty">
              Cada landing page traz a dor específica do seu segmento e o
              cálculo de economia já calibrado.
            </p>
          </div>
          <SegmentGrid />
        </section>

        {/* Numeros */}
        <section className="bg-primary-600 text-white">
          <div className="container-page py-16 md:py-20">
            <p className="text-xs font-bold uppercase tracking-widest text-accent-300 mb-3 text-center">
              O problema em números
            </p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-center text-balance max-w-3xl mx-auto">
              Negócios do Simples pagam imposto sobre dinheiro que repassam a terceiros.
            </h2>

            <div className="mt-12 grid gap-8 md:grid-cols-3">
              <StatBlock
                value={50}
                suffix="%+"
                label="Redução tributária possível"
                desc="dependendo do % de repasse e da faixa do Simples"
              />
              <StatBlock
                value={28300}
                prefix="R$ "
                label="Economia média/ano"
                desc="exemplo calibrado para clínicas de estética (Anexo V)"
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

        {/* Simulador */}
        <section id="simulador" className="container-page py-16 md:py-24">
          <div className="max-w-2xl mb-10">
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

        {/* Como funciona — resumo */}
        <section className="bg-white border-y border-slate-100">
          <div className="container-page py-16 md:py-20">
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

        {/* Trust */}
        <TrustBadges />

        {/* Representantes teaser */}
        <section className="container-page py-16 md:py-20">
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
