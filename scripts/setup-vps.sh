#!/bin/bash

# ============================================
# NeuroExecução - Script de Setup para VPS
# ============================================
# Este script automatiza a configuração inicial
# de uma VPS Ubuntu para rodar o NeuroExecução.
#
# Uso: sudo bash setup-vps.sh
# ============================================

set -e

echo "============================================"
echo "  NeuroExecução - Setup Automático VPS"
echo "============================================"
echo ""

# Verificar se está rodando como root
if [ "$EUID" -ne 0 ]; then
  echo "❌ Por favor, execute como root (sudo bash setup-vps.sh)"
  exit 1
fi

# Atualizar sistema
echo "📦 Atualizando sistema..."
apt update && apt upgrade -y

# Instalar dependências básicas
echo "📦 Instalando dependências básicas..."
apt install -y curl git build-essential nginx mysql-server certbot python3-certbot-nginx

# Criar usuário 'neuro' se não existir
if ! id "neuro" &>/dev/null; then
  echo "👤 Criando usuário 'neuro'..."
  adduser --disabled-password --gecos "" neuro
  usermod -aG sudo neuro
  echo "neuro ALL=(ALL) NOPASSWD:ALL" >> /etc/sudoers.d/neuro
fi

# Instalar NVM para o usuário neuro
echo "📦 Instalando NVM e Node.js..."
sudo -u neuro bash -c 'curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash'
sudo -u neuro bash -c 'export NVM_DIR="$HOME/.nvm" && [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh" && nvm install 22 && nvm alias default 22'

# Instalar pnpm
echo "📦 Instalando pnpm..."
sudo -u neuro bash -c 'curl -fsSL https://get.pnpm.io/install.sh | sh -'

# Instalar PM2 globalmente
echo "📦 Instalando PM2..."
sudo -u neuro bash -c 'export NVM_DIR="$HOME/.nvm" && [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh" && npm install -g pm2'

# Iniciar MySQL
echo "🗄️ Configurando MySQL..."
systemctl start mysql
systemctl enable mysql

# Criar banco de dados
mysql -u root <<EOF
CREATE DATABASE IF NOT EXISTS neuroplan;
CREATE USER IF NOT EXISTS 'neuro_user'@'localhost' IDENTIFIED BY 'neuroplan_secure_2026';
GRANT ALL PRIVILEGES ON neuroplan.* TO 'neuro_user'@'localhost';
FLUSH PRIVILEGES;
EOF

echo ""
echo "============================================"
echo "  ✅ Setup Inicial Concluído!"
echo "============================================"
echo ""
echo "Próximos passos:"
echo "1. Faça login como usuário 'neuro': su - neuro"
echo "2. Clone o repositório: git clone https://github.com/directjervis-svg/neuroplan.git"
echo "3. Execute o script de deploy: bash ~/neuroplan/scripts/deploy.sh"
echo ""
echo "Credenciais do banco de dados:"
echo "  Usuário: neuro_user"
echo "  Senha: neuroplan_secure_2026"
echo "  Banco: neuroplan"
echo ""
echo "⚠️  IMPORTANTE: Altere a senha do banco de dados em produção!"
echo ""
