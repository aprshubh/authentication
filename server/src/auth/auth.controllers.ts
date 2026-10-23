import bcrypt from 'bcryptjs';
import { randomInt } from 'node:crypto';
import type { RequestHandler } from 'express';
import { env } from '../config/env.js';
import {
  sendPasswordResetEmail,
  sendVerificationOtpEmail,
  sendWelcomeEmail,
} from '../mailservice/mail.service.js';
import { User } from './auth.models.js';
import type {
  ForgotPasswordInput,
  LoginInput,
  RegisterInput,
  ResetPasswordInput,
} from './auth.schemas.js';
import {
  generateAccessToken,
  generateRandomToken,
  generateRefreshToken,
  hashToken,
  verifyRefreshToken,
} from './auth.services.js';
import type { AuthenticatedRequest } from './auth.middleware.js';

const SALT_ROUNDS = 12;
const REFRESH_TOKEN_MAX_AGE = 7 * 24 * 60 * 60 * 1000;
const RESET_TOKEN_EXPIRY = 60 * 60 * 1000; // 1 hour
const VERIFICATION_EMAIL_WINDOW = 60 * 60 * 1000;
const VERIFICATION_EMAIL_MIN_INTERVAL = 60 * 1000;
const MAX_VERIFICATION_EMAILS_PER_HOUR = 5;

const reserveVerificationEmailSlot = (user: InstanceType<typeof User>): boolean => {
  const now = Date.now();
  const windowStart = user.verificationSentWindowStart?.getTime();

  if (!windowStart || now - windowStart >= VERIFICATION_EMAIL_WINDOW) {
    user.verificationSentWindowStart = new Date(now);
    user.verificationSentCount = 0;
  }

  if (
    user.verificationLastSentAt &&
    now - user.verificationLastSentAt.getTime() < VERIFICATION_EMAIL_MIN_INTERVAL
  ) {
    return false;
  }

  if ((user.verificationSentCount ?? 0) >= MAX_VERIFICATION_EMAILS_PER_HOUR) {
    return false;
  }

  user.verificationLastSentAt = new Date(now);
  user.verificationSentCount = (user.verificationSentCount ?? 0) + 1;
  return true;
};

export const registerUser: RequestHandler<
  Record<string, string>,
  unknown,
  RegisterInput
> = async (req, res) => {
  const { name, password } = req.body;
  const email = req.body.email.trim().toLowerCase();

  if (Buffer.byteLength(password, 'utf8') > 72) {
    res.status(400).json({ message: 'Password must not exceed 72 bytes' });
    return;
  }

  try {
    const existingUser = await User.exists({ email });
    if (existingUser) {
      res.status(409).json({ message: 'An account with this email already exists' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const sessionId = generateRandomToken();
    const accessToken = generateAccessToken(email, sessionId);
    const refreshToken = generateRefreshToken(email, sessionId);
    const refreshTokenHash = await bcrypt.hash(refreshToken, SALT_ROUNDS);

    const user = await User.create({
      name,
      email,
      passwordHash,
      isEmailVerified: false,
      refreshToken: refreshTokenHash,
      sessionId,
    });

    let welcomeEmailSent = false;
    try {
      await sendWelcomeEmail(user.email, user.name);
      welcomeEmailSent = true;
    } catch (error: unknown) {
      console.error('Welcome email delivery failed:', error);
    }

    res
      .status(201)
      .set('Cache-Control', 'no-store')
      .cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: REFRESH_TOKEN_MAX_AGE,
        path: '/api/auth',
      })
      .json({
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          isEmailVerified: user.isEmailVerified,
          avatar: user.avatar,
        },
        accessToken,
        refreshToken,
        welcomeEmailSent,
      });
  } catch (error: unknown) {
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === 11000
    ) {
      res.status(409).json({ message: 'An account with this email already exists' });
      return;
    }

    console.error('User registration failed:', error);
    res.status(500).json({ message: 'Unable to register user' });
  }
};

export const loginUser: RequestHandler<
  Record<string, string>,
  unknown,
  LoginInput
> = async (req, res) => {
  const { password } = req.body;
  const email = req.body.email.trim().toLowerCase();

  if (Buffer.byteLength(password, 'utf8') > 72) {
    res.status(400).json({ message: 'Password must not exceed 72 bytes' });
    return;
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      res.status(401).json({ message: 'Invalid email or password' });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      res.status(401).json({ message: 'Invalid email or password' });
      return;
    }

    if (!user.isEmailVerified) {
      res.status(403).json({ message: 'Please verify your email before signing in.', code: 'EMAIL_NOT_VERIFIED' });
      return;
    }

    // Replacing the stored session invalidates every previous device immediately.
    const sessionId = generateRandomToken();
    const accessToken = generateAccessToken(user.email, sessionId);
    const refreshToken = generateRefreshToken(user.email, sessionId);
    const refreshTokenHash = await bcrypt.hash(refreshToken, SALT_ROUNDS);

    user.refreshToken = refreshTokenHash;
    user.sessionId = sessionId;
    await user.save();

    res
      .status(200)
      .set('Cache-Control', 'no-store')
      .cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: REFRESH_TOKEN_MAX_AGE,
        path: '/api/auth',
      })
      .json({
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          isEmailVerified: user.isEmailVerified,
          avatar: user.avatar,
        },
        accessToken,
        refreshToken,
      });
  } catch (error: unknown) {
    console.error('User login failed:', error);
    res.status(500).json({ message: 'Unable to sign in' });
  }
};

export const logoutUser: RequestHandler = async (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
    if (refreshToken) {
      const payload = verifyRefreshToken(refreshToken);
      if (payload?.email && payload.sessionId) {
        const user = await User.findOne({
          email: payload.email,
          sessionId: payload.sessionId,
        });
        if (user) {
          user.refreshToken = '';
          user.sessionId = '';
          await user.save();
        }
      }
    }

    res
      .status(200)
      .clearCookie('refreshToken', {
        httpOnly: true,
        secure: env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/api/auth',
      })
      .json({ message: 'Logged out successfully' });
  } catch (error: unknown) {
    console.error('Logout failed:', error);
    res.status(500).json({ message: 'Unable to log out' });
  }
};

export const refreshAccessToken: RequestHandler = async (req, res) => {
  const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

  if (!refreshToken) {
    res.status(401).json({ message: 'Refresh token not found' });
    return;
  }

  try {
    const payload = verifyRefreshToken(refreshToken);
    if (!payload?.email) {
      res.status(401).json({ message: 'Invalid or expired refresh token' });
      return;
    }

    const user = await User.findOne({ email: payload.email });
    if (!user || !user.refreshToken || !user.sessionId || user.sessionId !== payload.sessionId) {
      res.status(401).json({ message: 'Invalid refresh token session' });
      return;
    }

    const isMatch = await bcrypt.compare(refreshToken, user.refreshToken);
    if (!isMatch) {
      res.status(403).json({ message: 'Invalid refresh token' });
      return;
    }

    // Refresh-token rotation is intentionally disabled for now. The same
    // refresh token remains valid until expiry, logout, password reset, or a new login.
    const newAccessToken = generateAccessToken(user.email, user.sessionId);

    res.status(200).set('Cache-Control', 'no-store').json({
      accessToken: newAccessToken,
    });
  } catch (error: unknown) {
    console.error('Refresh token failed:', error);
    res.status(500).json({ message: 'Unable to refresh token' });
  }
};

export const forgotPassword: RequestHandler<
  Record<string, string>,
  unknown,
  ForgotPasswordInput
> = async (req, res) => {
  const email = req.body.email.trim().toLowerCase();

  try {
    const user = await User.findOne({ email });

    if (user) {
      const resetToken = generateRandomToken();
      const hashedToken = hashToken(resetToken);

      user.resetPasswordToken = hashedToken;
      user.resetPasswordExpires = new Date(Date.now() + RESET_TOKEN_EXPIRY);
      await user.save();

      try {
        await sendPasswordResetEmail(user.email, user.name, resetToken);
      } catch (mailError) {
        console.error('Password reset email delivery failed:', mailError);
      }
    }

    res.status(200).json({
      message: 'If an account exists with this email, a reset link has been sent.',
    });
  } catch (error: unknown) {
    console.error('Forgot password failed:', error);
    res.status(500).json({ message: 'Unable to process password reset request' });
  }
};

export const resetPassword: RequestHandler<
  Record<string, string>,
  unknown,
  ResetPasswordInput
> = async (req, res) => {
  const { token, password } = req.body;

  if (Buffer.byteLength(password, 'utf8') > 72) {
    res.status(400).json({ message: 'Password must not exceed 72 bytes' });
    return;
  }

  try {
    const hashedToken = hashToken(token);
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      res.status(400).json({ message: 'Password reset token is invalid or has expired' });
      return;
    }

    user.passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    user.set({
      resetPasswordToken: undefined,
      resetPasswordExpires: undefined,
    });
    user.refreshToken = '';
    user.sessionId = '';
    await user.save();

    res.status(200).json({ message: 'Password has been reset successfully' });
  } catch (error: unknown) {
    console.error('Reset password failed:', error);
    res.status(500).json({ message: 'Unable to reset password' });
  }
};

export const getCurrentUser: RequestHandler = (req: AuthenticatedRequest, res) => {
  if (!req.user) {
    res.status(401).json({ message: 'Not authenticated' });
    return;
  }

  res.status(200).json({
    user: {
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      isEmailVerified: req.user.isEmailVerified,
      avatar: req.user.avatar,
    },
  });
};

export const sendVerificationEmailHandler: RequestHandler = async (
  req: AuthenticatedRequest,
  res
) => {
  if (!req.user) {
    res.status(401).json({ message: 'Not authenticated' });
    return;
  }

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    if (user.isEmailVerified) {
      res.status(400).json({ message: 'Email is already verified' });
      return;
    }

    if (!reserveVerificationEmailSlot(user)) {
      res.status(429).json({ message: 'Please wait before requesting another verification email.' });
      return;
    }

    const verificationCode = randomInt(100000, 1000000).toString();
    user.verificationCode = hashToken(verificationCode);
    user.verificationExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 mins
    await user.save();

    try {
      await sendVerificationOtpEmail(user.email, user.name, verificationCode);
    } catch (mailError) {
      console.error('Verification email delivery failed:', mailError);
      user.set({
        verificationCode: undefined,
        verificationExpires: undefined,
      });
      await user.save();
      res.status(502).json({ message: 'Unable to send verification email. Please try again later.' });
      return;
    }

    res.status(200).json({ message: 'Verification code sent to your email.' });
  } catch (error) {
    console.error('Send verification failed:', error);
    res.status(500).json({ message: 'Failed to send verification email' });
  }
};

// Public resend endpoint: always returns the same response to avoid account enumeration.
export const resendVerificationEmailPublic: RequestHandler = async (req, res) => {
  const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';

  try {
    const user = email ? await User.findOne({ email }) : null;
    if (user && !user.isEmailVerified && reserveVerificationEmailSlot(user)) {
      const verificationCode = randomInt(100000, 1000000).toString();
      user.verificationCode = hashToken(verificationCode);
      user.verificationExpires = new Date(Date.now() + 15 * 60 * 1000);
      await user.save();

      try {
        await sendVerificationOtpEmail(user.email, user.name, verificationCode);
      } catch (mailError) {
        console.error('Verification email delivery failed:', mailError);
        user.set({
          verificationCode: undefined,
          verificationExpires: undefined,
        });
        await user.save();
      }
    }

    res.status(200).json({
      message: 'If this account exists and needs verification, a code has been sent.',
    });
  } catch (error) {
    console.error('Public verification request failed:', error);
    res.status(500).json({ message: 'Unable to process verification request.' });
  }
};

export const verifyEmailHandler: RequestHandler = async (
  req: AuthenticatedRequest,
  res
) => {
  if (!req.user) {
    res.status(401).json({ message: 'Not authenticated' });
    return;
  }

  const { code } = req.body as { code: string };

  try {
    const hashedCode = hashToken(code.trim());
    const user = await User.findOne({
      _id: req.user.id,
      verificationCode: hashedCode,
      verificationExpires: { $gt: new Date() },
    });

    if (!user) {
      res.status(400).json({ message: 'Invalid or expired verification code' });
      return;
    }

    user.isEmailVerified = true;
    user.set({
      verificationCode: undefined,
      verificationExpires: undefined,
    });
    await user.save();

    res.status(200).json({
      message: 'Email verified successfully',
      isEmailVerified: true,
    });
  } catch (error) {
    console.error('Verify email failed:', error);
    res.status(500).json({ message: 'Failed to verify email' });
  }
};
