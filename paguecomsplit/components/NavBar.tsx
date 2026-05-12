import Link from "next/link";
import { CTAWhatsApp } from "./CTAWhatsApp";

export function NavBar() {
  return (
    <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-md border-b border-slate-100">
      <div className="container-page flex items-center justify-between h-16">
        <Link href="/" className="font-display text-lg font-extrabold text-primary-600">
          paguecom<span className="text-accent-600">split</span>
        </Link>

        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-text/80">
          <Link href="/#segmentos" className="hover:text-primary-600">
            Segmentos
          </Link>
          <Link href="/como-funciona" className="hover:text-primary-600">
            Como funciona
          </Link>
          <Link href="/#simulador" className="hover:text-primary-600">
            Simulador
          </Link>
          <Link href="/representantes" className="hover:text-primary-600">
            Representantes
          </Link>
        </nav>

        <CTAWhatsApp
          message="Oi, vim do paguecomsplit.com.br e quero entender como deixar de pagar DAS sobre a receita do meu parceiro."
          label="Quero economizar"
          size="sm"
          variant="default"
        />
      </div>
    </header>
  );
}
