import nodemailer from 'nodemailer'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.resolve(__dirname, '../.env') })

let transporter

async function createTransporter() {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com'
  const port = parseInt(process.env.SMTP_PORT) || 465
  const user = process.env.SMTP_USER
  const pass = (process.env.SMTP_PASS || '').replace(/\s+/g, '')

  if (user && pass) {
    transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass }
    })
    console.log(`Nodemailer SMTP Transporter configured for ${user} via ${host}.`)
  } else {
    console.log('No SMTP credentials found in .env. Falling back to log-only email service.')
    transporter = {
      sendMail: async (mailOptions) => {
        console.log('======== EMAIL SEND SIMULATION ========')
        console.log(`From:    ${mailOptions.from}`)
        console.log(`To:      ${mailOptions.to}`)
        console.log(`Subject: ${mailOptions.subject}`)
        console.log('Body:')
        console.log(mailOptions.text)
        console.log('=======================================')
        return { messageId: 'simulated-id-' + Date.now() }
      }
    }
  }
}

createTransporter()

export async function sendContactEmail({ name, email, message }) {
  const mailOptions = {
    from: `"Toko Rajut Contact" <${process.env.SMTP_FROM || 'haikaladika8@gmail.com'}>`,
    to: process.env.SMTP_TO || 'haikaladika272@gmail.com',
    replyTo: email,
    subject: `Pesan Baru Kontak Toko Rajut dari ${name}`,
    text: `Anda menerima pesan kontak baru dari website Toko Rajut:\n\nNama Pengirim: ${name}\nEmail Pengirim: ${email}\n\nIsi Pesan:\n${message}`,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px; border: 1px solid #e2e8f0; border-radius: 12px;">
        <h2 style="color: #d2691e; margin-bottom: 5px;">🧶 Pesan Baru Kontak Toko Rajut</h2>
        <p style="color: #64748b; font-size: 0.9rem; margin-top: 0;">Ada pesan baru yang masuk melalui formulir website Toko Rajut.</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 15px 0;">
        <p><strong>Nama Pengirim:</strong> ${name}</p>
        <p><strong>Email Pengirim:</strong> <a href="mailto:${email}">${email}</a></p>
        <p><strong>Isi Pesan:</strong></p>
        <div style="background: #fff3eb; padding: 15px; border-left: 4px solid #d2691e; border-radius: 6px; font-size: 0.95rem; color: #1e293b;">
          ${message.replace(/\n/g, '<br>')}
        </div>
        <br>
        <small style="color: #94a3b8; font-size: 0.8rem;">Anda dapat langsung membalas email ini untuk merespons ${name} (${email}).</small>
      </div>
    `
  }

  try {
    const info = await transporter.sendMail(mailOptions)
    console.log(`Email notification sent: ${info.messageId}`)
    return info
  } catch (error) {
    console.error('Failed to send email notification:', error)
    throw error
  }
}

export async function sendOtpEmail({ email, name, otpCode }) {
  const mailOptions = {
    from: `"Toko Rajut Security" <${process.env.SMTP_FROM || 'haikaladika8@gmail.com'}>`,
    to: email,
    subject: `[${otpCode}] Kode OTP Reset Password Toko Rajut`,
    text: `Halo ${name || 'Pengguna'},\n\nKode OTP Anda untuk mereset kata sandi Toko Rajut adalah: ${otpCode}\n\nKode ini berlaku selama 5 menit. Jangan berikan kode ini kepada siapapun.`,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 24px; color: #333; max-width: 520px; border: 1px solid #e2e8f0; border-radius: 16px; background: #ffffff; margin: 0 auto;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="color: #d2691e; margin: 0; font-size: 1.5rem;">🧶 Toko Rajut</h2>
          <p style="color: #64748b; font-size: 0.9rem; margin-top: 4px;">Permintaan Reset Kata Sandi Akun</p>
        </div>
        <div style="background: #fff7ed; border: 1px solid #ffedd5; padding: 20px; border-radius: 12px; text-align: center; margin-bottom: 20px;">
          <p style="font-size: 0.9rem; color: #475569; margin: 0 0 10px 0;">Gunakan kode OTP berikut untuk mengatur ulang kata sandi Anda:</p>
          <div style="font-size: 2.2rem; font-weight: 800; color: #d2691e; letter-spacing: 8px; margin: 10px 0;">
            ${otpCode}
          </div>
          <p style="font-size: 0.8rem; color: #94a3b8; margin: 0;">⏱️ Kode ini berlaku selama <strong>5 menit</strong>.</p>
        </div>
        <p style="font-size: 0.85rem; color: #64748b; line-height: 1.5;">
          Jika Anda tidak melakukan permintaan reset kata sandi, harap abaikan pesan email ini. Keamanan akun Anda adalah prioritas kami.
        </p>
      </div>
    `
  }

  try {
    const info = await transporter.sendMail(mailOptions)
    console.log(`OTP Email sent to ${email}: ${info.messageId}`)
    return info
  } catch (error) {
    console.error('Failed to send OTP email:', error)
    throw error
  }
}
