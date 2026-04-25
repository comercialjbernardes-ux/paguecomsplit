"""
app.py — Dashboard Flask para visualização de bets regulamentadas
================================================================
Uso:
    python app.py
    Acesse: http://localhost:5001

Os dados são carregados de dados/bets_enriquecidas.json (gerado pelo pipeline.py).
Fallback: bets_com_emails.csv se o JSON ainda não existir.

Edição manual:
    Campos faltantes podem ser preenchidos manualmente via POST /api/editar.
    Os overrides são persistidos em dados/overrides.json e sobrescrevem o JSON
    base a cada carregamento — preservando edições manuais entre re-runs do
    pipeline.
"""

import csv
import json
import os
from datetime import datetime
from pathlib import Path
from threading import Lock

from flask import Flask, jsonify, render_template, request

import url_health
import csv_sync
import afiliados_health

app = Flask(__name__)

ARQUIVO_JSON = Path("dados/bets_enriquecidas.json")
ARQUIVO_CSV = Path("bets_com_emails.csv")
ARQUIVO_OVERRIDES = Path("dados/overrides.json")

# Campos que podem ser editados manualmente no dashboard
# url_afiliados foi removido: detecção agora é automática via afiliados_health
CAMPOS_EDITAVEIS = {
    "email_contato",
    "url",
    "marca",
    "razao_social",
    "cnpj",
    "uf",
    "municipio",
    "observacao",
}

# Dados carregados em memória na inicialização
_dados: list[dict] = []
_overrides: dict[str, dict] = {}
_lock_overrides = Lock()
_lock_dados = Lock()  # protege mutações concorrentes em _dados


# ---------------------------------------------------------------------------
# Overrides (edições manuais) — persistidos em dados/overrides.json
# ---------------------------------------------------------------------------


def _carregar_overrides() -> dict[str, dict]:
    if not ARQUIVO_OVERRIDES.exists():
        return {}
    try:
        with open(ARQUIVO_OVERRIDES, encoding="utf-8") as f:
            return json.load(f) or {}
    except (json.JSONDecodeError, OSError):
        return {}


def _salvar_overrides(overrides: dict[str, dict]) -> None:
    ARQUIVO_OVERRIDES.parent.mkdir(parents=True, exist_ok=True)
    try:
        with open(ARQUIVO_OVERRIDES, "w", encoding="utf-8") as f:
            json.dump(overrides, f, ensure_ascii=False, indent=2)
    except OSError as e:
        print(f"[app] Aviso: não foi possível salvar overrides — {e}")


def _aplicar_overrides(registros: list[dict], overrides: dict[str, dict]) -> None:
    """Mescla overrides nos registros — marca cada registro editado."""
    for r in registros:
        cnpj = (r.get("cnpj") or "").strip()
        if not cnpj or cnpj not in overrides:
            continue
        ov = overrides[cnpj]
        campos_editados = []
        for campo, valor in ov.items():
            if campo.startswith("_"):
                continue
            if campo not in CAMPOS_EDITAVEIS:
                continue
            r[campo] = valor
            campos_editados.append(campo)
            # Se editou email e status era de "não encontrado", marca como manual
            if campo == "email_contato":
                if valor:
                    if r.get("status") in (None, "", "nao_encontrado", "erro_conexao",
                                           "bloqueado_robots", "sem_url"):
                        r["status"] = "encontrado_manual"
                else:
                    # Deleção manual: marca como removido
                    r["status"] = "nao_encontrado"
            # (url_afiliados removido — detecção automática via afiliados_health)
        if campos_editados:
            r["_editado_manualmente"] = True
            r["_campos_editados"] = campos_editados
            r["_editado_em"] = ov.get("_edited_at", "")


# ---------------------------------------------------------------------------
# Carregamento de dados
# ---------------------------------------------------------------------------


def _carregar_dados() -> list[dict]:
    """
    Carrega dados do JSON enriquecido + aplica overrides manuais.
    Fallback: CSV básico se o JSON ainda não existir.
    """
    if ARQUIVO_JSON.exists():
        with open(ARQUIVO_JSON, encoding="utf-8") as f:
            dados = json.load(f)
        for r in dados:
            try:
                r["capital_social"] = float(r.get("capital_social") or 0)
            except (ValueError, TypeError):
                r["capital_social"] = 0.0
        return dados

    # Fallback: CSV sem enriquecimento
    if ARQUIVO_CSV.exists():
        registros = []
        with open(ARQUIVO_CSV, encoding="utf-8-sig") as f:
            for row in csv.DictReader(f):
                registros.append(row)
        return registros

    return []


_STATUS_ERRO = {"erro_http", "erro_conexao", "erro_ssl", "erro_dns", "timeout", "erro"}


def _aplicar_url_health(registros: list[dict]) -> None:
    """Mescla o estado de saúde das URLs em cada registro + flag de inatividade."""
    try:
        health = url_health.ler_health()
    except Exception:
        health = {}
    for r in registros:
        u = (r.get("url") or "").strip()
        info = health.get(u)
        if not info:
            r["_url_health_status"] = "desconhecido"
            r["_url_inativa"] = False
            continue
        st = info.get("status", "desconhecido")
        r["_url_health_status"] = st
        r["_url_http_code"] = info.get("http_code", 0)
        r["_url_checked_at"] = info.get("checado_em", "")
        r["_url_latencia_ms"] = info.get("latencia_ms", 0)
        if info.get("redirecionou"):
            r["_url_redirect_to"] = info.get("url_final", "")
        # D — flag de URL inativa: status é erro OU bet foi removida do CSV
        r["_url_inativa"] = (st in _STATUS_ERRO) or bool(r.get("_removido_do_csv"))


def _aplicar_afiliados_health(registros: list[dict]) -> None:
    """Mescla detecção automática de afiliados em cada registro."""
    try:
        dados_af = afiliados_health.ler_afiliados()
    except Exception:
        dados_af = {}
    for r in registros:
        u = (r.get("url") or "").strip()
        info = dados_af.get(u)
        if not info:
            r["_afiliado_detectado"] = False
            r["_afiliado_url"] = ""
            r["_afiliado_checado_em"] = ""
        else:
            r["_afiliado_detectado"] = bool(info.get("detectado", False))
            r["_afiliado_url"] = info.get("url_afiliado", "")
            r["_afiliado_checado_em"] = info.get("checado_em", "")


def recarregar_dados() -> None:
    global _dados, _overrides
    _overrides = _carregar_overrides()
    dados = _carregar_dados()
    _aplicar_overrides(dados, _overrides)
    _aplicar_url_health(dados)
    _aplicar_afiliados_health(dados)
    with _lock_dados:
        _dados = dados


# ---------------------------------------------------------------------------
# Rotas
# ---------------------------------------------------------------------------


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/api/dados")
def api_dados():
    """Retorna todos os registros em JSON (já com overrides aplicados)."""
    # Re-mescla workers contínuos em cada request (url_health + afiliados_health)
    # Lock garante que mutações concorrentes em _dados não causem corrida de dados
    with _lock_dados:
        _aplicar_url_health(_dados)
        _aplicar_afiliados_health(_dados)
        snapshot = list(_dados)
    return jsonify(snapshot)


@app.route("/api/stats")
def api_stats():
    """KPI cards: totais e distribuições para o header do dashboard."""
    with _lock_dados:
        _aplicar_url_health(_dados)
        snapshot = list(_dados)

    total = len(snapshot)
    com_email = sum(
        1 for r in snapshot
        if r.get("status") in ("encontrado", "encontrado_js", "encontrado_manual")
    )
    sem_email = sum(1 for r in snapshot if r.get("status") == "nao_encontrado")
    com_afiliados = sum(1 for r in snapshot if r.get("_afiliado_detectado"))
    editados = sum(1 for r in snapshot if r.get("_editado_manualmente"))
    ultima = max((r.get("data_coleta", "") for r in snapshot), default="")

    # Distribuições para filtros
    portes = sorted({r.get("porte_empresa", "") for r in snapshot if r.get("porte_empresa")})
    situacoes = sorted({r.get("situacao_cadastral", "") for r in snapshot if r.get("situacao_cadastral")})
    ufs = sorted({r.get("uf", "") for r in snapshot if r.get("uf")})

    # URL health stats — já aplicados via snapshot com lock
    urls_ativas = sum(1 for r in snapshot if r.get("_url_health_status") == "ok")
    urls_redirect = sum(1 for r in snapshot if r.get("_url_health_status") == "redirect")
    urls_inativas = sum(1 for r in snapshot if r.get("_url_inativa"))
    urls_desconhecido = sum(
        1 for r in snapshot if r.get("_url_health_status") == "desconhecido"
    )

    # Status da última sincronização do CSV do gov.br
    sync_info = csv_sync.ler_status()

    return jsonify({
        "total": total,
        "com_email": com_email,
        "sem_email": sem_email,
        "com_afiliados": com_afiliados,
        "editados_manualmente": editados,
        "ultima_atualizacao": ultima,
        "portes": portes,
        "situacoes": situacoes,
        "ufs": ufs,
        "urls_ativas": urls_ativas,
        "urls_redirect": urls_redirect,
        "urls_inativas": urls_inativas,
        "urls_desconhecido": urls_desconhecido,
        "csv_sync": {
            "ultimo_sync": sync_info.get("finalizado_em") or sync_info.get("iniciado_em"),
            "sucesso": sync_info.get("sucesso", False),
            "adicionadas": len(sync_info.get("adicionadas", [])),
            "removidas": len(sync_info.get("removidas", [])),
            "url_atualizada": len(sync_info.get("url_atualizada", [])),
        },
    })


@app.route("/api/municipios/<uf>")
def api_municipios(uf: str):
    """Retorna municípios disponíveis para a UF selecionada (cascata de filtros)."""
    with _lock_dados:
        snapshot = list(_dados)
    municipios = sorted({
        r.get("municipio", "")
        for r in snapshot
        if r.get("uf", "").upper() == uf.upper() and r.get("municipio")
    })
    return jsonify(municipios)


@app.route("/api/url-health")
def api_url_health():
    """Retorna o estado atual de saúde de todas as URLs monitoradas."""
    return jsonify(url_health.ler_health())


@app.route("/api/csv-sync-status")
def api_csv_sync_status():
    """Retorna o resultado da última sincronização com o CSV oficial do gov.br."""
    return jsonify(csv_sync.ler_status())


@app.route("/api/csv-sync-agora", methods=["POST"])
def api_csv_sync_agora():
    """Força uma sincronização imediata (sem esperar o tick de 6h)."""
    try:
        resultado = csv_sync.sincronizar_uma_vez()
    except Exception as e:
        return jsonify({"ok": False, "sucesso": False, "erro": str(e)}), 500
    if resultado is None:
        return jsonify({"ok": False, "sucesso": False, "erro": "Sincronização retornou resultado vazio."}), 500
    if resultado.get("sucesso"):
        recarregar_dados()
    return jsonify(resultado)


@app.route("/api/recarregar", methods=["POST"])
def api_recarregar():
    """Recarrega dados do JSON em memória sem reiniciar o servidor."""
    recarregar_dados()
    return jsonify({"ok": True, "total": len(_dados)})


@app.route("/api/editar", methods=["POST"])
def api_editar():
    """
    Edita um campo de um registro e persiste em dados/overrides.json.

    Body JSON:
        {"cnpj": "12345678000100", "campo": "email_contato", "valor": "contato@bet.com"}

    Passar valor="" (string vazia) ou valor=null remove o override desse campo.
    """
    payload = request.get_json(silent=True) or {}
    cnpj = (payload.get("cnpj") or "").strip()
    campo = (payload.get("campo") or "").strip()
    valor = payload.get("valor")
    if isinstance(valor, str):
        valor = valor.strip()

    if not cnpj:
        return jsonify({"ok": False, "erro": "CNPJ ausente."}), 400
    if campo not in CAMPOS_EDITAVEIS:
        return jsonify({
            "ok": False,
            "erro": f"Campo '{campo}' não é editável.",
            "editaveis": sorted(CAMPOS_EDITAVEIS),
        }), 400

    # Valida email básico
    if campo == "email_contato" and valor:
        if "@" not in valor or "." not in valor.split("@")[-1]:
            return jsonify({"ok": False, "erro": "Email inválido."}), 400

    # Detecta intenção: null = reset (volta pro valor base);
    # string vazia = deleção explícita (mascara valor base).
    resetar = valor is None
    deletar = isinstance(valor, str) and valor == ""

    with _lock_overrides:
        overrides = _carregar_overrides()
        reg_ov = overrides.get(cnpj, {})

        if resetar:
            reg_ov.pop(campo, None)
        else:
            # deletar → armazena "" como override (mascara base)
            # caso contrário armazena o valor
            reg_ov[campo] = valor

        # Remove registro inteiro se ficou vazio (só metadados)
        campos_reais = [k for k in reg_ov if not k.startswith("_")]
        if not campos_reais:
            overrides.pop(cnpj, None)
        else:
            reg_ov["_edited_at"] = datetime.now().isoformat(timespec="seconds")
            overrides[cnpj] = reg_ov

        _salvar_overrides(overrides)

    # Recarrega em memória para refletir a mudança
    recarregar_dados()

    # Retorna o registro atualizado (ou None se não encontrado)
    atualizado = next((r for r in _dados if (r.get("cnpj") or "").strip() == cnpj), None)
    return jsonify({"ok": True, "registro": atualizado})


# ---------------------------------------------------------------------------
# Inicialização de dados — roda ao importar o módulo (suporta flask run e WSGI)
# ---------------------------------------------------------------------------

recarregar_dados()


def _deve_iniciar_worker() -> bool:
    """
    Evita que o worker seja duplicado sob o reloader do Flask debug.
    - `python app.py` (script direto): este módulo é __main__; o reloader
      dispara um processo filho com WERKZEUG_RUN_MAIN=true → só iniciamos nele.
    - WSGI (gunicorn/waitress/etc.): __name__ == "app"; não há reloader → inicia.
    """
    if __name__ != "__main__":
        return True
    return os.environ.get("WERKZEUG_RUN_MAIN") == "true"


if _deve_iniciar_worker():
    url_health.iniciar_worker()
    afiliados_health.iniciar_worker()
    csv_sync.iniciar_worker()

# ---------------------------------------------------------------------------
# Ponto de entrada
# ---------------------------------------------------------------------------


if __name__ == "__main__":
    recarregar_dados()
    fonte = "JSON enriquecido" if ARQUIVO_JSON.exists() else "CSV básico (sem enriquecimento)"
    n_ov = sum(1 for r in _dados if r.get("_editado_manualmente"))
    print(f"\nDashboard iniciado — {len(_dados)} registros carregados ({fonte})")
    if n_ov:
        print(f"  {n_ov} registro(s) com edições manuais aplicadas")
    print("Acesse: http://localhost:5001\n")
    app.run(debug=True, port=5001)
