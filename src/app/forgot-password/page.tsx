'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { KeyRound, Mail, Lock, ArrowLeft } from 'lucide-react'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [step, setStep] = useState<'email' | 'reset'>('email')
  const [email, setEmail] = useState('')
  const [resetToken, setResetToken] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      const data = await res.json()

      if (res.ok) {
        setSuccess('Şifre sıfırlama kodu email adresinize gönderildi')
        setStep('reset')
      } else {
        setError(data.error || 'Bir hata oluştu')
      }
    } catch (error) {
      setError('Bir hata oluştu, lütfen tekrar deneyin')
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (newPassword !== confirmPassword) {
      setError('Şifreler eşleşmiyor')
      return
    }

    if (newPassword.length < 6) {
      setError('Şifre en az 6 karakter olmalıdır')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, resetToken, newPassword })
      })

      const data = await res.json()

      if (res.ok) {
        setSuccess('Şifreniz başarıyla güncellendi! Giriş sayfasına yönlendiriliyorsunuz...')
        setTimeout(() => {
          router.push('/login')
        }, 2000)
      } else {
        setError(data.error || 'Bir hata oluştu')
      }
    } catch (error) {
      setError('Bir hata oluştu, lütfen tekrar deneyin')
    } finally {
      setLoading(false)
    }
  }

  if (step === 'reset') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
          <div className="text-center mb-8">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src="/kobinerji_logo.png" 
              alt="KOBİNERJİ Logo" 
              className="w-32 h-auto mx-auto mb-4"
            />
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-red-500 to-orange-600 rounded-full mb-4">
              <Lock className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800">Yeni Şifre Belirle</h1>
            <p className="text-gray-600 mt-2">
              <strong>{email}</strong> adresine gönderilen kodu girin
            </p>
          </div>

          <form onSubmit={handleResetPassword} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
                {success}
              </div>
            )}

            <div>
              <label htmlFor="resetToken" className="label">
                Sıfırlama Kodu (6 haneli)
              </label>
              <input
                id="resetToken"
                type="text"
                value={resetToken}
                onChange={(e) => setResetToken(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="input text-center text-2xl tracking-widest font-bold"
                placeholder="123456"
                maxLength={6}
                required
              />
            </div>

            <div>
              <label htmlFor="newPassword" className="label">
                Yeni Şifre
              </label>
              <input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="input"
                placeholder="En az 6 karakter"
                required
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="label">
                Yeni Şifre (Tekrar)
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="input"
                placeholder="Şifrenizi tekrar girin"
                required
              />
            </div>

            <button
              type="submit"
              className="btn-primary w-full"
              disabled={loading}
            >
              {loading ? 'Güncelleniyor...' : 'Şifremi Güncelle'}
            </button>

            <button
              type="button"
              onClick={() => setStep('email')}
              className="w-full text-gray-600 hover:text-gray-800 font-semibold py-2 transition flex items-center justify-center gap-2"
              disabled={loading}
            >
              <ArrowLeft className="w-4 h-4" />
              Geri Dön
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        <div className="text-center mb-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src="/kobinerji_logo.png" 
            alt="KOBİNERJİ Logo" 
            className="w-48 h-auto mx-auto mb-4"
          />
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-4">
            <KeyRound className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800">Şifremi Unuttum</h1>
          <p className="text-gray-600 mt-2">
            Email adresinize şifre sıfırlama kodu göndereceğiz
          </p>
        </div>

        <form onSubmit={handleSendCode} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
              {success}
            </div>
          )}

          <div>
            <label htmlFor="email" className="label">
              <Mail className="w-4 h-4 inline mr-2" />
              Email Adresi
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
              placeholder="ornek@email.com"
              required
            />
          </div>

          <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-lg text-sm">
            <p className="font-semibold mb-1">ℹ️ Bilgilendirme</p>
            <p>Email adresinize 6 haneli bir kod göndereceğiz. Bu kod 15 dakika süreyle geçerli olacaktır.</p>
          </div>

          <button
            type="submit"
            className="btn-primary w-full"
            disabled={loading}
          >
            {loading ? 'Gönderiliyor...' : 'Sıfırlama Kodu Gönder'}
          </button>

          <div className="text-center pt-4 border-t">
            <Link 
              href="/login" 
              className="text-blue-600 hover:text-blue-800 font-semibold flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Giriş Sayfasına Dön
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
