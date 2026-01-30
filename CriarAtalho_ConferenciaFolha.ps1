# Cria atalho na Area de Trabalho para este sistema (Conferencia de Holerites e Ferias).
# Porta frontend: 3001 | Backend: 8001 | Abre: http://localhost:3001
# Execute na pasta do projeto: .\CriarAtalho_ConferenciaFolha.ps1

$ErrorActionPreference = "Stop"
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptDir

$desktop = [Environment]::GetFolderPath("Desktop")
$shortcutPath = Join-Path $desktop "Conferencia de Holerites e Ferias (porta 3001).lnk"

$batPath = Join-Path $scriptDir "run_app.bat"
if (-not (Test-Path $batPath)) {
    Write-Host "ERRO: run_app.bat nao encontrado em: $scriptDir"
    exit 1
}

$wsh = New-Object -ComObject WScript.Shell
$shortcut = $wsh.CreateShortcut($shortcutPath)
$shortcut.TargetPath = $batPath
$shortcut.WorkingDirectory = $scriptDir
$shortcut.Description = "Conferencia de Holerites e Ferias - Frontend 3001, Backend 8001 - Abre http://localhost:3001"

# Icone exclusivo: usar conferencia.ico na pasta do projeto se existir; senao logo do frontend; senao icone padrao do sistema
$iconIco = Join-Path $scriptDir "conferencia.ico"
$iconPng = Join-Path $scriptDir "frontend\public\logo-redepetro.png"
if (Test-Path $iconIco) {
    $shortcut.IconLocation = "$iconIco,0"
} elseif (Test-Path $iconPng) {
    $shortcut.IconLocation = "$iconPng,0"
} else {
    # Icone distintivo (calculadora/documento) para nao confundir com outro sistema
    $shortcut.IconLocation = "$env:SystemRoot\System32\imageres.dll,184"
}

$shortcut.Save()
[System.Runtime.Interopservices.Marshal]::ReleaseComObject($wsh) | Out-Null

Write-Host "Atalho criado: $shortcutPath"
Write-Host "Nome: Conferencia de Holerites e Ferias (porta 3001)"
Write-Host "Ao executar, o navegador abrira: http://localhost:3001"
