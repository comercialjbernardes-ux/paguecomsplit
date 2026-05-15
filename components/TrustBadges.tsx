import { LegalOpinionModal } from "./LegalOpinionModal";

export function TrustBadges() {
  return (
    <section className="container-page py-14 md:py-20">
      <p className="text-xs font-bold uppercase tracking-[.25em] text-accent-600 mb-3 text-center">
        A infraestrutura por trás do split
      </p>
      <h2 className="font-display text-2xl md:text-4xl font-bold text-primary-600 text-center text-balance max-w-2xl mx-auto mb-12 leading-[1.1]">
        Tecnologia regulada e parecer jurídico — não é gambiarra.
      </h2>
      <div className="grid gap-5 md:grid-cols-3 items-stretch">
        {/* TRUST 1: Cappta */}
        <div className="group relative flex flex-col h-full overflow-hidden rounded-3xl border-2 border-slate-200/60 p-6 md:p-7 transition-all duration-500 ease-out hover:-translate-y-2 hover:border-accent-400 hover:shadow-pop" style={{ background: "linear-gradient(160deg, #EFF4F9 0%, #DCE6F0 100%)" }}>
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ background: "radial-gradient(circle at 30% 0%, rgba(0,200,150,.22), transparent 65%)" }} aria-hidden />
          <div className="absolute top-5 right-5 inline-flex h-10 w-10 items-center justify-center rounded-full bg-accent-500 text-white opacity-0 -translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 shadow-[0_6px_16px_-4px_rgba(0,200,150,.55)] z-10">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><polyline points="20 6 9 17 4 12" /></svg>
          </div>
          <div className="relative h-40 md:h-44 flex items-center justify-center mb-5">
            <svg viewBox="0 0 220 140" className="w-full max-w-[220px] h-auto" aria-hidden>
              <g opacity=".12">
                <circle cx="24" cy="30" r="5" fill="#0A2540" />
                <circle cx="206" cy="118" r="5" fill="#0A2540" />
              </g>
              <g transform="translate(20 12)">
                <line x1="-4" y1="100" x2="180" y2="100" stroke="#0A2540" strokeWidth="2" strokeLinecap="round" opacity=".35" />
                <rect x="0"   y="70" width="22" height="30" rx="4" fill="#A8BBD3" />
                <rect x="32"  y="52" width="22" height="48" rx="4" fill="#7894B8" />
                <rect x="64"  y="34" width="22" height="66" rx="4" fill="#476D9D" />
                <rect x="96"  y="18" width="22" height="82" rx="4" fill="#1F4675" />
                <rect x="128" y="4"  width="22" height="96" rx="4" fill="#00C896" />
                <text x="11"  y="114" textAnchor="middle" fontFamily="Plus Jakarta Sans" fontSize="8" fill="#6B7280" fontWeight="600">&apos;11</text>
                <text x="43"  y="114" textAnchor="middle" fontFamily="Plus Jakarta Sans" fontSize="8" fill="#6B7280" fontWeight="600">&apos;15</text>
                <text x="75"  y="114" textAnchor="middle" fontFamily="Plus Jakarta Sans" fontSize="8" fill="#6B7280" fontWeight="600">&apos;19</text>
                <text x="107" y="114" textAnchor="middle" fontFamily="Plus Jakarta Sans" fontSize="8" fill="#6B7280" fontWeight="600">&apos;23</text>
                <text x="139" y="114" textAnchor="middle" fontFamily="Plus Jakarta Sans" fontSize="8" fill="#0A2540" fontWeight="900">&apos;25</text>
              </g>
              <g transform="translate(150 0)">
                <rect x="2" y="3" width="66" height="24" rx="12" fill="#0A2540" opacity=".22" />
                <rect width="66" height="24" rx="12" fill="#00C896" />
                <text x="33" y="16" textAnchor="middle" fontFamily="Sora" fontSize="10" fontWeight="900" fill="white" letterSpacing=".5">+R$ 7 BI</text>
              </g>
              <g transform="translate(160 32)">
                <path d="M0 16 L20 0" stroke="#00785C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                <polygon points="22 -2, 20 8, 14 2" fill="#00785C" />
              </g>
            </svg>
          </div>
          <div className="relative text-center">
            <h3 className="font-display text-xl md:text-[22px] font-bold text-primary-600 mb-2 transition-colors group-hover:text-accent-700">
              Infraestrutura <a href="https://www.cappta.com.br" target="_blank" rel="noopener noreferrer external" className="underline decoration-2 decoration-accent-300 underline-offset-4 hover:decoration-accent-600">Cappta</a>
            </h3>
            <p className="text-[15px] text-text/70 leading-relaxed text-pretty">+R$ 7 bi/ano processados em +14 anos de mercado. A mesma base de adquirentes consolidados.</p>
          </div>
        </div>

        {/* TRUST 2: BACEN */}
        <div className="group relative flex flex-col h-full overflow-hidden rounded-3xl border-2 border-slate-200/60 p-6 md:p-7 transition-all duration-500 ease-out hover:-translate-y-2 hover:border-accent-400 hover:shadow-pop" style={{ background: "linear-gradient(160deg, #E6FAF4 0%, #C9F1DF 100%)" }}>
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ background: "radial-gradient(circle at 70% 0%, rgba(0,200,150,.30), transparent 65%)" }} aria-hidden />
          <div className="absolute top-5 right-5 inline-flex h-10 w-10 items-center justify-center rounded-full bg-accent-500 text-white opacity-0 -translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 shadow-[0_6px_16px_-4px_rgba(0,200,150,.55)] z-10">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><polyline points="20 6 9 17 4 12" /></svg>
          </div>
          <div className="relative h-40 md:h-44 flex items-center justify-center mb-5">
            <svg viewBox="0 0 220 140" className="w-full max-w-[220px] h-auto" aria-hidden>
              <defs>
                <linearGradient id="bldGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#1F4675" />
                  <stop offset="100%" stopColor="#0A2540" />
                </linearGradient>
              </defs>
              <ellipse cx="110" cy="124" rx="80" ry="6" fill="#0A2540" opacity=".18" />
              <rect x="40" y="120" width="140" height="6" fill="url(#bldGrad)" />
              <polygon points="110 22, 44 56, 176 56" fill="url(#bldGrad)" />
              <rect x="44" y="56" width="132" height="6" fill="url(#bldGrad)" />
              <g fill="url(#bldGrad)">
                <rect x="56" y="62" width="14" height="58" rx="2" />
                <rect x="80" y="62" width="14" height="58" rx="2" />
                <rect x="104" y="62" width="14" height="58" rx="2" />
                <rect x="128" y="62" width="14" height="58" rx="2" />
                <rect x="152" y="62" width="14" height="58" rx="2" />
              </g>
              <g fill="rgba(255,255,255,.15)">
                <rect x="58" y="64" width="3" height="54" />
                <rect x="82" y="64" width="3" height="54" />
                <rect x="106" y="64" width="3" height="54" />
                <rect x="130" y="64" width="3" height="54" />
                <rect x="154" y="64" width="3" height="54" />
              </g>
              <g transform="translate(82 12)">
                <rect x="2" y="3" width="60" height="22" rx="11" fill="#0A2540" opacity=".22" />
                <rect width="60" height="22" rx="11" fill="#00C896" />
                <text x="30" y="15" textAnchor="middle" fontFamily="Sora" fontSize="9" fontWeight="900" fill="white" letterSpacing="1.2">BACEN</text>
              </g>
              <g transform="translate(176 92)">
                <circle r="14" fill="white" stroke="#00C896" strokeWidth="2.5" />
                <path d="M-6 0 L-2 4 L6 -4" stroke="#00C896" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              </g>
            </svg>
          </div>
          <div className="relative text-center">
            <h3 className="font-display text-xl md:text-[22px] font-bold text-primary-600 mb-2 transition-colors group-hover:text-accent-700">
              Regulado pelo <a href="https://www.bcb.gov.br" target="_blank" rel="noopener noreferrer external" className="underline decoration-2 decoration-accent-300 underline-offset-4 hover:decoration-accent-600">BACEN</a>
            </h3>
            <p className="text-[15px] text-text/70 leading-relaxed text-pretty">Operação sob a regulação do Banco Central do Brasil — não é gambiarra, é norma do mercado de adquirência.</p>
          </div>
        </div>

        {/* TRUST 3: Parecer */}
        <div className="group relative flex flex-col h-full overflow-hidden rounded-3xl border-2 border-slate-200/60 p-6 md:p-7 transition-all duration-500 ease-out hover:-translate-y-2 hover:border-accent-400 hover:shadow-pop" style={{ background: "linear-gradient(160deg, #FAF6FF 0%, #E8DEFA 100%)" }}>
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ background: "radial-gradient(circle at 30% 100%, rgba(0,200,150,.22), transparent 65%)" }} aria-hidden />
          <div className="absolute top-5 right-5 inline-flex h-10 w-10 items-center justify-center rounded-full bg-accent-500 text-white opacity-0 -translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 shadow-[0_6px_16px_-4px_rgba(0,200,150,.55)] z-10">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><polyline points="20 6 9 17 4 12" /></svg>
          </div>
          <div className="relative h-40 md:h-44 flex items-center justify-center mb-5">
            <svg viewBox="0 0 220 140" className="w-full max-w-[220px] h-auto" aria-hidden>
              <g opacity=".15">
                <circle cx="34" cy="40" r="7" fill="#0A2540" />
                <circle cx="186" cy="100" r="9" fill="#0A2540" />
              </g>
              <g transform="translate(20 16)">
                <rect x="3" y="4" width="100" height="118" rx="8" fill="#0A2540" opacity=".18" />
                <rect width="100" height="118" rx="8" fill="white" stroke="#D9E2EE" strokeWidth="2" />
                <rect x="10" y="10" width="80" height="4" rx="2" fill="#0A2540" />
                <rect x="10" y="20" width="55" height="3" rx="1.5" fill="#A8BBD3" />
                <g fill="#D9E2EE">
                  <rect x="10" y="34" width="80" height="3" rx="1.5" />
                  <rect x="10" y="42" width="74" height="3" rx="1.5" />
                  <rect x="10" y="50" width="80" height="3" rx="1.5" />
                  <rect x="10" y="58" width="60" height="3" rx="1.5" />
                  <rect x="10" y="70" width="80" height="3" rx="1.5" />
                  <rect x="10" y="78" width="68" height="3" rx="1.5" />
                </g>
                <g transform="translate(20 92) rotate(-8)">
                  <rect x="2" y="2" width="56" height="20" rx="10" fill="#0A2540" opacity=".18" />
                  <rect width="56" height="20" rx="10" fill="#00C896" />
                  <text x="28" y="14" textAnchor="middle" fontFamily="Sora" fontSize="8" fontWeight="900" fill="white" letterSpacing="1">APROVADO</text>
                </g>
              </g>
              <g transform="translate(140 26)">
                <line x1="30" y1="6" x2="30" y2="80" stroke="#0A2540" strokeWidth="3" strokeLinecap="round" />
                <circle cx="30" cy="6" r="4" fill="#0A2540" />
                <line x1="6" y1="22" x2="54" y2="22" stroke="#0A2540" strokeWidth="3" strokeLinecap="round" />
                <line x1="6" y1="22" x2="6" y2="38" stroke="#0A2540" strokeWidth="1.5" />
                <line x1="54" y1="22" x2="54" y2="38" stroke="#0A2540" strokeWidth="1.5" />
                <path d="M-4 38 L16 38 L12 50 L0 50 Z" fill="#00C896" />
                <path d="M44 38 L64 38 L60 50 L48 50 Z" fill="#00C896" />
                <rect x="22" y="80" width="16" height="4" fill="#0A2540" />
                <rect x="18" y="84" width="24" height="6" rx="2" fill="#0A2540" />
              </g>
            </svg>
          </div>
          <div className="relative text-center">
            <h3 className="font-display text-xl md:text-[22px] font-bold text-primary-600 mb-2 transition-colors group-hover:text-accent-700">Parecer Jurídico</h3>
            <p className="text-[15px] text-text/70 leading-relaxed mb-3 text-pretty">Emitido pelo escritório <a href="https://www.btlaw.com.br" target="_blank" rel="noopener noreferrer external" className="underline decoration-2 decoration-accent-300 underline-offset-4 hover:decoration-accent-600">Barcellos Tucunduva Advogados</a>. Resumo aqui, integral no WhatsApp comercial.</p>
            <LegalOpinionModal />
          </div>
        </div>
      </div>
    </section>
  );
}
