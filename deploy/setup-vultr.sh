#!/bin/bash
# setup-vultr.sh - Script de setup inicial do servidor Vultr São Paulo

set -e

echo "🚀 Setup OPGT no Vultr São Paulo"
echo "================================"

echo "📦 Atualizando sistema..."
sudo apt update && sudo apt upgrade -y

echo "🐳 Instalando Docker..."
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

echo "📦 Instalando Docker Compose..."
sudo curl -L "https://github.com/docker/compose/releases/download/v2.24.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

echo "🛠️  Instalando ferramentas..."
sudo apt install -y git htop ncdu postgresql-client-16

echo "🔥 Configurando firewall..."
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable

echo "📁 Criando diretórios..."
mkdir -p ~/opgt/{backups,logs,ssl}
cd ~/opgt

echo "📝 Criando arquivo .env..."
cat > .env << 'EOF'
POSTGRES_PASSWORD=CHANGE_ME
GEOSERVER_ADMIN_PASSWORD=CHANGE_ME
EOF

echo "⚠️  IMPORTANTE: Edite o arquivo .env com senhas fortes!"

echo ""
echo "✅ Setup concluído!"
echo ""
echo "Próximos passos:"
echo "1. Editar ~/opgt/.env com senhas seguras"
echo "2. Transferir backup do Railway via scp"
echo "3. Executar docker-compose up -d"
echo ""
echo "Comandos úteis:"
echo "  docker-compose logs -f          # Ver logs"
echo "  docker-compose ps               # Status dos containers"
echo "  docker-compose restart         # Reiniciar serviços"
