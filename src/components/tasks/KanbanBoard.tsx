'use client'

import { useState } from 'react'
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { TaskColumn } from './TaskColumn'
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

interface KanbanBoardProps {
  tasks: Task[]
  onTaskUpdate: (taskId: string, updates: any) => void
}

export function KanbanBoard({ tasks, onTaskUpdate }: KanbanBoardProps) {
  const [activeTask, setActiveTask] = useState<Task | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  const columns = [
    { id: 'PENDING', title: '⏳ Bekliyor', color: 'bg-yellow-100', icon: '⏳' },
    { id: 'IN_PROGRESS', title: '🔄 Devam Ediyor', color: 'bg-blue-100', icon: '🔄' },
    { id: 'ON_HOLD', title: '⏸️ Beklemede', color: 'bg-gray-100', icon: '⏸️' },
    { id: 'COMPLETED', title: '✅ Tamamlandı', color: 'bg-green-100', icon: '✅' },
    { id: 'CANCELLED', title: '❌ İptal Edildi', color: 'bg-red-100', icon: '❌' },
  ]

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find((t) => t.id === event.active.id)
    setActiveTask(task || null)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (!over) {
      setActiveTask(null)
      return
    }

    const taskId = active.id as string
    const newStatus = over.id as string

    const task = tasks.find((t) => t.id === taskId)
    if (task && task.status !== newStatus) {
      onTaskUpdate(taskId, { status: newStatus })
    }

    setActiveTask(null)
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {columns.map((column) => (
          <TaskColumn
            key={column.id}
            id={column.id}
            title={column.title}
            color={column.color}
            tasks={tasks.filter((task) => task.status === column.id)}
          />
        ))}
      </div>

      <DragOverlay>
        {activeTask ? <TaskCard task={activeTask} isDragging /> : null}
      </DragOverlay>
    </DndContext>
  )
}
