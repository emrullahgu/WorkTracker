'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { User, Mail, Calendar, Shield, Edit2, Save, X } from 'lucide-react'
import { formatDate } from '@/lib/utils'

export default function ProfilePage() {
  const { data: session, update } = useSession()
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({ name: '', email: '' })
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      const res = await fetch('/api/profile')
      const data = await res.json()
      setProfile(data)
      setFormData({ name: data.name, email: data.email })
    } catch (error) {
      console.error('Profil yüklenirken hata:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setMessage({ type: '', text: '' })
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (!res.ok) {
        setMessage({ type: 'error', text: data.error })
        return
      }

      setProfile(data)
      setEditing(false)
      setMessage({ type: 'success', text: 'Profil başarıyla güncellendi' })
      await update({ name: data.name })
    } catch (error) {
      setMessage({ type: 'error', text: 'Bir hata oluştu' })
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage({ type: '', text: '' })

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'Yeni şifreler eşleşmiyor' })
      return
    }

    if (passwordData.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Yeni şifre en az 6 karakter olmalıdır' })
      return
    }

    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setMessage({ type: 'error', text: data.error })
        return
      }

      setMessage({ type: 'success', text: 'Şifre başarıyla değiştirildi' })
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setShowPasswordForm(false)
    } catch (error) {
      setMessage({ type: 'error', text: 'Bir hata oluştu' })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-800 font-bold">Yükleniyor...</div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Profil Ayarları</h1>
        <p className="text-gray-800 font-bold mt-2">Hesap bilgilerinizi yönetin</p>
      </div>

      {message.text && (
        <div
          className={`p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Kişisel Bilgiler</h2>
            <p className="text-sm text-gray-800 font-bold mt-1">Ad, soyad ve email adresinizi güncelleyebilirsiniz</p>
          </div>
          {!editing ? (
            <button onClick={() => setEditing(true)} className="btn btn-secondary flex items-center space-x-2">
              <Edit2 size={16} />
              <span>Düzenle</span>
            </button>
          ) : (
            <div className="flex space-x-2">
              <button onClick={handleSave} className="btn btn-primary flex items-center space-x-2">
                <Save size={16} />
                <span>Kaydet</span>
              </button>
              <button
                onClick={() => {
                  setEditing(false)
                  setFormData({ name: profile.name, email: profile.email })
                }}
                className="btn btn-secondary flex items-center space-x-2"
              >
                <X size={16} />
                <span>İptal</span>
              </button>
            </div>
          )}
        </div>

        {editing && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>💡 Not:</strong> Email adresinizi değiştirdiğinizde, yeni email adresinize bildirimler gönderilecektir.
            </p>
          </div>
        )}

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="label flex items-center space-x-2">
                <User size={16} />
                <span>Ad Soyad</span>
              </label>
              {editing ? (
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input"
                />
              ) : (
                <p className="text-gray-800 font-medium">{profile.name}</p>
              )}
            </div>

            <div>
              <label className="label flex items-center space-x-2">
                <Mail size={16} />
                <span>Email</span>
              </label>
              {editing ? (
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="input"
                />
              ) : (
                <p className="text-gray-800 font-medium">{profile.email}</p>
              )}
            </div>

            <div>
              <label className="label flex items-center space-x-2">
                <Shield size={16} />
                <span>Rol</span>
              </label>
              <p className="text-gray-800 font-medium">
                {profile.role === 'ADMIN' ? '👑 Yönetici' : '👤 Kullanıcı'}
              </p>
            </div>

            <div>
              <label className="label flex items-center space-x-2">
                <Calendar size={16} />
                <span>Kayıt Tarihi</span>
              </label>
              <p className="text-gray-800 font-medium">{formatDate(profile.createdAt)}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-6 border-t">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-3xl font-bold text-blue-600">{profile._count.createdTasks}</div>
              <div className="text-sm text-gray-800 font-bold mt-1">Oluşturulan Görev</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-3xl font-bold text-green-600">{profile._count.assignedTasks}</div>
              <div className="text-sm text-gray-800 font-bold mt-1">Atanan Görev</div>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Güvenlik</h2>
          <p className="text-sm text-gray-800 font-bold mt-1">Hesabınızın güvenliği için şifrenizi düzenli olarak değiştirin</p>
        </div>

        {session?.user?.username && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm text-amber-800">
              <strong>⚠️ Varsayılan Şifre Uyarısı:</strong> Eğer hala varsayılan şifre (<code className="font-mono bg-amber-100 px-2 py-1 rounded">1111</code>) kullanıyorsanız, lütfen güvenliğiniz için şifrenizi değiştirin!
            </p>
          </div>
        )}
        
        {!showPasswordForm ? (
          <button
            onClick={() => setShowPasswordForm(true)}
            className="btn btn-primary"
          >
            🔒 Şifre Değiştir
          </button>
        ) : (
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="label">Mevcut Şifre</label>
              <input
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                className="input"
                required
              />
            </div>

            <div>
              <label className="label">Yeni Şifre</label>
              <input
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                className="input"
                required
                minLength={6}
                placeholder="En az 6 karakter"
              />
              <p className="text-xs text-gray-800 font-bold mt-1">Güçlü bir şifre seçin (en az 6 karakter)</p>
            </div>

            <div>
              <label className="label">Yeni Şifre (Tekrar)</label>
              <input
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                className="input"
                required
                minLength={6}
              />
            </div>

            <div className="flex space-x-2">
              <button type="submit" className="btn btn-primary">
                Şifreyi Güncelle
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowPasswordForm(false)
                  setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
                }}
                className="btn btn-secondary"
              >
                İptal
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
