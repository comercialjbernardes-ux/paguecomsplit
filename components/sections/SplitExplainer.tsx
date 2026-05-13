// SVGs inline 32×32 — sem biblioteca externa (F2)
function IconEscudo() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden>
      <path d="M16 3L5 7.5V16c0 6.075 4.7 11.74 11 13 6.3-1.26 11-6.925 11-13V7.5L16 3Z" fill="#dbeafe" stroke="#3b82f6" strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M11 16.5l3.5 3.5 6.5-7" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function IconEngrenagem() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden>
      <circle cx="16" cy="16" r="4" fill="#dbeafe" stroke="#3b82f6" strokeWidth="1.5"/>
      <path d="M16 3v3M16 26v3M3 16h3M26 16h3M6.34 6.34l2.12 2.12M23.54 23.54l2.12 2.12M6.34 25.66l2.12-2.12M23.54 8.46l2.12-2.12" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="16" cy="16" r="7" stroke="#93c5fd" strokeWidth="1.5" strokeDasharray="3 2"/>
    </svg>
  );
}

function IconCalculadora() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden>
      <rect x="7" y="4" width="18" height="24" rx="3" fill="#dbeafe" stroke="#3b82f6" strokeWidth="1.5"/>
      <rect x="10" y="7" width="12" height="6" rx="1.5" fill="#93c5fd"/>
      <circle cx="11.5" cy="17.5" r="1.5" fill="#2563eb"/>
      <circle cx="16" cy="17.5" r="1.5" fill="#2563eb"/>
      <circle cx="20.5" cy="17.5" r="1.5" fill="#2563eb"/>
      <circle cx="11.5" cy="22" r="1.5" fill="#2563eb"/>
      <circle cx="16" cy="22" r="1.5" fill="#2563eb"/>
      <rect x="19" y="20.5" width="3" height="3" rx="0.5" fill="#2563eb"/>
    </svg>
  );
}

const BULLETS = [
  {
    SvgIcon: IconEscudo,
    title: "Compliance BACEN",
    desc: "Operação regulada pelo Banco Central. Split de pagamento é a prática padrão do mercado de adquirência para repasses a múltiplos beneficiários.",
  },
  {
    SvgIcon: IconEngrenagem,
    title: "Gerido na origem da transação",
    desc: "A divisão é administrada antes do pagamento virar receita sua. Sem planilha, sem PIX-de-último-dia para o parceiro.",
  },
  {
    SvgIcon: IconCalculadora,
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
            A divisão ocorre antes da tributação.
          </h2>
          <p className="text-text/80 leading-relaxed text-pretty max-w-2xl">
            Quando o cliente passa o cartão, cada parte da transação já segue
            para o dono dela — <strong>antes</strong> do dinheiro virar receita
            tributável. Você só paga DAS sobre a sua margem real.{" "}
            <strong>Evite bitributação.</strong>
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
              <span className="inline-flex mb-3">
                <b.SvgIcon />
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
