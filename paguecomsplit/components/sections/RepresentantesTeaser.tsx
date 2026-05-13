import Link from "next/link";
import {
  Coins,
  Repeat,
  Infinity as InfinityIcon,
  ArrowRight,
  MessageCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { buildWhatsAppHref } from "@/lib/utils";

const FALLBACK_JULIO = "5511999998888";

const BULLETS = [
  {
    icon: Coins,
    title: "Comissão por ativação",
    desc: "Valor fixo a cada cliente que ativa a maquininha SplitTech. Pago no mês da ativação.",
  },
  {
    icon: Repeat,
    title: "Recorrência mensal",
    desc: "Percentual sobre o volume processado por cada cliente, todo mês, enquanto ele estiver ativo.",
  },
  {
    icon: InfinityIcon,
    title: "Sem teto",
    desc: "Sua carteira cresce, sua receita cresce. Sem limite de clientes, sem limite de comissão.",
  },
] as const;

export function RepresentantesTeaser() {
  const julioNumber =
    process.env.NEXT_PUBLIC_WHATSAPP_JULIO ||
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ||
    FALLBACK_JULIO;

  const julioMessage =
    "Oi Julio, vim do paguecomsplit.com.br e quero entender o programa de representantes da SplitTech.";
  const julioHref = buildWhatsAppHref(julioNumber, julioMessage);

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
              Você apresenta. O cliente vê o número. Você fecha.
            </h2>
            <p className="text-white/75 text-pretty mb-6 max-w-xl leading-relaxed">
              Vender split é vender economia certa. Você mostra o cálculo
              do DAS, o cliente vê quanto está perdendo todo mês, e decide.
              Sem produto pra entregar, sem suporte pra fazer.
            </p>

            <ul className="grid sm:grid-cols-3 gap-3" role="list">
              {BULLETS.map((b) => (
                <li
                  key={b.title}
                  className="rounded-xl bg-white/5 border border-white/10 p-4"
                >
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-accent-300/15 text-accent-300 mb-2.5">
                    <b.icon className="h-4 w-4" aria-hidden />
                  </span>
                  <p className="font-display text-sm font-bold mb-1">
                    {b.title}
                  </p>
                  <p className="text-xs text-white/65 leading-relaxed">
                    {b.desc}
                  </p>
                </li>
              ))}
            </ul>
          </div>

          {/* Lado direito: card do Julio (E-E-A-T humano) + CTAs */}
          <div className="lg:col-span-5">
            <div className="rounded-xl bg-white/5 border border-white/10 p-5 mb-5">
              <div className="flex items-center gap-4 mb-4">
                {/* Avatar com iniciais */}
                <div
                  className="flex-none h-14 w-14 rounded-full bg-accent-300 text-primary-700 flex items-center justify-center font-display text-xl font-extrabold shadow-soft"
                  aria-hidden
                >
                  JB
                </div>
                <div>
                  <p className="font-display text-base font-extrabold leading-tight">
                    Julio Bernardes
                  </p>
                  <p className="text-xs text-accent-300 font-semibold">
                    Diretor Comercial · SplitTech
                  </p>
                  <a
                    href="https://www.linkedin.com/in/comercialjbernardes/"
                    target="_blank"
                    rel="noopener noreferrer external"
                    className="inline-flex items-center gap-1 text-xs text-white/70 hover:text-white mt-0.5"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="h-3 w-3"
                      aria-hidden
                    >
                      <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.13 1.45-2.13 2.94v5.67H9.37V9h3.4v1.56h.05c.47-.9 1.63-1.85 3.36-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45z" />
                    </svg>
                    LinkedIn
                  </a>
                </div>
              </div>

              <p className="text-xs font-bold uppercase tracking-widest text-accent-300 mb-2">
                Exemplo de carteira
              </p>
              <p className="text-sm text-white/85 leading-relaxed mb-1">
                10 clientes faturando R$ 50k/mês cada ={" "}
                <strong className="text-white">comissão fixa de ativação</strong>{" "}
                + <strong className="text-white">recorrência mensal</strong>{" "}
                sobre o volume processado por cada um deles.
              </p>
              <p className="text-xs text-white/60 leading-relaxed">
                Valores das comissões fechados em conversa com o Julio,
                ajustados ao seu perfil (consultor, contador, vendedor).
              </p>
            </div>

            <div className="flex flex-col gap-2.5">
              <Button asChild variant="default" size="lg" className="w-full">
                <a
                  href={julioHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Falar com o Julio Bernardes no WhatsApp"
                >
                  <MessageCircle className="h-4 w-4" aria-hidden />
                  Falar com o Julio no WhatsApp
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
