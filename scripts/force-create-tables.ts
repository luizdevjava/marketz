import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const neonUrl = process.env.DATABASE_URL

if (!neonUrl) {
  console.error('❌ DATABASE_URL não encontrada!')
  console.error('Configure: export DATABASE_URL="postgresql://..."')
  process.exit(1)
}

console.log('🚀 Forçando criação das tabelas no Neon...')
console.log('🔗 URL:', neonUrl.replace(/\/\/.*@/, '//***:***@'))

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: neonUrl
    }
  }
})

async function forceCreateTables() {
  try {
    console.log('📊 Conectando ao banco de dados...')
    await prisma.$connect()
    console.log('✅ Conexão estabelecida!')
    
    // Tentar criar cada tabela individualmente para identificar problemas
    console.log('📋 Verificando estrutura de tabelas...')
    
    // Verificar usuário admin
    try {
      const adminUser = await prisma.user.findUnique({
        where: { email: 'admin@marketx.com' }
      })
      
      if (!adminUser) {
        console.log('👑 Criando usuário admin...')
        const hashedPassword = await bcrypt.hash('admin123', 12)
        
        await prisma.user.create({
          data: {
            email: 'admin@marketx.com',
            password: hashedPassword,
            name: 'Admin MarketX',
            role: 'ADMIN',
            balance: 1000.00
          }
        })
        console.log('✅ Usuário admin criado com sucesso!')
      } else {
        console.log('✅ Usuário admin já existe')
      }
    } catch (error) {
      console.error('❌ Erro ao criar usuário admin:', error.message)
      
      if (error.message.includes('relation "users" does not exist')) {
        console.log('🔧 Tabela "users" não existe. Execute: npx prisma db push')
      }
    }
    
    // Verificar configurações
    try {
      const settings = await prisma.settings.findFirst()
      if (!settings) {
        console.log('⚙️ Criando configurações...')
        await prisma.settings.create({
          data: {
            siteName: 'MarketX Lite',
            pixKey: 'admin@marketx.com',
            feeAmount: 0.01
          }
        })
        console.log('✅ Configurações criadas!')
      } else {
        console.log('✅ Configurações já existem')
      }
    } catch (error) {
      console.error('❌ Erro ao criar configurações:', error.message)
      
      if (error.message.includes('relation "settings" does not exist')) {
        console.log('🔧 Tabela "settings" não existe. Execute: npx prisma db push')
      }
    }
    
    // Verificar contratos
    try {
      const contractCount = await prisma.contract.count()
      console.log(`📝 Contratos existentes: ${contractCount}`)
      
      if (contractCount === 0) {
        console.log('📝 Criando contrato exemplo...')
        await prisma.contract.create({
          data: {
            title: 'O dólar vai fechar acima de R$5,50?',
            description: 'Contrato binário sobre o fechamento do dólar comercial.',
            price: 10.00,
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
            status: 'ACTIVE'
          }
        })
        console.log('✅ Contrato exemplo criado!')
      }
    } catch (error) {
      console.error('❌ Erro ao verificar contratos:', error.message)
      
      if (error.message.includes('relation "contracts" does not exist')) {
        console.log('🔧 Tabela "contracts" não existe. Execute: npx prisma db push')
      }
    }
    
    // Contar todas as tabelas
    console.log('\n📊 Status Final:')
    
    const tableChecks = [
      { name: 'users', query: () => prisma.user.count() },
      { name: 'accounts', query: () => prisma.account.count().catch(() => 0) },
      { name: 'sessions', query: () => prisma.session.count().catch(() => 0) },
      { name: 'contracts', query: () => prisma.contract.count() },
      { name: 'positions', query: () => prisma.position.count().catch(() => 0) },
      { name: 'deposits', query: () => prisma.deposit.count().catch(() => 0) },
      { name: 'withdraws', query: () => prisma.withdraw.count().catch(() => 0) },
      { name: 'settings', query: () => prisma.settings.count().catch(() => 0) }
    ]
    
    let successCount = 0
    for (const table of tableChecks) {
      try {
        const count = await table.query()
        console.log(`  ✅ ${table.name}: ${count} registros`)
        successCount++
      } catch (error) {
        console.log(`  ❌ ${table.name}: ERRO - ${error.message}`)
      }
    }
    
    console.log(`\n📈 Resumo: ${successCount}/${tableChecks.length} tabelas funcionando`)
    
    if (successCount === tableChecks.length) {
      console.log('\n🎉 SUCESSO! Banco de dados está totalmente configurado!')
      console.log('\n🔐 Credenciais de Acesso:')
      console.log('  🏢 Admin: admin@marketx.com / admin123')
      console.log('  👤 User:  user@test.com / user123')
      console.log('\n🚀 Sistema pronto para uso!')
    } else {
      console.log('\n⚠️  ATENÇÃO: Algumas tabelas não estão funcionando.')
      console.log('\n💡 Soluções possíveis:')
      console.log('  1. Execute: npx prisma db push')
      console.log('  2. Verifique a DATABASE_URL')
      console.log('  3. Verifique as permissões no Neon')
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error)
    
    if (error.message.includes('ECONNREFUSED')) {
      console.log('\n💡 Erro de conexão:')
      console.log('  1. Verifique se a URL do Neon está correta')
      console.log('  2. Verifique se o projeto Neon está ativo')
      console.log('  3. Verifique se as permissões estão corretas')
    }
    
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

forceCreateTables()