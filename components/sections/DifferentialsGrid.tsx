import {
  CreditCard,
  CircleDollarSign,
  Calendar,
  Smartphone,
  Link2,
  Scale,
  Check,
} from "lucide-react";

const ITEMS = [
  {
    icon: CreditCard,
    title: "Parcelamento em 21x",
    desc: "O maior prazo do mercado. Seu cliente fecha a venda sem reclamar de parcela alta.",
    bg: "linear-gradient(160deg, #E6FAF4 0%, #C9F1DF 100%)",
  },
  {
    icon: CircleDollarSign,
    title: "Sem taxa de adesão",
    desc: "Você paga só pela transação. Sem mensalidade, sem fidelidade.",
    bg: "linear-gradient(160deg, #EFF4F9 0%, #DCE6F0 100%)",
  },
  {
    icon: Calendar,
    title: "Recebimento D+1",
    desc: "Dinheiro na sua conta no dia seguinte à venda. Caixa que respira.",
    bg: "linear-gradient(160deg, #FFF4ED 0%, #FFE0CB 100%)",
  },
  {
    icon: Smartphone,
    title: "PIX, aproximação e todas as bandeiras",
    desc: "Uma maquininha, todos os meios de pagamento — incluindo PIX grátis.",
    bg: "linear-gradient(160deg, #FAF6FF 0%, #E8DEFA 100%)",
  },
  {
    icon: Link2,
    title: "Link de pagamento",
    desc: "Repasses geridos na origem mesmo quando a venda é remota — WhatsApp, redes sociais, e-mail.",
    bg: "linear-gradient(160deg, #FEF7E8 0%, #FBE7B5 100%)",
  },
  {
    icon: Scale,
    title: "Cancele quando quiser",
    desc: "Operação amparada por parecer da Barcellos Tucunduva Advogados. Sem fidelidade, sem multa.",
    bg: "linear-gradient(160deg, #E6FAF4 0%, #B9F2DF 100%)",
  },
];

export function DifferentialsGrid() {
  return (
    <section className="bg-white border-y border-slate-100">
      <div className="container-page py-14 md:py-20">
        <div className="max-w-2xl mx-auto text-center mb-12">
          <p className="text-xs font-bold uppercase tracking-[.2em] text-accent-600 mb-3">
            Diferenciais
          </p>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-primary-600 mb-3 text-balance leading-[1.05]">
            Maquininha SplitTech: mais que split.
          </h2>
          <p className="text-text/70 text-pretty">
            Tudo que uma adquirente moderna entrega — com a divisão de pagamento gerida na origem.
          </p>
        </div>

        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3" role="list">
          {ITEMS.map((item) => (
            <li
              key={item.title}
              className="group relative overflow-hidden rounded-3xl border-2 border-slate-200/60 p-6 transition-all duration-500 ease-out hover:-translate-y-2 hover:border-accent-400 hover:shadow-pop"
              style={{ background: item.bg }}
            >
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{ background: "radial-gradient(circle at 70% 0%, rgba(0,200,150,.22), transparent 65%)" }}
                aria-hidden
              />
              <div className="absolute top-5 right-5 inline-flex h-9 w-9 items-center justify-center rounded-full bg-accent-500 text-white opacity-0 -translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 shadow-[0_6px_16px_-4px_rgba(0,200,150,.55)] z-10">
                <Check className="h-4 w-4" strokeWidth={3} />
              </div>
              <span
                className="relative inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-accent-700 mb-5 shadow-[0_4px_12px_-4px_rgba(10,37,64,.12)] transition-all group-hover:bg-primary-600 group-hover:text-accent-200 group-hover:scale-105"
                aria-hidden
              >
                <item.icon className="h-6 w-6" />
              </span>
              <h3 className="relative font-display text-lg md:text-[19px] font-bold text-primary-600 mb-2 leading-tight transition-colors group-hover:text-accent-700">
                {item.title}
              </h3>
              <p className="relative text-[15px] text-text/70 leading-relaxed text-pretty">
                {item.desc}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
