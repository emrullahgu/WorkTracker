'use client'

import { useState, useEffect } from 'react'
import { Plus } from 'lucide-react'
import { KanbanBoard } from '@/components/tasks/KanbanBoard'
import { CreateTaskModal } from '@/components/tasks/CreateTaskModal'

export default function TasksPage() {
  const [tasks, setTasks] = useState([])
  const [users, setUsers] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [tasksRes, usersRes] = await Promise.all([
        fetch('/api/tasks'),
        fetch('/api/users'),
      ])
      
      const [tasksData, usersData] = await Promise.all([
        tasksRes.json(),
        usersRes.json(),
      ])

      setTasks(tasksData)
      setUsers(usersData)
    } catch (error) {
      console.error('Veri yüklenirken hata:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleTaskCreated = () => {
    loadData()
    setIsModalOpen(false)
  }

  const handleTaskUpdate = async (taskId: string, updates: any) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })

      if (res.ok) {
        loadData()
      }
    } catch (error) {
      console.error('Görev güncellenirken hata:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Yükleniyor...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Görevler</h1>
          <p className="text-gray-800 font-bold mt-2">Görevleri sürükle-bırak ile yönetin</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="btn btn-primary flex items-center space-x-2"
        >
          <Plus size={20} />
          <span>Yeni Görev</span>
        </button>
      </div>

      <KanbanBoard tasks={tasks} onTaskUpdate={handleTaskUpdate} />

      {isModalOpen && (
        <CreateTaskModal
          users={users}
          onClose={() => setIsModalOpen(false)}
          onTaskCreated={handleTaskCreated}
        />
      )}
    </div>
  )
}
