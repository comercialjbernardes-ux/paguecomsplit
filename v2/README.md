# Venda Feita — Dashboard Financeiro v2

Dashboard financeiro web para gestao de resultados e equipe comercial, conectado diretamente ao Google Sheets como unica fonte de dados.

## Arquitetura

```
Input: Planilha Google Sheets (Fechamento Mensal)
         |
    ┌────┴────┐
    v         v
Modulo     Modulo
Equipe     Interno
    |         |
    v         v
Dashboard  DRE Gerencial
Ranking    Projecao
Comissao   Custos/Receitas
           Carteira
```

## Stack Tecnica

| Tecnologia | Uso |
|-----------|-----|
| React 19 + TypeScript | Framework |
| Vite | Build tool |
| TailwindCSS | Estilos |
| Recharts | Graficos |
| Google Sheets API v4 | Fonte de dados |
| Google OAuth2 (GIS) | Autenticacao |
| Lucide React | Icones |

## Pre-requisitos

1. **Node.js** 18+ e npm
2. **Google Cloud Project** com as APIs habilitadas:
   - Google Sheets API
   - Google People API (para perfil do usuario)

## Configuracao

### 1. Google Cloud Console

1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um novo projeto (ou use um existente)
3. Habilite as APIs:
   - **Google Sheets API** — Em "APIs & Services" > "Library"
   - **Google People API** (ou Google Identity)
4. Crie credenciais:
   - **API Key** — Para leitura de planilhas publicas
   - **OAuth 2.0 Client ID** — Tipo "Web application"
     - Adicione `http://localhost:5173` em "Authorized JavaScript origins"
     - Adicione seu dominio de producao tambem

### 2. Variaveis de Ambiente

```bash
cp .env.example .env
```

Edite o `.env` com suas credenciais:

```env
VITE_GOOGLE_CLIENT_ID=123456789.apps.googleusercontent.com
VITE_GOOGLE_API_KEY=AIzaSy...
VITE_SHEET_ID=1KTRmSWudADXNz6ncJ_ITusdCy_5RDzCV
```

### 3. Planilha Google Sheets

A planilha deve seguir a estrutura esperada:

- **Abas de Fechamento** — Nomeadas com prefixo `Fechamento` (ex: `Fechamento_Mar2026`)
  - Coluna A: Nome da metrica
  - Coluna B: Valor
  - Coluna C: Variacao % (opcional)
- **Aba "Vendedores"** (opcional) — Cadastro de vendedores
- **Aba "Lancamentos"** (opcional) — Historico de lancamentos
- **Aba "Clientes"** (opcional) — Carteira de clientes

## Rodar Localmente

```bash
# Instalar dependencias
npm install

# Iniciar dev server
npm run dev
```

O app abre em `http://localhost:5173`

## Estrutura de Pastas

```
src/
├── components/     # Componentes reutilizaveis (Layout, Sidebar, AuthGuard...)
├── config/         # Constantes e mapeamento de colunas da planilha
├── contexts/       # React Contexts (Auth + Sheets data)
├── hooks/          # Custom hooks (useEquipeData, useInternoData)
├── pages/          # Paginas do dashboard
├── services/       # Integracao com Google (Auth, Sheets API, Mappers)
└── types/          # Interfaces TypeScript
```

## Build para Producao

```bash
npm run build
```

Os arquivos ficam em `dist/`. Deploy via Vercel ou Netlify:

```bash
# Vercel
npx vercel --prod

# Netlify
npx netlify deploy --prod --dir=dist
```

## Contribuicao

1. Fork o repositorio
2. Crie uma branch (`git checkout -b feature/minha-feature`)
3. Commit suas mudancas (`git commit -m "Adiciona feature X"`)
4. Push para a branch (`git push origin feature/minha-feature`)
5. Abra um Pull Request

## Licenca

Este projeto e open source.
