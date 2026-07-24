import Link from "next/link";
import { ArrowRight, MessageCircle, Users } from "lucide-react";
import { buildWhatsAppHref } from "@/lib/utils";

const FALLBACK_NUMBER = "553195719123";

export function RepresentantesTeaser() {
  const number = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || FALLBACK_NUMBER;
  const waHref = buildWhatsAppHref(
    number,
    "Oi, vim do paguecomsplit.com.br e quero entender as modalidades de parceria da SplitTech."
  );

  return (
    <section id="representantes" className="container-page py-14 md:py-20">
      <div className="relative rounded-3xl bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white p-6 md:p-10 lg:p-14 overflow-hidden shadow-pop">
        {/* decorative blobs */}
        <div className="absolute -top-32 -right-24 w-80 h-80 rounded-full bg-accent-500/25 blur-3xl" aria-hidden />
        <div className="absolute -bottom-28 left-1/3 w-72 h-72 rounded-full bg-accent-300/10 blur-3xl" aria-hidden />

        <div className="relative">
          {/* TOP: tag + title */}
          <div className="max-w-4xl mx-auto text-center mb-10">
            <p className="inline-flex items-center gap-2 rounded-full bg-accent-300/15 border border-accent-300/30 text-accent-300 px-3 py-1 text-[11px] font-bold uppercase tracking-[.2em] mb-5">
              <Users className="h-3.5 w-3.5" aria-hidden />
              Para representantes e contadores
            </p>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-extrabold mb-5 text-balance leading-[1.05]">
              Trabalhamos com duas modalidades de parceria — e uma delas pode ser
              exatamente o que você procura.
            </h2>
          </div>

          {/* MIDDLE: 3 cards */}
          <ul className="grid md:grid-cols-3 gap-4 mb-8" role="list">
            <li className="rounded-2xl bg-white/[.06] border border-white/15 p-5 backdrop-blur-sm transition-all hover:bg-white/[.10] hover:border-white/25">
              <div className="flex items-center gap-3 mb-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-accent-300/20 text-accent-300 font-display font-extrabold text-base">
                  1
                </span>
                <p className="font-display text-base font-bold">Indicação</p>
              </div>
              <p className="text-sm text-white/70 leading-relaxed">
                Você indica o cliente e pronto. Existe um plano criado
                especialmente para esse perfil, sem complicações.
              </p>
            </li>
            <li className="rounded-2xl bg-white/[.06] border border-white/15 p-5 backdrop-blur-sm transition-all hover:bg-white/[.10] hover:border-white/25">
              <div className="flex items-center gap-3 mb-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-accent-300/20 text-accent-300 font-display font-extrabold text-base">
                  2
                </span>
                <p className="font-display text-base font-bold">Representação Comercial</p>
              </div>
              <p className="text-sm text-white/70 leading-relaxed">
                Para quem quer ir além e representar a empresa de forma ativa. Um
                plano robusto para quem enxerga o potencial do negócio.
              </p>
            </li>
            <li className="rounded-2xl bg-white/[.06] border border-white/15 p-5 backdrop-blur-sm transition-all hover:bg-white/[.10] hover:border-white/25">
              <div className="flex items-center gap-3 mb-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-accent-300/20 text-accent-300 font-display font-extrabold text-base">
                  3
                </span>
                <p className="font-display text-base font-bold">Como começar</p>
              </div>
              <p className="text-sm text-white/70 leading-relaxed">
                Em ambas as modalidades, o processo começa com uma{" "}
                <strong className="text-white">entrevista prévia</strong>. Entre em
                contato e descubra qual modalidade é melhor para você.
              </p>
            </li>
          </ul>

          {/* BOTTOM: 2 buttons */}
          <div className="grid sm:grid-cols-2 gap-3 max-w-2xl mx-auto">
            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary btn-lg w-full cta-glow-primary cta-shimmer"
              aria-label="Entrar em contato via WhatsApp"
            >
              <MessageCircle className="h-4 w-4" aria-hidden />
              Entrar em contato
            </a>
            <Link
              href="/representantes"
              className="btn btn-on-dark-outline btn-lg w-full cta-glow-light cta-shimmer cta-shimmer-dark"
            >
              Ver detalhes do programa
              <ArrowRight className="h-4 w-4 arrow" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
