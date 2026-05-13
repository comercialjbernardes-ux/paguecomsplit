import type { Metadata } from "next";
import { Sora, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { RepTracker } from "@/components/RepTracker";
import { OrganizationJsonLd } from "@/components/OrganizationJsonLd";
import { Analytics } from "@/components/Analytics";

const sora = Sora({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-display",
  weight: ["500", "600", "700", "800"],
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-body",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "Pague com Split | Reduza o DAS no Simples Nacional",
    template: "%s | paguecomsplit.com.br",
  },
  description:
    "Split de pagamento que tira a receita do parceiro do seu DAS. A SplitTech administra a divisão antes do imposto incidir — você tributa só a sua margem real.",
  metadataBase: new URL("https://paguecomsplit.com.br"),
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "paguecomsplit.com.br",
    url: "https://paguecomsplit.com.br",
    title: "Pague com Split | Reduza o DAS no Simples Nacional",
    description:
      "Split de pagamento que tira a receita do parceiro do seu DAS. A SplitTech administra a divisão antes do imposto incidir — você tributa só a sua margem real.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "paguecomsplit — Split de pagamento que tira a receita do parceiro do seu DAS",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Pague com Split | Reduza o DAS no Simples Nacional",
    description:
      "Split de pagamento que tira a receita do parceiro do seu DAS. Você tributa só a sua margem real.",
    images: ["/og-image.png"],
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className={`${sora.variable} ${jakarta.variable}`}>
      <body className="min-h-screen bg-bg text-text antialiased">
        <OrganizationJsonLd />
        <RepTracker />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
