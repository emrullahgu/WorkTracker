'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Calendar, User, AlertCircle, MessageSquare, Paperclip, Upload, Download, Trash2 } from 'lucide-react'
import { formatDateTime } from '@/lib/utils'
import { TaskStatusBadge } from '@/components/tasks/TaskStatusBadge'
import { MentionInput } from '@/components/MentionInput'

interface Task {
  id: string
  title: string
  description?: string
  status: string
  priority: string
  dueDate?: string
  createdAt: string
  createdBy: { name: string; email: string }
  assignedTo?: { id: string; name: string; email: string }
  comments: Array<{
    id: string
    content: string
    createdAt: string
    user: { name: string }
  }>
  attachments: Array<{
    id: string
    filename: string
    url: string
    mimeType: string
    size: number
    createdAt: string
  }>
}

export default function TaskDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [task, setTask] = useState<Task | null>(null)
  const [loading, setLoading] = useState(true)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [users, setUsers] = useState<Array<{ id: string; name: string; email: string }>>([])
  const [assigningUser, setAssigningUser] = useState(false)

  const loadTask = async () => {
    try {
      const res = await fetch(`/api/tasks/${params.id}`)
      const data = await res.json()
      setTask(data)
    } catch (error) {
      console.error('Görev yüklenirken hata:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTask()
    loadUsers()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id])

  const loadUsers = async () => {
    try {
      const res = await fetch('/api/users')
      if (res.ok) {
        const data = await res.json()
        setUsers(data)
      }
    } catch (error) {
      console.error('Kullanıcılar yüklenirken hata:', error)
    }
  }

  const handleAssignUser = async (userId: string | null) => {
    setAssigningUser(true)
    try {
      const res = await fetch(`/api/tasks/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignedToId: userId }),
      })

      if (res.ok) {
        loadTask()
      } else {
        alert('Atama yapılırken hata oluştu')
      }
    } catch (error) {
      console.error('Atama hatası:', error)
      alert('Atama yapılırken bir hata oluştu')
    } finally {
      setAssigningUser(false)
    }
  }

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!comment.trim() || submitting) return

    setSubmitting(true)
    try {
      const res = await fetch(`/api/tasks/${params.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: comment }),
      })

      if (res.ok) {
        setComment('')
        loadTask()
      }
    } catch (error) {
      console.error('Yorum eklenirken hata:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || uploading) return

    const formData = new FormData()
    formData.append('file', file)

    setUploading(true)
    try {
      const res = await fetch(`/api/tasks/${params.id}/attachments`, {
        method: 'POST',
        body: formData,
      })

      if (res.ok) {
        loadTask()
        e.target.value = ''
      } else {
        const data = await res.json()
        alert(data.error || 'Dosya yüklenemedi')
      }
    } catch (error) {
      console.error('Dosya yükleme hatası:', error)
      alert('Dosya yüklenirken bir hata oluştu')
    } finally {
      setUploading(false)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const priorityColors = {
    LOW: 'bg-blue-100 text-blue-900 border-2 border-blue-400',
    MEDIUM: 'bg-yellow-100 text-yellow-900 border-2 border-yellow-400',
    HIGH: 'bg-orange-100 text-orange-900 border-2 border-orange-400',
    URGENT: 'bg-red-100 text-red-900 border-2 border-red-500',
  }

  const priorityLabels = {
    LOW: '🔵 Düşük',
    MEDIUM: '🟡 Orta',
    HIGH: '🟠 Yüksek',
    URGENT: '🔴 Acil',
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Yükleniyor...</div>
      </div>
    )
  }

  if (!task) {
    return (
      <div className="text-center py-12">
        <AlertCircle size={48} className="mx-auto text-gray-400 mb-4" />
        <h2 className="text-xl font-semibold text-gray-800">Görev bulunamadı</h2>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <button
        onClick={() => router.back()}
        className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
      >
        <ArrowLeft size={20} />
        <span>Geri Dön</span>
      </button>

      <div className="card">
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">{task.title}</h1>
            <div className="flex flex-wrap items-center gap-4">
              <TaskStatusBadge status={task.status} />
              <span
                className={`px-4 py-2 rounded-full text-sm font-bold shadow-sm ${
                  priorityColors[task.priority as keyof typeof priorityColors]
                }`}
              >
                {priorityLabels[task.priority as keyof typeof priorityLabels]}
              </span>
            </div>
            
            {/* Durum Değiştirme */}
            <div className="mt-4">
              <label htmlFor="status" className="block text-sm font-bold text-gray-900 mb-2">
                📊 Görev Durumunu Değiştir:
              </label>
              <select
                id="status"
                value={task.status}
                onChange={async (e) => {
                  const newStatus = e.target.value
                  try {
                    const res = await fetch(`/api/tasks/${task.id}`, {
                      method: 'PATCH',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ status: newStatus }),
                    })
                    if (res.ok) {
                      loadTask()
                    }
                  } catch (error) {
                    console.error('Durum güncellenirken hata:', error)
                  }
                }}
                className="input max-w-xs font-bold"
              >
                <option value="PENDING">⏳ Bekliyor</option>
                <option value="IN_PROGRESS">🔄 Devam Ediyor</option>
                <option value="ON_HOLD">⏸️ Beklemede</option>
                <option value="COMPLETED">✅ Tamamlandı</option>
                <option value="CANCELLED">❌ İptal Edildi</option>
              </select>
            </div>
          </div>
        </div>

        {task.description && (
          <div className="mb-6">
            <h2 className="text-sm font-semibold text-gray-700 mb-2">Açıklama</h2>
            <p className="text-gray-700 whitespace-pre-wrap">{task.description}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t">
          <div>
            <p className="text-sm text-gray-600 mb-1">Oluşturan</p>
            <div className="flex items-center space-x-2">
              <User size={16} className="text-gray-400" />
              <span className="font-medium">{task.createdBy.name}</span>
            </div>
            <p className="text-xs text-gray-500 ml-6">{task.createdBy.email}</p>
          </div>

          <div>
            <label htmlFor="assignedTo" className="block text-sm font-bold text-gray-900 mb-2">
              👤 Görevi Ata:
            </label>
            <select
              id="assignedTo"
              value={task.assignedTo?.id || ''}
              onChange={(e) => handleAssignUser(e.target.value || null)}
              disabled={assigningUser}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-semibold text-gray-900"
            >
              <option value="">🚫 Atanmamış</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name} ({user.email})
                </option>
              ))}
            </select>
          </div>

          <div>
            <p className="text-sm text-gray-600 mb-1">Oluşturulma Tarihi</p>
            <div className="flex items-center space-x-2">
              <Calendar size={16} className="text-gray-400" />
              <span className="font-medium">{formatDateTime(task.createdAt)}</span>
            </div>
          </div>

          {task.dueDate && (
            <div>
              <p className="text-sm text-gray-600 mb-1">Bitiş Tarihi</p>
              <div className="flex items-center space-x-2">
                <Calendar size={16} className="text-gray-400" />
                <span className="font-medium">{formatDateTime(task.dueDate)}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Dosya Ekleri */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center space-x-2">
            <Paperclip size={20} />
            <span>Dosya Ekleri ({task.attachments?.length || 0})</span>
          </h2>
          <label className="btn btn-secondary flex items-center space-x-2 cursor-pointer">
            <Upload size={16} />
            <span>{uploading ? 'Yükleniyor...' : 'Dosya Yükle'}</span>
            <input
              type="file"
              onChange={handleFileUpload}
              className="hidden"
              accept="image/*,.pdf"
              disabled={uploading}
            />
          </label>
        </div>

        {task.attachments && task.attachments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {task.attachments.map((attachment) => (
              <div
                key={attachment.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <Paperclip size={20} className="text-gray-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800 truncate">{attachment.filename}</p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(attachment.size)} • {formatDateTime(attachment.createdAt)}
                    </p>
                  </div>
                </div>
                <a
                  href={attachment.url}
                  download
                  className="ml-2 p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Download size={18} />
                </a>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">Henüz dosya eklenmemiş</p>
        )}
      </div>

      {/* Yorumlar */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center space-x-2">
          <MessageSquare size={20} />
          <span>Yorumlar ({task.comments?.length || 0})</span>
        </h2>

        <form onSubmit={handleCommentSubmit} className="mb-6">
          <div className="mb-3">
            <MentionInput
              value={comment}
              onChange={setComment}
              placeholder="Yorumunuzu yazın... (@kullanıcı ile etiketleyebilirsiniz)"
              disabled={submitting}
              className="input min-h-[100px]"
            />
            <p className="text-xs text-gray-500 mt-2">
              💡 <strong>İpucu:</strong> @ yazarak kullanıcıları etiketleyebilirsiniz. 
              Etiketlenen kişilere otomatik email bildirimi gönderilir.
            </p>
          </div>
          <button
            type="submit"
            disabled={!comment.trim() || submitting}
            className="btn btn-primary disabled:opacity-50"
          >
            {submitting ? 'Gönderiliyor...' : 'Yorum Ekle'}
          </button>
        </form>

        {task.comments && task.comments.length > 0 ? (
          <div className="space-y-4">
            {task.comments.map((comment) => {
              // @mention'ları vurgula
              const highlightMentions = (text: string) => {
                const parts = text.split(/(@\w+)/g)
                return parts.map((part, index) => {
                  if (part.startsWith('@')) {
                    return (
                      <span
                        key={index}
                        className="bg-indigo-100 text-indigo-700 px-1 py-0.5 rounded font-semibold"
                      >
                        {part}
                      </span>
                    )
                  }
                  return part
                })
              }

              return (
                <div key={comment.id} className="border-l-4 border-blue-500 pl-4 py-2 bg-gray-50 rounded-r">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-800">{comment.user.name}</span>
                    <span className="text-xs text-gray-500">{formatDateTime(comment.createdAt)}</span>
                  </div>
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {highlightMentions(comment.content)}
                  </p>
                </div>
              )
            })}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">Henüz yorum yapılmamış</p>
        )}
      </div>
    </div>
  )
}
