import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const host = process.env.SMTP_HOST;
const port = parseInt(process.env.SMTP_PORT || '587', 10);
const user = process.env.SMTP_USER;
const pass = process.env.SMTP_PASS;
const fromEmail = process.env.SMTP_FROM || user;
const fromName = process.env.SMTP_FROM_NAME || 'ServicePulse';

const isConfigured = !!(host && user && pass);

const transporter = isConfigured
  ? nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    })
  : null;

export interface SendEmailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

/**
 * Send an email
 * @returns { success: boolean, error?: string }
 */
export async function sendEmail(options: SendEmailOptions): Promise<{ success: boolean; error?: string }> {
  if (!transporter || !isConfigured) {
    console.warn('Email not configured. Running in pilot mode.');
    console.log(`[PILOT EMAIL] To: ${options.to}, Subject: ${options.subject}`);
    console.log(`  Body: ${options.text}`);
    return { success: true };
  }

  try {
    await transporter.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html || options.text.replace(/\n/g, '<br>'),
    });
    return { success: true };
  } catch (error: any) {
    console.error('Email sending error:', error);
    return { success: false, error: error.message };
  }
}
