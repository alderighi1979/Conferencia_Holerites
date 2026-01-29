@echo off
chcp 65001 >nul
title Conferência de Holerites - Iniciar

:: Ir para a pasta do script (raiz do projeto)
cd /d "%~dp0"

:: Criar ambiente virtual se nao existir
if not exist ".venv\Scripts\activate.bat" (
    echo Ambiente virtual nao encontrado. Criando .venv...
    python -m venv .venv
    if errorlevel 1 (
        echo [ERRO] Nao foi possivel criar o ambiente virtual.
        echo Verifique se o Python esta instalado e no PATH.
        pause
        exit /b 1
    )
    echo Ambiente virtual criado.
    call .venv\Scripts\activate
    if exist "requirements.txt" (
        echo Instalando dependencias...
        pip install -r requirements.txt
    )
    echo.
) else (
    call .venv\Scripts\activate
)

:: Iniciar backend (FastAPI) em uma nova janela
echo Iniciando servidor FastAPI (backend)...
start "Servidor FastAPI - Conferencia de Holerites" cmd /k "cd /d "%~dp0" && call .venv\Scripts\activate && echo Servidor API em execucao. Feche esta janela para encerrar. && echo. && uvicorn app.main:app --host 0.0.0.0 --port 8000"

:: Iniciar frontend (Vite/React) em uma nova janela
echo Iniciando frontend (interface)...
start "Frontend - Conferencia de Holerites" cmd /k "cd /d "%~dp0frontend" && (if not exist node_modules npm install) && npm run dev"

:: Aguardar os servidores subirem
timeout /t 5 /nobreak >nul

:: Abrir o navegador na interface (frontend)
start "" "http://localhost:3000"

echo.
echo Navegador aberto em http://localhost:3000 (interface do sistema)
echo.
echo Para ENCERRAR o sistema, feche as duas janelas:
echo   - Servidor FastAPI - Conferencia de Holerites
echo   - Frontend - Conferencia de Holerites
echo.
pause
