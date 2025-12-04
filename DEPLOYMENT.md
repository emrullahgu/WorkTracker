# KOBİNERJİ GÖREV TAKİP SİSTEMİ - DEPLOYMENT REHBERİ

## 🚀 Production'a Yükleme

### 1. Vercel Deployment (Önerilen - Ücretsiz)

#### Adım 1: GitHub'a Yükle
```bash
git init
git add .
git commit -m "Kobinerji Görev Takip Sistemi v1.0"
git branch -M main
git remote add origin your-github-repo-url
git push -u origin main
```

#### Adım 2: Vercel'e Deploy
1. https://vercel.com/signup → GitHub ile giriş yapın
2. "Import Project" tıklayın
3. GitHub repo'nuzu seçin
4. Environment Variables ekleyin:

```env
# Vercel Environment Variables
DATABASE_URL="file:./prod.db"
NEXTAUTH_URL="https://your-domain.vercel.app"
NEXTAUTH_SECRET="your-super-secret-key-min-32-characters-long"
EMAIL_SERVICE="gmail"
EMAIL_USER="your-email@gmail.com"
EMAIL_PASS="your-gmail-app-password"
```

5. "Deploy" butonuna tıklayın
6. 2-3 dakika bekleyin
7. ✅ Siteniz hazır!

---

### 2. Veritabanı Kurulumu (PostgreSQL - Production)

#### Railway (Ücretsiz PostgreSQL)

1. https://railway.app/new → "Provision PostgreSQL"
2. Database bilgilerinizi kopyalayın
3. Vercel Environment Variables'a ekleyin:

```env
DATABASE_URL="postgresql://user:pass@host:port/dbname"
```

4. `prisma/schema.prisma` düzenleyin:
```prisma
datasource db {
  provider = "postgresql"  // sqlite yerine
  url      = env("DATABASE_URL")
}
```

5. Production'da migration çalıştırın:
```bash
# Vercel build otomatik yapar, veya:
npx prisma migrate deploy
npx prisma db seed
```

---

### 3. Custom Domain (Opsiyonel)

#### Vercel'de Domain Ekleme
1. Vercel Dashboard → Settings → Domains
2. Domain adınızı girin (örn: gorev.kobinerji.com)
3. DNS kayıtlarını güncelleyin:
   ```
   Type: CNAME
   Name: gorev
   Value: cname.vercel-dns.com
   ```
4. 10-30 dakika bekleyin
5. ✅ Custom domain hazır!

---

### 4. E-posta Bildirimleri (Gmail App Password)

1. Gmail hesabınıza giriş yapın
2. https://myaccount.google.com/security
3. "2-Step Verification" aktif edin
4. "App passwords" → "Mail" → "Generate"
5. 16 haneli şifreyi kopyalayın
6. Vercel Environment Variables'a ekleyin:

```env
EMAIL_SERVICE="gmail"
EMAIL_USER="kobinerji@gmail.com"
EMAIL_PASS="xxxx xxxx xxxx xxxx"
```

---

### 5. Güvenlik Kontrolleri

#### ✅ Checklist
- [ ] `.env` dosyası GitHub'a yüklenmemiş
- [ ] `NEXTAUTH_SECRET` güçlü (min 32 karakter)
- [ ] Kullanıcı şifreleri güçlü
- [ ] Email bildirimleri test edildi
- [ ] Dosya yükleme çalışıyor
- [ ] Tüm API endpoints test edildi
- [ ] HTTPS aktif (Vercel otomatik)
- [ ] CORS ayarları yapıldı

---

### 6. Performans Optimizasyonu

#### Vercel Build Settings
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "installCommand": "npm install",
  "framework": "nextjs"
}
```

#### Next.js Config (`next.config.js`)
```js
module.exports = {
  images: {
    domains: ['your-domain.com'],
  },
  compress: true,
  poweredByHeader: false,
}
```

---

### 7. Monitoring ve Logs

#### Vercel Dashboard
- **Analytics**: Otomatik aktif
- **Logs**: Runtime logs
- **Performance**: Web Vitals

#### Error Tracking (Opsiyonel)
```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

---

### 8. Backup Stratejisi

#### Veritabanı Backup (PostgreSQL)
```bash
# Otomatik backup
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql

# Restore
psql $DATABASE_URL < backup-20251204.sql
```

#### SQLite Backup
```bash
# SQLite dosyasını kopyala
cp dev.db backups/dev-$(date +%Y%m%d).db
```

---

### 9. Kullanıcı Eğitimi

#### İlk Kurulum Sonrası
1. Tüm ekip üyelerine giriş bilgilerini gönderin
2. İlk giriş yaptıklarında şifre değiştirmelerini isteyin
3. Demo görev oluşturun
4. AI asistanı tanıtın
5. Dosya yükleme özelliğini gösterin

---

### 10. Maintenance Plan

#### Günlük
- [ ] Log kontrolü
- [ ] Error monitoring

#### Haftalık
- [ ] Veritabanı backup
- [ ] Performance check
- [ ] Kullanıcı feedback

#### Aylık
- [ ] Dependency updates: `npm audit`
- [ ] Security scan
- [ ] Disk space check

---

## 🆘 Production Sorun Giderme

### Problem: Build Fails
```bash
# Clear cache
rm -rf .next node_modules
npm install
npm run build
```

### Problem: Database Connection Error
```bash
# Test connection
npx prisma db push
npx prisma studio
```

### Problem: Email Not Sending
```bash
# Test email
node -e "require('./src/lib/email').sendTaskAssignmentEmail({to:'test@test.com',taskTitle:'Test',assignedBy:'Admin',taskUrl:'http://localhost:3000'})"
```

---

## 📊 Production Metrics

### Expected Performance
- **Page Load**: < 2s
- **API Response**: < 500ms
- **Database Query**: < 100ms
- **File Upload**: < 5s (5MB)

### Scaling Limits (Vercel Free Tier)
- **Bandwidth**: 100 GB/month
- **Build Time**: 6000 minutes/month
- **Functions**: 100 GB-hours
- **Edge Requests**: Unlimited

---

## ✅ Post-Deployment Checklist

- [ ] Site erişilebilir
- [ ] Login çalışıyor
- [ ] Görev oluşturma çalışıyor
- [ ] Dosya yükleme çalışıyor
- [ ] AI chatbot yanıt veriyor
- [ ] E-posta bildirimleri gidiyor
- [ ] Mobile responsive
- [ ] HTTPS aktif
- [ ] Custom domain (varsa) çalışıyor
- [ ] Analytics tracking aktif

---

## 🎉 Deployment Tamamlandı!

Siteniz artık yayında: **https://your-domain.vercel.app**

**Kobinerji Ekibine Başarılar! 🚀**
