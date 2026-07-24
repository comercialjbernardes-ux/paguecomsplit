import Link from "next/link";
import { ArrowRight, Wallet, ArrowDown, Receipt, Split, CheckCircle2 } from "lucide-react";

export function HomeHowItWorks() {
  return (
    <section id="como-funciona" className="bg-white">
      <div className="container-page py-14 md:py-24">
        <div className="max-w-3xl mx-auto text-center mb-14 md:mb-20">
          <p className="text-xs font-bold uppercase tracking-[.2em] text-accent-600 mb-3">Como funciona</p>
          <h2 className="font-display text-3xl md:text-5xl font-bold text-primary-600 mb-4 text-balance leading-[1.05]">
            Cada parte é separada antes de gerar imposto.
          </h2>
          <p className="text-lg text-text/75 leading-relaxed text-pretty">
            Mesma maquininha, mesma operação. A SplitTech administra a divisão do pagamento <strong>antes</strong> do DAS incidir — a parte do parceiro (fornecedor, autônomo) vai direto para a conta dele e você passa a tributar só a sua margem real.
          </p>
          <p className="mt-5 inline-flex items-center gap-2 rounded-full bg-accent-50 border border-accent-200 text-accent-700 px-4 py-1.5 text-xs font-bold uppercase tracking-widest">
            <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
            Resultado prático · veja lado a lado
          </p>
        </div>

        {/* ROW 1: HOJE */}
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center mb-14 md:mb-24">
          <div className="order-2 lg:order-1">
            <div className="relative rounded-3xl border border-warm-500/25 overflow-hidden p-6 md:p-8" style={{ background: "linear-gradient(160deg, #FFF4ED 0%, #FFE0CB 100%)" }}>
              <div className="absolute -top-20 -right-16 w-64 h-64 rounded-full bg-warm-500/15 blur-3xl" aria-hidden />
              <svg viewBox="0 0 400 360" className="relative w-full h-auto" aria-hidden>
                <g transform="translate(150 14)">
                  <rect x="3" y="4" width="100" height="140" rx="14" fill="#0A2540" opacity=".12" />
                  <rect width="100" height="140" rx="14" fill="white" stroke="#D9E2EE" strokeWidth="2" />
                  <rect x="10" y="10" width="80" height="48" rx="6" fill="#0A2540" />
                  <text x="50" y="28" textAnchor="middle" fontFamily="Sora" fontSize="6" fontWeight="800" fill="#7FE6C4" letterSpacing="1.5">VALOR</text>
                  <text x="50" y="48" textAnchor="middle" fontFamily="Sora" fontSize="16" fontWeight="800" fill="white">R$ 6.000</text>
                  <g fill="#F0F4F9">
                    <rect x="10" y="64" width="22" height="18" rx="4" /><rect x="36" y="64" width="22" height="18" rx="4" /><rect x="62" y="64" width="22" height="18" rx="4" />
                    <rect x="10" y="86" width="22" height="18" rx="4" /><rect x="36" y="86" width="22" height="18" rx="4" /><rect x="62" y="86" width="22" height="18" rx="4" />
                    <rect x="10" y="108" width="22" height="18" rx="4" /><rect x="36" y="108" width="22" height="18" rx="4" />
                  </g>
                  <rect x="62" y="108" width="22" height="18" rx="4" fill="#00C896" />
                </g>
                <path d="M 200 162 L 200 198" stroke="#FF6B35" strokeWidth="3" strokeLinecap="round" fill="none" />
                <polygon points="200 208, 192 196, 208 196" fill="#FF6B35" />
                <g transform="translate(60 220)">
                  <rect x="3" y="4" width="280" height="92" rx="16" fill="#0A2540" opacity=".10" />
                  <rect width="280" height="92" rx="16" fill="white" stroke="#FF6B35" strokeWidth="2.5" />
                  <text x="140" y="34" textAnchor="middle" fontFamily="Sora" fontSize="9" fontWeight="800" fill="#C24A1F" letterSpacing="1.5">SUA CONTA TRIBUTÁVEL</text>
                  <text x="140" y="72" textAnchor="middle" fontFamily="Sora" fontSize="32" fontWeight="900" fill="#0A2540">R$ 6.000</text>
                </g>
                <g transform="translate(286 312) rotate(-10)">
                  <rect x="3" y="3" width="100" height="40" rx="6" fill="#0A2540" opacity=".18" />
                  <rect width="100" height="40" rx="6" fill="#FF6B35" />
                  <text x="50" y="17" textAnchor="middle" fontFamily="Sora" fontSize="7" fontWeight="900" fill="white" letterSpacing="1.5">DAS PAGO</text>
                  <text x="50" y="34" textAnchor="middle" fontFamily="Sora" fontSize="13" fontWeight="900" fill="white">R$ 810</text>
                </g>
              </svg>
            </div>
          </div>
          <div className="order-1 lg:order-2">
            <span className="inline-flex items-center gap-2 rounded-full bg-warm-500/10 text-warm-700 px-3 py-1 text-xs font-bold uppercase tracking-[.2em] mb-5">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5" aria-hidden>
                <polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              Hoje: bitributação
            </span>
            <h3 className="font-display text-2xl md:text-4xl font-bold text-primary-600 mb-6 text-balance leading-[1.1]">
              Tudo cai na sua conta — e tudo é tributado.
            </h3>
            <ul className="space-y-4 mb-7" role="list">
              <Bullet tone="warm" icon={<Wallet className="h-4 w-4" />} title="Cliente paga R$ 6.000" sub="Cartão · PIX · link · boleto" />
              <Bullet tone="warm" icon={<ArrowDown className="h-4 w-4" />} title="Tudo entra como sua receita" sub="Você repassa depois ao parceiro" />
              <Bullet tone="warm" icon={<Receipt className="h-4 w-4" />} title="DAS sobre R$ 6.000" sub="Imposto sobre dinheiro que não era seu" />
            </ul>
            <div className="inline-flex items-baseline gap-3 rounded-xl bg-warm-500/10 border border-warm-500/30 px-5 py-3.5">
              <span className="text-[11px] font-bold uppercase tracking-[.2em] text-warm-700">DAS resultante</span>
              <span className="font-display text-2xl md:text-3xl font-extrabold text-warm-600 tabular-nums">R$ 810</span>
            </div>
          </div>
        </div>

        {/* ROW 2: COM COFRE */}
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center mb-12">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-accent-500/12 text-accent-700 px-3 py-1 text-xs font-bold uppercase tracking-[.2em] mb-5">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5" aria-hidden>
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <polyline points="9 12 11 14 15 10" />
              </svg>
              Com Cofre Digital
            </span>
            <h3 className="font-display text-2xl md:text-4xl font-bold text-primary-600 mb-6 text-balance leading-[1.1]">
              Cada parte é separada na origem — e cada um tributa só o que é seu.
            </h3>
            <ul className="space-y-4 mb-7" role="list">
              <Bullet tone="accent" icon={<Wallet className="h-4 w-4" />} title="Cliente paga R$ 6.000" sub="Mesma maquininha" />
              <Bullet tone="accent" icon={<Split className="h-4 w-4" />} title="A divisão é gerida na origem" sub="R$ 2.400 sua · R$ 3.600 do parceiro" />
              <Bullet tone="accent" icon={<CheckCircle2 className="h-4 w-4" />} title="DAS só sobre R$ 2.400" sub="Você tributa só a sua margem real" />
            </ul>
            <div className="inline-flex items-baseline gap-3 rounded-xl bg-accent-500/10 border border-accent-300 px-5 py-3.5">
              <span className="text-[11px] font-bold uppercase tracking-[.2em] text-accent-700">DAS resultante</span>
              <span className="font-display text-2xl md:text-3xl font-extrabold text-accent-700 tabular-nums">R$ 324</span>
            </div>
          </div>
          <div>
            <div className="relative rounded-3xl border border-accent-300/40 overflow-hidden p-6 md:p-8" style={{ background: "linear-gradient(160deg, #E6FAF4 0%, #C9F1DF 100%)" }}>
              <div className="absolute -top-20 -left-16 w-64 h-64 rounded-full bg-accent-500/15 blur-3xl" aria-hidden />
              <svg viewBox="0 0 400 360" className="relative w-full h-auto" aria-hidden>
                <g transform="translate(150 8)">
                  <rect x="3" y="4" width="100" height="120" rx="14" fill="#0A2540" opacity=".12" />
                  <rect width="100" height="120" rx="14" fill="white" stroke="#D9E2EE" strokeWidth="2" />
                  <rect x="10" y="10" width="80" height="44" rx="6" fill="#0A2540" />
                  <text x="50" y="26" textAnchor="middle" fontFamily="Sora" fontSize="6" fontWeight="800" fill="#7FE6C4" letterSpacing="1.5">VALOR</text>
                  <text x="50" y="46" textAnchor="middle" fontFamily="Sora" fontSize="15" fontWeight="800" fill="white">R$ 6.000</text>
                  <g transform="translate(38 64)">
                    <line x1="12" y1="2" x2="12" y2="20" stroke="#0A2540" strokeWidth="2.5" strokeLinecap="round" />
                    <line x1="12" y1="20" x2="2" y2="36" stroke="#00C896" strokeWidth="2.5" strokeLinecap="round" />
                    <line x1="12" y1="20" x2="22" y2="36" stroke="#FF6B35" strokeWidth="2.5" strokeLinecap="round" />
                    <circle cx="2" cy="40" r="3" fill="#00C896" />
                    <circle cx="22" cy="40" r="3" fill="#FF6B35" />
                  </g>
                </g>
                <path d="M 170 140 C 130 180, 100 200, 70 220" stroke="#00C896" strokeWidth="3" strokeLinecap="round" strokeDasharray="5 4" fill="none" />
                <path d="M 230 140 C 270 180, 300 200, 330 220" stroke="#FF6B35" strokeWidth="3" strokeLinecap="round" strokeDasharray="5 4" fill="none" />
                <polygon points="68 216, 60 226, 76 224" fill="#00C896" />
                <polygon points="332 216, 324 224, 340 226" fill="#FF6B35" />
                <g transform="translate(14 230)">
                  <rect x="3" y="4" width="140" height="100" rx="16" fill="#0A2540" opacity=".10" />
                  <rect width="140" height="100" rx="16" fill="white" stroke="#00C896" strokeWidth="2.5" />
                  <text x="16" y="26" fontFamily="Sora" fontSize="9" fontWeight="800" fill="#00785C" letterSpacing="1.5">SUA MARGEM</text>
                  <text x="16" y="62" fontFamily="Sora" fontSize="22" fontWeight="900" fill="#0A2540">R$ 2.400</text>
                  <text x="16" y="84" fontFamily="Plus Jakarta Sans" fontSize="10" fill="#6B7280">tributa só isso</text>
                </g>
                <g transform="translate(246 230)">
                  <rect x="3" y="4" width="140" height="100" rx="16" fill="#0A2540" opacity=".10" />
                  <rect width="140" height="100" rx="16" fill="white" stroke="#FF6B35" strokeWidth="2.5" />
                  <text x="16" y="26" fontFamily="Sora" fontSize="9" fontWeight="800" fill="#C24A1F" letterSpacing="1.5">DO PARCEIRO</text>
                  <text x="16" y="62" fontFamily="Sora" fontSize="22" fontWeight="900" fill="#0A2540">R$ 3.600</text>
                  <text x="16" y="84" fontFamily="Plus Jakarta Sans" fontSize="10" fill="#6B7280">fora do seu DAS</text>
                </g>
              </svg>
            </div>
          </div>
        </div>

        {/* Banner economia */}
        <div className="mt-6 rounded-3xl border-2 border-accent-300 p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center gap-5 md:gap-8" style={{ background: "linear-gradient(135deg, #E6FAF4 0%, #B9F2DF 100%)" }}>
          <div className="flex-1">
            <p className="text-[11px] font-bold uppercase tracking-[.25em] text-accent-700 mb-1">Economia nesta única transação</p>
            <p className="font-display text-4xl md:text-5xl font-extrabold text-accent-700 leading-tight tracking-tight">
              R$ 486 <span className="text-2xl md:text-3xl text-accent-700/70 font-medium">/ cliente</span>
            </p>
            <p className="text-[15px] text-text/75 mt-2 text-pretty max-w-2xl">
              Multiplique pelo número de operações do seu negócio no mês. Costuma render entre <strong>R$ 1.000 e R$ 5.000/mês</strong> de economia, dependendo do segmento e da faixa do Simples.
            </p>
            <p className="text-xs text-text/55 mt-2">
              Exemplo baseado no <strong>Anexo III, faixa 3</strong> (R$ 360k–720k/ano, alíquota nominal 13,5%). Para o seu caso real, use o <a href="#simulador" className="underline hover:text-accent-700">simulador abaixo</a>.
            </p>
          </div>
          <Link href="/como-funciona" className="btn btn-dark btn-lg flex-none">
            Ver como administramos o split
            <ArrowRight className="h-4 w-4 arrow" aria-hidden />
          </Link>
        </div>
      </div>
    </section>
  );
}

function Bullet({ tone, icon, title, sub }: { tone: "warm" | "accent"; icon: React.ReactNode; title: string; sub: string }) {
  const cls = tone === "warm"
    ? "bg-warm-500/12 text-warm-600"
    : "bg-accent-500/15 text-accent-700";
  return (
    <li className="flex items-start gap-4">
      <span className={`flex-none inline-flex h-8 w-8 items-center justify-center rounded-full mt-0.5 ${cls}`}>
        {icon}
      </span>
      <div>
        <p className="font-display font-bold text-primary-600 text-[17px]">{title}</p>
        <p className="text-sm text-text/65 mt-0.5">{sub}</p>
      </div>
    </li>
  );
}
