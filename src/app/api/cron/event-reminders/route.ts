import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendEventReminder } from '@/lib/email'

// Yaklaşan etkinlikler için hatırlatma gönder
export async function GET(req: Request) {
  try {
    // API key kontrolü (güvenlik için)
    const authHeader = req.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 })
    }

    const now = new Date()
    
    // Şu andan sonraki 60 dakika içindeki etkinlikleri al
    const upcomingEvents = await prisma.calendarEvent.findMany({
      where: {
        startDate: {
          gte: now,
          lte: new Date(now.getTime() + 60 * 60 * 1000), // 60 dakika sonra
        },
        reminderMinutes: {
          not: null,
        },
      },
      include: {
        calendar: {
          select: { title: true },
        },
        participants: {
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
        },
        reminders: true,
      },
    })

    let sentCount = 0
    let errorCount = 0

    for (const event of upcomingEvents) {
      const reminderTime = new Date(event.startDate.getTime() - (event.reminderMinutes! * 60 * 1000))
      
      // Hatırlatma zamanı geldi mi?
      if (reminderTime <= now) {
        // Tüm katılımcılara hatırlatma gönder
        for (const participant of event.participants) {
          // Bu kullanıcıya daha önce hatırlatma gönderilmiş mi?
          const existingReminder = event.reminders.find(r => r.userId === participant.userId && r.sentAt !== null)
          
          if (!existingReminder) {
            try {
              await sendEventReminder({
                to: participant.user.email,
                eventTitle: event.title,
                eventDescription: event.description,
                eventStartDate: event.startDate.toISOString(),
                eventEndDate: event.endDate.toISOString(),
                eventLocation: event.location,
                calendarTitle: event.calendar.title,
                minutesBefore: event.reminderMinutes!,
              })

              // Hatırlatma kaydı oluştur
              await prisma.eventReminder.upsert({
                where: {
                  eventId_userId: {
                    eventId: event.id,
                    userId: participant.userId,
                  },
                },
                update: {
                  sentAt: now,
                },
                create: {
                  eventId: event.id,
                  userId: participant.userId,
                  sentAt: now,
                },
              })

              sentCount++
            } catch (error) {
              console.error(`Hatırlatma gönderilemedi (Event: ${event.id}, User: ${participant.userId}):`, error)
              errorCount++
            }
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `${sentCount} hatırlatma gönderildi, ${errorCount} hata oluştu`,
      checkedEvents: upcomingEvents.length,
      sentCount,
      errorCount,
    })
  } catch (error) {
    console.error('Reminder cron hatası:', error)
    return NextResponse.json(
      { error: 'Hatırlatmalar kontrol edilemedi' },
      { status: 500 }
    )
  }
}
