# Production Environment Variables için Hızlı Başlangıç

## 1. NEXTAUTH_SECRET Oluştur

PowerShell'de çalıştırın:
```powershell
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | % {[char]$_})
```

Bu komutu çalıştırın ve çıktıyı kopyalayın. Bu sizin `NEXTAUTH_SECRET` değeriniz olacak.

## 2. Vercel'de Ayarlanacak Environment Variables

Vercel Dashboard → Your Project → Settings → Environment Variables

### Tüm Environment'lar için (Production, Preview, Development):

```
DATABASE_URL=<your-postgresql-connection-string>
NEXTAUTH_SECRET=<yukarıda-oluşturduğunuz-32-karakter>
NEXTAUTH_URL=https://your-app.vercel.app
EMAIL_SERVICE=gmail
EMAIL_USER=emrullahgunayy@gmail.com
EMAIL_PASS=xcwk hltx hbpn unej
EMAIL_FROM=emrullahgunayy@gmail.com
CRON_SECRET=kobinerji-cron-secret-2024
```

## 3. Database Seçenekleri

### Seçenek A: Vercel Postgres (Önerilen - Ücretsiz)
1. Vercel Dashboard → Storage → Create Database
2. Postgres seçin → Free Plan
3. Database oluşturulunca `DATABASE_URL` otomatik eklenecek

### Seçenek B: Neon (Ücretsiz PostgreSQL)
1. https://neon.tech → Sign up
2. New Project → İsim verin
3. Connection String'i kopyalayın
4. Format: `postgresql://user:password@host/database?sslmode=require`

### Seçenek C: Railway (Ücretsiz)
1. https://railway.app → Sign up
2. New Project → Provision PostgreSQL
3. PostgreSQL → Connect → Copy connection string

## 4. Prisma Schema'yı PostgreSQL için Güncelle

`prisma/schema.prisma` dosyasını açın ve güncelleyin:

```prisma
datasource db {
  provider = "postgresql"  // "sqlite" yerine
  url      = env("DATABASE_URL")
}
```

## 5. Migration'ları Hazırla

Lokal olarak:
```bash
npx prisma migrate dev --name init_postgresql
```

Production'da otomatik çalışacak:
```bash
npx prisma migrate deploy
```

## 6. GitHub'a Push

```bash
git add .
git commit -m "chore: prepare for Vercel deployment with PostgreSQL"
git push
```

## 7. Vercel'de Deploy

1. https://vercel.com/new
2. Import Git Repository → emrullahgu/WorkTracker
3. Environment Variables ekle (yukarıdaki listeyi kullan)
4. Deploy!

## 8. İlk Admin Kullanıcı

Deploy'dan sonra:
1. `https://your-app.vercel.app` → Kayıt Ol
2. İlk kullanıcı otomatik ADMIN olur
3. Email doğrulama kodunu gir
4. Giriş yap!

---

## Hızlı Checklist

- [ ] NEXTAUTH_SECRET oluşturdum
- [ ] Database seçtim (Vercel Postgres / Neon / Railway)
- [ ] DATABASE_URL aldım
- [ ] Prisma schema'yı PostgreSQL olarak güncelledim
- [ ] Environment variables Vercel'de ayarladım
- [ ] GitHub'a push ettim
- [ ] Vercel'de deploy ettim
- [ ] İlk admin kullanıcıyı oluşturdum
- [ ] Tüm özellikleri test ettim

🎉 Production'a hazırsınız!
