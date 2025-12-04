import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const updateCalendarSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  type: z.enum(['PRIVATE', 'PUBLIC']).optional(),
  color: z.string().optional(),
})

// Takvim detayı
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Yetkilendirme gerekli' }, { status: 401 })
    }

    const calendar = await prisma.calendar.findUnique({
      where: { id: params.id },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true },
        },
        events: {
          include: {
            createdBy: {
              select: { id: true, name: true },
            },
            participants: {
              include: {
                user: {
                  select: { id: true, name: true, email: true },
                },
              },
            },
          },
          orderBy: { startDate: 'asc' },
        },
      },
    })

    if (!calendar) {
      return NextResponse.json({ error: 'Takvim bulunamadı' }, { status: 404 })
    }

    // Yetki kontrolü: Sadece sahibi veya genel takvim
    if (calendar.type !== 'PUBLIC' && calendar.createdById !== session.user.id) {
      return NextResponse.json({ error: 'Bu takvime erişim yetkiniz yok' }, { status: 403 })
    }

    return NextResponse.json(calendar)
  } catch (error) {
    console.error('Takvim detay hatası:', error)
    return NextResponse.json({ error: 'Takvim alınamadı' }, { status: 500 })
  }
}

// Takvim güncelle
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Yetkilendirme gerekli' }, { status: 401 })
    }

    const calendar = await prisma.calendar.findUnique({
      where: { id: params.id },
    })

    if (!calendar) {
      return NextResponse.json({ error: 'Takvim bulunamadı' }, { status: 404 })
    }

    // Sadece sahibi güncelleyebilir
    if (calendar.createdById !== session.user.id) {
      return NextResponse.json({ error: 'Yetkiniz yok' }, { status: 403 })
    }

    const body = await req.json()
    const updates = updateCalendarSchema.parse(body)

    const updatedCalendar = await prisma.calendar.update({
      where: { id: params.id },
      data: updates,
      include: {
        createdBy: {
          select: { id: true, name: true, email: true },
        },
      },
    })

    return NextResponse.json(updatedCalendar)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }

    console.error('Takvim güncelleme hatası:', error)
    return NextResponse.json({ error: 'Takvim güncellenemedi' }, { status: 500 })
  }
}

// Takvim sil
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Yetkilendirme gerekli' }, { status: 401 })
    }

    const calendar = await prisma.calendar.findUnique({
      where: { id: params.id },
    })

    if (!calendar) {
      return NextResponse.json({ error: 'Takvim bulunamadı' }, { status: 404 })
    }

    // Sadece sahibi silebilir
    if (calendar.createdById !== session.user.id) {
      return NextResponse.json({ error: 'Yetkiniz yok' }, { status: 403 })
    }

    await prisma.calendar.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: 'Takvim silindi' })
  } catch (error) {
    console.error('Takvim silme hatası:', error)
    return NextResponse.json({ error: 'Takvim silinemedi' }, { status: 500 })
  }
}
