'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useParams, useRouter } from 'next/navigation'
import { Calendar as CalendarIcon, Plus, Users, Lock, Globe, Clock, MapPin, Bell, Trash2, Edit2, X, ChevronLeft, ChevronRight } from 'lucide-react'

interface User {
  id: string
  name: string
  username: string
  email: string
}

interface EventParticipant {
  id: string
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED'
  user: User
}

interface CalendarEvent {
  id: string
  title: string
  description: string | null
  startDate: string
  endDate: string
  location: string | null
  isAllDay: boolean
  reminderMinutes: number | null
  createdById: string
  createdBy: User
  participants: EventParticipant[]
}

interface Calendar {
  id: string
  title: string
  description: string | null
  type: 'PRIVATE' | 'PUBLIC'
  color: string
  createdById: string
  createdBy: User
  events: CalendarEvent[]
}

export default function CalendarDetailPage() {
  const { data: session } = useSession()
  const params = useParams()
  const router = useRouter()
  const calendarId = params.id as string

  const [calendar, setCalendar] = useState<Calendar | null>(null)
  const [loading, setLoading] = useState(true)
  const [showEventModal, setShowEventModal] = useState(false)
  const [allUsers, setAllUsers] = useState<User[]>([])
  const [currentDate, setCurrentDate] = useState(new Date(2025, 11, 4)) // December 4, 2025
  const [viewMode, setViewMode] = useState<'month' | 'list'>('month')

  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    location: '',
    isAllDay: false,
    reminderMinutes: 30,
    participantIds: [] as string[]
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchCalendar()
    fetchUsers()
  }, [calendarId])

  const fetchCalendar = async () => {
    try {
      const res = await fetch(`/api/calendars/${calendarId}`)
      if (res.ok) {
        const data = await res.json()
        setCalendar(data)
      } else if (res.status === 404) {
        alert('Takvim bulunamadı')
        router.push('/dashboard/calendar')
      } else if (res.status === 403) {
        alert('Bu takvimi görüntüleme yetkiniz yok')
        router.push('/dashboard/calendar')
      }
    } catch (error) {
      console.error('Failed to fetch calendar:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users')
      if (res.ok) {
        const data = await res.json()
        setAllUsers(data)
      }
    } catch (error) {
      console.error('Failed to fetch users:', error)
    }
  }

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const startDateTime = eventForm.isAllDay 
        ? new Date(eventForm.startDate).toISOString()
        : new Date(`${eventForm.startDate}T${eventForm.startTime}`).toISOString()
      
      const endDateTime = eventForm.isAllDay
        ? new Date(eventForm.endDate).toISOString()
        : new Date(`${eventForm.endDate}T${eventForm.endTime}`).toISOString()

      const res = await fetch(`/api/calendars/${calendarId}/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: eventForm.title,
          description: eventForm.description || undefined,
          startDate: startDateTime,
          endDate: endDateTime,
          location: eventForm.location || undefined,
          isAllDay: eventForm.isAllDay,
          reminderMinutes: eventForm.reminderMinutes,
          participantIds: eventForm.participantIds
        })
      })

      if (res.ok) {
        setShowEventModal(false)
        setEventForm({
          title: '',
          description: '',
          startDate: '',
          startTime: '',
          endDate: '',
          endTime: '',
          location: '',
          isAllDay: false,
          reminderMinutes: 30,
          participantIds: []
        })
        fetchCalendar()
      } else {
        const error = await res.json()
        alert(error.error || 'Etkinlik oluşturulamadı')
      }
    } catch (error) {
      console.error('Failed to create event:', error)
      alert('Bir hata oluştu')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteCalendar = async () => {
    if (!confirm('Bu takvimi silmek istediğinizden emin misiniz? Tüm etkinlikler silinecektir.')) {
      return
    }

    try {
      const res = await fetch(`/api/calendars/${calendarId}`, {
        method: 'DELETE'
      })

      if (res.ok) {
        router.push('/dashboard/calendar')
      } else {
        const error = await res.json()
        alert(error.error || 'Takvim silinemedi')
      }
    } catch (error) {
      console.error('Failed to delete calendar:', error)
      alert('Bir hata oluştu')
    }
  }

  // Calendar view helpers
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    return { daysInMonth, startingDayOfWeek }
  }

  const getEventsForDate = (date: Date) => {
    if (!calendar) return []
    
    const dateStr = date.toISOString().split('T')[0]
    return calendar.events.filter(event => {
      const eventStartDate = new Date(event.startDate).toISOString().split('T')[0]
      const eventEndDate = new Date(event.endDate).toISOString().split('T')[0]
      return dateStr >= eventStartDate && dateStr <= eventEndDate
    })
  }

  const formatEventTime = (event: CalendarEvent) => {
    if (event.isAllDay) return 'Tüm Gün'
    const start = new Date(event.startDate)
    const end = new Date(event.endDate)
    return `${start.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })} - ${end.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}`
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1)
      } else {
        newDate.setMonth(newDate.getMonth() + 1)
      }
      return newDate
    })
  }

  const monthNames = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık']
  const dayNames = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt']

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-700 font-semibold">Takvim yükleniyor...</p>
        </div>
      </div>
    )
  }

  if (!calendar) {
    return null
  }

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate)
  const isOwner = session?.user?.id === calendar.createdById

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg border-2 border-gray-200 p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div 
              className="w-16 h-16 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: calendar.color }}
            >
              <CalendarIcon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{calendar.title}</h1>
              {calendar.description && (
                <p className="text-gray-700 font-semibold mt-1">{calendar.description}</p>
              )}
              <div className="flex items-center gap-4 mt-2">
                <span className="flex items-center gap-2 text-sm font-bold px-3 py-1 rounded-full" style={{
                  backgroundColor: calendar.type === 'PUBLIC' ? '#DBEAFE' : '#F3E8FF',
                  color: calendar.type === 'PUBLIC' ? '#1E40AF' : '#6B21A8'
                }}>
                  {calendar.type === 'PUBLIC' ? (
                    <>
                      <Globe className="w-4 h-4" />
                      Genel Takvim
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      Özel Takvim
                    </>
                  )}
                </span>
                <span className="text-sm text-gray-700 font-bold">
                  @{calendar.createdBy.username}
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setShowEventModal(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 transition flex items-center gap-2 shadow-lg"
            >
              <Plus className="w-5 h-5" />
              Yeni Etkinlik
            </button>
            {isOwner && (
              <button
                onClick={handleDeleteCalendar}
                className="bg-red-600 text-white px-4 py-3 rounded-lg font-bold hover:bg-red-700 transition shadow-lg"
                title="Takvimi Sil"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* View Controls */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigateMonth('prev')}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <ChevronLeft className="w-6 h-6 text-gray-700" />
          </button>
          <h2 className="text-2xl font-bold text-gray-900 min-w-[200px] text-center">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          <button
            onClick={() => navigateMonth('next')}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <ChevronRight className="w-6 h-6 text-gray-700" />
          </button>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('month')}
            className={`px-4 py-2 rounded-lg font-bold transition ${
              viewMode === 'month'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border-2 border-gray-300 hover:bg-gray-50'
            }`}
          >
            Ay Görünümü
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-4 py-2 rounded-lg font-bold transition ${
              viewMode === 'list'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border-2 border-gray-300 hover:bg-gray-50'
            }`}
          >
            Liste Görünümü
          </button>
        </div>
      </div>

      {/* Calendar View */}
      {viewMode === 'month' ? (
        <div className="bg-white rounded-xl shadow-lg border-2 border-gray-200 p-6">
          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-2 mb-4">
            {dayNames.map(day => (
              <div key={day} className="text-center font-bold text-gray-900 py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2">
            {/* Empty cells before first day */}
            {Array.from({ length: startingDayOfWeek }).map((_, idx) => (
              <div key={`empty-${idx}`} className="min-h-[120px] bg-gray-50 rounded-lg" />
            ))}

            {/* Days of month */}
            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const day = idx + 1
              const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
              const events = getEventsForDate(date)
              const isToday = date.toDateString() === new Date(2025, 11, 4).toDateString()

              return (
                <div
                  key={day}
                  className={`min-h-[120px] p-2 rounded-lg border-2 ${
                    isToday ? 'border-blue-600 bg-blue-50' : 'border-gray-200 bg-white'
                  } hover:shadow-lg transition`}
                >
                  <div className={`text-sm font-bold mb-2 ${isToday ? 'text-blue-600' : 'text-gray-900'}`}>
                    {day}
                  </div>
                  <div className="space-y-1">
                    {events.slice(0, 2).map(event => (
                      <div
                        key={event.id}
                        className="text-xs font-bold px-2 py-1 rounded truncate"
                        style={{ 
                          backgroundColor: calendar.color + '20',
                          color: calendar.color,
                          border: `1px solid ${calendar.color}`
                        }}
                        title={event.title}
                      >
                        {event.title}
                      </div>
                    ))}
                    {events.length > 2 && (
                      <div className="text-xs font-bold text-gray-700 px-2">
                        +{events.length - 2} daha
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        /* List View */
        <div className="space-y-4">
          {calendar.events.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl shadow border-2 border-gray-200">
              <CalendarIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Henüz etkinlik yok</h3>
              <p className="text-gray-700 font-semibold mb-6">İlk etkinliğinizi oluşturarak başlayın</p>
              <button
                onClick={() => setShowEventModal(true)}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 transition inline-flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Yeni Etkinlik Oluştur
              </button>
            </div>
          ) : (
            calendar.events
              .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
              .map(event => (
                <div
                  key={event.id}
                  className="bg-white rounded-xl shadow-lg border-2 hover:shadow-xl transition"
                  style={{ borderColor: calendar.color }}
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">{event.title}</h3>
                        {event.description && (
                          <p className="text-gray-700 font-semibold">{event.description}</p>
                        )}
                      </div>
                      {event.isAllDay && (
                        <span className="bg-purple-100 text-purple-900 px-3 py-1 rounded-full text-sm font-bold">
                          Tüm Gün
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center gap-3 text-gray-700 font-bold">
                        <Clock className="w-5 h-5 text-blue-600" />
                        <div>
                          <div>{new Date(event.startDate).toLocaleDateString('tr-TR', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}</div>
                          <div className="text-sm">{formatEventTime(event)}</div>
                        </div>
                      </div>

                      {event.location && (
                        <div className="flex items-center gap-3 text-gray-700 font-bold">
                          <MapPin className="w-5 h-5 text-red-600" />
                          <span>{event.location}</span>
                        </div>
                      )}

                      {event.reminderMinutes && (
                        <div className="flex items-center gap-3 text-gray-700 font-bold">
                          <Bell className="w-5 h-5 text-yellow-600" />
                          <span>{event.reminderMinutes} dakika önce hatırlatma</span>
                        </div>
                      )}

                      <div className="flex items-center gap-3 text-gray-700 font-bold">
                        <Users className="w-5 h-5 text-green-600" />
                        <span>{event.participants.length} katılımcı</span>
                      </div>
                    </div>

                    {event.participants.length > 0 && (
                      <div className="border-t pt-4 border-gray-200">
                        <h4 className="text-sm font-bold text-gray-900 mb-2">Katılımcılar:</h4>
                        <div className="flex flex-wrap gap-2">
                          {event.participants.map(participant => (
                            <span
                              key={participant.id}
                              className="px-3 py-1 rounded-full text-sm font-bold"
                              style={{
                                backgroundColor: participant.status === 'ACCEPTED' ? '#D1FAE5' : 
                                               participant.status === 'DECLINED' ? '#FEE2E2' : '#FEF3C7',
                                color: participant.status === 'ACCEPTED' ? '#065F46' : 
                                       participant.status === 'DECLINED' ? '#991B1B' : '#92400E'
                              }}
                            >
                              @{participant.user.username}
                              {participant.status === 'ACCEPTED' && ' ✓'}
                              {participant.status === 'DECLINED' && ' ✗'}
                              {participant.status === 'PENDING' && ' ?'}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))
          )}
        </div>
      )}

      {/* Create Event Modal */}
      {showEventModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full my-8">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Yeni Etkinlik Oluştur</h2>
              <button
                onClick={() => setShowEventModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <X className="w-6 h-6 text-gray-700" />
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              {/* Title */}
              <div>
                <label className="block text-gray-900 font-bold mb-2">
                  Etkinlik Başlığı <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={eventForm.title}
                  onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-semibold text-gray-900"
                  placeholder="Örn: Şirket Toplantısı"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-gray-900 font-bold mb-2">Açıklama</label>
                <textarea
                  value={eventForm.description}
                  onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-semibold text-gray-900"
                  placeholder="Etkinlik detayları"
                  rows={3}
                />
              </div>

              {/* All Day Toggle */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isAllDay"
                  checked={eventForm.isAllDay}
                  onChange={(e) => setEventForm({ ...eventForm, isAllDay: e.target.checked })}
                  className="w-5 h-5 rounded border-2 border-gray-300"
                />
                <label htmlFor="isAllDay" className="text-gray-900 font-bold cursor-pointer">
                  Tüm gün etkinliği
                </label>
              </div>

              {/* Start Date/Time */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-900 font-bold mb-2">
                    Başlangıç Tarihi <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={eventForm.startDate}
                    onChange={(e) => setEventForm({ ...eventForm, startDate: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-semibold text-gray-900"
                    required
                  />
                </div>
                {!eventForm.isAllDay && (
                  <div>
                    <label className="block text-gray-900 font-bold mb-2">
                      Başlangıç Saati <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="time"
                      value={eventForm.startTime}
                      onChange={(e) => setEventForm({ ...eventForm, startTime: e.target.value })}
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-semibold text-gray-900"
                      required
                    />
                  </div>
                )}
              </div>

              {/* End Date/Time */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-900 font-bold mb-2">
                    Bitiş Tarihi <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={eventForm.endDate}
                    onChange={(e) => setEventForm({ ...eventForm, endDate: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-semibold text-gray-900"
                    required
                  />
                </div>
                {!eventForm.isAllDay && (
                  <div>
                    <label className="block text-gray-900 font-bold mb-2">
                      Bitiş Saati <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="time"
                      value={eventForm.endTime}
                      onChange={(e) => setEventForm({ ...eventForm, endTime: e.target.value })}
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-semibold text-gray-900"
                      required
                    />
                  </div>
                )}
              </div>

              {/* Location */}
              <div>
                <label className="block text-gray-900 font-bold mb-2">Konum</label>
                <input
                  type="text"
                  value={eventForm.location}
                  onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-semibold text-gray-900"
                  placeholder="Örn: Toplantı Odası A"
                />
              </div>

              {/* Reminder */}
              <div>
                <label className="block text-gray-900 font-bold mb-2">Hatırlatma</label>
                <select
                  value={eventForm.reminderMinutes}
                  onChange={(e) => setEventForm({ ...eventForm, reminderMinutes: Number(e.target.value) })}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-semibold text-gray-900"
                >
                  <option value={0}>Hatırlatma yok</option>
                  <option value={15}>15 dakika önce</option>
                  <option value={30}>30 dakika önce</option>
                  <option value={60}>1 saat önce</option>
                  <option value={120}>2 saat önce</option>
                  <option value={1440}>1 gün önce</option>
                </select>
              </div>

              {/* Participants */}
              <div>
                <label className="block text-gray-900 font-bold mb-2">Katılımcılar</label>
                <div className="border-2 border-gray-300 rounded-lg p-4 max-h-40 overflow-y-auto">
                  {allUsers.map(user => (
                    <label key={user.id} className="flex items-center gap-3 py-2 cursor-pointer hover:bg-gray-50 rounded px-2">
                      <input
                        type="checkbox"
                        checked={eventForm.participantIds.includes(user.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setEventForm({ ...eventForm, participantIds: [...eventForm.participantIds, user.id] })
                          } else {
                            setEventForm({ ...eventForm, participantIds: eventForm.participantIds.filter(id => id !== user.id) })
                          }
                        }}
                        className="w-5 h-5 rounded border-2 border-gray-300"
                      />
                      <span className="text-gray-900 font-semibold">
                        {user.name} (@{user.username})
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEventModal(false)}
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
                  {submitting ? 'Oluşturuluyor...' : 'Etkinlik Oluştur'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
