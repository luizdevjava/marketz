#!/bin/bash

echo "🚀 CONFIGURAÇÃO FORÇADA DO NEON - MARKETX LITE"
echo "========================================="
echo ""

# Verificar se foi fornecida a URL do Neon
if [ -z "$1" ]; then
    echo "❌ URL do Neon não fornecida!"
    echo ""
    echo "Uso: ./scripts/setup-neon-force.sh 'postgresql://user:password@ep-xxx.neon.tech/db?sslmode=require'"
    echo ""
    echo "Ou configure a variável de ambiente:"
    echo "export NEON_DATABASE_URL='postgresql://...'"
    echo ""
    exit 1
fi

NEON_URL="$1"
echo "🔗 URL do Neon (segura):"
echo "$NEON_URL" | sed 's/\/\/.*@/\/\/***:***@/'
echo ""

# Criar arquivo .env temporário
echo "📝 Criando configuração temporária..."
cat > .env.neon << EOF
DATABASE_URL="$NEON_URL"
NEXTAUTH_SECRET="marketx-lite-secret-key-32-characters-long"
NEXTAUTH_URL="http://localhost:3000"
EOF

echo "✅ Arquivo .env.neon criado!"

# Executar diagnóstico com a URL do Neon
echo "📊 Executando diagnóstico com o Neon..."
DATABASE_URL="$NEON_URL" npm run neon:diagnose

echo ""
echo "🎉 DIAGNÓSTICO CONCLUÍDO!"
echo ""
echo "📋 PRÓXIMOS PASSOS:"
echo "1. Se as tabelas existem: ✅ Sistema pronto!"
echo "2. Se as tabelas não existem: Execute os comandos abaixo"
echo ""
echo "💡 COMANDOS PARA CRIAR TABELAS:"
echo "DATABASE_URL=\"$NEON_URL\" npx prisma db push"
echo "DATABASE_URL=\"$NEON_URL\" npm run db:seed"
echo ""
echo "🚀 CONFIGURAÇÃO DA VERCEL:"
echo "1. Vá para o painel da Vercel"
echo "2. Settings → Environment Variables"
echo "3. Adicione:"
echo "   DATABASE_URL=$NEON_URL"
echo "   NEXTAUTH_SECRET=seu-segredo-unico-32-caracteres"
echo "   NEXTAUTH_URL=https://kalshi10.vercel.app"
echo ""
echo "🔐 CREDENCIAIS PADRÃO:"
echo "   Admin: admin@marketx.com / admin123"
echo "   User: user@test.com / user123"