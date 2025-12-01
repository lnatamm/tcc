#!/bin/bash

# Script para configurar e rodar o projeto na VM do Google Cloud
# Execute com: bash setup-vm.sh

echo "🚀 Configurando Athletrics na VM do Google Cloud..."

# 1. Verificar se Docker está instalado
if ! command -v docker &> /dev/null; then
    echo "📦 Instalando Docker..."
    sudo apt-get update
    sudo apt-get install -y apt-transport-https ca-certificates curl software-properties-common
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
    sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"
    sudo apt-get update
    sudo apt-get install -y docker-ce docker-ce-cli containerd.io
fi

# 2. Verificar se Docker Compose está instalado
if ! command -v docker-compose &> /dev/null; then
    echo "📦 Instalando Docker Compose..."
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
fi

# 3. Adicionar usuário ao grupo docker
echo "👤 Configurando permissões do Docker..."
sudo usermod -aG docker $USER

# 4. Criar arquivo .env se não existir
if [ ! -f .env ]; then
    echo "📝 Criando arquivo .env..."
    cp .env.vm .env
    echo "⚠️  IMPORTANTE: Edite o arquivo .env com suas credenciais!"
    echo "   - SUPABASE_URL e SUPABASE_KEY"
    echo "   - S3_ID, S3_KEY, S3_ENDPOINT, S3_REGION, S3_BUCKET"
    read -p "Pressione Enter depois de editar o arquivo .env..."
fi

# 5. Parar containers antigos
echo "🛑 Parando containers antigos..."
docker-compose down

# 6. Construir e iniciar containers
echo "🏗️  Construindo e iniciando containers..."
docker-compose up -d --build

# 7. Verificar status
echo "✅ Verificando status dos containers..."
docker-compose ps

echo ""
echo "✨ Configuração concluída!"
echo ""
echo "🌐 Acesse a aplicação em:"
echo "   Frontend: http://34.70.210.208"
echo "   Backend API: http://34.70.210.208:8080"
echo "   Documentação API: http://34.70.210.208:8080/docs"
echo ""
echo "📋 Comandos úteis:"
echo "   Ver logs: docker-compose logs -f"
echo "   Parar: docker-compose down"
echo "   Reiniciar: docker-compose restart"
echo ""
echo "⚠️  LEMBRE-SE: Configure o firewall do Google Cloud para permitir tráfego nas portas 80 e 8080!"
