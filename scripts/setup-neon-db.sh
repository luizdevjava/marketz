#!/bin/bash

echo "🚀 Setup do Banco de Dados Neon - MarketX Lite"
echo "=================================================="
echo ""

# Verificar se DATABASE_URL está configurada
if [ -z "$DATABASE_URL" ]; then
    echo "❌ DATABASE_URL não encontrada!"
    echo ""
    echo "Por favor, configure a variável de ambiente:"
    echo "export DATABASE_URL='postgresql://user:password@ep-xxx.us-east-1.aws.neon.tech/dbname?sslmode=require'"
    echo ""
    echo "Ou configure no painel da Vercel:"
    echo "Settings → Environment Variables → DATABASE_URL"
    exit 1
fi

echo "🔗 URL do Banco de Dados:"
echo "$DATABASE_URL" | sed 's/\/\/.*@/\/\/***:***@/'
echo ""

echo "📋 Verificando/criando tabelas no Neon..."
echo ""

# Executar script de setup
npx tsx scripts/setup-neon-db.ts

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Setup concluído com sucesso!"
    echo ""
    echo "🚀 Próximos passos:"
    echo "1. Faça push para o GitHub"
    echo "2. Configure as variáveis de ambiente na Vercel"
    echo "3. Aguarde o deploy automático"
    echo ""
    echo "🔐 Credenciais para teste:"
    echo "   Admin: admin@marketx.com / admin123"
    echo "   User:  user@test.com / user123"
else
    echo ""
    echo "❌ Ocorreu um erro durante o setup"
    echo "Verifique a conexão com o banco de dados"
fi