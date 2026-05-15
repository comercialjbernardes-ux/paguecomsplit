import Link from "next/link";
import Image from "next/image";
import { Check } from "lucide-react";
import { CTAWhatsApp } from "@/components/CTAWhatsApp";

type HomeHeroProps = {
  whatsappMessage: string;
};

export function HomeHero({ whatsappMessage }: HomeHeroProps) {
  return (
    <section className="gradient-hero overflow-hidden">
      <div className="container-page relative pt-14 pb-16 md:pt-20 md:pb-20">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-12 items-center page-in ready">
          {/* COPY */}
          <div className="lg:col-span-6">
            <h1 className="font-display text-4xl md:text-5xl lg:text-[64px] font-extrabold text-primary-600 leading-[1.02] tracking-tight text-balance">
              Pare de tributar a{" "}
              <span className="text-warm-500">receita do seu parceiro.</span>
            </h1>

            <p className="mt-6 text-lg md:text-xl text-text/75 max-w-xl text-pretty">
              A SplitTech administra a divisão do pagamento{" "}
              <strong className="text-primary-600">antes do DAS incidir</strong> —
              cada parte vai para o dono dela e você tributa só a sua receita. Não
              seja mais tributado pela receita do seu parceiro.
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <CTAWhatsApp
                message={whatsappMessage}
                label="Quero economizar agora"
                size="xl"
              />
              <Link href="#simulador" className="btn btn-outline btn-xl">
                Calcular minha economia
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4 arrow"
                  aria-hidden
                >
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </Link>
            </div>

            <ul className="mt-7 flex flex-wrap gap-x-6 gap-y-2 text-sm text-text/65">
              <li className="inline-flex items-center gap-2">
                <Check className="h-4 w-4 text-accent-700" strokeWidth={2.5} aria-hidden />
                Cancele quando quiser
              </li>
              <li className="inline-flex items-center gap-2">
                <Check className="h-4 w-4 text-accent-700" strokeWidth={2.5} aria-hidden />
                Maquininha grátis
              </li>
              <li className="inline-flex items-center gap-2">
                <Check className="h-4 w-4 text-accent-700" strokeWidth={2.5} aria-hidden />
                Suporte humano em português
              </li>
            </ul>
          </div>

          {/* PHOTO + POPUPS + ARROWS */}
          <div className="lg:col-span-6 order-first lg:order-last">
            <div
              className="hero-photo-wrap mx-auto w-full"
              aria-label="Pessoa segurando maquininha; popups mostram split de R$ 6.000"
            >
              {/* backdrop blobs */}
              <div className="absolute -inset-8 -z-10 pointer-events-none" aria-hidden>
                <div className="absolute right-2 top-4 w-72 h-72 rounded-full bg-accent-200/45 blur-3xl" />
                <div className="absolute left-0 bottom-4 w-60 h-60 rounded-full bg-warm-500/15 blur-3xl" />
              </div>

              <Image
                src="/hero/atendente-cafe.jpg"
                alt="Atendente do Café do Mercado segurando maquininha mostrando R$ 57,80"
                width={1000}
                height={1250}
                priority
                fetchPriority="high"
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="hero-photo"
              />

              {/* ARROWS */}
              <svg
                className="hero-arrows hidden sm:block"
                viewBox="0 0 80 100"
                preserveAspectRatio="none"
                aria-hidden
              >
                <defs>
                  <marker id="arrowNavy"   viewBox="0 0 12 12" refX="10" refY="6" markerWidth="6" markerHeight="6" orient="auto" markerUnits="strokeWidth">
                    <path d="M0 0 L12 6 L0 12 L3 6 Z" fill="#0A2540" />
                  </marker>
                  <marker id="arrowAccent" viewBox="0 0 12 12" refX="10" refY="6" markerWidth="6" markerHeight="6" orient="auto" markerUnits="strokeWidth">
                    <path d="M0 0 L12 6 L0 12 L3 6 Z" fill="#00A07A" />
                  </marker>
                  <marker id="arrowWarm"   viewBox="0 0 12 12" refX="10" refY="6" markerWidth="6" markerHeight="6" orient="auto" markerUnits="strokeWidth">
                    <path d="M0 0 L12 6 L0 12 L3 6 Z" fill="#E85A26" />
                  </marker>
                </defs>
                <path className="line" d="M 18 20 C 24 38, 32 54, 40 66" stroke="#0A2540" markerEnd="url(#arrowNavy)" />
                <path className="line" d="M 66 54 C 58 60, 50 64, 44 68" stroke="#00A07A" markerEnd="url(#arrowAccent)" />
                <path className="line" d="M 20 80 C 26 76, 32 74, 38 73" stroke="#E85A26" markerEnd="url(#arrowWarm)" />
              </svg>

              {/* POP A: cliente paga */}
              <div className="hero-pop hero-pop-navy float-a hidden sm:block" style={{ top: "4%", left: "-20px" }}>
                <p className="pop-eye text-accent-300">Cliente paga</p>
                <p className="pop-val">R$ 6.000</p>
                <p className="pop-sub">Cartão · PIX · link</p>
              </div>

              {/* POP B: sua margem */}
              <div className="hero-pop hero-pop-accent float-b hidden sm:block" style={{ top: "40%", right: "-22px" }}>
                <p className="pop-eye">Sua margem · tributa</p>
                <p className="pop-val">R$ 2.400</p>
                <p className="pop-sub">DAS só sobre isso</p>
              </div>

              {/* POP C: do parceiro */}
              <div className="hero-pop hero-pop-warm float-c hidden sm:block" style={{ bottom: "14%", left: "-26px" }}>
                <p className="pop-eye">Do parceiro</p>
                <p className="pop-val">R$ 3.600</p>
                <p className="pop-sub">Fora do seu DAS</p>
              </div>

              {/* BACEN badge */}
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-2 rounded-full bg-primary-600 text-white px-4 py-2 text-[11px] font-semibold shadow-pop whitespace-nowrap z-[3]">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#7FE6C4"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-3.5 w-3.5"
                  aria-hidden
                >
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <polyline points="9 12 11 14 15 10" />
                </svg>
                Regulado BACEN · Infra Cappta
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
