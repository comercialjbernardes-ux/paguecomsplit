import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { NavBar } from "@/components/NavBar";
import { Footer } from "@/components/Footer";
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(BLOG_JSON_LD) }}
      />
      <main className="max-w-3xl mx-auto px-4 py-16 sm:px-6">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-8">
          <ol className="flex items-center gap-2 text-sm text-text/50">
            <li>
              <Link href="/" className="hover:text-primary-600 transition-colors">
                Home
              </Link>
            </li>
            <li aria-hidden>/</li>
            <li className="text-text/80 font-medium">Blog</li>
          </ol>
        </nav>

        <header className="mb-12">
          <p className="text-xs font-bold uppercase tracking-widest text-accent-600 mb-2">
            Conteúdo educativo
          </p>
          <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-primary-600 mb-4 leading-tight">
            Split de pagamento na prática
          </h1>
          <p className="text-lg text-text/70">
            Artigos sobre bitributação, Simples Nacional e como cada segmento
            pode tributar só o que é seu.
          </p>
        </header>

        <ul className="space-y-8">
          {posts.map((post) => (
            <li key={post.slug}>
              <article className="group border border-border rounded-2xl p-6 hover:border-primary-300 transition-colors">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-xs font-semibold uppercase tracking-wider text-accent-600 bg-accent-50 px-2 py-0.5 rounded-full">
                    {post.category}
                  </span>
                  <time
                    dateTime={post.publishedAt}
                    className="text-xs text-text/40"
                  >
                    {formatDate(post.publishedAt)}
                  </time>
                </div>

                <h2 className="font-display text-xl font-bold text-primary-700 mb-2 leading-snug group-hover:text-primary-500 transition-colors">
                  <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                </h2>

                <p className="text-sm text-text/70 mb-4 leading-relaxed">
                  {post.description}
                </p>

                <Link
                  href={`/blog/${post.slug}`}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-600 hover:text-primary-500 transition-colors"
                  aria-label={`Ler artigo: ${post.title}`}
                >
                  Ler artigo
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
              </article>
            </li>
          ))}
        </ul>
      </main>
      <Footer />
    </>
  );
}
