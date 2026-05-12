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

          {/* Lado direito: exemplo + CTAs */}
          <div className="lg:col-span-5">
            <div className="rounded-xl bg-white/5 border border-white/10 p-5 mb-5">
              <p className="text-xs font-bold uppercase tracking-widest text-accent-300 mb-2">
                Exemplo de carteira
              </p>
              <p className="font-display text-2xl md:text-3xl font-extrabold leading-tight mb-1">
                10 clientes ativos
              </p>
              <p className="text-sm text-white/75 leading-relaxed">
                Faturando R$ 50k/mês cada ={" "}
                <strong className="text-white">comissão fixa de ativação</strong>{" "}
                +{" "}
                <strong className="text-white">recorrência sobre o volume</strong>{" "}
                que passa pela maquininha de cada um, todo mês.
              </p>
            </div>

            <div className="flex flex-col gap-2.5">
              <Button asChild variant="default" size="lg" className="w-full">
                <a
                  href={julioHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Falar com o Julio no WhatsApp"
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
