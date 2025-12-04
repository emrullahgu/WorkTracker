'use client'

import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts'
import { TrendingUp, Users, CheckCircle, Clock, AlertTriangle, Calendar } from 'lucide-react'

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAnalytics()
  }, [])

  const loadAnalytics = async () => {
    try {
      const res = await fetch('/api/analytics')
      const data = await res.json()
      setAnalytics(data)
    } catch (error) {
      console.error('İstatistikler yüklenirken hata:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-700 font-semibold">İstatistikler yükleniyor...</p>
        </div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-700 font-bold text-xl">Veri yüklenemedi</p>
          <button 
            onClick={loadAnalytics}
            className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700"
          >
            Tekrar Dene
          </button>
        </div>
      </div>
    )
  }

  const COLORS = ['#EAB308', '#3B82F6', '#6B7280', '#10B981', '#EF4444']

  const statusLabels: Record<string, string> = {
    PENDING: '⏳ Bekliyor',
    IN_PROGRESS: '🔄 Devam Ediyor',
    ON_HOLD: '⏸️ Beklemede',
    COMPLETED: '✅ Tamamlandı',
    CANCELLED: '❌ İptal Edildi',
  }

  const priorityLabels: Record<string, string> = {
    LOW: 'Düşük',
    MEDIUM: 'Orta',
    HIGH: 'Yüksek',
    URGENT: 'Acil',
  }

  const statusData = analytics.tasksByStatus.map((item: any) => ({
    name: statusLabels[item.status] || item.status,
    value: item.count,
  }))

  const priorityData = analytics.tasksByPriority.map((item: any) => ({
    name: priorityLabels[item.priority] || item.priority,
    value: item.count,
  }))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">📊 Analitik ve Raporlama</h1>
        <p className="text-gray-700 font-bold mt-2">Gerçek zamanlı görev istatistikleri ve performans analizi</p>
      </div>

      {/* Özet Kartlar */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <Calendar className="w-8 h-8 opacity-80" />
            <span className="text-3xl font-bold">{analytics.summary.totalTasks}</span>
          </div>
          <p className="text-blue-100 font-bold">Toplam Görev</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle className="w-8 h-8 opacity-80" />
            <span className="text-3xl font-bold">{analytics.summary.completedThisWeek}</span>
          </div>
          <p className="text-green-100 font-bold">Bu Hafta Tamamlandı</p>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-8 h-8 opacity-80" />
            <span className="text-3xl font-bold">{analytics.summary.tasksThisWeek}</span>
          </div>
          <p className="text-orange-100 font-bold">Bu Hafta Oluşturuldu</p>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <AlertTriangle className="w-8 h-8 opacity-80" />
            <span className="text-3xl font-bold">{analytics.summary.overdueTasks}</span>
          </div>
          <p className="text-red-100 font-bold">Gecikmiş Görev</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <Clock className="w-8 h-8 opacity-80" />
            <span className="text-3xl font-bold">{analytics.summary.avgCompletionDays}</span>
          </div>
          <p className="text-purple-100 font-bold">Ort. Tamamlanma (gün)</p>
        </div>
      </div>

      {/* Grafikler */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Görev Durumları */}
        <div className="bg-white rounded-xl shadow-lg border-2 border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">📈 Görev Durumları</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {statusData.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Öncelik Dağılımı */}
        <div className="bg-white rounded-xl shadow-lg border-2 border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">🎯 Öncelik Dağılımı</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={priorityData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#8B5CF6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Tamamlanma Trendi */}
        <div className="bg-white rounded-xl shadow-lg border-2 border-gray-200 p-6 lg:col-span-2">
          <h2 className="text-xl font-bold text-gray-900 mb-4">📉 Son 30 Gün Tamamlanan Görevler</h2>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={analytics.completionTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="completed" 
                stroke="#10B981" 
                strokeWidth={3}
                name="Tamamlanan Görevler"
                dot={{ fill: '#10B981', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Kullanıcı Performans Tablosu */}
      <div className="bg-white rounded-xl shadow-lg border-2 border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">👥 Kullanıcı Performans Analizi</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-blue-600 to-purple-600">
              <tr>
                <th className="text-left py-3 px-4 text-white font-bold">Kullanıcı</th>
                <th className="text-center py-3 px-4 text-white font-bold">Email</th>
                <th className="text-center py-3 px-4 text-white font-bold">Toplam Görev</th>
                <th className="text-center py-3 px-4 text-white font-bold">✅ Tamamlandı</th>
                <th className="text-center py-3 px-4 text-white font-bold">🔄 Devam Ediyor</th>
                <th className="text-center py-3 px-4 text-white font-bold">⏳ Bekliyor</th>
                <th className="text-center py-3 px-4 text-white font-bold">⏸️ Beklemede</th>
                <th className="text-center py-3 px-4 text-white font-bold">❌ İptal</th>
                <th className="text-center py-3 px-4 text-white font-bold">Başarı Oranı</th>
              </tr>
            </thead>
            <tbody>
              {analytics.userStats.map((user: any, index: number) => (
                <tr key={user.userId} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                  <td className="py-3 px-4 text-gray-900 font-bold">
                    {user.userName}
                    <br />
                    <span className="text-sm text-gray-600 font-semibold">@{user.username}</span>
                  </td>
                  <td className="py-3 px-4 text-gray-700 font-semibold text-center text-sm">{user.email}</td>
                  <td className="py-3 px-4 text-center">
                    <span className="bg-blue-100 text-blue-900 px-3 py-1 rounded-full font-bold">
                      {user.totalTasks}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="bg-green-100 text-green-900 px-3 py-1 rounded-full font-bold">
                      {user.completed}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="bg-yellow-100 text-yellow-900 px-3 py-1 rounded-full font-bold">
                      {user.inProgress}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="bg-gray-100 text-gray-900 px-3 py-1 rounded-full font-bold">
                      {user.pending}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="bg-orange-100 text-orange-900 px-3 py-1 rounded-full font-bold">
                      {user.onHold}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="bg-red-100 text-red-900 px-3 py-1 rounded-full font-bold">
                      {user.cancelled}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all"
                          style={{ width: `${user.completionRate}%` }}
                        />
                      </div>
                      <span className="text-gray-900 font-bold text-sm">
                        {user.completionRate}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {analytics.userStats.length === 0 && (
          <div className="text-center py-8">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-700 font-bold">Henüz kullanıcı verisi yok</p>
          </div>
        )}
      </div>

      {/* Durum Kartları */}
      <div className="bg-white rounded-xl shadow-lg border-2 border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">📊 Detaylı Durum İstatistikleri</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {statusData.map((item: any, index: number) => (
            <div key={index} className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-xl text-center border-2 hover:shadow-lg transition" style={{ borderColor: COLORS[index] }}>
              <div className="text-4xl font-bold mb-2" style={{ color: COLORS[index] }}>
                {item.value}
              </div>
              <div className="text-sm text-gray-700 font-bold">{item.name}</div>
              <div className="mt-2 text-xs text-gray-600 font-semibold">
                {analytics.summary.totalTasks > 0 
                  ? `${((item.value / analytics.summary.totalTasks) * 100).toFixed(1)}%` 
                  : '0%'}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
