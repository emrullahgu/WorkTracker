import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendPasswordResetEmail } from '@/lib/email'
import crypto from 'crypto'

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email adresi gerekli' },
        { status: 400 }
      )
    }

    // Kullanıcıyı bul
    const user = await prisma.user.findUnique({
      where: { email }
    })

    // Güvenlik için: Kullanıcı bulunamasa bile başarılı mesajı göster
    // (Email adresi taraması önlenir)
    if (!user) {
      return NextResponse.json({
        message: 'Eğer bu email adresi sistemde kayıtlıysa, şifre sıfırlama bağlantısı gönderildi.'
      })
    }

    // 6 haneli reset token oluştur
    const resetToken = crypto.randomInt(100000, 999999).toString()
    const resetTokenExpiry = new Date(Date.now() + 15 * 60 * 1000) // 15 dakika

    // Token'ı veritabanına kaydet
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry
      }
    })

    // Email gönder
    await sendPasswordResetEmail({
      to: user.email,
      userName: user.name,
      resetToken
    })

    return NextResponse.json({
      message: 'Eğer bu email adresi sistemde kayıtlıysa, şifre sıfırlama bağlantısı gönderildi.'
    })
  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json(
      { error: 'Bir hata oluştu' },
      { status: 500 }
    )
  }
}
