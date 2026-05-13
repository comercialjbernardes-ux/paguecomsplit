import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { segments } from "@/lib/segments";
import { buildWhatsAppHref } from "@/lib/utils";

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

function LinkedinIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

export function Footer() {
  const number = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "553195719123";
  const waHref = buildWhatsAppHref(
    number,
    "Oi, quero falar com a SplitTech sobre o split de pagamento."
  );

  return (
    <footer className="bg-primary-700 text-white/80 mt-24">
      <div className="container-page py-12 md:py-16">
        <div className="grid gap-10 md:grid-cols-3 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <p className="font-display text-2xl font-extrabold text-white mb-2">
              paguecom<span className="text-accent-300">split</span>
            </p>
            <p className="text-sm leading-relaxed max-w-md">
              Cada parte é separada antes de gerar imposto. Split de pagamento
              sobre infraestrutura Cappta, regulado pelo BACEN.
            </p>
            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-5 rounded-lg bg-accent text-white px-4 py-2 text-sm font-semibold hover:bg-accent-600 transition-colors"
            >
              <MessageCircle className="h-4 w-4" aria-hidden />
              Quero economizar
            </a>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-white/60 mb-3">
              Segmentos
            </p>
            <ul className="space-y-2 text-sm">
              {segments.map((s) => (
                <li key={s.slug}>
                  <Link
                    href={`/${s.slug}`}
                    className="hover:text-white transition-colors"
                  >
                    {s.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-white/60 mb-3">
              Institucional
            </p>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/como-funciona" className="hover:text-white">
                  Como funciona
                </Link>
              </li>
              <li>
                <Link href="/representantes" className="hover:text-white">
                  Para representantes
                </Link>
              </li>
              <li>
                <Link href="/politica-de-privacidade" className="hover:text-white">
                  Política de Privacidade
                </Link>
              </li>
              <li>
                <Link href="/termos-de-uso" className="hover:text-white">
                  Termos de Uso
                </Link>
              </li>
            </ul>

            <div className="mt-5 flex items-center gap-3">
              <a
                href="https://www.instagram.com/paguecomsplit/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram SplitTech"
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
              >
                <InstagramIcon className="h-4 w-4" />
              </a>
              <a
                href="https://www.linkedin.com/company/splittech-br/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn SplitTech"
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
              >
                <LinkedinIcon className="h-4 w-4" />
              </a>
            </div>

            <p className="text-xs text-white/50 mt-5 leading-relaxed">
              Horário comercial:
              <br />
              Seg a sex, 9h–18h
            </p>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col md:flex-row md:items-center md:justify-between gap-3 text-xs text-white/50">
          <p>
            © {new Date().getFullYear()} SplitTech · Operação sobre infraestrutura
            Cappta, regulada pelo Banco Central do Brasil.
          </p>
          <p>
            CNPJ em processo de registro ·{" "}
            <a
              href="mailto:contato@paguecomsplit.com.br"
              className="hover:text-white"
            >
              contato@paguecomsplit.com.br
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
