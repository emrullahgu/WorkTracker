import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const username = 'emrullahg'
  const password = 'Eg8502Eg.'
  
  console.log('🔍 Giriş Testi Başlatılıyor...')
  console.log('Username:', username)
  console.log('Password:', password)
  console.log('')
  
  // Kullanıcıyı bul
  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { email: username },
        { username: username },
      ]
    }
  })
  
  if (!user) {
    console.log('❌ Kullanıcı bulunamadı!')
    return
  }
  
  console.log('✅ Kullanıcı bulundu:', user.name)
  console.log('   Email:', user.email)
  console.log('   Username:', user.username)
  console.log('   Role:', user.role)
  console.log('   Email Doğrulandı:', user.emailVerified ? 'Evet' : 'Hayır')
  console.log('')
  
  // Email doğrulama kontrolü
  if (!user.emailVerified) {
    console.log('❌ Email doğrulanmamış!')
    return
  }
  
  console.log('✅ Email doğrulanmış')
  console.log('')
  
  // Şifre kontrolü
  const isPasswordValid = await bcrypt.compare(password, user.password)
  
  if (!isPasswordValid) {
    console.log('❌ Şifre geçersiz!')
    console.log('   Hash:', user.password)
    return
  }
  
  console.log('✅ Şifre geçerli')
  console.log('')
  console.log('🎉 GİRİŞ BAŞARILI!')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
