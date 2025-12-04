import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Yetkilendirme gerekli' }, { status: 401 })
    }

    // Toplam görev sayısı
    const totalTasks = await prisma.task.count()

    // Durumlara göre görevler
    const tasksByStatus = await prisma.task.groupBy({
      by: ['status'],
      _count: true,
    })

    // Önceliklere göre görevler
    const tasksByPriority = await prisma.task.groupBy({
      by: ['priority'],
      _count: true,
    })

    // Tüm kullanıcıları al
    const allUsers = await prisma.user.findMany({
      select: { 
        id: true, 
        name: true, 
        username: true,
        email: true
      }
    })

    // Her kullanıcı için görev istatistikleri
    const userStats = await Promise.all(
      allUsers.map(async (user) => {
        const assignedTasks = await prisma.task.findMany({
          where: { assignedToId: user.id },
          select: { status: true, priority: true }
        })

        const total = assignedTasks.length
        const completed = assignedTasks.filter(t => t.status === 'COMPLETED').length
        const inProgress = assignedTasks.filter(t => t.status === 'IN_PROGRESS').length
        const pending = assignedTasks.filter(t => t.status === 'PENDING').length
        const onHold = assignedTasks.filter(t => t.status === 'ON_HOLD').length
        const cancelled = assignedTasks.filter(t => t.status === 'CANCELLED').length
        
        const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0

        return {
          userId: user.id,
          userName: user.name,
          username: user.username,
          email: user.email,
          totalTasks: total,
          completed,
          inProgress,
          pending,
          onHold,
          cancelled,
          completionRate
        }
      })
    )

    // Son 30 gün için tamamlanan görevler (günlük bazda)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const completedTasks = await prisma.task.findMany({
      where: {
        status: 'COMPLETED',
        updatedAt: { gte: thirtyDaysAgo }
      },
      select: { updatedAt: true }
    })

    const tasksByDay: { [key: string]: number } = {}
    completedTasks.forEach(task => {
      const date = task.updatedAt.toISOString().split('T')[0]
      tasksByDay[date] = (tasksByDay[date] || 0) + 1
    })

    const completionTrend = Object.entries(tasksByDay)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, count]) => ({
        date: new Date(date).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short' }),
        completed: count,
      }))

    // Geç kalan görevler (deadline geçmiş)
    const now = new Date()
    const overdueTasks = await prisma.task.count({
      where: {
        dueDate: { lt: now },
        status: { notIn: ['COMPLETED', 'CANCELLED'] }
      }
    })

    // Bu hafta oluşturulan görevler
    const startOfWeek = new Date()
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay())
    startOfWeek.setHours(0, 0, 0, 0)

    const tasksThisWeek = await prisma.task.count({
      where: {
        createdAt: { gte: startOfWeek }
      }
    })

    // Bu hafta tamamlanan görevler
    const completedThisWeek = await prisma.task.count({
      where: {
        status: 'COMPLETED',
        updatedAt: { gte: startOfWeek }
      }
    })

    // Ortalama tamamlanma süresi (gün cinsinden)
    const completedTasksWithDates = await prisma.task.findMany({
      where: { status: 'COMPLETED' },
      select: { 
        createdAt: true, 
        updatedAt: true 
      },
      take: 100 // Son 100 tamamlanan görev
    })

    let avgCompletionDays = 0
    if (completedTasksWithDates.length > 0) {
      const totalDays = completedTasksWithDates.reduce((sum, task) => {
        const days = Math.floor((task.updatedAt.getTime() - task.createdAt.getTime()) / (1000 * 60 * 60 * 24))
        return sum + days
      }, 0)
      avgCompletionDays = Math.round(totalDays / completedTasksWithDates.length)
    }

    return NextResponse.json({
      summary: {
        totalTasks,
        overdueTasks,
        tasksThisWeek,
        completedThisWeek,
        avgCompletionDays
      },
      tasksByStatus: tasksByStatus.map(t => ({
        status: t.status,
        count: t._count,
      })),
      tasksByPriority: tasksByPriority.map(t => ({
        priority: t.priority,
        count: t._count,
      })),
      userStats: userStats.sort((a, b) => b.totalTasks - a.totalTasks),
      completionTrend,
    })
  } catch (error) {
    console.error('Analytics error:', error)
    return NextResponse.json({ error: 'İstatistikler alınamadı' }, { status: 500 })
  }
}
