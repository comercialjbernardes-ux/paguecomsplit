import Link from "next/link";
import { ArrowRight, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { buildWhatsAppHref } from "@/lib/utils";

const FALLBACK_NUMBER = "553195719123";

const MODALITIES = [
  {
    number: "1",
    title: "Indicação",
    desc: "Você indica o cliente e pronto. Existe um plano criado especialmente para esse perfil, sem complicações.",
  },
  {
    number: "2",
    title: "Representação Comercial",
    desc: "Para quem quer ir além e representar a empresa de forma ativa. Um plano robusto para quem enxerga o potencial do negócio.",
  },
] as const;

export function RepresentantesTeaser() {
  const number =
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || FALLBACK_NUMBER;

  const waMessage =
    "Oi, vim do paguecomsplit.com.br e quero entender as modalidades de parceria da SplitTech.";
  const waHref = buildWhatsAppHref(number, waMessage);

  return (
    <section className="container-page py-12 md:py-16">
      <div className="rounded-2xl bg-gradient-to-br from-primary-600 to-primary-800 text-white p-6 md:p-10 lg:p-12">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          {/* Lado esquerdo: pitch */}
          <div className="lg:col-span-7">
            <p className="text-xs font-bold uppercase tracking-widest text-accent-300 mb-3">
              Para representantes e contadores
            </p>
            <h2 className="font-display text-2xl md:text-3xl lg:text-4xl font-extrabold mb-4 text-balance leading-tight">
              Trabalhamos com duas modalidades de parceria — e uma delas pode
              ser exatamente o que você procura.
            </h2>

            <ul className="grid sm:grid-cols-2 gap-3 mt-6" role="list">
              {MODALITIES.map((m) => (
                <li
                  key={m.title}
                  className="rounded-xl bg-white/5 border border-white/10 p-4"
                >
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-accent-300/20 text-accent-300 font-display font-bold text-base mb-2.5">
                    {m.number}
                  </span>
                  <p className="font-display text-sm font-bold mb-1">
                    {m.title}
                  </p>
                  <p className="text-xs text-white/65 leading-relaxed">
                    {m.desc}
                  </p>
                </li>
              ))}
            </ul>
          </div>

          {/* Lado direito: CTA */}
          <div className="lg:col-span-5">
            <div className="rounded-xl bg-white/5 border border-white/10 p-5 mb-5">
              <p className="text-xs font-bold uppercase tracking-widest text-accent-300 mb-3">
                Como começar
              </p>
              <p className="text-sm text-white/85 leading-relaxed mb-1">
                Em ambas as modalidades, o processo começa com uma{" "}
                <strong className="text-white">entrevista prévia</strong>.
              </p>
              <p className="text-sm text-white/65 leading-relaxed mt-3">
                Entre em contato e descubra qual modalidade é melhor para você.
              </p>
            </div>

            <div className="flex flex-col gap-2.5">
              <Button asChild variant="default" size="lg" className="w-full">
                <a
                  href={waHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Entrar em contato via WhatsApp"
                >
                  <MessageCircle className="h-4 w-4" aria-hidden />
                  Entrar em contato
                </a>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="w-full border-white/30 text-white hover:bg-white/10"
              >
                <Link href="/representantes">
                  Ver detalhes do programa
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
