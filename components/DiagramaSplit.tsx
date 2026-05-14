"use client";

/**
 * DiagramaSplit — fluxo visual do split de pagamento.
 * SVG puro com animações CSS (sem biblioteca externa).
 * Hierarquia clara: Cliente → Maquininha → Cofre Digital → Contas.
 * Paleta alinhada ao brand: navy primário (#0A2540), teal (#00C896), warm (#FF6B35).
 */
export function DiagramaSplit() {
  return (
    <div className="w-full max-w-2xl mx-auto" aria-hidden>
      <style>{`
        @keyframes ds-popIn {
          from { opacity: 0; transform: scale(0.94); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes ds-drawLine {
          from { stroke-dashoffset: 280; opacity: 0; }
          to   { stroke-dashoffset: 0;   opacity: 1; }
        }
        .ds-n1, .ds-n2, .ds-n3, .ds-n4, .ds-n5, .ds-fork {
          transform-box: fill-box;
          transform-origin: center center;
        }
        .ds-n1   { animation: ds-popIn .40s cubic-bezier(.22,1,.36,1) forwards 0s;    opacity: 0; }
        .ds-n2   { animation: ds-popIn .40s cubic-bezier(.22,1,.36,1) forwards .14s;  opacity: 0; }
        .ds-n3   { animation: ds-popIn .40s cubic-bezier(.22,1,.36,1) forwards .30s;  opacity: 0; }
        .ds-fork { animation: ds-popIn .35s cubic-bezier(.22,1,.36,1) forwards .62s;  opacity: 0; }
        .ds-n4   { animation: ds-popIn .40s cubic-bezier(.22,1,.36,1) forwards .74s;  opacity: 0; }
        .ds-n5   { animation: ds-popIn .40s cubic-bezier(.22,1,.36,1) forwards .74s;  opacity: 0; }
        .ds-a1   { animation: ds-drawLine .38s ease-out forwards .20s; opacity: 0; stroke-dasharray: 280; }
        .ds-a2   { animation: ds-drawLine .38s ease-out forwards .36s; opacity: 0; stroke-dasharray: 280; }
        .ds-a3   { animation: ds-drawLine .32s ease-out forwards .54s; opacity: 0; stroke-dasharray: 280; }
        .ds-a4   { animation: ds-drawLine .50s ease-out forwards .80s; opacity: 0; stroke-dasharray: 280; }
        .ds-a5   { animation: ds-drawLine .50s ease-out forwards .80s; opacity: 0; stroke-dasharray: 280; }
      `}</style>

      <svg
        viewBox="0 0 720 292"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto"
        role="img"
        aria-label="Fluxo de pagamento: cliente paga R$6.000, Cofre Digital gere a divisão antes do DAS incidir, R$2.400 vai para sua conta e R$3.600 vai para a conta do parceiro"
      >
        <defs>
          {/* Arrow markers */}
          <marker id="ds-arr-slate" markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto">
            <path d="M0,1 L0,8 L9,4.5 z" fill="#94a3b8" />
          </marker>
          <marker id="ds-arr-green" markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto">
            <path d="M0,1 L0,8 L9,4.5 z" fill="#00C896" />
          </marker>
          <marker id="ds-arr-warm" markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto">
            <path d="M0,1 L0,8 L9,4.5 z" fill="#FF6B35" />
          </marker>
          {/* Clip for Cofre Digital teal top bar */}
          <clipPath id="ds-cofre-clip">
            <rect x="318" y="95" width="158" height="110" rx="12" />
          </clipPath>
        </defs>

        {/* ═══════════════════════════════════════════
            NODE 1 — Cliente
            rect: x=4, y=121, w=107, h=58 · center=(57,150)
        ════════════════════════════════════════════ */}
        <g className="ds-n1">
          <rect x="4" y="121" width="107" height="58" rx="10"
            fill="#f8fafc" stroke="#e2e8f0" strokeWidth="1.5" />
          <text x="57" y="144" textAnchor="middle"
            fontSize="12" fontWeight="700" fill="#334155">Cliente</text>
          <text x="57" y="164" textAnchor="middle"
            fontSize="15" fontWeight="800" fill="#0f172a">R$ 6.000</text>
        </g>

        {/* Arrow 1: Cliente → Maquininha */}
        <path className="ds-a1"
          d="M111 150 L148 150"
          stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round"
          markerEnd="url(#ds-arr-slate)" />

        {/* ═══════════════════════════════════════════
            NODE 2 — Maquininha SplitTech
            rect: x=150, y=108, w=120, h=84 · center=(210,150)
        ════════════════════════════════════════════ */}
        <g className="ds-n2">
          <rect x="150" y="108" width="120" height="84" rx="10"
            fill="#f0f4ff" stroke="#c7d7fe" strokeWidth="1.5" />
          <text x="210" y="134" textAnchor="middle"
            fontSize="12" fontWeight="700" fill="#1e3a8a">Maquininha</text>
          <text x="210" y="151" textAnchor="middle"
            fontSize="12" fontWeight="700" fill="#1e3a8a">SplitTech</text>
          <text x="210" y="169" textAnchor="middle"
            fontSize="10" fill="#64748b">mesma operação</text>
          <text x="210" y="183" textAnchor="middle"
            fontSize="10" fill="#94a3b8">do cliente</text>
        </g>

        {/* Arrow 2: Maquininha → Cofre */}
        <path className="ds-a2"
          d="M270 150 L318 150"
          stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round"
          markerEnd="url(#ds-arr-slate)" />

        {/* ═══════════════════════════════════════════
            NODE 3 — Cofre Digital (centrepiece)
            rect: x=318, y=95, w=158, h=110 · center=(397,150)
        ════════════════════════════════════════════ */}
        <g className="ds-n3">
          {/* Navy body */}
          <rect x="318" y="95" width="158" height="110" rx="12" fill="#0A2540" />
          {/* Teal accent bar (top), clipped to node shape */}
          <rect x="318" y="95" width="158" height="8" fill="#00C896"
            clipPath="url(#ds-cofre-clip)" />
          {/* Eyebrow */}
          <text x="397" y="117" textAnchor="middle"
            fontSize="9" fontWeight="700" fill="#00C896" letterSpacing="1.8">COFRE DIGITAL</text>
          {/* Divider */}
          <line x1="338" y1="125" x2="456" y2="125"
            stroke="#ffffff" strokeOpacity="0.1" strokeWidth="1" />
          {/* Main label */}
          <text x="397" y="144" textAnchor="middle"
            fontSize="14" fontWeight="700" fill="#ffffff">Gestão na origem</text>
          <text x="397" y="161" textAnchor="middle"
            fontSize="10" fill="#94a3b8">antes do DAS incidir</text>
          {/* Divider */}
          <line x1="338" y1="170" x2="456" y2="170"
            stroke="#ffffff" strokeOpacity="0.1" strokeWidth="1" />
          {/* Credential badge */}
          <text x="397" y="186" textAnchor="middle"
            fontSize="10" fontWeight="600" fill="#00C896">Cappta · Regulado BACEN</text>
        </g>

        {/* Arrow 3: Cofre → Fork */}
        <path className="ds-a3"
          d="M476 150 L521 150"
          stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round"
          markerEnd="url(#ds-arr-slate)" />

        {/* ═══════════════════════════════════════════
            FORK CIRCLE — cx=533, cy=150, r=12
            Visual anchor: shows the split happening
        ════════════════════════════════════════════ */}
        <g className="ds-fork">
          <circle cx="533" cy="150" r="12"
            fill="white" stroke="#0A2540" strokeWidth="1.5" />
          {/* Incoming flow */}
          <line x1="526" y1="150" x2="533" y2="150"
            stroke="#64748b" strokeWidth="1.5" strokeLinecap="round" />
          {/* Fork up — teal */}
          <line x1="533" y1="150" x2="539" y2="143"
            stroke="#00C896" strokeWidth="1.5" strokeLinecap="round" />
          {/* Fork down — warm */}
          <line x1="533" y1="150" x2="539" y2="157"
            stroke="#FF6B35" strokeWidth="1.5" strokeLinecap="round" />
        </g>

        {/* Arrow 4: Fork → Sua conta (teal, L-shape up-right) */}
        <path className="ds-a4"
          d="M533 138 L533 72 L560 72"
          stroke="#00C896" strokeWidth="2.5" strokeLinecap="round"
          markerEnd="url(#ds-arr-green)" />

        {/* Arrow 5: Fork → Conta parceiro (warm, L-shape down-right) */}
        <path className="ds-a5"
          d="M533 162 L533 228 L560 228"
          stroke="#FF6B35" strokeWidth="2.5" strokeLinecap="round"
          markerEnd="url(#ds-arr-warm)" />

        {/* ═══════════════════════════════════════════
            NODE 4 — Sua conta
            rect: x=562, y=24, w=154, h=96 · center=(639,72)
        ════════════════════════════════════════════ */}
        <g className="ds-n4">
          <rect x="562" y="24" width="154" height="96" rx="10" fill="#00C896" />
          <text x="639" y="48" textAnchor="middle"
            fontSize="11" fontWeight="700" fill="#0A2540">Sua conta</text>
          <text x="639" y="75" textAnchor="middle"
            fontSize="23" fontWeight="800" fill="#0A2540">R$ 2.400</text>
          <text x="639" y="93" textAnchor="middle"
            fontSize="10" fill="#0A2540" opacity="0.6">DAS só sobre</text>
          <text x="639" y="107" textAnchor="middle"
            fontSize="10" fill="#0A2540" opacity="0.6">sua margem real</text>
        </g>

        {/* ═══════════════════════════════════════════
            NODE 5 — Conta do parceiro
            rect: x=562, y=180, w=154, h=96 · center=(639,228)
        ════════════════════════════════════════════ */}
        <g className="ds-n5">
          <rect x="562" y="180" width="154" height="96" rx="10" fill="#FF6B35" />
          <text x="639" y="204" textAnchor="middle"
            fontSize="11" fontWeight="700" fill="white">Conta do parceiro</text>
          <text x="639" y="231" textAnchor="middle"
            fontSize="23" fontWeight="800" fill="white">R$ 3.600</text>
          <text x="639" y="249" textAnchor="middle"
            fontSize="10" fill="white" opacity="0.75">Não entra no</text>
          <text x="639" y="263" textAnchor="middle"
            fontSize="10" fill="white" opacity="0.75">seu DAS</text>
        </g>
      </svg>

      <p className="text-center text-xs text-muted mt-2">
        Mesma maquininha — a divisão é gerida antes do DAS incidir
      </p>
    </div>
  );
}
