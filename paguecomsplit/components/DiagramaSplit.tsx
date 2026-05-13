"use client";

/**
 * DiagramaSplit — fluxo visual do split de pagamento.
 * SVG puro com setas animadas via CSS (sem biblioteca externa).
 * Setas aparecem em sequência: cliente → maquininha → cofre → contas.
 */
export function DiagramaSplit() {
  return (
    <div className="w-full max-w-2xl mx-auto" aria-hidden>
      <style>{`
        @keyframes drawPath {
          from { stroke-dashoffset: 200; opacity: 0; }
          to   { stroke-dashoffset: 0;   opacity: 1; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .arrow-1 { animation: drawPath 0.5s ease forwards 0.3s; opacity: 0; stroke-dasharray: 200; }
        .arrow-2 { animation: drawPath 0.5s ease forwards 0.9s; opacity: 0; stroke-dasharray: 200; }
        .arrow-3 { animation: drawPath 0.5s ease forwards 1.5s; opacity: 0; stroke-dasharray: 200; }
        .arrow-4 { animation: drawPath 0.5s ease forwards 2.1s; opacity: 0; stroke-dasharray: 200; }
        .node-1  { animation: fadeIn 0.4s ease forwards 0s;   opacity: 0; }
        .node-2  { animation: fadeIn 0.4s ease forwards 0.6s; opacity: 0; }
        .node-3  { animation: fadeIn 0.4s ease forwards 1.2s; opacity: 0; }
        .node-4  { animation: fadeIn 0.4s ease forwards 1.8s; opacity: 0; }
        .node-5  { animation: fadeIn 0.4s ease forwards 2.4s; opacity: 0; }
      `}</style>

      <svg
        viewBox="0 0 640 340"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto"
        role="img"
        aria-label="Fluxo do split: cliente paga, Cofre Digital separa antes do DAS, cada parte vai para o dono"
      >
        {/* ── NODO 1: Cliente ── */}
        <g className="node-1">
          <rect x="20" y="120" width="110" height="56" rx="10" fill="#f0f4ff" stroke="#c7d7fe" strokeWidth="1.5" />
          <text x="75" y="143" textAnchor="middle" fontSize="11" fontWeight="600" fill="#1a3557">Cliente</text>
          <text x="75" y="158" textAnchor="middle" fontSize="10" fill="#64748b">paga R$ 6.000</text>
          <text x="75" y="170" textAnchor="middle" fontSize="9" fill="#94a3b8">no cartão</text>
        </g>

        {/* ── SETA 1: Cliente → Maquininha ── */}
        <path className="arrow-1" d="M130 148 L178 148" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" markerEnd="url(#arrowBlue)" />

        {/* ── NODO 2: Maquininha SplitTech ── */}
        <g className="node-2">
          <rect x="180" y="112" width="120" height="72" rx="10" fill="#eff6ff" stroke="#93c5fd" strokeWidth="1.5" />
          <text x="240" y="135" textAnchor="middle" fontSize="11" fontWeight="600" fill="#1a3557">Maquininha</text>
          <text x="240" y="150" textAnchor="middle" fontSize="10" fill="#64748b">SplitTech</text>
          <text x="240" y="165" textAnchor="middle" fontSize="9" fill="#f59e0b" fontWeight="600">mesma operação</text>
          <text x="240" y="177" textAnchor="middle" fontSize="9" fill="#94a3b8">do cliente</text>
        </g>

        {/* ── SETA 2: Maquininha → Cofre Digital ── */}
        <path className="arrow-2" d="M300 148 L348 148" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" markerEnd="url(#arrowBlue)" />

        {/* ── NODO 3: Cofre Digital (destaque) ── */}
        <g className="node-3">
          <rect x="350" y="108" width="136" height="80" rx="10" fill="#1a3557" stroke="#1a3557" strokeWidth="1.5" />
          <text x="418" y="133" textAnchor="middle" fontSize="11" fontWeight="700" fill="white">Cofre Digital</text>
          <text x="418" y="149" textAnchor="middle" fontSize="9" fill="#f59e0b" fontWeight="600">divisão na origem</text>
          <text x="418" y="163" textAnchor="middle" fontSize="9" fill="#94a3b8">antes do DAS incidir</text>
          <text x="418" y="178" textAnchor="middle" fontSize="8" fill="#64748b">Cappta · BACEN</text>
        </g>

        {/* ── SETA 3: Cofre → Sua conta ── */}
        <path className="arrow-3" d="M418 108 L418 72 L530 72 L530 102" stroke="#10b981" strokeWidth="2" strokeLinecap="round" markerEnd="url(#arrowGreen)" />

        {/* ── SETA 4: Cofre → Conta parceiro ── */}
        <path className="arrow-4" d="M418 188 L418 224 L530 224 L530 198" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" markerEnd="url(#arrowAmber)" />

        {/* ── NODO 4: Sua conta ── */}
        <g className="node-4">
          <rect x="480" y="44" width="140" height="64" rx="10" fill="#ecfdf5" stroke="#6ee7b7" strokeWidth="1.5" />
          <text x="550" y="65" textAnchor="middle" fontSize="11" fontWeight="600" fill="#065f46">Sua conta</text>
          <text x="550" y="80" textAnchor="middle" fontSize="13" fontWeight="700" fill="#059669">R$ 2.400</text>
          <text x="550" y="96" textAnchor="middle" fontSize="9" fill="#6ee7b7">DAS só sobre</text>
          <text x="550" y="107" textAnchor="middle" fontSize="9" fill="#6ee7b7">sua margem real</text>
        </g>

        {/* ── NODO 5: Conta parceiro ── */}
        <g className="node-5">
          <rect x="480" y="198" width="140" height="64" rx="10" fill="#fffbeb" stroke="#fcd34d" strokeWidth="1.5" />
          <text x="550" y="219" textAnchor="middle" fontSize="11" fontWeight="600" fill="#78350f">Conta do parceiro</text>
          <text x="550" y="234" textAnchor="middle" fontSize="13" fontWeight="700" fill="#d97706">R$ 3.600</text>
          <text x="550" y="250" textAnchor="middle" fontSize="9" fill="#fcd34d">DAS sobre</text>
          <text x="550" y="261" textAnchor="middle" fontSize="9" fill="#fcd34d">a parte dele</text>
        </g>

        {/* ── Marcadores de seta ── */}
        <defs>
          <marker id="arrowBlue" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
            <path d="M0,0 L0,6 L8,3 z" fill="#6366f1" />
          </marker>
          <marker id="arrowGreen" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
            <path d="M0,0 L0,6 L8,3 z" fill="#10b981" />
          </marker>
          <marker id="arrowAmber" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
            <path d="M0,0 L0,6 L8,3 z" fill="#f59e0b" />
          </marker>
        </defs>
      </svg>

      {/* Label acessível */}
      <p className="text-center text-xs text-muted mt-2">
        Mesma maquininha — a divisão é gerida antes do DAS incidir
      </p>
    </div>
  );
}
