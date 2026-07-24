import { Receipt, Scissors, CheckCheck } from "lucide-react";

const STEPS = [
  {
    n: "1",
    icon: Receipt,
    title: "Cliente paga normalmente",
    desc: "Mesma maquininha. Cartão, PIX ou aproximação — sem mudar a forma de vender.",
    bg: "linear-gradient(160deg, #EFF4F9 0%, #DCE6F0 100%)",
  },
  {
    n: "2",
    icon: Scissors,
    title: "A divisão é gerida antes do DAS",
    desc: "Cada parte do pagamento é separada na origem da transação, antes de virar receita tributável sua.",
    bg: "linear-gradient(160deg, #E6FAF4 0%, #C9F1DF 100%)",
  },
  {
    n: "3",
    icon: CheckCheck,
    title: "Cada parte segue para o dono dela",
    desc: "A parte do parceiro vai direto para a conta dele. Você tributa só a sua margem real.",
    bg: "linear-gradient(160deg, #FFF4ED 0%, #FFE0CB 100%)",
  },
];

export function StepByStep() {
  return (
    <section className="container-page py-14 md:py-20">
      <div className="max-w-2xl mx-auto text-center mb-12">
        <p className="text-xs font-bold uppercase tracking-[.2em] text-accent-600 mb-3">
          Passo a passo
        </p>
        <h2 className="font-display text-3xl md:text-4xl font-bold text-primary-600 text-balance leading-[1.05]">
          Como o split funciona na prática.
        </h2>
      </div>

      <ol className="grid gap-5 md:grid-cols-3" role="list">
        {STEPS.map((s) => (
          <li
            key={s.n}
            className="group relative overflow-hidden rounded-3xl border-2 border-slate-200/60 p-6 md:p-7 transition-all duration-500 ease-out hover:-translate-y-2 hover:border-accent-400 hover:shadow-pop"
            style={{ background: s.bg }}
          >
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
              style={{ background: "radial-gradient(circle at 70% 0%, rgba(0,200,150,.22), transparent 65%)" }}
              aria-hidden
            />
            <div className="relative flex items-center gap-4 mb-5">
              <span
                className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-primary-600 shadow-[0_4px_12px_-4px_rgba(10,37,64,.12)] transition-transform group-hover:scale-105"
                aria-hidden
              >
                <s.icon className="h-7 w-7" />
              </span>
              <span
                className="font-display font-extrabold text-5xl text-primary-600/15 leading-none"
                aria-hidden
              >
                {s.n}
              </span>
            </div>
            <h3 className="relative font-display text-xl font-bold text-primary-600 mb-2 leading-tight transition-colors group-hover:text-accent-700">
              {s.title}
            </h3>
            <p className="relative text-[15px] text-text/70 leading-relaxed text-pretty">
              {s.desc}
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
}
