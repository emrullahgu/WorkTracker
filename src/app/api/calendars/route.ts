import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createCalendarSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  type: z.enum(['PRIVATE', 'PUBLIC']).default('PRIVATE'),
  color: z.string().default('#3B82F6'),
})

// Takvimleri listele
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Yetkilendirme gerekli' }, { status: 401 })
    }

    // Kullanıcının kendi takvimleri + genel takvimler
    const calendars = await prisma.calendar.findMany({
      where: {
        OR: [
          { createdById: session.user.id },
          { type: 'PUBLIC' },
        ],
      },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true },
        },
        _count: {
          select: { events: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(calendars)
  } catch (error) {
    console.error('Takvim listesi hatası:', error)
    return NextResponse.json({ error: 'Takvimler alınamadı' }, { status: 500 })
  }
}

// Yeni takvim oluştur
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Yetkilendirme gerekli' }, { status: 401 })
    }

    const body = await req.json()
    const { title, description, type, color } = createCalendarSchema.parse(body)

    const calendar = await prisma.calendar.create({
      data: {
        title,
        description,
        type,
        color,
        createdById: session.user.id,
      },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true },
        },
      },
    })

    return NextResponse.json(calendar, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }

    console.error('Takvim oluşturma hatası:', error)
    return NextResponse.json({ error: 'Takvim oluşturulamadı' }, { status: 500 })
  }
}
