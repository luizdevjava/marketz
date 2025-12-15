import { PrismaClient } from '@prisma/client'

const neonUrl = process.env.DATABASE_URL

console.log('🔍 DIAGNÓSTICO NEON - MARKETX LITE')
console.log('==================================')
console.log('')

if (!neonUrl) {
  console.log('❌ DATABASE_URL não encontrada!')
  console.log('Configure: export DATABASE_URL="postgresql://..."')
  process.exit(1)
}

console.log('🔗 URL:', neonUrl.replace(/\/\/.*@/, '//***:***@'))

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: neonUrl
    }
  }
})

async function testConnection() {
  try {
    console.log('📊 Testando conexão...')
    await prisma.$connect()
    console.log('✅ Conexão bem-sucedida!')
    
    // Testar tabela users
    try {
      const userCount = await prisma.user.count()
      console.log(`✅ Tabela users: ${userCount} registros`)
    } catch (error) {
      console.log(`❌ Tabela users: ${error.message}`)
      if (error.message.includes('does not exist')) {
        console.log('💡 Execute: npx prisma db push')
      }
    }
    
    // Testar tabela contracts
    try {
      const contractCount = await prisma.contract.count()
      console.log(`✅ Tabela contracts: ${contractCount} registros`)
    } catch (error) {
      console.log(`❌ Tabela contracts: ${error.message}`)
      if (error.message.includes('does not exist')) {
        console.log('💡 Execute: npx prisma db push')
      }
    }
    
    // Testar tabela settings
    try {
      const settingsCount = await prisma.settings.count()
      console.log(`✅ Tabela settings: ${settingsCount} registros`)
    } catch (error) {
      console.log(`❌ Tabela settings: ${error.message}`)
      if (error.message.includes('does not exist')) {
        console.log('💡 Execute: npx prisma db push')
      }
    }
    
    console.log('\n🎉 Conexão e tabelas testadas com sucesso!')
    
  } catch (error) {
    console.log('❌ Erro na conexão:', error.message)
    
    if (error.message.includes('ECONNREFUSED')) {
      console.log('\n💡 SOLUÇÃO:')
      console.log('1. Verifique se o projeto Neon está ativo')
      console.log('2. Verifique a URL de conexão')
      console.log('3. Verifique as permissões no Neon')
    }
    
    if (error.message.includes('authentication')) {
      console.log('\n💡 SOLUÇÃO:')
      console.log('1. Verifique usuário e senha na URL')
      console.log('2. Verifique se o banco existe no Neon')
    }
    
    if (error.message.includes('SSL')) {
      console.log('\n💡 SOLUÇÃO:')
      console.log('1. Adicione ?sslmode=require no final da URL')
      console.log('2. Exemplo: postgresql://user:pass@host/db?sslmode=require')
    }
    
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

testConnection()