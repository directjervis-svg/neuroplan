#!/bin/bash

# Script de Migração de Banco de Dados para Produção
# Executa as migrações do Drizzle de forma segura

set -e

echo "🚀 Iniciando migração do banco de dados para produção..."

# Verificar se as variáveis de ambiente estão configuradas
if [ -z "$DATABASE_URL" ]; then
  echo "❌ Erro: DATABASE_URL não está configurada"
  exit 1
fi

echo "📦 Gerando migrações do Drizzle..."
npx drizzle-kit generate

echo "🔄 Aplicando migrações..."
npx drizzle-kit migrate

echo "✅ Migrações concluídas com sucesso!"
echo "📊 Banco de dados sincronizado e pronto para produção."
