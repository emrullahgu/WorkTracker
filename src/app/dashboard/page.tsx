import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import { TaskStats } from '@/components/dashboard/TaskStats'
import { RecentTasks } from '@/components/dashboard/RecentTasks'
import Link from 'next/link'
import { AlertCircle, Lock, Mail } from 'lucide-react'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  const userId = session?.user?.id

  const [totalTasks, pendingTasks, inProgressTasks, completedTasks, recentTasks, user] = await Promise.all([
    prisma.task.count(),
    prisma.task.count({ where: { status: 'PENDING' } }),
    prisma.task.count({ where: { status: 'IN_PROGRESS' } }),
    prisma.task.count({ where: { status: 'COMPLETED' } }),
    prisma.task.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        createdBy: { select: { name: true } },
        assignedTo: { select: { name: true } },
      },
    }),
    userId ? prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, updatedAt: true, createdAt: true }
    }) : null
  ])

  // Kullanıcı bilgilerini hiç güncellememiş mi kontrol et
  const hasNeverUpdated = user && user.createdAt.getTime() === user.updatedAt.getTime()
  const isDefaultEmail = user?.email?.includes('@kobinerji.com') || user?.email?.includes('info@')

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Hoş Geldiniz, {session?.user?.name}</h1>
        <p className="text-gray-800 font-bold mt-2">Görev takip sisteminize genel bakış</p>
      </div>

      {hasNeverUpdated && session?.user?.role !== 'ADMIN' && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-amber-500 p-6 rounded-lg shadow-sm">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <AlertCircle className="w-6 h-6 text-amber-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-amber-900 mb-2">
                🔐 Hesap Güvenliği Önemli!
              </h3>
              <p className="text-amber-800 mb-4">
                Hesabınız varsayılan bilgilerle oluşturulmuş. Güvenliğiniz için lütfen aşağıdaki işlemleri yapın:
              </p>
              <div className="space-y-2 mb-4">
                <div className="flex items-center space-x-2 text-amber-900">
                  <Lock className="w-4 h-4" />
                  <span className="font-medium">Varsayılan şifrenizi (1111) değiştirin</span>
                </div>
                {isDefaultEmail && (
                  <div className="flex items-center space-x-2 text-amber-900">
                    <Mail className="w-4 h-4" />
                    <span className="font-medium">Kişisel email adresinizi ekleyin</span>
                  </div>
                )}
              </div>
              <Link 
                href="/dashboard/profile" 
                className="inline-flex items-center px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-lg transition-colors"
              >
                Profil Ayarlarına Git →
              </Link>
            </div>
          </div>
        </div>
      )}

      <TaskStats
        total={totalTasks}
        pending={pendingTasks}
        inProgress={inProgressTasks}
        completed={completedTasks}
      />

      <RecentTasks tasks={recentTasks} />
    </div>
  )
}
