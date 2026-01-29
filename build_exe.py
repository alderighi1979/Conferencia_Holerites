"""
Script de build do executável (.exe) com PyInstaller.
Gera um único arquivo que inclui backend FastAPI + frontend React (build).

Pré-requisitos:
  - Python 3.10+ com dependências instaladas (pip install -r requirements.txt)
  - Node.js/npm para build do frontend
  - PyInstaller: pip install pyinstaller

Uso (na pasta raiz do projeto):
  python build_exe.py
"""
import os
import sys
import subprocess
import shutil

PROJECT_ROOT = os.path.dirname(os.path.abspath(__file__))
FRONTEND_DIR = os.path.join(PROJECT_ROOT, "frontend")
DIST_DIR = os.path.join(FRONTEND_DIR, "dist")
APP_NAME = "ConferenciaFolha"


def run(cmd, cwd=None, shell=True):
    """Executa comando e falha em caso de erro."""
    cwd = cwd or PROJECT_ROOT
    print(f"  > {cmd}")
    r = subprocess.run(cmd, shell=shell, cwd=cwd)
    if r.returncode != 0:
        sys.exit(r.returncode)


def main():
    print("=== Build do executável Conferência de Folha ===\n")

    # 1. Build do frontend (React/Vite)
    print("1. Build do frontend (npm run build)...")
    if not os.path.isdir(FRONTEND_DIR):
        print("   ERRO: Pasta frontend não encontrada.")
        sys.exit(1)
    run("npm ci --omit=dev 2>nul || npm install", cwd=FRONTEND_DIR)
    run("npm run build", cwd=FRONTEND_DIR)
    if not os.path.isdir(DIST_DIR) or not os.path.isfile(os.path.join(DIST_DIR, "index.html")):
        print("   ERRO: frontend/dist não foi gerado. Verifique o build do Vite.")
        sys.exit(1)
    print("   OK.\n")

    # 2. PyInstaller
    print("2. Empacotando com PyInstaller...")
    # Usar caminho RELATIVO para evitar que PyInstaller interprete "C:" em --add-data
    # No Windows: origem;destino | No Linux/Mac: origem:destino
    rel_frontend_dist = os.path.join("frontend", "dist")
    if sys.platform == "win32":
        add_data = f"{rel_frontend_dist};frontend_dist"
    else:
        add_data = f"{rel_frontend_dist}:frontend_dist"

    cmd = [
        sys.executable, "-m", "PyInstaller",
        "--onefile",
        "--windowed",
        f"--name={APP_NAME}",
        f"--add-data={add_data}",
        "--hidden-import=uvicorn.logging",
        "--hidden-import=uvicorn.loops",
        "--hidden-import=uvicorn.loops.auto",
        "--hidden-import=uvicorn.protocols",
        "--hidden-import=uvicorn.protocols.http",
        "--hidden-import=uvicorn.protocols.http.auto",
        "--hidden-import=uvicorn.protocols.websockets",
        "--hidden-import=uvicorn.protocols.websockets.auto",
        "--hidden-import=uvicorn.lifespan",
        "--hidden-import=uvicorn.lifespan.on",
        "--collect-all=uvicorn",
        "run_server.py",
    ]
    run(" ".join(cmd))
    print("   OK.\n")

    exe_path = os.path.join(PROJECT_ROOT, "dist", f"{APP_NAME}.exe")
    if os.path.isfile(exe_path):
        print(f"3. Executável gerado: {exe_path}")
        print("\n   Copie o .exe para qualquer pasta e execute. O banco de dados")
        print("   será criado em: %%APPDATA%%\\ConferenciaFolha\\")
    else:
        print("   AVISO: Executável não encontrado em dist/")
    print("\n=== Concluído ===")


if __name__ == "__main__":
    main()
