import { ShieldCheck, Zap, Receipt } from "lucide-react";

const BULLETS = [
  {
    icon: ShieldCheck,
    title: "Compliance BACEN",
    desc: "Operação regulada pelo Banco Central via Cappta — não é gambiarra, é a prática padrão do mercado de adquirência.",
  },
  {
    icon: Zap,
    title: "Automático em tempo real",
    desc: "Cada pagamento já entra dividido. Sem planilha, sem repasse manual, sem PIX-de-último-dia para o seu parceiro.",
  },
  {
    icon: Receipt,
    title: "Tributa só a sua margem",
    desc: "O DAS do Simples incide sobre o que efetivamente é receita sua. O resto fica fora da sua conta — e fora do seu imposto.",
  },
] as const;

export function SplitExplainer() {
  return (
    <section id="o-que-e-split" className="bg-white border-y border-slate-100">
      <div className="container-page py-12 md:py-16">
        <div className="max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-widest text-accent-600 mb-3">
            O que é split de pagamento?
          </p>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-primary-600 mb-4 text-balance">
            Em vez de tudo cair na sua conta, o pagamento já entra dividido.
          </h2>
          <p className="text-text/80 leading-relaxed text-pretty max-w-2xl">
            Quando o cliente passa o cartão, o sistema separa{" "}
            <strong>na hora</strong> a parte que é sua da parte que é do
            terceiro (parceiro, fornecedor, autônomo). Cada um recebe direto na
            sua conta. Você só tributa o que de fato é seu.
          </p>
        </div>

        <ul
          className="mt-10 grid gap-5 md:grid-cols-3"
          role="list"
        >
          {BULLETS.map((b) => (
            <li
              key={b.title}
              className="rounded-xl border border-slate-100 bg-bg p-5 md:p-6"
            >
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-accent-50 text-accent-600 mb-3">
                <b.icon className="h-5 w-5" aria-hidden />
              </span>
              <h3 className="font-display text-lg font-bold text-primary-600 mb-1.5">
                {b.title}
              </h3>
              <p className="text-sm text-muted leading-relaxed text-pretty">
                {b.desc}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
