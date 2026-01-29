import os
from fastapi import FastAPI
from fastapi.responses import Response, FileResponse
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.routers import inss, irrf, config_simplificada, eventos, calculo, calculo_proventos
from app.paths import STATIC_DIR

# Criar as tabelas no banco de dados
Base.metadata.create_all(bind=engine)

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
