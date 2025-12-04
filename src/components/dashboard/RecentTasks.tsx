import Link from 'next/link'
import { formatDateTime } from '@/lib/utils'
import { TaskStatusBadge } from '@/components/tasks/TaskStatusBadge'

interface Task {
  id: string
  title: string
  status: string
  createdAt: Date
  createdBy: { name: string }
  assignedTo: { name: string } | null
}

interface RecentTasksProps {
  tasks: Task[]
}

export function RecentTasks({ tasks }: RecentTasksProps) {
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Son Görevler</h2>
        <Link href="/dashboard/tasks" className="text-blue-600 hover:underline text-sm">
          Tümünü Gör
        </Link>
      </div>

      {tasks.length === 0 ? (
        <p className="text-gray-800 font-bold text-center py-8">Henüz görev bulunmuyor</p>
      ) : (
        <div className="space-y-4">
          {tasks.map((task) => (
            <Link
              key={task.id}
              href={`/dashboard/tasks/${task.id}`}
              className="block border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:bg-blue-50 transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-800 mb-1">{task.title}</h3>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>Oluşturan: {task.createdBy.name}</span>
                    {task.assignedTo && <span>Atanan: {task.assignedTo.name}</span>}
                    <span>{formatDateTime(task.createdAt)}</span>
                  </div>
                </div>
                <TaskStatusBadge status={task.status} />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
