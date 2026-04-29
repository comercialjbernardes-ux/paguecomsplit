# Venda Feita — Dashboard Financeiro v2

Dashboard financeiro web para gestao de resultados e equipe comercial, conectado ao Google Sheets via **modelo Benchmark Anual** (multi-planilha historica).

---

## Indice

1. [Arquitetura](#arquitetura)
2. [Stack Tecnica](#stack-tecnica)
3. [Modulo de Dados — Benchmark Anual](#modulo-de-dados--benchmark-anual)
4. [Paginas e Funcionalidades](#paginas-e-funcionalidades)
5. [Sistema de Periodo](#sistema-de-periodo)
6. [Configuracao](#configuracao)
7. [Estrutura de Pastas](#estrutura-de-pastas)
8. [Formatos de Planilha Suportados](#formatos-de-planilha-suportados)
9. [Build e Deploy](#build-e-deploy)
10. [Historico de Alteracoes Tecnicas](#historico-de-alteracoes-tecnicas)

---

## Arquitetura

```
Planilhas Mensais (Google Sheets — uma por mes)
         |
    Benchmark Anual
    (DataContext.tsx)
         |
    historicalDataMap
    Record<"YYYY-MM", HistoricalSheetData>
         |
    ┌────┼────────────────────┐
    v    v                    v
fechamentos  lancamentos   clientes/periodo
    |              |              |
    v              v              v
Modulo Equipe   Financeiro   Analise Carteira
Dashboard       DRE Gerencial
Ranking         Projecao
Comissao        Gestao Custos
```

**Principio:** cada planilha mensal e carregada uma vez no Benchmark Anual e armazenada em `historicalDataMap`. Todas as telas consomem exclusivamente esses dados — nao ha leitura em tempo real durante a navegacao.

---

## Stack Tecnica

| Tecnologia | Uso |
|---|---|
| React 19 + TypeScript | Framework |
| Vite 8 | Build tool |
| TailwindCSS | Estilos |
| Recharts | Graficos (Area, Bar, Pie, Scatter) |
| Google Sheets API v4 | Fonte de dados |
| Google OAuth2 (GIS) | Autenticacao |
| Lucide React | Icones |
| localStorage | Persistencia de edicoes locais |

---

## Modulo de Dados — Benchmark Anual

### Como funciona

1. O usuario cadastra planilhas mensais em **Configuracoes > Benchmark Anual**
2. Cada planilha e carregada via `loadHistoricalSheetData` e armazenada em `historicalDataMap` com chave `"YYYY-MM"` (ex: `"2026-03"`)
3. Os dados sao persistidos no `localStorage` entre sessoes
4. Todas as telas consomem `DataContext` — nao ha fetch direto nas paginas

### Fluxo de dados

```
addHistoricalSheet(id, month, year)
  └─> loadHistoricalSheetData(sheetId, "Mar2026")
        ├─> fechamentos  (abas Fechamento_* ou Resumo)
        ├─> vendedores   (aba Vendedores)
        ├─> lancamentos  (aba Lancamentos OU Repasses+Descontos+Cobr.Digital)
        └─> clientes     (aba Clientes OU MKP de POS)
```

### Snapshots por periodo

- `historicalDataMap["2026-03"].clientes` = carteira de Marco 2026
- `getClientesPorPeriodo("Mar2026")` = lookup O(1) com overrides aplicados
- `historicalDataMap["2026-01"].lancamentos` = lancamentos de Janeiro 2026

---

## Paginas e Funcionalidades

### Modulo Equipe

#### Dashboard de Resultados (`/equipe/dashboard`)
- KPIs: TPV Total, Markup POS, Margem %, ECs Ativos, Valor Liquido, Ticket/EC, Conta Digital, Descontos
- Faixa de destaque: 3 metricas principais com variacao percentual vs periodo anterior
- Grafico de evolucao: Area Chart dos ultimos 10 periodos (Markup + Valor Liquido)
- Analise de carteira: saude dos ECs, distribuicao por faixa de receita
- Insights automaticos: ate 4 diagnosticos por nivel (critico / atencao / positivo / info)
- **Seletor de periodo**: ultimo mes, acumulado ou mes especifico
- Modo acumulado: `fechamentoAcumulado` sintetico soma todos os periodos disponíveis

#### Ranking de Vendedores (`/equipe/ranking`)
- Classificacao por faturamento mensal
- Variacao % vs mes anterior

#### Comissoes (`/equipe/comissoes`)
- Calculo de comissao por vendedor e periodo

### Modulo Interno

#### DRE Gerencial (`/interno/dre`)
- Demonstrativo de Resultado do Exercicio por periodo
- Seletor de periodo com modo acumulado
- Card Conta Digital: calculo `nECs × R$29,90`
- Integracao com lancamentos locais (receitas e despesas manuais)
- Resultado Final = Valor Liquido + Receitas Locais - Despesas Locais - Custos

#### Financeiro / Gestao de Custos (`/interno/custos`)
- **4 KPI cards principais** (period-aware): Receitas, Despesas, Saldo Operacional, Resultado Final
- **3 cards de breakdown**: Cobr. Conta Digital, Descontos, Repasses — com filtro por clique
- Tabela de lancamentos com paginacao e filtros (tipo, categoria, conta, busca)
- Modal "Novo Lancamento" com data pre-preenchida para o mes selecionado
- Seletor de periodo (mesmo sistema das outras abas)

#### Analise de Carteira (`/interno/carteira`)
- **Filtro de periodo totalmente funcional**: troca o snapshot de clientes por mes
- 3 abas: Carteira, Saude, Lucratividade
- Carteira: Mapa scatter (TPV x Markup), pizza por segmento, status dos ECs
- Saude: score por EC, ECs sem receita (alerta), oportunidades Conta Digital, top 10 por markup
- Lucratividade: ranking com custo proporcional por volume, lucro estimado por EC
- Override de segmento inline com restauracao

#### Projecao (`/interno/projecao`)
- Simulacao de cenarios de crescimento

---

## Sistema de Periodo

Todas as telas com seletor usam o componente `PeriodSelector` (`src/components/PeriodSelector.tsx`).

### Estados possiveis

| Valor | Comportamento |
|---|---|
| `"ultimo"` | Usa `fechamentos[fechamentos.length - 1]` |
| `"acumulado"` | Soma todos os periodos em `fechamentoAcumulado` sintetico |
| `"Mar2026"` etc | Usa o periodo especifico |

### Utilitarios de periodo

```typescript
// Verifica se uma data DD/MM/AAAA pertence ao periodo "Mar2026"
dataPertenceAoPeriodo(data: string, periodo: string): boolean

// Retorna clientes do snapshot do periodo (ex: "Mar2026")
getClientesPorPeriodo(periodo: string): ClienteCarteira[]

// Retorna totais de lancamentos locais para um periodo
getLocaisPorPeriodo(periodo: string): { receitas: number; despesas: number }

// Calculo de custos mensais efetivos (com prorate de recorrencia)
calcCustosMensalEfetivo(custos, periodo?): number
calcCustosMensalSemUnico(custos): number
```

### Conversao de chaves

- Periodo externo: `"Mar2026"` (abreviacao PT + ano)
- Chave do mapa: `"2026-03"` (ISO YYYY-MM)
- Conversao em `getClientesPorPeriodo`: regex `^([a-z]{3})(\d{4})$` + tabela de meses

---

## Configuracao

### 1. Google Cloud Console

1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um projeto e habilite:
   - **Google Sheets API**
   - **Google People API**
3. Crie credenciais:
   - **API Key** — leitura de planilhas
   - **OAuth 2.0 Client ID** (Web application)
     - Authorized origin: `http://localhost:5173` + dominio de producao

### 2. Variaveis de Ambiente

```bash
cp .env.example .env
```

```env
VITE_GOOGLE_CLIENT_ID=123456789.apps.googleusercontent.com
VITE_GOOGLE_API_KEY=AIzaSy...
VITE_SHEET_ID=1KTRmSWudADXNz6ncJ_ITusdCy_5RDzCV
```

### 3. Rodar Localmente

```bash
npm install
npm run dev
# App em http://localhost:5173
```

---

## Estrutura de Pastas

```
src/
├── components/
│   ├── PeriodSelector.tsx      # Seletor reutilizavel de periodo
│   ├── TransactionForm.tsx     # Modal de lancamento (novo/editar)
│   ├── LoadingState.tsx
│   ├── ErrorBanner.tsx
│   └── Layout/Sidebar/...
├── config/
│   ├── sheets.ts               # Nomes das abas (SHEET_TABS)
│   └── env.ts
├── constants/
│   ├── empresa.ts              # PRECO_CONTA_DIGITAL = 29.90
│   └── categorias.ts
├── contexts/
│   ├── DataContext.tsx         # Provider unificado — Benchmark Anual
│   ├── dataContextValue.ts     # Tipo DataContextType + hook useDataContext
│   ├── SheetsContext.tsx       # Leitura direta de planilha (legado/CRUD)
│   └── AuthContext.tsx
├── hooks/
│   ├── useInternoData.ts       # Dados modulo interno (fechamentos, clientes, lancamentos)
│   └── useEquipeData.ts        # Dados modulo equipe (vendedores)
├── pages/
│   ├── equipe/
│   │   ├── Dashboard.tsx       # Dashboard de Resultados
│   │   ├── Ranking.tsx
│   │   └── Comissoes.tsx
│   └── interno/
│       ├── DRE.tsx             # DRE Gerencial
│       ├── Custos.tsx          # Financeiro / Gestao de Custos
│       ├── Carteira.tsx        # Analise de Carteira
│       └── Projecao.tsx
├── services/
│   ├── sheetsApi.ts            # readRange, getSpreadsheetMetadata
│   ├── sheetMappers.ts         # mapRows* (com deteccao dinamica de cabecalho)
│   ├── sheetsCrud.ts           # addLancamento, updateLancamento, deleteLancamento
│   ├── ecAnalysis.ts           # calcHealthScore, getECsSemReceita, etc.
│   ├── mergeStrategies.ts      # mergeLancamentos, mergeVendedores, mergeSegmentOverrides
│   ├── localStorageService.ts
│   └── errorLogger.ts
├── types/
│   └── index.ts                # DadosFechamento, ClienteCarteira, LancamentoCusto, ...
└── utils/
    ├── custos.ts               # calcCustosMensalEfetivo, dataPertenceAoPeriodo
    └── format.ts               # formatCurrency, formatCurrencyShort, ...
```

---

## Formatos de Planilha Suportados

### Abas de Fechamento

| Formato | Aba | Observacao |
|---|---|---|
| Classico | `Fechamento_Mar2026` | Prefixo `Fechamento_` |
| Comercial Bernardes | `Resumo` | Detectado por `extractPeriodoFromTab` |

### Clientes

| Formato | Aba | Observacao |
|---|---|---|
| Classico | `Clientes` | `mapRowsToClientes` |
| Comercial Bernardes | `MKP de POS` | `mapRowsMKPdePOS` (A:F) |

### Lancamentos

| Formato | Aba(s) | Observacao |
|---|---|---|
| Classico | `Lancamentos` | `mapRowsToLancamentos` |
| Comercial Bernardes | `Repasses` + `Descontos` + `Cobr. Conta Digital` | Combinados via fallback |

### Layout Descontos por ano

| Periodo | Colunas relevantes | Observacao |
|---|---|---|
| Jan/Fev 2026 | A=vazia, B=CNPJ, C=Parceiro, D=Tipo, E=Origem, **F=Valor** | Range `A:F` obrigatorio |
| Mar 2026+ | Tipo+Descricao mergeadas, Valor em col E | Deteccao dinamica de cabecalho |

`sheetMappers.ts` usa deteccao dinamica de indice de cabecalho (`headerRowIdx`) e coluna de valor (`valorIdx`) para suportar ambos os layouts.

---

## Build e Deploy

```bash
npm run build
# Saida em dist/

# Vercel
npx vercel --prod

# Netlify
npx netlify deploy --prod --dir=dist
```

---

## Historico de Alteracoes Tecnicas

### [atual] — Filtro de Periodo na Analise de Carteira

**Problema:** seletor de periodo presente mas sem efeito — todos os memos usavam snapshot mais recente.

**Causa raiz:** `historicalDataMap` ja armazenava snapshots de clientes por periodo (`"2026-03"` etc.), mas nao havia API para consulta-los.

**Solucao (4 arquivos):**
- `dataContextValue.ts`: adicionado `getClientesPorPeriodo(periodo)` ao tipo
- `DataContext.tsx`: implementado getter com conversao `"Mar2026"` → `"2026-03"`, aplicando segment overrides e enrichment de `contaDigitalAtiva`
- `useInternoData.ts`: exposto no hook
- `Carteira.tsx`: `clientesBase` useMemo usa o getter — todos os 12 memos downstream tornam-se period-aware automaticamente

---

### Dashboard de Resultados — Seletor de Periodo

**Adicionado:** `PeriodSelector` com modo `"acumulado"` sintetico.

**`fechamentoAcumulado`:** objeto `DadosFechamento` sintetico que soma todos os periodos disponíveis. Campos `ecsAtivos` e `tpvMedio` usam snapshot do periodo mais recente (semantica de snapshot, nao soma).

**Modo acumulado:** variacoes vs anterior retornam `null` (sem comparativo), insights usam `fechamentoAnt = null`.

---

### Financeiro (Custos.tsx) — Cards de Breakdown e KPIs Period-Aware

**Cards adicionados:** Cobr. Conta Digital (azul), Descontos (vermelho), Repasses (verde) — clicaveis para filtrar tabela.

**KPIs corrigidos:** `totaisGlobal` passou a depender de `lancamentosPeriodo` (filtrado por periodo) em vez de `lancamentos` (todos os meses).

**Novo Lancamento:** `defaultFormDate` pre-preenche o 1o dia do mes selecionado; `setPagina(1)` reseta paginacao apos salvar.

---

### Descontos Jan/Fev 2026 — Coluna F ausente

**Problema:** valores zerados para Descontos nos meses Jan e Fev 2026.

**Causa:** range `A:E` excluia a coluna F onde ficava o Valor nesses meses.

**Corrigido em:**
- `DataContext.tsx` linha 167: `A:E` → `A:F`
- `SheetsContext.tsx` linha 202: `A:E` → `A:F`
- `sheetMappers.ts`: deteccao dinamica de `headerRowIdx` e `valorIdx`

---

### DRE Gerencial — Seletor de Periodo

Primeira implementacao do `PeriodSelector` com modo acumulado. Padrao replicado nas demais telas.

---

## Licenca

Este projeto e open source.
