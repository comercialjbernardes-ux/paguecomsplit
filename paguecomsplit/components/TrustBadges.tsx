import { Landmark, ShieldCheck, Scale } from "lucide-react";
import { LegalOpinionModal } from "./LegalOpinionModal";

export function TrustBadges() {
  return (
    <section className="container-page py-12 md:py-16">
      <p className="text-xs font-bold uppercase tracking-widest text-accent-600 mb-3 text-center">
        A infraestrutura por trás do split
      </p>
      <div className="grid gap-4 md:grid-cols-3 mt-4">
        <div className="flex items-start gap-3 rounded-lg border border-slate-100 bg-white p-5 shadow-soft">
          <ShieldCheck className="h-8 w-8 flex-none text-accent-600" aria-hidden />
          <div>
            <p className="font-display text-sm font-bold text-primary-600">
              Infraestrutura Cappta
            </p>
            <p className="text-sm text-muted leading-snug">
              +R$ 7 bi/ano processados em +14 anos de mercado. A mesma base
              de adquirentes consolidados.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 rounded-lg border border-slate-100 bg-white p-5 shadow-soft">
          <Landmark className="h-8 w-8 flex-none text-accent-600" aria-hidden />
          <div>
            <p className="font-display text-sm font-bold text-primary-600">
              Regulado pelo BACEN
            </p>
            <p className="text-sm text-muted leading-snug">
              Operação sob a regulação do Banco Central do Brasil — não é
              gambiarra, é norma do mercado de adquirência.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 rounded-lg border border-slate-100 bg-white p-5 shadow-soft">
          <Scale className="h-8 w-8 flex-none text-accent-600" aria-hidden />
          <div>
            <p className="font-display text-sm font-bold text-primary-600">
              Parecer Jurídico
            </p>
            <p className="text-sm text-muted leading-snug mb-2">
              Barcellos Tucunduva Advogados. Resumo aqui, integral no
              WhatsApp comercial.
            </p>
            <LegalOpinionModal />
          </div>
        </div>
      </div>
    </section>
  );
}
