# KOBİNERJİ Deployment Script
# Bu script projeyi GitHub'a yükler ve Vercel'e deploy eder

Write-Host "🚀 KOBINERJI GÖREV TAKIP SISTEMI - DEPLOYMENT BAŞLIYOR..." -ForegroundColor Cyan
Write-Host ""

# 1. Git başlat
Write-Host "📦 Git repository hazırlanıyor..." -ForegroundColor Yellow
if (Test-Path .git) {
    Write-Host "✅ Git zaten başlatılmış" -ForegroundColor Green
} else {
    git init
    Write-Host "✅ Git başlatıldı" -ForegroundColor Green
}

# 2. Dosyaları stage'e al
Write-Host ""
Write-Host "📝 Dosyalar Git'e ekleniyor..." -ForegroundColor Yellow
git add .
Write-Host "✅ Dosyalar eklendi" -ForegroundColor Green

# 3. Commit
Write-Host ""
Write-Host "💾 Commit oluşturuluyor..." -ForegroundColor Yellow
git commit -m "Kobinerji Görev Takip Sistemi v1.0 - Production Ready"
Write-Host "✅ Commit oluşturuldu" -ForegroundColor Green

# 4. Branch ayarla
Write-Host ""
Write-Host "🌿 Branch main olarak ayarlanıyor..." -ForegroundColor Yellow
git branch -M main
Write-Host "✅ Branch ayarlandı" -ForegroundColor Green

# 5. GitHub remote ekle
Write-Host ""
Write-Host "🔗 GitHub repository URL'si girin:" -ForegroundColor Cyan
Write-Host "   Örnek: https://github.com/kullaniciadi/kobinerji-gorev-takip.git" -ForegroundColor Gray
$repoUrl = Read-Host "   URL"

if ($repoUrl) {
    try {
        git remote add origin $repoUrl
        Write-Host "✅ GitHub remote eklendi" -ForegroundColor Green
    } catch {
        Write-Host "⚠️  Remote zaten var veya hata oluştu" -ForegroundColor Yellow
        git remote set-url origin $repoUrl
        Write-Host "✅ GitHub remote güncellendi" -ForegroundColor Green
    }
    
    # 6. Push
    Write-Host ""
    Write-Host "⬆️  GitHub'a yükleniyor..." -ForegroundColor Yellow
    git push -u origin main
    Write-Host "✅ Kod GitHub'a yüklendi!" -ForegroundColor Green
} else {
    Write-Host "⚠️  GitHub URL girilmedi, push atlanıyor" -ForegroundColor Yellow
}

# 7. Vercel bilgileri
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "🎉 GIT HAZIRLIĞI TAMAMLANDI!" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 SONRAKI ADIMLAR:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1️⃣  Vercel'e Git:" -ForegroundColor White
Write-Host "   🔗 https://vercel.com/new" -ForegroundColor Cyan
Write-Host ""
Write-Host "2️⃣  'Import Git Repository' tıklayın" -ForegroundColor White
Write-Host ""
Write-Host "3️⃣  Repository'nizi seçin" -ForegroundColor White
Write-Host ""
Write-Host "4️⃣  Environment Variables ekleyin:" -ForegroundColor White
Write-Host "   NEXTAUTH_URL=https://your-domain.vercel.app" -ForegroundColor Gray
Write-Host "   NEXTAUTH_SECRET=your-secret-min-32-chars" -ForegroundColor Gray
Write-Host "   DATABASE_URL=file:./prod.db" -ForegroundColor Gray
Write-Host "   EMAIL_SERVICE=gmail" -ForegroundColor Gray
Write-Host "   EMAIL_USER=your-email@gmail.com" -ForegroundColor Gray
Write-Host "   EMAIL_PASS=your-app-password" -ForegroundColor Gray
Write-Host ""
Write-Host "5️⃣  'Deploy' butonuna tıklayın" -ForegroundColor White
Write-Host ""
Write-Host "6️⃣  2-3 dakika bekleyin..." -ForegroundColor White
Write-Host ""
Write-Host "✅ Siteniz hazır!" -ForegroundColor Green
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "📚 Detaylı bilgi için: DEPLOYMENT.md" -ForegroundColor Yellow
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# 8. Kullanıcı bilgileri hatırlatma
Write-Host "👥 KULLANICI BİLGİLERİ (KOBINERJI.md dosyasında):" -ForegroundColor Magenta
Write-Host ""
Write-Host "Admin:" -ForegroundColor White
Write-Host "  📧 emrullahgunayy@gmail.com" -ForegroundColor Gray
Write-Host "  🔑 Eg8502Eg." -ForegroundColor Gray
Write-Host ""
Write-Host "Ekip Üyeleri:" -ForegroundColor White
Write-Host "  📧 [isim].[soyisim]@kobinerji.com" -ForegroundColor Gray
Write-Host "  🔑 Kobinerji2025!" -ForegroundColor Gray
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
