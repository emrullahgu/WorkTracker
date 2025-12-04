'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle } from 'lucide-react'

export default function RegisterPage() {
  const router = useRouter()
  const [step, setStep] = useState<'register' | 'verify'>('register')
  const [formData, setFormData] = useState({
    username: '',
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [verificationCode, setVerificationCode] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (formData.password !== formData.confirmPassword) {
      setError('Şifreler eşleşmiyor')
      return
    }

    if (formData.password.length < 6) {
      setError('Şifre en az 6 karakter olmalıdır')
      return
    }

    if (formData.username.length < 3) {
      setError('Kullanıcı adı en az 3 karakter olmalıdır')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formData.username,
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Kayıt işlemi başarısız')
        return
      }

      setSuccess('Doğrulama kodu email adresinize gönderildi! ✉️')
      setStep('verify')
    } catch (error) {
      setError('Kayıt işlemi sırasında bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (verificationCode.length !== 6) {
      setError('Doğrulama kodu 6 haneli olmalıdır')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          verificationCode,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Doğrulama işlemi başarısız')
        return
      }

      setSuccess('Email başarıyla doğrulandı! Giriş sayfasına yönlendiriliyorsunuz...')
      setTimeout(() => {
        router.push('/login?verified=true')
      }, 2000)
    } catch (error) {
      setError('Doğrulama işlemi sırasında bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  if (step === 'verify') {
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
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full mb-4">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800">Email Doğrulama</h1>
            <p className="text-gray-600 mt-2">
              <strong>{formData.email}</strong> adresine<br/>6 haneli doğrulama kodu gönderdik
            </p>
          </div>

          <form onSubmit={handleVerify} className="space-y-6">
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
              <label htmlFor="verificationCode" className="label">
                Doğrulama Kodu
              </label>
              <input
                id="verificationCode"
                name="verificationCode"
                type="text"
                maxLength={6}
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                className="input text-center text-2xl tracking-widest font-mono"
                placeholder="000000"
                required
                autoFocus
              />
              <p className="text-xs text-gray-500 mt-2 text-center">
                Kod 15 dakika geçerlidir
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || verificationCode.length !== 6}
              className="btn btn-primary w-full disabled:opacity-50"
            >
              {loading ? 'Doğrulanıyor...' : 'Doğrula ve Devam Et'}
            </button>

            <button
              type="button"
              onClick={() => setStep('register')}
              className="w-full text-center text-sm text-gray-600 hover:text-gray-800"
            >
              ← Geri Dön
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
          <h1 className="text-3xl font-bold text-gray-800">KOBİNERJİ</h1>
          <p className="text-gray-600 mt-2">Görev Takip Sistemi - Kayıt Ol</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-6">
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
            <label htmlFor="username" className="label">
              Kullanıcı Adı
            </label>
            <input
              id="username"
              name="username"
              type="text"
              value={formData.username}
              onChange={handleChange}
              className="input"
              placeholder="ahmetyilmaz"
              pattern="[a-zA-Z0-9_]+"
              title="Sadece harf, rakam ve alt çizgi kullanabilirsiniz"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Sadece harf, rakam ve alt çizgi (_) kullanabilirsiniz
            </p>
          </div>

          <div>
            <label htmlFor="name" className="label">
              Ad Soyad
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              className="input"
              placeholder="Ahmet Yılmaz"
              required
            />
          </div>

          <div>
            <label htmlFor="email" className="label">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              className="input"
              placeholder="ornek@email.com"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="label">
              Şifre
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              className="input"
              placeholder="••••••••"
              required
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="label">
              Şifre Tekrar
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="input"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-full disabled:opacity-50"
          >
            {loading ? 'Kayıt yapılıyor...' : 'Kayıt Ol'}
          </button>
        </form>

        <p className="text-center text-gray-600 mt-6">
          Zaten hesabınız var mı?{' '}
          <Link href="/login" className="text-blue-600 hover:underline font-medium">
            Giriş Yap
          </Link>
        </p>
      </div>
    </div>
  )
}
