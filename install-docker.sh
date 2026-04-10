#!/bin/bash

# Script para instalar Docker na VM (suporta Debian e Ubuntu)
# Execute com: bash install-docker.sh

set -e

echo "==> Instalando Docker na VM..."
echo ""

# Detectar sistema operacional
if [ -f /etc/os-release ]; then
    . /etc/os-release
    OS=$ID
    VERSION=$VERSION_CODENAME
else
    echo "Erro: Nao foi possivel detectar o sistema operacional"
    exit 1
fi

echo "Sistema detectado: $OS $VERSION"
echo ""

# [1/6] Remover instalacoes antigas
echo "[1/6] Removendo instalacoes antigas do Docker..."
sudo apt-get remove -y docker docker-engine docker.io containerd runc 2>/dev/null || true

# [2/6] Atualizar sistema
echo "[2/6] Atualizando sistema..."
sudo apt-get update
sudo apt-get install -y ca-certificates curl gnupg lsb-release

# [3/6] Adicionar chave GPG do Docker
echo "[3/6] Adicionando repositorio oficial do Docker..."
sudo install -m 0755 -d /etc/apt/keyrings

# Usar o repositório correto baseado no OS
if [ "$OS" = "debian" ]; then
    # Para Debian
    curl -fsSL https://download.docker.com/linux/debian/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    sudo chmod a+r /etc/apt/keyrings/docker.gpg
    
    echo \
      "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/debian \
      $VERSION stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
else
    # Para Ubuntu
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    sudo chmod a+r /etc/apt/keyrings/docker.gpg
    
    echo \
      "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
      $VERSION stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
fi

# [4/6] Instalar Docker
echo "[4/6] Instalando Docker Engine..."
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# [5/6] Instalar Docker Compose standalone (backup)
echo "[5/6] Instalando Docker Compose standalone..."
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# [6/6] Configurar permissoes
echo "[6/6] Configurando permissoes..."
sudo usermod -aG docker $USER

# Iniciar Docker
echo "Iniciando Docker..."
sudo systemctl start docker
sudo systemctl enable docker

echo ""
echo "==> Verificando instalacao..."
sudo docker --version
docker-compose --version

echo ""
echo "==> Instalacao concluida com sucesso!"
echo ""
echo "[IMPORTANTE] Faca logout e login novamente para aplicar as permissoes:"
echo "  exit"
echo "  # Reconecte via SSH"
echo ""
echo "Depois execute:"
echo "  cd ~/tcc"
echo "  bash setup-vm.sh"
echo ""
