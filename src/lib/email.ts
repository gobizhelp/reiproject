import { Resend } from 'resend';

let resendInstance: Resend | null = null;

export function getResend(): Resend {
  if (!resendInstance) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error('Missing RESEND_API_KEY environment variable');
    }
    resendInstance = new Resend(apiKey);
  }
  return resendInstance;
}

export const EMAIL_FROM = process.env.RESEND_FROM_EMAIL || process.env.EMAIL_FROM || 'REI Reach <noreply@alerts.reireach.com>';
