import Link from "next/link";
import { AlertOctagon, Check, ShieldCheck } from "lucide-react";
import { CTAWhatsApp } from "@/components/CTAWhatsApp";
import type { Segment } from "@/lib/segments";

export function SegmentHero({ segment }: { segment: Segment }) {
  return (
    <section className="gradient-hero overflow-hidden">
      <div className="container-page relative pt-14 pb-16 md:pt-20 md:pb-20">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-12 items-center page-in ready">
          {/* COPY */}
          <div className="lg:col-span-7">
            <p className="inline-flex items-center gap-2 rounded-full bg-warm-500/10 text-warm-700 px-3 py-1 text-xs font-bold uppercase tracking-[.2em] mb-5">
              <AlertOctagon className="h-3.5 w-3.5" aria-hidden />
              Evite bitributação.
            </p>

            <h1 className="font-display text-4xl md:text-5xl lg:text-[58px] font-extrabold text-primary-600 leading-[1.05] tracking-tight text-balance">
              {segment.headline}
            </h1>

            <p className="mt-6 text-lg md:text-xl text-text/75 max-w-xl text-pretty">
              Não seja mais tributado pela receita do parceiro. A SplitTech
              administra a divisão do pagamento{" "}
              <strong className="text-primary-600">antes do DAS incidir</strong>{" "}
              — você passa a tributar só a sua margem real.
            </p>

            <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary-600 text-white px-4 py-2 text-xs font-semibold shadow-pop">
              <ShieldCheck className="h-3.5 w-3.5 text-accent-300" aria-hidden />
              Cappta · +R$ 7 bi/ano · Regulado BACEN
            </div>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <CTAWhatsApp
                message={segment.whatsapp_message}
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
                Sem taxa de adesão
              </li>
              <li className="inline-flex items-center gap-2">
                <Check className="h-4 w-4 text-accent-700" strokeWidth={2.5} aria-hidden />
                Suporte humano em português
              </li>
            </ul>
          </div>

          {/* ILUSTRAÇÃO LATERAL — split visualization */}
          <div className="lg:col-span-5 order-first lg:order-last">
            <div className="relative mx-auto w-full max-w-md">
              <div className="absolute -inset-6 -z-10 pointer-events-none" aria-hidden>
                <div className="absolute right-2 top-4 w-60 h-60 rounded-full bg-accent-200/45 blur-3xl" />
                <div className="absolute left-0 bottom-4 w-48 h-48 rounded-full bg-warm-500/15 blur-3xl" />
              </div>

              <div
                className="relative rounded-3xl border border-slate-200/70 p-6 md:p-7 shadow-pop overflow-hidden"
                style={{ background: "linear-gradient(160deg, #FFFFFF 0%, #F0F4F9 100%)" }}
              >
                <p className="text-[10px] font-bold uppercase tracking-[.25em] text-primary-600/60 mb-4">
                  Operação típica · {segment.name}
                </p>

                <svg viewBox="0 0 320 280" className="w-full h-auto" aria-hidden>
                  {/* VALOR central */}
                  <g transform="translate(110 8)">
                    <rect x="3" y="4" width="100" height="60" rx="14" fill="#0A2540" opacity=".18" />
                    <rect width="100" height="60" rx="14" fill="#0A2540" />
                    <text x="50" y="22" textAnchor="middle" fontFamily="Sora" fontSize="7" fontWeight="800" fill="#7FE6C4" letterSpacing="1.5">CLIENTE PAGA</text>
                    <text x="50" y="46" textAnchor="middle" fontFamily="Sora" fontSize="18" fontWeight="900" fill="white">R$ {Math.round(segment.example.repasse_value / segment.example.repasse_percent * 100 / 12 / 100) * 100}</text>
                  </g>

                  {/* Fork */}
                  <g transform="translate(150 80)">
                    <line x1="10" y1="0" x2="10" y2="20" stroke="#0A2540" strokeWidth="3" strokeLinecap="round" />
                    <line x1="10" y1="20" x2="-50" y2="50" stroke="#00C896" strokeWidth="3" strokeLinecap="round" />
                    <line x1="10" y1="20" x2="70" y2="50" stroke="#FF6B35" strokeWidth="3" strokeLinecap="round" />
                    <circle cx="10" cy="20" r="6" fill="#0A2540" />
                  </g>

                  {/* Sua margem */}
                  <g transform="translate(14 152)">
                    <rect x="3" y="4" width="130" height="100" rx="16" fill="#0A2540" opacity=".12" />
                    <rect width="130" height="100" rx="16" fill="white" stroke="#00C896" strokeWidth="2.5" />
                    <text x="14" y="24" fontFamily="Sora" fontSize="8" fontWeight="800" fill="#00785C" letterSpacing="1.5">SUA MARGEM</text>
                    <rect x="14" y="30" width="40" height="3" rx="1.5" fill="#7FE6C4" />
                    <text x="14" y="62" fontFamily="Sora" fontSize="20" fontWeight="900" fill="#0A2540">{formatShort((segment.example.annual_revenue - segment.example.repasse_value) / 12)}</text>
                    <text x="14" y="84" fontFamily="Plus Jakarta Sans" fontSize="9" fill="#6B7280">tributa só isso</text>
                  </g>

                  {/* Do parceiro */}
                  <g transform="translate(176 152)">
                    <rect x="3" y="4" width="130" height="100" rx="16" fill="#0A2540" opacity=".12" />
                    <rect width="130" height="100" rx="16" fill="white" stroke="#FF6B35" strokeWidth="2.5" />
                    <text x="14" y="24" fontFamily="Sora" fontSize="8" fontWeight="800" fill="#C24A1F" letterSpacing="1.5">DO PARCEIRO</text>
                    <rect x="14" y="30" width="40" height="3" rx="1.5" fill="#FFB89A" />
                    <text x="14" y="62" fontFamily="Sora" fontSize="20" fontWeight="900" fill="#0A2540">{formatShort(segment.example.repasse_value / 12)}</text>
                    <text x="14" y="84" fontFamily="Plus Jakarta Sans" fontSize="9" fill="#6B7280">fora do seu DAS</text>
                  </g>
                </svg>

                <p className="mt-4 text-center text-xs text-text/55">
                  Valores médios do segmento. Use o simulador para o seu caso.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function formatShort(value: number): string {
  if (value >= 1000) {
    return `R$ ${(value / 1000).toFixed(1).replace(".", ",")}k`;
  }
  return `R$ ${Math.round(value)}`;
}
