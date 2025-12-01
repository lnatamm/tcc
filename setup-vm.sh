#!/bin/bash

# Script para configurar e rodar o projeto na VM do Google Cloud
# Execute com: bash setup-vm.sh

set -e  # Parar em caso de erro

echo "==> Configurando Athletrics na VM do Google Cloud..."
echo ""

# 1. Verificar se Docker esta instalado
echo "[1/7] Verificando Docker..."
if ! command -v docker &> /dev/null; then
    echo "      Instalando Docker..."
    
    # Remover instalacoes antigas
    sudo apt-get remove -y docker docker-engine docker.io containerd runc 2>/dev/null || true
    
    # Atualizar repositorios
    sudo apt-get update
    sudo apt-get install -y ca-certificates curl gnupg lsb-release
    
    # Adicionar chave GPG oficial do Docker
    sudo install -m 0755 -d /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    sudo chmod a+r /etc/apt/keyrings/docker.gpg
    
    # Configurar repositorio
    echo \
      "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
      $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    
    # Instalar Docker Engine
    sudo apt-get update
    sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
    
    echo "      Docker instalado com sucesso!"
else
    echo "      Docker ja esta instalado"
fi

# 2. Verificar se Docker Compose esta instalado
echo "[2/7] Verificando Docker Compose..."
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "      Instalando Docker Compose (standalone)..."
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    echo "      Docker Compose instalado com sucesso!"
else
    echo "      Docker Compose ja esta instalado"
fi

# 3. Adicionar usuario ao grupo docker
echo "[3/7] Configurando permissoes do Docker..."
sudo usermod -aG docker $USER
echo "      Usuario adicionado ao grupo docker"

# 3.5. Iniciar Docker daemon se nao estiver rodando
echo "[3.5/7] Verificando se Docker daemon esta rodando..."
if ! sudo systemctl is-active --quiet docker; then
    echo "      Iniciando Docker daemon..."
    sudo systemctl start docker
    sudo systemctl enable docker
    echo "      Docker daemon iniciado"
else
    echo "      Docker daemon ja esta rodando"
fi

# 4. Verificar se o arquivo .env existe
echo "[4/7] Verificando arquivo .env..."
if [ ! -f .env ]; then
    echo "      Criando arquivo .env..."
    cp .env.vm .env
    echo ""
    echo "[IMPORTANTE] Edite o arquivo .env com suas credenciais!"
    echo "  - SUPABASE_URL e SUPABASE_KEY"
    echo "  - S3_ID, S3_KEY, S3_ENDPOINT, S3_REGION, S3_BUCKET"
    echo ""
    echo "Execute: nano .env"
    echo ""
    read -p "Pressione Enter depois de editar o arquivo .env..."
else
    echo "      Arquivo .env ja existe"
fi

# 5. Parar containers antigos
echo "[5/7] Parando containers antigos..."
sudo docker-compose down 2>/dev/null || true

# 6. Construir e iniciar containers
echo "[6/7] Construindo e iniciando containers..."
echo "      (Isso pode levar alguns minutos...)"
sudo docker-compose up -d --build

# 7. Verificar status
echo "[7/7] Verificando status dos containers..."
sudo docker-compose ps

echo ""
echo "==> Configuracao concluida com sucesso!"
echo ""
echo "Acesse a aplicacao em:"
echo "  Frontend: http://34.70.210.208"
echo "  Backend API: http://34.70.210.208:8080"
echo "  Documentacao API: http://34.70.210.208:8080/docs"
echo ""
echo "Comandos uteis:"
echo "  Ver logs: sudo docker-compose logs -f"
echo "  Parar: sudo docker-compose down"
echo "  Reiniciar: sudo docker-compose restart"
echo ""
echo "[IMPORTANTE] Configure o firewall do Google Cloud!"
echo "  1. Acesse: https://console.cloud.google.com"
echo "  2. VPC Network > Firewall > CREATE FIREWALL RULE"
echo "  3. Crie regras para portas 80 e 8080"
echo ""
