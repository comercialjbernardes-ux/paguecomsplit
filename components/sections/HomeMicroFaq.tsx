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
    <section
      aria-label="Perguntas frequentes"
      className="bg-white border-y border-slate-100"
    >
      <div className="container-page py-12 md:py-16">
        <div className="max-w-2xl mb-8">
          <p className="text-xs font-bold uppercase tracking-widest text-accent-600 mb-3">
            Perguntas frequentes
          </p>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-primary-600 text-balance">
            Antes de chamar no WhatsApp, talvez você queira saber:
          </h2>
        </div>

        <dl className="space-y-4 max-w-3xl">
          {FAQS.map((f) => (
            <details
              key={f.q}
              className="group rounded-xl border border-slate-100 bg-bg p-5 md:p-6 open:bg-white open:border-slate-200"
            >
              <summary className="font-display text-lg font-bold text-primary-600 cursor-pointer list-none flex items-center justify-between gap-3">
                <span>{f.q}</span>
                <span
                  className="flex-none text-accent-600 group-open:rotate-90 transition-transform"
                  aria-hidden
                >
                  <ArrowRight className="h-5 w-5" />
                </span>
              </summary>
              <dd className="mt-3 text-text/80 leading-relaxed text-pretty">
                {f.a}
              </dd>
            </details>
          ))}
        </dl>

        <div className="mt-8">
          <Link
            href="/como-funciona"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-600 hover:text-accent-700"
          >
            Ver explicação completa em /como-funciona
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      </div>

      {/* JSON-LD FAQPage */}
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_JSON_LD) }}
      />
    </section>
  );
}
