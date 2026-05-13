import type { Metadata } from "next";
import { NavBar } from "@/components/NavBar";
import { Footer } from "@/components/Footer";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://paguecomsplit.com.br";

export const metadata: Metadata = {
  title: "Política de Privacidade",
  description:
    "Política de Privacidade da SplitTech / paguecomsplit.com.br — quais dados coletamos, como tratamos e quais são seus direitos sob a LGPD.",
  alternates: { canonical: `${SITE_URL}/politica-de-privacidade` },
  robots: { index: true, follow: true },
};

const SECTIONS = [
  {
    title: "1. Quem somos",
    body: "A SplitTech opera o site paguecomsplit.com.br, plataforma de captação comercial para a maquininha SplitTech com Cofre Digital. Este documento explica como tratamos os dados pessoais que você nos confia.",
  },
  {
    title: "2. Quais dados coletamos",
    body: "Dados que você nos fornece ativamente: nome, WhatsApp, e-mail, segmento de negócio, faturamento estimado, CNPJ. Dados de navegação coletados automaticamente: páginas visitadas, tempo de permanência, origem do tráfego (UTM), código de representante (parâmetro `?rep=`). Não coletamos dados financeiros, senhas ou conteúdo de mensagens.",
  },
  {
    title: "3. Para que usamos seus dados",
    body: "(a) Contato comercial pelo WhatsApp informado, com a finalidade de explicar o produto, calcular sua economia e tirar dúvidas. (b) Análise estatística agregada da audiência para melhorar o site. (c) Atribuição de comissão ao representante que indicou você, quando aplicável. Não usamos seus dados para publicidade de terceiros nem os vendemos.",
  },
  {
    title: "4. Base legal (LGPD)",
    body: "O tratamento é baseado em (a) consentimento, quando você preenche um formulário de contato; (b) legítimo interesse, para a análise estatística agregada do site; (c) execução de contrato, quando você ativa a maquininha SplitTech. A base legal aplicada a cada finalidade é avaliada de forma compatível com a LGPD (Lei 13.709/2018).",
  },
  {
    title: "5. Com quem compartilhamos",
    body: "(a) Time comercial interno da SplitTech, para o atendimento. (b) Cappta, parceira de infraestrutura de adquirência, no momento da ativação da maquininha. (c) Provedores de tecnologia (hospedagem na Netlify, e-mail transacional) sob acordos de tratamento de dados. (d) Autoridades públicas, quando exigido por lei. Nunca compartilhamos com fins de marketing de terceiros.",
  },
  {
    title: "6. Por quanto tempo guardamos",
    body: "Leads não convertidos: 24 meses a contar do último contato. Clientes ativos: pelo prazo da relação contratual mais 5 anos (obrigação legal fiscal). Dados de navegação anonimizados: 12 meses. Após esses prazos, os dados são anonimizados ou eliminados.",
  },
  {
    title: "7. Seus direitos",
    body: "Sob a LGPD, você pode (a) confirmar a existência de tratamento; (b) acessar os dados; (c) corrigir dados incompletos ou desatualizados; (d) solicitar a anonimização, bloqueio ou eliminação; (e) revogar o consentimento; (f) solicitar a portabilidade. Para exercer qualquer desses direitos, escreva para contato@paguecomsplit.com.br.",
  },
  {
    title: "8. Cookies",
    body: "Usamos cookies de navegação para lembrar o código de representante (parâmetro `?rep=`) por até 30 dias e cookies analíticos do Google Analytics 4 e Meta Pixel para entender o desempenho do site. Você pode bloqueá-los nas configurações do seu navegador sem prejuízo à navegação.",
  },
  {
    title: "9. Segurança",
    body: "Todas as comunicações entre você e o site são criptografadas via HTTPS. Os dados são armazenados em servidores no Brasil ou em jurisdições com nível adequado de proteção. Em caso de incidente de segurança que possa gerar risco relevante, comunicaremos os titulares afetados e a ANPD nos prazos legais.",
  },
  {
    title: "10. Encarregado de dados (DPO)",
    body: "Para qualquer questão sobre tratamento de dados, fale com nosso encarregado: contato@paguecomsplit.com.br. Respondemos em até 15 dias úteis.",
  },
  {
    title: "11. Alterações",
    body: "Esta política pode ser atualizada para refletir mudanças regulatórias ou operacionais. A data da última atualização aparece no rodapé. Mudanças materiais são comunicadas com 30 dias de antecedência aos titulares cadastrados.",
  },
];

export default function PoliticaDePrivacidadePage() {
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
              Política de Privacidade
            </h1>
            <p className="mt-4 text-base text-text/80 max-w-2xl">
              Como tratamos seus dados em conformidade com a LGPD
              (Lei 13.709/2018). Última atualização: 13 de maio de 2026.
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
            SplitTech · paguecomsplit.com.br · CNPJ: {process.env.NEXT_PUBLIC_CNPJ || "38.180.982/0001-13"}.
            Dúvidas: contato@paguecomsplit.com.br.
          </p>
        </article>
      </main>
      <Footer />
    </>
  );
}
