import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { NavBar } from "@/components/NavBar";
import { Footer } from "@/components/Footer";
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
        <div className="mt-16 rounded-2xl bg-primary-50 border border-primary-100 p-8 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-accent-600 mb-2">
            Diagnóstico gratuito
          </p>
          <h2 className="font-display text-2xl font-extrabold text-primary-700 mb-3">
            Quer saber o número exato para o seu CNPJ?
          </h2>
          <p className="text-text/70 mb-6 text-sm">
            O diagnóstico leva 15 minutos. Nada de spam — só os números reais
            do seu caso.
          </p>
          <CTAWhatsApp
            message="Oi, li um artigo no blog do paguecomsplit.com.br e quero o diagnóstico gratuito para o meu CNPJ."
            label="Quero meu diagnóstico gratuito"
            size="lg"
          />
        </div>

        {/* Related articles */}
        {related.length > 0 && (
          <section className="mt-16" aria-label="Artigos relacionados">
            <h2 className="font-display text-xl font-bold text-primary-700 mb-6">
              Leia também
            </h2>
            <ul className="space-y-4">
              {related.map((rel) => (
                <li key={rel.slug}>
                  <Link
                    href={`/blog/${rel.slug}`}
                    className="group flex items-start gap-3 rounded-xl border border-border p-4 hover:border-primary-300 transition-colors"
                  >
                    <div className="flex-1">
                      <p className="text-xs text-accent-600 font-semibold uppercase tracking-wider mb-1">
                        {rel.category}
                      </p>
                      <p className="text-sm font-semibold text-primary-700 group-hover:text-primary-500 transition-colors leading-snug">
                        {rel.title}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}
