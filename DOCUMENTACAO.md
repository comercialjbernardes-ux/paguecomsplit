# DOCUMENTAÇÃO TÉCNICA — Venda Feita (Repositório Completo)

> **Arquivo de memória do projeto.** Toda alteração no sistema deve ser refletida aqui.
> Última atualização: 2026-04-29
> Versão: 2.1.0

---

## ÍNDICE

1. [Visão Geral do Repositório](#1-visão-geral-do-repositório)
2. [Infraestrutura e Deploy](#2-infraestrutura-e-deploy)
3. [Dashboard v2 — Venda Feita React](#3-dashboard-v2--venda-feita-react)
   - 3.1 Stack e Configuração
   - 3.2 Estrutura de Diretórios
   - 3.3 Arquitetura de Dados (Contextos)
   - 3.4 Páginas e Rotas
   - 3.5 Serviços
   - 3.6 Hooks
   - 3.7 Componentes
   - 3.8 Tipos e Interfaces
   - 3.9 Utilitários e Constantes
   - 3.10 Sistema de Log de Erros
   - 3.11 Integração Google Sheets
4. [ProspectaEmpresa — Dashboard Flask](#4-prospectaempresa--dashboard-flask)
5. [ProspectaBet v1 — Dashboard Flask](#5-prospectabet-v1--dashboard-flask)
6. [Fluxo de Dados Completo](#6-fluxo-de-dados-completo)
7. [Variáveis de Ambiente e Credenciais](#7-variáveis-de-ambiente-e-credenciais)
8. [Guia de Desenvolvimento](#8-guia-de-desenvolvimento)
9. [Histórico de Alterações](#9-histórico-de-alterações)

---

## 1. Visão Geral do Repositório

**Repositório:** `https://github.com/comercialjbernardes-ux/Venda-feita.git`
**Branch principal:** `main`
**Localização no servidor:** `C:\Users\Administrator\Documents\venda feita\`

O repositório contém **três dashboards independentes** para a empresa Comercial Bernardes:

| Projeto | Tecnologia | Porta | URL Produção |
|---------|-----------|-------|-------------|
| `v2/` | React 19 + Vite 8 + TypeScript | Static (Caddy) | https://v2.otsolutions.cloud |
| `ProspectaEmpresa/` | Flask 3 + Python 3.12 | 5001 | https://empresa.otsolutions.cloud |
| `prospectabetv1/` | Flask 3 + Python 3.12 | 5002 | https://bets.otsolutions.cloud |

**Propósito de cada dashboard:**
- **v2**: Central de gestão financeira — visualiza dados da planilha Google Sheets, DRE, comissionamento de equipe, análise de carteira de clientes EC, projeções de crescimento.
- **ProspectaEmpresa**: Ferramenta de prospecção — busca e enriquece dados de empresas por CNAE/município via Minha Receita / CNPJá / BrasilAPI.
- **ProspectaBet**: Dashboard de operadoras de apostas regulamentadas — cataloga bets com dados de CNPJ, contato, URL, status de afiliados.

---

## 2. Infraestrutura e Deploy

### 2.1 Servidor

| Parâmetro | Valor |
|-----------|-------|
| Provedor | Contabo VPS |
| ID | vmi3266384 |
| IP Público | 66.94.102.216 |
| Região | United States (East) |
| OS | Windows Server |
| Acesso | RDP porta 3389 |

### 2.2 Reverse Proxy — Caddy 2.9.1

**Localização:** `C:\caddy\caddy.exe`
**Configuração:** `C:\caddy\Caddyfile`

```
v2.otsolutions.cloud {
    root * "C:/Users/Administrator/Documents/venda feita/v2/dist"
    file_server
    try_files {path} /index.html
    encode gzip
}

empresa.otsolutions.cloud {
    reverse_proxy 127.0.0.1:5001
}

bets.otsolutions.cloud {
    reverse_proxy 127.0.0.1:5002
}
```

- **HTTPS**: Auto-gerenciado via Let's Encrypt (HTTP-01 challenge)
- **Certificados**: Armazenados em `%APPDATA%\Caddy\acme\`
- **Renovação**: Automática (Caddy renova 30 dias antes do vencimento)

### 2.3 DNS (Hostinger)

Todos os subdomínios apontam para `66.94.102.216`:

| Subdomínio | Tipo | Destino |
|-----------|------|---------|
| v2 | A | 66.94.102.216 |
| empresa | A | 66.94.102.216 |
| bets | A | 66.94.102.216 |

### 2.4 Firewall

**Contabo (nível de rede):**

| Regra | Ação | Protocolo | Porta |
|-------|------|-----------|-------|
| HTTP / CADDY | ACCEPT | TCP | 80 |
| Caddy | ACCEPT | TCP | 443 |
| RDP | ACCEPT | TCP | 3389 |
| vite dev | ACCEPT | TCP | 5173 |
| Block all traffic | DROP | Any | Any |

**Windows Firewall (nível OS):**

| Regra | Ação | Protocolo | Porta |
|-------|------|-----------|-------|
| Caddy HTTP 80 | Allow Inbound | TCP | 80 |
| Caddy HTTPS 443 | Allow Inbound | TCP | 443 |

> ⚠️ **IMPORTANTE**: O Windows Firewall tem suas próprias regras independentes do Contabo. Ambas precisam estar configuradas para que o tráfego externo chegue ao Caddy.

### 2.5 Auto-start (inicialização automática)

**Script:** `C:\startup\start_all.bat`
**Registro:** `HKCU:\Software\Microsoft\Windows\CurrentVersion\Run\VendaFeitaStartup`
**Pasta Startup:** `%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup\`

Sequência de inicialização:
1. Aguarda 10s (rede subir)
2. Inicia **ProspectaEmpresa** na porta 5001
3. Aguarda 5s
4. Inicia **ProspectaBet** na porta 5002 (via `runpy` para compatibilidade com Python embeddable)
5. Aguarda 5s
6. Inicia **Caddy**

**Logs de serviço:**
- `C:\startup\logs\empresa.log`
- `C:\startup\logs\bets.log`
- `C:\startup\logs\caddy-err.log`

### 2.6 Python

**Versão:** 3.12.10 embeddable (instalação sem MSI — GPO bloqueou winget)
**Localização:** `C:\Users\Administrator\AppData\Local\Python312\`
**Motivo embeddable:** GPO da rede bloqueia instaladores MSI/winget
**Ajuste necessário:** `python312._pth` com `import site` habilitado (para pip funcionar)
**Pip instalado via:** `bootstrap_pip.py` (get-pip.py)

### 2.7 Build do v2

```powershell
cd "C:\Users\Administrator\Documents\venda feita\v2"
npm run build
# Gera: v2/dist/ (servido diretamente pelo Caddy)
```

> **Após cada alteração no v2**: rodar `npm run build` para atualizar o `dist/`. O Caddy serve diretamente da pasta `dist/`, então o novo build entra em produção imediatamente.

---

## 3. Dashboard v2 — Venda Feita React

### 3.1 Stack e Configuração

| Tecnologia | Versão | Papel |
|-----------|--------|-------|
| React | 19.2.4 | Framework UI |
| TypeScript | 6.0.2 | Tipagem estática |
| Vite | 8.0.4 | Build tool / Dev server |
| Tailwind CSS | 3.4.19 | Estilização utility-first |
| React Router DOM | 7.14.0 | Roteamento SPA |
| Recharts | 3.8.1 | Gráficos financeiros |
| Lucide React | 1.7.0 | Ícones |
| jsPDF + html2canvas | 4.2.1 / 1.4.1 | Exportação PDF |
| XLSX | 0.18.5 | Exportação Excel |

**Porta dev:** 5173 (Vite)
**Build output:** `v2/dist/`
**Alias TypeScript:** `@` → `./src`

**Scripts:**
```bash
npm run dev     # desenvolvimento (http://localhost:5173)
npm run build   # build produção (TypeScript + Vite)
npm run lint    # ESLint
```

### 3.2 Estrutura de Diretórios

```
v2/src/
├── main.tsx                      # Entry point — monta providers + ErrorBoundary
├── App.tsx                       # Roteamento com BrowserRouter
├── index.css                     # Estilos globais Tailwind
│
├── config/
│   ├── env.ts                    # Leitura tipada de VITE_* vars
│   └── sheets.ts                 # Mapeamento de abas/colunas + constantes da API
│
├── constants/
│   ├── categorias.ts             # Categorias de lançamentos (receita/despesa)
│   └── empresa.ts                # NOME_EMPRESA, PRECO_CONTA_DIGITAL
│
├── contexts/
│   ├── AuthContext.tsx           # Estado de autenticação Google OAuth2
│   ├── SheetsContext.tsx         # Conexão e dados brutos da planilha
│   ├── DataContext.tsx           # Dados unificados (Sheets + localStorage)
│   └── dataContextValue.ts      # Hook useDataContext()
│
├── hooks/
│   ├── useEquipeData.ts          # Dados do módulo Equipe (vendedores enriquecidos)
│   └── useInternoData.ts         # Dados do módulo Interno (fechamentos, DRE, etc.)
│
├── pages/
│   ├── Login.tsx                 # Página de login Google OAuth
│   ├── Settings.tsx              # Configurações: planilha, vendedores, exportação
│   ├── Relatorios.tsx            # Geração de relatórios (PDF/Excel)
│   ├── RelatorioExecutivo.tsx    # Relatório executivo consolidado
│   ├── ComparativoMensal.tsx     # Comparativo entre períodos
│   ├── Logs.tsx                  # Visualizador de log de erros do sistema
│   ├── Placeholder.tsx           # Página vazia (rotas em desenvolvimento)
│   │
│   ├── equipe/
│   │   ├── Dashboard.tsx         # Dashboard principal — KPIs + insights + equipe
│   │   ├── Ranking.tsx           # Ranking de vendedores
│   │   └── Comissionamento.tsx   # Cálculo de comissões
│   │
│   ├── interno/
│   │   ├── DRE.tsx               # DRE Gerencial (receitas, deduções, resultado)
│   │   ├── Projecao.tsx          # Projeção de crescimento com cenários
│   │   ├── Custos.tsx            # Custos e receitas por categoria
│   │   ├── Carteira.tsx          # Análise de carteira de clientes EC
│   │   ├── Transacoes.tsx        # Lançamentos manuais (CRUD)
│   │   └── GestaoCustos.tsx      # Custos operacionais + equipamentos
│   │
│   └── config/
│       ├── Parametrizacao.tsx    # Parametrização financeira
│       ├── CadastroVendedores.tsx # Cadastro de vendedores
│       └── RegrasComissao.tsx    # Regras de comissionamento
│
├── services/
│   ├── errorLogger.ts            # Sistema de logging persistente ⭐
│   ├── googleAuth.ts             # OAuth2 Google Identity Services
│   ├── sheetsApi.ts              # Wrapper da Google Sheets API v4
│   ├── sheetMappers.ts           # Transformação de dados da planilha → tipos TS
│   ├── localStorageService.ts    # CRUD tipado no localStorage
│   ├── aiAgent.ts                # Agente de análise financeira (Claude API)
│   ├── ecAnalysis.ts             # Análise de ECs (sem receita, oportunidades)
│   ├── exportService.ts          # Exportação PDF/Excel
│   ├── mergeStrategies.ts        # Estratégias de merge Sheets+local
│   └── sheetsCrud.ts             # CRUD legado na planilha (deprecated)
│
├── components/
│   ├── ErrorBoundary.tsx         # React class ErrorBoundary ⭐
│   ├── AuthGuard.tsx             # Proteção de rotas (redireciona para /login)
│   ├── Layout.tsx                # Container: Sidebar + Outlet + ConnectionStatus
│   ├── Sidebar.tsx               # Navegação lateral com seções colapsáveis
│   ├── ErrorBanner.tsx           # Banner de erro reutilizável
│   ├── ConnectionStatus.tsx      # Status da conexão com a planilha
│   ├── LoadingState.tsx          # Estado de carregamento (spinner)
│   ├── TransactionForm.tsx       # Formulário de lançamento manual
│   ├── DeleteConfirmDialog.tsx   # Dialog de confirmação de exclusão
│   └── ExportMenu.tsx            # Menu de exportação PDF/Excel
│
├── types/
│   └── index.ts                  # Todas as interfaces TypeScript
│
└── utils/
    ├── format.ts                 # Formatação: moeda, percentual, datas
    └── custos.ts                 # Cálculos de custos operacionais (prorate)
```

### 3.3 Arquitetura de Dados (Contextos)

A árvore de providers é montada em `main.tsx`:

```
ErrorBoundary
  └── AuthProvider          (autenticação Google)
        └── SheetsProvider  (dados brutos da planilha)
              └── DataProvider (dados unificados)
                    └── App (roteamento)
```

#### AuthContext (`contexts/AuthContext.tsx`)

**Estado:** `user: GoogleUser | null`, `token: string | null`, `isAuthenticated`, `isLoading`, `error`

**Responsabilidade:** Inicializa o Google Identity Services (`googleAuth.ts`), mantém o token OAuth e o perfil do usuário. Gerencia refresh automático de token.

**API exposta:**
```typescript
useAuth() → { user, token, isAuthenticated, isLoading, error, signIn, signOut }
```

#### SheetsContext (`contexts/SheetsContext.tsx`)

**Estado:** `connectionStatus`, `fechamentos`, `vendedores`, `lancamentos`, `clientes`, `isLoading`, `error`

**Responsabilidade:** Conecta à planilha Google Sheets, lê as abas de fechamento (padrão: `Fechamento_*` ou `Resumo`), vendedores, lançamentos e clientes. Expõe CRUD para lançamentos.

**API exposta:**
```typescript
useSheetsData() → {
  connectionStatus: SheetConnectionStatus
  fechamentos: DadosFechamento[]
  vendedores: Vendedor[]
  lancamentos: LancamentoCusto[]
  clientes: ClienteCarteira[]
  isLoading, error
  connect(sheetId?)
  refetch()
  addLancamento(data), updateLancamento(lancamento, data), deleteLancamento(lancamento)
}
```

**Identificação de abas de fechamento:** regex `SHEET_TAB_PATTERN = /^(Fechamento[_\s-]|Resumo$)/i`

#### DataContext (`contexts/DataContext.tsx`)

**Estado:** Tudo do SheetsContext + `custos`, `equipamentos`, `historicalSheets`, `historicalDataMap`, `isLoadingHistorical`, metas, cenários

**Responsabilidade:** Camada de unificação — combina dados da planilha com dados persistidos no localStorage (`vdf_*`). Gerencia planilhas históricas para comparativo mensal.

**Chaves localStorage** — via `LocalKey` type em `localStorageService.ts`:
| Chave | Conteúdo |
|-------|---------|
| `vdf_vendedores` | Cadastro local de vendedores |
| `vdf_lancamentos` | Lançamentos manuais |
| `vdf_metas` | Metas por período |
| `vdf_segment_overrides` | Segmento manual por cliente |
| `vdf_regras_comissao` | Regras de comissionamento |
| `vdf_projecao_base` | Base de projeção de crescimento |
| `vdf_custos_fixos` | Custos operacionais fixos |
| `vdf_equipamentos` | Equipamentos parcelados |
| `vdf_ai_apikey` | API Key do agente Claude |
| `vdf_ai_model` | Modelo de IA selecionado |
| `vdf_ai_historico` | Histórico de consultas IA |

**Chaves diretas** (não via localStorageService):
| Chave | Origem | Conteúdo |
|-------|--------|---------|
| `vdf_error_logs` | `errorLogger.ts` | Logs de erro do sistema ⭐ |
| `vdf_historical_sheets` | `DataContext.tsx` | IDs e metadados de planilhas históricas |

**API exposta:**
```typescript
useDataContext() → {
  // Tudo do SheetsContext +
  custos: CustoOperacional[]
  equipamentos: Equipamento[]
  historicalSheets: HistoricalSheet[]
  historicalDataMap: Record<string, HistoricalSheetData>
  isLoadingHistorical: boolean
  addHistoricalSheet(id, month, year) → Promise<{ success, error?, label? }>
  removeHistoricalSheet(id)
  // CRUD: addCusto, updateCusto, deleteCusto
  // CRUD: addEquipamento, updateEquipamento, deleteEquipamento
  // updateMeta(periodo, valor)
  // addCenario, deleteCenario
  // setSegmentOverride, removeSegmentOverride
}
```

### 3.4 Páginas e Rotas

| Rota | Componente | Módulo | Descrição |
|------|-----------|--------|-----------|
| `/login` | `LoginPage` | — | Login Google OAuth (pública) |
| `/` | → redirect | — | Redireciona para `/equipe/dashboard` |
| `/equipe/dashboard` | `EquipeDashboard` | Equipe | Dashboard principal: KPIs, insights automáticos, gráficos, ranking |
| `/equipe/ranking` | `EquipeRanking` | Equipe | Ranking de vendedores com métricas detalhadas |
| `/equipe/comissionamento` | `EquipeComissionamento` | Equipe | Cálculo de comissões por vendedor e produto |
| `/interno/dre` | `InternoDRE` | Interno | DRE Gerencial: receitas, deduções, resultado líquido |
| `/interno/projecao` | `InternoProjecao` | Interno | Projeção de crescimento com cenários de crescimento/investimento |
| `/interno/custos` | `InternoCustos` | Interno | Custos e receitas por categoria com filtros |
| `/interno/carteira` | `InternoCarteira` | Interno | Análise de carteira de clientes EC por segmento |
| `/interno/transacoes` | `InternoTransacoes` | Interno | CRUD de lançamentos manuais (receita/despesa) |
| `/interno/gestao-custos` | `InternoGestaoCustos` | Interno | Custos operacionais + equipamentos parcelados |
| `/relatorios` | `RelatoriosPage` | Relatórios | Geração de relatórios PDF/Excel |
| `/comparativo` | `ComparativoMensalPage` | Relatórios | Comparativo entre períodos históricos |
| `/relatorio-executivo` | `RelatorioExecutivoPage` | Relatórios | Relatório executivo consolidado |
| `/parametrizacao` | `ParametrizacaoPage` | Config | Parametrização financeira |
| `/settings` | `SettingsPage` | Config | Configurações: planilha, vendedores, metas |
| `/logs` | `Logs` | Sistema | Visualizador de logs de erro ⭐ |
| `*` | → redirect | — | Fallback → `/` |

**Todas as rotas (exceto `/login`) são protegidas pelo `AuthGuard`** — redireciona para `/login` se não autenticado.

#### Dashboard Principal (`/equipe/dashboard`) — Lógica de Negócio

O `EquipeDashboard` é a página mais complexa do sistema:

1. **Seletor de período**: escolhe o `fechamento` a exibir (padrão: último)
2. **KPIs calculados**:
   - TPV Total, Markup POS, Resultado Líquido
   - Margem % = Markup / TPV
   - Ticket médio por EC = Markup / ECs Ativos
   - Receita Conta Digital = ECs com conta ativa × R$ 29,90
3. **Insights automáticos** (função `gerarInsights`): gera até 4 insights classificados como `critico | atencao | positivo | info` baseados em: margem, variação de markup, ECs sem receita, oportunidades de conta digital, variação de base de ECs, percentual de descontos
4. **Custo mensal efetivo**: soma custos operacionais (prorate de recorrência) + parcelas de equipamentos ativos
5. **Ranking de equipe**: vendedores ordenados por `faturamentoMensal` (calculado em `useEquipeData` somando `ticketMedio` dos clientes EC por vendedor)

#### DRE Gerencial (`/interno/dre`) — Estrutura Contábil

```
RECEITAS OPERACIONAIS
  + Markup POS          (planilha: f.markupPos)
  + Comissão de Rede    (planilha: f.comissaoRede)
  + Repasse             (planilha: f.repasse)
  + Receitas Locais     (lançamentos manuais source='local' do período)
= TOTAL RECEITAS

DEDUÇÕES
  - Fatura Conta Digital  (planilha: f.faturaDigital)
  - Descontos do Período  (planilha: f.descontos ou aba 'Descontos')
  - Deduções Locais       (lançamentos manuais source='local' despesa do período)
= TOTAL DEDUÇÕES

RESULTADO
  Valor Líquido = Total Receitas - Total Deduções
  Custos Operacionais (prorate)
  EBITDA Estimado = Resultado - Custos

MÉTRICAS
  Margem % = Markup POS / TPV Total
  Ticket Médio EC = Markup / ECs Ativos
```

> **Nota:** TPV Total é informativo (volume processado pelos ECs), NÃO entra no DRE como receita da empresa.

### 3.5 Serviços

#### `errorLogger.ts` ⭐ Sistema de Log de Erros

**Tipos:**
```typescript
type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'CRITICAL'

interface LogEntry {
  id: string           // UUID
  timestamp: string    // ISO 8601
  level: LogLevel
  message: string
  location: string     // ex: "SheetsContext.connect"
  error?: { name, message, stack? }
  context?: Record<string, unknown>
  url?: string         // capturado em ERROR e CRITICAL
}
```

**API:**
```typescript
logger.debug(message, location, context?)
logger.info(message, location, context?)
logger.warn(message, location, context?)
logger.error(message, location, error?, context?)
logger.critical(message, location, error?, context?)

getLogs(): LogEntry[]
clearLogs(): void
exportLogs(): string  // JSON formatado
installGlobalHandlers()  // window.onerror + unhandledrejection
```

**Comportamento:**
- Persiste no localStorage (`vdf_error_logs`), rolling buffer de 200 entradas
- Output no console com emoji por nível: `🔵 DEBUG | 🟢 INFO | 🟡 WARN | 🔴 ERROR | 💀 CRITICAL`
- `installGlobalHandlers()` chamado em `main.tsx` antes do render
- Nunca lança exceção (todo código interno tem try/catch)

**Visualização:** Acessar `/logs` no dashboard (requer autenticação)

#### `googleAuth.ts` — OAuth2

**Fluxo:**
1. `initGoogleAuth()` → inicializa Google Identity Services com timeout de 10s
2. `signIn()` → solicita token ao usuário (popup OAuth)
3. `handleTokenResponse()` → valida token, busca perfil, notifica listeners
4. `scheduleTokenRefresh()` → renova automaticamente antes do vencimento

**Escopos:**
- `https://www.googleapis.com/auth/spreadsheets` (leitura + escrita na planilha)
- `https://www.googleapis.com/auth/userinfo.profile`
- `https://www.googleapis.com/auth/userinfo.email`

**Token de acesso:** Armazenado em memória (variável local), nunca no localStorage.

#### `sheetsApi.ts` — Google Sheets API v4

| Função | Método HTTP | Descrição |
|--------|------------|-----------|
| `getSpreadsheetMetadata(sheetId?)` | GET | Título e lista de abas |
| `readRange(range, sheetId?)` | GET | Lê valores de um range |
| `readMultipleRanges(ranges[], sheetId?)` | GET | Lê múltiplos ranges de uma vez |
| `appendRows(range, values, sheetId?)` | POST | Adiciona linhas ao final |
| `updateRange(range, values, sheetId?)` | PUT | Atualiza range específico |
| `deleteRows(tabSheetId, start, end, sheetId?)` | POST | Remove linhas |

**Estratégia de autenticação:**
- Leitura: sempre adiciona `key=GOOGLE_API_KEY` na URL; se logado, também envia `Authorization: Bearer <token>`
- Escrita: requer `Bearer token` obrigatoriamente; lança erro se não autenticado

#### `sheetMappers.ts` — Transformação de Dados

Converte linhas brutas da planilha (arrays de strings) nos tipos TypeScript do sistema:

| Função | Entrada | Saída |
|--------|---------|-------|
| `mapRowsToFechamento(rows, periodo)` | `string[][]` aba fechamento | `DadosFechamento` |
| `mapRowsToVendedores(rows)` | `string[][]` aba Vendedores | `Vendedor[]` |
| `mapRowsToLancamentos(rows)` | `string[][]` aba Lancamentos | `LancamentoCusto[]` |
| `mapRowsToClientes(rows)` | `string[][]` aba Clientes | `ClienteCarteira[]` |
| `mapRowsMkpPos(rows)` | `string[][]` aba MKP de POS | `ClienteCarteira[]` |
| `mapRowsRepasses(rows)` | `string[][]` aba Repasses | `LancamentoCusto[]` |
| `mapRowsDescontos(rows)` | `string[][]` aba Descontos | `LancamentoCusto[]` |
| `mapRowsCobrDigital(rows)` | `string[][]` aba Cobr. Conta Digital | `ClienteCarteira[]` |
| `extractPeriodoFromTab(title, rows)` | Nome da aba + rows | `string` (ex: "Mar2026") |

#### `localStorageService.ts` — Persistência

```typescript
getAll<T>(key: LocalKey): T[]           // lê array; retorna [] se vazio/erro
getScalar<T>(key: LocalKey): T | null   // lê valor único
setScalar<T>(key: LocalKey, value: T): void
upsert<T extends { id }>(key, item): void  // insert ou update por id
remove(key, id): void
clear(key): void
hasData(key): boolean
```

**Chave `LocalKey`:** union type de todas as chaves `vdf_*` válidas.

#### `aiAgent.ts` — Agente de Análise Financeira

Integra com a Claude API (Anthropic) para geração de insights financeiros em linguagem natural. Recebe dados do DRE e retorna análise textual.

#### `ecAnalysis.ts` — Análise de Estabelecimentos Comerciais

```typescript
getECsSemReceita(clientes, lancamentos, periodo): number
getOportunidadesContaDigital(clientes): number
getMarkupDistribution(clientes): DistributionData[]
```

#### `exportService.ts` — Exportação

Gera relatórios em PDF (jsPDF + html2canvas) e Excel (XLSX) a partir dos dados do DataContext.

### 3.6 Hooks

#### `useEquipeData()`

```typescript
→ { vendedores: Vendedor[], dadosMensais: DadosMensais[], regioes: string[], isLoading, error }
```

**Lógica de enriquecimento:** Para cada vendedor, soma o `ticketMedio` de todos os clientes cujo campo `vendedor` bate com o `nome` do vendedor (normalizado: lowercase + trim) → campo `faturamentoMensal`.

#### `useInternoData()`

```typescript
→ {
  fechamentos, fechamentoAtual, lancamentos, clientes,
  categorias, contas, segmentos,
  totalReceitasLocais, totalDespesasLocais,
  getLocaisPorPeriodo(periodo) → { receitas, despesas },
  isLoading, error
}
```

**Lógica de fechamentoAtual:** Último elemento de `fechamentos[]` (já ordenado cronologicamente pelo DataContext via `sortFechamentos`). NÃO usa `localeCompare` — abreviações PT têm ordem alfabética ≠ cronológica.

**Lógica de lançamentos locais:** Filtrados por período via `dataPertenceAoPeriodo(data, periodo)` que compara mês+ano entre a data `DD/MM/AAAA` e o período `MesAAAA`.

### 3.7 Componentes

| Componente | Responsabilidade |
|-----------|-----------------|
| `ErrorBoundary` | Captura crashes de render React → `logger.critical` → UI de fallback |
| `AuthGuard` | Verifica `isAuthenticated`; redireciona para `/login` se falso |
| `Layout` | Container: `<Sidebar /> + <ConnectionStatus /> + <Outlet />` |
| `Sidebar` | Navegação lateral com 5 seções: Equipe, Interno, Relatórios, Configuração, Sistema |
| `ConnectionStatus` | Banner no topo indicando status da conexão com a planilha |
| `ErrorBanner` | Exibe mensagem de erro com botão "Tentar novamente" |
| `LoadingState` | Spinner de carregamento (pode ser `fullScreen`) |
| `TransactionForm` | Formulário modal para adicionar/editar lançamento manual |
| `DeleteConfirmDialog` | Dialog de confirmação de exclusão |
| `ExportMenu` | Dropdown com opções de exportação PDF/Excel |

**Sidebar — seções:**
- **Equipe** (verde): Dashboard de Resultados, Ranking, Comissionamento
- **Interno** (azul): DRE, Projeção, Custos, Carteira, Lançamentos, Gestão de Custos
- **Relatórios** (violeta): Gerar Relatórios, Comparativo Mensal, Relatório Executivo
- **Configuração** (laranja): Parametrização, Configurações
- **Sistema** (cinza): Logs do Sistema

### 3.8 Tipos e Interfaces

**Módulo Equipe:**
```typescript
Vendedor           // id, nome, regiao, avatar, faturamentoMensal, metaMensal, comissaoBase, bonus
ProdutoVenda       // produto, valorVendido, pctComissao
Cliente            // nome, cidade, volumeMensal, status
CarteiraVendedor   // produtos[], clientes[]
DadosMensais       // mes, realizado, meta
```

**Módulo Interno:**
```typescript
LinhaDRE           // id, descricao, mesAtual, acumulado, tipo (receita|despesa|custo|subtotal|destaque)
LancamentoCusto    // id, data, descricao, categoria, tipo, valor, conta, source (sheets|local)
LancamentoManual   // id, descricao, valor, tipo, data
DadoProjecao       // mes, realizado|null, projetado
ClienteCarteira    // id, cnpj?, nome, segmento, vendedor, volumeTotal, ticketMedio, status, frequencia
CustoOperacional   // id, data, descricao, categoria, valor, recorrencia (unico|mensal|trimestral|anual)
Equipamento        // id, dataCompra, descricao, valorTotal, numeroParcelas, valorParcela, parcelasPagas
CenarioSalvo       // id, nome, crescimento, investimento, data
MetaPeriodo        // periodo, meta, editedAt
SegmentOverride    // clienteId, segmento
```

**Dados da Planilha (raw):**
```typescript
DadosFechamento    // periodo, ecsAtivos, tpvTotal, tpvMedio, markupPos, taxaMargem,
                   // comissaoRede, repasse, faturaDigital, descontos, valorLiquido,
                   // variacaoEcs?, variacaoTpv?, variacaoMarkup?, variacaoMargem?
```

**Auth e Sheets:**
```typescript
GoogleUser         // id, name, email, picture
SheetTab           // sheetId, title, index
SheetConnectionStatus  // connected, sheetId, title, tabs[], lastSync
```

### 3.9 Utilitários e Constantes

#### `utils/format.ts`

| Função | Entrada | Saída | Exemplo |
|--------|---------|-------|---------|
| `formatCurrency(n)` | number | string | `R$ 1.234,56` |
| `formatCurrencyShort(n)` | number | string | `R$ 1,2M` / `R$ 850K` |
| `formatPercent(n, decimals?)` | number | string | `12,5%` |
| `formatNumber(n)` | number | string | `1.234.567` |
| `calcAtingimento(real, meta)` | number, number | number | `87.3` (%) |
| `getStatusBadgeClass(status)` | string | string | `badge-success` |
| `getChartColor(index)` | number | string | `#00C896` |
| `periodoToDate(periodo)` | string | string | `Mar2026` → `01/03/2026` |
| `parseDateBR(data)` | string | Date | `01/03/2026` → `Date` |

#### `utils/custos.ts`

| Função | Descrição |
|--------|-----------|
| `calcCustosMensalEfetivo(custos, periodo?)` | Calcula total mensal efetivo com prorate: mensal=integral, trimestral=÷3, anual=÷12, único=só no mês/ano da data |
| `calcCustosMensalSemUnico(custos)` | Mesmo sem custos únicos (para exibições sem período específico) |
| `dataPertenceAoPeriodo(data, periodo)` | Verifica se `DD/MM/AAAA` está no período `MesAAAA` |
| `labelRecorrencia(recorrencia)` | `'trimestral'` → `'trimestral (÷3/mês)'` |

#### `constants/categorias.ts`

**Receita:** Vendas POS, Comissão de Rede, Repasse, Bonificação, Outros
**Despesa:** Folha, Marketing, Infraestrutura, Impostos, Fornecedores, Aluguel, Fretes e Logística, Tecnologia, Outros

#### `constants/empresa.ts`

```typescript
NOME_EMPRESA = 'Comercial Bernardes'
PRECO_CONTA_DIGITAL = 29.90  // R$/mês por EC
```

#### `config/sheets.ts`

- `SHEET_TAB_PATTERN`: regex para identificar abas de fechamento
- `COL_FECHAMENTO`, `COL_VENDEDORES`, `COL_LANCAMENTOS`, `COL_CLIENTES`: índices de colunas (0-based)
- `COL_MKP_POS`, `COL_REPASSES`, `COL_DESCONTOS`, `COL_COBR_DIGITAL`: abas da planilha Comercial Bernardes
- `SHEETS_API_BASE`, `SHEETS_SCOPE`, `PROFILE_SCOPE`: constantes da API

### 3.10 Sistema de Log de Erros ⭐

Implementado em 2026-04-29. Cobertura completa:

| Ponto de Captura | Tipo | Localização |
|-----------------|------|-------------|
| Crashes de render React | CRITICAL | `ErrorBoundary.componentDidCatch` |
| Erros JS não capturados | CRITICAL | `window.onerror` (global) |
| Promises rejeitadas | CRITICAL | `window.unhandledrejection` (global) |
| Falha total de conexão planilha | ERROR | `SheetsContext.connect` |
| Falha ao carregar planilha histórica | ERROR | `DataContext.addHistoricalSheet` |
| Erro de rede por aba individual | WARN | `SheetsContext.connect` (loop por aba) |
| Erros OAuth2 | WARN/ERROR | `googleAuth.*` |
| Erros de localStorage | WARN | `localStorageService.*` |

**Acessar logs:** https://v2.otsolutions.cloud/logs (requer login)

**Exportar para diagnóstico:** botão "Exportar JSON" na página `/logs`

### 3.11 Integração Google Sheets

**Planilha padrão:** `1KTRmSWudADXNz6ncJ_ITusdCy_5RDzCV` (Comercial Bernardes)

**Credenciais configuradas em `v2/.env`:**
```
VITE_GOOGLE_CLIENT_ID=314011137540-t0tqf5shdgjc9b7kug7hl1mb61h9io19.apps.googleusercontent.com
VITE_GOOGLE_API_KEY=AIzaSyComIFnqQsAO3uhv1DNt_ocYBrhHpjYCro
VITE_SHEET_ID=1KTRmSWudADXNz6ncJ_ITusdCy_5RDzCV
```

> ⚠️ O arquivo `.env` está no `.gitignore` — nunca é commitado. Em um novo servidor, precisa ser criado manualmente antes do `npm run build`.

**Estrutura esperada da planilha:**

| Aba | Conteúdo | Mapeamento |
|-----|---------|-----------|
| `Fechamento_*` ou `Resumo` | Métricas mensais | `COL_FECHAMENTO` + `METRICAS_FECHAMENTO` |
| `Vendedores` | Cadastro de consultores | `COL_VENDEDORES` |
| `Lancamentos` | Lançamentos de caixa | `COL_LANCAMENTOS` |
| `Clientes` | Carteira de ECs | `COL_CLIENTES` |
| `MKP de POS` | Markup por EC (Comercial Bernardes) | `COL_MKP_POS` |
| `Repasses` | Repasses por EC | `COL_REPASSES` |
| `Descontos` | Descontos concedidos | `COL_DESCONTOS` |
| `Cobr. Conta Digital` | ECs com conta digital | `COL_COBR_DIGITAL` |

---

## 4. ProspectaEmpresa — Dashboard Flask

**Localização:** `C:\Users\Administrator\Documents\venda feita\ProspectaEmpresa\`
**URL Produção:** https://empresa.otsolutions.cloud
**Porta:** 5001

### 4.1 Stack

| Tecnologia | Versão | Papel |
|-----------|--------|-------|
| Flask | ≥ 2.3.0 | Framework web |
| Requests | ≥ 2.31.0 | HTTP para APIs externas |
| Python | 3.12.10 | Runtime |

### 4.2 Estrutura

```
ProspectaEmpresa/
├── app.py          # Servidor Flask (rotas + lógica)
├── templates/
│   └── index.html  # Frontend HTML/JS
├── static/
│   ├── app.js      # Lógica frontend
│   └── style.css   # Estilos
└── requirements.txt
```

### 4.3 Rotas da API

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/` | Serve index.html |
| GET | `/api/buscar` | Busca empresas via Minha Receita por CNAE/município (assíncrono) |
| GET | `/api/buscar/status/<id>` | Status de busca assíncrona (polling) |
| GET | `/api/cnpj/<cnpj>` | Enriquece CNPJ: CNPJá → BrasilAPI → ReceitaWS (fallback) |
| GET | `/api/cnaes` | Lista de CNAEs para autocomplete |
| GET | `/api/municipios/<uf>` | Municípios de uma UF |
| GET | `/api/stats` | KPIs da sessão atual |

### 4.4 Funcionalidades

- **Busca por CNAE + Município**: consulta a API Minha Receita e retorna empresas do segmento
- **Enriquecimento de CNPJ**: consulta CNPJá, fallback BrasilAPI, fallback ReceitaWS
- **Retry automático**: em caso de rate limit (429)
- **Cache em memória**: resultados de CNPJs e listas de municípios
- **Jobs assíncronos**: buscas longas rodam em background com TTL 30min
- **KPIs de sessão**: contagem de buscas, CNPJs enriquecidos

### 4.5 Inicialização

```powershell
# Automático via start_all.bat:
python app.py  # cwd: ProspectaEmpresa/
```

---

## 5. ProspectaBet v1 — Dashboard Flask

**Localização:** `C:\Users\Administrator\Documents\venda feita\prospectabetv1\`
**URL Produção:** https://bets.otsolutions.cloud
**Porta:** 5002

### 5.1 Stack

| Tecnologia | Versão | Papel |
|-----------|--------|-------|
| Flask | ≥ 3.0.0 | Framework web |
| Requests | ≥ 2.31.0 | HTTP |
| BeautifulSoup4 | ≥ 4.12.0 | HTML parsing |
| Pandas | ≥ 2.0.0 | Manipulação de dados |
| Playwright | ≥ 1.40.0 | Scraping headless |
| openpyxl | ≥ 3.1.0 | Excel |
| python-whois | ≥ 0.9.4 | Consulta WHOIS |
| curl_cffi | ≥ 0.6.0 | HTTP com bypass de bot detection |

### 5.2 Estrutura

```
prospectabetv1/
├── app.py                # Servidor Flask (rotas + lógica)
├── url_health.py         # Worker daemon de validação de URLs
├── pipeline.py           # Orquestrador de coleta (email + CNPJ + afiliados)
├── csv_sync.py           # Sincronização com CSV
├── afiliados_health.py   # Validação de URLs de afiliados por EC
├── coletar_afiliados.py  # Coleta de links de afiliados
├── coletar_bets.py       # Coleta de dados das operadoras de apostas
├── enriquecer_base.py    # Funções de enriquecimento de dados
├── enriquecer_cnpj.py    # Enriquecimento via APIs de CNPJ
├── validar_regime.py     # Validação de regime regulatório
├── templates/
│   └── index.html        # Frontend HTML/JS
├── static/
│   ├── app.js            # Lógica frontend
│   └── style.css         # Estilos
├── dados/
│   ├── bets_enriquecidas.json  # Cache principal (gerado pelo pipeline.py)
│   ├── overrides.json          # Edições manuais persistidas
│   └── bets_com_emails.csv     # Fallback se JSON não existir
└── requirements.txt
```

### 5.3 Rotas da API

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/` | Serve index.html |
| GET | `/api/dados` | Retorna todas as bets com overrides aplicados |
| GET | `/api/stats` | KPIs: total bets, ECs com afiliados, URLs validadas |
| GET | `/api/municipios/<uf>` | Municípios onde há operadoras cadastradas |
| GET | `/api/url-health` | Status de validação de URLs (worker url_health) |
| GET | `/api/csv-sync-status` | Status da sincronização com o CSV |
| POST | `/api/csv-sync-agora` | Força sincronização imediata com CSV |
| POST | `/api/recarregar` | Recarrega dados do arquivo JSON principal |
| POST | `/api/enriquecer` | Executa pipeline de enriquecimento (CNPJ + emails + afiliados) |
| POST | `/api/editar` | Salva edição manual de uma bet (body: `{cnpj, campo, valor}`) |

### 5.4 Funcionalidades

#### Dashboard
- Lista operadoras de apostas regulamentadas no Brasil
- Filtros por UF, município, status de URL, presença de afiliados
- Campos por empresa: razão social, CNPJ, marca, URL, email de contato, UF, município, observação

#### Edição Manual
- Campos editáveis: `email_contato`, `url`, `marca`, `razao_social`, `cnpj`, `uf`, `municipio`, `observacao`
- Persistidos em `dados/overrides.json`
- Aplicados em tempo real sobre os dados do JSON principal

#### `url_health.py` — Validação Contínua de URLs

Worker daemon rodando em paralelo ao Flask:
- A cada **10s** (TICK_SEGUNDOS), valida as **10** URLs mais antigas (URLS_POR_TICK)
- **5 threads** paralelas (WORKERS)
- Estratégia: HEAD first; fallback GET se HEAD rejeitado (403/405/501)
- **Statuses:** `ok | redirect | erro_http | erro_conexao | erro_ssl | erro_dns | timeout | erro`
- **Re-check interval:** 180s entre validações da mesma URL
- **Auto-aplicar redirects:** Se `AUTO_APLICAR_REDIRECT_PERMANENTE=True`, grava redirects 301/308 como override automático

#### `pipeline.py` — Coleta e Enriquecimento

```bash
python pipeline.py                     # coleta emails + enriquece CNPJ
python pipeline.py --limite 10         # teste com 10 primeiras empresas
python pipeline.py --so-cnpj           # só enriquece CNPJ
python pipeline.py --reiniciar         # zera checkpoint
python pipeline.py --csv arquivo.csv   # usa CSV local
```

**Saídas:**
- `dados/bets_enriquecidas.json` — cache principal para o dashboard
- `bets_com_emails.csv` — CSV legado
- `relatorio.txt` — resumo da coleta
- `checkpoint.json` — permite retomada de coleta interrompida
- `coleta.log` — log completo

**Workers:** 5 (email), 3 (CNPJ — rate limit), 4 (afiliados)

### 5.5 Inicialização

```powershell
# Automático via start_all.bat (necessário runpy por Python embeddable):
set PYTHONPATH=. && set PORT=5002 && python -c "import sys,os,runpy;..."
```

> ⚠️ **Problema conhecido**: Se `dados/bets_enriquecidas.json` não existir, `/api/dados` retorna `[]`. Rodar `python pipeline.py` primeiro para gerar o arquivo.

---

## 6. Fluxo de Dados Completo

### v2 — Fluxo de leitura de dados

```
Google Sheets API v4
        ↓ (fetchWithAuth com API Key + Bearer token)
    sheetsApi.ts
        ↓ (readRange, getSpreadsheetMetadata)
    SheetsContext.tsx
        ↓ (mapRowsTo* via sheetMappers.ts)
    DataContext.tsx
        ↓ (merge com localStorage)
    useEquipeData() / useInternoData()
        ↓
    Pages (Dashboard, DRE, etc.)
```

### v2 — Fluxo de escrita de dados

```
Pages (TransactionForm, GestaoCustos, etc.)
        ↓
    DataContext.tsx (CRUD functions)
        ├── localStorageService.ts (dados locais)
        └── SheetsContext.tsx → sheetsApi.ts (dados na planilha)
```

### v2 — Fluxo de autenticação

```
Usuário clica "Entrar com Google"
        ↓
    googleAuth.signIn()
        ↓
    Google Identity Services (popup OAuth)
        ↓
    handleTokenResponse()
        ↓
    fetchUserProfile() → GoogleUser
        ↓
    AuthContext.setUser() / setToken()
        ↓
    AuthGuard: isAuthenticated = true → acesso liberado
```

---

## 7. Variáveis de Ambiente e Credenciais

### v2 (`v2/.env`) — NÃO commitado

```bash
VITE_GOOGLE_CLIENT_ID=314011137540-t0tqf5shdgjc9b7kug7hl1mb61h9io19.apps.googleusercontent.com
VITE_GOOGLE_API_KEY=AIzaSyComIFnqQsAO3uhv1DNt_ocYBrhHpjYCro
VITE_SHEET_ID=1KTRmSWudADXNz6ncJ_ITusdCy_5RDzCV
```

> **Recuperar:** Obtido no Google Cloud Console → APIs & Services → Credentials
> **Projeto GCP:** Associado ao email `comercial.jbernardes@gmail.com`

### ProspectaEmpresa e ProspectaBet — sem .env

Configurações hardcoded em `app.py` ou via variáveis de ambiente do sistema.

---

## 8. Guia de Desenvolvimento

### 8.1 Novo servidor — Configuração do zero

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/comercialjbernardes-ux/Venda-feita.git "venda feita"
   ```

2. **Python (se GPO bloquear MSI):**
   - Baixar `python-3.12.10-embed-amd64.zip`
   - Extrair em `%LOCALAPPDATA%\Python312\`
   - Habilitar `import site` no `python312._pth`
   - Instalar pip via `get-pip.py`
   - `pip install flask requests beautifulsoup4 pandas playwright lxml python-whois openpyxl curl_cffi`

3. **Node.js:** Instalar via `https://nodejs.org`

4. **v2 — instalar dependências e build:**
   ```bash
   cd "venda feita/v2"
   npm install
   # Criar .env com as credenciais Google (seção 7)
   npm run build
   ```

5. **Caddy:** Baixar `caddy.exe`, criar `Caddyfile`, executar

6. **Windows Firewall:** Adicionar regras inbound para portas 80 e 443

7. **Contabo Firewall:** Configurar regras HTTP/HTTPS/RDP e atribuir ao VPS

8. **Auto-start:** Criar `C:\startup\start_all.bat` e registrar em HKCU

### 8.2 Fluxo de desenvolvimento — v2

```bash
cd "venda feita/v2"
npm run dev                   # servidor dev em localhost:5173
# ... fazer alterações ...
npm run build                 # build produção
git add v2/...
git -c user.name="Vendafeita" -c user.email="comercial.jbernardes@gmail.com" commit -m "..."
git push origin main
# O dist/ já está em produção (Caddy serve diretamente)
```

### 8.3 Sempre após alterações no v2

1. Rodar `npm run build` — atualiza `v2/dist/`
2. Atualizar este arquivo `DOCUMENTACAO.md` com as mudanças
3. Commit e push

### 8.4 Convenções do projeto

- **Localização no logger:** usar `'NomeContexto.nomeFunção'` (ex: `'SheetsContext.connect'`)
- **Dados da planilha:** sempre via `sheetMappers.ts` — não parsear rows diretamente nas páginas
- **Valores negativos:** usar `Math.abs()` ao somar despesas — usuário pode inserir com sinal negativo
- **Período:** formato `"Mar2026"` (3 letras mês PT + 4 dígitos ano)
- **Datas:** formato `"DD/MM/AAAA"` em todo o sistema
- **LocalStorage:** usar apenas chaves do tipo `LocalKey` (`vdf_*`) via `localStorageService.ts`
- **Erros:** usar `logger.*` em vez de `console.warn/error` em todos os arquivos

### 8.5 Leitura do log de erros

- **Em produção:** Acessar https://v2.otsolutions.cloud/logs
- **Exportar:** Botão "Exportar JSON" → arquivo `vdf_logs_*.json`
- **Limpar:** Botão "Limpar Logs" (requer confirmação)
- **Programático:** `localStorage.getItem('vdf_error_logs')` no console do browser

---

## 9. Histórico de Alterações

> Registre aqui toda alteração relevante no sistema.

### 2026-04-29

**feat(v2): Sistema de Log de Erros**
- Criado `src/services/errorLogger.ts`: singleton de logging com 5 níveis, rolling buffer 200 entradas, handlers globais
- Criado `src/components/ErrorBoundary.tsx`: class component React
- Criada `src/pages/Logs.tsx`: visualizador com filtros, busca, export JSON
- Integrado em `main.tsx` (ErrorBoundary + installGlobalHandlers)
- Adicionada rota `/logs` em `App.tsx` e link no `Sidebar.tsx`
- Substituídos todos os `console.warn/error` por `logger.*` em: `googleAuth.ts`, `localStorageService.ts`, `SheetsContext.tsx`, `DataContext.tsx`
- Adicionado `logger.error` nos catch blocks de falha total de conexão

**infra: HTTPS/SSL com Let's Encrypt**
- Corrigido Caddyfile removendo prefixo `http://` (habilitando auto-HTTPS)
- Adicionadas regras Windows Firewall inbound para portas 80 e 443 (causa raiz do bloqueio)
- Certificados Let's Encrypt emitidos para os 3 domínios

**infra: Configuração inicial do servidor Contabo**
- Python 3.12.10 embeddable instalado (GPO bloqueou MSI/winget)
- Caddy 2.9.1 configurado como reverse proxy
- Scripts de auto-start configurados (HKCU registry + Startup folder)
- Resolvido conflito de porta (ambos Flask usavam 5001) — ProspectaBet usa PORT env var

---

*Este documento é a memória técnica do projeto. Mantenha-o sempre atualizado após qualquer alteração.*
