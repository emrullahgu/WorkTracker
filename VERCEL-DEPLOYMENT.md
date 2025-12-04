# Vercel'e Deployment Rehberi

## 🚀 Adım 1: Vercel Hesabı ve Proje Oluşturma

1. **Vercel hesabı oluşturun**: https://vercel.com/signup
   - GitHub hesabınızla giriş yapın

2. **New Project** butonuna tıklayın

3. **GitHub repository'yi import edin**:
   - `emrullahgu/WorkTracker` repository'sini seçin
   - Import butonuna tıklayın

## 📋 Adım 2: Environment Variables Ayarlama

Vercel dashboard'da, project settings'e girin ve şu environment variable'ları ekleyin:

### Database (ÖNEMLİ!)
```
DATABASE_URL=file:./dev.db
```

**⚠️ ÖNEMLİ NOT**: SQLite Vercel'de çalışmaz! Aşağıdaki seçeneklerden birini kullanmalısınız:

#### Seçenek A: Vercel Postgres (Ücretsiz - Önerilen)
1. Vercel Dashboard → Storage → Create Database → Postgres
2. Free plan seçin (256 MB)
3. Otomatik olarak `DATABASE_URL` oluşturulacak
4. `prisma/schema.prisma` dosyasını güncelleyin:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
5. Migration çalıştırın: `npx prisma migrate deploy`

#### Seçenek B: Railway (Ücretsiz)
1. https://railway.app → New Project → Provision PostgreSQL
2. PostgreSQL Connection String'i kopyalayın
3. Vercel'de `DATABASE_URL` olarak ekleyin

#### Seçenek C: Neon Database (Ücretsiz)
1. https://neon.tech → Create Project
2. Connection string'i kopyalayın
3. Vercel'de `DATABASE_URL` olarak ekleyin

### NextAuth
```
NEXTAUTH_SECRET=<32-karakter-rastgele-string>
NEXTAUTH_URL=https://your-app.vercel.app
```

**NEXTAUTH_SECRET oluşturmak için**:
```bash
openssl rand -base64 32
```
veya PowerShell'de:
```powershell
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | % {[char]$_})
```

### Email Configuration
```
EMAIL_SERVICE=gmail
EMAIL_USER=emrullahgunayy@gmail.com
EMAIL_PASS=xcwk hltx hbpn unej
EMAIL_FROM=emrullahgunayy@gmail.com
```

### Cron Jobs
```
CRON_SECRET=kobinerji-cron-secret-2024
```

## 🔧 Adım 3: Build Settings

Vercel otomatik olarak Next.js projesini algılayacak, ancak kontrol edin:

- **Framework Preset**: Next.js
- **Build Command**: `npm run build` veya `npx prisma generate && npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

## 📦 Adım 4: Database Schema Deploy

PostgreSQL kullanıyorsanız, deploy'dan önce:

1. Lokal olarak schema'yı güncelleyin:
```bash
npx prisma migrate deploy
```

2. Seed data ekleyin (opsiyonel):
```bash
npx tsx prisma/seed.ts
```

3. GitHub'a push edin:
```bash
git add .
git commit -m "chore: update for Vercel deployment"
git push
```

## 🚀 Adım 5: Deploy

1. Vercel dashboard'da **Deploy** butonuna tıklayın
2. Build logs'u takip edin
3. Deploy tamamlandığında domain'iniz hazır: `https://your-app.vercel.app`

## ⏰ Adım 6: Cron Job Ayarlama (Event Reminders)

Vercel'de cron job ayarlamak için `vercel.json` dosyası zaten hazır:

```json
{
  "crons": [{
    "path": "/api/cron/event-reminders",
    "schedule": "*/5 * * * *"
  }]
}
```

Bu ayar her 5 dakikada bir event reminder'ları kontrol edecek.

## 🔐 Adım 7: Admin Kullanıcı Oluşturma

Deploy'dan sonra, ilk admin kullanıcıyı oluşturmak için:

1. Production domain'e gidin: `https://your-app.vercel.app/register`
2. İlk kullanıcı otomatik olarak ADMIN olacak
3. Email doğrulama kodunu girin
4. Giriş yapın!

## 📊 Adım 8: Test

Production'da test edin:
- ✅ Giriş yapma
- ✅ Görev oluşturma
- ✅ Drag-drop
- ✅ Email bildirimleri
- ✅ Takvim oluşturma
- ✅ Analytics
- ✅ Kullanıcı yönetimi

## 🔍 Sorun Giderme

### Build Hatası
- Logs'u kontrol edin: Vercel Dashboard → Deployments → Son deployment → View Logs
- Prisma hatası: `npx prisma generate` komutunu build command'a ekleyin

### Database Bağlantı Hatası
- `DATABASE_URL` doğru mu kontrol edin
- PostgreSQL kullandığınızdan emin olun (SQLite production'da çalışmaz)

### Email Gönderilmiyor
- Gmail App Password doğru mu?
- EMAIL_SERVICE, EMAIL_USER, EMAIL_PASS doğru ayarlandı mı?

### Cron Job Çalışmıyor
- `vercel.json` dosyası root'ta mı?
- `CRON_SECRET` environment variable'ı eklenmiş mi?
- Cron job Vercel'in Pro planında daha iyi çalışır (Hobby planında limitleri var)

## 🎉 Tamamlandı!

Production siteniz hazır: `https://your-app.vercel.app`

### Ekstra Öneriler
- Custom domain ekleyin (Vercel → Settings → Domains)
- Analytics aktif edin (Vercel → Analytics)
- Error tracking için Sentry entegre edin
- Regular database backup'ları alın
