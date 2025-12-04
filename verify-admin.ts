import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Admin kullanıcısının email'ini doğrula
  const admin = await prisma.user.update({
    where: { username: 'emrullahg' },
    data: { emailVerified: true }
  })
  
  console.log('✅ Admin kullanıcı email doğrulandı:', admin.email)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
