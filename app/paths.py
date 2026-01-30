"""
Gestão de caminhos para execução como script ou como executável PyInstaller.
- Em modo script: usa o diretório do projeto.
- Em modo executável (sys.frozen): usa sys._MEIPASS para recursos e AppData para dados (DB).
"""
import os
import sys

def _get_base_path() -> str:
    """Diretório base do aplicativo (onde está o executável ou o script)."""
    if getattr(sys, "frozen", False):
        # Executável PyInstaller: diretório onde o .exe está
        return os.path.dirname(sys.executable)
    # Script: diretório do projeto (pai de app/)
    return os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))

def _get_meipass_path() -> str:
    """Diretório temporário de extração do PyInstaller (recursos embutidos)."""
    if getattr(sys, "frozen", False) and hasattr(sys, "_MEIPASS"):
        return sys._MEIPASS
    # Em desenvolvimento: mesmo que base (não há _MEIPASS)
    return _get_base_path()

def get_data_dir() -> str:
    """
    Diretório para dados persistentes (banco SQLite).
    Em executável: AppData do usuário para evitar 'permissão negada' em Program Files.
    Em script: diretório de trabalho atual (cwd), para funcionar com run_app.bat
    que faz 'cd /d pasta_projeto' antes de iniciar o uvicorn.
    """
    if getattr(sys, "frozen", False):
        appdata = os.environ.get("APPDATA", os.path.expanduser("~"))
        data_dir = os.path.join(appdata, "ConferenciaFolha")
        os.makedirs(data_dir, exist_ok=True)
        return data_dir
    # Usar cwd para que run_app.bat (que faz cd para a pasta do projeto) use o mesmo banco
    return os.path.abspath(os.getcwd())

def get_static_dir() -> str:
    """
    Diretório dos arquivos estáticos do frontend (React build).
    Em executável: pasta frontend_dist dentro de _MEIPASS.
    Em script: frontend/dist na raiz do projeto.
    """
    if getattr(sys, "frozen", False) and hasattr(sys, "_MEIPASS"):
        return os.path.join(sys._MEIPASS, "frontend_dist")
    return os.path.join(_get_base_path(), "frontend", "dist")

# Exportar para uso em database e main
BASE_PATH = _get_base_path()
DATA_DIR = get_data_dir()
STATIC_DIR = get_static_dir()
MEIPASS = _get_meipass_path()
