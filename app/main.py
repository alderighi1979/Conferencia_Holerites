import os
import sys
import threading
import logging
from fastapi import FastAPI, Request
from fastapi.responses import Response, FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.routers import inss, irrf, config_simplificada, eventos, calculo, calculo_proventos
from app.paths import STATIC_DIR

# Garantir que os modelos estão registrados em Base.metadata antes de create_all
from app import models  # noqa: F401

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def _criar_tabelas():
    """Cria as tabelas no banco. Chamado na inicialização e no startup."""
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("Tabelas do banco de dados verificadas/criadas.")
    except Exception as e:
        logger.exception("Erro ao criar tabelas: %s", e)
        raise


def _migrar_incidencia_eventos():
    """Migra colunas de incidência de valores legados para SOMA/DIMINUI/ISENTO."""
    from sqlalchemy import text
    colunas = [
        "inss_mensal", "fgts_mensal", "irrf_mensal",
        "inss_13", "fgts_13", "irrf_13",
        "inss_ferias", "fgts_ferias", "irrf_ferias"
    ]
    # Mapeamento: valor antigo -> valor novo (SOMA, DIMINUI, ISENTO)
    mapeamentos = [
        ("S", "SOMA"),
        ("I", "ISENTO"),
        ("SIM", "SOMA"),
        ("NAO", "ISENTO"),
    ]
    try:
        with engine.begin() as conn:
            for col in colunas:
                for antigo, novo in mapeamentos:
                    conn.execute(text(f"UPDATE tabela_eventos SET {col} = :novo WHERE {col} = :antigo"), {"novo": novo, "antigo": antigo})
        logger.info("Migração de incidências (valores legados -> SOMA/DIMINUI/ISENTO) aplicada.")
    except Exception as e:
        # Tabela pode não existir ou já estar migrada
        logger.debug("Migração incidências: %s", e)


# Criar as tabelas no banco de dados
_criar_tabelas()

# Criar aplicação FastAPI
app = FastAPI(
    title="Sistema de Conferência de Folha de Pagamento",
    description="API para gerenciamento de tabelas de INSS, IRRF, Configuração Simplificada e Eventos",
    version="1.0.0"
)

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Incluir rotas da API
app.include_router(inss.router)
app.include_router(irrf.router)
app.include_router(config_simplificada.router)
app.include_router(eventos.router)
app.include_router(calculo.router)
app.include_router(calculo_proventos.router)


@app.on_event("startup")
def startup():
    """Garante que as tabelas existem, migra incidências S/I e loga o caminho do banco."""
    try:
        db_url = str(engine.url).split("?")[0]
        logger.info("Banco de dados: %s", db_url)
        _criar_tabelas()
        _migrar_incidencia_eventos()
        # Teste rápido de conexão
        from app.database import SessionLocal
        from app.models import Tabela_INSS
        db = SessionLocal()
        try:
            db.query(Tabela_INSS).limit(1).all()
            logger.info("Conexão com o banco OK.")
        finally:
            db.close()
    except Exception as e:
        logger.exception("Erro no startup do banco: %s", e)
        raise


@app.exception_handler(Exception)
def global_exception_handler(request: Request, exc: Exception):
    """Registra exceções não tratadas e retorna 500 com detalhe (para diagnóstico)."""
    logger.exception("Erro não tratado: %s", exc)
    return JSONResponse(
        status_code=500,
        content={"detail": str(exc), "type": type(exc).__name__},
    )


@app.get("/api")
def api_info():
    """Informações da API (rota /api para não conflitar com SPA)."""
    return {
        "message": "Sistema de Conferência de Folha de Pagamento API",
        "version": "1.0.0",
        "docs": "/docs"
    }


@app.get("/favicon.ico", include_in_schema=False)
def favicon():
    """Evita 404 quando o navegador solicita o ícone da página."""
    return Response(status_code=204)


@app.get("/health")
def health_check():
    """Endpoint de verificação de saúde"""
    return {"status": "healthy"}


@app.get("/api/debug/db", include_in_schema=False)
def debug_db():
    """Diagnóstico: lista tabelas e testa uma query. Use para ver erro 500."""
    from sqlalchemy import text
    try:
        with engine.connect() as conn:
            r = conn.execute(text("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"))
            tables = [row[0] for row in r]
        # Testar query em uma tabela
        with engine.connect() as conn:
            conn.execute(text("SELECT 1 FROM tabela_config_simplificada LIMIT 1"))
        return {"ok": True, "tables": tables, "database": str(engine.url).split("?")[0]}
    except Exception as e:
        logger.exception("debug_db: %s", e)
        return JSONResponse(status_code=500, content={"detail": str(e), "type": type(e).__name__})


def _encerrar_servidor():
    """Encerra o processo do servidor após breve delay (para enviar a resposta ao cliente)."""
    def _sair():
        import time
        time.sleep(0.8)
        os._exit(0)
    threading.Thread(target=_sair, daemon=True).start()


@app.post("/api/sair", include_in_schema=False)
def sair():
    """Encerra o servidor (chamado pelo botão Sair do menu)."""
    _encerrar_servidor()
    return {"ok": True, "mensagem": "Servidor encerrado."}


# Servir frontend (React build) e SPA fallback: rotas não-API → index.html
if os.path.isdir(STATIC_DIR):
    index_path = os.path.join(STATIC_DIR, "index.html")

    @app.get("/{full_path:path}", include_in_schema=False)
    def serve_spa(full_path: str):
        """Serve arquivo estático se existir; caso contrário, index.html (SPA)."""
        if full_path.startswith("api/"):
            return Response(status_code=404)
        if full_path == "" or full_path == "index.html":
            if os.path.isfile(index_path):
                return FileResponse(index_path)
        file_path = os.path.join(STATIC_DIR, full_path)
        if os.path.isfile(file_path):
            return FileResponse(file_path)
        if os.path.isfile(index_path):
            return FileResponse(index_path)
        return Response(status_code=404)
else:
    # Sem build do frontend (só backend): rota raiz retorna JSON
    @app.get("/")
    def root():
        return {
            "message": "Sistema de Conferência de Folha de Pagamento API",
            "version": "1.0.0",
            "docs": "/docs",
            "frontend": "Execute o build do frontend (npm run build) e coloque em frontend/dist para servir a interface."
        }
