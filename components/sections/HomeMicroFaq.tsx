import Link from "next/link";
import { ArrowRight } from "lucide-react";

const FAQS = [
  {
    q: "O que é split de pagamento?",
    a: "Split de pagamento é a gestão da divisão de um pagamento na origem da transação — antes do dinheiro virar receita tributável de qualquer das partes. Cada parte vai direto para o dono dela (você, parceiro, fornecedor) e cada um tributa só o que é seu.",
  },
  {
    q: "Isso é legal?",
    a: "Sim. A operação roda sobre infraestrutura Cappta (+14 anos, +R$ 7 bi/ano), regulada pelo Banco Central. Split é a prática padrão do mercado de adquirência para repasses a múltiplos beneficiários. Há parecer técnico-tributário do escritório Barcellos Tucunduva sobre a estrutura.",
  },
  {
    q: "Como o split reduz o meu DAS?",
    a: "No Simples Nacional, o DAS incide sobre o faturamento bruto. Quando você recebe e repassa parte para um parceiro, essa parte também é tributada como se fosse sua. Com o split, a parte do parceiro nunca entra na sua conta — então nunca entra no seu DAS. Você passa a tributar só a sua margem real.",
  },
  {
    q: "Quanto dá pra economizar?",
    a: "Depende do seu % de repasse e da sua faixa do Simples. No exemplo médio (faturamento R$ 45k/mês, 40% pertencendo a parceiros, Anexo III faixa 3), a economia anual passa de R$ 22 mil. Use o simulador acima para o seu caso.",
  },
  {
    q: "O split de pagamento é regulado pelo BACEN?",
    a: "Sim. A operação roda sobre infraestrutura Cappta (mais de 14 anos de mercado, mais de R$ 7 bilhões processados por ano), regulada pelo Banco Central do Brasil. Há também parecer técnico-tributário do escritório Barcellos Tucunduva sobre a estrutura.",
  },
] as const;

const FAQ_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQS.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

export function HomeMicroFaq() {
  return (
    <section aria-label="Perguntas frequentes" className="bg-white border-y border-slate-100">
      <div className="container-page py-12 md:py-16">
        <div className="max-w-2xl mx-auto text-center mb-10">
          <p className="text-xs font-bold uppercase tracking-[.25em] text-accent-600 mb-3">Perguntas frequentes</p>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-primary-600 text-balance leading-[1.1]">
            Antes de chamar no WhatsApp, talvez você queira saber:
          </h2>
        </div>

        <dl className="space-y-3 max-w-3xl mx-auto">
          {FAQS.map((f) => (
            <details
              key={f.q}
              className="faq-item group rounded-2xl border border-slate-200/70 bg-white p-6 md:p-7 hover:border-accent-300 open:border-accent-300"
            >
              <summary className="font-display text-lg font-bold text-primary-600 cursor-pointer flex items-center justify-between gap-3">
                <span>{f.q}</span>
                <span className="chev flex-none inline-flex h-8 w-8 items-center justify-center rounded-full bg-accent-50 text-accent-700 group-hover:bg-accent-100" aria-hidden>
                  <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
                </span>
              </summary>
              <dd className="mt-4 text-text/80 leading-relaxed text-pretty">{f.a}</dd>
            </details>
          ))}
        </dl>

        <div className="mt-10 text-center">
          <Link href="/como-funciona" className="btn btn-link text-sm" style={{ fontWeight: 600 }}>
            Ver explicação completa em /como-funciona
            <ArrowRight className="h-4 w-4 arrow" aria-hidden />
          </Link>
        </div>
      </div>

      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_JSON_LD) }}
      />
    </section>
  );
}
