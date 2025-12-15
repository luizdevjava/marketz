#!/bin/bash

echo "🚀 Script de Força de Criação de Tabelas - MarketX Lite"
echo "======================================================"
echo ""

# Verificar DATABASE_URL
if [ -z "$DATABASE_URL" ]; then
    echo "❌ DATABASE_URL não encontrada!"
    echo ""
    echo "Configure a variável de ambiente:"
    echo "export DATABASE_URL='postgresql://user:password@ep-xxx.us-east-1.aws.neon.tech/dbname?sslmode=require'"
    exit 1
fi

echo "🔗 Conectando ao Neon PostgreSQL..."
echo "URL: $DATABASE_URL" | sed 's/\/\/.*@/\/\/***:***@/'
echo ""

echo "📋 Etapa 1: Verificando conexão com Prisma..."
npx prisma db pull --skip-generate || echo "⚠️  Pull falhou (esperado se não existir tabelas)"

echo ""
echo "📋 Etapa 2: Forçando criação das tabelas..."
npx prisma db push --force-reset

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Tabelas criadas com sucesso!"
else
    echo ""
    echo "❌ Erro ao criar tabelas. Verifique:"
    echo "  1. A DATABASE_URL está correta"
    echo "  2. O projeto Neon está ativo"
    echo "  3. Você tem permissões no banco"
    exit 1
fi

echo ""
echo "📋 Etapa 3: Populando dados iniciais..."
npx tsx scripts/setup-neon-db.ts

echo ""
echo "🎉 Setup concluído!"
echo ""
echo "🔐 Credenciais de Acesso:"
echo "  🏢 Admin: admin@marketx.com / admin123"
echo "  👤 User:  user@test.com / user123"
echo ""
echo "🚀 Sistema pronto para deploy!"