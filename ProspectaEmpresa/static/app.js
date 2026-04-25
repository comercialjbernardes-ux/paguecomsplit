/**
 * app.js — ProspectaEmpresa
 * Módulos: SearchService, FilterPanel, ResultsTable, CompanyDetailModal,
 *          ExportModule, KPI cards, Paginação, Ordenação.
 *
 * Reutiliza padrões do projeto base Prospector Bets:
 *  - Estado global: todosOsDados, dadosFiltrados, paginaAtual, tamanhoPagina, colunaOrdem
 *  - Funções: aplicarFiltrosLocais, renderizarTabela, renderizarPaginacao, exportarCSV, exportarXLSX
 *  - Paginação com reticências (paginasVisiveis)
 *  - Exportação com SheetJS (XLSX) e CSV com BOM UTF-8
 */

'use strict';

// ---------------------------------------------------------------------------
// Estado global
// ---------------------------------------------------------------------------

let todosOsDados   = [];   // todos os resultados retornados pela última busca
let dadosFiltrados = [];   // subconjunto após filtros locais (razão social etc.)
let paginaAtual    = 1;
let tamanhoPagina  = 25;
let colunaOrdem    = '';
let ordemAsc       = true;
let jobAtual       = null; // id do job assíncrono em andamento
let pollingTimer   = null; // setInterval do polling de status

// ---------------------------------------------------------------------------
// Inicialização
// ---------------------------------------------------------------------------

document.addEventListener('DOMContentLoaded', () => {
  carregarNaturezas();

  // Permite buscar pressionando Enter nos campos de filtro
  document.querySelectorAll('.filter-input, input[type="text"], input[type="number"], input[type="date"]')
    .forEach(el => {
      el.addEventListener('keydown', ev => {
        if (ev.key === 'Enter') iniciarBusca();
      });
    });

  // Liga o botão X do modal
  const btnFechar = document.getElementById('modal-close-btn');
  if (btnFechar) btnFechar.addEventListener('click', () => fecharModal());

  // Liga o clique no overlay (fora do card) para fechar
  const overlay = document.getElementById('modal-overlay');
  if (overlay) {
    overlay.addEventListener('click', ev => {
      if (ev.target === overlay) fecharModal();
    });
  }

  // Atualiza hint do município ao mudar a UF
  const selUF = document.getElementById('f-uf');
  const hintMun = document.getElementById('municipio-hint');
  if (selUF && hintMun) {
    selUF.addEventListener('change', () => {
      hintMun.textContent = selUF.value
        ? 'Selecione após a busca para filtrar'
        : 'Selecione uma UF primeiro';
    });
  }
});

// ---------------------------------------------------------------------------
// SearchService — filtra CNAEs e inicia buscas
// ---------------------------------------------------------------------------

/**
 * Guarda todas as opções originais do select de CNAE (carregadas via Jinja2).
 * Preenchido na primeira chamada de filtrarOpcoesCnae().
 */
let _todasOpcoesCnae = null;

/**
 * Filtra as opções do select de CNAE pelo texto digitado.
 * Funciona 100% no cliente — sem chamada à API.
 */
function filtrarOpcoesCnae(termo) {
  const sel = document.getElementById('f-cnae');

  // Inicializa cache com as opções originais (excluindo "Todos os segmentos")
  if (!_todasOpcoesCnae) {
    _todasOpcoesCnae = [...sel.options].slice(1).map(o => ({
      value: o.value,
      text:  o.textContent,
    }));
  }

  const t = (termo || '').toLowerCase().trim();
  const valorAtual = sel.value;

  sel.innerHTML = '<option value="">Todos os segmentos</option>';

  const filtradas = t.length < 2
    ? _todasOpcoesCnae
    : _todasOpcoesCnae.filter(o => o.text.toLowerCase().includes(t));

  filtradas.forEach(o => {
    const opt = document.createElement('option');
    opt.value = o.value;
    opt.textContent = o.text;
    sel.appendChild(opt);
  });

  // Reaplica a seleção anterior se ainda existir na lista filtrada
  if (filtradas.some(o => o.value === valorAtual)) {
    sel.value = valorAtual;
  }
}

/**
 * Carrega naturezas jurídicas únicas dos resultados em memória.
 */
async function carregarNaturezas() {
  try {
    const resp = await fetch('/api/stats');
    const stats = await resp.json();
    preencherSelect('f-natureza', stats.naturezas || []);
  } catch (e) {
    // Silencioso — será preenchido após a primeira busca
  }
}

/**
 * Inicia uma busca de empresas. Coleta todos os parâmetros dos filtros
 * e chama /api/buscar. Se retornar job_id, inicia polling.
 */
async function iniciarBusca() {
  const cnpj      = document.getElementById('f-cnpj').value.trim();
  const uf        = document.getElementById('f-uf').value;
  const municipio = document.getElementById('f-municipio').value;
  const cnae      = document.getElementById('f-cnae').value;
  const situacao  = document.getElementById('f-situacao').value;
  const porte     = document.getElementById('f-porte').value;
  const natureza  = document.getElementById('f-natureza').value;
  const dataDE    = document.getElementById('f-data-de').value;
  const dataATE   = document.getElementById('f-data-ate').value;
  const capMin    = document.getElementById('f-capital-min').value;
  const capMax    = document.getElementById('f-capital-max').value;

  // Monta querystring
  const params = new URLSearchParams();
  if (cnpj)      params.set('cnpj', cnpj);
  if (uf)        params.set('uf', uf);
  if (municipio) params.set('municipio', municipio);
  if (cnae)      params.set('cnae', cnae);
  if (situacao)  params.set('situacao', situacao);
  if (porte)     params.set('porte', porte);
  if (natureza)  params.set('natureza_juridica', natureza);
  if (dataDE)    params.set('data_abertura_de', dataDE);
  if (dataATE)   params.set('data_abertura_ate', dataATE);
  if (capMin)    params.set('capital_min', capMin);
  if (capMax)    params.set('capital_max', capMax);

  // Valida: pelo menos um filtro deve estar preenchido
  if (![...params.values()].some(v => v)) {
    alert('Preencha ao menos um filtro para iniciar a busca.');
    return;
  }

  // Avisa quando a busca é muito ampla (só UF, sem CNAE nem município).
  // Buscas assim retornam uma amostra aleatória de um universo de milhões.
  if (uf && !cnae && !municipio && !cnpj) {
    const ok = confirm(
      `Atenção: buscar apenas por UF (${uf}) sem CNAE ou município retorna uma amostra ` +
      `aleatória de até 1.000 empresas de um universo de milhões.\n\n` +
      `Para resultados mais precisos, adicione também o CNAE (segmento) ou o município.\n\n` +
      `Deseja continuar mesmo assim?`
    );
    if (!ok) return;
  }

  // Para qualquer polling anterior
  pararPolling();
  mostrarLoading(true);
  exibirProgresso(true, 'Iniciando busca...');

  try {
    const resp = await fetch(`/api/buscar?${params.toString()}`);
    const data = await resp.json();

    if (!data.ok) {
      alert('Erro: ' + (data.erro || 'Erro desconhecido.'));
      mostrarLoading(false);
      exibirProgresso(false);
      return;
    }

    // Salva parâmetros para uso no "Carregar mais"
    parametrosUltimaBusca = params.toString();

    // Busca por CNPJ é síncrona — resultado imediato
    if (data.dados) {
      processarResultados(data.dados);
      return;
    }

    // Busca por filtros — polling do job assíncrono
    if (data.job_id) {
      jobAtual = data.job_id;
      iniciarPolling(data.job_id, false);
    }

  } catch (err) {
    console.error('Erro ao iniciar busca:', err);
    alert('Erro de conexão: ' + err.message);
    mostrarLoading(false);
    exibirProgresso(false);
  }
}

/**
 * Inicia polling do status de um job assíncrono.
 * acumular=true: adiciona resultados aos existentes (botão "Carregar mais").
 * acumular=false: substitui os resultados (nova busca).
 */
function iniciarPolling(jobId, acumular = false) {
  let tentativas = 0;
  const MAX_TENTATIVAS = 120; // timeout de ~180s (buscas longas com 10 páginas)

  pollingTimer = setInterval(async () => {
    tentativas++;

    if (tentativas > MAX_TENTATIVAS) {
      pararPolling();
      mostrarLoading(false);
      exibirProgresso(false);
      alert('A busca demorou mais do que o esperado. Tente novamente.');
      return;
    }

    try {
      const resp = await fetch(`/api/buscar/status/${jobId}`);
      const data = await resp.json();

      if (!data.ok) {
        pararPolling();
        mostrarLoading(false);
        exibirProgresso(false);
        alert('Erro no job: ' + (data.erro || 'Erro desconhecido.'));
        return;
      }

      // Atualiza label com contagem em tempo real (o backend atualiza total por página)
      const dots = '.'.repeat((tentativas % 3) + 1);
      const parcial = data.total > 0 ? ` — ${data.total} encontradas até agora` : '';
      document.getElementById('progress-label').textContent =
        `Buscando empresas${dots}${parcial}`;

      if (data.status === 'done') {
        pararPolling();
        const novos = data.dados || [];
        // No modo acumular, junta com os dados existentes
        const dadosFinal = acumular ? [...todosOsDados, ...novos] : novos;
        processarResultados(dadosFinal, data.cursor, data.has_more);
      } else if (data.status === 'error') {
        pararPolling();
        mostrarLoading(false);
        exibirProgresso(false);
        alert('Erro na busca: ' + (data.erro || 'Erro desconhecido.'));
      }
      // status === 'pending' ou 'running' → continua polling

    } catch (err) {
      console.warn('Erro no polling:', err);
    }
  }, 1500);
}

/**
 * Para o polling em andamento.
 */
function pararPolling() {
  if (pollingTimer) {
    clearInterval(pollingTimer);
    pollingTimer = null;
  }
  jobAtual = null;
}

// Cursor da última busca — usado pelo botão "Carregar mais"
let cursorProximo = null;
let temMais = false;
let parametrosUltimaBusca = null;

/**
 * Processa os resultados recebidos: salva em memória, atualiza KPIs e tabela.
 */
function processarResultados(dados, cursor = null, hasMore = false) {
  todosOsDados = dados;
  dadosFiltrados = [...todosOsDados];
  cursorProximo = cursor;
  temMais = hasMore;

  // Aplica filtro de texto local (razão social) se preenchido
  const razao = document.getElementById('f-razao').value.trim().toLowerCase();
  if (razao) {
    dadosFiltrados = todosOsDados.filter(r =>
      (r.razao_social || '').toLowerCase().includes(razao) ||
      (r.nome_fantasia || '').toLowerCase().includes(razao)
    );
  }

  paginaAtual = 1;
  atualizarKPIs();
  renderizarTabela();
  preencherNaturezas();
  mostrarLoading(false);
  exibirProgresso(false);
  atualizarBotaoCarregarMais();
}

/**
 * Exibe ou oculta o botão "Carregar mais" conforme disponibilidade de mais páginas.
 */
function atualizarBotaoCarregarMais() {
  let btn = document.getElementById('btn-carregar-mais');
  if (!btn) {
    btn = document.createElement('div');
    btn.id = 'btn-carregar-mais';
    btn.style.cssText = 'text-align:center;padding:16px 0';
    btn.innerHTML = `<button class="btn btn-ghost" onclick="carregarMais()" style="padding:10px 32px">
      &#8595; Carregar mais empresas
    </button><p style="font-size:0.72rem;color:var(--text-muted);margin-top:6px">Buscando próximas 1.000 empresas</p>`;
    const paginacao = document.getElementById('pagination');
    paginacao?.parentNode?.insertBefore(btn, paginacao.nextSibling);
  }
  btn.style.display = temMais ? 'block' : 'none';
}

/**
 * Carrega mais resultados usando o cursor da última busca.
 */
async function carregarMais() {
  if (!cursorProximo || !parametrosUltimaBusca) return;
  const btn = document.querySelector('#btn-carregar-mais button');
  if (btn) { btn.disabled = true; btn.textContent = '⟳ Carregando...'; }

  const params = new URLSearchParams(parametrosUltimaBusca);
  params.set('cursor', cursorProximo);

  try {
    const resp = await fetch(`/api/buscar?${params.toString()}`);
    const data = await resp.json();
    if (!data.ok) { alert('Erro ao carregar mais: ' + (data.erro || '')); return; }

    // Inicia polling para o novo job — acumula nos dados existentes
    jobAtual = data.job_id;
    iniciarPolling(data.job_id, /* acumular= */ true);
  } catch (e) {
    alert('Erro: ' + e.message);
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = '↓ Carregar mais empresas'; }
  }
}

// ---------------------------------------------------------------------------
// KPI Cards
// ---------------------------------------------------------------------------

/**
 * Recalcula e atualiza os KPI cards com base em dadosFiltrados.
 */
function atualizarKPIs() {
  const total       = dadosFiltrados.length;
  const comEmail    = dadosFiltrados.filter(r => r.email).length;
  const comTelefone = dadosFiltrados.filter(r => r.telefone).length;
  const ativas      = dadosFiltrados.filter(r =>
    (r.situacao_cadastral || '').toLowerCase().includes('ativa')
  ).length;
  const capitalTotal = dadosFiltrados.reduce((s, r) => s + (r.capital_social || 0), 0);

  document.getElementById('kpi-total').textContent     = total.toLocaleString('pt-BR');
  document.getElementById('kpi-email').textContent     = comEmail.toLocaleString('pt-BR');
  document.getElementById('kpi-telefone').textContent  = comTelefone.toLocaleString('pt-BR');
  document.getElementById('kpi-ativas').textContent    = ativas.toLocaleString('pt-BR');
  document.getElementById('kpi-capital').textContent   = formatarBRL(capitalTotal);
}

// ---------------------------------------------------------------------------
// FilterPanel — filtros locais aplicados sobre todosOsDados
// ---------------------------------------------------------------------------

/**
 * Aplica filtros locais (razão social, capital, situação, porte) sobre todosOsDados.
 * Chamado pelo campo de texto "Razão Social / Nome Fantasia" com debounce.
 */
function aplicarFiltrosLocais() {
  const razao = document.getElementById('f-razao').value.trim().toLowerCase();
  const cnae  = (document.getElementById('f-cnae')?.value || '').replace(/\D/g, '');

  dadosFiltrados = todosOsDados.filter(r => {
    // Filtro de texto livre (razão social + nome fantasia)
    if (razao) {
      const rs = (r.razao_social || '').toLowerCase();
      const nf = (r.nome_fantasia || '').toLowerCase();
      if (!rs.includes(razao) && !nf.includes(razao)) return false;
    }
    // Garante que apenas empresas com o CNAE como atividade PRINCIPAL passam.
    // Evita falsos positivos vindos de CNAEs secundários.
    // Guard: empresas sem CNAE cadastrado (principal vazio) nunca passam o filtro
    // (sem o guard, cnae.startsWith('') seria sempre true e elas passariam).
    if (cnae) {
      const principal = (r.cnae_principal || '').replace(/\D/g, '');
      if (!principal || (!principal.startsWith(cnae) && !cnae.startsWith(principal))) return false;
    }
    return true;
  });

  paginaAtual = 1;
  atualizarKPIs();
  renderizarTabela();
}

/**
 * Limpa todos os filtros e resultados.
 */
function limparTudo() {
  // Limpa campos de filtro
  ['f-cnpj', 'f-cnae-busca', 'f-data-de', 'f-data-ate', 'f-capital-min', 'f-capital-max', 'f-razao']
    .forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });

  ['f-uf', 'f-municipio', 'f-cnae', 'f-situacao', 'f-porte', 'f-natureza']
    .forEach(id => { const el = document.getElementById(id); if (el) el.selectedIndex = 0; });

  // Limpa dados e variáveis de paginação
  todosOsDados = [];
  dadosFiltrados = [];
  paginaAtual = 1;
  cursorProximo = null;
  temMais = false;
  parametrosUltimaBusca = null;
  pararPolling();

  // Reseta UI
  document.getElementById('table-wrapper').style.display = 'none';
  document.getElementById('pagination').style.display    = 'none';
  document.getElementById('empty-state').style.display   = 'none';
  document.getElementById('loading').style.display       = 'none';
  document.getElementById('progress-container').style.display = 'none';
  document.getElementById('table-count').textContent =
    'Nenhuma busca realizada. Use os filtros ao lado.';
  // Oculta o botão "Carregar mais" que fica fora do table-wrapper
  const btnMais = document.getElementById('btn-carregar-mais');
  if (btnMais) btnMais.style.display = 'none';

  // Reseta KPIs
  ['kpi-total', 'kpi-email', 'kpi-telefone', 'kpi-ativas', 'kpi-capital']
    .forEach(id => { document.getElementById(id).textContent = '—'; });
}

// ---------------------------------------------------------------------------
// Cascata UF → Município
// Os dados vêm de MUNICIPIOS_DATA (variável JS embutida no HTML pelo servidor).
// Zero chamadas assíncronas — funciona imediatamente ao trocar a UF.
// ---------------------------------------------------------------------------

/**
 * Preenche o select de município com as cidades da UF selecionada.
 * Usa MUNICIPIOS_DATA (pré-carregado no servidor e embutido no HTML).
 * Se a UF não estiver em cache, faz fallback via fetch.
 */
async function atualizarMunicipios() {
  const uf  = document.getElementById('f-uf').value;
  const sel = document.getElementById('f-municipio');

  // Reseta o dropdown
  sel.innerHTML = '<option value="">Todos os municípios</option>';
  if (!uf) return;

  // 1) Tenta dados já embutidos no HTML (caminho rápido — sem rede)
  const dados = (typeof MUNICIPIOS_DATA !== 'undefined' && MUNICIPIOS_DATA[uf]) || null;
  if (dados && dados.length > 0) {
    _preencherMunicipios(sel, dados);
    return;
  }

  // 2) Fallback: busca via API (caso o estado não estivesse em cache no startup)
  sel.innerHTML = '<option value="">Carregando cidades...</option>';
  try {
    const resp = await fetch(`/api/municipios/${uf}`);
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const lista = await resp.json();
    sel.innerHTML = '<option value="">Todos os municípios</option>';
    if (lista.length === 0) {
      sel.innerHTML = '<option value="">Nenhuma cidade encontrada</option>';
      return;
    }
    _preencherMunicipios(sel, lista);
    // Atualiza MUNICIPIOS_DATA para próximas trocas
    if (typeof MUNICIPIOS_DATA !== 'undefined') MUNICIPIOS_DATA[uf] = lista;
  } catch (e) {
    console.warn('[municipios] Erro no fallback:', e);
    sel.innerHTML = '<option value="">Erro ao carregar cidades</option>';
  }
}

/**
 * Popula o select de municípios com a lista recebida.
 * Cada item deve ter {nome, codigo_ibge}.
 */
function _preencherMunicipios(sel, lista) {
  lista.forEach(m => {
    const opt       = document.createElement('option');
    opt.value       = m.codigo_ibge;   // código IBGE → enviado à API de busca
    opt.textContent = m.nome;          // nome legível → exibido ao usuário
    sel.appendChild(opt);
  });
}

/**
 * Preenche o select de natureza jurídica com as encontradas nos resultados.
 */
function preencherNaturezas() {
  const naturezas = [...new Set(
    todosOsDados.map(r => r.natureza_juridica).filter(Boolean)
  )].sort();
  preencherSelect('f-natureza', naturezas);
}

// ---------------------------------------------------------------------------
// Utilitário de preenchimento de select genérico
// ---------------------------------------------------------------------------

function preencherSelect(id, valores) {
  const sel = document.getElementById(id);
  if (!sel) return;
  const primeiraOpcao = sel.options[0];
  sel.innerHTML = '';
  sel.appendChild(primeiraOpcao);
  valores.forEach(v => {
    if (!v) return;
    const opt = document.createElement('option');
    opt.value = v;
    opt.textContent = v;
    sel.appendChild(opt);
  });
}

// ---------------------------------------------------------------------------
// Ordenação
// ---------------------------------------------------------------------------

function ordenarPor(coluna) {
  if (colunaOrdem === coluna) {
    ordemAsc = !ordemAsc;
  } else {
    colunaOrdem = coluna;
    ordemAsc = true;
  }

  // Atualiza ícones de cabeçalho
  document.querySelectorAll('.data-table th').forEach(th => {
    th.classList.remove('sort-asc', 'sort-desc');
  });
  const th = document.querySelector(`[data-col="${coluna}"]`);
  if (th) th.classList.add(ordemAsc ? 'sort-asc' : 'sort-desc');

  const numerica = coluna === 'capital_social';
  dadosFiltrados.sort((a, b) => {
    if (numerica) {
      const na = parseFloat(a[coluna]) || 0;
      const nb = parseFloat(b[coluna]) || 0;
      return ordemAsc ? na - nb : nb - na;
    }
    const va = (a[coluna] || '').toString().toLowerCase();
    const vb = (b[coluna] || '').toString().toLowerCase();
    if (va < vb) return ordemAsc ? -1 : 1;
    if (va > vb) return ordemAsc ?  1 : -1;
    return 0;
  });

  paginaAtual = 1;
  renderizarTabela();
}

// ---------------------------------------------------------------------------
// ResultsTable — renderização da tabela paginada
// ---------------------------------------------------------------------------

/**
 * Renderiza a tabela com os dados da página atual de dadosFiltrados.
 */
function renderizarTabela() {
  const total  = dadosFiltrados.length;
  const inicio = (paginaAtual - 1) * tamanhoPagina;
  const fim    = Math.min(inicio + tamanhoPagina, total);
  const pagina = dadosFiltrados.slice(inicio, fim);

  const tbody = document.getElementById('table-body');
  tbody.innerHTML = '';

  // Empty state
  if (total === 0) {
    document.getElementById('table-wrapper').style.display = 'none';
    document.getElementById('pagination').style.display    = 'none';
    document.getElementById('empty-state').style.display   = 'block';
    document.getElementById('table-count').textContent     = '0 empresas encontradas';
    return;
  }

  document.getElementById('empty-state').style.display   = 'none';
  document.getElementById('table-wrapper').style.display = 'block';

  pagina.forEach(r => {
    const ativa = (r.situacao_cadastral || '').toLowerCase().includes('ativa');
    const tr = document.createElement('tr');
    tr.className = ativa ? 'row-success' : '';
    tr.dataset.cnpj = r.cnpj_raw || r.cnpj || '';
    tr.style.cursor = 'pointer';
    tr.title = 'Clique para ver detalhes da empresa';

    // Razão social com nome fantasia como subtítulo
    const nomeFantasia = r.nome_fantasia && r.nome_fantasia !== r.razao_social
      ? `<br><small style="color:var(--text-muted);font-size:0.7rem">${esc(r.nome_fantasia)}</small>`
      : '';

    // Badge de situação cadastral
    const badgeSit = badgeSituacao(r.situacao_cadastral);

    // Badge de porte
    const badgePorte = badgeTipoEmpresa(r.porte);

    // Email clicável
    const emailCell = r.email
      ? `<a class="table-link" href="mailto:${esc(r.email)}" onclick="event.stopPropagation()">${esc(r.email)}</a>`
      : '<span style="color:var(--text-muted)">—</span>';

    // Telefone
    const telCell = r.telefone
      ? `<a class="table-link" href="tel:${esc(r.telefone)}" onclick="event.stopPropagation()">${esc(r.telefone)}</a>`
      : '<span style="color:var(--text-muted)">—</span>';

    // CNAE com badge
    const cnaeCell = r.cnae_descricao
      ? `<span class="badge-cnae" title="${esc(r.cnae_principal)} — ${esc(r.cnae_descricao)}">${esc(truncar(r.cnae_descricao, 35))}</span>`
      : '<span style="color:var(--text-muted)">—</span>';

    tr.innerHTML = `
      <td title="${esc(r.razao_social)}">${esc(truncar(r.razao_social, 40))}${nomeFantasia}</td>
      <td style="font-family:monospace;font-size:0.75rem">${esc(r.cnpj)}</td>
      <td>${esc(r.municipio) || '—'}${r.uf ? `<span style="color:var(--text-muted);margin-left:4px">/${esc(r.uf)}</span>` : ''}</td>
      <td>${cnaeCell}</td>
      <td>${badgeSit}</td>
      <td>${badgePorte}</td>
      <td>${telCell}</td>
      <td style="max-width:180px;overflow:hidden;text-overflow:ellipsis">${emailCell}</td>
      <td class="num-col" title="${formatarBRL(r.capital_social, true)}">${formatarBRL(r.capital_social)}</td>
      <td>${formatarData(r.data_abertura)}</td>
    `;

    // Clique na linha abre o modal de detalhes
    tr.addEventListener('click', () => abrirDetalhes(r.cnpj_raw || r.cnpj));

    tbody.appendChild(tr);
  });

  document.getElementById('table-count').textContent =
    `${total.toLocaleString('pt-BR')} empresa(s) (exibindo ${inicio + 1}–${fim})`;

  renderizarPaginacao(total);
}

// ---------------------------------------------------------------------------
// Paginação (idêntica ao projeto base, com reticências)
// ---------------------------------------------------------------------------

function renderizarPaginacao(total) {
  const totalPaginas = Math.ceil(total / tamanhoPagina);
  const paginacaoEl  = document.getElementById('pagination');
  const numerosEl    = document.getElementById('page-numbers');

  if (totalPaginas <= 1) {
    paginacaoEl.style.display = 'none';
    return;
  }

  paginacaoEl.style.display = 'flex';
  numerosEl.innerHTML = '';

  const btnPrev = document.getElementById('btn-prev');
  const btnNext = document.getElementById('btn-next');
  btnPrev.disabled = paginaAtual === 1;
  btnNext.disabled = paginaAtual === totalPaginas;

  const paginas = paginasVisiveis(paginaAtual, totalPaginas);
  paginas.forEach(p => {
    if (p === '...') {
      const span = document.createElement('span');
      span.textContent = '…';
      span.style.cssText = 'padding:0 6px;color:var(--text-muted);line-height:32px';
      numerosEl.appendChild(span);
      return;
    }
    const btn = document.createElement('button');
    btn.className = 'page-btn' + (p === paginaAtual ? ' active' : '');
    btn.textContent = p;
    btn.onclick = () => irParaPagina(p);
    numerosEl.appendChild(btn);
  });
}

/**
 * Gera a lista de páginas visíveis com reticências para grandes totais.
 */
function paginasVisiveis(atual, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const paginas = [];
  if (atual <= 4) {
    for (let i = 1; i <= 5; i++) paginas.push(i);
    paginas.push('...', total);
  } else if (atual >= total - 3) {
    paginas.push(1, '...');
    for (let i = total - 4; i <= total; i++) paginas.push(i);
  } else {
    paginas.push(1, '...', atual - 1, atual, atual + 1, '...', total);
  }
  return paginas;
}

function irParaPagina(p) {
  const total = Math.ceil(dadosFiltrados.length / tamanhoPagina);
  if (p < 1 || p > total) return;
  paginaAtual = p;
  renderizarTabela();
  document.querySelector('.main-content').scrollIntoView({ behavior: 'smooth' });
}

function mudarTamanhoPagina() {
  tamanhoPagina = parseInt(document.getElementById('page-size').value);
  paginaAtual   = 1;
  renderizarTabela();
}

// ---------------------------------------------------------------------------
// CompanyDetailModal — modal de detalhes ao clicar em uma empresa
// ---------------------------------------------------------------------------

/**
 * Atualiza silenciosamente a entrada de uma empresa em todosOsDados e dadosFiltrados
 * com os campos enriquecidos (telefone, email, etc.) vindos do modal.
 * Também atualiza a célula de telefone/email visível na linha da tabela,
 * sem precisar re-renderizar a tabela toda.
 */
function _atualizarLinhaTabela(cnpjRaw, dadosEnriquecidos) {
  // Campos que valem a pena atualizar na tabela (enriquecimento melhora cobertura)
  const CAMPOS = ['telefone', 'email', 'nome_fantasia', 'situacao_cadastral', 'porte'];

  // 1. Atualiza todosOsDados em memória
  const idxTodos = todosOsDados.findIndex(r =>
    (r.cnpj_raw || '').replace(/\D/g, '') === cnpjRaw ||
    (r.cnpj    || '').replace(/\D/g, '') === cnpjRaw
  );
  if (idxTodos !== -1) {
    CAMPOS.forEach(c => {
      if (dadosEnriquecidos[c]) todosOsDados[idxTodos][c] = dadosEnriquecidos[c];
    });
  }

  // 2. Atualiza dadosFiltrados em memória
  const idxFiltrados = dadosFiltrados.findIndex(r =>
    (r.cnpj_raw || '').replace(/\D/g, '') === cnpjRaw ||
    (r.cnpj    || '').replace(/\D/g, '') === cnpjRaw
  );
  if (idxFiltrados !== -1) {
    CAMPOS.forEach(c => {
      if (dadosEnriquecidos[c]) dadosFiltrados[idxFiltrados][c] = dadosEnriquecidos[c];
    });
  }

  // 3. Atualiza a linha visível na tabela sem re-renderizar tudo
  const tr = document.querySelector(`tr[data-cnpj="${cnpjRaw}"]`);
  if (!tr) return;
  const tds = tr.querySelectorAll('td');
  // Coluna 6 = Telefone, Coluna 7 = Email (índices 0-based)
  const tel   = dadosEnriquecidos.telefone || '';
  const email = dadosEnriquecidos.email    || '';
  if (tds[6] && tel) {
    tds[6].innerHTML = `<a class="table-link" href="tel:${esc(tel)}" onclick="event.stopPropagation()">${esc(tel)}</a>`;
  }
  if (tds[7] && email) {
    tds[7].innerHTML = `<a class="table-link" href="mailto:${esc(email)}" onclick="event.stopPropagation()">${esc(email)}</a>`;
  }
}

/**
 * Abre o modal de detalhes para o CNPJ informado.
 * Chama /api/cnpj/<cnpj> para enriquecer os dados via CNPJá/BrasilAPI/ReceitaWS.
 */
async function abrirDetalhes(cnpj) {
  if (!cnpj) return;
  const cnpjRaw = cnpj.replace(/\D/g, '');

  // Verifica se já temos dados básicos em memória
  const registroLocal = todosOsDados.find(r =>
    (r.cnpj_raw || '').replace(/\D/g, '') === cnpjRaw ||
    (r.cnpj || '').replace(/\D/g, '') === cnpjRaw
  );

  // Guarda o foco atual para devolver ao fechar (acessibilidade)
  document._modalOpener = document.activeElement;

  // Abre o modal com loading
  const overlay = document.getElementById('modal-overlay');
  const content = document.getElementById('modal-content');
  overlay.style.display = 'flex';
  content.innerHTML = '<div class="loading-overlay"><div class="spinner" role="status" aria-label="Carregando"></div><p>Carregando detalhes...</p></div>';

  // Move o foco para o botão de fechar (acessibilidade)
  setTimeout(() => {
    const btnFechar = document.getElementById('modal-close-btn');
    if (btnFechar) btnFechar.focus();
  }, 50);

  try {
    // Busca detalhes enriquecidos da API
    const resp = await fetch(`/api/cnpj/${cnpjRaw}`);
    const data = await resp.json();

    // Mescla dados locais com enriquecidos (enriquecido sobrescreve onde tiver mais info)
    const emp = data.ok ? { ...(registroLocal || {}), ...data.dados } : (registroLocal || {});

    if (!data.ok && !registroLocal) {
      content.innerHTML = `
        <div class="modal-section">
          <h2 class="modal-title">Erro ao carregar</h2>
          <p style="color:var(--danger)">${esc(data.erro || 'Não foi possível obter os dados.')}</p>
        </div>`;
      return;
    }

    // Atualiza silenciosamente a linha da tabela com telefone/email enriquecidos.
    // Minha Receita frequentemente não tem esses campos; CNPJá/BrasilAPI têm.
    if (data.ok && data.dados) {
      _atualizarLinhaTabela(cnpjRaw, data.dados);
    }

    renderizarModal(emp);
  } catch (err) {
    // Se a requisição falhar, exibe o que temos localmente
    if (registroLocal) {
      renderizarModal(registroLocal);
    } else {
      content.innerHTML = `<div class="modal-section"><p style="color:var(--danger)">Erro: ${esc(err.message)}</p></div>`;
    }
  }
}

/**
 * Renderiza o conteúdo do modal com todos os dados da empresa.
 * Seções: Identificação, Localização, Contato, Financeiro, Sócios (QSA).
 */
function renderizarModal(emp) {
  const cnpjFormatado = emp.cnpj || _formatar_cnpj_js(emp.cnpj_raw || '');
  const enderecoCEP   = [emp.endereco, emp.cep ? `CEP: ${emp.cep}` : ''].filter(Boolean).join(' — ');
  const mapLink       = emp.endereco
    ? `https://www.google.com/maps/search/${encodeURIComponent([emp.endereco, emp.municipio, emp.uf].filter(Boolean).join(', '))}`
    : '';

  // QSA (sócios)
  const qsa    = emp.qsa || [];
  const socios = qsa.length
    ? qsa.map(s => `
        <div class="modal-socio">
          <span class="modal-socio-nome">${esc(s.nome_socio || s.nome || '—')}</span>
          <span class="badge badge-neutral">${esc(s.qualificacao_socio || s.qual || '')}</span>
          ${s.cpf_cnpj_socio ? `<span style="color:var(--text-muted);font-size:0.75rem">${esc(mascararDocumento(s.cpf_cnpj_socio))}</span>` : ''}
        </div>`).join('')
    : '<p style="color:var(--text-muted)">Nenhum sócio registrado.</p>';

  // CNAEs secundários
  const cnaesSecundarios = (emp.cnaes_secundarios || []).slice(0, 5);
  const cnaesHtml = cnaesSecundarios.length
    ? cnaesSecundarios.map(c => `<span class="badge-cnae">${esc(c.descricao || c.text || c.code || c)}</span>`).join(' ')
    : '';

  // Simples / MEI
  const simplesInfo = emp.opcao_pelo_simples === true ? '&#10003; Optante pelo Simples Nacional' :
                      emp.opcao_pelo_simples === false ? 'Não optante pelo Simples' : '';
  const meiInfo     = emp.opcao_pelo_mei === true ? '&#10003; MEI' :
                      emp.opcao_pelo_mei === false ? 'Não MEI' : '';

  document.getElementById('modal-content').innerHTML = `
    <!-- Cabeçalho do modal -->
    <div class="modal-header">
      <div>
        <h2 class="modal-title">${esc(emp.razao_social || '—')}</h2>
        ${emp.nome_fantasia && emp.nome_fantasia !== emp.razao_social
          ? `<p class="modal-subtitle">${esc(emp.nome_fantasia)}</p>` : ''}
      </div>
      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
        ${badgeSituacao(emp.situacao_cadastral)}
        ${badgeTipoEmpresa(emp.porte)}
      </div>
    </div>

    <!-- Seção: Identificação -->
    <div class="modal-section">
      <h3 class="modal-section-title">&#128196; Identificação</h3>
      <div class="modal-grid">
        <div class="modal-field"><span class="modal-field-label">CNPJ</span><span class="modal-field-value" style="font-family:monospace">${esc(cnpjFormatado)}</span></div>
        <div class="modal-field"><span class="modal-field-label">Natureza Jurídica</span><span class="modal-field-value">${esc(emp.natureza_juridica || '—')}</span></div>
        <div class="modal-field"><span class="modal-field-label">CNAE Principal</span><span class="modal-field-value">${esc(emp.cnae_principal || '')} — ${esc(emp.cnae_descricao || '—')}</span></div>
        <div class="modal-field"><span class="modal-field-label">Data de Abertura</span><span class="modal-field-value">${formatarData(emp.data_abertura)}</span></div>
        ${cnaesHtml ? `<div class="modal-field modal-field-full"><span class="modal-field-label">CNAEs Secundários</span><div style="margin-top:4px">${cnaesHtml}</div></div>` : ''}
      </div>
    </div>

    <!-- Seção: Localização -->
    <div class="modal-section">
      <h3 class="modal-section-title">&#128205; Localização</h3>
      <div class="modal-grid">
        <div class="modal-field modal-field-full">
          <span class="modal-field-label">Endereço</span>
          <span class="modal-field-value">
            ${esc(enderecoCEP || '—')}
            ${mapLink ? ` &nbsp;<a href="${esc(mapLink)}" target="_blank" rel="noopener" class="table-link" style="font-size:0.75rem">&#128205; Ver no Maps</a>` : ''}
          </span>
        </div>
        <div class="modal-field"><span class="modal-field-label">Município</span><span class="modal-field-value">${esc(emp.municipio || '—')}</span></div>
        <div class="modal-field"><span class="modal-field-label">UF</span><span class="modal-field-value">${esc(emp.uf || '—')}</span></div>
        <div class="modal-field"><span class="modal-field-label">CEP</span><span class="modal-field-value" style="font-family:monospace">${esc(emp.cep || '—')}</span></div>
      </div>
    </div>

    <!-- Seção: Contato -->
    <div class="modal-section">
      <h3 class="modal-section-title">&#128222; Contato</h3>
      <div class="modal-grid">
        <div class="modal-field">
          <span class="modal-field-label">Telefone</span>
          <span class="modal-field-value">
            ${emp.telefone
              ? `<a href="tel:${esc(emp.telefone)}" class="table-link">${esc(emp.telefone)}</a>`
              : '<span style="color:var(--text-muted)">Não informado</span>'}
          </span>
        </div>
        <div class="modal-field">
          <span class="modal-field-label">Email</span>
          <span class="modal-field-value">
            ${emp.email
              ? `<a href="mailto:${esc(emp.email)}" class="table-link">${esc(emp.email)}</a>`
              : '<span style="color:var(--text-muted)">Não informado</span>'}
          </span>
        </div>
      </div>
    </div>

    <!-- Seção: Financeiro -->
    <div class="modal-section">
      <h3 class="modal-section-title">&#128176; Financeiro</h3>
      <div class="modal-grid">
        <div class="modal-field">
          <span class="modal-field-label">Capital Social</span>
          <span class="modal-field-value" style="font-size:1.1rem;font-weight:700;color:var(--accent)">
            ${formatarBRL(emp.capital_social, true)}
          </span>
        </div>
        <div class="modal-field"><span class="modal-field-label">Porte</span><span class="modal-field-value">${esc(emp.porte || '—')}</span></div>
        ${simplesInfo ? `<div class="modal-field"><span class="modal-field-label">Simples Nacional</span><span class="modal-field-value" style="color:var(--success)">${simplesInfo}</span></div>` : ''}
        ${meiInfo ? `<div class="modal-field"><span class="modal-field-label">MEI</span><span class="modal-field-value" style="color:var(--success)">${meiInfo}</span></div>` : ''}
        ${emp.fonte_enriquecimento ? `<div class="modal-field"><span class="modal-field-label">Fonte dos Dados</span><span class="modal-field-value" style="color:var(--text-muted);font-size:0.75rem">${esc(emp.fonte_enriquecimento)}</span></div>` : ''}
      </div>
    </div>

    <!-- Seção: Sócios (QSA) -->
    <div class="modal-section">
      <h3 class="modal-section-title">&#128100; Quadro Societário (QSA)</h3>
      <div class="modal-socios">${socios}</div>
    </div>
  `;
}

/**
 * Fecha o modal.
 * - Sem argumento (botão X ou botão Fechar): fecha sempre.
 * - Com evento (clique no overlay): fecha só se o clique foi no próprio overlay,
 *   não em um filho (modal-card).
 */
function fecharModal(event) {
  if (event && event.target !== document.getElementById('modal-overlay')) return;
  const overlay = document.getElementById('modal-overlay');
  overlay.style.display = 'none';
  // Devolve o foco ao elemento que abriu o modal (acessibilidade)
  if (document._modalOpener) {
    document._modalOpener.focus();
    document._modalOpener = null;
  }
}

// Fecha o modal com Escape (acessibilidade — navegação por teclado)
document.addEventListener('keydown', ev => {
  if (ev.key === 'Escape') {
    const overlay = document.getElementById('modal-overlay');
    if (overlay.style.display !== 'none') fecharModal();
  }
});


// ---------------------------------------------------------------------------
// Sidebar mobile — hambúrguer
// ---------------------------------------------------------------------------

/**
 * Alterna a sidebar no mobile (drawer lateral).
 */
function toggleSidebar() {
  const sidebar   = document.getElementById('sidebar');
  const overlay   = document.getElementById('sidebar-overlay');
  const hamburguer = document.getElementById('hamburger-btn');

  const estaAberta = sidebar.classList.contains('sidebar-open');
  if (estaAberta) {
    fecharSidebar();
  } else {
    sidebar.classList.add('sidebar-open');
    overlay.classList.add('active');
    hamburguer.setAttribute('aria-expanded', 'true');
    // Foco no primeiro campo da sidebar (acessibilidade)
    const primeiroCampo = sidebar.querySelector('input, select, button');
    if (primeiroCampo) primeiroCampo.focus();
  }
}

/**
 * Fecha a sidebar no mobile.
 */
function fecharSidebar() {
  const sidebar    = document.getElementById('sidebar');
  const overlay    = document.getElementById('sidebar-overlay');
  const hamburguer = document.getElementById('hamburger-btn');
  sidebar.classList.remove('sidebar-open');
  overlay.classList.remove('active');
  hamburguer.setAttribute('aria-expanded', 'false');
  hamburguer.focus();
}

// ---------------------------------------------------------------------------
// ExportModule — CSV e XLSX
// ---------------------------------------------------------------------------

/**
 * Exporta dadosFiltrados para CSV com BOM UTF-8 (compatível com Excel).
 */
function exportarCSV() {
  if (!dadosFiltrados.length) return alert('Nenhum dado para exportar.');

  const colunas = [
    'cnpj', 'razao_social', 'nome_fantasia', 'situacao_cadastral', 'porte',
    'natureza_juridica', 'cnae_principal', 'cnae_descricao', 'data_abertura',
    'municipio', 'uf', 'cep', 'logradouro', 'numero', 'complemento', 'bairro',
    'endereco', 'telefone', 'email', 'capital_social',
    'opcao_pelo_simples', 'opcao_pelo_mei',
  ];

  const header = colunas.join(',');
  const linhas = dadosFiltrados.map(r =>
    colunas.map(c => csvCelula(r[c])).join(',')
  );

  const conteudo = [header, ...linhas].join('\r\n');
  const blob = new Blob(['\uFEFF' + conteudo], { type: 'text/csv;charset=utf-8' });
  download(blob, `empresas_${timestamp()}.csv`);
}

/**
 * Exporta dadosFiltrados para XLSX com SheetJS.
 */
function exportarXLSX() {
  if (!dadosFiltrados.length) return alert('Nenhum dado para exportar.');
  if (typeof XLSX === 'undefined') return alert('Biblioteca XLSX não carregada.');

  // Prepara dados sem campos internos (cnpj_raw, qsa como JSON)
  const linhas = dadosFiltrados.map(r => ({
    CNPJ:               r.cnpj || '',
    'Razão Social':     r.razao_social || '',
    'Nome Fantasia':    r.nome_fantasia || '',
    'Situação':         r.situacao_cadastral || '',
    'Porte':            r.porte || '',
    'Natureza Jurídica': r.natureza_juridica || '',
    'CNAE Principal':   r.cnae_principal || '',
    'Descrição CNAE':   r.cnae_descricao || '',
    'Data Abertura':    r.data_abertura || '',
    'Município':        r.municipio || '',
    'UF':               r.uf || '',
    'CEP':              r.cep || '',
    'Logradouro':       r.logradouro || '',
    'Número':           r.numero || '',
    'Complemento':      r.complemento || '',
    'Bairro':           r.bairro || '',
    'Endereço Completo': r.endereco || '',
    'Telefone':         r.telefone || '',
    'Email':            r.email || '',
    'Capital Social':   r.capital_social || 0,
    'Simples Nacional': r.opcao_pelo_simples === true ? 'Sim' : r.opcao_pelo_simples === false ? 'Não' : '',
    'MEI':              r.opcao_pelo_mei === true ? 'Sim' : r.opcao_pelo_mei === false ? 'Não' : '',
  }));

  const ws = XLSX.utils.json_to_sheet(linhas);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Empresas');

  // Ajusta largura das colunas
  const range = XLSX.utils.decode_range(ws['!ref']);
  ws['!cols'] = Array.from({ length: range.e.c + 1 }, (_, i) => {
    let max = 10;
    for (let r = range.s.r; r <= range.e.r; r++) {
      const cell = ws[XLSX.utils.encode_cell({ r, c: i })];
      if (cell && cell.v) max = Math.max(max, String(cell.v).length);
    }
    return { wch: Math.min(max + 2, 50) };
  });

  XLSX.writeFile(wb, `empresas_${timestamp()}.xlsx`);
}

// ---------------------------------------------------------------------------
// Utilitários de UI
// ---------------------------------------------------------------------------

/**
 * Exibe ou oculta o skeleton loading.
 */
function mostrarLoading(ativo) {
  document.getElementById('loading').style.display       = ativo ? 'block' : 'none';
  if (ativo) {
    document.getElementById('table-wrapper').style.display = 'none';
    document.getElementById('pagination').style.display    = 'none';
    document.getElementById('empty-state').style.display   = 'none';
  }
}

/**
 * Exibe ou oculta a barra de progresso.
 */
function exibirProgresso(ativo, mensagem = '') {
  const container = document.getElementById('progress-container');
  container.style.display = ativo ? 'block' : 'none';
  if (ativo && mensagem) {
    document.getElementById('progress-label').textContent = mensagem;
    // Animação indeterminada
    const fill = document.getElementById('progress-fill');
    fill.style.animation = 'progress-indeterminate 1.5s ease-in-out infinite';
  }
}

/**
 * Máscara de CNPJ: 00.000.000/0000-00
 */
function mascaraCNPJ(input) {
  let v = input.value.replace(/\D/g, '').substring(0, 14);
  if (v.length > 12) v = v.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{0,2})/, '$1.$2.$3/$4-$5');
  else if (v.length > 8) v = v.replace(/^(\d{2})(\d{3})(\d{3})(\d{0,4})/, '$1.$2.$3/$4');
  else if (v.length > 5) v = v.replace(/^(\d{2})(\d{3})(\d{0,3})/, '$1.$2.$3');
  else if (v.length > 2) v = v.replace(/^(\d{2})(\d{0,3})/, '$1.$2');
  input.value = v;
}

/**
 * Formata CNPJ de 14 dígitos para exibição no JS (sem chamar o backend).
 */
function _formatar_cnpj_js(cnpj) {
  const c = cnpj.replace(/\D/g, '').padStart(14, '0');
  if (c.length === 14) return `${c.slice(0,2)}.${c.slice(2,5)}.${c.slice(5,8)}/${c.slice(8,12)}-${c.slice(12)}`;
  return cnpj;
}

/**
 * Debounce genérico: retorna uma função que aguarda `delay` ms antes de executar `fn`.
 */
function debounce(fn, delay) {
  let timer;
  return function(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

// Versão aplicada diretamente no campo de razão social
const aplicarFiltrosLocaisDebounced = debounce(aplicarFiltrosLocais, 300);

// ---------------------------------------------------------------------------
// Badges e formatação
// ---------------------------------------------------------------------------

/**
 * Badge colorido para situação cadastral.
 * Ativa=verde, Baixada=vermelho, Inapta=vermelho, Suspensa=amarelo, Nula=cinza.
 */
function badgeSituacao(situacao) {
  const s = (situacao || '').toUpperCase();
  if (s.includes('ATIVA'))    return `<span class="badge badge-success">${esc(situacao)}</span>`;
  if (s.includes('BAIXADA'))  return `<span class="badge badge-danger">${esc(situacao)}</span>`;
  if (s.includes('INAPTA'))   return `<span class="badge badge-danger">${esc(situacao)}</span>`;
  if (s.includes('SUSPENSA')) return `<span class="badge badge-warning">${esc(situacao)}</span>`;
  if (s.includes('NULA'))     return `<span class="badge badge-neutral">${esc(situacao)}</span>`;
  return situacao ? `<span class="badge badge-neutral">${esc(situacao)}</span>` : '—';
}

/**
 * Badge colorido por tipo/porte de empresa.
 */
function badgeTipoEmpresa(porte) {
  if (!porte) return '—';
  const p = porte.toUpperCase();
  // Aceita tanto abreviações (ME, EPP) quanto strings longas da API (MICRO EMPRESA)
  if (p === 'MEI' || p.includes('MICROEMPREENDEDOR'))
    return `<span class="badge badge-mei">MEI</span>`;
  if (p === 'ME'  || p === 'MICRO EMPRESA' || p === 'MICROEMPRESA')
    return `<span class="badge badge-me">ME</span>`;
  if (p === 'EPP' || p.includes('PEQUENO PORTE'))
    return `<span class="badge badge-epp">EPP</span>`;
  if (p === 'DEMAIS')
    return `<span class="badge badge-demais">Demais</span>`;
  if (p.includes('GRANDE'))
    return `<span class="badge badge-grande">Grande</span>`;
  return `<span class="badge badge-neutral">${esc(porte)}</span>`;
}

/**
 * Formata valor monetário de forma compacta (R$ 1,2M, R$ 350K) ou completa.
 */
function formatarBRL(valor, completo = false) {
  const n = parseFloat(valor);
  if (!n || isNaN(n)) return '—';
  if (completo) return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  if (n >= 1_000_000) return 'R$ ' + (n / 1_000_000).toFixed(1).replace('.', ',') + 'M';
  if (n >= 1_000)     return 'R$ ' + (n / 1_000).toFixed(0) + 'K';
  return 'R$ ' + n.toFixed(0);
}

/**
 * Formata data para DD/MM/YYYY, aceita ISO e formatos variados.
 */
function formatarData(data) {
  if (!data) return '—';
  const s = String(data).trim();
  // ISO: YYYY-MM-DD
  const mISO = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (mISO) return `${mISO[3]}/${mISO[2]}/${mISO[1]}`;
  // Já em DD/MM/YYYY
  if (/^\d{2}\/\d{2}\/\d{4}/.test(s)) return s.substring(0, 10);
  return s;
}

/**
 * Escapa HTML para evitar XSS.
 */
function esc(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Mascara CPF (oculta primeiros 9 dígitos) ou CNPJ (oculta primeiros 10 dígitos)
// para proteção de dados dos sócios na exibição.
function mascararDocumento(doc) {
  if (!doc) return '';
  const d = String(doc).replace(/\D/g, '');
  if (d.length === 11) {
    // CPF: oculta os 9 primeiros dígitos
    return `***.***.***-${d.slice(9)}`;
  }
  if (d.length === 14) {
    // CNPJ: oculta os primeiros 10 dígitos
    return `**.***.***/${d.slice(8, 12)}-${d.slice(12)}`;
  }
  // Documento de formato desconhecido — exibe com metade ocultada
  const metade = Math.floor(d.length / 2);
  return '*'.repeat(metade) + d.slice(metade);
}

/**
 * Trunca string longa com reticências.
 */
function truncar(str, max) {
  if (!str) return '';
  return str.length > max ? str.substring(0, max) + '…' : str;
}

/**
 * Formata célula para CSV (adiciona aspas se necessário).
 */
function csvCelula(valor) {
  const s = String(valor ?? '');
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

/**
 * Gera timestamp para nomes de arquivo (YYYY-MM-DD_HH-MM-SS).
 */
function timestamp() {
  return new Date().toISOString().substring(0, 19).replace(/[T:]/g, '-');
}

/**
 * Dispara download de um Blob com o nome de arquivo informado.
 */
function download(blob, nome) {
  const url = URL.createObjectURL(blob);
  const a   = document.createElement('a');
  a.href     = url;
  a.download = nome;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
