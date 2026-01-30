@echo off
title Encerrar Conferência de Holerites
echo Encerrando servidores (FastAPI e Vite)...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8000 ^| findstr LISTENING') do taskkill /f /pid %%a 2>nul
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000 ^| findstr LISTENING') do taskkill /f /pid %%a 2>nul
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5173 ^| findstr LISTENING') do taskkill /f /pid %%a 2>nul
echo Pronto. Feche o navegador se ainda estiver aberto.
timeout /t 2 >nul
exit
