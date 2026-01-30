@echo off
chcp 65001 >nul
title Conferência de Holerites

cd /d "%~dp0"

:: Ambiente virtual
if not exist ".venv\Scripts\activate.bat" (
    echo Criando ambiente virtual...
    python -m venv .venv
    if errorlevel 1 (
        echo [ERRO] Python nao encontrado ou falha ao criar venv.
        pause
        exit /b 1
    )
    call .venv\Scripts\activate
    if exist "requirements.txt" pip install -r requirements.txt
) else (
    call .venv\Scripts\activate
)

:: Inicia backend e frontend em janelas OCULTAS (nao exibe Vite nem FastAPI)
:: WorkingDirectory garante que o banco (conferencia_folha.db) fique na pasta do projeto
set "BASE=%~dp0"
set "FRONT=%~dp0frontend"
powershell -NoProfile -Command "Start-Process -FilePath 'cmd.exe' -ArgumentList '/c', 'call .venv\Scripts\activate.bat && uvicorn app.main:app --host 0.0.0.0 --port 8001' -WindowStyle Hidden -WorkingDirectory '%BASE%'"
powershell -NoProfile -Command "Start-Process -FilePath 'cmd.exe' -ArgumentList '/c', '(if not exist node_modules npm install) && npm run dev' -WindowStyle Hidden -WorkingDirectory '%FRONT%'"

:: Esperar servidores subirem, abrir navegador em localhost:3001 e fechar esta janela
timeout /t 6 /nobreak >nul
start "" "http://localhost:3001"
exit
