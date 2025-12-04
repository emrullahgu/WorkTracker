'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Calendar as CalendarIcon, Plus, Users, Lock, Globe, Clock } from 'lucide-react'

interface Calendar {
  id: string
  title: string
  description: string | null
  type: 'PRIVATE' | 'PUBLIC'
  color: string
  createdById: string
  createdBy: {
    name: string
    username: string
  }
  _count: {
    events: number
  }
}

export default function CalendarPage() {
  const { data: session } = useSession()
  const [calendars, setCalendars] = useState<Calendar[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'PRIVATE' as 'PRIVATE' | 'PUBLIC',
    color: '#3B82F6'
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchCalendars()
  }, [])

  const fetchCalendars = async () => {
    try {
      const res = await fetch('/api/calendars')
      if (res.ok) {
        const data = await res.json()
        setCalendars(data)
      }
    } catch (error) {
      console.error('Failed to fetch calendars:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateCalendar = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const res = await fetch('/api/calendars', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (res.ok) {
        setShowCreateModal(false)
        setFormData({ title: '', description: '', type: 'PRIVATE', color: '#3B82F6' })
        fetchCalendars()
      } else {
        const error = await res.json()
        alert(error.error || 'Takvim oluşturulamadı')
      }
    } catch (error) {
      console.error('Failed to create calendar:', error)
      alert('Bir hata oluştu')
    } finally {
      setSubmitting(false)
    }
  }

  const colorOptions = [
    { value: '#3B82F6', label: 'Mavi' },
    { value: '#EF4444', label: 'Kırmızı' },
    { value: '#10B981', label: 'Yeşil' },
    { value: '#F59E0B', label: 'Turuncu' },
    { value: '#8B5CF6', label: 'Mor' },
    { value: '#EC4899', label: 'Pembe' },
    { value: '#06B6D4', label: 'Cyan' },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-700 font-semibold">Takvimler yükleniyor...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <CalendarIcon className="w-8 h-8 text-blue-600" />
            Takvimler
          </h1>
          <p className="text-gray-700 mt-2 font-semibold">
            Genel ve özel takvimlerinizi yönetin
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 transition flex items-center gap-2 shadow-lg"
        >
          <Plus className="w-5 h-5" />
          Yeni Takvim
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {calendars.map((calendar) => (
          <div
            key={calendar.id}
            className="bg-white rounded-xl shadow-lg hover:shadow-xl transition border-2 border-gray-200 overflow-hidden"
          >
            {/* Color Bar */}
            <div 
              className="h-3"
              style={{ backgroundColor: calendar.color }}
            />

            {/* Content */}
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">{calendar.title}</h3>
                <span className="flex items-center gap-2 text-sm font-bold px-3 py-1 rounded-full" style={{
                  backgroundColor: calendar.type === 'PUBLIC' ? '#DBEAFE' : '#F3E8FF',
                  color: calendar.type === 'PUBLIC' ? '#1E40AF' : '#6B21A8'
                }}>
                  {calendar.type === 'PUBLIC' ? (
                    <>
                      <Globe className="w-4 h-4" />
                      Genel
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      Özel
                    </>
                  )}
                </span>
              </div>

              {calendar.description && (
                <p className="text-gray-700 font-semibold mb-4">
                  {calendar.description}
                </p>
              )}

              <div className="flex items-center justify-between text-sm border-t pt-4 border-gray-200">
                <div className="flex items-center gap-2 text-gray-700 font-bold">
                  <Users className="w-4 h-4" />
                  <span>@{calendar.createdBy.username}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700 font-bold">
                  <Clock className="w-4 h-4" />
                  <span>{calendar._count.events} etkinlik</span>
                </div>
              </div>

              <div className="mt-4">
                <button
                  onClick={() => window.location.href = `/dashboard/calendar/${calendar.id}`}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-lg font-bold hover:from-blue-700 hover:to-blue-800 transition shadow"
                >
                  Takvimi Görüntüle
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {calendars.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl shadow border-2 border-gray-200">
          <CalendarIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">Henüz takvim yok</h3>
          <p className="text-gray-700 font-semibold mb-6">İlk takviminizi oluşturarak başlayın</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 transition inline-flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Yeni Takvim Oluştur
          </button>
        </div>
      )}

      {/* Create Calendar Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Yeni Takvim Oluştur</h2>
            </div>

            <form onSubmit={handleCreateCalendar} className="p-6 space-y-4">
              {/* Title */}
              <div>
                <label className="block text-gray-900 font-bold mb-2">
                  Takvim Adı <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-semibold text-gray-900"
                  placeholder="Örn: Şirket Etkinlikleri"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-gray-900 font-bold mb-2">
                  Açıklama
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-semibold text-gray-900"
                  placeholder="Takvim hakkında kısa açıklama"
                  rows={3}
                />
              </div>

              {/* Type */}
              <div>
                <label className="block text-gray-900 font-bold mb-2">
                  Görünürlük
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: 'PRIVATE' })}
                    className={`px-4 py-3 rounded-lg font-bold border-2 transition flex items-center justify-center gap-2 ${
                      formData.type === 'PRIVATE'
                        ? 'bg-purple-100 border-purple-600 text-purple-900'
                        : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400'
                    }`}
                  >
                    <Lock className="w-5 h-5" />
                    Özel
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: 'PUBLIC' })}
                    className={`px-4 py-3 rounded-lg font-bold border-2 transition flex items-center justify-center gap-2 ${
                      formData.type === 'PUBLIC'
                        ? 'bg-blue-100 border-blue-600 text-blue-900'
                        : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400'
                    }`}
                  >
                    <Globe className="w-5 h-5" />
                    Genel
                  </button>
                </div>
              </div>

              {/* Color */}
              <div>
                <label className="block text-gray-900 font-bold mb-2">
                  Renk
                </label>
                <div className="grid grid-cols-7 gap-2">
                  {colorOptions.map((color) => (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, color: color.value })}
                      className={`w-10 h-10 rounded-lg border-2 transition ${
                        formData.color === color.value
                          ? 'border-gray-900 scale-110 shadow-lg'
                          : 'border-gray-300 hover:scale-105'
                      }`}
                      style={{ backgroundColor: color.value }}
                      title={color.label}
                    />
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false)
                    setFormData({ title: '', description: '', type: 'PRIVATE', color: '#3B82F6' })
                  }}
                  className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg font-bold hover:bg-gray-100 transition"
                  disabled={submitting}
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition disabled:opacity-50 shadow-lg"
                  disabled={submitting}
                >
                  {submitting ? 'Oluşturuluyor...' : 'Oluştur'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
