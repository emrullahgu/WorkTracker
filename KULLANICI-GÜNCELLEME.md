# 🔐 KULLANICI BİLGİLERİNİ GÜNCELLEME REHBERİ

## ✅ Kullanıcılar Şimdi Yapabilir:

### 1. 🔒 Şifre Değiştirme
**Adımlar:**
1. Dashboard'a giriş yap
2. Profil Ayarları'na git
3. "Güvenlik" bölümüne scroll et
4. "🔒 Şifre Değiştir" butonuna tıkla
5. Mevcut şifreni gir (varsayılan: `1111`)
6. Yeni şifreni gir (min 6 karakter)
7. Yeni şifreyi tekrar gir
8. "Şifreyi Güncelle" butonuna tıkla

**Özellikler:**
- ✅ Mevcut şifre doğrulaması
- ✅ Minimum 6 karakter kontrolü
- ✅ Şifre eşleşme kontrolü
- ✅ Güvenli bcrypt hash

### 2. ✉️ Email Değiştirme
**Adımlar:**
1. Profil Ayarları'na git
2. "Kişisel Bilgiler" bölümünde "Düzenle" tıkla
3. Email alanını güncelle
4. "Kaydet" butonuna tıkla

**Özellikler:**
- ✅ Email benzersizlik kontrolü
- ✅ Email format doğrulaması
- ✅ Yeni email'e bildirimler gider
- ✅ Session otomatik güncellenir

### 3. 📝 Ad Soyad Güncelleme
**Adımlar:**
1. Profil Ayarları'na git
2. "Kişisel Bilgiler" bölümünde "Düzenle" tıkla
3. Ad Soyad alanını güncelle
4. "Kaydet" butonuna tıkla

---

## 🎯 İlk Giriş Uyarısı

Kullanıcılar ilk giriş yaptığında **Dashboard'da** büyük bir uyarı görürler:

```
🔐 Hesap Güvenliği Önemli!

Hesabınız varsayılan bilgilerle oluşturulmuş. Güvenliğiniz için lütfen aşağıdaki işlemleri yapın:

🔒 Varsayılan şifrenizi (1111) değiştirin
✉️ Kişisel email adresinizi ekleyin

[Profil Ayarlarına Git →]
```

**Uyarı ne zaman görünür:**
- Kullanıcı profil bilgilerini hiç güncellememiş
- Admin değil (admin'e gösterilmez)
- Varsayılan @kobinerji.com emaili kullanıyor

**Uyarı ne zaman kaybolur:**
- Kullanıcı profil bilgilerini güncellediğinde
- Şifre değiştirildiğinde
- Email değiştirildiğinde

---

## 📋 Profil Sayfası Özellikleri

### Kişisel Bilgiler Bölümü
- 👤 Ad Soyad (düzenlenebilir)
- ✉️ Email (düzenlenebilir)
- 🛡️ Rol (salt okunur)
- 📅 Kayıt Tarihi (salt okunur)
- 📊 İstatistikler:
  - Oluşturulan Görev Sayısı
  - Atanan Görev Sayısı

### Güvenlik Bölümü
- ⚠️ Varsayılan şifre uyarısı (1111 kullanıyorsa)
- 🔒 Şifre değiştirme formu
- ✅ Güvenlik ipuçları

---

## 🔐 Güvenlik Özellikleri

### Şifre Değiştirme
```typescript
// Mevcut şifre doğrulaması
const isValid = await compare(currentPassword, user.password)

// Yeni şifre hash
const hashedPassword = await hash(newPassword, 12)

// Database güncelleme
await prisma.user.update({
  where: { id: userId },
  data: { password: hashedPassword }
})
```

### Email Değiştirme
```typescript
// Email benzersizlik kontrolü
const existing = await prisma.user.findFirst({
  where: { 
    email: newEmail,
    NOT: { id: userId }
  }
})

if (existing) {
  throw new Error('Bu email zaten kullanılıyor')
}
```

---

## 🎨 UI/UX İyileştirmeleri

### Bilgilendirme Mesajları
- 💡 Email değiştirme notu
- ⚠️ Varsayılan şifre uyarısı
- ✅ Başarı mesajları
- ❌ Hata mesajları

### Form Validasyonu
- Gerçek zamanlı doğrulama
- Şifre eşleşme kontrolü
- Email format kontrolü
- Minimum karakter limitleri

### Responsive Tasarım
- Mobil uyumlu
- Kart bazlı layout
- Gradient renkler
- İkonlar (Lucide React)

---

## 🧪 Test Senaryoları

### 1. Şifre Değiştirme Testi
```bash
# Giriş yap
Email: gorkemtanir1@gmail.com
Şifre: 1111

# Profil → Güvenlik → Şifre Değiştir
Mevcut: 1111
Yeni: GorkemYeni123!
Tekrar: GorkemYeni123!

# Çıkış yap ve yeni şifre ile giriş yap
Email: gorkemtanir1@gmail.com
Şifre: GorkemYeni123!
```

### 2. Email Değiştirme Testi
```bash
# Giriş yap
Email: cemblbl@gmail.com
Şifre: 1111

# Profil → Kişisel Bilgiler → Düzenle
Yeni Email: cem.yeni@gmail.com

# Kaydet
# Email değişti ✅
# Yeni email'e bildirimler gidecek
```

### 3. Dashboard Uyarı Testi
```bash
# İlk giriş (hiç güncelleme yapılmamış)
# Dashboard → Uyarı kartı görünür ✅

# Profil güncelleme yap
# Dashboard → Uyarı kayboldu ✅
```

---

## 📊 Database İzleme

### Şifre Değişikliği Kontrolü
```sql
-- Kullanıcı şifresini değiştirdi mi?
SELECT 
  name,
  email,
  createdAt,
  updatedAt,
  CASE 
    WHEN createdAt = updatedAt THEN 'Hiç güncellenmemiş'
    ELSE 'Güncellenmiş'
  END as status
FROM users
WHERE role = 'USER';
```

---

## 🚀 Production Notları

### Güvenlik
- ✅ Şifreler bcrypt ile hash (12 rounds)
- ✅ Session token güvenliği
- ✅ CSRF koruması (NextAuth)
- ✅ SQL injection koruması (Prisma)

### Email Bildirimleri
- Kullanıcı email değiştirdiğinde
- Yeni email adresine bildirimler gider
- Eski email geçersiz olur

### Session Yönetimi
- Email değiştiğinde session güncellenir
- Kullanıcı çıkış yapması gerekmez
- Next.js middleware session kontrolü

---

## 📝 API Endpoints

### POST /api/auth/change-password
```json
{
  "currentPassword": "1111",
  "newPassword": "NewSecure123!"
}
```

### PATCH /api/profile
```json
{
  "name": "Yeni Ad Soyad",
  "email": "yeni@email.com"
}
```

### GET /api/profile
```json
{
  "id": "user-id",
  "name": "Ad Soyad",
  "email": "email@example.com",
  "role": "USER",
  "createdAt": "2024-12-04T...",
  "_count": {
    "createdTasks": 5,
    "assignedTasks": 3
  }
}
```

---

## ✅ Tamamlanan Özellikler

- [x] Şifre değiştirme
- [x] Email değiştirme
- [x] Ad soyad güncelleme
- [x] İlk giriş uyarısı
- [x] Varsayılan şifre uyarısı
- [x] Form validasyonu
- [x] Başarı/hata mesajları
- [x] Session güncelleme
- [x] Responsive tasarım

---

**© 2024 KOBİNERJİ - Tüm kullanıcılar artık bilgilerini güncelleyebilir! ✅**
