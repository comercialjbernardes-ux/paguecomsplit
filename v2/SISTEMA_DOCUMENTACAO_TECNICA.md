# Venda Feita Dashboard v2 — Documentação Técnica Completa

> **Gerado em:** 29/04/2026  
> **Repositório:** https://github.com/comercialjbernardes-ux/Venda-feita  
> **Finalidade:** Referência técnica completa para IA/LLM entender e trabalhar com o sistema sem depender de contexto anterior.

---

## 1. VISÃO GERAL DO SISTEMA

O **Venda Feita Dashboard v2** é uma Single Page Application (SPA) de gestão financeira e comercial para a empresa **Comercial Bernardes**, representante PagBank. O sistema consome planilhas mensais do Google Sheets (exportadas do PagBank em `.xlsx` e convertidas para formato Google Sheets nativo) e expõe os dados em módulos de visualização, análise e relatório.

**Empresa de referência:** Comercial Bernardes  
**Produto comercializado:** Maquininhas POS PagBank  
**Receita principal:** Markup sobre volume de transações (TPV) dos estabelecimentos comerciais (ECs)  
**Receita secundária:** Cobrança de Conta Digital (R$ 29,90/EC/mês)

---

## 2. STACK TECNOLÓGICA

| Camada | Tecnologia |
|---|---|
| Framework UI | React 19 + TypeScript (strict mode) |
| Build Tool | Vite 8 |
| Estilização | Tailwind CSS 4 + CSS custom properties |
| Roteamento | React Router DOM v7 |
| Gráficos | Recharts (AreaChart, BarChart, LineChart) |
| Ícones | Lucide React |
| Auth | Google OAuth2 (GSI — Google Sign-In) |
| Dados | Google Sheets API v4 |
| Export PDF | `window.print()` via CSS @media print |
| Export Excel | SheetJS (xlsx) |
| Export PDF alternativo | jsPDF (legado, mantido como fallback) |
| Persistência local | localStorage (chaves `vdf_*`) |
| Lint/Format | ESLint + TypeScript strict |
| Dev server | `npm run dev` → porta 5173 |
| Build | `npm run build` → `dist/` |

**Fontes:** Inter (corpo) + Exo (títulos/display) — Google Fonts  
**Node:** compatível com Node 18+  
**Package manager:** npm

---

## 3. ESTRUTURA DE ARQUIVOS

```
v2/
├── index.html
├── vite.config.ts
├── tailwind.config.js        ← paleta de cores customizada
├── tsconfig.json
├── package.json
├── .env                      ← variáveis de ambiente (não commitadas)
├── SISTEMA_DOCUMENTACAO_TECNICA.md (este arquivo)
└── src/
    ├── main.tsx               ← entry point, monta providers
    ├── App.tsx                ← roteamento principal
    ├── index.css              ← Tailwind base + CSS custom props + Google Fonts
    ├── types/index.ts         ← todos os tipos TypeScript
    ├── config/
    │   ├── env.ts             ← variáveis de ambiente tipadas
    │   └── sheets.ts          ← mapeamento de abas e colunas
    ├── constants/
    │   ├── empresa.ts         ← NOME_EMPRESA, PRECO_CONTA_DIGITAL
    │   └── categorias.ts      ← categorias de lançamentos
    ├── contexts/
    │   ├── AuthContext.tsx    ← Google OAuth2 state
    │   ├── SheetsContext.tsx  ← leitura Google Sheets
    │   ├── DataContext.tsx    ← provider unificado (merge sheets + localStorage)
    │   └── dataContextValue.ts← definição do contexto + tipo HistoricalSheet
    ├── hooks/
    │   ├── useEquipeData.ts   ← dados do Módulo Equipe
    │   └── useInternoData.ts  ← dados do Módulo Interno
    ├── services/
    │   ├── googleAuth.ts      ← inicializa e gerencia OAuth2
    │   ├── sheetsApi.ts       ← chamadas à Google Sheets API v4
    │   ├── sheetMappers.ts    ← transforma rows brutos em tipos TS
    │   ├── sheetsCrud.ts      ← escrita (add/update/delete) na planilha
    │   ├── localStorageService.ts ← CRUD genérico em localStorage
    │   ├── mergeStrategies.ts ← merge de dados Sheets + local
    │   ├── exportService.ts   ← exportação PDF/Excel/CSV
    │   ├── ecAnalysis.ts      ← análise de carteira de ECs
    │   ├── errorLogger.ts     ← logger estruturado + sentry-like
    │   └── aiAgent.ts         ← (futuro) integração IA
    ├── utils/
    │   ├── format.ts          ← formatCurrency, formatPercent, periodoToDate
    │   └── custos.ts          ← calcCustosMensalEfetivo, dataPertenceAoPeriodo
    ├── components/
    │   ├── Layout.tsx         ← wrapper Sidebar + Outlet
    │   ├── Sidebar.tsx        ← navegação lateral
    │   ├── AuthGuard.tsx      ← proteção de rotas
    │   ├── ConnectionStatus.tsx ← banner status Benchmark Anual
    │   ├── PeriodSelector.tsx ← seletor de período reutilizável
    │   ├── LoadingState.tsx   ← spinner + skeleton cards
    │   ├── ErrorBoundary.tsx  ← captura erros React
    │   ├── ErrorBanner.tsx    ← banner de erro inline
    │   ├── ExportMenu.tsx     ← menu dropdown de exportação
    │   ├── TransactionForm.tsx← formulário de lançamentos manuais
    │   └── DeleteConfirmDialog.tsx ← modal confirmação exclusão
    └── pages/
        ├── Login.tsx          ← tela de autenticação Google
        ├── Logs.tsx           ← log do sistema
        ├── Placeholder.tsx    ← página placeholder
        ├── Relatorios.tsx     ← relatório completo exportável
        ├── Settings.tsx       ← Benchmark Anual (conexão de planilhas)
        ├── equipe/
        │   ├── Dashboard.tsx  ← central de comando executiva
        │   ├── Ranking.tsx    ← ranking da equipe comercial
        │   └── Comissionamento.tsx ← cálculo de comissões
        ├── interno/
        │   ├── DRE.tsx        ← Demonstração de Resultados
        │   ├── Projecao.tsx   ← projeção de crescimento
        │   ├── Custos.tsx     ← gestão financeira / custos
        │   └── Carteira.tsx   ← análise de carteira de ECs
        └── config/
            ├── Parametrizacao.tsx ← wrapper → CadastroVendedores
            └── CadastroVendedores.tsx ← CRUD de vendedores
```

---

## 4. VARIÁVEIS DE AMBIENTE (.env)

```env
VITE_GOOGLE_CLIENT_ID=<OAuth2 Client ID do Google Console>
VITE_GOOGLE_API_KEY=<API Key do Google Console>
VITE_SHEET_ID=<ID da planilha Google Sheets principal>
```

**Acesso:** `import { ENV } from '../config/env'`  
- `ENV.GOOGLE_CLIENT_ID` — Client ID OAuth2  
- `ENV.GOOGLE_API_KEY` — API Key para leitura pública  
- `ENV.SHEET_ID` — ID padrão da planilha (fallback: `1KTRmSWudADXNz6ncJ_ITusdCy_5RDzCV`)  
- `ENV.isConfigured` — booleano, true se CLIENT_ID e API_KEY estão preenchidos

---

## 5. HIERARQUIA DE PROVIDERS

```
<ErrorBoundary>
  <AuthProvider>          ← Google OAuth2 state
    <SheetsProvider>      ← leitura Google Sheets API
      <DataProvider>      ← merge Sheets + localStorage + Benchmark Anual
        <App />           ← BrowserRouter + Routes
      </DataProvider>
    </SheetsProvider>
  </AuthProvider>
</ErrorBoundary>
```

**Hook de acesso:** `useDataContext()` — consumido por todos os hooks e páginas.

---

## 6. AUTENTICAÇÃO (AuthContext + googleAuth.ts)

- **Protocolo:** Google OAuth2 via GSI (Google Sign-In JavaScript library)
- **Escopos:** `userinfo.profile`, `userinfo.email`, `spreadsheets` (leitura+escrita)
- **Fluxo:** `initGoogleAuth()` → `signIn()` → popup OAuth → `onAuthStateChange()` → `setUser()` + `setToken()`
- **Estado:** `user: GoogleUser | null`, `token: string | null`, `isAuthenticated: boolean`
- **Proteção de rotas:** componente `<AuthGuard>` — redireciona para `/login` se não autenticado
- **Tipo `GoogleUser`:** `{ id, name, email, picture }`

---

## 7. MODELO DE DADOS (types/index.ts)

### 7.1 DadosFechamento
Dados mensais de fechamento PagBank. Fonte: aba `Resumo` da planilha.

```typescript
interface DadosFechamento {
  periodo: string        // "Mar2026" (3 letras PT + 4 dígitos ano)
  ecsAtivos: number      // Quantidade de ECs ativos no mês
  tpvTotal: number       // Volume total de transações (R$) — informativo, não receita
  tpvMedio: number       // TPV médio por EC
  markupPos: number      // Receita principal CB = spread sobre TPV (R$)
  taxaMargem: number     // markupPos / tpvTotal (decimal, ex: 0.0105 = 1,05%)
  comissaoRede: number   // Comissão de rede PagBank (normalmente R$ 0)
  repasse: number        // Repasses da rede para CB (R$) — receita adicional
  faturaDigital: number  // Cobrança Conta Digital (R$) — dedução
  descontos: number      // Descontos concedidos no período (R$) — dedução
  valorLiquido: number   // Resultado final: markup+comissão+repasse-digital-descontos
  // Variações % vs período anterior (podem ser undefined):
  variacaoEcs?: number
  variacaoTpv?: number
  variacaoMarkup?: number
  variacaoMargem?: number
}
```

**Fórmula do Valor Líquido:**
`valorLiquido = markupPos + comissaoRede + repasse − faturaDigital − descontos`

**Verificado para Jan/Fev/Mar 2026:**
- Jan: 24.521,84 + 0 + 6.434,42 − 1.166,10 − 3.290,80 = R$ 26.499,36 ✓
- Fev: 23.374,44 + 0 + 7.835,50 − 1.196,00 − 6.861,80 = R$ 23.152,14 ✓
- Mar: 28.758,68 + 278,12 + 8.264,60 − 1.046,50 − 4.888,80 = R$ 31.366,10 ✓

### 7.2 ClienteCarteira
Estabelecimento Comercial (EC) da carteira PagBank.

```typescript
interface ClienteCarteira {
  id: number
  cnpj?: string          // CNPJ do EC (14 dígitos sem formatação)
  nome: string           // Nome do estabelecimento
  segmento: string       // Inferido por nome: Alimentacao | Comercio | Saude | Servicos | Hospedagem & Lazer | Outros
  vendedor: string       // Nome do consultor responsável
  volumeTotal: number    // TPV do EC (R$)
  ticketMedio: number    // Markup gerado por este EC — NÃO ticket médio por transação
  margem?: number        // % de margem do EC (decimal)
  contaDigitalAtiva?: boolean // EC tem conta digital ativa
  ultimaCompra: string   // Período de referência (ex: "Mar2026")
  status: 'ativo' | 'inativo' | 'em risco'
  frequencia: number     // 1-3 (derivado do markup: >500→3, >100→2, resto→1)
  _sheetRow?: number
}
```

### 7.3 LancamentoCusto
Registro financeiro individual (receita ou despesa).

```typescript
interface LancamentoCusto {
  id: string             // "REP-XXXXXX-N" | "DESC-N" | "COBR-N" | manual
  data: string           // "DD/MM/AAAA"
  descricao: string
  categoria: string      // "Repasse" | "Conta Digital" | "Aluguel" | "Infraestrutura" | "Equipamentos" | "Fornecedores" | livre
  tipo: 'receita' | 'despesa'
  valor: number          // sempre positivo (Math.abs aplicado no mapper)
  conta: string          // "Repasses" | "Descontos" | "Cobr. Conta Digital" | livre
  cnpjCliente?: string
  nomeCliente?: string
  tipoAjuste?: string    // Tipo de Ajuste (Repasses)
  source?: 'sheets' | 'local'
  _sheetRow?: number
}
```

### 7.4 Vendedor

```typescript
interface Vendedor {
  id: number
  nome: string
  regiao: string
  avatar: string         // iniciais (ex: "JB")
  faturamentoMensal: number   // calculado: soma ticketMedio dos clientes desse vendedor
  metaMensal: number
  faturamentoAcumulado: number
  metaAcumulada: number
  variacaoMes: number    // % vs mês anterior
  comissaoBase: number   // % de comissão base
  bonus: number          // % bônus ao atingir meta
  source?: 'sheets' | 'local'
}
```

### 7.5 Outros tipos importantes

```typescript
// Custo operacional (localStorage)
interface CustoOperacional {
  id: string; data: string; descricao: string
  categoria: 'Fixo' | 'Variavel' | 'Financeiro' | 'Fornecedor'
  valor: number
  recorrencia: 'unico' | 'mensal' | 'trimestral' | 'anual'
}

// Equipamento com parcelamento (localStorage)
interface Equipamento {
  id: string; dataCompra: string; descricao: string
  valorTotal: number; numeroParcelas: number
  valorParcela: number; parcelasPagas: number
}

// Meta por período (localStorage)
interface MetaPeriodo {
  periodo: string  // "Mar2026"
  meta: number
  editedAt: string // ISO
}

// Override de segmento de cliente (localStorage)
interface SegmentOverride {
  clienteId: number
  segmento: string
}
```

---

## 8. FORMATO DAS PLANILHAS GOOGLE SHEETS

### 8.1 Abas reconhecidas (SHEET_TABS em config/sheets.ts)

| Constante | Nome na planilha | Formato |
|---|---|---|
| `RESUMO` | `Resumo` | Fechamento principal — Comercial Bernardes |
| `MKP_POS` | `MKP de POS` | Carteira de ECs com TPV e Markup |
| `REPASSES` | `Repasses` | Repasses individuais por EC |
| `DESCONTOS` | `Descontos` | Descontos concedidos no período |
| `COBR_DIGITAL` | `Cobr. Conta Digital` | ECs com conta digital ativa |
| `VENDEDORES` | `Vendedores` | Cadastro da equipe (formato clássico) |
| `CLIENTES` | `Clientes` | Carteira (formato clássico) |
| `LANCAMENTOS` | `Lancamentos` | Lançamentos (formato clássico) |

**Padrão regex para detecção de aba de fechamento:**
`/^(Fechamento[_\s-]|Resumo$)/i`

### 8.2 Aba `Resumo` — Estrutura e Mapeamento

A função `mapRowsToFechamento()` usa `findValue(label)` que busca em Col A e Col B:

| Label buscado (substring) | Campo TypeScript |
|---|---|
| `"ecs ativ"` ou `"clientes ativ"` | `ecsAtivos` |
| `"tpv total"` ou `"tpv"` | `tpvTotal` |
| `"tpv m"` ou `"medio por ec"` | `tpvMedio` |
| `"markup"` | `markupPos` |
| `"margem"` ou `"taxa de margem"` | `taxaMargem` |
| `"comiss"` ou `"rede"` | `comissaoRede` |
| `"repasse"` ou `"transfer"` | `repasse` |
| `"digital"` ou `"conta digital"` | `faturaDigital` |
| `"descontos do"` | `descontos` (**CRÍTICO**: "do" evita colisão com cabeçalho de seção) |
| `"líquido"` ou `"liquido"` ou `"valor l"` | `valorLiquido` |

**Variações %:** buscadas na seção "comparativo" — Col E (label) → Col G (valor no formato "▲ 10.2%").

### 8.3 Aba `MKP de POS` — Colunas

```
Row 1: título "DETALHAMENTO MKP DE POS"
Row 2: headers (detecção dinâmica nas primeiras 15 linhas)
Row 3+: dados

Col A (idx 0): sequencial (ignorado)
Col B (idx 1): Nome do estabelecimento      → ClienteCarteira.nome
Col C (idx 2): CNPJ (numérico ou formatado) → ClienteCarteira.cnpj
Col D (idx 3): TPV Total                    → ClienteCarteira.volumeTotal
Col E (idx 4): Markup (R$)                  → ClienteCarteira.ticketMedio
Col F (idx 5): Margem (decimal)             → ClienteCarteira.margem
```

**Linhas de TOTAL detectadas** por: célula = "TOTAL" exato OU começa com "TOTAL " + pontuação.
**Segmento inferido** automaticamente pelo nome do estabelecimento (função `inferirSegmento()`).

### 8.4 Aba `Repasses` — Colunas

```
Row 1: título
Row 2: headers
Row 3+: dados

Col A (idx 0): sequencial
Col B (idx 1): Data (pode ser M/DD/YYYY em Jan/Fev ou DD/MM/YYYY em Mar+)
Col C (idx 2): CNPJ (pode ser formatado ou sem formatação)
Col D (idx 3): Nome do Estabelecimento
Col E (idx 4): Tipo de Ajuste
Col F (idx 5): Valor (R$)
```

**Normalização de data:** Se primeiro número > 12 → DD/MM/YYYY; se segundo > 12 → M/DD/YYYY; ambos ≤ 12 → assume M/DD/YYYY (padrão histórico Jan/Fev).

### 8.5 Aba `Descontos` — Colunas (CRÍTICO: varia por período)

**Jan/Fev (6 colunas):**
```
Col A (idx 0): vazio
Col B (idx 1): CNPJ Parceiro
Col C (idx 2): Parceiro (Retenção)
Col D (idx 3): Tipo ("POS", "Chip")
Col E (idx 4): Origem do Desconto
Col F (idx 5): Valor (R$)
```

**Mar (5 colunas — Tipo e Descrição MESCLADOS):**
```
Col A (idx 0): vazio
Col B (idx 1): CNPJ Parceiro
Col C (idx 2): Parceiro (Retenção)
Col D (idx 3): "Tipo | Origem do Desconto" (célula mesclada com pipe)
Col E (idx 4): Valor (R$)
```

**Solução:** `mapRowsDescontos()` detecta o índice de VALOR dinamicamente, buscando a linha de header que contenha "valor" E "cnpj" simultaneamente. A coluna VALOR é `headerIdx`. A coluna Tipo+Desc é `headerIdx - 1`.

### 8.6 Aba `Cobr. Conta Digital` — Colunas

```
Col A (idx 0): vazio
Col B (idx 1): Nome do Estabelecimento
Col C (idx 2): Conta Ativa? ("Sim"/"Não")
Col D (idx 3): Valor (R$ 29,90 por EC ativo)
```

Detecção dinâmica: busca linha de header com "estabelec|nome do" E "valor" na mesma linha.

---

## 9. FLUXO DE DADOS (DATA PIPELINE)

```
PagBank XLSX
    ↓ (upload manual → Google Drive → converter para Google Sheets nativo)
Google Sheets (planilha mensal)
    ↓ (Google Sheets API v4 via sheetsApi.ts)
rows brutos: (string | number)[][]
    ↓ (sheetMappers.ts)
Tipos TypeScript: DadosFechamento, ClienteCarteira[], LancamentoCusto[], Vendedor[]
    ↓ (SheetsContext.connect())
Estado React temporário
    ↓ (DataContext — Benchmark Anual)
historicalDataMap: Record<"YYYY-MM", HistoricalSheetData>
    ↓ (useMemo merge + localStorage overrides)
Dados finais: fechamentos[], clientes[], lancamentos[], vendedores[]
    ↓ (useEquipeData, useInternoData)
Props para páginas React
    ↓
UI (pages/)
```

---

## 10. BENCHMARK ANUAL (DataContext.tsx)

O sistema usa o conceito de **Benchmark Anual**: em vez de uma única planilha "primária", o usuário cadastra até 12 planilhas (uma por mês) em Configurações.

### Funcionamento:
1. Usuário vai em `/settings` e cadastra o **Sheet ID** do Google Sheets de cada mês
2. `DataContext.addHistoricalSheet()` chama `loadHistoricalSheetData()` para carregar todos os dados daquela planilha
3. Dados salvos em `historicalDataMap: Record<"YYYY-MM", HistoricalSheetData>`
4. Lista de planilhas persistida em `localStorage['vdf_historical_sheets']`

### Fonte de dados para exibição:
| Dado | Fonte |
|---|---|
| `fechamentos[]` | `allFechamentos` = merge de todos `historicalDataMap[*].fechamentos` |
| `vendedores[]` | `historicalVendedores` = dedup por ID (mês mais recente vence) + `localVendedores` |
| `lancamentos[]` | `historicalLancamentos` = todos os meses concatenados + `localLancamentos` |
| `clientes[]` | `historicalClientes` = snapshot do mês mais recente |

### período (string "YYYY-MM"):
Formato da chave do `historicalDataMap`. Ex: `"2026-03"` = Março 2026.

### HistoricalSheet (tipo):
```typescript
interface HistoricalSheet {
  id: string       // Sheet ID do Google
  label: string    // "Março/2026"
  month: number    // 1-12
  year: number     // 2026
  monthLabel: string // "Março"
}
```

---

## 11. PERSISTÊNCIA EM LOCALSTORAGE

| Chave | Tipo | Conteúdo |
|---|---|---|
| `vdf_historical_sheets` | `HistoricalSheet[]` | Lista de planilhas do Benchmark Anual |
| `vdf_vendedores` | `Vendedor[]` | Edições locais de vendedores |
| `vdf_lancamentos` | `LancamentoCusto[]` | Lançamentos manuais (source='local') |
| `vdf_metas` | `MetaPeriodo[]` | Metas mensais definidas pelo usuário |
| `vdf_segment_overrides` | `SegmentOverride[]` | Ajustes manuais de segmento de EC |
| `vdf_custos_fixos` | `CustoOperacional[]` | Custos operacionais fixos/variáveis |
| `vdf_equipamentos` | `Equipamento[]` | Equipamentos parcelados |

**Service:** `localStorageService.ts` — funções genéricas `getAll<T>()`, `upsert<T>()`, `remove()`, `clear()`

---

## 12. PÁGINAS E ABAS DO SISTEMA

### 12.1 `/login` — LoginPage

**Arquivo:** `src/pages/Login.tsx`  
**Acesso:** Público (sem autenticação)

**Layout:** Split screen (50/50 lg, 100% mobile)
- Esquerda: branding dark (navy-700 `#0f161b`) com logo circular, nome "Venda Feita" (fonte Exo), lista de features, glow verde radial
- Direita: painel branco com botão "Entrar com Google" (OAuth2)

**Lógica:**
- Detecta `ENV.isConfigured`: se false, mostra alerta de configuração
- Redireciona automaticamente para `/equipe/dashboard` se já autenticado
- Botão Google usa `signIn()` do AuthContext

---

### 12.2 `/equipe/dashboard` — EquipeDashboard (Central de Comando)

**Arquivo:** `src/pages/equipe/Dashboard.tsx`  
**Hook principal:** `useEquipeData()`, `useInternoData()`, `useDataContext()`  
**Acesso:** Protegido (AuthGuard)

**Seções:**
1. **Header escuro** (bg-slate-800): nome da empresa, data atual, PeriodSelector
2. **Faixa de 3 KPIs principais**: Markup/Receita, ECs Ativos, Valor Líquido (com variação % vs anterior)
3. **Grid de 8 MiniKPI cards**: TPV Total, Markup POS, Margem %, ECs Ativos, Valor Líquido, Ticket/EC, Conta Digital, Descontos
4. **Gráfico de Evolução** (AreaChart Recharts): Markup POS + Valor Líquido — últimos 10 períodos
5. **Saúde da Carteira de ECs**: Total, Gerando receita, Sem receita (risco), Sem Conta Digital + distribuição por faixa de markup
6. **Diagnóstico Automático** (insights): até 4 cards com níveis crítico/atenção/positivo/info — gerados por `gerarInsights()`
7. **Banner de histórico** (quando > 1 período): link para Relatórios
8. **Equipe Comercial**: ranking dos vendedores com barra de progresso

**Seletor de período:** "Último período" | "Resultado Acumulado" | cada mês específico

**Modo Acumulado:** cria `fechamentoAcumulado` sintético somando todos os períodos; `ecsAtivos` e `tpvMedio` usam o snapshot do último mês.

**Custo efetivo calculado:** `calcCustosMensalEfetivo()` — inclui custos fixos + prorate trimestral/anual + únicos do período + parcelas de equipamentos.

**`valorLiquidoAjustado`** = `valorLiquido` + receitasLocais − despesasLocais − totalCustos

**Insights automáticos** gerados por `gerarInsights()`:
- Margem % (crítico < 1%, atenção < 1,5%, positivo ≥ 1,5%)
- Variação de markup vs período anterior
- ECs sem receita (crítico ≥ 5, atenção > 0)
- Oportunidades de Conta Digital (info ≥ 5)
- Redução de base de ECs
- Descontos > 15% do markup

---

### 12.3 `/equipe/ranking` — EquipeRanking

**Arquivo:** `src/pages/equipe/Ranking.tsx`  
**Hook principal:** `useEquipeData()`

**Seções:**
1. **Filtro de região** (select) + toggle Mensal/Acumulado
2. **Pódio Top 3** (grid 3 colunas): cards com medalha dourada/prata/bronze, avatar, faturamento, meta, % atingimento, barra de progresso
3. **Tabela ranking completo** (posição 4+): avatar, nome, região, faturamento, % atingimento (badge-success/warning/error), variação %

**`faturamentoMensal`** de cada vendedor: calculado em `useEquipeData()` somando `ticketMedio` de todos os clientes cujo `vendedor` bate com o nome do vendedor (normalizado lowercase).

**Atingimento meta:** `calcAtingimento(realizado, meta)` — 0 se meta = 0 (exibe "Sem meta").

---

### 12.4 `/equipe/comissionamento` — EquipeComissionamento

**Arquivo:** `src/pages/equipe/Comissionamento.tsx`  
**Hook principal:** `useEquipeData()`, `useInternoData()`

**Funcionalidade:** Calcula a comissão de cada vendedor com base em:
- `comissaoBase %` (do cadastro do vendedor)
- `bonus %` (se atingiu meta)
- Faturamento mensal do vendedor (soma dos ticketMedio dos clientes)

**Seções:**
1. Seletor de período
2. Cards de resumo: total de comissões, vendedores acima da meta
3. Lista de vendedores: ao clicar, painel de detalhe com detalhamento da comissão por EC
4. Exportação (ExportMenu)

---

### 12.5 `/interno/dre` — InternoDRE (DRE Gerencial)

**Arquivo:** `src/pages/interno/DRE.tsx`  
**Hook principal:** `useInternoData()`, `useDataContext()`

**Estrutura do DRE:**
```
RECEITAS OPERACIONAIS
  (+) Markup POS               ← markupPos
  (+) Comissão de Rede         ← comissaoRede
  (+) Repasses                 ← repasse
  (+) Receitas Manuais         ← lancamentos local/receita
  = RECEITA BRUTA

DEDUÇÕES
  (−) Cobr. Conta Digital      ← faturaDigital
  (−) Descontos do Período     ← descontos
  (−) Despesas Manuais         ← lancamentos local/despesa
  (−) Custos Operacionais      ← calcCustosMensalEfetivo()
  (−) Parcelas de Equipamentos ← equipamentos
  = TOTAL DEDUÇÕES

RESULTADO
  = VALOR LÍQUIDO AJUSTADO     ← receita bruta − deduções

INFORMATIVO (fora do DRE)
  (i) TPV Total                ← tpvTotal (volume processado pelos ECs)
  (i) Margem %                 ← markupPos / tpvTotal × 100
  (i) ECs Ativos               ← ecsAtivos
  (i) Ticket Médio por EC      ← markupPos / ecsAtivos
```

**ATENÇÃO:** TPV não é receita da empresa — é volume processado pelos ECs. A receita é o `markupPos` (spread % sobre o TPV).

**Seções da página:**
1. Header com PeriodSelector
2. Tabela DRE (modo período individual ou acumulado)
3. Gráfico de barras comparativo (BarChart Recharts): Markup POS, Valor Líquido, Deduções por período
4. Cards de contexto: Margem %, ECs Ativos, TPV

---

### 12.6 `/interno/projecao` — InternoProjecao

**Arquivo:** `src/pages/interno/Projecao.tsx`  
**Hook principal:** `useInternoData()`

**Funcionalidade:** Simula crescimento futuro com base nos dados históricos.

**Entradas do usuário:**
- Cenário de crescimento mensal (%)
- Investimento em novos ECs
- Horizonte de projeção (meses)

**Seções:**
1. Controles de cenário (sliders/inputs)
2. Gráfico de projeção (LineChart Recharts): realizado + projetado
3. Tabela de projeção mês a mês
4. Resumo: receita projetada, ROI
5. Cenários salvos (CRUD local)

---

### 12.7 `/interno/custos` — InternoCustos (Gestão Financeira)

**Arquivo:** `src/pages/interno/Custos.tsx`  
**Hook principal:** `useInternoData()`, `useDataContext()`

**Abas internas:**
1. **Lançamentos** — tabela paginada de todos os lançamentos (receitas/despesas) — Sheets + locais. Suporta: filtro por tipo/categoria/conta/período, adição manual (`TransactionForm`), edição e exclusão.
2. **Custos Fixos** — CRUD de `CustoOperacional` (Fixo, Variável, Financeiro, Fornecedor). Recorrências: único, mensal, trimestral, anual. Mostra custo mensal efetivo (com prorate).
3. **Equipamentos** — CRUD de `Equipamento`. Parcelamento com controle de parcelas pagas. Mostra custo mensal residual.

**CRUD:**
- Lançamentos Sheets: via `SheetsContext.addLancamento / updateLancamento / deleteLancamento` (escreve na planilha)
- Lançamentos locais: via `DataContext.saveLancamento / deleteLancamento` (localStorage)
- Custos/Equipamentos: sempre localStorage via `DataContext.saveCusto / deleteCusto / saveEquipamento / deleteEquipamento`

---

### 12.8 `/interno/carteira` — InternoCarteira

**Arquivo:** `src/pages/interno/Carteira.tsx`  
**Hook principal:** `useInternoData()`, `useDataContext()`

**Abas internas:**
1. **Carteira de ECs** — tabela de todos os clientes com: CNPJ, Nome, Segmento, TPV, Markup (Ticket), Margem, Conta Digital. Filtros por segmento, status, busca textual. Segmento pode ser sobrescrito manualmente (SegmentOverride).
2. **Saúde da Carteira** — distribuição por faixa de markup, ECs sem receita (risco), análise de churn, score de saúde.
3. **Lucratividade** — ranking de ECs por markup gerado, análise de concentração de receita, "regra dos 80/20".

**`getClientesPorPeriodo(periodo)`** — retorna snapshot de clientes de um período específico do `historicalDataMap`, com segment overrides e enriquecimento de `contaDigitalAtiva`.

**`contaDigitalAtiva`** — calculado em DataContext cruzando: nome do cliente (lowercase trim) ∈ `lancamentos.filter(l => l.categoria === 'Conta Digital').nomeCliente`

---

### 12.9 `/relatorios` — RelatoriosPage

**Arquivo:** `src/pages/Relatorios.tsx`  
**Hook principal:** `useInternoData()`, `useDataContext()`

**Seções do relatório gerado:**
1. **Cabeçalho**: logo empresa, período, data geração
2. **Resumo Executivo**: KPIs principais (TPV, Markup, Valor Líquido, ECs, Margem %)
3. **DRE Gerencial**: tabela completa receitas/deduções/resultado
4. **Evolução Histórica**: tabela de todos os períodos lado a lado
5. **Carteira de ECs**: tabela completa com métricas
6. **Equipe Comercial**: ranking + comissões
7. **Lançamentos**: tabela filtrada

**Exportação:**
- **PDF**: `exportElementToPDF()` — clona o DOM para `#vdf-pdf-root`, chama `window.print()` com CSS `@media print` (A4 portrait, margens 10mm×12mm). Gráficos Recharts renderizados nativamente como SVG.
- **Excel**: SheetJS — múltiplas planilhas (DRE, Fechamentos, Clientes, Lançamentos)
- **CSV**: dados tabulares como CSV

**IMPORTANTE:** O PDF usa `window.print()`, NÃO html2canvas. A estratégia com html2canvas foi descartada pois gerava 497 páginas em casos extremos.

---

### 12.10 `/parametrizacao` — ParametrizacaoPage → CadastroVendedoresPage

**Arquivo:** `src/pages/config/CadastroVendedores.tsx`  
**Hook principal:** `useDataContext()`

**Funcionalidade:** CRUD completo de vendedores.
- Listagem com tabela (ID, nome, região, meta mensal, comissão base, bônus)
- Adicionar novo vendedor (formulário inline)
- Editar vendedor existente
- Excluir vendedor (com `DeleteConfirmDialog`)
- Vendedores vêm do Benchmark Anual (Sheets) + edições locais (localStorage)

---

### 12.11 `/settings` — SettingsPage (Benchmark Anual)

**Arquivo:** `src/pages/Settings.tsx`  
**Hook principal:** `useDataContext()`

**Funcionalidade principal:**
- Grid de 12 meses × anos navegáveis (ChevronLeft/Right por ano)
- Cada "slot" de mês pode estar: vazio, em modo de adição (input de Sheet ID), ou conectado (verde, mostra ID truncado)
- Ao inserir um Sheet ID e confirmar: chama `addHistoricalSheet(id, month, year)` que carrega todos os dados daquela planilha
- Ao clicar lixeira: `removeHistoricalSheet(id)`
- Banner de carregamento durante `isLoadingHistorical`

**Seção secundária:** Preview de dados carregados (abas de fechamento encontradas, count de ECs, etc.)

---

### 12.12 `/logs` — Logs

**Arquivo:** `src/pages/Logs.tsx`  
**Funcionalidade:** Exibe log estruturado do sistema (erros, warnings, infos)

**Níveis:** DEBUG (gray) | INFO (blue) | WARN (yellow) | ERROR (red)  
**Filtros:** nível, texto livre  
**Dados:** gerados por `logger` (errorLogger.ts) — armazenados em memória durante a sessão

---

## 13. COMPONENTES REUTILIZÁVEIS

### PeriodSelector
```tsx
<PeriodSelector
  fechamentos={DadosFechamento[]}
  value="ultimo" | "acumulado" | "Mar2026"
  onChange={(v: string) => void}
/>
```
Renderiza select com opções: "Último período (Mar2026)" | "Resultado Acumulado" | cada período individual em ordem reversa.

### ExportMenu
Dropdown com opções de exportação: PDF, Excel, CSV. Props: dados, tipo de relatório, período.

### TransactionForm
Modal/inline form para adicionar/editar `LancamentoCusto`. Campos: data, descrição, categoria, tipo (receita/despesa), valor, conta.

### LoadingState
- `fullScreen`: spinner centralizado na tela inteira
- inline: spinner menor com mensagem
- `SkeletonCard`: placeholder animado para KPI cards
- `SkeletonTable`: placeholder animado para tabelas

### ConnectionStatus
Banner na parte superior do conteúdo. Exibe "Benchmark Anual: N meses conectados · último: Mar2026". Dispensável pelo usuário.

---

## 14. SERVIÇOS (src/services/)

### sheetsApi.ts
- `getSpreadsheetMetadata(sheetId)` → `{ title, sheets: SheetTab[] }`
- `readRange(range, sheetId)` → `(string | number)[][]`
- Autenticação via `getAccessToken()` — inclui em `Authorization: Bearer`
- Base URL: `https://sheets.googleapis.com/v4/spreadsheets`

### googleAuth.ts
- `initGoogleAuth()` — carrega GSI, inicializa com CLIENT_ID
- `signIn()` — abre popup OAuth2
- `signOut()` — revoga token
- `onAuthStateChange(callback)` — listener de mudança de estado
- `getAccessToken()` — retorna token atual

### sheetMappers.ts
Funções puras de transformação. Ver Seção 8 para detalhes.

**Função crítica:** `parseNumericValue(value)`:
- Input: string no formato BR ("R$ 28.758,68"), porcentagem ("1,05%"), negativo ("-R$ 4.888,80"), seta ("▲ 10.2%")
- Output: `number`
- Lógica: se tem vírgula → formato BR (remove pontos de milhar, troca vírgula por ponto decimal); se não tem vírgula → formato Anglo

### sheetsCrud.ts
Escrita na planilha (append/update/delete linhas).

### localStorageService.ts
```typescript
getAll<T>(key: string): T[]
upsert<T extends { id: any }>(key: string, item: T): void
remove(key: string, id: any): void
clear(key: string): void
```

### mergeStrategies.ts
- `mergeVendedores(fromSheets, fromLocal)` — local vence para o mesmo ID
- `mergeLancamentos(fromSheets, fromLocal)` — concat (ambos mantidos)
- `mergeSegmentOverrides(clientes, overrides)` — sobrescreve segmento

### exportService.ts
- `exportElementToPDF(element, fileName)` — print nativo do browser
- `exportToExcel(data, options)` — SheetJS
- `exportToCSV(data, options)` — texto separado por vírgulas

### ecAnalysis.ts
- `getECsSemReceita(clientes)` → `ClienteCarteira[]` com `ticketMedio === 0`
- `getOportunidadesContaDigital(clientes)` → ECs sem `contaDigitalAtiva`
- `getMarkupDistribution(clientes)` → distribuição por faixas de markup para o gráfico

### errorLogger.ts
Logger estruturado com níveis DEBUG/INFO/WARN/ERROR. Armazena em array em memória. Funções globais de `window.onerror` e `unhandledrejection` instaladas via `installGlobalHandlers()`.

---

## 15. UTILITÁRIOS (src/utils/)

### format.ts
- `formatCurrency(n)` → "R$ 28.758,68"
- `formatCurrencyShort(n)` → "R$ 28,8k" | "R$ 1,3M"
- `formatPercent(n)` → "1,05%"
- `calcAtingimento(realizado, meta)` → porcentagem (0 se meta=0)
- `periodoToDate(periodo)` → "DD/MM/AAAA" (último dia do mês)

### custos.ts
- `calcCustosMensalEfetivo(custos, periodo?)` → total mensal considerando recorrência
- `calcCustosMensalSemUnico(custos)` → sem custos únicos
- `dataPertenceAoPeriodo(data, periodo)` → boolean
- `labelRecorrencia(rec)` → string legível

---

## 16. DESIGN SYSTEM

### Paleta de Cores (Tailwind customizado)

```javascript
// tailwind.config.js
colors: {
  // Navy — sidebar e backgrounds escuros
  navy: {
    50:  '#e8eaeb',
    100: '#b6bcc0',
    200: '#8e979d',
    300: '#5d6b72',
    400: '#364e5c',
    500: '#1b2831',   // cards escuros
    600: '#141e25',
    700: '#0f161b',   // sidebar background (cor principal do site vendafeita.com)
    800: '#0a1014',
    900: '#060b0f',
  },
  // Emerald — verde primário da marca
  emerald: {
    50:  '#e6f7f2',
    100: '#b3e8d9',
    200: '#80d9c0',
    300: '#4dcba7',
    400: '#26bf95',
    500: '#00A573',   // ← CTA principal vendafeita.com (verde exato)
    600: '#008b61',
    700: '#006e4b',
    800: '#005038',
    900: '#003625',
  },
}
```

### CSS Custom Properties (:root)
```css
--vf-primary:      #00A573   /* verde CTA */
--vf-primary-dark: #008b61
--vf-primary-glow: rgba(0, 165, 115, 0.18)
--vf-dark:         #0f161b   /* sidebar/login dark */
--vf-dark-mid:     #1b2831
--vf-bg-light:     #f6fbfe   /* background geral das páginas */
--vf-bg-card:      #ffffff
--vf-border:       #e2ecf4
```

### Fontes
- **Exo** (classe `font-display`) — títulos, cabeçalhos, logo sidebar, nome no login
- **Inter** (classe `font-sans`, padrão) — corpo de texto, tabelas, labels

### Classes utilitárias (Tailwind @layer components)
```css
.card        → bg-white rounded-xl shadow-sm border border-gray-100 p-6
.card-hover  → igual + transition-shadow hover:shadow-md
.btn-primary → emerald-500, hover emerald-600
.btn-secondary → navy-500, hover navy-600
.btn-outline → border gray-300
.input-field → border gray-300, focus emerald-500
.badge-success → emerald-50/700
.badge-warning → amber-50/700
.badge-error   → red-50/700
```

---

## 17. ROTEAMENTO

```
/login                     → LoginPage (pública)
/                          → AuthGuard → Layout (Sidebar + Outlet)
  /                        → Navigate → /equipe/dashboard
  /equipe/dashboard        → EquipeDashboard
  /equipe/ranking          → EquipeRanking
  /equipe/comissionamento  → EquipeComissionamento
  /interno/dre             → InternoDRE
  /interno/projecao        → InternoProjecao
  /interno/custos          → InternoCustos
  /interno/carteira        → InternoCarteira
  /interno/transacoes      → Navigate → /interno/custos (legado)
  /interno/gestao-custos   → Navigate → /interno/custos (legado)
  /relatorios              → RelatoriosPage
  /parametrizacao          → ParametrizacaoPage → CadastroVendedoresPage
  /settings                → SettingsPage
  /logs                    → Logs
  *                        → Navigate → /
```

---

## 18. SIDEBAR — NAVEGAÇÃO

Módulos com cores diferenciadas:

| Módulo | Badge | Itens |
|---|---|---|
| **Equipe** (verde) | `bg-emerald-50 text-emerald-700` | Dashboard de Resultados, Ranking, Comissionamento |
| **Interno** (azul) | `bg-blue-50 text-blue-700` | DRE Gerencial, Projeção, Financeiro, Análise de Carteira |
| **Relatórios** (violeta) | `bg-violet-50 text-violet-700` | Relatório Completo |
| **Configuração** (laranja) | `bg-orange-50 text-orange-700` | Parametrização, Configurações |
| **Sistema** (cinza) | `bg-gray-100 text-gray-700` | Logs do Sistema |

Sidebar colapsa seções individualmente. Item ativo: `bg-emerald-500/15 text-emerald-400 border-l-2 border-emerald-500`.

Logo: imagem circular do framerusercontent CDN com fallback para ícone TrendingUp.

---

## 19. CONSTANTES GLOBAIS

```typescript
// constants/empresa.ts
NOME_EMPRESA = 'Comercial Bernardes'
PRECO_CONTA_DIGITAL = 29.90  // R$/mês por EC

// constants/categorias.ts
// Lista de categorias de lançamentos para o formulário
```

---

## 20. PROCEDURE DE DEPLOY MENSAL

Quando chega um novo fechamento mensal (ex: Abril/2026):

1. Baixar o XLSX do PagBank (Fechamento_Comercial_Bernardes_Abril_2026.xlsx)
2. Fazer upload para o Google Drive
3. No Drive: clicar com botão direito → "Abrir com Google Planilhas" (converte para formato nativo)
4. Copiar o **Sheet ID** da URL (o hash entre `/d/` e `/edit`)
5. No dashboard: ir para `/settings`
6. Clicar no slot de Abril/2026 → inserir o Sheet ID → confirmar
7. Sistema carrega automaticamente: fechamentos, ECs, repasses, descontos, conta digital
8. Verificar banner: "Benchmark Anual: X meses conectados · último: Abr2026"
9. Verificar DRE: TPV, Markup POS, Valor Líquido devem bater com o XLSX
10. Verificar Carteira: número de ECs ativos deve bater com o Resumo

**PROIBIDO:** datas hardcoded no código. Todos os períodos vêm de `extractPeriodoFromTab()`.

---

## 21. PONTOS CRÍTICOS E CUIDADOS

### 21.1 Busca de "descontos" no Resumo
Usar `"descontos do"` (com " do") em vez de `"desconto"` para evitar colisão com o cabeçalho de seção `"DESCONTOS & COBRANÇAS"` que aparece antes dos dados reais na planilha.

### 21.2 Linhas de TOTAL nas abas
As abas `MKP de POS` e `Repasses` têm uma linha de TOTAL ao final. O mapper rejeita qualquer linha onde alguma célula seja exatamente "TOTAL" ou comece com "TOTAL " + pontuação. Empresas como "Totaltech LTDA" NÃO são rejeitadas.

### 21.3 CNPJ numérico vs formatado
Planilhas de Jan/Fev têm CNPJ como número puro (14 dígitos). Mar+ podem ter formatado "59.813.357/0001-31". `normalizeCnpj()` normaliza para 14 dígitos sempre.

### 21.4 Data americana vs brasileira
Jan/Fev usam M/DD/YYYY. Mar+ usam DD/MM/YYYY. `normalizeDate()` detecta automaticamente: se primeiro número > 12 → DD/MM; se segundo > 12 → M/DD; ambos ≤ 12 → assume M/DD.

### 21.5 Formato da aba Descontos
Jan/Fev têm 6 colunas (Tipo e Descrição separados). Mar tem 5 colunas (Tipo e Descrição mesclados com pipe `|`). `mapRowsDescontos()` detecta o índice de VALOR dinamicamente lendo o header.

### 21.6 ticketMedio ≠ ticket médio por transação
O campo `ClienteCarteira.ticketMedio` armazena o **markup gerado por esse EC** (receita CB), NÃO o ticket médio por transação. Nome mantido por compatibilidade com o formato clássico mas semanticamente é "markup do EC".

### 21.7 TPV é informativo, não receita
`DadosFechamento.tpvTotal` é o volume processado pelos ECs. A receita da empresa é `markupPos`. A margem é `markupPos / tpvTotal`. O TPV não entra no DRE como receita.

### 21.8 Modo Acumulado — campos não acumuláveis
Em modo acumulado, `ecsAtivos` e `tpvMedio` usam o snapshot do **último mês** (não soma), pois são headcount/médias de estoque, não fluxos.

### 21.9 Planilha primária desativada para exibição
O `SheetsContext` ainda existe e pode ser chamado via `connect()`, mas o `DataContext` usa exclusivamente o Benchmark Anual (`historicalDataMap`) como fonte de dados para exibição. A propriedade `connectionStatus.connected` reflete se há planilhas históricas cadastradas, não se a planilha primária está conectada.

---

## 22. AUDITORIA DE DADOS — RESULTADOS VERIFICADOS

Auditoria realizada em 29/04/2026 comparando dados do dashboard vs planilhas XLSX originais:

| Período | ECs Ativos | TPV Total | Markup POS | Repasses | Conta Digital | Descontos | Valor Líquido |
|---|---|---|---|---|---|---|---|
| Jan/2026 | 56 | R$ 2.298.516,56 | R$ 24.521,84 | R$ 6.434,42 | R$ 1.166,10 | R$ 3.290,80 | R$ 26.499,36 |
| Fev/2026 | 59 | R$ 2.213.143,56 | R$ 23.374,44 | R$ 7.835,50 | R$ 1.196,00 | R$ 6.861,80 | R$ 23.152,14 |
| Mar/2026 | 65 | R$ 2.728.746,46 | R$ 28.758,68 | R$ 8.264,60 | R$ 1.046,50 | R$ 4.888,80 | R$ 31.366,10 |

**Status:** ✅ Todos os campos 100% corretos.

**Nota sobre Repasses:** A aba `Repasses` das planilhas de Jan e Fev apresenta ~R$ 178 a menos que o Resumo. Isso é uma inconsistência **nas planilhas PagBank**, não no sistema. O DRE usa corretamente os valores do Resumo.

---

## 23. ARQUIVO DE CONFIGURAÇÃO DO TAILWIND

```javascript
// tailwind.config.js
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: { navy: {...}, emerald: {...} },       // ver Seção 16
      fontFamily: {
        sans:    ['Inter', 'system-ui', 'sans-serif'],
        display: ['Exo', 'Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'vf-hero': 'linear-gradient(180deg, #0f161b 0%, rgba(0,165,115,0.05) 100%)',
      },
    },
  },
  plugins: [],
}
```

---

## 24. SCRIPTS NPM

| Script | Comando | Função |
|---|---|---|
| dev | `npm run dev` | Servidor de desenvolvimento (Vite, porta 5173) |
| build | `npm run build` | TypeScript check + build de produção em `dist/` |
| preview | `npm run preview` | Preview do build de produção |
| lint | `npm run lint` | ESLint |

---

*Fim da documentação técnica. Este documento cobre 100% da arquitetura, fluxo de dados, tipos, páginas, serviços e decisões de design do Venda Feita Dashboard v2.*
