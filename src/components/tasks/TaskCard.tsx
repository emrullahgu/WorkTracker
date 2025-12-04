import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import Link from 'next/link'
import { Calendar, User } from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface Task {
  id: string
  title: string
  description?: string
  priority: string
  assignedTo?: { name: string }
  createdAt: Date
}

interface TaskCardProps {
  task: Task
  isDragging?: boolean
}

export function TaskCard({ task, isDragging = false }: TaskCardProps) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: task.id,
  })

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  }

  const priorityColors = {
    LOW: 'bg-blue-100 text-blue-900 border border-blue-300',
    MEDIUM: 'bg-yellow-100 text-yellow-900 border border-yellow-300',
    HIGH: 'bg-orange-100 text-orange-900 border border-orange-300',
    URGENT: 'bg-red-100 text-red-900 border border-red-400',
  }

  const priorityLabels = {
    LOW: '🔵 Düşük',
    MEDIUM: '🟡 Orta',
    HIGH: '🟠 Yüksek',
    URGENT: '🔴 Acil',
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing"
    >
      <Link href={`/dashboard/tasks/${task.id}`} className="block">
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-2">
            <h4 className="font-medium text-gray-800 line-clamp-2">{task.title}</h4>
            <span
              className={`px-2.5 py-1 rounded-full text-xs font-bold whitespace-nowrap shadow-sm ${
                priorityColors[task.priority as keyof typeof priorityColors]
              }`}
            >
              {priorityLabels[task.priority as keyof typeof priorityLabels]}
            </span>
          </div>

          {task.description && (
            <p className="text-sm text-gray-800 font-semibold line-clamp-2">{task.description}</p>
          )}

          <div className="flex items-center gap-4 text-xs text-gray-800 font-semibold">
            {task.assignedTo && (
              <div className="flex items-center gap-1">
                <User size={14} />
                <span>{task.assignedTo.name}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Calendar size={14} />
              <span>{formatDate(task.createdAt)}</span>
            </div>
          </div>
        </div>
      </Link>
    </div>
  )
}
