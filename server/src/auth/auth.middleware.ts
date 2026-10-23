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

export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Authorization token missing or invalid' });
    return;
  }

  const token = authHeader.substring(7);
  const payload = verifyAccessToken(token);

  if (!payload?.email) {
    res.status(401).json({ message: 'Invalid or expired access token' });
    return;
  }

  try {
    const user = await User.findOne({ email: payload.email }).select('-passwordHash');
    if (!user) {
      res.status(401).json({ message: 'User not found' });
      return;
    }

    req.user = user as unknown as AuthenticatedUser;
    next();
  } catch (error) {
    console.error('Authentication middleware error:', error);
    res.status(500).json({ message: 'Authentication error' });
  }
};
