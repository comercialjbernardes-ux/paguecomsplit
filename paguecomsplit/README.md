# paguecomsplit.com.br

Site de conversão da **SplitTech** — solução de maquininha com split de pagamento que reduz a tributação no Simples Nacional ao separar o repasse a terceiros antes da incidência de impostos.

> "Pare de pagar imposto sobre dinheiro que não é seu."

## Stack

- **Next.js 14** (App Router) + **TypeScript**
- **Tailwind CSS** + **shadcn/ui** + **Radix UI**
- **Framer Motion** (animações)
- **React Hook Form** + **Zod** (formulários)
- Deploy na **Vercel**

## Rotas

| Rota | Tipo | Descrição |
|------|------|-----------|
| `/` | static | Home institucional |
| `/[segmento]` | SSG (7 páginas) | LP dinâmica por segmento |
| `/como-funciona` | static | Explicação técnica do Cofre Digital + FAQ |
| `/representantes` | static | Captação de representantes |
| `/api/lead` | dynamic | Recebe leads via POST, encaminha para webhook |
| `/sitemap.xml` | static | Sitemap automático |
| `/robots.txt` | static | Bloqueia /api, indica sitemap |

Segmentos suportados: `restaurante`, `veterinaria`, `estetica`, `odontologia`, `petshop`, `oficina`, `construcao`.

## Como rodar

```bash
npm install
cp .env.local.example .env.local   # ajustar valores
npm run dev                         # http://localhost:3000
```

Outros scripts:

```bash
npm run build      # build de produção
npm run start      # rodar build localmente
npm run lint       # ESLint
npx tsc --noEmit   # typecheck
```

## Variáveis de ambiente

Veja `.env.local.example`. Resumo:

| Var | Obrigatória | O que faz |
|-----|-------------|-----------|
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | sim em prod | Número de destino dos botões de CTA (formato `5511999998888`) |
| `NEXT_PUBLIC_SITE_URL` | recomendado | URL base usada em metadata, sitemap, OG, canonicals |
| `LEAD_WEBHOOK_URL` | sim em prod | Endpoint que recebe os leads via POST JSON |
| `LEAD_WEBHOOK_TOKEN` | opcional | Enviado como header `X-Webhook-Token` para o webhook |
| `NEXT_PUBLIC_GA_ID` | opcional | Google Analytics 4 (id `G-XXXX`) |
| `NEXT_PUBLIC_META_PIXEL_ID` | opcional | Meta Pixel (id numérico) |

Sem `LEAD_WEBHOOK_URL`, a API loga o payload no console e retorna sucesso — útil para iterar UX antes do CRM estar pronto.

## Estrutura

```
paguecomsplit/
├── app/
│   ├── layout.tsx              fonts + metadata global + RepTracker + Analytics
│   ├── page.tsx                Home
│   ├── globals.css             tokens da paleta + utilities
│   ├── sitemap.ts              sitemap automático
│   ├── robots.ts               robots.txt
│   ├── [segmento]/page.tsx     LP dinâmica (generateStaticParams das 7 LPs)
│   ├── como-funciona/page.tsx
│   ├── representantes/page.tsx
│   └── api/lead/route.ts       endpoint do form
├── components/
│   ├── ui/                     primitives (Button, Input, Dialog, Select, Slider, Label)
│   ├── sections/               seções específicas de LP (Hero, Problema, Cofre, etc.)
│   ├── CTAWhatsApp.tsx
│   ├── EconomySimulator.tsx
│   ├── LeadForm.tsx
│   ├── RepresentanteForm.tsx
│   ├── SegmentGrid.tsx
│   ├── TrustBadges.tsx
│   ├── LegalOpinionModal.tsx
│   ├── RepTracker.tsx          persiste ?rep= em localStorage (TTL 30d)
│   ├── OrganizationJsonLd.tsx
│   └── Analytics.tsx           GA4 + Meta Pixel via env vars
└── lib/
    ├── segments.ts             fonte única do conteúdo dos 7 segmentos
    ├── schemas.ts              Zod (leadSchema, representanteSchema, payloadSchema)
    └── utils.ts                cn(), formatBRL(), formatPercent(), buildWhatsAppHref()
```

## Regras invioláveis

1. **Zero conteúdo de segmento hardcoded fora de `lib/segments.ts`.** Para adicionar um segmento, edite só esse arquivo.
2. **Sem placeholders de depoimento.** Se `segment.testimonial` for `undefined`, a seção 7 da LP não renderiza.
3. **Modal do parecer jurídico é obrigatório** no `TrustBadges` — não substitua por afirmação vaga.
4. **WhatsApp via env var** (`NEXT_PUBLIC_WHATSAPP_NUMBER`), nunca hardcoded.
5. **Imagens via `next/image`**.

## Cálculo do simulador

```
imposto_atual  = faturamento_anual × alíquota
imposto_split  = (faturamento_anual − repasse) × alíquota
economia       = imposto_atual − imposto_split
```

> ⚠️ **A fórmula deve ser revisada com o time comercial e contábil antes do deploy de produção.** Erro aqui corrói credibilidade.

## Rastreamento de representantes

URLs no formato `paguecomsplit.com.br/[segmento]?rep=codigo` salvam o código em `localStorage` (`pcs_rep`) por 30 dias. Tanto `LeadForm` quanto `RepresentanteForm` incluem o `rep` no payload enviado à API. A API anexa o rep ao webhook.

## Deploy na Vercel

1. Importar o repositório no dashboard da Vercel
2. **Root Directory**: `paguecomsplit`
3. Framework preset: Next.js (autodetectado)
4. Configurar as env vars do `.env.local.example`
5. Apontar o domínio `paguecomsplit.com.br` no painel de domínios

`vercel.json` já fixa região `gru1` (São Paulo) para latência menor.

## Checklist Fase 1 (entregue)

- [x] `lib/segments.ts` com os 7 segmentos
- [x] Home institucional completa
- [x] LPs dinâmicas das 7 segmentos via SSG (foco comercial: estética/odontologia/oficina)
- [x] `/como-funciona` com FAQ + JSON-LD
- [x] `/representantes` com formulário próprio
- [x] `EconomySimulator` funcional com defaults por segmento
- [x] `LeadForm` + `/api/lead` com webhook
- [x] `TrustBadges` com modal do parecer jurídico
- [x] Sitemap, robots, JSON-LD (Organization, Service, FAQPage)
- [x] GA4 + Meta Pixel via env vars
- [x] Mobile-first responsivo

## Próximas fases

**Fase 2:** copy revisada + depoimentos reais dos 7 segmentos; integração direta CRM (RD/HubSpot); blog SEO em `app/blog/[slug]`.

**Fase 3:** painel do representante com dashboard de conversões; campanhas dedicadas; A/B testing de headlines.
