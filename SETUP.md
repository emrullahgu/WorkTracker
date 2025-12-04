# 🎯 ÜCRETSİZ KURULUM REHBERİ

Bu doküman, projeyi tamamen ücretsiz araçlar kullanarak nasıl kuracağınızı adım adım açıklar.

## 📦 Gerekli Ücretsiz Araçlar

### 1. Node.js (Zorunlu)
- **İndir**: https://nodejs.org/
- **Maliyet**: Ücretsiz
- **Açıklama**: JavaScript runtime, npm ile birlikte gelir

### 2. Visual Studio Code (Önerilen)
- **İndir**: https://code.visualstudio.com/
- **Maliyet**: Ücretsiz
- **Açıklama**: En iyi kod editörü

### 3. Git (Önerilen)
- **İndir**: https://git-scm.com/
- **Maliyet**: Ücretsiz
- **Açıklama**: Versiyon kontrol sistemi

## 🚀 5 Dakikalık Kurulum

### Adım 1: Projeyi İndirin

```bash
# Terminal'de proje klasörüne gidin
cd "C:\Users\emrul\OneDrive\Masaüstü\Yeni klasör"
```

### Adım 2: Bağımlılıkları Yükleyin

```bash
npm install
```

⏱️ Tahmini süre: 2-3 dakika

### Adım 3: Veritabanını Oluşturun (SQLite - Otomatik)

```bash
npx prisma migrate dev --name init
```

✅ Bu komut:
- `dev.db` dosyası oluşturur (SQLite veritabanı)
- Tüm tabloları otomatik yaratır
- Hiçbir ek kurulum gerektirmez

⏱️ Tahmini süre: 10 saniye

### Adım 4: Projeyi Başlatın

```bash
npm run dev
```

🎉 **HAZIR!** Tarayıcınızda açın: http://localhost:3000

## 🔧 Opsiyonel: E-posta Bildirimleri (Gmail ile Ücretsiz)

E-posta bildirimleri olmadan da tüm özellikler çalışır. Ancak eklemek isterseniz:

### Adım 1: Gmail App Password Oluşturun

1. Gmail hesabınıza giriş yapın
2. https://myaccount.google.com/security adresine gidin
3. "2-Step Verification" açın (henüz açık değilse)
4. "App passwords" kısmına tıklayın
5. "Select app" → "Mail" seçin
6. "Generate" tıklayın
7. 16 haneli şifreyi kopyalayın (örnek: `abcd efgh ijkl mnop`)

### Adım 2: .env Dosyasını Düzenleyin

`.env` dosyasını açın ve şunları doldurun:

```env
EMAIL_SERVICE="gmail"
EMAIL_USER="sizin-email@gmail.com"
EMAIL_PASS="abcd efgh ijkl mnop"
```

### Adım 3: Sunucuyu Yeniden Başlatın

```bash
# Ctrl+C ile durdur, sonra tekrar başlat
npm run dev
```

✅ Artık görev atandığında otomatik e-posta gönderilecek!

## 🌐 Opsiyonel: PostgreSQL Kurulumu

SQLite yeterli ama daha güçlü bir veritabanı istiyorsanız:

### Windows için PostgreSQL

1. **İndir**: https://www.postgresql.org/download/windows/
2. Kurulum sırasında:
   - Port: 5432 (varsayılan)
   - Şifre belirleyin (örnek: `postgres123`)
3. Kurulum bitince PostgreSQL çalışacak

### Veritabanı Oluşturun

```bash
# pgAdmin açın veya terminal'de:
psql -U postgres

# Sonra şunu çalıştırın:
CREATE DATABASE taskdb;
\q
```

### Prisma Yapılandırması

1. `prisma/schema.prisma` dosyasını açın:

```prisma
datasource db {
  provider = "postgresql"  // sqlite yerine
  url      = env("DATABASE_URL")
}
```

2. `.env` dosyasını düzenleyin:

```env
DATABASE_URL="postgresql://postgres:postgres123@localhost:5432/taskdb"
```

3. Migration çalıştırın:

```bash
npx prisma migrate dev --name init
```

## 🎓 İlk Kullanıcı Oluşturma

1. http://localhost:3000 açın
2. "Kayıt Ol" tıklayın
3. Bilgilerinizi girin:
   - Ad Soyad: `Admin User`
   - Email: `admin@test.com`
   - Şifre: `123456` (en az 6 karakter)
4. "Kayıt Ol" tıklayın
5. Login sayfasına yönlendirileceksiniz
6. Email ve şifre ile giriş yapın

🎉 Artık Dashboard'dayısınız!

## 🧪 Sistem Testi

### 1. Görev Oluşturun
- Dashboard'da "Yeni Görev" butonuna tıklayın
- Başlık: "Test Görevi"
- Açıklama: "Bu bir test görevidir"
- "Görev Oluştur" tıklayın

### 2. Sürükle-Bırak Test Edin
- "Görevler" sayfasına gidin
- Test görevini sürükleyin
- Farklı sütunlara bırakın (Bekleyen → Devam Eden → Tamamlanan)

### 3. Analitik İnceleyin
- "Analitik" sayfasına gidin
- Grafikleri görün
- İstatistikleri kontrol edin

## ❓ Sorun Giderme

### Hata: "Port 3000 already in use"

```bash
# Windows'ta portu serbest bırakın:
netstat -ano | findstr :3000
taskkill /PID <PID_NUMARASI> /F

# Veya farklı port kullanın:
npm run dev -- -p 3001
```

### Hata: "Cannot find module '@prisma/client'"

```bash
npx prisma generate
npm run dev
```

### Hata: "NextAuth configuration error"

`.env` dosyasında `NEXTAUTH_SECRET` en az 32 karakter olmalı:

```env
NEXTAUTH_SECRET="bu-en-az-otuz-iki-karakter-olmali-degistir"
```

### E-posta Gönderilmiyor

1. `.env` dosyasında email bilgileri doğru mu kontrol edin
2. Gmail App Password kullandığınızdan emin olun (normal şifre değil)
3. 2-Step Verification aktif mi kontrol edin

## 💡 İpuçları

### Geliştirme İpuçları

1. **Hot Reload**: Kod değişiklikleriniz otomatik yansır
2. **Console Logs**: Terminal'de hataları görün
3. **Browser DevTools**: F12 ile frontend hatalarını görün

### Performans İpuçları

1. SQLite çoğu küçük-orta proje için yeterlidir
2. 1000+ görev için PostgreSQL'e geçin
3. Production'da `npm run build` ve `npm start` kullanın

### Güvenlik İpuçları

1. `.env` dosyasını asla GitHub'a yüklemeyin
2. Production'da güçlü `NEXTAUTH_SECRET` kullanın
3. Email şifrelerini güvenli tutun

## 🎯 Sonraki Adımlar

1. ✅ Projeyi çalıştırdınız
2. ✅ İlk görevinizi oluşturdunuz
3. ⬜ Ekip üyelerini davet edin
4. ⬜ E-posta bildirimlerini aktif edin
5. ⬜ Projeyi online'a deploy edin (Vercel ücretsiz!)

## 🆘 Yardım Kaynakları

- **Next.js Dokümantasyon**: https://nextjs.org/docs
- **Prisma Dokümantasyon**: https://www.prisma.io/docs
- **NextAuth.js Guide**: https://next-auth.js.org/getting-started/introduction
- **Tailwind CSS**: https://tailwindcss.com/docs

---

**🎉 Tebrikler!** Artık profesyonel bir görev takip sisteminiz var!

Her şey tamamen ücretsiz ve açık kaynak! 💚
