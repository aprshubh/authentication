import type { NextFunction, Request, Response } from 'express';
import { verifyAccessToken } from './auth.services.js';
import type { IUser } from './auth.models.js';
import { User } from './auth.models.js';

export interface AuthenticatedUser extends IUser {
  id: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}

const authenticateUser = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
  requireVerifiedEmail: boolean
): Promise<void> => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Authorization token missing or invalid' });
    return;
  }

  const token = authHeader.substring(7);
  const payload = verifyAccessToken(token);

  if (!payload?.email || !payload.sessionId) {
    res.status(401).json({ message: 'Invalid or expired access token' });
    return;
  }

  try {
    const user = await User.findOne({ email: payload.email }).select('-passwordHash');
    if (!user || !user.sessionId || user.sessionId !== payload.sessionId) {
      res.status(401).json({ message: 'Session is no longer valid. Please sign in again.' });
      return;
    }

    if (requireVerifiedEmail && !user.isEmailVerified) {
      res.status(403).json({ message: 'Please verify your email before accessing the app.', code: 'EMAIL_NOT_VERIFIED' });
      return;
    }

    req.user = user as unknown as AuthenticatedUser;
    next();
  } catch (error) {
    console.error('Authentication middleware error:', error);
    res.status(500).json({ message: 'Authentication error' });
  }
};

export const authenticate: typeof authenticateUser = (req, res, next) =>
  authenticateUser(req, res, next, true);

export const authenticateAllowUnverified: typeof authenticateUser = (req, res, next) =>
  authenticateUser(req, res, next, false);
