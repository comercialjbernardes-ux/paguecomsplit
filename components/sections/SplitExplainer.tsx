import { Check } from "lucide-react";

export function SplitExplainer() {
  return (
    <section id="o-que-e-split" className="bg-white border-y border-slate-100">
      <div className="container-page py-12 md:py-16">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-accent-600 mb-3">
            O que é split de pagamento?
          </p>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-primary-600 mb-4 text-balance">
            A divisão ocorre antes da tributação.
          </h2>
          <p className="text-text/80 leading-relaxed text-pretty max-w-2xl mx-auto">
            Quando o cliente passa o cartão, cada parte da transação já segue
            para o dono dela — <strong>antes</strong> do dinheiro virar receita
            tributável. Você só paga DAS sobre a sua margem real.{" "}
            <strong>Evite bitributação.</strong>
          </p>
        </div>

        <ul className="mt-12 grid gap-5 md:grid-cols-3" role="list">
          {/* CARD 1: Compliance BACEN */}
          <li
            className="group relative overflow-hidden rounded-3xl border-2 border-slate-200/60 p-6 md:p-7 transition-all duration-500 ease-out hover:-translate-y-2 hover:border-accent-400 hover:shadow-pop"
            style={{ background: "linear-gradient(160deg, #EFF4F9 0%, #DCE6F0 100%)" }}
          >
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
              style={{ background: "radial-gradient(circle at 30% 0%, rgba(0,200,150,.22), transparent 65%)" }}
              aria-hidden
            />
            <div className="absolute top-5 right-5 inline-flex h-10 w-10 items-center justify-center rounded-full bg-accent-500 text-white opacity-0 -translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 shadow-[0_6px_16px_-4px_rgba(0,200,150,.55)] z-10">
              <Check className="h-4 w-4" strokeWidth={3} />
            </div>
            <div className="relative h-44 md:h-48 flex items-center justify-center mb-5">
              <svg viewBox="0 0 200 140" className="w-full max-w-[220px] h-auto" aria-hidden>
                <defs>
                  <linearGradient id="shield1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#1CCE94" />
                    <stop offset="100%" stopColor="#00785C" />
                  </linearGradient>
                </defs>
                <g opacity=".18">
                  <polygon points="44 40, 156 40, 150 28, 50 28" fill="#0A2540" />
                  <rect x="44" y="40" width="112" height="4" fill="#0A2540" />
                  <rect x="56" y="44" width="10" height="58" fill="#0A2540" />
                  <rect x="76" y="44" width="10" height="58" fill="#0A2540" />
                  <rect x="96" y="44" width="10" height="58" fill="#0A2540" />
                  <rect x="116" y="44" width="10" height="58" fill="#0A2540" />
                  <rect x="136" y="44" width="10" height="58" fill="#0A2540" />
                  <rect x="40" y="102" width="120" height="6" fill="#0A2540" />
                </g>
                <path d="M100 16 L62 30 L62 70 Q62 100, 100 116 Q138 100, 138 70 L138 30 Z" fill="#0A2540" opacity=".22" transform="translate(3 4)" />
                <path d="M100 16 L62 30 L62 70 Q62 100, 100 116 Q138 100, 138 70 L138 30 Z" fill="url(#shield1)" />
                <path d="M100 16 L62 30 L62 50 Q100 66, 138 50 L138 30 Z" fill="rgba(255,255,255,.18)" />
                <path d="M80 66 L94 80 L120 52" stroke="white" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                <circle cx="38" cy="58" r="3.5" fill="#00C896" opacity=".75" />
                <circle cx="170" cy="48" r="2.8" fill="#00C896" opacity=".75" />
                <circle cx="178" cy="92" r="2.2" fill="#00C896" opacity=".75" />
                <circle cx="28" cy="100" r="2" fill="#00C896" opacity=".6" />
              </svg>
            </div>
            <h3 className="relative font-display text-xl md:text-[22px] font-bold text-primary-600 mb-2 transition-colors group-hover:text-accent-700">
              Compliance BACEN
            </h3>
            <p className="relative text-[15px] text-text/70 leading-relaxed text-pretty">
              Operação regulada pelo Banco Central. Split de pagamento é a prática
              padrão do mercado de adquirência para repasses a múltiplos
              beneficiários.
            </p>
          </li>

          {/* CARD 2: Gerido na origem */}
          <li
            className="group relative overflow-hidden rounded-3xl border-2 border-slate-200/60 p-6 md:p-7 transition-all duration-500 ease-out hover:-translate-y-2 hover:border-accent-400 hover:shadow-pop"
            style={{ background: "linear-gradient(160deg, #E6FAF4 0%, #C9F1DF 100%)" }}
          >
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
              style={{ background: "radial-gradient(circle at 70% 0%, rgba(0,200,150,.30), transparent 65%)" }}
              aria-hidden
            />
            <div className="absolute top-5 right-5 inline-flex h-10 w-10 items-center justify-center rounded-full bg-accent-500 text-white opacity-0 -translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 shadow-[0_6px_16px_-4px_rgba(0,200,150,.55)] z-10">
              <Check className="h-4 w-4" strokeWidth={3} />
            </div>
            <div className="relative h-44 md:h-48 flex items-center justify-center mb-5">
              <svg viewBox="0 0 200 140" className="w-full max-w-[240px] h-auto" aria-hidden>
                <g transform="translate(4 78)">
                  <rect x="2" y="3" width="62" height="46" rx="10" fill="#0A2540" opacity=".10" />
                  <rect width="62" height="46" rx="10" fill="white" stroke="#00C896" strokeWidth="2" />
                  <text x="8" y="14" fontFamily="Sora" fontSize="6.5" fontWeight="800" fill="#00785C" letterSpacing="1">SUA</text>
                  <rect x="8" y="18" width="34" height="4" rx="2" fill="#7FE6C4" />
                  <text x="8" y="36" fontFamily="Sora" fontSize="12" fontWeight="800" fill="#0A2540">R$ 2,4k</text>
                </g>
                <g transform="translate(134 78)">
                  <rect x="2" y="3" width="62" height="46" rx="10" fill="#0A2540" opacity=".10" />
                  <rect width="62" height="46" rx="10" fill="white" stroke="#FF6B35" strokeWidth="2" />
                  <text x="8" y="14" fontFamily="Sora" fontSize="6.5" fontWeight="800" fill="#C24A1F" letterSpacing="1">PARCEIRO</text>
                  <rect x="8" y="18" width="34" height="4" rx="2" fill="#FFB89A" />
                  <text x="8" y="36" fontFamily="Sora" fontSize="12" fontWeight="800" fill="#0A2540">R$ 3,6k</text>
                </g>
                <g transform="translate(66 8)">
                  <rect x="3" y="4" width="68" height="52" rx="12" fill="#0A2540" opacity=".18" />
                  <rect width="68" height="52" rx="12" fill="#0A2540" />
                  <text x="34" y="16" textAnchor="middle" fontFamily="Sora" fontSize="6.5" fontWeight="800" fill="#7FE6C4" letterSpacing="1.5">VALOR</text>
                  <text x="34" y="34" textAnchor="middle" fontFamily="Sora" fontSize="14" fontWeight="800" fill="white">R$ 6.000</text>
                  <circle cx="34" cy="45" r="3" fill="#00C896" />
                </g>
                <path d="M84 64 C 70 76, 50 82, 38 88" stroke="#00C896" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                <polygon points="38 84, 30 88, 38 92, 36 88" fill="#00C896" />
                <path d="M120 64 C 134 76, 154 82, 166 88" stroke="#FF6B35" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                <polygon points="166 84, 174 88, 166 92, 168 88" fill="#FF6B35" />
                <circle cx="14" cy="40" r="2.5" fill="#00C896" opacity=".6" />
                <circle cx="186" cy="36" r="2" fill="#FF6B35" opacity=".55" />
              </svg>
            </div>
            <h3 className="relative font-display text-xl md:text-[22px] font-bold text-primary-600 mb-2 transition-colors group-hover:text-accent-700">
              Gerido na origem da transação
            </h3>
            <p className="relative text-[15px] text-text/70 leading-relaxed text-pretty">
              A divisão é administrada antes do pagamento virar receita sua. Sem
              planilha, sem PIX-de-último-dia para o parceiro.
            </p>
          </li>

          {/* CARD 3: Tributa só a sua margem */}
          <li
            className="group relative overflow-hidden rounded-3xl border-2 border-slate-200/60 p-6 md:p-7 transition-all duration-500 ease-out hover:-translate-y-2 hover:border-accent-400 hover:shadow-pop"
            style={{ background: "linear-gradient(160deg, #FFF4ED 0%, #FFE0CB 100%)" }}
          >
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
              style={{ background: "radial-gradient(circle at 30% 100%, rgba(0,200,150,.20), transparent 65%)" }}
              aria-hidden
            />
            <div className="absolute top-5 right-5 inline-flex h-10 w-10 items-center justify-center rounded-full bg-accent-500 text-white opacity-0 -translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 shadow-[0_6px_16px_-4px_rgba(0,200,150,.55)] z-10">
              <Check className="h-4 w-4" strokeWidth={3} />
            </div>
            <div className="relative h-44 md:h-48 flex items-center justify-center mb-5">
              <svg viewBox="0 0 200 140" className="w-full max-w-[200px] h-auto" aria-hidden>
                <g opacity=".22">
                  <circle cx="174" cy="38" r="14" fill="#00785C" />
                  <circle cx="156" cy="30" r="9" fill="#00785C" />
                  <circle cx="22" cy="100" r="11" fill="#00785C" />
                  <circle cx="36" cy="116" r="6" fill="#00785C" />
                </g>
                <g transform="translate(56 12)">
                  <rect x="3" y="5" width="84" height="110" rx="14" fill="#0A2540" opacity=".18" />
                  <rect width="84" height="110" rx="14" fill="white" stroke="#D9E2EE" strokeWidth="2" />
                  <rect x="8" y="8" width="68" height="28" rx="6" fill="#0A2540" />
                  <text x="14" y="20" fontFamily="Sora" fontSize="6" fontWeight="800" fill="#7FE6C4" letterSpacing="1.2">SUA MARGEM</text>
                  <text x="70" y="32" textAnchor="end" fontFamily="Sora" fontSize="13" fontWeight="800" fill="white">2.400</text>
                  <g fill="#F0F4F9">
                    <rect x="8" y="42" width="18" height="14" rx="4" />
                    <rect x="30" y="42" width="18" height="14" rx="4" />
                    <rect x="52" y="42" width="18" height="14" rx="4" />
                    <rect x="8" y="60" width="18" height="14" rx="4" />
                    <rect x="30" y="60" width="18" height="14" rx="4" />
                    <rect x="52" y="60" width="18" height="14" rx="4" />
                    <rect x="8" y="78" width="18" height="14" rx="4" />
                    <rect x="30" y="78" width="18" height="14" rx="4" />
                    <rect x="52" y="78" width="18" height="14" rx="4" />
                    <rect x="8" y="96" width="40" height="14" rx="4" />
                  </g>
                  <rect x="52" y="96" width="18" height="14" rx="4" fill="#00C896" />
                  <text x="61" y="106" textAnchor="middle" fontFamily="Sora" fontSize="11" fontWeight="900" fill="white">=</text>
                </g>
                <g transform="translate(140 102)">
                  <circle r="22" fill="#0A2540" opacity=".18" />
                  <circle r="22" fill="#00C896" transform="translate(-2 -2)" />
                  <text x="-2" y="4" textAnchor="middle" fontFamily="Sora" fontSize="18" fontWeight="900" fill="white">%</text>
                </g>
                <circle cx="14" cy="40" r="2" fill="#FF6B35" opacity=".5" />
                <circle cx="186" cy="80" r="2" fill="#FF6B35" opacity=".5" />
              </svg>
            </div>
            <h3 className="relative font-display text-xl md:text-[22px] font-bold text-primary-600 mb-2 transition-colors group-hover:text-accent-700">
              Tributa só a sua margem
            </h3>
            <p className="relative text-[15px] text-text/70 leading-relaxed text-pretty">
              O DAS do Simples incide sobre o que efetivamente é receita sua. O
              resto fica fora da sua conta — e fora do seu imposto.
            </p>
          </li>
        </ul>
      </div>
    </section>
  );
}
