import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendDailyTaskReminder } from '@/lib/email'

export async function GET(req: Request) {
  try {
    // Güvenlik için cron secret kontrolü
    const authHeader = req.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 })
    }

    console.log('Günlük görev hatırlatması başlatılıyor...')

    // Tüm kullanıcıları ve açık görevlerini çek
    const users = await prisma.user.findMany({
      where: {
        emailVerified: true, // Sadece email doğrulanmış kullanıcılar
      },
      include: {
        assignedTasks: {
          where: {
            status: {
              in: ['PENDING', 'IN_PROGRESS']
            }
          },
          select: {
            id: true,
            title: true,
            status: true,
            priority: true,
            dueDate: true,
          },
          orderBy: [
            { priority: 'desc' },
            { dueDate: 'asc' }
          ]
        }
      }
    })

    let sentCount = 0
    let errorCount = 0

    for (const user of users) {
      // Sadece açık görevi olan kullanıcılara email gönder
      if (user.assignedTasks.length > 0) {
        try {
          await sendDailyTaskReminder({
            to: user.email,
            userName: user.name,
            tasks: user.assignedTasks
          })
          sentCount++
          console.log(`Hatırlatma gönderildi: ${user.email} (${user.assignedTasks.length} görev)`)
        } catch (error) {
          errorCount++
          console.error(`Hatırlatma gönderilemedi: ${user.email}`, error)
        }
      }
    }

    console.log(`Günlük hatırlatma tamamlandı: ${sentCount} başarılı, ${errorCount} hata`)

    return NextResponse.json({
      success: true,
      message: 'Günlük hatırlatmalar gönderildi',
      stats: {
        totalUsers: users.length,
        usersWithTasks: sentCount,
        emailsSent: sentCount,
        errors: errorCount
      }
    })
  } catch (error) {
    console.error('Günlük hatırlatma hatası:', error)
    return NextResponse.json({ 
      error: 'Günlük hatırlatma gönderilemedi',
      details: error instanceof Error ? error.message : 'Bilinmeyen hata'
    }, { status: 500 })
  }
}
