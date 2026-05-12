import {
  CreditCard,
  CircleDollarSign,
  Calendar,
  Smartphone,
  Link2,
  Scale,
} from "lucide-react";

const ITEMS = [
  {
    icon: CreditCard,
    title: "Parcelamento em 21x",
    desc: "O maior prazo do mercado. Seu cliente fecha a venda sem reclamar de parcela alta.",
  },
  {
    icon: CircleDollarSign,
    title: "Maquininha grátis",
    desc: "Você paga só pela transação. Sem taxa de adesão, sem mensalidade.",
  },
  {
    icon: Calendar,
    title: "Recebimento D+1",
    desc: "Dinheiro na sua conta no dia seguinte à venda. Caixa que respira.",
  },
  {
    icon: Smartphone,
    title: "PIX, aproximação e todas as bandeiras",
    desc: "Uma maquininha, todos os meios de pagamento — incluindo PIX grátis.",
  },
  {
    icon: Link2,
    title: "Link de pagamento",
    desc: "Repasses geridos na origem mesmo quando a venda é remota — WhatsApp, redes sociais, e-mail.",
  },
  {
    icon: Scale,
    title: "Cancele quando quiser",
    desc: "Operação amparada por parecer da Barcellos Tucunduva Advogados. Sem fidelidade, sem multa.",
  },
];

export function DifferentialsGrid() {
  return (
    <section className="bg-white border-y border-slate-100">
      <div className="container-page py-12 md:py-16">
        <div className="max-w-2xl mb-10">
          <p className="text-xs font-bold uppercase tracking-widest text-accent-600 mb-3">
            Diferenciais
          </p>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-primary-600 mb-3 text-balance">
            Maquininha SplitTech: mais que split.
          </h2>
        </div>

        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" role="list">
          {ITEMS.map((item) => (
            <li
              key={item.title}
              className="rounded-xl border border-slate-100 bg-bg p-5 hover:border-accent-300 transition-colors"
            >
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-accent-50 text-accent-600 mb-4">
                <item.icon className="h-6 w-6" aria-hidden />
              </span>
              <h3 className="font-display text-lg font-bold text-primary-600 mb-1">
                {item.title}
              </h3>
              <p className="text-sm text-muted leading-snug text-pretty">
                {item.desc}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
