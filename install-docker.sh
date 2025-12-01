#!/bin/bash

# Script de instalacao manual do Docker para VM do Google Cloud
# Execute: bash install-docker.sh

echo "==> Instalando Docker na VM..."

# Remover instalacoes antigas
echo "[1/5] Removendo instalacoes antigas do Docker..."
sudo apt-get remove -y docker docker-engine docker.io containerd runc 2>/dev/null || true

# Atualizar sistema
echo "[2/5] Atualizando sistema..."
sudo apt-get update
sudo apt-get install -y ca-certificates curl gnupg lsb-release

# Adicionar repositorio do Docker
echo "[3/5] Adicionando repositorio oficial do Docker..."
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Instalar Docker
echo "[4/5] Instalando Docker Engine..."
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Instalar Docker Compose standalone
echo "[5/5] Instalando Docker Compose standalone..."
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Adicionar usuario ao grupo docker
echo "Configurando permissoes..."
sudo usermod -aG docker $USER

# Iniciar Docker
echo "Iniciando Docker..."
sudo systemctl start docker
sudo systemctl enable docker

# Verificar instalacao
echo ""
echo "==> Verificando instalacao..."
docker --version
docker-compose --version

echo ""
echo "==> Instalacao concluida!"
echo ""
echo "[IMPORTANTE] Faca logout e login novamente para aplicar as permissoes:"
echo "  exit"
echo "  # Reconecte via SSH"
echo ""
echo "Depois execute:"
echo "  cd ~/tcc"
echo "  bash setup-vm.sh"
