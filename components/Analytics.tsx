import Script from "next/script";

/**
 * G1 — Eventos de conversão para Google Ads via dataLayer.
 * Uso: import { trackEvent } from "@/components/Analytics";
 *      trackEvent("clique_whatsapp", { segmento: "estetica" });
 *
 * Eventos mapeados:
 *   clique_whatsapp      → todos os botões wa.me
 *   abertura_popup       → PopupCaptura abriu
 *   submit_popup         → formulário PopupCaptura enviado
 *   simulador_resultado  → usuário viu economia calculada
 *   tempo_pagina_60s     → engajamento mínimo (60s na página)
 */
export function trackEvent(
  eventName: string,
  params?: Record<string, string | number>
) {
  if (typeof window === "undefined") return;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const dl = (window as any).dataLayer;
  if (!dl) return;
  dl.push({ event: eventName, ...params });
}

export function Analytics() {
  const gaId = process.env.NEXT_PUBLIC_GA_ID;
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID;
  const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;
  const ahrefsKey =
    process.env.NEXT_PUBLIC_AHREFS_KEY || "814MJ82gad3xu39Np4IWJQ";

  return (
    <>
      {/* Google Tag Manager — preferido quando GTM_ID está definido */}
      {gtmId ? (
        <>
          <Script id="gtm-head" strategy="afterInteractive">
            {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${gtmId}');`}
          </Script>
          {/* GTM noscript fallback é inserido via layout body */}
        </>
      ) : gaId ? (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
            strategy="afterInteractive"
          />
          <Script id="ga-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${gaId}', { anonymize_ip: true });

              // G1 — tempo_pagina_60s
              setTimeout(function(){
                window.dataLayer && window.dataLayer.push({event:'tempo_pagina_60s'});
              }, 60000);
            `}
          </Script>
        </>
      ) : null}

      {pixelId ? (
        <Script id="meta-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${pixelId}');
            fbq('track', 'PageView');
          `}
        </Script>
      ) : null}

      {/* Ahrefs Web Analytics — afterInteractive com data-key via spread para compatibilidade TS */}
      {ahrefsKey ? (
        <Script
          src="https://analytics.ahrefs.com/analytics.js"
          strategy="afterInteractive"
          {...({ "data-key": ahrefsKey } as Record<string, string>)}
        />
      ) : null}
    </>
  );
}
