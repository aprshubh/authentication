import { env } from '../config/env.js';
import {
  createPasswordResetEmail,
  createVerificationOtpEmail,
  createWelcomeEmail,
  type EmailContent,
} from './mail.templates.js';

interface SendEmailOptions extends EmailContent {
  to: string;
}

interface ResendEmailResponse {
  id: string;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const getResendErrorMessage = (payload: unknown): string | undefined => {
  if (isRecord(payload) && typeof payload.message === 'string') {
    return payload.message;
  }
  return undefined;
};

export const sendEmail = async ({
  to,
  subject,
  html,
  text,
}: SendEmailOptions): Promise<ResendEmailResponse> => {
  const apiKey = env.RESEND_API_KEY;
  const from = env.RESEND_FROM_EMAIL || 'Auth App <noreply@resend.dev>';

  if (!apiKey) {
    console.warn(
      `[MailService Mock/Warning] Email to ${to} not dispatched because RESEND_API_KEY is not configured.`
    );
    return { id: 'mock-email-id' };
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from, to, subject, html, text }),
  });

  const responseBody = await response.text();
  let payload: unknown;

  try {
    payload = JSON.parse(responseBody) as unknown;
  } catch {
    payload = undefined;
  }

  if (!response.ok) {
    const detail =
      getResendErrorMessage(payload) || response.statusText || 'Unknown provider error';
    throw new Error(`Resend request failed (${response.status}): ${detail}`);
  }

  if (!isRecord(payload) || typeof payload.id !== 'string') {
    throw new Error('Resend returned a successful response without an email ID.');
  }

  return { id: payload.id };
};

export const sendWelcomeEmail = (to: string, name: string) =>
  sendEmail({ to, ...createWelcomeEmail(name) });

export const sendVerificationOtpEmail = (
  to: string,
  name: string,
  otpCode: string,
) => sendEmail({ to, ...createVerificationOtpEmail(name, otpCode) });

export const sendPasswordResetEmail = (
  to: string,
  name: string,
  resetToken: string,
) => sendEmail({ to, ...createPasswordResetEmail(name, resetToken) });
