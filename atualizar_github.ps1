# Atualiza o repositório GitHub (Conferência de Holerites)
# Execute na pasta do projeto: .\atualizar_github.ps1

$repoUrl = "https://github.com/alderighi1979/Confer-ncia_Holerites.git"
$branch = "main"

# Garantir que estamos na pasta do script
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptDir

# Se não existir .git, inicializar e fazer primeiro commit
if (-not (Test-Path ".git")) {
    Write-Host "Inicializando repositório Git..."
    git init
    git branch -M $branch
    git remote add origin $repoUrl
}

# Configurar remote origin (atualiza se já existir)
git remote remove origin 2>$null
git remote add origin $repoUrl
Write-Host "Remote configurado: $repoUrl"

# Adicionar arquivos (respeitando .gitignore)
git add -A
$status = git status --short
if ([string]::IsNullOrWhiteSpace($status)) {
    Write-Host "Nenhuma alteração para enviar."
    exit 0
}

Write-Host "Arquivos a serem commitados:"
git status -s

git commit -m "Atualização: Conferência de Holerites e Férias - build exe, PWA, paths, README instalação"
Write-Host "Fazendo push para origin/$branch ..."
git push -u origin $branch

Write-Host "Concluído."
