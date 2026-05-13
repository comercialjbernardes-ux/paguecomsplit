import type { Metadata } from "next";
import { NavBar } from "@/components/NavBar";
import { Footer } from "@/components/Footer";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://paguecomsplit.com.br";

export const metadata: Metadata = {
  title: "Termos de Uso",
  description:
    "Termos de Uso do site paguecomsplit.com.br — regras de uso da página institucional, do simulador e do canal de captação de leads.",
  alternates: { canonical: `${SITE_URL}/termos-de-uso` },
  robots: { index: true, follow: true },
};

const SECTIONS = [
  {
    title: "1. Sobre estes termos",
    body: "Estes Termos regulam o uso do site paguecomsplit.com.br, plataforma de captação comercial da maquininha SplitTech com Cofre Digital. Ao navegar ou interagir com o site (preencher formulários, usar o simulador, clicar em CTAs de WhatsApp), você concorda com estes Termos.",
  },
  {
    title: "2. O que o site oferece",
    body: "(a) Conteúdo informativo sobre split de pagamento, Cofre Digital, Simples Nacional e bitributação. (b) Simulador de economia tributária com base nas alíquotas oficiais do Simples Nacional (LC 123/2006). (c) Canal de contato comercial via WhatsApp e formulário. O site NÃO oferece consultoria contábil, jurídica ou tributária — qualquer decisão de negócio deve ser validada com seu contador.",
  },
  {
    title: "3. Sobre o simulador",
    body: "O simulador apresenta uma estimativa de economia baseada nas alíquotas oficiais do Simples Nacional e em premissas declaradas pelo usuário (segmento, faturamento, repasse). O resultado é informativo e não substitui a apuração contábil real do seu CNPJ. O cálculo definitivo depende do Fator R, atividades concomitantes e outras particularidades tributárias.",
  },
  {
    title: "4. Sobre as alíquotas",
    body: "As tabelas dos Anexos I, III e V do Simples Nacional usadas no simulador refletem a LC 123/2006 vigente na data da última atualização. Mudanças legislativas posteriores podem afetar o resultado. Em caso de divergência, a legislação vigente prevalece.",
  },
  {
    title: "5. Conteúdo institucional",
    body: "Marcas de terceiros mencionadas (Cappta, BACEN, Barcellos Tucunduva, Banco Central do Brasil) pertencem aos respectivos titulares. Os links externos para sites oficiais são fornecidos para sua conveniência e não implicam endosso recíproco.",
  },
  {
    title: "6. Parecer jurídico",
    body: "O parecer técnico-tributário citado no site foi emitido por Barcellos Tucunduva Advogados sobre a estrutura geral do split operado pela SplitTech sobre infraestrutura Cappta. O parecer não se aplica automaticamente ao caso concreto de cada cliente — depende de contratos formais com cada parceiro envolvido na divisão.",
  },
  {
    title: "7. Programa de Representantes",
    body: "O programa de representantes é regido por contrato específico assinado entre a SplitTech e cada representante. As condições comerciais (comissão por ativação, percentual de recorrência) são definidas no contrato, não nesta página institucional.",
  },
  {
    title: "8. Disponibilidade do site",
    body: "Nos esforçamos para manter o site sempre disponível, mas pode haver interrupções para manutenção, atualizações ou eventos fora do nosso controle. Não há garantia de uptime de 100%.",
  },
  {
    title: "9. Propriedade intelectual",
    body: "Todo o conteúdo do site (textos, imagens, ilustrações, código) é de propriedade da SplitTech ou licenciado para uso. É vedada a reprodução comercial sem autorização escrita. Compartilhamento individual e citação com link de volta são permitidos.",
  },
  {
    title: "10. Limitação de responsabilidade",
    body: "A SplitTech não se responsabiliza por (a) decisões tributárias tomadas exclusivamente com base no simulador, sem validação contábil; (b) prejuízos decorrentes de uso indevido do site; (c) erros de digitação ou atualização de tabelas tributárias, que serão corrigidos assim que identificados. Para o caso concreto, sempre consulte seu contador.",
  },
  {
    title: "11. Foro",
    body: "Estes Termos são regidos pela legislação brasileira. Conflitos serão resolvidos no foro da Comarca de São Paulo/SP, salvo disposição legal em contrário.",
  },
  {
    title: "12. Contato",
    body: "Dúvidas sobre estes Termos: contato@paguecomsplit.com.br.",
  },
];

export default function TermosDeUsoPage() {
  return (
    <>
      <NavBar />
      <main>
        <section className="gradient-hero">
          <div className="container-page pt-14 pb-10 md:pt-20 md:pb-12">
            <p className="text-xs font-bold uppercase tracking-widest text-accent-600 mb-3">
              Legal
            </p>
            <h1 className="font-display text-4xl md:text-5xl font-extrabold text-primary-600 leading-[1.05] tracking-tight max-w-3xl text-balance">
              Termos de Uso
            </h1>
            <p className="mt-4 text-base text-text/80 max-w-2xl">
              Regras de uso da página institucional, do simulador e do canal
              de captação. Última atualização: 13 de maio de 2026.
            </p>
          </div>
        </section>

        <article className="container-page py-12 md:py-16 max-w-3xl">
          {SECTIONS.map((s) => (
            <section key={s.title} className="mb-8">
              <h2 className="font-display text-xl md:text-2xl font-bold text-primary-600 mb-3">
                {s.title}
              </h2>
              <p className="text-text/80 leading-relaxed text-pretty">
                {s.body}
              </p>
            </section>
          ))}

          <p className="mt-12 pt-6 border-t border-slate-100 text-xs text-muted">
            SplitTech · paguecomsplit.com.br · CNPJ em processo de registro.
            Dúvidas: contato@paguecomsplit.com.br.
          </p>
        </article>
      </main>
      <Footer />
    </>
  );
}
