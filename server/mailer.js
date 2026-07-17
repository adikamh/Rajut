import nodemailer from 'nodemailer'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.resolve(__dirname, '../.env') })

let transporter

async function createTransporter() {
  const host = process.env.SMTP_HOST
  const port = parseInt(process.env.SMTP_PORT) || 587
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS

  if (user && pass) {
    transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass }
    })
    console.log('Nodemailer SMTP Transporter configured.')
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
    from: process.env.SMTP_FROM || 'info@tokorajut.com',
    to: process.env.SMTP_TO || 'info@tokorajut.com',
    subject: `New Contact Us Query from ${name}`,
    text: `You have received a new contact message:\n\nName: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
    html: `
      <h3>New Contact Us Query</h3>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Message:</strong></p>
      <p>${message.replace(/\n/g, '<br>')}</p>
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
