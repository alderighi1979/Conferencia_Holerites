"""
Ponto de entrada para executar o servidor (script ou .exe PyInstaller).
Em modo executável, abre o navegador após o servidor subir.
"""
import sys
import threading
import webbrowser
import uvicorn

URL = "http://localhost:8001"


def open_browser():
    """Abre o navegador após um curto delay (para o servidor estar pronto)."""
    import time
    time.sleep(2.0)
    try:
        webbrowser.open(URL)
    except Exception:
        pass


if __name__ == "__main__":
    if getattr(sys, "frozen", False):
        threading.Thread(target=open_browser, daemon=True).start()
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8001,
    )
