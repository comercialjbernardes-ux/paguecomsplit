export type PostSection =
  | { type: "h2"; text: string }
  | { type: "h3"; text: string }
  | { type: "p"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] }
  | { type: "callout"; text: string }
  | { type: "cta"; label: string; message: string };

export type BlogPost = {
  slug: string;
  title: string;
  description: string;
  publishedAt: string; // ISO date
  updatedAt?: string;
  author: string;
  category: string;
  keywords: string[];
  sections: PostSection[];
};

// ────────────────────────────────────────────────────────────
// Lazy registry — each post is a dynamic import so the build
// tree-shakes content that isn't rendered on a given page.
// ────────────────────────────────────────────────────────────

export const POST_SLUGS = [
  "o-que-e-split-de-pagamento-simples-nacional",
  "bitributacao-simples-nacional-como-evitar",
  "como-reduzir-das-clinica-estetica",
  "imposto-gorjeta-restaurante-simples",
  "anexo-iii-vs-anexo-v-simples-nacional",
] as const;

export type PostSlug = (typeof POST_SLUGS)[number];

// Statically imported for the listing page (only metadata needed)
import { post as post1 } from "@/content/blog/o-que-e-split-de-pagamento-simples-nacional";
import { post as post2 } from "@/content/blog/bitributacao-simples-nacional-como-evitar";
import { post as post3 } from "@/content/blog/como-reduzir-das-clinica-estetica";
import { post as post4 } from "@/content/blog/imposto-gorjeta-restaurante-simples";
import { post as post5 } from "@/content/blog/anexo-iii-vs-anexo-v-simples-nacional";

const ALL_POSTS: BlogPost[] = [post1, post2, post3, post4, post5];

export function getAllPosts(): BlogPost[] {
  return ALL_POSTS.sort(
    (a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
}

export function getPostBySlug(slug: string): BlogPost | undefined {
  return ALL_POSTS.find((p) => p.slug === slug);
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}
