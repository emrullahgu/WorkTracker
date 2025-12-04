import { useDroppable } from '@dnd-kit/core'
import { TaskCard } from './TaskCard'

interface Task {
  id: string
  title: string
  description?: string
  status: string
  priority: string
  assignedTo?: { name: string }
  createdAt: Date
}

interface TaskColumnProps {
  id: string
  title: string
  color: string
  tasks: Task[]
}

export function TaskColumn({ id, title, color, tasks }: TaskColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id,
  })

  return (
    <div className="flex flex-col h-full">
      <div className={`${color} rounded-t-lg px-4 py-3 border-b-4 border-gray-400 shadow-md`}>
        <h3 className="font-bold text-gray-900 text-lg flex items-center justify-between">
          <span>{title}</span>
          <span className="bg-white px-3 py-1.5 rounded-full text-sm font-bold text-gray-900 shadow-sm border-2 border-gray-300">{tasks.length}</span>
        </h3>
      </div>

      <div
        ref={setNodeRef}
        className={`flex-1 p-4 space-y-3 bg-gray-50 rounded-b-lg min-h-[500px] transition-colors ${
          isOver ? 'bg-blue-50 border-2 border-blue-300 border-dashed' : ''
        }`}
      >
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
        {tasks.length === 0 && (
          <div className="text-center text-gray-800 font-bold py-8">
            📋 Görev yok
          </div>
        )}
      </div>
    </div>
  )
}
