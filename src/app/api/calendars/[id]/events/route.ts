import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

import { sendEventInvitation } from '@/lib/email'

const createEventSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  startDate: z.string(),
  endDate: z.string(),
  location: z.string().optional(),
  isAllDay: z.boolean().default(false),
  reminderMinutes: z.number().optional(),
  calendarId: z.string(),
  participantIds: z.array(z.string()).default([]),
})

// Etkinlik oluştur
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Yetkilendirme gerekli' }, { status: 401 })
    }

    const body = await req.json()
    const { title, description, startDate, endDate, location, isAllDay, reminderMinutes, calendarId, participantIds } = createEventSchema.parse(body)

    // Takvim kontrolü
    const calendar = await prisma.calendar.findUnique({
      where: { id: calendarId },
    })

    if (!calendar) {
      return NextResponse.json({ error: 'Takvim bulunamadı' }, { status: 404 })
    }

    // Yetki kontrolü
    if (calendar.type !== 'PUBLIC' && calendar.createdById !== session.user.id) {
      return NextResponse.json({ error: 'Bu takvime etkinlik ekleme yetkiniz yok' }, { status: 403 })
    }

    const event = await prisma.calendarEvent.create({
      data: {
        title,
        description,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        location,
        isAllDay,
        reminderMinutes,
        calendarId,
        createdById: session.user.id,
        participants: {
          create: participantIds.map((userId) => ({
            userId,
            status: 'PENDING',
          })),
        },
      },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true },
        },
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
      },
    })

    // Katılımcılara davet email'i gönder
    for (const participant of event.participants) {
      await sendEventInvitation({
        to: participant.user.email,
        eventTitle: event.title,
        eventDescription: event.description || undefined,
        eventStartDate: event.startDate.toISOString(),
        eventEndDate: event.endDate.toISOString(),
        eventLocation: event.location || undefined,
        invitedBy: session.user.name!,
        calendarTitle: event.calendar.title,
      })
    }

    return NextResponse.json(event, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }

    console.error('Etkinlik oluşturma hatası:', error)
    return NextResponse.json({ error: 'Etkinlik oluşturulamadı' }, { status: 500 })
  }
}
