import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { sendMentionNotification, sendCommentNotification } from '@/lib/email'

const createCommentSchema = z.object({
  content: z.string().min(1),
})

// @username mention'ları bul
function extractMentions(content: string): string[] {
  const mentionRegex = /@(\w+)/g
  const mentions: string[] = []
  let match

  while ((match = mentionRegex.exec(content)) !== null) {
    mentions.push(match[1])
  }

  return [...new Set(mentions)] // Duplikasyonları kaldır
}

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Yetkilendirme gerekli' }, { status: 401 })
    }

    const body = await req.json()
    const { content } = createCommentSchema.parse(body)

    // Görev bilgisini al (sahibi ve atanan kişi ile)
    const task = await prisma.task.findUnique({
      where: { id: params.id },
      include: {
        createdBy: {
          select: { id: true, email: true, name: true }
        },
        assignedTo: {
          select: { id: true, email: true, name: true }
        }
      }
    })

    if (!task) {
      return NextResponse.json({ error: 'Görev bulunamadı' }, { status: 404 })
    }

    const comment = await prisma.comment.create({
      data: {
        content,
        taskId: params.id,
        userId: session.user.id,
      },
      include: {
        user: {
          select: { id: true, name: true, username: true }
        }
      }
    })

    const taskUrl = `${process.env.NEXTAUTH_URL}/dashboard/tasks/${params.id}`
    const notifiedUserIds = new Set<string>() // Tekrar bildirim göndermemek için
    notifiedUserIds.add(session.user.id) // Kendisine bildirim gönderme

    // 1. Mention'ları bul ve bildirim gönder
    const mentionedUsernames = extractMentions(content)
    
    if (mentionedUsernames.length > 0) {
      const mentionedUsers = await prisma.user.findMany({
        where: {
          username: { in: mentionedUsernames }
        },
        select: { id: true, username: true, email: true }
      })

      for (const mentionedUser of mentionedUsers) {
        if (!notifiedUserIds.has(mentionedUser.id)) {
          // Mention kaydı oluştur
          await prisma.taskMention.create({
            data: {
              taskId: params.id,
              userId: mentionedUser.id,
              mentionedBy: session.user.name,
              notified: true,
            }
          })

          // Email bildirimi gönder
          await sendMentionNotification({
            to: mentionedUser.email,
            mentionedBy: session.user.name,
            taskTitle: task.title,
            taskUrl,
            commentText: content,
          })

          notifiedUserIds.add(mentionedUser.id)
        }
      }
    }

    // 2. Görev sahibine bildirim gönder (yorum yapan kişi değilse)
    if (task.createdBy && !notifiedUserIds.has(task.createdBy.id)) {
      await sendCommentNotification({
        to: task.createdBy.email,
        commenterName: session.user.name,
        taskTitle: task.title,
        taskUrl,
        commentText: content,
        notificationType: 'task_owner',
      })
      notifiedUserIds.add(task.createdBy.id)
    }

    // 3. Atanan kişiye bildirim gönder (yorum yapan kişi değilse ve zaten bildirilmediyse)
    if (task.assignedTo && !notifiedUserIds.has(task.assignedTo.id)) {
      await sendCommentNotification({
        to: task.assignedTo.email,
        commenterName: session.user.name,
        taskTitle: task.title,
        taskUrl,
        commentText: content,
        notificationType: 'assignee',
      })
      notifiedUserIds.add(task.assignedTo.id)
    }

    // 4. Bu göreve daha önce yorum yapan kişilere bildirim gönder
    const previousCommenters = await prisma.comment.findMany({
      where: {
        taskId: params.id,
        userId: { not: session.user.id } // Yorum yapan kişi hariç
      },
      select: {
        user: {
          select: { id: true, email: true, name: true }
        }
      },
      distinct: ['userId']
    })

    for (const commenter of previousCommenters) {
      if (!notifiedUserIds.has(commenter.user.id)) {
        await sendCommentNotification({
          to: commenter.user.email,
          commenterName: session.user.name,
          taskTitle: task.title,
          taskUrl,
          commentText: content,
          notificationType: 'commenter',
        })
        notifiedUserIds.add(commenter.user.id)
      }
    }

    // 5. Admin'e bildirim gönder (admin yorum yapan değilse ve zaten bildirilmediyse)
    const adminUser = await prisma.user.findFirst({
      where: { 
        role: 'admin',
        id: { not: session.user.id }
      },
      select: { id: true, email: true }
    })

    if (adminUser && !notifiedUserIds.has(adminUser.id)) {
      await sendCommentNotification({
        to: adminUser.email,
        commenterName: session.user.name,
        taskTitle: task.title,
        taskUrl,
        commentText: content,
        notificationType: 'admin',
      })
    }

    return NextResponse.json(comment, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Geçersiz veri formatı' }, { status: 400 })
    }

    console.error('Yorum ekleme hatası:', error)
    return NextResponse.json({ error: 'Yorum eklenemedi' }, { status: 500 })
  }
}
