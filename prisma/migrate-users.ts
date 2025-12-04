import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔄 Updating existing users with usernames...')

  // Get all users
  const users = await prisma.$queryRaw<any[]>`SELECT id, email, name FROM users`
  
  console.log(`Found ${users.length} users`)

  for (const user of users) {
    // Generate username from email
    let username = user.email.split('@')[0]
    
    // Special handling for admin
    if (user.email === 'emrullahgunayy@gmail.com') {
      username = 'emrullahg'
      console.log(`✅ Admin username: ${username}`)
    }
    
    // Update user with username
    await prisma.$executeRaw`
      UPDATE users 
      SET username = ${username},
          emailVerified = 1
      WHERE id = ${user.id}
    `
    
    console.log(`✅ Updated: ${user.name} -> @${username}`)
  }

  console.log('✅ All users updated!')
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
