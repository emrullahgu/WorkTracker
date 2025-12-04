# 🎯 Görev Takip Sistemi

Modern ve profesyonel bir görev yönetim platformu. **Tamamen ücretsiz araçlar** kullanılarak geliştirilmiştir.

## 🌟 Özellikler

### ✅ Temel Özellikler
- **Kullanıcı Kimlik Doğrulama**: NextAuth.js ile güvenli giriş/kayıt sistemi
- **Görev Yönetimi**: Görev oluşturma, düzenleme, silme ve listeleme
- **Durum Yönetimi**: Beklemede, Devam Ediyor, Tamamlandı statüleri
- **Öncelik Seviyeleri**: Düşük, Orta, Yüksek, Acil

### 🎯 İleri Seviye Özellikler
- **Sürükle-Bırak Arayüzü**: Kanban board ile görevleri kolayca taşıyın
- **Analitik Dashboard**: Grafik ve istatistiklerle görev takibi
- **Yorum Sistemi**: Görevler üzerinde ekip içi iletişim
- **Dosya Ekleme**: Görevlere görsel ve döküman ekleme
- **E-posta Bildirimleri**: Gmail/Outlook ile ücretsiz bildirim

## 📋 Gereksinimler

- Node.js 18+ (Ücretsiz)
- SQLite (Ücretsiz, otomatik dahil) VEYA PostgreSQL (Opsiyonel)
- npm (Node.js ile birlikte gelir)

## 🚀 Hızlı Kurulum (5 Dakika)

### 1. Bağımlılıkları Yükleyin

```bash
npm install
```

### 2. Veritabanını Hazırlayın

SQLite kullanıyorsunuz (varsayılan, ücretsiz, kurulum gerektirmez):

```bash
npx prisma migrate dev --name init
```

Bu komut otomatik olarak `dev.db` dosyasını oluşturacak.

### 3. Geliştirme Sunucusunu Başlatın

```bash
npm run dev
```

🎉 **Hazır!** http://localhost:3000 adresinden erişebilirsiniz.

---

## ⚙️ Gelişmiş Yapılandırma (Opsiyonel)

### E-posta Bildirimleri (Ücretsiz Gmail ile)

1. **Gmail App Password oluşturun**:
   - https://myaccount.google.com/security
   - 2-Step Verification'ı aktif edin
   - App Passwords → Mail → Generate
   - 16 haneli şifreyi kopyalayın

2. **`.env` dosyasını düzenleyin**:

```env
EMAIL_SERVICE="gmail"
EMAIL_USER="sizin-email@gmail.com"
EMAIL_PASS="xxxx-xxxx-xxxx-xxxx"
```

3. Sunucuyu yeniden başlatın - artık görev bildirimleri gönderilecek!

### PostgreSQL Kullanımı (Opsiyonel)

SQLite yerine PostgreSQL kullanmak isterseniz:

1. **PostgreSQL kurun** (ücretsiz): https://www.postgresql.org/download/

2. **`prisma/schema.prisma`** dosyasında:
```prisma
datasource db {
  provider = "postgresql"  // sqlite yerine
  url      = env("DATABASE_URL")
}
```

3. **`.env`** dosyasında:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/taskdb"
```

4. Migration'ı yeniden çalıştırın:
```bash
npx prisma migrate dev --name init
```

## 📁 Proje Yapısı

```
├── prisma/
│   └── schema.prisma          # Veritabanı şeması
├── src/
│   ├── app/
│   │   ├── api/              # API route'ları
│   │   │   ├── auth/         # Kimlik doğrulama
│   │   │   ├── tasks/        # Görev CRUD
│   │   │   ├── analytics/    # İstatistikler
│   │   │   └── users/        # Kullanıcı listesi
│   │   ├── dashboard/        # Dashboard sayfaları
│   │   ├── login/            # Giriş sayfası
│   │   └── register/         # Kayıt sayfası
│   ├── components/
│   │   ├── dashboard/        # Dashboard bileşenleri
│   │   └── tasks/            # Görev bileşenleri
│   ├── lib/
│   │   ├── prisma.ts         # Prisma client
│   │   ├── email.ts          # E-posta servisi
│   │   └── utils.ts          # Yardımcı fonksiyonlar
│   └── types/                # TypeScript tip tanımları
```

## 🎨 Kullanılan Teknolojiler (Tümü Ücretsiz!)

- **Framework**: Next.js 14 (App Router) ✅ Ücretsiz
- **Dil**: TypeScript ✅ Ücretsiz
- **Veritabanı**: SQLite (PostgreSQL opsiyonel) ✅ Ücretsiz
- **ORM**: Prisma ✅ Ücretsiz
- **Kimlik Doğrulama**: NextAuth.js ✅ Ücretsiz
- **Stil**: Tailwind CSS ✅ Ücretsiz
- **Drag & Drop**: @dnd-kit ✅ Ücretsiz
- **Grafikler**: Recharts ✅ Ücretsiz
- **E-posta**: Nodemailer (Gmail/Outlook) ✅ Ücretsiz
- **Form Yönetimi**: React Hook Form ✅ Ücretsiz
- **Validasyon**: Zod ✅ Ücretsiz
- **İkonlar**: Lucide React ✅ Ücretsiz

💰 **Toplam Maliyet**: 0₺ / $0 / €0

## 🔐 Güvenlik

- Şifreler bcryptjs ile hash'lenir
- JWT tabanlı oturum yönetimi
- SQL injection koruması (Prisma ORM)
- CSRF koruması
- API route'larında yetkilendirme kontrolü

## 📊 Veritabanı Modelleri

- **User**: Kullanıcı bilgileri ve rolleri
- **Task**: Görev detayları, durum ve öncelik
- **Comment**: Görevlere yapılan yorumlar
- **Attachment**: Görevlere eklenen dosyalar

## 🚀 Ücretsiz Deployment Seçenekleri

### Vercel (Önerilen - Ücretsiz)

1. GitHub'a push edin
2. https://vercel.com'da ücretsiz hesap açın
3. Projeyi import edin
4. Environment variables ekleyin
5. Deploy edin

✅ Ücretsiz: 100 GB bandwidth, otomatik HTTPS

### Netlify (Ücretsiz Alternatif)

1. GitHub'a push edin
2. https://netlify.com'da ücretsiz hesap açın
3. Deploy edin

✅ Ücretsiz: 100 GB bandwidth, form handling

### Railway (Database için Ücretsiz)

PostgreSQL için ücretsiz hosting:
1. https://railway.app - ücretsiz hesap
2. New Project → PostgreSQL
3. Connection URL'i `.env`'e ekleyin

✅ Ücretsiz: 512 MB RAM, 1 GB storage

### Render (Ücretsiz Full-Stack)

1. https://render.com - ücretsiz hesap
2. Web Service + PostgreSQL oluşturun
3. Deploy edin

✅ Ücretsiz: Full hosting + database

## 📝 API Endpoints

### Authentication
- `POST /api/auth/register` - Yeni kullanıcı kaydı
- `POST /api/auth/[...nextauth]` - Giriş/Çıkış

### Tasks
- `GET /api/tasks` - Görev listesi
- `POST /api/tasks` - Yeni görev oluştur
- `GET /api/tasks/[id]` - Görev detayı
- `PATCH /api/tasks/[id]` - Görevi güncelle
- `DELETE /api/tasks/[id]` - Görev sil

### Comments
- `POST /api/tasks/[id]/comments` - Yorum ekle

### Analytics
- `GET /api/analytics` - İstatistikler

### Users
- `GET /api/users` - Kullanıcı listesi

## 🤝 Katkıda Bulunma

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit edin (`git commit -m 'Add amazing feature'`)
4. Push edin (`git push origin feature/amazing-feature`)
5. Pull Request açın

## 📄 Lisans

Bu proje MIT lisansı altındadır.

## 💡 İletişim

Sorularınız için issue açabilirsiniz.

---

**Geliştirici**: GitHub Copilot ile oluşturuldu
**Versiyon**: 1.0.0
**Son Güncelleme**: Aralık 2025
