const escapeHtml = (value: string): string =>
  value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    };

    return entities[character] ?? character;
  });

export interface EmailContent {
  subject: string;
  html: string;
  text: string;
}

export const createWelcomeEmail = (name: string): EmailContent => {
  const safeName = escapeHtml(name);

  return {
    subject: 'Welcome to our platform!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #1F2937;">
        <h2 style="color: #2563EB;">Welcome, ${safeName}!</h2>
        <p>Your account has been created successfully. We're thrilled to have you with us.</p>
        <p>If you have any questions or need assistance, feel free to reply to this email.</p>
        <br/>
        <p style="color: #6B7280; font-size: 13px;">Best regards,<br/>The Team</p>
      </div>
    `,
    text: `Hi ${name},\n\nWelcome! Your account has been created successfully.\n\nBest regards,\nThe Team`,
  };
};

export const createVerificationOtpEmail = (
  name: string,
  otpCode: string,
): EmailContent => {
  const safeName = escapeHtml(name);
  const safeOtp = escapeHtml(otpCode);

  return {
    subject: `${safeOtp} is your verification code`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #1F2937;">
        <h2 style="color: #2563EB;">Email Verification Code</h2>
        <p>Hi ${safeName},</p>
        <p>Your 6-digit email verification code is:</p>
        <div style="background-color: #F3F4F6; padding: 18px; border-radius: 8px; text-align: center; margin: 20px 0;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #111827;">${safeOtp}</span>
        </div>
        <p style="font-size: 14px; color: #4B5563;">This code will expire in 15 minutes. If you did not request this, please ignore this email.</p>
      </div>
    `,
    text: `Hi ${name},\n\nYour verification code is: ${otpCode}\nThis code will expire in 15 minutes.`,
  };
};

export const createPasswordResetEmail = (
  name: string,
  resetToken: string,
): EmailContent => {
  const safeName = escapeHtml(name);
  const safeToken = escapeHtml(resetToken);

  return {
    subject: 'Password Reset Request',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #1F2937;">
        <h2 style="color: #2563EB;">Reset Your Password</h2>
        <p>Hi ${safeName},</p>
        <p>You requested to reset your password. Use the following security token to create a new password:</p>
        <div style="background-color: #F3F4F6; padding: 14px; border-radius: 8px; font-family: monospace; font-size: 16px; margin: 18px 0; word-break: break-all; color: #111827;">
          ${safeToken}
        </div>
        <p style="font-size: 14px; color: #4B5563;">This token will expire in 1 hour. If you did not request a password reset, you can safely ignore this email.</p>
      </div>
    `,
    text: `Hi ${name},\n\nYou requested a password reset. Use this token: ${resetToken}\nThis token will expire in 1 hour.`,
  };
};
