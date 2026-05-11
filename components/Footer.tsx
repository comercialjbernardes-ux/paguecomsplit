import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { segments } from "@/lib/segments";
import { buildWhatsAppHref } from "@/lib/utils";

export function Footer() {
  const number = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "5511999998888";
  const waHref = buildWhatsAppHref(
    number,
    "Olá! Quero falar com a SplitTech sobre o split de pagamento."
  );

  return (
    <footer className="bg-primary-700 text-white/80 mt-24">
      <div className="container-page py-12 md:py-16">
        <div className="grid gap-10 md:grid-cols-3 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <p className="font-display text-2xl font-extrabold text-white mb-2">
              paguecomsplit.com.br
            </p>
            <p className="text-sm leading-relaxed max-w-md">
              Pare de pagar imposto sobre dinheiro que não é seu. Split de
              pagamento sobre infraestrutura Cappta, regulado pelo BACEN.
            </p>
            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-5 rounded-lg bg-accent text-white px-4 py-2 text-sm font-semibold hover:bg-accent-600 transition-colors"
            >
              <MessageCircle className="h-4 w-4" aria-hidden />
              Falar no WhatsApp
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
            </ul>
            <p className="text-xs text-white/50 mt-6 leading-relaxed">
              Horário comercial:
              <br />
              Seg a sex, 9h–18h
            </p>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col md:flex-row md:items-center md:justify-between gap-3 text-xs text-white/50">
          <p>
            © {new Date().getFullYear()} SplitTech. Operação sobre infraestrutura
            Cappta, regulada pelo Banco Central do Brasil.
          </p>
          <p>CNPJ a confirmar · paguecomsplit.com.br</p>
        </div>
      </div>
    </footer>
  );
}
