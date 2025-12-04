import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Tüm kullanıcıları listele
  const users = await prisma.user.findMany({
    select: {
      id: true,
      username: true,
      email: true,
      name: true,
      role: true,
      emailVerified: true,
    }
  })
  
  console.log('📋 Sistemdeki Kullanıcılar:')
  console.log('='.repeat(80))
  users.forEach(user => {
    console.log(`
👤 Kullanıcı: ${user.name}
   Username: ${user.username}
   Email: ${user.email}
   Role: ${user.role}
   Email Doğrulandı: ${user.emailVerified ? '✅ Evet' : '❌ Hayır'}
   ID: ${user.id}
    `)
  })
  console.log('='.repeat(80))
  console.log(`Toplam ${users.length} kullanıcı bulundu.`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
