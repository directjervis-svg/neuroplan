#!/bin/bash

# ============================================
# NeuroExecução - Script de Deploy
# ============================================
# Este script automatiza o deploy da aplicação.
# Execute após o setup-vps.sh
#
# Uso: bash deploy.sh [dominio]
# Exemplo: bash deploy.sh neuroexecucao.com.br
# ============================================

set -e

DOMAIN=${1:-"localhost"}
APP_DIR="$HOME/neuroplan"

echo "============================================"
echo "  NeuroExecução - Deploy Automático"
echo "============================================"
echo "Domínio: $DOMAIN"
echo ""

# Carregar NVM
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Verificar se o diretório existe
if [ ! -d "$APP_DIR" ]; then
  echo "📥 Clonando repositório..."
  git clone https://github.com/directjervis-svg/neuroplan.git "$APP_DIR"
fi

cd "$APP_DIR"

# Atualizar código
echo "📥 Atualizando código..."
git pull origin main

# Instalar dependências
echo "📦 Instalando dependências..."
pnpm install

# Criar arquivo .env se não existir
if [ ! -f ".env" ]; then
  echo "⚙️ Criando arquivo .env..."
  cat > .env <<EOF
# ============================================
# BANCO DE DADOS
# ============================================
DATABASE_URL="mysql://neuro_user:neuroplan_secure_2026@localhost:3306/neuroplan"

# ============================================
# AUTENTICAÇÃO
# ============================================
JWT_SECRET="$(openssl rand -base64 32)"
OAUTH_SERVER_URL="https://api.manus.im"

# ============================================
# STRIPE (Pagamentos) - Configure suas chaves
# ============================================
STRIPE_SECRET_KEY="sk_test_placeholder"
STRIPE_WEBHOOK_SECRET="whsec_placeholder"
VITE_STRIPE_PUBLISHABLE_KEY="pk_test_placeholder"

# ============================================
# GOOGLE ANALYTICS 4 - Configure seu ID
# ============================================
VITE_GA_MEASUREMENT_ID="G-XXXXXXXXXX"

# ============================================
# OPENAI (Para Assistente IA)
# ============================================
OPENAI_API_KEY="sk-placeholder"

# ============================================
# APLICAÇÃO
# ============================================
VITE_APP_ID="neuroplan"
VITE_APP_TITLE="NeuroExecução"
VITE_APP_LOGO="🧠"
NODE_ENV="production"
EOF
  echo "⚠️  IMPORTANTE: Edite o arquivo .env com suas credenciais reais!"
fi

# Executar migrações
echo "🗄️ Executando migrações do banco de dados..."
pnpm db:push

# Build de produção
echo "🔨 Fazendo build de produção..."
pnpm build

# Configurar Nginx
if [ "$DOMAIN" != "localhost" ]; then
  echo "🌐 Configurando Nginx..."
  sudo tee /etc/nginx/sites-available/neuroplan > /dev/null <<EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

  sudo ln -sf /etc/nginx/sites-available/neuroplan /etc/nginx/sites-enabled/
  sudo nginx -t
  sudo systemctl restart nginx
  
  echo ""
  echo "🔐 Deseja configurar SSL (HTTPS) agora? (s/n)"
  read -r CONFIGURE_SSL
  if [ "$CONFIGURE_SSL" = "s" ]; then
    sudo certbot --nginx -d "$DOMAIN" -d "www.$DOMAIN"
  fi
fi

# Iniciar/Reiniciar aplicação com PM2
echo "🚀 Iniciando aplicação com PM2..."
pm2 delete neuroplan-app 2>/dev/null || true
NODE_ENV=production pm2 start dist/index.js --name "neuroplan-app"
pm2 save

# Configurar PM2 para iniciar no boot
pm2 startup | tail -1 | bash 2>/dev/null || true

echo ""
echo "============================================"
echo "  ✅ Deploy Concluído com Sucesso!"
echo "============================================"
echo ""
if [ "$DOMAIN" != "localhost" ]; then
  echo "🌐 Seu site está disponível em: https://$DOMAIN"
else
  echo "🌐 Seu site está disponível em: http://localhost:3000"
fi
echo ""
echo "📋 Comandos úteis:"
echo "  pm2 status          - Ver status da aplicação"
echo "  pm2 logs            - Ver logs em tempo real"
echo "  pm2 restart all     - Reiniciar aplicação"
echo ""
echo "⚠️  Lembre-se de configurar:"
echo "  1. Chaves do Stripe no arquivo .env"
echo "  2. ID do Google Analytics no arquivo .env"
echo "  3. Chave da OpenAI no arquivo .env"
echo ""
