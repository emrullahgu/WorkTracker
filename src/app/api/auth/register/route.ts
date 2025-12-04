import { NextResponse } from 'next/server'
import { hash } from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { sendVerificationEmail, sendNewUserNotification } from '@/lib/email'

const registerSchema = z.object({
  username: z.string().min(3).max(20).regex(/^[a-zA-Z0-9_]+$/, 'Kullanıcı adı sadece harf, rakam ve alt çizgi içerebilir'),
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
})

const verifySchema = z.object({
  email: z.string().email(),
  verificationCode: z.string().length(6),
})

// Kayıt ol - Doğrulama kodu gönder
export async function POST(req: Request) {
  try {
    const body = await req.json()
    
    // Eğer verificationCode varsa, doğrulama yapalım
    if ('verificationCode' in body) {
      return verifyEmail(body)
    }

    const { username, name, email, password } = registerSchema.parse(body)

    // Email kontrolü
    const existingEmail = await prisma.user.findUnique({
      where: { email }
    })

    if (existingEmail) {
      return NextResponse.json(
        { error: 'Bu email adresi zaten kayıtlı' },
        { status: 400 }
      )
    }

    // Username kontrolü
    const existingUsername = await prisma.user.findUnique({
      where: { username }
    })

    if (existingUsername) {
      return NextResponse.json(
        { error: 'Bu kullanıcı adı zaten alınmış' },
        { status: 400 }
      )
    }

    // 6 haneli doğrulama kodu oluştur
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString()
    const verificationExpiry = new Date(Date.now() + 15 * 60 * 1000) // 15 dakika

    const hashedPassword = await hash(password, 12)

    // Kullanıcı oluştur (doğrulanmamış)
    const user = await prisma.user.create({
      data: {
        username,
        name,
        email,
        password: hashedPassword,
        emailVerified: false,
        verificationCode,
        verificationExpiry,
      },
    })

    // Doğrulama email'i gönder
    await sendVerificationEmail({
      to: email,
      username,
      verificationCode,
    })

    return NextResponse.json({
      message: 'Doğrulama kodu email adresinize gönderildi',
      userId: user.id,
      email: user.email,
    }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error('Kayıt hatası:', error)
    return NextResponse.json(
      { error: 'Kayıt işlemi başarısız' },
      { status: 500 }
    )
  }
}

// Email doğrulama
async function verifyEmail(body: any) {
  try {
    const { email, verificationCode } = verifySchema.parse(body)

    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      )
    }

    if (user.emailVerified) {
      return NextResponse.json(
        { error: 'Email adresi zaten doğrulanmış' },
        { status: 400 }
      )
    }

    if (!user.verificationCode || !user.verificationExpiry) {
      return NextResponse.json(
        { error: 'Doğrulama kodu bulunamadı' },
        { status: 400 }
      )
    }

    if (new Date() > user.verificationExpiry) {
      return NextResponse.json(
        { error: 'Doğrulama kodunun süresi dolmuş. Lütfen tekrar kayıt olun.' },
        { status: 400 }
      )
    }

    if (user.verificationCode !== verificationCode) {
      return NextResponse.json(
        { error: 'Geçersiz doğrulama kodu' },
        { status: 400 }
      )
    }

    // Email'i doğrula
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        verificationCode: null,
        verificationExpiry: null,
      },
    })

    // Admin'e yeni kullanıcı bildirimi gönder
    try {
      await sendNewUserNotification({
        adminEmail: 'emrullahgunayy@gmail.com',
        newUserName: user.name,
        newUserEmail: user.email,
        newUserUsername: user.username,
      })
    } catch (emailError) {
      console.error('Admin bildirimi gönderilemedi:', emailError)
      // Email hatası kayıt işlemini durdurmasın
    }

    return NextResponse.json({
      message: 'Email başarıyla doğrulandı! Giriş yapabilirsiniz.',
      success: true,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Geçersiz veri formatı' },
        { status: 400 }
      )
    }

    console.error('Doğrulama hatası:', error)
    return NextResponse.json(
      { error: 'Doğrulama işlemi başarısız' },
      { status: 500 }
    )
  }
}
