#!/bin/bash
# ============================================
# NEUROEXECUÇÃO - Script de Migração SQL
# ============================================
# Executa migrações do Drizzle no banco de dados
# Uso: ./scripts/run-migrations.sh
# ============================================

set -e  # Exit on error

echo "🗄️  Iniciando migrações do banco de dados..."

# Verificar se DATABASE_URL está configurada
if [ -z "$DATABASE_URL" ]; then
  echo "❌ Erro: DATABASE_URL não está configurada"
  echo "Configure a variável de ambiente DATABASE_URL antes de executar migrações"
  exit 1
fi

echo "✅ DATABASE_URL configurada"

# Executar migrações usando Drizzle Kit
echo "📦 Executando migrações..."
npx drizzle-kit push:mysql

echo "✅ Migrações executadas com sucesso!"

# Verificar se a tabela user_calibration foi criada
echo "🔍 Verificando tabela user_calibration..."
mysql -e "DESCRIBE user_calibration;" $(echo $DATABASE_URL | sed 's/mysql:\/\///')

echo "✅ Todas as migrações foram aplicadas com sucesso!"
