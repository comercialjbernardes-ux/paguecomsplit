"""
enriquecer_cnpj.py — Enriquecimento de dados via CNPJ
======================================================
Fontes (em ordem de prioridade):
  1. BrasilAPI  — https://brasilapi.com.br/api/cnpj/v1/{cnpj}  (gratuito, sem auth)
  2. ReceitaWS  — https://receitaws.com.br/v1/cnpj/{cnpj}      (gratuito, 3 req/min)
  3. Scraping   — rodapé do próprio site da bet

Campos retornados: localização completa + dados tributários.

Contexto regulatório (Lei 14.790/2023):
  - Bets recolhem 12% sobre GGR (Gross Gaming Revenue) à União
  - Operadores de grande porte (porte DEMAIS) tipicamente adotam Lucro Real
  - Simples Nacional é inviável para receita bruta > R$4,8M/ano
  - Lucro Presumido é mais comum em operadores de médio porte
"""

import logging
import random
import re
import threading
import time

import requests
from bs4 import BeautifulSoup

logger = logging.getLogger("coletar_bets")

# ---------------------------------------------------------------------------
# Constantes
# ---------------------------------------------------------------------------

USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:124.0) Gecko/20100101 Firefox/124.0",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.3 Safari/605.1.15",
]

# Padrões textuais de regime tributário encontrados em rodapés de sites
_PADROES_REGIME = [
    ("Simples Nacional", r"simples\s+nacional"),
    ("Lucro Real",       r"lucro\s+real"),
    ("Lucro Presumido",  r"lucro\s+presumido"),
    ("MEI",              r"\bmei\b"),
    ("Imune",            r"\bimune\b"),
    ("Isento",           r"\bisento\b"),
]

TIMEOUT = 15  # segundos

# Cache compartilhado por CNPJ limpo — evita consultas duplicadas quando
# múltiplas marcas pertencem ao mesmo CNPJ (ex: BPX tem 3 marcas)
_CNPJ_CACHE: dict[str, dict] = {}
_CNPJ_LOCK = threading.Lock()

# ---------------------------------------------------------------------------
# Utilitários
# ---------------------------------------------------------------------------


def limpar_cnpj(cnpj: str) -> str:
    """Remove máscara do CNPJ: '55.238.676/0001-00' → '55238676000100'."""
    return re.sub(r"[^\d]", "", cnpj or "")


def _headers() -> dict:
    return {
        "User-Agent": random.choice(USER_AGENTS),
        "Accept": "application/json, text/html, */*;q=0.8",
        "Accept-Language": "pt-BR,pt;q=0.9",
    }


def _campos_vazios() -> dict:
    return {
        "logradouro": "", "numero": "", "complemento": "", "bairro": "",
        "municipio": "", "uf": "", "cep": "", "pais": "",
        "regime_tributario": "Não identificado",
        "porte_empresa": "",
        "situacao_cadastral": "",
        "capital_social": 0.0,
        "natureza_juridica": "",
        "data_abertura": "",
        "fonte_regime": "nao_identificado",
        "confiabilidade_dado": "baixa",
    }


# ---------------------------------------------------------------------------
# Inferência de regime tributário a partir dos dados da API
# ---------------------------------------------------------------------------


def inferir_regime(opcao_simples: bool, opcao_mei: bool,
                   capital: float, porte: str) -> tuple[str, bool]:
    """
    Infere regime tributário com base nos flags da Receita Federal.
    Retorna (regime, flag_confirmado_pela_receita).

    flag_confirmado_pela_receita=True significa que a Receita Federal confirmou
    explicitamente o regime (opcao_pelo_simples / opcao_pelo_mei).
    False significa que o regime foi inferido por heurística de porte/capital.

    Hierarquia:
      MEI > Simples Nacional > Lucro Real (por porte) > Lucro Presumido > Não identificado

    Nota: capital social ≠ receita bruta. A obrigatoriedade de Lucro Real
    pela Lei 9.718/98 art. 14 se baseia na receita bruta anual (> R$78M),
    não no capital social. Usamos o porte ("DEMAIS") como proxy mais confiável.
    """
    if opcao_mei:
        return "MEI", True
    if opcao_simples:
        return "Simples Nacional", True
    # Porte DEMAIS = empresa não enquadrada como ME/EPP → Lucro Real no setor de bets
    if str(porte).upper() == "DEMAIS":
        return "Lucro Real", False
    # ME/EPP sem opção pelo Simples → mais provável Lucro Presumido
    if str(porte).upper() in ("ME", "EPP", "MICRO EMPRESA"):
        return "Lucro Presumido", False
    return "Não identificado", False


# ---------------------------------------------------------------------------
# Fonte 1 — BrasilAPI
# ---------------------------------------------------------------------------


def consultar_brasilapi(cnpj: str) -> dict | None:
    """
    Consulta BrasilAPI para obter dados cadastrais do CNPJ.
    Tenta até 3 vezes com backoff exponencial em caso de 429.
    """
    cnpj_limpo = limpar_cnpj(cnpj)
    if len(cnpj_limpo) != 14:
        return None

    url = f"https://brasilapi.com.br/api/cnpj/v1/{cnpj_limpo}"
    for tentativa in range(3):
        try:
            resp = requests.get(url, headers=_headers(), timeout=TIMEOUT)
            if resp.status_code == 200:
                return resp.json()
            if resp.status_code == 429:
                espera = 2 ** tentativa + random.uniform(1, 3)
                logger.debug(f"BrasilAPI 429 — aguardando {espera:.1f}s (CNPJ {cnpj})")
                time.sleep(espera)
                continue
            if resp.status_code in (404, 400):
                logger.debug(f"BrasilAPI: CNPJ {cnpj} não encontrado")
                return None
            logger.debug(f"BrasilAPI HTTP {resp.status_code} para CNPJ {cnpj}")
            return None
        except Exception as e:
            logger.debug(f"BrasilAPI erro (tentativa {tentativa + 1}) para {cnpj}: {e}")
            if tentativa < 2:
                time.sleep(2 ** tentativa)
    return None


def _normalizar_brasilapi(dados: dict) -> dict:
    """Converte resposta da BrasilAPI no formato interno padronizado."""
    try:
        capital = float(dados.get("capital_social") or 0)
    except (ValueError, TypeError):
        capital = 0.0

    opcao_simples = bool(dados.get("opcao_pelo_simples"))
    opcao_mei = bool(dados.get("opcao_pelo_mei"))
    porte = str(dados.get("porte") or "")

    regime, confirmado = inferir_regime(opcao_simples, opcao_mei, capital, porte)

    # natureza_juridica pode vir como dict {"codigo":..., "descricao":...} na BrasilAPI
    nat_jur_raw = dados.get("natureza_juridica", "")
    if isinstance(nat_jur_raw, dict):
        nat_jur = nat_jur_raw.get("descricao") or str(nat_jur_raw)
    else:
        nat_jur = str(nat_jur_raw or "")

    # descricao_situacao_cadastral pode vir como dict em algumas respostas
    sit_cad_raw = dados.get("descricao_situacao_cadastral", "")
    if isinstance(sit_cad_raw, dict):
        sit_cad = sit_cad_raw.get("descricao") or str(sit_cad_raw)
    else:
        sit_cad = str(sit_cad_raw or "")

    return {
        "logradouro": str(dados.get("logradouro") or ""),
        "numero": str(dados.get("numero") or ""),
        "complemento": str(dados.get("complemento") or ""),
        "bairro": str(dados.get("bairro") or ""),
        "municipio": str(dados.get("municipio") or ""),
        "uf": str(dados.get("uf") or ""),
        "cep": str(dados.get("cep") or "").replace("-", ""),
        "pais": str(dados.get("descricao_pais") or "BRASIL") or "BRASIL",
        "regime_tributario": regime,
        "porte_empresa": porte,
        "situacao_cadastral": sit_cad,
        "capital_social": capital,
        "natureza_juridica": nat_jur,
        "data_abertura": str(dados.get("data_inicio_atividade") or ""),
        "fonte_regime": "brasilapi" if confirmado else "inferido",
        "confiabilidade_dado": "alta" if confirmado else "media",
    }


# ---------------------------------------------------------------------------
# Fonte 2 — ReceitaWS (fallback)
# ---------------------------------------------------------------------------


def consultar_receitaws(cnpj: str) -> dict | None:
    """
    Consulta ReceitaWS — fallback quando BrasilAPI falha.
    Rate limit: ~3 req/min por IP → delay obrigatório de 20s.
    """
    cnpj_limpo = limpar_cnpj(cnpj)
    if len(cnpj_limpo) != 14:
        return None

    url = f"https://receitaws.com.br/v1/cnpj/{cnpj_limpo}"
    for tentativa in range(2):
        try:
            time.sleep(20 + random.uniform(0, 5))  # respeita rate limit
            resp = requests.get(url, headers=_headers(), timeout=TIMEOUT)
            if resp.status_code == 200:
                try:
                    dados = resp.json()
                except ValueError:
                    logger.debug(f"ReceitaWS: resposta não-JSON para CNPJ {cnpj}")
                    return None
                if dados.get("status") == "ERROR":
                    logger.debug(f"ReceitaWS: CNPJ {cnpj} retornou erro: {dados.get('message')}")
                    return None
                return dados
            if resp.status_code == 429:
                logger.debug(f"ReceitaWS 429 — aguardando 30s (CNPJ {cnpj})")
                time.sleep(30)
                continue
            if resp.status_code in (404, 400):
                logger.debug(f"ReceitaWS: CNPJ {cnpj} não encontrado (HTTP {resp.status_code})")
                return None
            logger.debug(f"ReceitaWS HTTP {resp.status_code} para CNPJ {cnpj}")
            return None
        except Exception as e:
            logger.debug(f"ReceitaWS erro (tentativa {tentativa + 1}) para {cnpj}: {e}")
    return None


def _parse_capital_receitaws(valor: str | float | None) -> float:
    """
    Converte capital social do formato ReceitaWS para float.
    ReceitaWS retorna strings como 'R$ 100.000,00' ou números.
    """
    if valor is None:
        return 0.0
    try:
        if isinstance(valor, (int, float)):
            return float(valor)
        # Remove 'R$', espaços, pontos de milhar; troca vírgula por ponto
        # ATENÇÃO: [R$\s] em regex trata '$' como literal, não âncora — OK em conjunto []
        # mas para evitar ambiguidade usamos substituição literal de "R$" antes do regex
        limpo = str(valor).replace("R$", "").replace("R ", "")
        limpo = re.sub(r"\s", "", limpo)       # remove espaços restantes
        limpo = limpo.replace(".", "").replace(",", ".")
        return float(limpo)
    except (ValueError, TypeError):
        return 0.0


def _normalizar_receitaws(dados: dict) -> dict:
    """Converte resposta da ReceitaWS no formato interno padronizado."""
    capital = _parse_capital_receitaws(dados.get("capital_social"))
    porte = str(dados.get("porte") or "")

    # ReceitaWS aninha Simples Nacional em dados["simples"]["optante"]
    simples_info = dados.get("simples") or {}
    mei_info = dados.get("mei") or {}
    opcao_simples = bool(simples_info.get("optante")) if isinstance(simples_info, dict) else False
    opcao_mei = bool(mei_info.get("optante")) if isinstance(mei_info, dict) else False

    regime, confirmado = inferir_regime(opcao_simples, opcao_mei, capital, porte)

    # natureza_juridica pode vir como dict ou string dependendo da fonte
    nat_jur_raw_rws = dados.get("natureza_juridica", "")
    if isinstance(nat_jur_raw_rws, dict):
        nat_jur_rws = nat_jur_raw_rws.get("descricao") or str(nat_jur_raw_rws)
    else:
        nat_jur_rws = str(nat_jur_raw_rws or "")

    return {
        "logradouro": str(dados.get("logradouro") or ""),
        "numero": str(dados.get("numero") or ""),
        "complemento": str(dados.get("complemento") or ""),
        "bairro": str(dados.get("bairro") or ""),
        "municipio": str(dados.get("municipio") or ""),
        "uf": str(dados.get("uf") or ""),
        "cep": str(dados.get("cep") or "").replace(".", "").replace("-", ""),
        "pais": "BRASIL",
        "regime_tributario": regime,
        "porte_empresa": porte,
        "situacao_cadastral": str(dados.get("situacao") or ""),
        "capital_social": capital,
        "natureza_juridica": nat_jur_rws,
        "data_abertura": str(dados.get("abertura") or ""),
        # "receitaws" quando a Receita confirmou explicitamente; "inferido" por heurística
        "fonte_regime": "receitaws" if confirmado else "inferido",
        "confiabilidade_dado": "alta" if confirmado else "media",
    }


# ---------------------------------------------------------------------------
# Fonte 3 — Scraping do site da bet
# ---------------------------------------------------------------------------


def buscar_regime_no_site(html: str) -> str | None:
    """
    Busca padrões de regime tributário no HTML do site.
    Foca no rodapé onde dados fiscais costumam aparecer.
    """
    soup = BeautifulSoup(html, "html.parser")

    # Prioriza rodapé
    for seletor in ("footer", '[class*="footer"]', '[id*="footer"]',
                    '[class*="rodape"]', '[id*="rodape"]'):
        rodape = soup.select_one(seletor)
        if rodape:
            texto = rodape.get_text(" ")
            for regime, padrao in _PADROES_REGIME:
                if re.search(padrao, texto, re.IGNORECASE):
                    return regime

    # Busca no texto completo como fallback
    texto_completo = soup.get_text(" ")
    for regime, padrao in _PADROES_REGIME:
        if re.search(padrao, texto_completo, re.IGNORECASE):
            return regime

    return None


# ---------------------------------------------------------------------------
# Orquestrador principal
# ---------------------------------------------------------------------------


def enriquecer_empresa(cnpj: str, url: str = "",
                       sessao: requests.Session | None = None) -> dict:
    """
    Enriquece os dados de uma empresa com informações cadastrais e tributárias.

    Tenta as fontes em ordem: BrasilAPI → ReceitaWS → scraping do site.
    Usa cache por CNPJ limpo para evitar consultas duplicadas quando múltiplas
    marcas pertencem ao mesmo CNPJ.

    Retorna dict com campos de localização e tributação.
    """
    cnpj_limpo = limpar_cnpj(cnpj)
    if not cnpj_limpo or len(cnpj_limpo) != 14:
        logger.debug(f"CNPJ inválido: '{cnpj}'")
        return _campos_vazios()

    # Double-checked locking: evita consultas paralelas duplicadas para o mesmo CNPJ.
    # Placeholder None indica "em processamento" por outro thread.
    # Ambos os checks verificam se o valor é não-None antes de retornar,
    # evitando o bug "NoneType has no attribute 'copy'" quando outra thread
    # ainda está fazendo a consulta.
    if cnpj_limpo in _CNPJ_CACHE:
        with _CNPJ_LOCK:
            cached = _CNPJ_CACHE.get(cnpj_limpo)
            if cached is not None:
                logger.debug(f"CNPJ {cnpj} — usando cache (hit rápido)")
                return cached.copy()
            # None = placeholder de outro thread; prossegue para consulta própria

    with _CNPJ_LOCK:
        cached = _CNPJ_CACHE.get(cnpj_limpo)
        if cached is not None:
            logger.debug(f"CNPJ {cnpj} — usando cache (hit após lock)")
            return cached.copy()
        # Marca como "em processamento" — impede terceiro worker duplicar a consulta
        _CNPJ_CACHE[cnpj_limpo] = None  # placeholder temporário

    # Fonte 1: BrasilAPI (fora do lock — operação de rede pode ser lenta)
    dados = consultar_brasilapi(cnpj)
    def _salvar_cache(res: dict) -> dict:
        with _CNPJ_LOCK:
            _CNPJ_CACHE[cnpj_limpo] = res
        return res.copy()

    if dados:
        resultado = _normalizar_brasilapi(dados)
        logger.info(
            f"CNPJ {cnpj} — BrasilAPI OK | "
            f"regime: {resultado['regime_tributario']} | "
            f"UF: {resultado['uf']} | {resultado['municipio']}"
        )
        return _salvar_cache(resultado)

    # Fonte 2: ReceitaWS
    logger.debug(f"CNPJ {cnpj} — BrasilAPI falhou, tentando ReceitaWS (delay 20s)...")
    dados = consultar_receitaws(cnpj)
    if dados:
        resultado = _normalizar_receitaws(dados)
        logger.info(
            f"CNPJ {cnpj} — ReceitaWS OK | "
            f"regime: {resultado['regime_tributario']} | "
            f"UF: {resultado['uf']}"
        )
        return _salvar_cache(resultado)

    # Fonte 3: Scraping do site da bet
    if url and sessao:
        try:
            from coletar_bets import buscar_html
            html = buscar_html(url, sessao)
            if html:
                regime = buscar_regime_no_site(html)
                if regime:
                    resultado = _campos_vazios()
                    resultado.update({
                        "regime_tributario": regime,
                        "fonte_regime": "site",
                        "confiabilidade_dado": "media",
                    })
                    logger.info(f"CNPJ {cnpj} — regime '{regime}' encontrado no site")
                    return _salvar_cache(resultado)
        except Exception as e:
            logger.debug(f"Scraping de regime falhou para {url}: {e}")

    logger.info(f"CNPJ {cnpj} — regime não identificado em nenhuma fonte")
    return _salvar_cache(_campos_vazios())
