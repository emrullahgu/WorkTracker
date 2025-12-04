import nodemailer from 'nodemailer'

interface SendTaskAssignmentEmailParams {
  to: string
  taskTitle: string
  taskDescription?: string
  assignedBy: string
  taskUrl: string
}

interface SendVerificationEmailParams {
  to: string
  username: string
  verificationCode: string
}

interface SendMentionNotificationParams {
  to: string
  mentionedBy: string
  taskTitle: string
  taskUrl: string
  commentText?: string
}

interface SendNewUserNotificationParams {
  adminEmail: string
  newUserName: string
  newUserEmail: string
  newUserUsername: string
}

interface SendCommentNotificationParams {
  to: string
  commenterName: string
  taskTitle: string
  taskUrl: string
  commentText: string
  notificationType: 'task_owner' | 'assignee' | 'commenter' | 'admin'
}

interface SendEventReminderParams {
  to: string
  eventTitle: string
  eventDescription?: string
  eventStartDate: string
  eventEndDate: string
  eventLocation?: string
  calendarTitle: string
  minutesBefore: number
}

interface SendEventInvitationParams {
  to: string
  eventTitle: string
  eventDescription?: string
  eventStartDate: string
  eventEndDate: string
  eventLocation?: string
  invitedBy: string
  calendarTitle: string
}

// Ücretsiz email transporter (Gmail, Outlook, vb.)
const createTransporter = () => {
  // Gmail için örnek yapılandırma
  // Diğer servisler için: https://nodemailer.com/smtp/well-known/
  
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn('Email yapılandırması eksik. Bildirimler gönderilmeyecek.')
    return null
  }

  return nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS, // Gmail için App Password kullanın
    },
  })
}

export async function sendTaskAssignmentEmail({
  to,
  taskTitle,
  taskDescription,
  assignedBy,
  taskUrl,
}: SendTaskAssignmentEmailParams) {
  try {
    const transporter = createTransporter()
    
    if (!transporter) {
      console.log('Email transporter yapılandırılmamış, bildirim gönderilmedi')
      return { success: false, error: 'Email yapılandırması eksik' }
    }

    const mailOptions = {
      from: `"Görev Takip Sistemi" <${process.env.EMAIL_USER}>`,
      to,
      subject: `Yeni Görev Atandı: ${taskTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">🎯 Yeni Görev Atandı</h1>
          </div>
          
          <div style="background-color: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
            <p style="color: #374151; font-size: 16px; margin-bottom: 20px;">Merhaba,</p>
            
            <p style="color: #374151; font-size: 16px; margin-bottom: 25px;">
              <strong style="color: #667eea;">${assignedBy}</strong> tarafından size yeni bir görev atandı:
            </p>
            
            <div style="background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%); padding: 25px; border-radius: 10px; margin: 25px 0; border-left: 4px solid #667eea;">
              <h2 style="color: #1f2937; margin: 0 0 15px 0; font-size: 20px;">${taskTitle}</h2>
              ${taskDescription ? `<p style="color: #4b5563; margin: 0; line-height: 1.6;">${taskDescription}</p>` : ''}
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${taskUrl}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(102, 126, 234, 0.3);">
                Görevi Görüntüle →
              </a>
            </div>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              <p style="color: #9ca3af; font-size: 13px; margin: 0; line-height: 1.6;">
                Bu otomatik bir bildirimdir. Lütfen bu e-postayı yanıtlamayın.<br>
                © ${new Date().getFullYear()} Görev Takip Sistemi. Tüm hakları saklıdır.
              </p>
            </div>
          </div>
        </div>
      `,
    }

    const info = await transporter.sendMail(mailOptions)

    console.log('Email gönderildi:', info.messageId)
    return { success: true, data: info }
  } catch (error) {
    console.error('Email gönderme hatası:', error)
    return { success: false, error }
  }
}

// Doğrulama kodu gönder
export async function sendVerificationEmail({
  to,
  username,
  verificationCode,
}: SendVerificationEmailParams) {
  try {
    const transporter = createTransporter()
    
    if (!transporter) {
      return { success: false, error: 'Email yapılandırması eksik' }
    }

    const mailOptions = {
      from: `"KOBİNERJİ Görev Takip" <${process.env.EMAIL_USER}>`,
      to,
      subject: '🔐 Email Doğrulama Kodu - KOBİNERJİ',
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: #f9fafb;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 700;">KOBİNERJİ</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 14px;">Görev Takip Sistemi</p>
          </div>
          
          <div style="padding: 40px 30px; background: white;">
            <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px;">Hoş Geldin, ${username}! 👋</h2>
            
            <p style="color: #4b5563; line-height: 1.8; margin: 0 0 25px 0; font-size: 16px;">
              KOBİNERJİ Görev Takip Sistemine kayıt olduğun için teşekkürler! Email adresini doğrulamak için aşağıdaki kodu kullan:
            </p>
            
            <div style="background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%); padding: 30px; border-radius: 10px; margin: 25px 0; text-align: center; border: 2px dashed #667eea;">
              <p style="color: #6b7280; margin: 0 0 15px 0; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Doğrulama Kodu</p>
              <div style="font-size: 36px; font-weight: 700; color: #667eea; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                ${verificationCode}
              </div>
              <p style="color: #9ca3af; margin: 15px 0 0 0; font-size: 13px;">Kod 15 dakika geçerlidir</p>
            </div>
            
            <div style="background: #fef3c7; padding: 15px; border-radius: 8px; border-left: 4px solid #f59e0b; margin: 25px 0;">
              <p style="color: #92400e; margin: 0; font-size: 14px; line-height: 1.6;">
                ⚠️ <strong>Güvenlik Uyarısı:</strong> Bu kodu kimseyle paylaşma. KOBİNERJİ ekibi asla bu kodu senden istemez.
              </p>
            </div>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              <p style="color: #9ca3af; font-size: 13px; margin: 0; line-height: 1.6;">
                Bu e-postayı sen talep etmediysen güvenle görmezden gelebilirsin.<br>
                © ${new Date().getFullYear()} KOBİNERJİ. Tüm hakları saklıdır.
              </p>
            </div>
          </div>
        </div>
      `,
    }

    const info = await transporter.sendMail(mailOptions)
    console.log('Doğrulama kodu gönderildi:', info.messageId)
    return { success: true, data: info }
  } catch (error) {
    console.error('Doğrulama email hatası:', error)
    return { success: false, error }
  }
}

// Mention bildirimi gönder
export async function sendMentionNotification({
  to,
  mentionedBy,
  taskTitle,
  taskUrl,
  commentText,
}: SendMentionNotificationParams) {
  try {
    const transporter = createTransporter()
    
    if (!transporter) {
      return { success: false, error: 'Email yapılandırması eksik' }
    }

    const mailOptions = {
      from: `"KOBİNERJİ Görev Takip" <${process.env.EMAIL_USER}>`,
      to,
      subject: `🔔 ${mentionedBy} seni etiketledi - KOBİNERJİ`,
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: #f9fafb;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 700;">KOBİNERJİ</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 14px;">Görev Takip Sistemi</p>
          </div>
          
          <div style="padding: 40px 30px; background: white;">
            <div style="background: #dbeafe; padding: 20px; border-radius: 10px; margin: 0 0 25px 0; text-align: center; border-left: 4px solid #3b82f6;">
              <p style="color: #1e40af; margin: 0; font-size: 18px; font-weight: 600;">
                👤 ${mentionedBy} seni bir görevde etiketledi!
              </p>
            </div>
            
            <p style="color: #4b5563; line-height: 1.8; margin: 0 0 20px 0; font-size: 16px;">
              Bir görevde senin ilgini çekebilecek bir yorum yapıldı:
            </p>
            
            <div style="background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%); padding: 25px; border-radius: 10px; margin: 25px 0; border-left: 4px solid #667eea;">
              <h3 style="color: #1f2937; margin: 0 0 15px 0; font-size: 18px;">📋 ${taskTitle}</h3>
              ${commentText ? `
              <div style="background: white; padding: 15px; border-radius: 8px; margin-top: 15px;">
                <p style="color: #4b5563; margin: 0; line-height: 1.6; font-style: italic;">"${commentText}"</p>
              </div>
              ` : ''}
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${taskUrl}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(102, 126, 234, 0.3);">
                Göreve Git →
              </a>
            </div>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              <p style="color: #9ca3af; font-size: 13px; margin: 0; line-height: 1.6;">
                Bu otomatik bir bildirimdir. Lütfen bu e-postayı yanıtlamayın.<br>
                © ${new Date().getFullYear()} KOBİNERJİ. Tüm hakları saklıdır.
              </p>
            </div>
          </div>
        </div>
      `,
    }

    const info = await transporter.sendMail(mailOptions)
    console.log('Mention bildirimi gönderildi:', info.messageId)
    return { success: true, data: info }
  } catch (error) {
    console.error('Mention email hatası:', error)
    return { success: false, error }
  }
}

// Admin'e yeni kullanıcı bildirimi gönder
export async function sendNewUserNotification({
  adminEmail,
  newUserName,
  newUserEmail,
  newUserUsername,
}: SendNewUserNotificationParams) {
  try {
    const transporter = createTransporter()
    
    if (!transporter) {
      return { success: false, error: 'Email yapılandırması eksik' }
    }

    const mailOptions = {
      from: `"KOBİNERJİ Görev Takip" <${process.env.EMAIL_USER}>`,
      to: adminEmail,
      subject: '🎉 Yeni Kullanıcı Kaydı - KOBİNERJİ',
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: #f9fafb;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 700;">KOBİNERJİ</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 14px;">Görev Takip Sistemi</p>
          </div>
          
          <div style="padding: 40px 30px; background: white;">
            <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 20px; border-radius: 10px; margin: 0 0 25px 0; text-align: center;">
              <p style="color: white; margin: 0; font-size: 20px; font-weight: 700;">
                🎉 Yeni Kullanıcı Kaydı!
              </p>
            </div>
            
            <p style="color: #4b5563; line-height: 1.8; margin: 0 0 25px 0; font-size: 16px;">
              Sisteme yeni bir kullanıcı kaydoldu:
            </p>
            
            <div style="background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%); padding: 25px; border-radius: 10px; margin: 25px 0; border-left: 4px solid #10b981;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 10px 0; color: #6b7280; font-weight: 600;">👤 Ad Soyad:</td>
                  <td style="padding: 10px 0; color: #1f2937; font-weight: 700;">${newUserName}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; color: #6b7280; font-weight: 600;">🏷️ Kullanıcı Adı:</td>
                  <td style="padding: 10px 0; color: #667eea; font-weight: 700; font-family: monospace;">@${newUserUsername}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; color: #6b7280; font-weight: 600;">✉️ Email:</td>
                  <td style="padding: 10px 0; color: #1f2937; font-weight: 700;">${newUserEmail}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; color: #6b7280; font-weight: 600;">📅 Kayıt Tarihi:</td>
                  <td style="padding: 10px 0; color: #1f2937;">${new Date().toLocaleString('tr-TR', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}</td>
                </tr>
              </table>
            </div>
            
            <div style="background: #dbeafe; padding: 15px; border-radius: 8px; border-left: 4px solid #3b82f6; margin: 25px 0;">
              <p style="color: #1e40af; margin: 0; font-size: 14px; line-height: 1.6;">
                ℹ️ <strong>Bilgi:</strong> Kullanıcı email adresini doğruladı ve sisteme giriş yapabilir.
              </p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXTAUTH_URL}/dashboard" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(102, 126, 234, 0.3);">
                Dashboard'a Git →
              </a>
            </div>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              <p style="color: #9ca3af; font-size: 13px; margin: 0; line-height: 1.6;">
                Bu otomatik bir bildirimdir. Lütfen bu e-postayı yanıtlamayın.<br>
                © ${new Date().getFullYear()} KOBİNERJİ. Tüm hakları saklıdır.
              </p>
            </div>
          </div>
        </div>
      `,
    }

    const info = await transporter.sendMail(mailOptions)
    console.log('Admin bildirimi gönderildi:', info.messageId)
    return { success: true, data: info }
  } catch (error) {
    console.error('Admin bildirim hatası:', error)
    return { success: false, error }
  }
}

// Yorum bildirimi gönder
export async function sendCommentNotification({
  to,
  commenterName,
  taskTitle,
  taskUrl,
  commentText,
  notificationType,
}: SendCommentNotificationParams) {
  try {
    const transporter = createTransporter()
    
    if (!transporter) {
      return { success: false, error: 'Email yapılandırması eksik' }
    }

    // Bildirim tipine göre başlık ve mesaj
    const notificationMessages = {
      task_owner: {
        subject: '💬 Görevinize Yeni Yorum - KOBİNERJİ',
        title: 'Görevinize Yorum Yapıldı',
        icon: '💬',
        message: `<strong>${commenterName}</strong>, oluşturduğunuz <strong>"${taskTitle}"</strong> görevine yorum yaptı.`,
        badge: 'Görev Sahibi',
        badgeColor: '#10b981',
      },
      assignee: {
        subject: '💬 Size Atanan Göreve Yorum - KOBİNERJİ',
        title: 'Size Atanan Göreve Yorum',
        icon: '💬',
        message: `<strong>${commenterName}</strong>, size atanan <strong>"${taskTitle}"</strong> görevine yorum yaptı.`,
        badge: 'Atanan Kişi',
        badgeColor: '#3b82f6',
      },
      commenter: {
        subject: '💬 Yorum Yaptığınız Görevde Yeni Yorum - KOBİNERJİ',
        title: 'Yorum Yaptığınız Görevde Aktivite',
        icon: '💬',
        message: `<strong>${commenterName}</strong>, daha önce yorum yaptığınız <strong>"${taskTitle}"</strong> görevine yeni yorum yaptı.`,
        badge: 'Yorumcu',
        badgeColor: '#8b5cf6',
      },
      admin: {
        subject: '💬 Yeni Yorum Bildirimi - KOBİNERJİ',
        title: 'Yeni Yorum Yapıldı',
        icon: '👀',
        message: `<strong>${commenterName}</strong>, <strong>"${taskTitle}"</strong> görevine yorum yaptı.`,
        badge: 'Admin',
        badgeColor: '#f59e0b',
      },
    }

    const config = notificationMessages[notificationType]

    const mailOptions = {
      from: `"KOBİNERJİ Görev Takip" <${process.env.EMAIL_USER}>`,
      to,
      subject: config.subject,
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: #f9fafb;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 700;">KOBİNERJİ</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 14px;">Görev Takip Sistemi</p>
          </div>
          
          <div style="padding: 40px 30px; background: white;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 10px; margin: 0 0 25px 0; text-align: center;">
              <p style="color: white; margin: 0; font-size: 20px; font-weight: 700;">
                ${config.icon} ${config.title}
              </p>
            </div>
            
            <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid ${config.badgeColor};">
              <span style="display: inline-block; background: ${config.badgeColor}; color: white; padding: 4px 12px; border-radius: 12px; font-size: 11px; font-weight: 600; margin-bottom: 12px;">
                ${config.badge}
              </span>
              <p style="color: #1e293b; line-height: 1.6; margin: 0; font-size: 15px;">
                ${config.message}
              </p>
            </div>
            
            <div style="background: #f8fafc; padding: 20px; border-radius: 10px; margin: 25px 0; border: 1px solid #e2e8f0;">
              <h3 style="margin: 0 0 15px 0; color: #334155; font-size: 16px; font-weight: 600;">📝 Görev Detayı</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Görev:</td>
                  <td style="padding: 8px 0; color: #1e293b; font-weight: 600; font-size: 14px;">${taskTitle}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Yorumlayan:</td>
                  <td style="padding: 8px 0; color: #1e293b; font-weight: 600; font-size: 14px;">${commenterName}</td>
                </tr>
              </table>
            </div>
            
            <div style="background: linear-gradient(135deg, #fefce8 0%, #fef9c3 100%); padding: 20px; border-radius: 10px; margin: 25px 0; border-left: 4px solid #eab308;">
              <h4 style="margin: 0 0 10px 0; color: #854d0e; font-size: 14px; font-weight: 600;">💬 Yorum İçeriği:</h4>
              <p style="color: #713f12; margin: 0; font-size: 14px; line-height: 1.6; white-space: pre-wrap; word-wrap: break-word;">
                ${commentText}
              </p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${taskUrl}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(102, 126, 234, 0.3);">
                Görevi Görüntüle →
              </a>
            </div>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              <p style="color: #9ca3af; font-size: 13px; margin: 0; line-height: 1.6;">
                Bu otomatik bir bildirimdir. Lütfen bu e-postayı yanıtlamayın.<br>
                © ${new Date().getFullYear()} KOBİNERJİ. Tüm hakları saklıdır.
              </p>
            </div>
          </div>
        </div>
      `,
    }

    const info = await transporter.sendMail(mailOptions)
    console.log(`Yorum bildirimi gönderildi (${notificationType}):`, info.messageId)
    return { success: true, data: info }
  } catch (error) {
    console.error('Yorum bildirim hatası:', error)
    return { success: false, error }
  }
}

// Etkinlik hatırlatması gönder
export async function sendEventReminder({
  to,
  eventTitle,
  eventDescription,
  eventStartDate,
  eventEndDate,
  eventLocation,
  calendarTitle,
  minutesBefore,
}: SendEventReminderParams) {
  try {
    const transporter = createTransporter()
    
    if (!transporter) {
      return { success: false, error: 'Email yapılandırması eksik' }
    }

    const mailOptions = {
      from: `"KOBİNERJİ Takvim" <${process.env.EMAIL_USER}>`,
      to,
      subject: `⏰ Etkinlik Hatırlatması: ${eventTitle} - KOBİNERJİ`,
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: #f9fafb;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 700;">KOBİNERJİ</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 14px;">Takvim & Etkinlik Sistemi</p>
          </div>
          
          <div style="padding: 40px 30px; background: white;">
            <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 20px; border-radius: 10px; margin: 0 0 25px 0; text-align: center;">
              <p style="color: white; margin: 0; font-size: 20px; font-weight: 700;">
                ⏰ Etkinlik ${minutesBefore} Dakika Sonra Başlıyor!
              </p>
            </div>
            
            <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); padding: 25px; border-radius: 10px; margin: 25px 0; border-left: 4px solid #f59e0b;">
              <h2 style="margin: 0 0 15px 0; color: #92400e; font-size: 22px; font-weight: 700;">
                📅 ${eventTitle}
              </h2>
              ${eventDescription ? `
                <p style="color: #78350f; margin: 10px 0; font-size: 15px; line-height: 1.6;">
                  ${eventDescription}
                </p>
              ` : ''}
            </div>
            
            <div style="background: #f8fafc; padding: 20px; border-radius: 10px; margin: 25px 0; border: 1px solid #e2e8f0;">
              <h3 style="margin: 0 0 15px 0; color: #334155; font-size: 16px; font-weight: 600;">📋 Etkinlik Detayları</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #64748b; font-size: 14px; font-weight: 600;">📌 Takvim:</td>
                  <td style="padding: 8px 0; color: #1e293b; font-weight: 700; font-size: 14px;">${calendarTitle}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #64748b; font-size: 14px; font-weight: 600;">🕐 Başlangıç:</td>
                  <td style="padding: 8px 0; color: #1e293b; font-weight: 700; font-size: 14px;">${new Date(eventStartDate).toLocaleString('tr-TR', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #64748b; font-size: 14px; font-weight: 600;">🕐 Bitiş:</td>
                  <td style="padding: 8px 0; color: #1e293b; font-weight: 700; font-size: 14px;">${new Date(eventEndDate).toLocaleString('tr-TR', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}</td>
                </tr>
                ${eventLocation ? `
                  <tr>
                    <td style="padding: 8px 0; color: #64748b; font-size: 14px; font-weight: 600;">📍 Konum:</td>
                    <td style="padding: 8px 0; color: #1e293b; font-weight: 700; font-size: 14px;">${eventLocation}</td>
                  </tr>
                ` : ''}
              </table>
            </div>
            
            <div style="background: #dbeafe; padding: 15px; border-radius: 8px; border-left: 4px solid #3b82f6; margin: 25px 0;">
              <p style="color: #1e40af; margin: 0; font-size: 14px; line-height: 1.6; font-weight: 600;">
                ⏰ <strong>Hatırlatma:</strong> Bu etkinlik ${minutesBefore} dakika içinde başlayacak. Hazırlanmanız için size hatırlatma gönderiyoruz!
              </p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXTAUTH_URL}/dashboard/calendar" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(102, 126, 234, 0.3);">
                Takvimi Görüntüle →
              </a>
            </div>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              <p style="color: #9ca3af; font-size: 13px; margin: 0; line-height: 1.6;">
                Bu otomatik bir hatırlatmadır. Lütfen bu e-postayı yanıtlamayın.<br>
                © ${new Date().getFullYear()} KOBİNERJİ. Tüm hakları saklıdır.
              </p>
            </div>
          </div>
        </div>
      `,
    }

    const info = await transporter.sendMail(mailOptions)
    console.log('Etkinlik hatırlatması gönderildi:', info.messageId)
    return { success: true, data: info }
  } catch (error) {
    console.error('Etkinlik hatırlatma hatası:', error)
    return { success: false, error }
  }
}

// Etkinlik daveti gönder
export async function sendEventInvitation({
  to,
  eventTitle,
  eventDescription,
  eventStartDate,
  eventEndDate,
  eventLocation,
  invitedBy,
  calendarTitle,
}: SendEventInvitationParams) {
  try {
    const transporter = createTransporter()
    
    if (!transporter) {
      return { success: false, error: 'Email yapılandırması eksik' }
    }

    const mailOptions = {
      from: `"KOBİNERJİ Takvim" <${process.env.EMAIL_USER}>`,
      to,
      subject: `📅 Etkinlik Daveti: ${eventTitle} - KOBİNERJİ`,
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: #f9fafb;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 700;">KOBİNERJİ</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 14px;">Takvim & Etkinlik Sistemi</p>
          </div>
          
          <div style="padding: 40px 30px; background: white;">
            <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 20px; border-radius: 10px; margin: 0 0 25px 0; text-align: center;">
              <p style="color: white; margin: 0; font-size: 20px; font-weight: 700;">
                📅 Yeni Etkinlik Daveti!
              </p>
            </div>
            
            <p style="color: #4b5563; line-height: 1.8; margin: 0 0 25px 0; font-size: 16px; font-weight: 600;">
              <strong>${invitedBy}</strong>, sizi bir etkinliğe davet etti:
            </p>
            
            <div style="background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%); padding: 25px; border-radius: 10px; margin: 25px 0; border-left: 4px solid #3b82f6;">
              <h2 style="margin: 0 0 15px 0; color: #1e40af; font-size: 22px; font-weight: 700;">
                📅 ${eventTitle}
              </h2>
              ${eventDescription ? `
                <p style="color: #1e3a8a; margin: 10px 0; font-size: 15px; line-height: 1.6;">
                  ${eventDescription}
                </p>
              ` : ''}
            </div>
            
            <div style="background: #f8fafc; padding: 20px; border-radius: 10px; margin: 25px 0; border: 1px solid #e2e8f0;">
              <h3 style="margin: 0 0 15px 0; color: #334155; font-size: 16px; font-weight: 600;">📋 Etkinlik Detayları</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #64748b; font-size: 14px; font-weight: 600;">📌 Takvim:</td>
                  <td style="padding: 8px 0; color: #1e293b; font-weight: 700; font-size: 14px;">${calendarTitle}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #64748b; font-size: 14px; font-weight: 600;">👤 Davet Eden:</td>
                  <td style="padding: 8px 0; color: #1e293b; font-weight: 700; font-size: 14px;">${invitedBy}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #64748b; font-size: 14px; font-weight: 600;">🕐 Başlangıç:</td>
                  <td style="padding: 8px 0; color: #1e293b; font-weight: 700; font-size: 14px;">${new Date(eventStartDate).toLocaleString('tr-TR', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #64748b; font-size: 14px; font-weight: 600;">🕐 Bitiş:</td>
                  <td style="padding: 8px 0; color: #1e293b; font-weight: 700; font-size: 14px;">${new Date(eventEndDate).toLocaleString('tr-TR', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}</td>
                </tr>
                ${eventLocation ? `
                  <tr>
                    <td style="padding: 8px 0; color: #64748b; font-size: 14px; font-weight: 600;">📍 Konum:</td>
                    <td style="padding: 8px 0; color: #1e293b; font-weight: 700; font-size: 14px;">${eventLocation}</td>
                  </tr>
                ` : ''}
              </table>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXTAUTH_URL}/dashboard/calendar" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(102, 126, 234, 0.3);">
                Takvimi Görüntüle →
              </a>
            </div>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              <p style="color: #9ca3af; font-size: 13px; margin: 0; line-height: 1.6;">
                Bu otomatik bir bildirimdir. Lütfen bu e-postayı yanıtlamayın.<br>
                © ${new Date().getFullYear()} KOBİNERJİ. Tüm hakları saklıdır.
              </p>
            </div>
          </div>
        </div>
      `,
    }

    const info = await transporter.sendMail(mailOptions)
    console.log('Etkinlik daveti gönderildi:', info.messageId)
    return { success: true, data: info }
  } catch (error) {
    console.error('Etkinlik davet hatası:', error)
    return { success: false, error }
  }
}

// Şifre sıfırlama email'i gönder
export interface SendPasswordResetParams {
  to: string
  userName: string
  resetToken: string
}

export async function sendPasswordResetEmail({
  to,
  userName,
  resetToken,
}: SendPasswordResetParams) {
  try {
    const transporter = createTransporter()
    
    if (!transporter) {
      return { success: false, error: 'Email yapılandırması eksik' }
    }

    const mailOptions = {
      from: `"KOBİNERJİ Güvenlik" <${process.env.EMAIL_USER}>`,
      to,
      subject: `🔐 Şifre Sıfırlama Kodu - KOBİNERJİ`,
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: #f9fafb;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 700;">KOBİNERJİ</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 14px;">Görev Takip Sistemi</p>
          </div>
          
          <div style="padding: 40px 30px; background: white;">
            <div style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 20px; border-radius: 10px; margin: 0 0 25px 0; text-align: center;">
              <p style="color: white; margin: 0; font-size: 20px; font-weight: 700;">
                🔐 Şifre Sıfırlama Talebi
              </p>
            </div>
            
            <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
              Merhaba <strong>${userName}</strong>,
            </p>
            
            <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 25px 0;">
              Hesabınız için şifre sıfırlama talebinde bulundunuz. Aşağıdaki 6 haneli kodu kullanarak şifrenizi sıfırlayabilirsiniz:
            </p>
            
            <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); padding: 30px; border-radius: 10px; margin: 25px 0; text-align: center; border: 3px dashed #f59e0b;">
              <p style="color: #92400e; margin: 0 0 10px 0; font-size: 14px; font-weight: 600;">
                ŞİFRE SIFIRLAMA KODU
              </p>
              <p style="color: #78350f; margin: 0; font-size: 42px; font-weight: 700; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                ${resetToken}
              </p>
            </div>
            
            <div style="background: #fef2f2; padding: 20px; border-radius: 10px; margin: 25px 0; border-left: 4px solid #ef4444;">
              <p style="color: #991b1b; margin: 0; font-size: 14px; font-weight: 600;">
                ⚠️ Güvenlik Uyarısı
              </p>
              <p style="color: #7f1d1d; margin: 10px 0 0 0; font-size: 13px; line-height: 1.5;">
                • Bu kod <strong>15 dakika</strong> süreyle geçerlidir<br/>
                • Bu talebi siz yapmadıysanız, bu email'i görmezden gelebilirsiniz<br/>
                • Kodunuzu kimseyle paylaşmayın<br/>
                • Şüpheli bir durum varsa hemen yöneticinizle iletişime geçin
              </p>
            </div>
            
            <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 25px 0 0 0; text-align: center; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              Bu email otomatik olarak gönderilmiştir. Lütfen yanıtlamayın.
            </p>
          </div>
          
          <div style="background: #1f2937; padding: 30px; text-align: center;">
            <p style="color: #9ca3af; margin: 0; font-size: 13px;">
              © 2025 KOBİNERJİ - Tüm hakları saklıdır
            </p>
            <p style="color: #6b7280; margin: 10px 0 0 0; font-size: 12px;">
              Görev Takip & Proje Yönetim Sistemi
            </p>
          </div>
        </div>
      `,
    }

    const info = await transporter.sendMail(mailOptions)
    console.log('Şifre sıfırlama email\'i gönderildi:', info.messageId)
    return { success: true, data: info }
  } catch (error) {
    console.error('Şifre sıfırlama email hatası:', error)
    return { success: false, error }
  }
}
