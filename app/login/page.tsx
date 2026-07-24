import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { LoginForm } from "@/components/LoginForm";

export const metadata: Metadata = {
  title: "Entrar | paguecomsplit.com.br",
  description: "Acesse o portal do representante SplitTech.",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-bg flex flex-col">
      {/* Topo mínimo */}
      <header className="border-b border-slate-100 bg-white">
        <div className="container-page flex items-center h-14">
          <Link
            href="/"
            className="font-display text-base font-extrabold text-primary-600"
          >
            paguecom<span className="text-accent-600">split</span>
          </Link>
          <span className="ml-3 text-xs font-semibold text-muted border-l border-slate-200 pl-3">
            Portal do Representante
          </span>
        </div>
      </header>

      {/* Conteúdo central */}
      <main className="flex-1 flex items-center justify-center px-5 py-12">
        <div className="w-full max-w-md">
          {/* Card de login */}
          <div className="rounded-2xl border border-slate-100 bg-white p-8 shadow-card">
            <div className="mb-7">
              <p className="text-xs font-bold uppercase tracking-widest text-accent-600 mb-2">
                Área restrita
              </p>
              <h1 className="font-display text-2xl font-bold text-primary-600 leading-tight">
                Acessar minha conta
              </h1>
              <p className="text-sm text-muted mt-1">
                Entre com o e-mail e senha cadastrados pelo time SplitTech.
              </p>
            </div>

            <LoginForm />
          </div>

          {/* Credencial de segurança */}
          <div className="mt-5 flex items-center justify-center gap-2 text-xs text-muted">
            <ShieldCheck className="h-3.5 w-3.5 text-accent-600 flex-none" aria-hidden />
            Conexão segura · Dados criptografados
          </div>
        </div>
      </main>

      {/* Rodapé mínimo */}
      <footer className="border-t border-slate-100 py-4">
        <p className="text-center text-xs text-muted">
          © {new Date().getFullYear()} SplitTech ·{" "}
          <Link href="/politica-de-privacidade" className="hover:text-primary-600">
            Privacidade
          </Link>
        </p>
      </footer>
    </div>
  );
}
