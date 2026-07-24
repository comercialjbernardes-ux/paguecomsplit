import type { Metadata } from "next";
import Link from "next/link";
import {
  LayoutDashboard,
  Users,
  Coins,
  UserCircle,
  LogOut,
  Link2,
} from "lucide-react";
import { LogoutButton } from "@/components/LogoutButton";

export const metadata: Metadata = {
  title: {
    default: "Portal | paguecomsplit.com.br",
    template: "%s | Portal SplitTech",
  },
  robots: { index: false, follow: false },
};

const NAV_ITEMS = [
  { href: "/portal", label: "Dashboard", icon: LayoutDashboard },
  { href: "/portal/leads", label: "Meus Leads", icon: Users },
  { href: "/portal/comissoes", label: "Comissões", icon: Coins },
  { href: "/portal/links", label: "Meus Links", icon: Link2 },
  { href: "/portal/perfil", label: "Meu Perfil", icon: UserCircle },
];

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-bg flex flex-col">
      {/* Portal header */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-100 shadow-soft">
        <div className="container-page flex items-center justify-between h-14">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="font-display text-base font-extrabold text-primary-600"
            >
              paguecom<span className="text-accent-600">split</span>
            </Link>
            <span className="hidden sm:block text-xs font-semibold text-muted border-l border-slate-200 pl-3">
              Portal
            </span>
          </div>

          <div className="flex items-center gap-3">
            <LogoutButton />
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="hidden md:flex flex-col w-56 border-r border-slate-100 bg-white sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto">
          <nav className="flex flex-col gap-1 p-4 flex-1">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-text/70 hover:text-primary-600 hover:bg-primary-50 transition-colors"
              >
                <item.icon className="h-4 w-4 flex-none" aria-hidden />
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="p-4 border-t border-slate-100">
            <p className="text-xs text-muted leading-relaxed">
              Suporte comercial:
              <br />
              Seg–Sex, 9h–18h
            </p>
          </div>
        </aside>

        {/* Mobile nav */}
        <div className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-white border-t border-slate-100 flex items-center justify-around px-2 py-2">
          {NAV_ITEMS.slice(0, 4).map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg text-text/60 hover:text-primary-600 transition-colors"
            >
              <item.icon className="h-5 w-5" aria-hidden />
              <span className="text-[10px] font-semibold">{item.label.split(" ")[0]}</span>
            </Link>
          ))}
          <button className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg text-text/60">
            <LogOut className="h-5 w-5" aria-hidden />
            <span className="text-[10px] font-semibold">Sair</span>
          </button>
        </div>

        {/* Main */}
        <main className="flex-1 min-w-0 pb-20 md:pb-0">
          {children}
        </main>
      </div>
    </div>
  );
}
