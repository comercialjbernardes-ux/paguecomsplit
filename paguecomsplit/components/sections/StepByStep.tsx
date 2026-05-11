import { Receipt, Scissors, CheckCheck } from "lucide-react";

const STEPS = [
  {
    n: "1",
    icon: Receipt,
    title: "Você vende pelo POS SplitTech",
    desc: "Cliente paga normalmente no cartão, PIX ou aproximação.",
  },
  {
    n: "2",
    icon: Scissors,
    title: "O Cofre Digital separa automaticamente",
    desc: "O repasse sai para o terceiro antes do imposto incidir.",
  },
  {
    n: "3",
    icon: CheckCheck,
    title: "Cada parte recebe o que é seu",
    desc: "Você tributa só a sua margem real. O resto cai onde deve.",
  },
];

export function StepByStep() {
  return (
    <section className="container-page py-16 md:py-20">
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
