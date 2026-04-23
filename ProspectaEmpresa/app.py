"""
app.py — Servidor Flask do ProspectaEmpresa
============================================
Rotas:
  GET  /                          — serve index.html
  GET  /api/buscar                — busca empresas via Minha Receita
  GET  /api/buscar/status/<id>    — status de busca assíncrona
  GET  /api/cnpj/<cnpj>           — enriquece CNPJ (CNPJá → BrasilAPI → ReceitaWS)
  GET  /api/cnaes                 — lista de CNAEs para autocomplete
  GET  /api/municipios/<uf>       — municípios de uma UF (baseado nos resultados em memória)
  GET  /api/stats                 — KPIs da sessão atual

Uso:
    pip install flask requests
    python app.py
    Acesse: http://localhost:5000
"""

import json
import time
import uuid
import threading
from datetime import datetime
from pathlib import Path

import requests
from flask import Flask, jsonify, render_template, request

app = Flask(__name__)

# ---------------------------------------------------------------------------
# Cache em memória da última busca
# ---------------------------------------------------------------------------

# Últimos resultados carregados (lista de dicts)
_resultados: list[dict] = []
_cache_municipios: dict[str, list] = {}  # cache de municípios por UF (BrasilAPI)
# Mapa de jobs assíncronos: job_id -> {"status": "running"|"done"|"error", "dados": [...], "erro": "..."}
_jobs: dict[str, dict] = {}
_lock = threading.Lock()

# ---------------------------------------------------------------------------
# Utilitários de requisição HTTP com retry para 429
# ---------------------------------------------------------------------------

HEADERS_PADRAO = {
    "User-Agent": "ProspectaEmpresa/1.0 (uso educacional/pesquisa)",
    "Accept": "application/json",
}


def _get(url: str, params: dict = None, timeout: int = 15) -> requests.Response | None:
    """
    Faz GET com retry automático em caso de 429 (rate limit).
    Aguarda 60s e tenta mais 1 vez. Retorna None em erro de conexão/timeout.
    """
    for tentativa in range(2):
        try:
            resp = requests.get(url, params=params, headers=HEADERS_PADRAO, timeout=timeout)
            if resp.status_code == 429:
                if tentativa == 0:
                    print(f"[429] Rate limit em {url} — aguardando 60s...")
                    time.sleep(60)
                    continue
                return resp  # Segunda tentativa ainda 429 — deixa o caller tratar
            return resp
        except requests.exceptions.Timeout:
            print(f"[TIMEOUT] {url}")
            return None
        except requests.exceptions.ConnectionError as e:
            print(f"[CONN ERROR] {url}: {e}")
            return None
    return None


# ---------------------------------------------------------------------------
# Minha Receita — busca por filtros
# ---------------------------------------------------------------------------

MINHA_RECEITA_URL = "https://minhareceita.org/"


def _buscar_minha_receita(params_busca: dict) -> tuple[list[dict], str | None]:
    """
    Busca empresas na API Minha Receita com os filtros fornecidos.
    Retorna (lista_de_empresas, cursor_proximo).
    """
    params = {}

    # Mapeia os parâmetros recebidos para os da API
    if params_busca.get("cnae"):
        params["cnae_fiscal"] = params_busca["cnae"]
    if params_busca.get("uf"):
        params["uf"] = params_busca["uf"].upper()
    if params_busca.get("municipio"):
        params["municipio"] = params_busca["municipio"]
    if params_busca.get("cursor"):
        params["cursor"] = params_busca["cursor"]

    # Limite por página (máximo suportado pela API)
    params["limit"] = 100

    resp = _get(MINHA_RECEITA_URL, params=params)

    if resp is None:
        return [], None
    if resp.status_code == 404:
        return [], None
    if resp.status_code == 429:
        return [], None
    if resp.status_code != 200:
        print(f"[Minha Receita] HTTP {resp.status_code}: {resp.text[:200]}")
        return [], None

    try:
        data = resp.json()
    except ValueError:
        return [], None

    # A API retorna {"data": [...], "cursor": "VALOR"}.
    # O campo correto é "cursor" — não "next" nem "cursor_next".
    if isinstance(data, list):
        empresas = data
        proximo_cursor = None
    elif isinstance(data, dict):
        empresas = data.get("data", data.get("companies", []))
        proximo_cursor = (
            data.get("cursor") or
            data.get("next") or
            data.get("cursor_next") or
            None
        )
        # Cursor vazio string equivale a sem próxima página
        if proximo_cursor is not None:
            proximo_cursor = str(proximo_cursor).strip() or None
    else:
        return [], None

    # Normaliza campos e converte tipos
    resultado = []
    for emp in empresas:
        empresa = _normalizar_empresa(emp)
        resultado.append(empresa)

    # Garante que apenas empresas com o CNAE como principal são retornadas.
    # A Minha Receita pode incluir resultados de CNAEs secundários dependendo
    # do parâmetro usado — este filtro elimina falsos positivos.
    if params_busca.get("cnae"):
        cnae_ref = str(params_busca["cnae"]).replace(".", "").replace("-", "").replace("/", "")
        resultado = [
            r for r in resultado
            if str(r.get("cnae_principal") or "").replace(".", "").replace("-", "").startswith(cnae_ref)
            or cnae_ref.startswith(str(r.get("cnae_principal") or "").replace(".", "").replace("-", ""))
        ]

    return resultado, proximo_cursor


# Mapeia os valores de porte retornados pela Minha Receita para as
# abreviações usadas nos filtros e badges do frontend.
# A API retorna strings longas ("MICRO EMPRESA"), o frontend filtra por
# abreviações ("ME") — sem esse mapa nenhuma filtragem por porte funciona.
_PORTE_MAPA = {
    "MICRO EMPRESA":                        "ME",
    "MICROEMPRESA":                         "ME",
    "EMPRESA DE PEQUENO PORTE":             "EPP",
    "MICROEMPREENDEDOR INDIVIDUAL":         "MEI",
    "MICROEMPREENDEDOR INDIVIDUAL - MEI":   "MEI",
    "MEI":                                  "MEI",
    "ME":                                   "ME",
    "EPP":                                  "EPP",
    "DEMAIS":                               "DEMAIS",
    "GRANDE":                               "GRANDE",
}


def _normalizar_empresa(emp: dict) -> dict:
    """
    Normaliza um registro vindo da Minha Receita para o formato interno.
    Converte capital_social para float, formata CNPJ, etc.
    """
    # Formata CNPJ para exibição: 00.000.000/0000-00
    cnpj_raw = str(emp.get("cnpj") or "").replace(".", "").replace("/", "").replace("-", "").strip()
    cnpj_fmt = _formatar_cnpj(cnpj_raw) if cnpj_raw else ""

    # Converte capital social para float
    try:
        capital = float(emp.get("capital_social") or 0)
    except (ValueError, TypeError):
        capital = 0.0

    # Extrai telefones (a API pode devolver em diferentes formatos)
    telefone1 = str(emp.get("ddd_telefone_1") or "").strip()
    telefone2 = str(emp.get("ddd_telefone_2") or "").strip()
    telefone = _formatar_telefone(telefone1) or _formatar_telefone(telefone2)

    # Constrói endereço completo
    partes_end = [
        emp.get("logradouro"), emp.get("numero"), emp.get("complemento"),
        emp.get("bairro"),
    ]
    endereco = ", ".join(p for p in partes_end if p and str(p).strip() and str(p).strip() != "0")

    return {
        "cnpj":                  cnpj_fmt,
        "cnpj_raw":              cnpj_raw,
        "razao_social":          str(emp.get("razao_social") or "").strip(),
        "nome_fantasia":         str(emp.get("nome_fantasia") or "").strip(),
        "situacao_cadastral":    str(emp.get("situacao_cadastral") or "").strip(),
        "data_abertura":         str(emp.get("data_inicio_atividade") or emp.get("data_abertura") or "").strip(),
        "cnae_principal":        str(emp.get("cnae_fiscal") or "").strip(),
        "cnae_descricao":        str(emp.get("cnae_fiscal_descricao") or "").strip(),
        "cnaes_secundarios":     emp.get("cnaes_secundarios") or [],
        "natureza_juridica":     str(emp.get("natureza_juridica") or "").strip(),
        "municipio":             str(emp.get("municipio") or "").strip(),
        "uf":                    str(emp.get("uf") or "").strip().upper(),
        "cep":                   str(emp.get("cep") or "").strip(),
        "logradouro":            str(emp.get("logradouro") or "").strip(),
        "numero":                str(emp.get("numero") or "").strip(),
        "complemento":           str(emp.get("complemento") or "").strip(),
        "bairro":                str(emp.get("bairro") or "").strip(),
        "endereco":              endereco,
        "telefone":              telefone,
        "email":                 str(emp.get("email") or "").strip().lower(),
        "capital_social":        capital,
        "porte":                 _PORTE_MAPA.get(
                                     str(emp.get("porte") or "").strip().upper(),
                                     str(emp.get("porte") or "").strip(),
                                 ),
        "qsa":                   emp.get("qsa") or [],
        "opcao_pelo_simples":    emp.get("opcao_pelo_simples"),
        "opcao_pelo_mei":        emp.get("opcao_pelo_mei"),
    }


def _formatar_cnpj(cnpj: str) -> str:
    """Formata CNPJ de 14 dígitos para 00.000.000/0000-00."""
    c = cnpj.zfill(14)
    if len(c) == 14:
        return f"{c[:2]}.{c[2:5]}.{c[5:8]}/{c[8:12]}-{c[12:14]}"
    return cnpj


def _formatar_telefone(tel: str) -> str:
    """Formata string de telefone com DDD: (11) 99999-9999 ou (11) 9999-9999."""
    digitos = "".join(c for c in tel if c.isdigit())
    if len(digitos) == 11:
        return f"({digitos[:2]}) {digitos[2:7]}-{digitos[7:]}"
    if len(digitos) == 10:
        return f"({digitos[:2]}) {digitos[2:6]}-{digitos[6:]}"
    if digitos:
        return digitos
    return ""


# ---------------------------------------------------------------------------
# Enriquecimento por CNPJ — CNPJá → BrasilAPI → ReceitaWS
# ---------------------------------------------------------------------------

def _enriquecer_cnpja(cnpj_raw: str) -> dict | None:
    """
    Busca dados de um CNPJ na API CNPJá Open (open.cnpja.com).
    Limite: ~5 req/min. Retorna dict normalizado ou None se falhar.
    """
    url = f"https://open.cnpja.com/office/{cnpj_raw}"
    resp = _get(url, timeout=12)
    if resp is None or resp.status_code not in (200, 206):
        return None
    try:
        data = resp.json()
    except ValueError:
        return None

    # Extrai telefones da lista phones[]
    phones = data.get("phones") or []
    telefone = ""
    for ph in phones:
        area = str(ph.get("area") or "")
        numero = str(ph.get("number") or "")
        if area and numero:
            telefone = f"({area}) {numero[:4]}-{numero[4:]}" if len(numero) == 8 else f"({area}) {numero}"
            break

    # Extrai emails da lista emails[]
    emails = data.get("emails") or []
    email = (emails[0].get("address") if emails else "") or ""

    # Endereço
    addr = data.get("address") or {}
    endereco_parts = [
        addr.get("street"), addr.get("number"), addr.get("details"),
        addr.get("district"),
    ]
    endereco = ", ".join(p for p in endereco_parts if p and str(p).strip())

    # Sócios (QSA)
    socios_raw = data.get("members") or []
    qsa = []
    for s in socios_raw:
        pessoa = s.get("person") or {}
        qualif = s.get("role") or {}
        qsa.append({
            "nome_socio": pessoa.get("name") or "",
            "qualificacao_socio": qualif.get("text") or qualif.get("id") or "",
            "cpf_cnpj_socio": pessoa.get("taxId") or "",
        })

    company = data.get("company") or {}
    nature = company.get("nature") or {}
    size = company.get("size") or {}
    simples = data.get("simples") or {}

    return {
        "cnpj_raw":           cnpj_raw,
        "razao_social":       company.get("name") or data.get("alias") or "",
        "nome_fantasia":      data.get("alias") or "",
        "situacao_cadastral": (data.get("status") or {}).get("text") or "",
        "data_abertura":      data.get("founded") or "",
        "cnae_principal":     str((data.get("mainActivity") or {}).get("id") or ""),
        "cnae_descricao":     (data.get("mainActivity") or {}).get("description") or "",
        "natureza_juridica":  nature.get("text") or "",
        "municipio":          addr.get("city") or "",
        "uf":                 addr.get("state") or "",
        "cep":                addr.get("zip") or "",
        "logradouro":         addr.get("street") or "",
        "numero":             addr.get("number") or "",
        "complemento":        addr.get("details") or "",
        "bairro":             addr.get("district") or "",
        "endereco":           endereco,
        "telefone":           telefone,
        "email":              email.lower() if email else "",
        "capital_social":     float(company.get("equity") or 0),
        "porte":              size.get("text") or size.get("id") or "",
        "qsa":                qsa,
        "opcao_pelo_simples": simples.get("simples"),
        "opcao_pelo_mei":     simples.get("mei"),
        "fonte_enriquecimento": "cnpja",
    }


def _enriquecer_brasilapi(cnpj_raw: str) -> dict | None:
    """
    Fallback 1: BrasilAPI (gratuita, sem limite documentado).
    """
    url = f"https://brasilapi.com.br/api/cnpj/v1/{cnpj_raw}"
    resp = _get(url, timeout=12)
    if resp is None or resp.status_code != 200:
        return None
    try:
        data = resp.json()
    except ValueError:
        return None

    tel1 = _formatar_telefone(str(data.get("ddd_telefone_1") or ""))
    tel2 = _formatar_telefone(str(data.get("ddd_telefone_2") or ""))
    telefone = tel1 or tel2

    partes_end = [
        data.get("logradouro"), data.get("numero"), data.get("complemento"), data.get("bairro"),
    ]
    endereco = ", ".join(p for p in partes_end if p and str(p).strip())

    qsa_raw = data.get("qsa") or []
    qsa = [
        {
            "nome_socio": s.get("nome_socio") or "",
            "qualificacao_socio": s.get("qualificacao_socio") or "",
            "cpf_cnpj_socio": s.get("cpf_cnpj_socio") or "",
        }
        for s in qsa_raw
    ]

    try:
        capital = float(data.get("capital_social") or 0)
    except (ValueError, TypeError):
        capital = 0.0

    return {
        "cnpj_raw":           cnpj_raw,
        "razao_social":       str(data.get("razao_social") or "").strip(),
        "nome_fantasia":      str(data.get("nome_fantasia") or "").strip(),
        "situacao_cadastral": str(data.get("descricao_situacao_cadastral") or data.get("situacao_cadastral") or "").strip(),
        "data_abertura":      str(data.get("data_inicio_atividade") or "").strip(),
        "cnae_principal":     str(data.get("cnae_fiscal") or "").strip(),
        "cnae_descricao":     str(data.get("cnae_fiscal_descricao") or "").strip(),
        "natureza_juridica":  str(data.get("descricao_natureza_juridica") or "").strip(),
        "municipio":          str(data.get("municipio") or "").strip(),
        "uf":                 str(data.get("uf") or "").strip().upper(),
        "cep":                str(data.get("cep") or "").strip(),
        "logradouro":         str(data.get("logradouro") or "").strip(),
        "numero":             str(data.get("numero") or "").strip(),
        "complemento":        str(data.get("complemento") or "").strip(),
        "bairro":             str(data.get("bairro") or "").strip(),
        "endereco":           endereco,
        "telefone":           telefone,
        "email":              str(data.get("email") or "").strip().lower(),
        "capital_social":     capital,
        "porte":              str(data.get("porte") or "").strip(),
        "qsa":                qsa,
        "opcao_pelo_simples": data.get("opcao_pelo_simples"),
        "opcao_pelo_mei":     data.get("opcao_pelo_mei"),
        "fonte_enriquecimento": "brasilapi",
    }


def _enriquecer_receitaws(cnpj_raw: str) -> dict | None:
    """
    Fallback 2: ReceitaWS (3 req/min). Boa cobertura de email.
    """
    url = f"https://receitaws.com.br/v1/cnpj/{cnpj_raw}"
    resp = _get(url, timeout=15)
    if resp is None or resp.status_code != 200:
        return None
    try:
        data = resp.json()
    except ValueError:
        return None

    # ReceitaWS pode retornar {"status": "ERROR", "message": "..."}
    if data.get("status") == "ERROR":
        return None

    tel1 = _formatar_telefone(str(data.get("telefone") or "").split("/")[0].strip())
    partes_end = [
        data.get("logradouro"), data.get("numero"), data.get("complemento"), data.get("bairro"),
    ]
    endereco = ", ".join(p for p in partes_end if p and str(p).strip())

    qsa_raw = data.get("qsa") or []
    qsa = [
        {
            "nome_socio": s.get("nome") or "",
            "qualificacao_socio": s.get("qual") or "",
            "cpf_cnpj_socio": "",
        }
        for s in qsa_raw
    ]

    try:
        capital = float(str(data.get("capital_social") or "0").replace(".", "").replace(",", "."))
    except (ValueError, TypeError):
        capital = 0.0

    return {
        "cnpj_raw":           cnpj_raw,
        "razao_social":       str(data.get("nome") or "").strip(),
        "nome_fantasia":      str(data.get("fantasia") or "").strip(),
        "situacao_cadastral": str(data.get("situacao") or "").strip(),
        "data_abertura":      str(data.get("abertura") or "").strip(),
        "cnae_principal":     str((data.get("atividade_principal") or [{}])[0].get("code") or "").strip(),
        "cnae_descricao":     str((data.get("atividade_principal") or [{}])[0].get("text") or "").strip(),
        "natureza_juridica":  str(data.get("natureza_juridica") or "").strip(),
        "municipio":          str(data.get("municipio") or "").strip(),
        "uf":                 str(data.get("uf") or "").strip().upper(),
        "cep":                str(data.get("cep") or "").strip(),
        "logradouro":         str(data.get("logradouro") or "").strip(),
        "numero":             str(data.get("numero") or "").strip(),
        "complemento":        str(data.get("complemento") or "").strip(),
        "bairro":             str(data.get("bairro") or "").strip(),
        "endereco":           endereco,
        "telefone":           tel1,
        "email":              str(data.get("email") or "").strip().lower(),
        "capital_social":     capital,
        "porte":              str(data.get("porte") or "").strip(),
        "qsa":                qsa,
        "opcao_pelo_simples": None,
        "opcao_pelo_mei":     None,
        "fonte_enriquecimento": "receitaws",
    }


def _enriquecer_cnpj(cnpj_raw: str) -> dict:
    """
    Tenta enriquecer um CNPJ usando a cadeia de fallback:
    CNPJá Open → BrasilAPI → ReceitaWS.
    Retorna o melhor resultado disponível.
    """
    # CNPJá Open (mais estruturado, tem phones[] e emails[])
    resultado = _enriquecer_cnpja(cnpj_raw)
    if resultado:
        return resultado

    # Pausa para não martelar as APIs sequencialmente
    time.sleep(1)

    # BrasilAPI (gratuita, confiável)
    resultado = _enriquecer_brasilapi(cnpj_raw)
    if resultado:
        return resultado

    time.sleep(1)

    # ReceitaWS (3 req/min, bom para email)
    resultado = _enriquecer_receitaws(cnpj_raw)
    if resultado:
        return resultado

    # Retorna dicionário mínimo se todas as fontes falharem
    return {
        "cnpj_raw":             cnpj_raw,
        "erro":                 "Não foi possível obter dados de nenhuma fonte.",
        "fonte_enriquecimento": "falhou",
    }


# ---------------------------------------------------------------------------
# Validação de CNPJ (dígitos verificadores)
# ---------------------------------------------------------------------------

def _validar_cnpj(cnpj: str) -> bool:
    """
    Valida o CNPJ pelos dígitos verificadores.
    Aceita CNPJ formatado ou só dígitos.
    """
    # Remove formatação
    c = "".join(ch for ch in cnpj if ch.isdigit())
    if len(c) != 14:
        return False
    # Rejeita sequências trivialmente inválidas (todos iguais)
    if len(set(c)) == 1:
        return False

    def calcular_digito(cnpj14: str, pesos: list[int]) -> int:
        soma = sum(int(cnpj14[i]) * pesos[i] for i in range(len(pesos)))
        resto = soma % 11
        return 0 if resto < 2 else 11 - resto

    pesos1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
    pesos2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]

    d1 = calcular_digito(c, pesos1)
    d2 = calcular_digito(c, pesos2)
    return c[12] == str(d1) and c[13] == str(d2)


# ---------------------------------------------------------------------------
# Lista de CNAEs (top segmentos)
# ---------------------------------------------------------------------------

# Top CNAEs mais comuns para o dropdown
CNAES_POPULARES = [
    {"codigo": "4711301", "descricao": "Comércio varejista de mercadorias em geral, com predominância de produtos alimentícios - hipermercados"},
    {"codigo": "4711302", "descricao": "Comércio varejista de mercadorias em geral, com predominância de produtos alimentícios - supermercados"},
    {"codigo": "4712100", "descricao": "Comércio varejista de mercadorias em geral, com predominância de produtos alimentícios - minimercados, mercearias e armazéns"},
    {"codigo": "4721102", "descricao": "Padaria e confeitaria com predominância de revenda"},
    {"codigo": "4722901", "descricao": "Comércio varejista de carnes - açougues"},
    {"codigo": "4729699", "descricao": "Comércio varejista de produtos alimentícios em geral"},
    {"codigo": "4744001", "descricao": "Comércio varejista de ferragens e ferramentas"},
    {"codigo": "4744005", "descricao": "Comércio varejista de materiais de construção"},
    {"codigo": "4751201", "descricao": "Comércio varejista especializado de equipamentos e suprimentos de informática"},
    {"codigo": "4753900", "descricao": "Comércio varejista especializado de eletrodomésticos e equipamentos de áudio e vídeo"},
    {"codigo": "4761003", "descricao": "Comércio varejista de artigos de papelaria"},
    {"codigo": "4771701", "descricao": "Comércio varejista de produtos farmacêuticos, sem manipulação de fórmulas"},
    {"codigo": "4781400", "descricao": "Comércio varejista de artigos do vestuário e acessórios"},
    {"codigo": "4789005", "descricao": "Comércio varejista de produtos saneantes domissanitários"},
    {"codigo": "4912401", "descricao": "Transporte ferroviário de passageiros intermunicipal e interestadual"},
    {"codigo": "4921301", "descricao": "Transporte rodoviário coletivo de passageiros, com itinerário fixo, municipal"},
    {"codigo": "4930201", "descricao": "Transporte rodoviário de táxi"},
    {"codigo": "4940000", "descricao": "Transporte dutoviário"},
    {"codigo": "4950700", "descricao": "Trens turísticos, teleféricos e similares"},
    {"codigo": "4961501", "descricao": "Operação dos aeroportos e campos de aterrissagem"},
    {"codigo": "5020001", "descricao": "Serviços de reboque de embarcações"},
    {"codigo": "5611201", "descricao": "Restaurantes e similares"},
    {"codigo": "5611203", "descricao": "Lanchonetes, casas de chá, de sucos e similares"},
    {"codigo": "5620101", "descricao": "Fornecimento de alimentos preparados preponderantemente para empresas"},
    {"codigo": "6110801", "descricao": "Serviços de telefonia fixa comutada - STFC"},
    {"codigo": "6120501", "descricao": "Telefonia móvel celular"},
    {"codigo": "6190699", "descricao": "Outras atividades de telecomunicações não especificadas anteriormente"},
    {"codigo": "6201500", "descricao": "Desenvolvimento de programas de computador sob encomenda"},
    {"codigo": "6202300", "descricao": "Desenvolvimento e licenciamento de programas de computador customizáveis"},
    {"codigo": "6203100", "descricao": "Desenvolvimento e licenciamento de programas de computador não customizáveis"},
    {"codigo": "6204000", "descricao": "Consultoria em tecnologia da informação"},
    {"codigo": "6209100", "descricao": "Suporte técnico, manutenção e outros serviços em tecnologia da informação"},
    {"codigo": "6311900", "descricao": "Tratamento de dados, provedores de serviços de aplicação e serviços de hospedagem na internet"},
    {"codigo": "6319400", "descricao": "Portais, provedores de conteúdo e outros serviços de informação na internet"},
    {"codigo": "6399200", "descricao": "Outras atividades de prestação de serviços de informação não especificadas anteriormente"},
    {"codigo": "6410700", "descricao": "Banco Central"},
    {"codigo": "6421200", "descricao": "Bancos comerciais"},
    {"codigo": "6422100", "descricao": "Bancos múltiplos, com carteira comercial"},
    {"codigo": "6431000", "descricao": "Bancos múltiplos, sem carteira comercial"},
    {"codigo": "6432800", "descricao": "Bancos de investimento"},
    {"codigo": "6450600", "descricao": "Sociedades de capitalização"},
    {"codigo": "6463800", "descricao": "Outras sociedades de participação, exceto holdings"},
    {"codigo": "6491300", "descricao": "Sociedades de fomento mercantil - factoring"},
    {"codigo": "6499999", "descricao": "Intermediação financeira não especificada anteriormente"},
    {"codigo": "6511101", "descricao": "Seguros de vida"},
    {"codigo": "6512000", "descricao": "Seguros não vida"},
    {"codigo": "6550200", "descricao": "Planos de saúde"},
    {"codigo": "6621501", "descricao": "Peritos e avaliadores de seguros"},
    {"codigo": "6630400", "descricao": "Atividades de administração de fundos por contrato ou comissão"},
    {"codigo": "6911701", "descricao": "Serviços advocatícios"},
    {"codigo": "6920601", "descricao": "Atividades de contabilidade"},
    {"codigo": "7020400", "descricao": "Atividades de consultoria em gestão empresarial"},
    {"codigo": "7111100", "descricao": "Serviços de arquitetura"},
    {"codigo": "7112000", "descricao": "Serviços de engenharia"},
    {"codigo": "7210000", "descricao": "Pesquisa e desenvolvimento experimental em ciências físicas e naturais"},
    {"codigo": "7311400", "descricao": "Agências de publicidade"},
    {"codigo": "7312200", "descricao": "Agenciamento de espaços para publicidade, exceto em veículos de comunicação"},
    {"codigo": "7319003", "descricao": "Marketing direto"},
    {"codigo": "7410202", "descricao": "Design de interiores"},
    {"codigo": "7490105", "descricao": "Agenciamento de profissionais para atividades esportivas, culturais e artísticas"},
    {"codigo": "7500100", "descricao": "Atividades veterinárias"},
    {"codigo": "7711000", "descricao": "Locação de automóveis sem condutor"},
    {"codigo": "7721700", "descricao": "Aluguel de equipamentos recreativos e esportivos"},
    {"codigo": "7810800", "descricao": "Seleção e agenciamento de mão de obra"},
    {"codigo": "8011101", "descricao": "Atividades de vigilância e segurança privada"},
    {"codigo": "8121400", "descricao": "Limpeza em prédios e em domicílios"},
    {"codigo": "8122200", "descricao": "Imunização e controle de pragas urbanas"},
    {"codigo": "8211300", "descricao": "Serviços combinados de escritório e apoio administrativo"},
    {"codigo": "8220200", "descricao": "Atividades de teleatendimento"},
    {"codigo": "8299706", "descricao": "Casas lotéricas"},
    {"codigo": "8411600", "descricao": "Administração pública em geral"},
    {"codigo": "8550302", "descricao": "Atividades de apoio à educação, exceto caixas escolares"},
    {"codigo": "8591100", "descricao": "Ensino de esportes"},
    {"codigo": "8599604", "descricao": "Treinamento em desenvolvimento profissional e gerencial"},
    {"codigo": "8630501", "descricao": "Atividade médica ambulatorial com recursos para realização de procedimentos cirúrgicos"},
    {"codigo": "8630503", "descricao": "Atividade médica ambulatorial restrita a consultas"},
    {"codigo": "8711501", "descricao": "Clínicas e residências geriátricas"},
    {"codigo": "8720401", "descricao": "Atividades de centros de assistência psicossocial"},
    {"codigo": "8800600", "descricao": "Serviços de assistência social sem alojamento"},
    {"codigo": "9001901", "descricao": "Produção teatral"},
    {"codigo": "9200301", "descricao": "Casas de bingo"},
    {"codigo": "9200302", "descricao": "Exploração de apostas em corridas de cavalos"},
    {"codigo": "9200399", "descricao": "Exploração de jogos de azar e apostas não especificados anteriormente"},
    {"codigo": "9311500", "descricao": "Gestão de instalações de esportes"},
    {"codigo": "9319101", "descricao": "Produção e promoção de eventos esportivos"},
    {"codigo": "9321200", "descricao": "Parques de diversão e parques temáticos"},
    {"codigo": "9430800", "descricao": "Atividades de associações de defesa de direitos sociais"},
    {"codigo": "9491000", "descricao": "Atividades de organizações religiosas ou filosóficas"},
    {"codigo": "9492800", "descricao": "Atividades de organizações políticas"},
    {"codigo": "9493600", "descricao": "Atividades de organizações associativas ligadas à cultura e à arte"},
    {"codigo": "9499500", "descricao": "Atividades associativas não especificadas anteriormente"},
    {"codigo": "9511800", "descricao": "Reparação e manutenção de computadores e de equipamentos periféricos"},
    {"codigo": "9512600", "descricao": "Reparação e manutenção de equipamentos de comunicação"},
    {"codigo": "9529105", "descricao": "Reparação de artigos do mobiliário"},
    {"codigo": "9601701", "descricao": "Lavanderias"},
    {"codigo": "9602501", "descricao": "Cabeleireiros, manicure e pedicure"},
    {"codigo": "9603301", "descricao": "Gestão e manutenção de cemitérios"},
    {"codigo": "9609204", "descricao": "Exploração de máquinas de serviços pessoais com moeda"},
    {"codigo": "9700500", "descricao": "Serviços domésticos"},
]


# ---------------------------------------------------------------------------
# Rotas Flask
# ---------------------------------------------------------------------------

@app.route("/")
def index():
    """Serve a interface principal."""
    import json as _json
    return render_template(
        "index.html",
        cnaes=CNAES_POPULARES,
        municipios_json=_json.dumps(_cache_municipios, ensure_ascii=False),
    )


@app.route("/api/cnaes")
def api_cnaes():
    """
    Retorna lista de CNAEs para o dropdown de filtro.
    Suporta busca por texto via ?q=<termo>.
    """
    q = (request.args.get("q") or "").lower().strip()
    if q:
        filtrados = [
            c for c in CNAES_POPULARES
            if q in c["descricao"].lower() or q in c["codigo"]
        ]
        return jsonify(filtrados[:30])
    return jsonify(CNAES_POPULARES)


@app.route("/api/municipios/<uf>")
def api_municipios(uf: str):
    """
    Retorna todos os municípios da UF via BrasilAPI (853 em MG, por exemplo).
    Usa cache em memória para evitar chamadas repetidas.
    NÃO usa os resultados de busca em memória — essa abordagem limitava
    o dropdown apenas às cidades que apareceram na última busca.
    """
    uf = uf.upper()

    # Serve do cache — ignora se ?refresh=1 for passado
    forcar = request.args.get("refresh") == "1"
    if not forcar and uf in _cache_municipios:
        return jsonify(_cache_municipios[uf])

    # Busca todos os municípios da UF na BrasilAPI.
    # Retorna lista de objetos {nome, codigo_ibge} — o código é obrigatório
    # porque a Minha Receita filtra por código IBGE, não pelo nome da cidade.
    try:
        resp = requests.get(
            f"https://brasilapi.com.br/api/ibge/municipios/v1/{uf}",
            timeout=10,
        )
        if resp.status_code == 200:
            municipios = sorted(
                [
                    {"nome": m["nome"], "codigo_ibge": str(m["codigo_ibge"])}
                    for m in resp.json()
                    if m.get("nome") and m.get("codigo_ibge")
                ],
                key=lambda x: x["nome"],
            )
            _cache_municipios[uf] = municipios
            return jsonify(municipios)
    except Exception:
        pass

    return jsonify([])


@app.route("/api/stats")
def api_stats():
    """
    Retorna KPIs calculados sobre os resultados em memória (_resultados).
    """
    total = len(_resultados)
    com_email = sum(1 for r in _resultados if r.get("email"))
    com_telefone = sum(1 for r in _resultados if r.get("telefone"))
    ativas = sum(
        1 for r in _resultados
        if "ativa" in (r.get("situacao_cadastral") or "").lower()
    )
    capital_total = sum(r.get("capital_social") or 0 for r in _resultados)

    # Distribuição por UF
    por_uf: dict[str, int] = {}
    for r in _resultados:
        uf = r.get("uf") or "N/A"
        por_uf[uf] = por_uf.get(uf, 0) + 1

    # Valores únicos para dropdowns
    ufs = sorted({r.get("uf") or "" for r in _resultados if r.get("uf")})
    portes = sorted({r.get("porte") or "" for r in _resultados if r.get("porte")})
    situacoes = sorted({r.get("situacao_cadastral") or "" for r in _resultados if r.get("situacao_cadastral")})
    naturezas = sorted({r.get("natureza_juridica") or "" for r in _resultados if r.get("natureza_juridica")})

    return jsonify({
        "total":          total,
        "com_email":      com_email,
        "com_telefone":   com_telefone,
        "ativas":         ativas,
        "capital_total":  capital_total,
        "por_uf":         por_uf,
        "ufs":            ufs,
        "portes":         portes,
        "situacoes":      situacoes,
        "naturezas":      naturezas,
    })


@app.route("/api/buscar")
def api_buscar():
    """
    Inicia busca assíncrona de empresas.
    Parâmetros: cnpj, uf, municipio, cnae, data_abertura_de, data_abertura_ate,
                capital_min, capital_max, cursor, situacao, porte, natureza_juridica.

    Retorna imediatamente com um job_id. Use /api/buscar/status/<job_id> para verificar.
    Se ?cnpj= for fornecido e válido, faz busca direta (síncrona) e retorna resultado.
    """
    params = {k: (v or "").strip() for k, v in request.args.items()}

    # Busca direta por CNPJ (síncrona — retorna imediatamente)
    cnpj_input = params.get("cnpj", "")
    if cnpj_input:
        cnpj_raw = "".join(c for c in cnpj_input if c.isdigit())
        if not _validar_cnpj(cnpj_raw):
            return jsonify({"ok": False, "erro": "CNPJ inválido (dígitos verificadores incorretos)."}), 400
        dados = _enriquecer_cnpj(cnpj_raw)
        if "erro" in dados and dados.get("fonte_enriquecimento") == "falhou":
            return jsonify({"ok": False, "erro": dados["erro"]}), 404

        # Formata o CNPJ no resultado se ainda não estiver
        if "cnpj" not in dados:
            dados["cnpj"] = _formatar_cnpj(cnpj_raw)

        with _lock:
            _resultados.clear()
            _resultados.append(dados)

        return jsonify({"ok": True, "total": 1, "dados": [dados], "cursor": None})

    # Busca por filtros (assíncrona)
    job_id = str(uuid.uuid4())
    with _lock:
        _jobs[job_id] = {"status": "pending", "dados": [], "erro": None, "total": 0}

    thread = threading.Thread(
        target=_executar_busca_async,
        args=(job_id, params),
        daemon=True,
    )
    thread.start()

    return jsonify({"ok": True, "job_id": job_id, "status": "running"})


@app.route("/api/buscar/status/<job_id>")
def api_buscar_status(job_id: str):
    """
    Retorna o status de um job de busca assíncrona.
    """
    with _lock:
        job = _jobs.get(job_id)

    if not job:
        return jsonify({"ok": False, "erro": "Job não encontrado."}), 404

    resposta = {
        "ok":     True,
        "status": job["status"],
        "total":  job.get("total", 0),
    }
    if job["status"] == "done":
        resposta["dados"] = job["dados"]
        resposta["cursor"] = job.get("cursor")
    elif job["status"] == "error":
        resposta["erro"] = job.get("erro", "Erro desconhecido.")

    return jsonify(resposta)


def _executar_busca_async(job_id: str, params: dict) -> None:
    """
    Worker que executa a busca na Minha Receita em background com paginação completa.
    Itera até MAX_PAGINAS páginas (100 resultados cada) usando o cursor da API.
    Aplica filtros pós-busca (capital, data, situação, porte) localmente.
    """
    # Número máximo de páginas por busca (100 por página = até 1000 resultados).
    # Aumentar esse valor traz mais resultados mas deixa a busca mais lenta.
    MAX_PAGINAS = 10

    try:
        with _lock:
            if job_id in _jobs:
                _jobs[job_id]["status"] = "running"

        # Filtros locais pós-busca (não suportados pela API)
        capital_min  = _parse_float(params.get("capital_min"))
        capital_max  = _parse_float(params.get("capital_max"))
        razao_social = (params.get("razao_social") or "").lower().strip()
        data_de      = params.get("data_abertura_de", "")
        data_ate     = params.get("data_abertura_ate", "")
        situacao     = params.get("situacao", "").lower()
        porte        = params.get("porte", "")
        natureza     = params.get("natureza_juridica", "")

        todas_empresas: list[dict] = []
        cursor_atual: str | None = params.get("cursor") or None
        ultima_pagina = False

        for pagina in range(MAX_PAGINAS):
            # Passa o cursor da iteração anterior para buscar a próxima página
            params_pagina = dict(params)
            if cursor_atual:
                params_pagina["cursor"] = cursor_atual
            elif "cursor" in params_pagina:
                del params_pagina["cursor"]

            empresas, proximo_cursor = _buscar_minha_receita(params_pagina)

            todas_empresas.extend(empresas)

            # Atualiza progresso em tempo real para o frontend acompanhar
            with _lock:
                if job_id in _jobs:
                    _jobs[job_id]["total"] = len(todas_empresas)

            print(f"[busca_async] Página {pagina + 1}: {len(empresas)} empresas, cursor={proximo_cursor!r}")

            # Para quando a API não retorna mais resultados ou não há próxima página
            if not empresas or not proximo_cursor:
                ultima_pagina = True
                break

            cursor_atual = proximo_cursor

            # Pausa mínima entre páginas para não sobrecarregar a API
            time.sleep(0.3)

        # Aplica filtros locais sobre todos os resultados coletados
        filtradas = []
        for emp in todas_empresas:
            if razao_social:
                rs = (emp.get("razao_social") or "").lower()
                nf = (emp.get("nome_fantasia") or "").lower()
                if razao_social not in rs and razao_social not in nf:
                    continue
            if situacao:
                if situacao not in (emp.get("situacao_cadastral") or "").lower():
                    continue
            if porte:
                if emp.get("porte", "").upper() != porte.upper():
                    continue
            if natureza:
                if natureza.lower() not in (emp.get("natureza_juridica") or "").lower():
                    continue

            cap = emp.get("capital_social") or 0
            if capital_min is not None and cap < capital_min:
                continue
            if capital_max is not None and cap > capital_max:
                continue

            data_emp = _normalizar_data_iso(emp.get("data_abertura") or "")
            if data_de and data_emp and data_emp < data_de:
                continue
            if data_ate and data_emp and data_emp > data_ate:
                continue

            filtradas.append(emp)

        with _lock:
            _resultados.clear()
            _resultados.extend(filtradas)
            _jobs[job_id] = {
                "status":    "done",
                "dados":     filtradas,
                "total":     len(filtradas),
                # Envia cursor somente se ainda há mais páginas além do limite
                "cursor":    cursor_atual if not ultima_pagina else None,
                "has_more":  not ultima_pagina,
                "erro":      None,
            }

    except Exception as exc:
        print(f"[busca_async] Erro: {exc}")
        with _lock:
            _jobs[job_id] = {
                "status":   "error",
                "dados":    [],
                "total":    0,
                "cursor":   None,
                "has_more": False,
                "erro":     str(exc),
            }


@app.route("/api/cnpj/<cnpj>")
def api_cnpj(cnpj: str):
    """
    Enriquece um CNPJ via CNPJá → BrasilAPI → ReceitaWS.
    Valida dígitos verificadores antes de consultar.
    """
    cnpj_raw = "".join(c for c in cnpj if c.isdigit())

    if not _validar_cnpj(cnpj_raw):
        return jsonify({"ok": False, "erro": "CNPJ inválido."}), 400

    dados = _enriquecer_cnpj(cnpj_raw)
    dados["cnpj"] = _formatar_cnpj(cnpj_raw)

    if dados.get("fonte_enriquecimento") == "falhou":
        return jsonify({"ok": False, "dados": dados, "erro": dados.get("erro")}), 404

    return jsonify({"ok": True, "dados": dados})


# ---------------------------------------------------------------------------
# Utilitários internos
# ---------------------------------------------------------------------------

def _parse_float(valor: str | None) -> float | None:
    """Converte string para float; retorna None se vazio/inválido."""
    if valor is None or str(valor).strip() == "":
        return None
    try:
        return float(str(valor).replace(",", "."))
    except (ValueError, TypeError):
        return None


def _normalizar_data_iso(data: str) -> str:
    """
    Converte datas em formatos variados para YYYY-MM-DD.
    Aceita: DD/MM/YYYY, YYYY-MM-DD, DD-MM-YYYY.
    """
    s = str(data).strip()
    if not s:
        return ""
    # Já está em ISO
    if len(s) == 10 and s[4] == "-":
        return s[:10]
    # DD/MM/YYYY
    if len(s) == 10 and s[2] == "/":
        partes = s.split("/")
        return f"{partes[2]}-{partes[1]}-{partes[0]}"
    # DD-MM-YYYY
    if len(s) == 10 and s[2] == "-":
        partes = s.split("-")
        return f"{partes[2]}-{partes[1]}-{partes[0]}"
    return s


# ---------------------------------------------------------------------------
# Inicialização
# ---------------------------------------------------------------------------

def _precarregar_todos_municipios() -> None:
    """
    Pré-carrega municípios de todos os 27 estados via BrasilAPI
    antes de iniciar o servidor. Garante que o dropdown de município
    funcione imediatamente sem nenhuma chamada assíncrona do navegador.
    """
    UFS = [
        "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS",
        "MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC",
        "SP","SE","TO",
    ]
    print("[init] Carregando municípios de todos os estados...")
    for uf in UFS:
        if uf in _cache_municipios:
            continue
        try:
            resp = requests.get(
                f"https://brasilapi.com.br/api/ibge/municipios/v1/{uf}",
                timeout=15,
            )
            if resp.status_code == 200:
                municipios = sorted(
                    [
                        {"nome": m["nome"], "codigo_ibge": str(m["codigo_ibge"])}
                        for m in resp.json()
                        if m.get("nome") and m.get("codigo_ibge")
                    ],
                    key=lambda x: x["nome"],
                )
                _cache_municipios[uf] = municipios
                print(f"[init]   {uf}: {len(municipios)} municípios")
            else:
                print(f"[init]   {uf}: HTTP {resp.status_code}")
        except Exception as e:
            print(f"[init]   {uf}: ERRO — {e}")
        time.sleep(0.15)   # pausa gentil entre requisições
    print(f"[init] Municípios prontos: {len(_cache_municipios)} estados carregados.\n")


if __name__ == "__main__":
    _precarregar_todos_municipios()
    print("ProspectaEmpresa iniciado — http://localhost:5001\n")
    app.run(debug=True, port=5001, use_reloader=False)
