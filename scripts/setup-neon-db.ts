import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const neonUrl = process.env.DATABASE_URL

if (!neonUrl) {
  console.error('❌ DATABASE_URL não encontrada!')
  process.exit(1)
}

console.log('🔗 Conectando ao Neon PostgreSQL...')
console.log('URL:', neonUrl.replace(/\/\/.*@/, '//***:***@'))

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: neonUrl
    }
  }
})

async function setupDatabase() {
  try {
    console.log('📋 Testando conexão com o banco...')
    
    // Testar conexão
    await prisma.$connect()
    console.log('✅ Conexão bem-sucedida!')
    
    console.log('📊 Verificando/criando tabelas...')
    
    // Verificar se tabelas existem
    const userCount = await prisma.user.count().catch(() => 0)
    console.log(`👥 Usuários existentes: ${userCount}`)
    
    // Criar usuário admin se não existir
    if (userCount === 0) {
      console.log('👑 Criando usuário admin...')
      const hashedPassword = await bcrypt.hash('admin123', 12)
      
      const admin = await prisma.user.create({
        data: {
          email: 'admin@marketx.com',
          password: hashedPassword,
          name: 'Admin MarketX',
          role: 'ADMIN',
          balance: 1000.00
        }
      })
      console.log('✅ Usuário admin criado:', admin.email)
      
      // Criar usuário teste
      console.log('👤 Criando usuário teste...')
      const testHashedPassword = await bcrypt.hash('user123', 12)
      
      const testUser = await prisma.user.create({
        data: {
          email: 'user@test.com',
          password: testHashedPassword,
          name: 'Usuário Teste',
          role: 'USER',
          balance: 100.00
        }
      })
      console.log('✅ Usuário teste criado:', testUser.email)
      
      // Criar configurações
      console.log('⚙️ Criando configurações...')
      const settings = await prisma.settings.upsert({
        where: { id: 'default' },
        update: {},
        create: {
          id: 'default',
          siteName: 'MarketX Lite',
          pixKey: 'admin@marketx.com',
          feeAmount: 0.01
        }
      })
      console.log('✅ Configurações criadas')
      
      // Criar contrato exemplo
      console.log('📝 Criando contrato exemplo...')
      const contract = await prisma.contract.create({
        data: {
          title: 'O dólar vai fechar acima de R$5,50?',
          description: 'Contrato binário sobre o fechamento do dólar comercial no final do dia.',
          price: 10.00,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 horas
          status: 'ACTIVE'
        }
      })
      console.log('✅ Contrato exemplo criado:', contract.title)
    }
    
    // Verificar estrutura das tabelas
    console.log('🔍 Verificando estrutura das tabelas...')
    
    const tables = [
      { name: 'users', count: await prisma.user.count() },
      { name: 'accounts', count: await prisma.account.count().catch(() => 0) },
      { name: 'sessions', count: await prisma.session.count().catch(() => 0) },
      { name: 'contracts', count: await prisma.contract.count() },
      { name: 'positions', count: await prisma.position.count().catch(() => 0) },
      { name: 'deposits', count: await prisma.deposit.count().catch(() => 0) },
      { name: 'withdraws', count: await prisma.withdraw.count().catch(() => 0) },
      { name: 'settings', count: await prisma.settings.count().catch(() => 0) }
    ]
    
    console.log('\n📊 Status das Tabelas:')
    tables.forEach(table => {
      console.log(`  ${table.name}: ${table.count} registros`)
    })
    
    console.log('\n🎉 Banco de dados configurado com sucesso!')
    console.log('\n🔐 Credenciais de Acesso:')
    console.log('  Admin: admin@marketx.com / admin123')
    console.log('  User:  user@test.com / user123')
    
  } catch (error) {
    console.error('❌ Erro ao configurar banco de dados:', error)
    
    if (error.message.includes('relation') || error.message.includes('table')) {
      console.log('\n💡 Dica: As tabelas podem não existir ainda.')
      console.log('   Execute: npx prisma db push --schema prisma/schema.prisma')
    }
    
    if (error.message.includes('SSL') || error.message.includes('connection')) {
      console.log('\n💡 Dica: Problema de conexão SSL.')
      console.log('   Verifique se a URL do Neon inclui ?sslmode=require')
    }
    
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

setupDatabase()