import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🚀 Kobinerji Görev Takip Sistemi - Veritabanı Kurulumu\n')

  // Yönetici: Emrullah Günay
  const adminPassword = await hash('Eg8502Eg.', 12)
  const admin = await prisma.user.upsert({
    where: { email: 'emrullahgunayy@gmail.com' },
    update: {
      username: 'emrullahg',
      password: adminPassword,
      emailVerified: true,
    },
    create: {
      username: 'emrullahg',
      email: 'emrullahgunayy@gmail.com',
      name: 'Emrullah Günay',
      password: adminPassword,
      role: 'ADMIN',
      emailVerified: true,
    },
  })
  console.log('✅ Yönetici oluşturuldu:', admin.name, '(@' + admin.username + ') -', admin.email)

  console.log('\n🎉 KOBİNERJİ Görev Takip Sistemi hazır!\n')
  console.log('📋 Admin Giriş Bilgileri:')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('👑 YÖNETİCİ:')
  console.log('   Kullanıcı Adı: emrullahg')
  console.log('   Email: emrullahgunayy@gmail.com')
  console.log('   Şifre: Eg8502Eg.')
  console.log('')
  console.log('👥 EKİP ÜYELERİ:')
  console.log('   Kayıt sayfasından kayıt olabilirler')
  console.log('   → http://localhost:3000/register')
  console.log('')
  console.log('📧 Kayıt Olacak Ekip Üyeleri:')
  console.log('   • Görkem Tanır    - gorkemtanir1@gmail.com')
  console.log('   • Cem Bülbül      - cemblbl@gmail.com')
  console.log('   • Hüseyin Demir   - info@kobinerji.com')
  console.log('   • İbrahim Çağdaş  - ibrahim.cagdas2002@gmail.com')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
}

main()
  .catch((e) => {
    console.error('❌ Hata:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
