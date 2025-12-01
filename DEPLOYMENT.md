# 🚀 Guia de Deployment - Athletrics

Este guia fornece instruções completas para rodar o projeto **Athletrics** tanto localmente quanto na VM do Google Cloud.

## 📋 Pré-requisitos

### Local (Windows)
- Docker Desktop instalado e rodando
- Git (para clonar o repositório)
- Editor de texto para configurar variáveis de ambiente

### VM do Google Cloud
- VM Ubuntu/Debian configurada
- Acesso SSH à VM
- Firewall do Google Cloud configurado (veja seção abaixo)

---

## 🖥️ Configuração Local (Windows)

### Passo 1: Clonar o Repositório (se necessário)
```powershell
git clone https://github.com/lnatamm/tcc.git
cd tcc
```

### Passo 2: Configurar Variáveis de Ambiente

Edite o arquivo `.env` com suas credenciais:
```env
# Database - Supabase
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_KEY=sua-chave-supabase

# S3 / Object Storage
S3_ID=seu-access-key-id
S3_KEY=sua-secret-access-key
S3_ENDPOINT=https://seu-endpoint-s3.com
S3_REGION=us-east-1
S3_BUCKET=fotos

# Application
APP_ENV=dev

# URLs (para ambiente local)
VITE_CLIENT_URL=http://localhost
VITE_API_URL=http://localhost:8080
```

### Passo 3: Rodar com Docker Compose

#### Opção A: Usando o Script Automatizado
```powershell
.\setup-local.ps1
```

#### Opção B: Manualmente
```powershell
# Parar containers antigos (se existirem)
docker-compose down

# Construir e iniciar os containers
docker-compose up -d --build

# Verificar status
docker-compose ps

# Ver logs (opcional)
docker-compose logs -f
```

### Passo 4: Acessar a Aplicação
- **Frontend**: http://localhost
- **Backend API**: http://localhost:8080
- **Documentação da API**: http://localhost:8080/docs

### Comandos Úteis - Local
```powershell
# Ver logs em tempo real
docker-compose logs -f

# Parar os containers
docker-compose down

# Reiniciar os containers
docker-compose restart

# Reconstruir os containers (após mudanças no código)
docker-compose up -d --build

# Ver status dos containers
docker-compose ps
```

---

## ☁️ Configuração na VM do Google Cloud

### Informações da VM
- **IP Externo**: 34.70.210.208
- **IP Interno**: 10.128.0.2

### Passo 1: Configurar Firewall do Google Cloud

**⚠️ IMPORTANTE**: Este é o passo mais crítico para acessar a aplicação externamente!

#### Via Console do Google Cloud (Recomendado)
1. Acesse o [Console do Google Cloud](https://console.cloud.google.com)
2. Navegue para **VPC Network** > **Firewall**
3. Clique em **CREATE FIREWALL RULE**
4. Configure a regra:

   **Para HTTP (porta 80):**
   - Nome: `allow-http-athletrics`
   - Direction: `Ingress`
   - Targets: `All instances in the network` ou `Specified target tags`
   - Source filter: `IP ranges`
   - Source IP ranges: `0.0.0.0/0` (para acesso público)
   - Protocols and ports: `tcp:80`

   **Para Backend (porta 8080):**
   - Nome: `allow-backend-athletrics`
   - Direction: `Ingress`
   - Targets: `All instances in the network` ou `Specified target tags`
   - Source filter: `IP ranges`
   - Source IP ranges: `0.0.0.0/0` (para acesso público)
   - Protocols and ports: `tcp:8080`

5. Clique em **CREATE**

#### Via gcloud CLI (Alternativo)
```bash
# Permitir tráfego HTTP (porta 80)
gcloud compute firewall-rules create allow-http-athletrics \
    --allow tcp:80 \
    --source-ranges 0.0.0.0/0 \
    --description "Allow HTTP traffic to Athletrics frontend"

# Permitir tráfego na porta 8080
gcloud compute firewall-rules create allow-backend-athletrics \
    --allow tcp:8080 \
    --source-ranges 0.0.0.0/0 \
    --description "Allow traffic to Athletrics backend"
```

### Passo 2: Conectar à VM via SSH
```bash
# Via console do Google Cloud (botão SSH)
# OU via gcloud CLI:
gcloud compute ssh sua-instancia-vm --zone=sua-zona
```

### Passo 3: Clonar o Repositório na VM
```bash
# Instalar git (se necessário)
sudo apt-get update
sudo apt-get install -y git

# Clonar o repositório
cd ~
git clone https://github.com/lnatamm/tcc.git
cd tcc
```

### Passo 4: Configurar Variáveis de Ambiente na VM
1. Crie o .env na VM:
   ```bash
   touch .env
   ```

2. Edite o arquivo `.env`:
   ```bash
   nano .env
   ```

3. Configure com suas credenciais e o IP da VM:
   ```env
   # Database - Supabase
   SUPABASE_URL=https://seu-projeto.supabase.co
   SUPABASE_KEY=sua-chave-supabase
   
   # S3 / Object Storage
   S3_ID=seu-access-key-id
   S3_KEY=sua-secret-access-key
   S3_ENDPOINT=https://seu-endpoint-s3.com
   S3_REGION=us-east-1
   S3_BUCKET=fotos
   
   # Application
   APP_ENV=prod
   
   # URLs (IP externo da VM)
   VITE_CLIENT_URL=http://34.70.210.208
   VITE_API_URL=http://34.70.210.208:8080
   ```

4. Salve o arquivo (Ctrl+O, Enter, Ctrl+X no nano)

### Passo 5: Rodar com Docker Compose na VM

#### Opção A: Usando o Script Automatizado
```bash
# Tornar o script executável
chmod +x setup-vm.sh

# Executar o script
./setup-vm.sh

# Se solicitado, faça logout e login novamente para aplicar permissões do Docker
exit
# Conecte novamente via SSH e execute:
cd ~/tcc
docker-compose up -d
```

#### Opção B: Manualmente
```bash
# Instalar Docker
sudo apt-get update
sudo apt-get install -y apt-transport-https ca-certificates curl software-properties-common
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io

# Instalar Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Adicionar seu usuário ao grupo docker
sudo usermod -aG docker $USER

# Fazer logout e login novamente, então:
cd ~/tcc

# Construir e iniciar os containers
docker-compose up -d --build

# Verificar status
docker-compose ps
```

### Passo 6: Acessar a Aplicação na VM
- **Frontend**: http://34.70.210.208
- **Backend API**: http://34.70.210.208:8080
- **Documentação da API**: http://34.70.210.208:8080/docs

### Comandos Úteis - VM
```bash
# Ver logs em tempo real
docker-compose logs -f

# Ver logs de um serviço específico
docker-compose logs -f backend
docker-compose logs -f frontend

# Parar os containers
docker-compose down

# Reiniciar os containers
docker-compose restart

# Atualizar código e reiniciar
git pull
docker-compose up -d --build

# Ver status dos containers
docker-compose ps

# Entrar em um container (debug)
docker exec -it athletrics-backend bash
docker exec -it athletrics-frontend sh
```

---

## 🔧 Troubleshooting

### Não consigo acessar a VM externamente

1. **Verifique o firewall do Google Cloud**:
   - Confirme que as regras de firewall foram criadas
   - Verifique se estão aplicadas à sua VM
   - Teste com: `gcloud compute firewall-rules list`

2. **Verifique se os containers estão rodando**:
   ```bash
   docker-compose ps
   ```

3. **Verifique os logs**:
   ```bash
   docker-compose logs backend
   docker-compose logs frontend
   ```

4. **Teste a conectividade**:
   ```bash
   # Da sua máquina local
   curl http://34.70.210.208:8080/api
   ```

### Erro de CORS

Se você receber erros de CORS, verifique:
1. O arquivo `.env` tem as URLs corretas
2. O `main.py` do backend foi atualizado com as origens corretas
3. Reinicie os containers após mudanças

### Containers não iniciam

1. **Verifique os logs**:
   ```bash
   docker-compose logs
   ```

2. **Verifique se as portas estão em uso**:
   ```bash
   # No Windows
   netstat -ano | findstr :80
   netstat -ano | findstr :8080
   
   # No Linux
   sudo lsof -i :80
   sudo lsof -i :8080
   ```

3. **Limpe containers antigos**:
   ```bash
   docker-compose down -v
   docker system prune -a
   ```

### Backend não conecta ao Supabase

Verifique:
1. As credenciais no arquivo `.env` estão corretas
2. O Supabase está acessível da VM (teste com curl)
3. As variáveis de ambiente foram carregadas corretamente

---

## 📝 Notas Importantes

1. **Segurança**: Para produção, considere:
   - Usar HTTPS (SSL/TLS)
   - Restringir IPs de origem no firewall
   - Usar secrets management para credenciais
   - Configurar autenticação adequada

2. **Persistência de Dados**: Os dados ficam no Supabase, então são persistentes. Se precisar de volumes locais, adicione ao `docker-compose.yml`.

3. **Atualizações**: Para atualizar o código na VM:
   ```bash
   cd ~/tcc
   git pull
   docker-compose down
   docker-compose up -d --build
   ```

4. **Monitoramento**: Configure logs e monitoramento adequados para produção.

5. **Backup**: Faça backup regular das configurações e do banco de dados.

---

## 🆘 Suporte

Se encontrar problemas:
1. Verifique os logs: `docker-compose logs -f`
2. Verifique o status: `docker-compose ps`
3. Consulte a documentação do Google Cloud sobre firewall
4. Abra uma issue no GitHub

---

## 📞 Contato

Para dúvidas ou sugestões, entre em contato através das issues do GitHub.
