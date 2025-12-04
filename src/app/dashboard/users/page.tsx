'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Trash2, Mail, UserCircle, Shield, AlertTriangle, Loader2 } from 'lucide-react'

interface User {
  id: string
  name: string
  email: string
  role: string
}

export default function UsersPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated' && session?.user?.role !== 'admin') {
      router.push('/dashboard')
    }
  }, [status, session, router])

  useEffect(() => {
    if (session?.user?.role === 'admin') {
      fetchUsers()
    }
  }, [session])

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users')
      if (res.ok) {
        const data = await res.json()
        setUsers(data)
      }
    } catch (error) {
      console.error('Kullanıcılar yüklenemedi:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (userId: string, userName: string) => {
    if (deleteLoading) return

    setDeleteLoading(userId)
    
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
      })

      const data = await res.json()

      if (res.ok) {
        setUsers(users.filter(u => u.id !== userId))
        setShowDeleteConfirm(null)
        // Başarı mesajı
        alert(`✅ ${userName} başarıyla silindi`)
      } else {
        alert(`❌ Hata: ${data.error}`)
      }
    } catch (error) {
      console.error('Silme hatası:', error)
      alert('❌ Kullanıcı silinemedi')
    } finally {
      setDeleteLoading(null)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    )
  }

  if (session?.user?.role !== 'admin') {
    return null
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Kullanıcı Yönetimi</h1>
        <p className="text-gray-800 font-bold">Sistemdeki tüm kullanıcıları görüntüleyin ve yönetin</p>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600">
          <h2 className="text-xl font-semibold text-white">
            Toplam {users.length} Kullanıcı
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 font-bold uppercase tracking-wider">
                  Kullanıcı
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 font-bold uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 font-bold uppercase tracking-wider">
                  Rol
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-800 font-bold uppercase tracking-wider">
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center">
                        <UserCircle className="h-6 w-6 text-white" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {user.name}
                        </div>
                        {user.id === session?.user?.id && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800">
                            Siz
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <Mail className="h-4 w-4 text-gray-700 mr-2" />
                      {user.email}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {user.role === 'admin' ? (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
                        <Shield className="h-3 w-3 mr-1" />
                        Admin
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        Kullanıcı
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {user.id === session?.user?.id ? (
                      <span className="text-gray-700 text-xs">Kendi hesabınızı silemezsiniz</span>
                    ) : user.role === 'admin' ? (
                      <span className="text-gray-700 text-xs">Admin silinemez</span>
                    ) : showDeleteConfirm === user.id ? (
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setShowDeleteConfirm(null)}
                          className="px-3 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
                          disabled={deleteLoading === user.id}
                        >
                          İptal
                        </button>
                        <button
                          onClick={() => handleDelete(user.id, user.name)}
                          className="px-3 py-1 text-xs font-medium text-white bg-red-600 rounded hover:bg-red-700 transition-colors flex items-center gap-1"
                          disabled={deleteLoading === user.id}
                        >
                          {deleteLoading === user.id ? (
                            <>
                              <Loader2 className="h-3 w-3 animate-spin" />
                              Siliniyor...
                            </>
                          ) : (
                            <>
                              <AlertTriangle className="h-3 w-3" />
                              Evet, Sil
                            </>
                          )}
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setShowDeleteConfirm(user.id)}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 transition-colors"
                        disabled={deleteLoading !== null}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Sil
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {users.length === 0 && (
          <div className="px-6 py-12 text-center">
            <UserCircle className="mx-auto h-12 w-12 text-gray-700" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Kullanıcı yok</h3>
            <p className="mt-1 text-sm text-gray-800 font-bold">Sistemde henüz kullanıcı bulunmuyor.</p>
          </div>
        )}
      </div>

      {/* Uyarı Mesajı */}
      <div className="mt-6 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
        <div className="flex">
          <AlertTriangle className="h-5 w-5 text-yellow-400" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">Önemli Uyarı</h3>
            <div className="mt-2 text-sm text-yellow-700">
              <ul className="list-disc list-inside space-y-1">
                <li>Kullanıcı silindiğinde, o kullanıcının oluşturduğu tüm görevler ve yorumlar da silinir.</li>
                <li>Bu işlem geri alınamaz!</li>
                <li>Admin kullanıcıları ve kendi hesabınızı silemezsiniz.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
