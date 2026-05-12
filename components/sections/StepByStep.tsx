import { Receipt, Scissors, CheckCheck } from "lucide-react";

const STEPS = [
  {
    n: "1",
    icon: Receipt,
    title: "Cliente paga normalmente",
    desc: "Mesma maquininha. Cartão, PIX ou aproximação — sem mudar a forma de vender.",
  },
  {
    n: "2",
    icon: Scissors,
    title: "A divisão é gerida antes do DAS",
    desc: "Cada parte do pagamento é separada na origem da transação, antes de virar receita tributável sua.",
  },
  {
    n: "3",
    icon: CheckCheck,
    title: "Cada parte segue para o dono dela",
    desc: "A parte do parceiro vai direto para a conta dele. Você tributa só a sua margem real.",
  },
];

export function StepByStep() {
  return (
    <section className="container-page py-12 md:py-16">
      <div className="max-w-2xl mb-10">
        <p className="text-xs font-bold uppercase tracking-widest text-accent-600 mb-3">
          Passo a passo
        </p>
        <h2 className="font-display text-3xl md:text-4xl font-bold text-primary-600 text-balance">
          Como o split funciona na prática.
        </h2>
      </div>

      <ol className="grid gap-5 md:grid-cols-3" role="list">
        {STEPS.map((s) => (
          <li
            key={s.n}
            className="relative rounded-xl border border-slate-100 bg-white p-6 shadow-soft"
          >
            <span
              className="absolute -top-3 left-5 inline-flex h-8 w-8 items-center justify-center rounded-full bg-accent-500 text-white font-display font-bold text-sm"
              aria-hidden
            >
              {s.n}
            </span>
            <s.icon className="h-8 w-8 text-primary-600 mb-3" aria-hidden />
            <h3 className="font-display text-lg font-bold text-primary-600 mb-2 leading-tight">
              {s.title}
            </h3>
            <p className="text-sm text-muted leading-relaxed text-pretty">
              {s.desc}
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
}
