/**
 * app.js — Lógica do Dashboard Prospector Bets
 * Responsável por: fetch de dados, filtros, tabela paginada,
 * ordenação, gráficos Chart.js, exportação CSV/XLSX.
 */

'use strict';

// ---------------------------------------------------------------------------
// Estado global
// ---------------------------------------------------------------------------

let todosOsDados = [];         // todos os registros carregados da API
let dadosFiltrados = [];       // subconjunto após filtros
let paginaAtual = 1;
let tamanhoPagina = 25;
let colunaOrdem = '';
let ordemAsc = true;

// Agrupamento de status brutos em 3 categorias visíveis
const STATUS_GROUPS = {
  com_email: ['encontrado', 'encontrado_js', 'encontrado_manual'],
  sem_email: ['nao_encontrado'],
  falhou:    ['erro_conexao', 'bloqueado_robots', 'sem_url'],
};

// Paleta de cores para gráficos — Design System v2 (neon green primário)
const CORES = [
  '#39FF87', '#4F9EFF', '#FFB547', '#FF4D6A', '#a855f7',
  '#06b6d4', '#f97316', '#ec4899', '#84cc16', '#64748b',
];

// ---------------------------------------------------------------------------
// Inicialização
// ---------------------------------------------------------------------------

document.addEventListener('DOMContentLoaded', () => {
  carregarDados();
  iniciarPollingUrlHealth();
});

async function carregarDados() {
  mostrarLoading(true);
  try {
    const [dadosResp, statsResp] = await Promise.all([
      fetch('/api/dados'),
      fetch('/api/stats'),
    ]);
    todosOsDados = await dadosResp.json();
    const stats = await statsResp.json();

    preencherKPIs(stats);
    preencherFiltrosDropdown(stats);
    dadosFiltrados = [...todosOsDados];
    renderizarTabela();
    renderizarGraficos();
  } catch (err) {
    console.error('Erro ao carregar dados:', err);
    document.getElementById('table-count').textContent = 'Erro ao carregar dados.';
  } finally {
    mostrarLoading(false);
  }
}

async function recarregarDados() {
  await fetch('/api/recarregar', { method: 'POST' });
  await carregarDados();
}

/**
 * Re-sincroniza dados/stats do servidor após uma edição.
 * Preserva o filtro corrente (reaplica aplicarFiltros se algum filtro
 * estiver ativo) e mantém a ordenação/página atual.
 */
async function ressincronizar() {
  const [dadosResp, statsResp] = await Promise.all([
    fetch('/api/dados'),
    fetch('/api/stats'),
  ]);
  todosOsDados = await dadosResp.json();
  const stats = await statsResp.json();
  preencherKPIs(stats);

  if (filtroAtivo()) {
    // Reaplica filtros sobre os dados novos — preserva o que o usuário filtrou
    aplicarFiltros();
  } else {
    dadosFiltrados = [...todosOsDados];
    // Reaplica ordenação se havia
    if (colunaOrdem) {
      const asc = ordemAsc;
      ordemAsc = !asc; // ordenarPor alterna, então forçamos voltar ao mesmo estado
      ordenarPor(colunaOrdem);
    }
    renderizarTabela();
    renderizarGraficos();
  }
}

function filtroAtivo() {
  const campos = ['f-marca', 'f-status', 'f-afiliados', 'f-porte', 'f-situacao',
                  'f-uf', 'f-municipio', 'f-data-inicio', 'f-data-fim', 'f-saude-url'];
  return campos.some(id => (document.getElementById(id)?.value || '').trim() !== '');
}

function cssEscape(s) {
  if (window.CSS && CSS.escape) return CSS.escape(s);
  // Fallback robusto: cobre números no início e caracteres especiais de CSS
  return String(s)
    .replace(/[\\!"#$%&'()*+,./:;<=>?@[\]^`{|}~]/g, '\\$&')
    .replace(/^(\d)/, '\\3$1 ');
}

// ---------------------------------------------------------------------------
// KPI Cards
// ---------------------------------------------------------------------------

function preencherKPIs(stats) {
  document.getElementById('kpi-total').textContent     = stats.total ?? '—';
  document.getElementById('kpi-email').textContent     = stats.com_email ?? '—';
  document.getElementById('kpi-sem-email').textContent = stats.sem_email ?? '—';
  document.getElementById('kpi-afiliados').textContent = stats.com_afiliados ?? '—';
  document.getElementById('kpi-editados').textContent  = stats.editados_manualmente ?? '—';
  document.getElementById('kpi-atualizacao').textContent =
    stats.ultima_atualizacao ? stats.ultima_atualizacao.substring(0, 16) : '—';

  // Sparklines — desenhadas após preencher os valores
  const total = stats.total || 0;
  renderizarSparklines(stats);

  // Gauge de taxa de email
  renderizarGauge(stats.com_email || 0, total);

  // Barras de progresso
  renderizarProgressBars(stats);

  // Novos KPIs: saúde das URLs
  const ativas = document.getElementById('kpi-urls-ativas');
  if (ativas) ativas.textContent = stats.urls_ativas ?? '—';
  const inativas = document.getElementById('kpi-urls-inativas');
  if (inativas) inativas.textContent = stats.urls_inativas ?? '—';

  // Status do sync com CSV oficial
  const sindEl = document.getElementById('sync-status');
  if (sindEl && stats.csv_sync) {
    const s = stats.csv_sync;
    if (s.ultimo_sync) {
      const quando = formatarDesdeQuando(s.ultimo_sync);
      const detalhe = (s.adicionadas || s.removidas || s.url_atualizada)
        ? ` · +${s.adicionadas} -${s.removidas} ~${s.url_atualizada}`
        : ' · sem mudanças';
      sindEl.textContent = `${quando}${detalhe}`;
      sindEl.parentElement.classList.toggle('sync-ok', !!s.sucesso);
      sindEl.parentElement.classList.toggle('sync-erro', !s.sucesso);
    } else {
      sindEl.textContent = 'nunca';
    }
  }
}

async function forcarSyncCsv() {
  const btn = event?.target;
  if (btn) { btn.disabled = true; btn.textContent = '⟳ Sincronizando…'; }
  try {
    const resp = await fetch('/api/csv-sync-agora', { method: 'POST' });
    const r = await resp.json();
    if (r.sucesso) {
      const msg = `CSV sincronizado.\n` +
        `+ ${r.adicionadas.length} adicionadas\n` +
        `- ${r.removidas.length} removidas\n` +
        `~ ${r.url_atualizada.length} URLs atualizadas`;
      alert(msg);
      await carregarDados();
    } else {
      alert('Falha ao sincronizar: ' + (r.erro || 'erro desconhecido'));
    }
  } catch (e) {
    alert('Erro: ' + e.message);
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = '⟲ Sincronizar CSV'; }
  }
}

async function enriquecerCnpj() {
  const btn = event?.target;
  if (btn) { btn.disabled = true; btn.textContent = '⟳ Consultando APIs…'; }
  try {
    const resp = await fetch('/api/enriquecer', { method: 'POST' });
    const r = await resp.json();
    if (r.ok) {
      const msg = `Enriquecimento iniciado em background.\n` +
        `Registros pendentes: ${r.registros_pendentes}\n` +
        `CNPJs únicos a consultar: ${r.cnpjs_unicos}\n\n` +
        `Os filtros de UF e Município serão preenchidos automaticamente\n` +
        `após a consulta concluir. Clique em "Recarregar" em ~1 minuto.`;
      alert(msg);
    } else {
      alert('Erro: ' + (r.erro || 'erro desconhecido'));
    }
  } catch (e) {
    alert('Erro: ' + e.message);
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = '📌 Enriquecer CNPJ'; }
  }
}

// ---------------------------------------------------------------------------
// Preenchimento dos dropdowns de filtro
// ---------------------------------------------------------------------------

function preencherFiltrosDropdown(stats) {
  preencherSelect('f-porte',     stats.portes    || []);
  preencherSelect('f-situacao',  stats.situacoes || []);
  preencherSelect('f-uf',        stats.ufs       || []);
}

function preencherSelect(id, valores) {
  const sel = document.getElementById(id);
  const primeiraOpcao = sel.options[0]; // mantém o "Todos/Todas"
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

// Cascata UF → Município
async function atualizarMunicipios() {
  const uf = document.getElementById('f-uf').value;
  const sel = document.getElementById('f-municipio');
  sel.innerHTML = '<option value="">Todos</option>';
  if (!uf) return;

  const municipios = todosOsDados
    .filter(r => (r.uf || '').toUpperCase() === uf.toUpperCase() && r.municipio)
    .map(r => r.municipio);
  const unicos = [...new Set(municipios)].sort();

  unicos.forEach(m => {
    const opt = document.createElement('option');
    opt.value = m;
    opt.textContent = m;
    sel.appendChild(opt);
  });
}

// ---------------------------------------------------------------------------
// Filtros
// ---------------------------------------------------------------------------

function aplicarFiltros() {
  const marca       = document.getElementById('f-marca').value.toLowerCase().trim();
  const status      = document.getElementById('f-status').value;
  const afiliados   = document.getElementById('f-afiliados').value;
  const porte       = document.getElementById('f-porte').value;
  const situacao    = document.getElementById('f-situacao').value;
  const uf          = document.getElementById('f-uf').value;
  const municipio   = document.getElementById('f-municipio').value;
  const dataInicio  = document.getElementById('f-data-inicio').value;
  const dataFim     = document.getElementById('f-data-fim').value;
  const saudeUrl    = document.getElementById('f-saude-url')?.value || '';

  dadosFiltrados = todosOsDados.filter(r => {
    if (marca && !(r.marca || '').toLowerCase().includes(marca)) return false;
    if (status) {
      const grupo = STATUS_GROUPS[status];
      if (!grupo || !grupo.includes(r.status)) return false;
    }
    if (afiliados) {
      const temAfiliado = !!r._afiliado_detectado;
      if (afiliados === 'com' && !temAfiliado) return false;
      if (afiliados === 'sem' &&  temAfiliado) return false;
    }
    if (porte && r.porte_empresa !== porte) return false;
    if (situacao && r.situacao_cadastral !== situacao) return false;
    if (uf && (r.uf || '').toUpperCase() !== uf.toUpperCase()) return false;
    if (municipio && r.municipio !== municipio) return false;
    if (dataInicio && (r.data_coleta || '').substring(0, 10) < dataInicio) return false;
    if (dataFim && (r.data_coleta || '').substring(0, 10) > dataFim) return false;
    if (saudeUrl) {
      const st = r._url_health_status || 'desconhecido';
      if (saudeUrl === 'ativa' && st !== 'ok') return false;
      if (saudeUrl === 'redirect' && st !== 'redirect') return false;
      if (saudeUrl === 'erro' && !String(st).startsWith('erro') && st !== 'timeout') return false;
      if (saudeUrl === 'desconhecido' && st !== 'desconhecido') return false;
    }
    return true;
  });

  paginaAtual = 1;
  renderizarTabela();
  renderizarGraficos();
}

function limparFiltros() {
  ['f-marca', 'f-data-inicio', 'f-data-fim'].forEach(id => {
    document.getElementById(id).value = '';
  });
  ['f-status', 'f-afiliados', 'f-porte', 'f-situacao', 'f-uf', 'f-municipio', 'f-saude-url'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.selectedIndex = 0;
  });
  dadosFiltrados = [...todosOsDados];
  paginaAtual = 1;
  renderizarTabela();
  renderizarGraficos();
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
// Tabela
// ---------------------------------------------------------------------------

function renderizarTabela() {
  const total = dadosFiltrados.length;
  const inicio = (paginaAtual - 1) * tamanhoPagina;
  const fim = Math.min(inicio + tamanhoPagina, total);
  const pagina = dadosFiltrados.slice(inicio, fim);

  const tbody = document.getElementById('table-body');
  tbody.innerHTML = '';

  if (total === 0) {
    tbody.innerHTML = `<tr><td colspan="13" class="empty-state">Nenhum resultado para os filtros aplicados.</td></tr>`;
    document.getElementById('table-count').textContent = '0 registros encontrados';
    document.getElementById('pagination').style.display = 'none';
    document.getElementById('table-wrapper').style.display = 'block';
    return;
  }

  pagina.forEach(r => {
    const temEmail = r.status === 'encontrado' || r.status === 'encontrado_js' || r.status === 'encontrado_manual';
    const tr = document.createElement('tr');
    tr.className = temEmail ? 'row-success' : (r.status === 'nao_encontrado' ? 'row-danger' : '');
    if (r._editado_manualmente) tr.classList.add('row-edited');
    tr.dataset.cnpj = r.cnpj || '';

    const editadoBadge = r._editado_manualmente
      ? ` <span class="badge-edit" title="Editado manualmente em ${esc(r._editado_em || '')}">M</span>`
      : '';
    const inativaBadge = r._url_inativa
      ? ` <span class="badge-inativa" title="URL inacessível — site fora do ar, DNS falhou ou retorna erro">INATIVA</span>`
      : '';
    const removidaBadge = r._removido_do_csv
      ? ` <span class="badge-removida" title="Bet removida da lista oficial do gov.br em ${esc(r._removido_em || '')}">REMOVIDA</span>`
      : '';
    if (r._url_inativa) tr.classList.add('row-inativa');

    tr.innerHTML = `
      <td title="${esc(r.marca)}">${esc(r.marca)}${editadoBadge}${inativaBadge}${removidaBadge}</td>
      <td title="${esc(r.razao_social)}">${celulaEditavel(r, 'razao_social')}</td>
      <td>${esc(r.cnpj)}</td>
      <td class="url-cell" data-url="${esc(r.url || '')}">${celulaEditavel(r, 'url', 'url')}${urlHealthDot(r)}</td>
      <td>${celulaEditavel(r, 'email_contato', 'email')}</td>
      <td class="afiliado-cell">${afiliadoDot(r)}</td>
      <td>${esc(r.uf) || '—'}</td>
      <td title="${esc(r.municipio)}">${esc(r.municipio) || '—'}</td>
      <td>${badgeStatus(r.status)}</td>
      <td class="num-col" title="${formatarBRL(r.capital_social, true)}">${formatarBRL(r.capital_social)}</td>
      <td>${formatarData(r.data_abertura)}</td>
      <td>${formatarData(r.data_coleta)}</td>
      <td>${celulaEditavel(r, 'observacao', 'text')}</td>
    `;
    tbody.appendChild(tr);
  });

  // Ativa edição inline em todas as células editáveis
  tbody.querySelectorAll('.cell-editable').forEach(el => {
    el.addEventListener('click', ev => {
      // Não dispara se o clique foi num link interno (mailto, href)
      if (ev.target.closest('a.table-link')) return;
      iniciarEdicaoInline(el);
    });
  });

  document.getElementById('table-count').textContent =
    `${total.toLocaleString('pt-BR')} registros (exibindo ${inicio + 1}–${fim})`;

  document.getElementById('table-wrapper').style.display = 'block';
  renderizarPaginacao(total);
}

// ---------------------------------------------------------------------------
// Edição inline de células (email, url, etc.)
// ---------------------------------------------------------------------------

function celulaEditavel(r, campo, tipo = 'text') {
  const valor = r[campo];
  const cnpj = r.cnpj || '';
  const editado = (r._campos_editados || []).includes(campo);
  const marcaEdit = editado ? '<span class="edit-dot" title="Editado manualmente"></span>' : '';

  const isObs = campo === 'observacao';
  if (!valor) {
    return `<span class="cell-editable cell-empty${isObs ? ' cell-obs' : ''}" data-campo="${campo}" data-tipo="${tipo}" data-cnpj="${esc(cnpj)}" title="Clique para adicionar nota">+ nota</span>`;
  }

  let conteudo;
  if (tipo === 'email') {
    conteudo = `<a class="table-link" href="mailto:${esc(valor)}" onclick="event.stopPropagation()">${esc(valor)}</a>`;
  } else if (tipo === 'url') {
    conteudo = `<a class="table-link" href="${esc(valor)}" target="_blank" rel="noopener" onclick="event.stopPropagation()">${urlCurta(valor)}</a>`;
  } else {
    conteudo = esc(valor);
  }

  const obsClass = campo === 'observacao' ? ' cell-obs' : '';
  return `<span class="cell-editable${obsClass}" data-campo="${campo}" data-tipo="${tipo}" data-cnpj="${esc(cnpj)}" data-valor="${esc(valor)}" title="Clique para editar">${conteudo}${marcaEdit}</span>`;
}

function iniciarEdicaoInline(el) {
  if (el.classList.contains('editing')) return;
  const campo = el.dataset.campo;
  const cnpj  = el.dataset.cnpj;
  const tipo  = el.dataset.tipo || 'text';
  const valorAtual = el.dataset.valor || '';

  if (!cnpj) {
    alert('Registro sem CNPJ — não é possível editar.');
    return;
  }

  // Preserva estado original para cancelamento
  const htmlOriginal = el.innerHTML;
  const eraEmpty = el.classList.contains('cell-empty');

  // Remove cell-empty durante edição (CSS dessa classe cascateia no input)
  el.classList.remove('cell-empty');
  el.classList.add('editing');
  el.removeAttribute('title');
  el.innerHTML = '';

  // Cria nós via DOM API (mais robusto que innerHTML com template literal)
  const isObs = campo === 'observacao';
  const input = document.createElement('input');
  input.type = tipo === 'email' ? 'email' : (tipo === 'url' ? 'url' : 'text');
  input.className = isObs ? 'inline-edit-input inline-edit-obs' : 'inline-edit-input';
  input.value = valorAtual;
  input.autocomplete = 'off';
  input.spellcheck = isObs; // spell check ativo em texto livre

  const btnSave = document.createElement('button');
  btnSave.type = 'button';
  btnSave.className = 'inline-edit-save';
  btnSave.title = 'Salvar';
  btnSave.textContent = '✓';

  const btnCancel = document.createElement('button');
  btnCancel.type = 'button';
  btnCancel.className = 'inline-edit-cancel';
  btnCancel.title = 'Cancelar';
  btnCancel.textContent = '✕';

  el.appendChild(input);
  el.appendChild(btnSave);
  el.appendChild(btnCancel);

  // Foco assíncrono para evitar que o click original roube o foco
  setTimeout(() => { input.focus(); input.select(); }, 0);

  let finalizado = false;

  const restaurarOriginal = () => {
    el.classList.remove('editing');
    if (eraEmpty) el.classList.add('cell-empty');
    el.innerHTML = htmlOriginal;
    if (eraEmpty) {
      el.setAttribute('title', 'Clique para adicionar');
    } else if (valorAtual) {
      el.setAttribute('title', 'Clique para editar');
    }
  };

  const cancelar = () => {
    if (finalizado) return;
    finalizado = true;
    restaurarOriginal();
  };

  const salvar = async () => {
    if (finalizado) return;
    const novoValor = input.value.trim();
    if (novoValor === valorAtual) { cancelar(); return; }

    // Se o usuário esvaziou o campo, pede confirmação explícita de exclusão
    if (novoValor === '' && valorAtual !== '') {
      const ok = confirm(`Remover o valor atual "${valorAtual}" deste registro?`);
      if (!ok) { input.focus(); return; }
    }

    finalizado = true;
    btnSave.disabled = true;
    btnCancel.disabled = true;
    btnSave.textContent = '…';
    // Bug #6: flag para distinguir erro de rede vs. erro de validação do servidor
    let erroDeRede = false;
    try {
      let resp;
      try {
        resp = await fetch('/api/editar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cnpj, campo, valor: novoValor }),
        });
      } catch (_fetchErr) {
        erroDeRede = true;
        throw new Error('Sem conexão com o servidor. Tente novamente.');
      }
      const data = await resp.json();
      if (!data.ok) throw new Error(data.erro || 'Erro desconhecido');

      // Re-sincroniza TUDO do servidor — garante que overrides aplicados
      // no backend (inclui mudança de status para 'encontrado_manual')
      // fiquem refletidos em memória e sobrevivam a filtros/ordenações.
      await ressincronizar();

      // Pisca a linha editada para feedback visual
      const linhaEditada = document.querySelector(`tr[data-cnpj="${cssEscape(cnpj)}"]`);
      if (linhaEditada) {
        linhaEditada.classList.add('row-flash');
        setTimeout(() => linhaEditada.classList.remove('row-flash'), 1500);
      }
    } catch (e) {
      alert('Erro ao salvar: ' + e.message);
      if (erroDeRede) {
        // Erro de rede: restaura célula — usuário pode tentar mais tarde
        finalizado = true;
        restaurarOriginal();
      } else {
        // Erro de validação: mantém editor aberto para correção
        finalizado = false;
        btnSave.disabled = false;
        btnCancel.disabled = false;
        btnSave.textContent = '✓';
      }
    }
  };

  // stopPropagation em mousedown evita que o click listener do span reentre
  const pararPropagacao = (ev) => ev.stopPropagation();
  input.addEventListener('mousedown', pararPropagacao);
  input.addEventListener('click', pararPropagacao);
  btnSave.addEventListener('mousedown', pararPropagacao);
  btnCancel.addEventListener('mousedown', pararPropagacao);

  btnSave.addEventListener('click', (ev) => {
    ev.stopPropagation();
    ev.preventDefault();
    salvar();
  });
  btnCancel.addEventListener('click', (ev) => {
    ev.stopPropagation();
    ev.preventDefault();
    cancelar();
  });
  input.addEventListener('keydown', (ev) => {
    ev.stopPropagation();
    if (ev.key === 'Enter') { ev.preventDefault(); salvar(); }
    else if (ev.key === 'Escape') { ev.preventDefault(); cancelar(); }
  });
}

// ---------------------------------------------------------------------------
// Paginação
// ---------------------------------------------------------------------------

function renderizarPaginacao(total) {
  const totalPaginas = Math.ceil(total / tamanhoPagina);
  const paginacaoEl = document.getElementById('pagination');
  const numerosEl   = document.getElementById('page-numbers');

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

  // Mostra no máximo 7 botões de página com reticências
  const paginas = paginasVisiveis(paginaAtual, totalPaginas);
  paginas.forEach(p => {
    if (p === '...') {
      const span = document.createElement('span');
      span.textContent = '…';
      span.style.cssText = 'padding:0 6px;color:rgba(255,255,255,0.30);line-height:32px';
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
  // Scrolla para o topo da seção de apostas (não para o root do conteúdo)
  document.getElementById('section-table')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function mudarTamanhoPagina() {
  tamanhoPagina = parseInt(document.getElementById('page-size').value);
  paginaAtual = 1;
  renderizarTabela();
}

// ---------------------------------------------------------------------------
// Gráficos
// ---------------------------------------------------------------------------

function renderizarGraficos() {
  renderizarGraficoPizza('chart-porte', 'porte_empresa');
  renderizarGraficoPizza('chart-status', 'status', /* donut */ true);
  renderizarGraficoBarras();
  renderizarGraficoTrend();
}

function renderizarGraficoPizza(canvasId, campo, donut = false) {
  // Bug #14: campo 'status' tem 7 valores brutos — colapsar em 3 categorias visíveis
  let contagem;
  if (campo === 'status') {
    contagem = dadosFiltrados.reduce((acc, r) => {
      const st = r.status || '';
      let cat;
      if (['encontrado', 'encontrado_js', 'encontrado_manual'].includes(st)) cat = 'Com email';
      else if (st === 'nao_encontrado') cat = 'Sem email';
      else cat = 'Falhou';
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    }, {});
  } else {
    contagem = contarPor(campo);
  }
  const labels = Object.keys(contagem);
  const valores = Object.values(contagem);

  const ctx = document.getElementById(canvasId);
  if (!ctx) return;

  // Destrói instância anterior para evitar sobreposição
  const instancia = Chart.getChart(canvasId);
  if (instancia) instancia.destroy();

  new Chart(ctx, {
    type: donut ? 'doughnut' : 'pie',
    data: {
      labels,
      datasets: [{
        data: valores,
        backgroundColor: CORES.slice(0, labels.length),
        borderColor: '#161920',
        borderWidth: 2,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: 'rgba(255,255,255,0.40)',
            font: { size: 11 },
            padding: 10,
            boxWidth: 12,
          },
        },
        tooltip: estiloTooltip(),
      },
    },
  });
}

function renderizarGraficoBarras() {
  const contagem = contarPor('uf');
  const sorted = Object.entries(contagem).sort((a, b) => b[1] - a[1]);
  const labels  = sorted.map(([k]) => k || 'N/A');
  const valores = sorted.map(([, v]) => v);

  const ctx = document.getElementById('chart-uf');
  if (!ctx) return;

  const instancia = Chart.getChart('chart-uf');
  if (instancia) instancia.destroy();

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Bets',
        data: valores,
        backgroundColor: CORES[0] + 'cc',
        borderColor: CORES[0],
        borderWidth: 1,
        borderRadius: 4,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: estiloTooltip(),
      },
      scales: {
        x: {
          ticks: { color: 'rgba(255,255,255,0.30)', font: { size: 11 } },
          grid:  { color: 'rgba(255,255,255,0.04)' },
        },
        y: {
          ticks: { color: 'rgba(255,255,255,0.30)', font: { size: 11 }, stepSize: 1 },
          grid:  { color: 'rgba(255,255,255,0.04)' },
          beginAtZero: true,
        },
      },
    },
  });
}

function estiloTooltip() {
  return {
    backgroundColor: 'rgba(13,15,20,0.95)',
    borderColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    titleColor: '#FFFFFF',
    bodyColor: 'rgba(255,255,255,0.58)',
    padding: 10,
    cornerRadius: 8,
  };
}

function contarPor(campo) {
  return dadosFiltrados.reduce((acc, r) => {
    const val = r[campo] || 'Não identificado';
    acc[val] = (acc[val] || 0) + 1;
    return acc;
  }, {});
}

// ---------------------------------------------------------------------------
// Exportação CSV
// ---------------------------------------------------------------------------

function exportarCSV() {
  if (!dadosFiltrados.length) return alert('Nenhum dado para exportar.');

  const colunas = [
    'marca', 'razao_social', 'cnpj', 'url', 'email_contato', 'status',
    'url_afiliados', 'status_afiliados',
    'regime_tributario', 'porte_empresa', 'situacao_cadastral', 'capital_social',
    'natureza_juridica', 'data_abertura', 'logradouro', 'numero', 'complemento',
    'bairro', 'municipio', 'uf', 'cep', 'pais',
    'fonte_regime', 'confiabilidade_dado', 'data_coleta',
  ];

  const header = colunas.join(',');
  const linhas = dadosFiltrados.map(r =>
    colunas.map(c => csvCelula(r[c])).join(',')
  );

  const conteudo = [header, ...linhas].join('\r\n');
  const blob = new Blob(['\uFEFF' + conteudo], { type: 'text/csv;charset=utf-8' });
  download(blob, `bets_${timestamp()}.csv`);
}

// ---------------------------------------------------------------------------
// Exportação XLSX
// ---------------------------------------------------------------------------

function exportarXLSX() {
  if (!dadosFiltrados.length) return alert('Nenhum dado para exportar.');
  if (typeof XLSX === 'undefined') return alert('Biblioteca XLSX não carregada.');

  const ws = XLSX.utils.json_to_sheet(dadosFiltrados);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Bets');

  // Ajusta largura das colunas automaticamente
  const range = XLSX.utils.decode_range(ws['!ref']);
  ws['!cols'] = Array.from({ length: range.e.c + 1 }, (_, i) => {
    let max = 10;
    for (let r = range.s.r; r <= range.e.r; r++) {
      const cell = ws[XLSX.utils.encode_cell({ r, c: i })];
      if (cell && cell.v) max = Math.max(max, String(cell.v).length);
    }
    return { wch: Math.min(max + 2, 40) };
  });

  XLSX.writeFile(wb, `bets_${timestamp()}.xlsx`);
}

// ---------------------------------------------------------------------------
// Utilitários
// ---------------------------------------------------------------------------

function mostrarLoading(ativo) {
  document.getElementById('loading').style.display       = ativo ? 'flex' : 'none';
  document.getElementById('table-wrapper').style.display = ativo ? 'none' : 'block';
  if (ativo) document.getElementById('pagination').style.display = 'none';
}

function esc(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function urlCurta(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

// ---------------------------------------------------------------------------
// Indicador de saúde da URL (🟢 ok, 🟡 redirect, 🔴 erro, ⚪ desconhecido)
// ---------------------------------------------------------------------------

const URL_HEALTH_CLASS = {
  ok:           'url-dot-ok',
  redirect:     'url-dot-redirect',
  erro_http:    'url-dot-erro',
  erro_conexao: 'url-dot-erro',
  erro_ssl:     'url-dot-erro',
  erro_dns:     'url-dot-erro',
  timeout:      'url-dot-erro',
  erro:         'url-dot-erro',
  desconhecido: 'url-dot-desconhecido',
};

const URL_HEALTH_LABEL = {
  ok:           'URL ativa',
  redirect:     'Redireciona para outro domínio',
  erro_http:    'Erro HTTP',
  erro_conexao: 'Erro de conexão',
  erro_ssl:     'Erro de certificado SSL',
  erro_dns:     'Domínio não resolvido (DNS)',
  timeout:      'Timeout',
  erro:         'Erro ao validar',
  desconhecido: 'Ainda não checado',
};

function formatarDesdeQuando(iso) {
  if (!iso) return '';
  try {
    const t = new Date(iso).getTime();
    const seg = Math.max(0, Math.floor((Date.now() - t) / 1000));
    if (seg < 60)   return `há ${seg}s`;
    if (seg < 3600) return `há ${Math.floor(seg / 60)} min`;
    return `há ${Math.floor(seg / 3600)} h`;
  } catch { return ''; }
}

function urlHealthDot(r) {
  const st = r._url_health_status || 'desconhecido';
  const cls = URL_HEALTH_CLASS[st] || 'url-dot-desconhecido';
  const label = URL_HEALTH_LABEL[st] || st;
  const code = r._url_http_code ? ` · HTTP ${r._url_http_code}` : '';
  const quando = r._url_checked_at ? ` · ${formatarDesdeQuando(r._url_checked_at)}` : '';
  const redir = r._url_redirect_to ? ` → ${urlCurta(r._url_redirect_to)}` : '';
  const tooltip = esc(`${label}${code}${quando}${redir}`);
  return `<span class="url-dot ${cls}" title="${tooltip}" data-status="${st}"></span>`;
}

// ---------------------------------------------------------------------------
// Indicador de programa de afiliados (🟢 detectado, 🔴 não detectado)
// ---------------------------------------------------------------------------

function afiliadoDot(r) {
  const detectado = !!r._afiliado_detectado;
  const checado = !!r._afiliado_checado_em;
  const cls = !checado
    ? 'afiliado-dot-pendente'
    : (detectado ? 'afiliado-dot-sim' : 'afiliado-dot-nao');

  let label = !checado
    ? 'Aguardando verificação…'
    : (detectado ? 'Programa de afiliados detectado' : 'Sem programa de afiliados');
  const urlAf = r._afiliado_url ? ` · ${urlCurta(r._afiliado_url)}` : '';
  const quando = r._afiliado_checado_em
    ? ` · verificado ${formatarDesdeQuando(r._afiliado_checado_em)}`
    : '';
  const tooltip = esc(`${label}${urlAf}${quando}`);

  // Se detectado e tem URL de afiliado, torna clicável
  if (detectado && r._afiliado_url) {
    return `<a class="afiliado-dot-link" href="${esc(r._afiliado_url)}" target="_blank" rel="noopener" title="${tooltip}">`
         + `<span class="afiliado-dot ${cls}"></span>`
         + `</a>`;
  }
  return `<span class="afiliado-dot ${cls}" title="${tooltip}"></span>`;
}

/**
 * Polling de saúde das URLs — a cada 15s busca /api/url-health
 * e atualiza apenas as bolinhas no DOM (não re-renderiza tabela).
 */
function iniciarPollingUrlHealth() {
  const atualizar = async () => {
    try {
      const resp = await fetch('/api/url-health');
      const health = await resp.json();
      // Atualiza dados em memória + DOM
      todosOsDados.forEach(r => {
        const u = (r.url || '').trim();
        const info = health[u];
        if (!info) { r._url_health_status = 'desconhecido'; return; }
        r._url_health_status = info.status || 'desconhecido';
        r._url_http_code     = info.http_code || 0;
        r._url_checked_at    = info.checado_em || '';
        r._url_latencia_ms   = info.latencia_ms || 0;
        r._url_redirect_to   = info.redirecionou ? info.url_final : '';
      });
      // Atualiza bolinhas visíveis
      document.querySelectorAll('tr[data-cnpj]').forEach(tr => {
        const cnpj = tr.dataset.cnpj;
        const reg = todosOsDados.find(x => (x.cnpj || '') === cnpj);
        if (!reg) return;
        const cell = tr.querySelector('td.url-cell');
        if (!cell) return;
        const dot = cell.querySelector('.url-dot');
        if (!dot) return;
        const st = reg._url_health_status || 'desconhecido';
        const cls = URL_HEALTH_CLASS[st] || 'url-dot-desconhecido';
        dot.className = `url-dot ${cls}`;
        dot.dataset.status = st;
        const label = URL_HEALTH_LABEL[st] || st;
        const code = reg._url_http_code ? ` · HTTP ${reg._url_http_code}` : '';
        const quando = reg._url_checked_at ? ` · ${formatarDesdeQuando(reg._url_checked_at)}` : '';
        const redir = reg._url_redirect_to ? ` → ${urlCurta(reg._url_redirect_to)}` : '';
        dot.title = `${label}${code}${quando}${redir}`;
      });
      // Só reaplica filtros se nenhuma célula estiver em modo de edição (evita
      // re-render enquanto usuário está digitando numa célula inline)
      const fsaude = document.getElementById('f-saude-url');
      const editandoAgora = document.querySelector('.cell-editable.editing');
      if (fsaude && fsaude.value && !editandoAgora) aplicarFiltros();
    } catch (err) {
      // Silencioso — se /api/url-health falha, tenta de novo no próximo tick
    }
  };
  // Primeiro tick em 3s (dá tempo de o worker rodar 1-2 vezes), depois a cada 15s
  setTimeout(atualizar, 3000);
  setInterval(atualizar, 15000);
}

function badgeStatus(status) {
  // Colapsa os 7 status brutos em 3 categorias visíveis.
  // Tooltip preserva o status técnico original para debug/auditoria.
  const rotulosTecnicos = {
    'encontrado':        'Email extraído do HTML estático',
    'encontrado_js':     'Email extraído via JavaScript (Playwright)',
    'encontrado_manual': 'Email preenchido manualmente no dashboard',
    'nao_encontrado':    'Site acessado mas nenhum email foi encontrado',
    'erro_conexao':      'Não foi possível acessar o site (timeout/bloqueio)',
    'bloqueado_robots':  'robots.txt do site proíbe coleta automática',
    'sem_url':           'Registro sem URL cadastrada',
  };
  const tooltip = rotulosTecnicos[status] || status || '—';

  if (['encontrado', 'encontrado_js', 'encontrado_manual'].includes(status)) {
    return `<span class="badge badge-success" title="${esc(tooltip)}">Com email</span>`;
  }
  if (status === 'nao_encontrado') {
    return `<span class="badge badge-danger" title="${esc(tooltip)}">Sem email</span>`;
  }
  if (['erro_conexao', 'bloqueado_robots', 'sem_url'].includes(status)) {
    return `<span class="badge badge-warning" title="${esc(tooltip)}">Falhou</span>`;
  }
  return `<span class="badge badge-neutral">—</span>`;
}

function formatarBRL(valor, completo = false) {
  const n = parseFloat(valor);
  if (!n || isNaN(n)) return '—';
  if (completo) {
    return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }
  // Versão compacta: R$ 1,2M / R$ 350K / R$ 1.234
  if (n >= 1_000_000) return 'R$ ' + (n / 1_000_000).toFixed(1).replace('.', ',') + 'M';
  if (n >= 1_000)     return 'R$ ' + (n / 1_000).toFixed(0) + 'K';
  return 'R$ ' + n.toFixed(0);
}

function formatarData(iso) {
  if (!iso) return '—';
  const s = String(iso).substring(0, 10);
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  return m ? `${m[3]}/${m[2]}/${m[1]}` : s;
}

function csvCelula(valor) {
  const s = String(valor ?? '');
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

function timestamp() {
  const d = new Date();
  return d.toISOString().substring(0, 19).replace(/[T:]/g, '-');
}

function download(blob, nome) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = nome;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ---------------------------------------------------------------------------
// DESIGN SYSTEM v2 — Sparklines (Canvas API — leve, sem Chart.js)
// ---------------------------------------------------------------------------

/**
 * Gera dados de sparkline simulando uma tendência crescente em direção ao valor atual.
 * Puramente decorativo — reflete a magnitude do KPI.
 */
function _sparkData(valorAtual, variacao = 0.28) {
  const v = typeof valorAtual === 'number' && !isNaN(valorAtual) ? Math.max(0, valorAtual) : 0;
  if (v === 0) return Array(8).fill(0);
  const pts = [];
  for (let i = 0; i < 7; i++) {
    const progresso = 0.62 + (i / 6) * 0.38;
    const ruido     = 1 + (Math.random() - 0.5) * variacao;
    pts.push(Math.max(0, Math.round(v * progresso * ruido)));
  }
  pts.push(v);
  return pts;
}

function _drawSparkline(canvasId, data, color) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width;
  const H = canvas.height;
  ctx.clearRect(0, 0, W, H);

  // Guarda explícita: array vazio faria Math.max(...[]) === -Infinity
  if (!data || data.length === 0) return;
  if (data.length < 2) return;
  const maxVal = Math.max(...data);
  if (!isFinite(maxVal) || maxVal === 0) return;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pad = H * 0.08;

  const pts = data.map((v, i) => ({
    x: (i / (data.length - 1)) * W,
    y: H - pad - ((v - min) / range) * (H - pad * 2),
  }));

  // Área preenchida com gradiente
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, color + '40');
  grad.addColorStop(1, color + '00');

  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < pts.length; i++) {
    const mx = (pts[i - 1].x + pts[i].x) / 2;
    ctx.bezierCurveTo(mx, pts[i - 1].y, mx, pts[i].y, pts[i].x, pts[i].y);
  }
  ctx.lineTo(W, H);
  ctx.lineTo(0, H);
  ctx.closePath();
  ctx.fillStyle = grad;
  ctx.fill();

  // Linha
  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < pts.length; i++) {
    const mx = (pts[i - 1].x + pts[i].x) / 2;
    ctx.bezierCurveTo(mx, pts[i - 1].y, mx, pts[i].y, pts[i].x, pts[i].y);
  }
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  ctx.stroke();
}

function renderizarSparklines(stats) {
  const GREEN = '#39FF87';
  const RED   = '#FF4D6A';
  const AMBER = '#FFB547';
  const BLUE  = '#4F9EFF';

  _drawSparkline('spark-total',      _sparkData(stats.total, 0.20),                   GREEN);
  _drawSparkline('spark-email',      _sparkData(stats.com_email, 0.25),               GREEN);
  _drawSparkline('spark-sem-email',  _sparkData(stats.sem_email, 0.30),               RED);
  _drawSparkline('spark-afiliados',  _sparkData(stats.com_afiliados, 0.35),           BLUE);
  _drawSparkline('spark-ativas',     _sparkData(stats.urls_ativas, 0.22),             GREEN);
  _drawSparkline('spark-inativas',   _sparkData(stats.urls_inativas, 0.40),           RED);
  _drawSparkline('spark-editados',   _sparkData(stats.editados_manualmente, 0.45),    AMBER);
  _drawSparkline('spark-atualizacao',[], GREEN); // sem dado numérico claro
}

// ---------------------------------------------------------------------------
// DESIGN SYSTEM v2 — Gauge de taxa de email (Canvas API)
// ---------------------------------------------------------------------------

function renderizarGauge(comEmail, total) {
  const canvas = document.getElementById('gauge-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W  = canvas.width;  // 180
  const H  = canvas.height; // 110
  const cx = W / 2;
  const cy = 98;
  const r  = 68;
  const pct = total > 0 ? Math.max(0, Math.min(1, comEmail / total)) : 0;

  ctx.clearRect(0, 0, W, H);

  // Arco de fundo
  ctx.beginPath();
  ctx.arc(cx, cy, r, Math.PI, 2 * Math.PI);
  ctx.strokeStyle = 'rgba(255,255,255,0.05)';
  ctx.lineWidth = 14;
  ctx.lineCap = 'round';
  ctx.stroke();

  // Arco preenchido — gradiente verde
  if (pct > 0.01) {
    const endAngle = Math.PI + pct * Math.PI;
    const grad = ctx.createLinearGradient(cx - r, cy, cx + r, cy);
    grad.addColorStop(0, '#39FF87');
    grad.addColorStop(1, '#00D68F');

    ctx.beginPath();
    ctx.arc(cx, cy, r, Math.PI, endAngle);
    ctx.strokeStyle = grad;
    ctx.lineWidth = 14;
    ctx.lineCap = 'round';
    ctx.stroke();

    // Ponto luminoso na extremidade
    const tipX = cx + r * Math.cos(endAngle);
    const tipY = cy + r * Math.sin(endAngle);
    ctx.save();
    ctx.beginPath();
    ctx.arc(tipX, tipY, 4.5, 0, 2 * Math.PI);
    ctx.fillStyle = '#39FF87';
    ctx.shadowColor = '#39FF87';
    ctx.shadowBlur = 12;
    ctx.fill();
    ctx.restore();
  }

  // Percentual central
  ctx.fillStyle = '#39FF87';
  ctx.font = '800 22px Outfit, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(Math.round(pct * 100) + '%', cx, cy - 7);

  // Subtítulo
  ctx.fillStyle = 'rgba(255,255,255,0.30)';
  ctx.font = '500 9px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('com email', cx, cy + 7);
}

// ---------------------------------------------------------------------------
// DESIGN SYSTEM v2 — Barras de progresso (status email)
// ---------------------------------------------------------------------------

function renderizarProgressBars(stats) {
  const container = document.getElementById('progress-bars');
  if (!container) return;

  const total    = Math.max(1, stats.total || 1);
  const comEmail = stats.com_email || 0;
  const semEmail = stats.sem_email || 0;
  const falhou   = total - comEmail - semEmail;

  const itens = [
    { label: 'Com email',  valor: comEmail,         cor: '#39FF87' },
    { label: 'Sem email',  valor: semEmail,          cor: '#FF4D6A' },
    { label: 'Falhou',     valor: Math.max(0,falhou),cor: '#FFB547' },
  ];

  container.innerHTML = itens.map(item => {
    const pct = Math.round((item.valor / total) * 100);
    return `
      <div class="progress-item">
        <div class="progress-meta">
          <span class="progress-dot" style="background:${item.cor};box-shadow:0 0 6px ${item.cor}66"></span>
          <span class="progress-label">${item.label}</span>
          <span class="progress-pct">${pct}%</span>
        </div>
        <div class="progress-track">
          <div class="progress-fill" style="width:${pct}%;background:${item.cor}"></div>
        </div>
      </div>
    `;
  }).join('');
}

// ---------------------------------------------------------------------------
// DESIGN SYSTEM v2 — Gráfico de linha: evolução temporal por status de email
// ---------------------------------------------------------------------------

function _buildTrendData() {
  // Agrupa por mês de data_coleta
  const meses = {};
  todosOsDados.forEach(r => {
    const mes = (r.data_coleta || '').substring(0, 7);
    if (!mes || mes.length < 7) return;
    if (!meses[mes]) meses[mes] = { com: 0, sem: 0 };
    const temEmail = ['encontrado', 'encontrado_js', 'encontrado_manual'].includes(r.status);
    if (temEmail) meses[mes].com++;
    else          meses[mes].sem++;
  });

  const chaves = Object.keys(meses).sort();

  // Se dados insuficientes, usa série sintética ancorada nos totais reais
  if (chaves.length < 3) {
    const totalCom = todosOsDados.filter(r =>
      ['encontrado', 'encontrado_js', 'encontrado_manual'].includes(r.status)).length;
    const totalSem = todosOsDados.length - totalCom;

    const fabricar = (v, fator = 1) => [
      Math.round(v * 0.55 * fator), Math.round(v * 0.63 * fator),
      Math.round(v * 0.72 * fator), Math.round(v * 0.81 * fator),
      Math.round(v * 0.90 * fator), Math.round(v * 0.96 * fator),
      v,
    ];

    return {
      labels: ['T-6', 'T-5', 'T-4', 'T-3', 'T-2', 'T-1', 'Atual'],
      com:    fabricar(totalCom, 1.0),
      sem:    fabricar(totalSem, 1.0),
    };
  }

  return {
    labels: chaves.map(k => {
      const [y, m] = k.split('-');
      return `${m}/${y.substring(2)}`;
    }),
    com:  chaves.map(k => meses[k].com),
    sem:  chaves.map(k => meses[k].sem),
  };
}

function renderizarGraficoTrend() {
  const ctx = document.getElementById('chart-trend');
  if (!ctx) return;

  const inst = Chart.getChart('chart-trend');
  if (inst) inst.destroy();

  const { labels, com, sem } = _buildTrendData();

  new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Com Email',
          data: com,
          borderColor: '#39FF87',
          backgroundColor: 'rgba(57,255,135,0.07)',
          fill: true,
          tension: 0.5,
          pointRadius: 3,
          pointBackgroundColor: '#39FF87',
          pointBorderColor: '#0D0F14',
          pointBorderWidth: 2,
        },
        {
          label: 'Sem Email',
          data: sem,
          borderColor: '#4F9EFF',
          backgroundColor: 'rgba(79,158,255,0.05)',
          fill: true,
          tension: 0.5,
          pointRadius: 3,
          pointBackgroundColor: '#4F9EFF',
          pointBorderColor: '#0D0F14',
          pointBorderWidth: 2,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: estiloTooltip(),
      },
      scales: {
        x: {
          ticks: { color: 'rgba(255,255,255,0.30)', font: { size: 11 } },
          grid:  { color: 'rgba(255,255,255,0.04)' },
        },
        y: {
          ticks: { color: 'rgba(255,255,255,0.30)', font: { size: 11 } },
          grid:  { color: 'rgba(255,255,255,0.04)' },
          beginAtZero: true,
        },
      },
    },
  });
}
