import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
import { NavBar } from "@/components/NavBar";
import { Footer } from "@/components/Footer";
import { CTAWhatsApp } from "@/components/CTAWhatsApp";
import { getAllPosts, formatDate } from "@/lib/blog";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://paguecomsplit.com.br";

export const metadata: Metadata = {
  title: "Blog — Split de Pagamento e Simples Nacional",
  description:
    "Artigos práticos sobre split de pagamento, bitributação no Simples Nacional e como cada segmento pode reduzir o DAS sem mudar a operação.",
  alternates: { canonical: `${SITE_URL}/blog` },
  openGraph: {
    title: "Blog | paguecomsplit.com.br",
    description:
      "Artigos sobre split de pagamento, bitributação no Simples Nacional e como reduzir o DAS por segmento.",
    url: `${SITE_URL}/blog`,
    type: "website",
    locale: "pt_BR",
  },
};

const BLOG_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "Blog",
  name: "Blog paguecomsplit.com.br",
  description:
    "Artigos sobre split de pagamento, bitributação no Simples Nacional e redução de DAS.",
  url: `${SITE_URL}/blog`,
  publisher: {
    "@type": "Organization",
    name: "SplitTech",
    url: SITE_URL,
  },
};

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <>
      <NavBar />
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(BLOG_JSON_LD) }}
      />
      <main>
        {/* Hero */}
        <section className="gradient-hero overflow-hidden">
          <div className="container-page relative pt-14 pb-12 md:pt-20 md:pb-16">
            <nav aria-label="Breadcrumb" className="mb-6">
              <ol className="flex items-center gap-1.5 text-xs text-muted">
                <li>
                  <Link href="/" className="hover:text-primary-600 transition-colors">
                    paguecomsplit.com.br
                  </Link>
                </li>
                <li aria-hidden className="text-muted/40">/</li>
                <li>
                  <span className="font-semibold text-primary-600">Blog</span>
                </li>
              </ol>
            </nav>

            <div className="max-w-3xl mx-auto text-center">
              <p className="inline-flex items-center gap-2 rounded-full bg-accent-50 border border-accent-200 text-accent-700 px-4 py-1.5 text-xs font-bold uppercase tracking-[.2em] mb-5">
                <BookOpen className="h-3.5 w-3.5" aria-hidden />
                Conteúdo educativo
              </p>
              <h1 className="font-display text-4xl md:text-5xl lg:text-[58px] font-extrabold text-primary-600 leading-[1.05] tracking-tight text-balance">
                Split de pagamento na prática.
              </h1>
              <p className="mt-6 text-lg md:text-xl text-text/75 max-w-2xl mx-auto text-pretty">
                Artigos sobre bitributação, Simples Nacional e como cada
                segmento pode tributar só o que é seu.
              </p>
            </div>
          </div>
        </section>

        {/* Posts */}
        <section className="container-page py-14 md:py-20">
          <ul className="grid gap-5 md:grid-cols-2 max-w-4xl mx-auto" role="list">
            {posts.map((post, i) => {
              const bgClass = `seg-bg-${((i % 7) + 1)}`;
              return (
                <li key={post.slug}>
                  <Link
                    href={`/blog/${post.slug}`}
                    className={`seg-card ${bgClass} group block h-full`}
                  >
                    <div className="seg-glow" />
                    <div className="seg-check">
                      <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
                    </div>
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-[10px] font-bold uppercase tracking-[.18em] text-accent-700 bg-white/70 px-2.5 py-1 rounded-full">
                        {post.category}
                      </span>
                      <time
                        dateTime={post.publishedAt}
                        className="text-xs text-text/55"
                      >
                        {formatDate(post.publishedAt)}
                      </time>
                    </div>

                    <h2 className="font-display text-xl md:text-[22px] font-bold text-primary-600 mb-2 leading-tight">
                      {post.title}
                    </h2>

                    <p className="text-[15px] text-text/70 leading-relaxed text-pretty mb-4">
                      {post.description}
                    </p>

                    <p className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent-700 mt-auto">
                      Ler artigo
                      <ArrowRight className="h-4 w-4 arrow" aria-hidden />
                    </p>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>

        {/* CTA final */}
        <section className="container-page pb-14 md:pb-20">
          <div className="relative rounded-3xl bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white p-6 md:p-10 lg:p-12 overflow-hidden shadow-pop">
            <div className="absolute -top-32 -right-24 w-80 h-80 rounded-full bg-accent-500/25 blur-3xl" aria-hidden />
            <div className="relative max-w-2xl mx-auto text-center">
              <h2 className="font-display text-2xl md:text-3xl lg:text-4xl font-extrabold mb-3 text-balance leading-[1.1]">
                Já entendeu como funciona? Calcule sua economia.
              </h2>
              <p className="text-white/70 mb-6 max-w-xl mx-auto text-pretty">
                30 segundos no simulador ou fale direto com um especialista.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <CTAWhatsApp
                  message="Oi, li no blog do paguecomsplit.com.br e quero falar com um especialista."
                  label="Falar com especialista"
                  size="lg"
                />
                <Link
                  href="/#simulador"
                  className="btn btn-on-dark-outline btn-lg cta-glow-light cta-shimmer cta-shimmer-dark"
                >
                  Ir para o simulador
                  <ArrowRight className="h-4 w-4 arrow" aria-hidden />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
