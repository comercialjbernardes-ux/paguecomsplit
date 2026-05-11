import { AlertTriangle } from "lucide-react";
import type { Segment } from "@/lib/segments";
import { formatBRL, formatPercent } from "@/lib/utils";

export function ProblemSection({ segment }: { segment: Segment }) {
  const e = segment.example;

  return (
    <section className="container-page py-16 md:py-24">
      <div className="grid gap-10 lg:grid-cols-5">
        <div className="lg:col-span-3 max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-widest text-warm-600 mb-3 inline-flex items-center gap-2">
            <AlertTriangle className="h-3.5 w-3.5" aria-hidden />
            O problema
          </p>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-primary-600 mb-4 text-balance">
            Você está pagando imposto sobre dinheiro que não é seu.
          </h2>
          <p className="text-lg text-text/80 leading-relaxed mb-4 text-pretty">
            {segment.pain}
          </p>
          <p className="text-text/70 leading-relaxed mb-4 text-pretty">
            No Simples Nacional, o imposto incide sobre o <strong>faturamento bruto</strong> — tudo que cai
            na sua conta entra no DAS. Quando você recebe pelo cliente e
            <strong> repassa parte para um terceiro</strong> ({segment.third_party}), aquela parte
            também é tributada como se fosse sua, mesmo que você nunca a tenha
            tido como receita real.
          </p>
          <p className="text-text/70 leading-relaxed text-pretty">
            Mês após mês, isso vira uma sangria silenciosa: você tributa o
            dinheiro do terceiro como se fosse seu lucro.
          </p>
        </div>

        <aside className="lg:col-span-2">
          <div className="rounded-xl border-2 border-warm-500/30 bg-warm-500/5 p-6 md:p-7">
            <p className="text-xs font-bold uppercase tracking-widest text-warm-600 mb-4">
              Exemplo no seu segmento
            </p>

            <DataRow label="Faturamento anual" value={formatBRL(e.annual_revenue)} />
            <DataRow
              label={`Repasse para ${segment.third_party.split(" (")[0]}`}
              value={`${e.repasse_percent}% · ${formatBRL(e.repasse_value)}`}
            />
            <DataRow label="Alíquota Simples" value={formatPercent(e.tax_rate)} />

            <div className="mt-5 pt-5 border-t border-warm-500/20">
              <p className="text-xs uppercase tracking-widest text-warm-600 mb-1">
                Imposto indevido pago hoje
              </p>
              <p className="font-display text-3xl md:text-4xl font-extrabold text-warm-600">
                {formatBRL(e.annual_savings)}
                <span className="text-base font-semibold opacity-70"> /ano</span>
              </p>
              <p className="text-sm text-text/70 mt-1">
                = {formatBRL(e.monthly_savings)} por mês saindo do seu bolso
              </p>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}

function DataRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between py-2.5 border-b border-warm-500/10 last:border-0">
      <span className="text-sm text-text/70">{label}</span>
      <span className="font-semibold text-text tabular-nums">{value}</span>
    </div>
  );
}
