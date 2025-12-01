# Script para rodar o projeto localmente no Windows com Docker
# Execute com: .\setup-local.ps1

Write-Host "==> Configurando Athletrics localmente..." -ForegroundColor Green

# 1. Verificar se Docker esta rodando
Write-Host "[1/5] Verificando Docker..." -ForegroundColor Cyan
$dockerRunning = docker info 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERRO] Docker nao esta rodando! Por favor, inicie o Docker Desktop." -ForegroundColor Red
    exit 1
}

# 2. Criar arquivo .env se nao existir
if (-not (Test-Path ".env")) {
    Write-Host "[2/5] Criando arquivo .env..." -ForegroundColor Cyan
    Copy-Item ".env.example" ".env"
    Write-Host ""
    Write-Host "[IMPORTANTE] Edite o arquivo .env com suas credenciais!" -ForegroundColor Yellow
    Write-Host "  - SUPABASE_URL e SUPABASE_KEY" -ForegroundColor Yellow
    Write-Host "  - S3_ID, S3_KEY, S3_ENDPOINT, S3_REGION, S3_BUCKET" -ForegroundColor Yellow
    Write-Host ""
    Read-Host "Pressione Enter depois de editar o arquivo .env"
}

# 3. Parar containers antigos
Write-Host "[3/5] Parando containers antigos..." -ForegroundColor Cyan
docker-compose down

# 4. Construir e iniciar containers
Write-Host "[4/5] Construindo e iniciando containers..." -ForegroundColor Cyan
docker-compose up -d --build

# 5. Verificar status
Write-Host "[5/5] Verificando status dos containers..." -ForegroundColor Cyan
docker-compose ps

Write-Host ""
Write-Host "==> Configuracao concluida com sucesso!" -ForegroundColor Green
Write-Host ""
Write-Host "Acesse a aplicacao em:" -ForegroundColor Cyan
Write-Host "  Frontend: http://localhost" -ForegroundColor White
Write-Host "  Backend API: http://localhost:8080" -ForegroundColor White
Write-Host "  Documentacao API: http://localhost:8080/docs" -ForegroundColor White
Write-Host ""
Write-Host "Comandos uteis:" -ForegroundColor Cyan
Write-Host "  Ver logs: docker-compose logs -f" -ForegroundColor White
Write-Host "  Parar: docker-compose down" -ForegroundColor White
Write-Host "  Reiniciar: docker-compose restart" -ForegroundColor White
