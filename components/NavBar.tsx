"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { MessageCircle } from "lucide-react";
import { buildWhatsAppHref } from "@/lib/utils";

const HOME_WHATSAPP =
  "Oi, vim do paguecomsplit.com.br e quero entender como deixar de pagar DAS sobre a receita do meu parceiro.";

export function NavBar() {
  const [scrolled, setScrolled] = useState(false);
  const number = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "553195719123";
  const waHref = buildWhatsAppHref(number, HOME_WHATSAPP);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 6);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 bg-white/85 backdrop-blur-md border-b border-transparent transition-shadow duration-300 ${
        scrolled ? "scrolled" : ""
      }`}
    >
      <div className="container-page flex items-center justify-between h-[68px]">
        <Link
          href="/"
          className="font-display text-lg font-extrabold text-primary-600 flex items-center gap-2 group"
        >
          <span className="logo-dot group-hover:scale-110 transition-transform" />
          paguecom<span className="text-accent-600">split</span>
        </Link>

        <nav className="hidden md:flex items-center gap-2 text-[15px] font-medium text-text/75">
          <Link href="/#segmentos" className="nav-link">Segmentos</Link>
          <Link href="/como-funciona" className="nav-link">Como funciona</Link>
          <Link href="/#simulador" className="nav-link">Simulador</Link>
          <Link href="/representantes" className="nav-link">Representantes</Link>
        </nav>

        <div className="flex items-center gap-2">
          <Link href="/login" className="hidden sm:inline-flex btn btn-outline btn-sm">
            Entrar
          </Link>
          <a
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary btn-sm cta-glow-primary cta-shimmer"
            aria-label="Quero economizar — falar no WhatsApp"
          >
            <MessageCircle className="h-4 w-4" aria-hidden />
            Quero economizar
          </a>
        </div>
      </div>
    </header>
  );
}
