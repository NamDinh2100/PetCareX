import { transporter } from '../config/email.js';

export function generatePassword(length = 10) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += chars[Math.floor(Math.random() * chars.length)];
  }
  return password;
}

export async function sendEmail(to, subject, text) {
    const mailOptions = {
        from: `"SUPPORT PETCARE" <${process.env.EMAIL_USER}>`,
        to: to,
        subject: subject,
        text: text,
    };

    return transporter.sendMail(mailOptions);
}