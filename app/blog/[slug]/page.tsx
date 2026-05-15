import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { NavBar } from "@/components/NavBar";
import { Footer } from "@/components/Footer";
import { ArrowRight } from "lucide-react";
import { CTAWhatsApp } from "@/components/CTAWhatsApp";
import { getAllPosts, getPostBySlug, formatDate, POST_SLUGS } from "@/lib/blog";
import type { PostSection } from "@/lib/blog";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://paguecomsplit.com.br";

// ── Static generation ───────────────────────────────────────
export function generateStaticParams() {
  return POST_SLUGS.map((slug) => ({ slug }));
}

// ── Metadata ────────────────────────────────────────────────
export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const post = getPostBySlug(params.slug);
  if (!post) return {};

  const url = `${SITE_URL}/blog/${post.slug}`;

  return {
    title: post.title,
    description: post.description,
    keywords: post.keywords,
    alternates: { canonical: url },
    openGraph: {
      title: post.title,
      description: post.description,
      url,
      type: "article",
      locale: "pt_BR",
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt ?? post.publishedAt,
      authors: [post.author],
      section: post.category,
    },
  };
}

// ── Article JSON-LD ─────────────────────────────────────────
function buildArticleJsonLd(post: ReturnType<typeof getPostBySlug>) {
  if (!post) return null;
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    url: `${SITE_URL}/blog/${post.slug}`,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt ?? post.publishedAt,
    author: {
      "@type": "Organization",
      name: "SplitTech",
      url: SITE_URL,
    },
    publisher: {
      "@type": "Organization",
      name: "SplitTech",
      url: SITE_URL,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/og-image.png`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${SITE_URL}/blog/${post.slug}`,
    },
  };
}

// ── Section renderer ─────────────────────────────────────────
function RenderSection({ section }: { section: PostSection }) {
  switch (section.type) {
    case "h2":
      return (
        <h2 className="font-display text-2xl font-bold text-primary-700 mt-10 mb-4 leading-snug">
          {section.text}
        </h2>
      );
    case "h3":
      return (
        <h3 className="font-display text-xl font-semibold text-primary-600 mt-8 mb-3 leading-snug">
          {section.text}
        </h3>
      );
    case "p":
      return (
        <p className="text-base text-text/80 leading-relaxed mb-4">
          {section.text}
        </p>
      );
    case "ul":
      return (
        <ul className="list-disc list-inside space-y-2 mb-4 text-text/80 text-base leading-relaxed pl-2">
          {section.items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      );
    case "ol":
      return (
        <ol className="list-decimal list-inside space-y-2 mb-4 text-text/80 text-base leading-relaxed pl-2">
          {section.items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ol>
      );
    case "callout":
      return (
        <blockquote className="border-l-4 border-accent-400 bg-accent-50 rounded-r-xl pl-5 pr-4 py-4 my-6 text-primary-700 font-semibold text-base leading-relaxed">
          {section.text}
        </blockquote>
      );
    case "cta":
      return (
        <div className="my-8 flex justify-center">
          <CTAWhatsApp
            message={section.message}
            label={section.label}
            size="lg"
          />
        </div>
      );
    default:
      return null;
  }
}

// ── Page ─────────────────────────────────────────────────────
export default function BlogPostPage({
  params,
}: {
  params: { slug: string };
}) {
  const post = getPostBySlug(params.slug);
  if (!post) notFound();

  const allPosts = getAllPosts();
  const related = allPosts.filter((p) => p.slug !== post.slug).slice(0, 3);

  return (
    <>
      <NavBar />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(buildArticleJsonLd(post)),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: "Home",
                item: SITE_URL,
              },
              {
                "@type": "ListItem",
                position: 2,
                name: "Blog",
                item: `${SITE_URL}/blog`,
              },
              {
                "@type": "ListItem",
                position: 3,
                name: post.title,
                item: `${SITE_URL}/blog/${post.slug}`,
              },
            ],
          }),
        }}
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
            <li>
              <Link href="/blog" className="hover:text-primary-600 transition-colors">
                Blog
              </Link>
            </li>
            <li aria-hidden>/</li>
            <li className="text-text/80 font-medium truncate max-w-[200px]">
              {post.title}
            </li>
          </ol>
        </nav>

        {/* Article header */}
        <header className="mb-10">
          <div className="flex items-center gap-3 mb-4">
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

          <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-primary-600 leading-tight mb-4">
            {post.title}
          </h1>

          <p className="text-lg text-text/60 leading-relaxed">
            {post.description}
          </p>
        </header>

        {/* Article body */}
        <article>
          {post.sections.map((section, i) => (
            <RenderSection key={i} section={section} />
          ))}
        </article>

        {/* CTA footer */}
        <div
          className="mt-16 relative rounded-3xl border-2 border-accent-300 p-7 md:p-9 overflow-hidden text-center"
          style={{ background: "linear-gradient(135deg, #E6FAF4 0%, #B9F2DF 100%)" }}
        >
          <div className="absolute -top-20 -right-16 w-56 h-56 rounded-full bg-accent-500/20 blur-3xl" aria-hidden />
          <div className="relative">
            <p className="text-[11px] font-bold uppercase tracking-[.25em] text-accent-700 mb-3">
              Diagnóstico gratuito
            </p>
            <h2 className="font-display text-2xl md:text-3xl font-extrabold text-primary-600 mb-3 text-balance leading-[1.1]">
              Quer saber o número exato para o seu CNPJ?
            </h2>
            <p className="text-text/75 mb-6 text-pretty max-w-lg mx-auto">
              O diagnóstico leva 15 minutos. Nada de spam — só os números
              reais do seu caso.
            </p>
            <CTAWhatsApp
              message="Oi, li um artigo no blog do paguecomsplit.com.br e quero o diagnóstico gratuito para o meu CNPJ."
              label="Quero meu diagnóstico gratuito"
              size="lg"
            />
          </div>
        </div>

        {/* Related articles */}
        {related.length > 0 && (
          <section className="mt-16" aria-label="Artigos relacionados">
            <p className="text-xs font-bold uppercase tracking-[.25em] text-accent-600 mb-3">
              Leia também
            </p>
            <h2 className="font-display text-2xl font-bold text-primary-600 mb-6 leading-tight">
              Mais sobre split e Simples Nacional
            </h2>
            <ul className="grid gap-4 md:grid-cols-3" role="list">
              {related.map((rel, i) => {
                const bgClass = `seg-bg-${((i % 7) + 1)}`;
                return (
                  <li key={rel.slug}>
                    <Link
                      href={`/blog/${rel.slug}`}
                      className={`seg-card ${bgClass} group block h-full`}
                    >
                      <div className="seg-glow" />
                      <div className="seg-check">
                        <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
                      </div>
                      <p className="text-[10px] font-bold uppercase tracking-[.18em] text-accent-700 bg-white/70 px-2.5 py-1 rounded-full inline-flex mb-3">
                        {rel.category}
                      </p>
                      <p className="font-display text-base md:text-[17px] font-bold text-primary-600 leading-snug">
                        {rel.title}
                      </p>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}
