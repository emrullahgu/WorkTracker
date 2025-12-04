import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import { z } from 'zod'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf']

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Yetkilendirme gerekli' }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'Dosya bulunamadı' }, { status: 400 })
    }

    // Dosya boyutu kontrolü
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'Dosya boyutu 5MB\'dan küçük olmalıdır' }, { status: 400 })
    }

    // Dosya tipi kontrolü
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'Sadece resim ve PDF dosyaları yüklenebilir' }, { status: 400 })
    }

    // Uploads klasörünü oluştur
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'tasks')
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true })
    }

    // Dosya adını oluştur
    const timestamp = Date.now()
    const fileExt = file.name.split('.').pop()
    const fileName = `${params.id}-${timestamp}.${fileExt}`
    const filePath = path.join(uploadsDir, fileName)

    // Dosyayı kaydet
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filePath, buffer)

    // Veritabanına kaydet
    const attachment = await prisma.attachment.create({
      data: {
        filename: file.name,
        url: `/uploads/tasks/${fileName}`,
        mimeType: file.type,
        size: file.size,
        taskId: params.id,
      },
    })

    return NextResponse.json(attachment, { status: 201 })
  } catch (error) {
    console.error('Dosya yükleme hatası:', error)
    return NextResponse.json({ error: 'Dosya yüklenemedi' }, { status: 500 })
  }
}

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Yetkilendirme gerekli' }, { status: 401 })
    }

    const attachments = await prisma.attachment.findMany({
      where: { taskId: params.id },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(attachments)
  } catch (error) {
    return NextResponse.json({ error: 'Dosyalar alınamadı' }, { status: 500 })
  }
}
