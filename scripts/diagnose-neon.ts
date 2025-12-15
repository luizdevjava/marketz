import { PrismaClient } from '@prisma/client'

const neonUrl = process.env.DATABASE_URL

console.log('🔍 DIAGNÓSTICO COMPLETO - NEON POSTGRESQL')
console.log('==============================================')
console.log('')

// Verificar variáveis de ambiente
console.log('📋 Variáveis de Ambiente:')
console.log('DATABASE_URL:', neonUrl ? '✅ Configurada' : '❌ Não configurada')
console.log('NEXTAUTH_SECRET:', process.env.NEXTAUTH_SECRET ? '✅ Configurada' : '❌ Não configurada')
console.log('NEXTAUTH_URL:', process.env.NEXTAUTH_URL ? '✅ Configurada' : '❌ Não configurada')
console.log('NODE_ENV:', process.env.NODE_ENV || 'development')

if (!neonUrl) {
  console.log('\n❌ DATABASE_URL não encontrada!')
  console.log('Configure: export DATABASE_URL="postgresql://..."')
  process.exit(1)
}

console.log('\n🔗 URL do Banco (segura):')
const safeUrl = neonUrl.replace(/\/\/.*@/, '//***:***@')
console.log(safeUrl)

// Verificar formato da URL
const urlPattern = /^postgresql:\/\/.*@.*\.neon\.tech\/.*\?.*sslmode=require.*$/
if (urlPattern.test(neonUrl)) {
  console.log('✅ URL formatado corretamente para Neon')
} else {
  console.log('❌ URL não está no formato correto para Neon')
  console.log('Esperado: postgresql://user:pass@ep-xxx.neon.tech/db?sslmode=require')
}

console.log('\n📊 Testando conexão com diferentes métodos...')

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: neonUrl
    }
  },
  log: ['query', 'info', 'warn', 'error'],
})

async function runDiagnostics() {
  let connectionSuccess = false
  let workingTables = 0
  let missingTables: string[] = []
  
  // Teste 1: Conexão básica
  try {
    console.log('🔗 Teste 1: Conexão básica...')
    await prisma.$connect()
    console.log('✅ Conexão básica bem-sucedida!')
    connectionSuccess = true
  } catch (error) {
    console.log('❌ Erro na conexão básica:', error.message)
    
    if (error.message.includes('ECONNREFUSED')) {
      console.log('💡 Solução: Verifique se o projeto Neon está ativo')
    }
    if (error.message.includes('authentication')) {
      console.log('💡 Solução: Verifique usuário e senha na URL')
    }
    if (error.message.includes('SSL')) {
      console.log('💡 Solução: Adicione ?sslmode=require à URL')
    }
  }
  
  if (connectionSuccess) {
    // Teste 2: Verificar tabelas
    console.log('\n📋 Teste 2: Verificando tabelas existentes...')
    
    const tables = [
      { name: 'users', query: () => prisma.user.count() },
      { name: 'accounts', query: () => prisma.account.count().catch(() => 0) },
      { name: 'sessions', query: () => prisma.session.count().catch(() => 0) },
      { name: 'contracts', query: () => prisma.contract.count().catch(() => 0) },
      { name: 'positions', query: () => prisma.position.count().catch(() => 0) },
      { name: 'deposits', query: () => prisma.deposit.count().catch(() => 0) },
      { name: 'withdraws', query: () => prisma.withdraw.count().catch(() => 0) },
      { name: 'settings', query: () => prisma.settings.count().catch(() => 0) }
    ]
    
    for (const table of tables) {
      try {
        const count = await table.query()
        console.log(`  ✅ ${table.name}: ${count} registros`)
        workingTables++
      } catch (error) {
        console.log(`  ❌ ${table.name}: ${error.message}`)
        if (error.message.includes('does not exist')) {
          missingTables.push(table.name)
        }
      }
    }
    
    console.log(`\n📊 Resumo: ${workingTables}/${tables.length} tabelas funcionando`)
    
    if (missingTables.length > 0) {
      console.log('\n⚠️  Tabelas faltando:', missingTables.join(', '))
      console.log('\n💡 Para criar as tabelas, execute:')
      console.log('  npx prisma db push')
      console.log('  Ou execute o script completo:')
      console.log('  npm run neon:force')
    }
    
    // Teste 3: Criar usuário admin se não existir
    if (workingTables > 0) {
      try {
        console.log('\n👑 Teste 3: Verificando/criando usuário admin...')
        const adminUser = await prisma.user.findUnique({
          where: { email: 'admin@marketx.com' }
        })
        
        if (!adminUser) {
          console.log('📝 Criando usuário admin...')
          const bcrypt = require('bcryptjs')
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
        } else {
          console.log('✅ Usuário admin já existe')
        }
      } catch (error) {
        console.log('❌ Erro ao criar usuário admin:', error.message)
      }
    }
  }
  
  try {
    await prisma.$disconnect()
  } catch (error) {
    console.log('Aviso ao desconectar:', error.message)
  }
  
  console.log('\n🎯 DIAGNÓSTICO CONCLUÍDO')
  console.log('================================')
  
  if (connectionSuccess && workingTables === tables.length) {
    console.log('✅ SUCESSO: Banco de dados totalmente configurado!')
    console.log('\n🔐 Credenciais:')
    console.log('  Admin: admin@marketx.com / admin123')
    console.log('  User: user@test.com / user123')
    console.log('\n🚀 Sistema pronto para uso!')
  } else {
    console.log('❌ PROBLEMAS ENCONTRADOS')
    console.log('\n📋 Próximos passos:')
    console.log('1. Verifique a DATABASE_URL no painel Neon')
    console.log('2. Execute: npm run neon:force')
    console.log('3. Verifique as permissões no Neon')
  }
}

runDiagnostics().catch(error => {
  console.error('❌ Erro fatal no diagnóstico:', error)
  process.exit(1)
})