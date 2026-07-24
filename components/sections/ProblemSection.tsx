import { AlertTriangle } from "lucide-react";
import type { Segment } from "@/lib/segments";
import { formatBRL, formatPercent } from "@/lib/utils";

export function ProblemSection({ segment }: { segment: Segment }) {
  const e = segment.example;

  return (
    <section className="container-page py-14 md:py-20">
      <div className="max-w-3xl mx-auto text-center mb-12">
        <p className="inline-flex items-center gap-2 rounded-full bg-warm-500/10 text-warm-700 px-3 py-1 text-xs font-bold uppercase tracking-[.2em] mb-4">
          <AlertTriangle className="h-3.5 w-3.5" aria-hidden />
          O que pega no seu DAS
        </p>
        <h2 className="font-display text-3xl md:text-5xl font-bold text-primary-600 mb-4 text-balance leading-[1.05]">
          Você + seu parceiro pagam imposto sobre o mesmo R$.
        </h2>
        <p className="text-lg text-text/75 leading-relaxed text-pretty">
          {segment.pain}
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-5 items-start">
        <div className="lg:col-span-3">
          <div
            className="relative rounded-3xl border border-slate-200/70 p-6 md:p-8 shadow-soft"
            style={{ background: "linear-gradient(160deg, #FFFFFF 0%, #F7F9FC 100%)" }}
          >
            <p className="text-text/75 leading-relaxed mb-4 text-pretty">
              No Simples Nacional, o DAS incide sobre o{" "}
              <strong className="text-primary-600">faturamento bruto</strong>.
              Tudo que passa pela sua conta entra no cálculo. Quando o cliente
              paga e parte daquele dinheiro pertence a um parceiro (
              <strong>{segment.third_party}</strong>), essa parte é tributada
              como se fosse sua — mesmo nunca tendo sido receita real do seu
              negócio.
            </p>
            <p className="text-text/75 leading-relaxed text-pretty">
              Isso é{" "}
              <strong className="text-warm-600">bitributação</strong>. Você paga
              DAS sobre dinheiro que não era seu, e o seu parceiro paga DAS
              sobre o mesmo dinheiro de novo, na conta dele.
            </p>
          </div>
        </div>

        <aside className="lg:col-span-2">
          <div
            className="relative rounded-3xl border-2 border-warm-500/30 p-6 md:p-7 overflow-hidden"
            style={{ background: "linear-gradient(160deg, #FFF4ED 0%, #FFE0CB 100%)" }}
          >
            <div className="absolute -top-20 -right-16 w-48 h-48 rounded-full bg-warm-500/20 blur-3xl" aria-hidden />
            <div className="relative">
              <p className="text-[11px] font-bold uppercase tracking-[.25em] text-warm-700 mb-4">
                Exemplo no seu segmento
              </p>

              <DataRow label="Faturamento anual" value={formatBRL(e.annual_revenue)} />
              <DataRow
                label={`Parte que pertence a ${segment.third_party.split(" (")[0]}`}
                value={`${e.repasse_percent}% · ${formatBRL(e.repasse_value)}`}
              />
              <DataRow label="Alíquota Simples" value={formatPercent(e.tax_rate)} />

              <div className="mt-5 pt-5 border-t border-warm-500/30">
                <p className="text-[10px] uppercase tracking-[.25em] text-warm-700 mb-1 font-bold">
                  DAS pago a mais hoje
                </p>
                <p className="font-display text-3xl md:text-4xl font-extrabold text-warm-600 leading-tight tracking-tight">
                  {formatBRL(e.annual_savings)}
                  <span className="text-base font-semibold opacity-70"> /ano</span>
                </p>
                <p className="text-sm text-text/70 mt-1.5">
                  = <strong>{formatBRL(e.monthly_savings)}</strong> todo mês saindo do seu bolso
                </p>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}

function DataRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between py-2.5 border-b border-warm-500/15 last:border-0">
      <span className="text-sm text-text/75">{label}</span>
      <span className="font-display font-bold text-primary-600 tabular-nums text-sm">{value}</span>
    </div>
  );
}
