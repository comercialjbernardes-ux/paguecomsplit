# Prospector Bets

Dashboard de inteligência comercial para bets regulamentadas no Brasil.
Dados oficiais: Ministério da Fazenda / Secretaria de Prêmios e Apostas.

---

## O que faz

- Lista todas as **bets regulamentadas** (fonte: CSV oficial do gov.br)
- **Coleta emails** de contato via scraping dos sites
- **Enriquece** os dados com informações de CNPJ (porte, capital social, situação)
- **Monitora saúde das URLs** em tempo real (sites ativos, fora do ar, redirecionados)
- **Sincroniza com o CSV oficial** a cada 6 horas automaticamente
- **Dashboard web** com filtros, gráficos, exportação CSV/XLSX e edição manual

---

## Pré-requisitos

- Python 3.11+
- pip

```bash
pip install -r requirements.txt
```

### Dependências opcionais (para coleta com JavaScript)
```bash
playwright install chromium
```

---

## Estrutura do projeto

```
projeto bet/
├── app.py              # Servidor Flask — dashboard web
├── pipeline.py         # Orquestra coleta completa (emails + CNPJ)
├── coletar_bets.py     # Scraper de emails dos sites das bets
├── enriquecer_cnpj.py  # Consulta BrasilAPI para dados de CNPJ
├── coletar_afiliados.py# Scraper de links de afiliados
├── url_health.py       # Worker de validação contínua de URLs (10s/tick)
├── csv_sync.py         # Worker de sync com CSV oficial do gov.br (6h/ciclo)
├── validar_regime.py   # Utilitário de validação de regime tributário
├── requirements.txt    # Dependências Python
├── static/
│   ├── app.js          # Lógica do dashboard (filtros, tabela, gráficos)
│   └── style.css       # Estilos
├── templates/
│   └── index.html      # Template Flask
└── dados/
    └── overrides.json  # Edições manuais persistidas (versionado)
```

### Arquivos gerados (não versionados)
```
dados/bets_enriquecidas.json  # Base principal — gerada pelo pipeline
dados/url_health.json         # Estado de saúde das URLs
dados/csv_sync_status.json    # Status da última sincronização
checkpoint.json               # Progresso do pipeline
bets_com_emails.csv           # Exportação CSV
```

---

## Como usar

### 1. Rodar o pipeline completo (primeira vez)
```bash
python pipeline.py
```
Baixa o CSV do gov.br, coleta emails dos 184 sites e enriquece com dados de CNPJ.
Tempo estimado: 10–20 min.

### 2. Subir o dashboard
```bash
python app.py
```
Acesse: **http://localhost:5000**

O dashboard já sobe com:
- Worker de saúde de URLs (valida 10 URLs a cada 10s)
- Worker de sincronização com CSV do gov.br (a cada 6h)

### 3. Atualizar dados sem reiniciar
No dashboard: clique em **⟳ Recarregar**  
Para forçar sync com CSV: clique em **⟳ Sincronizar CSV**

---

## Funcionalidades do dashboard

| Feature | Descrição |
|---|---|
| KPIs em tempo real | Total de bets, com/sem email, URLs ativas/inativas |
| Filtros | Marca, status de email, UF, município, porte, saúde da URL |
| Edição inline | Clique em qualquer célula de email, URL ou link para editar |
| Indicador de saúde | 🟢 ativa · 🟡 redirect · 🔴 erro · ⚪ não checada |
| Badges | INATIVA (URL fora do ar) · REMOVIDA (saiu do CSV oficial) |
| Exportação | CSV e XLSX com dados filtrados |
| Gráficos | Porte da empresa, status de email, bets por UF |

---

## Variáveis de ambiente (opcionais)

Nenhuma configuração obrigatória — tudo funciona out-of-the-box.

---

## Contribuindo

1. Edite o código
2. Reinicie o Flask (`python app.py`) — debug mode com hot-reload ativo
3. Dados manuais são persistidos em `dados/overrides.json` (versionado)
4. Logs de coleta em `coleta.log` (não versionado)
