import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Yetkilendirme gerekli' }, { status: 401 })
    }

    // Sadece admin silebilir
    if (session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Yetkiniz yok' }, { status: 403 })
    }

    const userId = params.id

    // Kendi hesabını silmeye çalışıyor mu?
    if (session.user.id === userId) {
      return NextResponse.json(
        { error: 'Kendi hesabınızı silemezsiniz' },
        { status: 400 }
      )
    }

    // Kullanıcı var mı kontrol et
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 404 })
    }

    // Başka bir admin'i silmeye çalışıyor mu?
    if (user.role === 'admin') {
      return NextResponse.json(
        { error: 'Admin kullanıcıları silemezsiniz' },
        { status: 403 }
      )
    }

    // Kullanıcıyı ve ilişkili verileri sil
    await prisma.$transaction([
      // Kullanıcının yorumlarını sil
      prisma.comment.deleteMany({
        where: { userId },
      }),
      // Kullanıcının mention'larını sil
      prisma.taskMention.deleteMany({
        where: { userId },
      }),
      // Kullanıcının attachment'larını sil
      prisma.attachment.deleteMany({
        where: { userId },
      }),
      // Kullanıcının oluşturduğu görevleri sil
      prisma.task.deleteMany({
        where: { createdById: userId },
      }),
      // Kullanıcıya atanmış görevlerdeki assignment'ı kaldır
      prisma.task.updateMany({
        where: { assignedToId: userId },
        data: { assignedToId: null },
      }),
      // Kullanıcıyı sil
      prisma.user.delete({
        where: { id: userId },
      }),
    ])

    return NextResponse.json({
      message: `${user.name} başarıyla silindi`,
      deletedUser: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    })
  } catch (error) {
    console.error('Kullanıcı silme hatası:', error)
    return NextResponse.json(
      { error: 'Kullanıcı silinemedi' },
      { status: 500 }
    )
  }
}
