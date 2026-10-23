import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export interface TokenPayload {
  email: string;
  sessionId?: string;
}

export const generateAccessToken = (email: string, sessionId: string): string =>
  jwt.sign({ email, sessionId }, env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });

export const generateRefreshToken = (email: string, sessionId: string): string =>
  jwt.sign({ email, sessionId }, env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });

export const verifyAccessToken = (token: string): TokenPayload | null => {
  try {
    return jwt.verify(token, env.ACCESS_TOKEN_SECRET) as TokenPayload;
  } catch {
    return null;
  }
};

export const verifyRefreshToken = (token: string): TokenPayload | null => {
  try {
    return jwt.verify(token, env.REFRESH_TOKEN_SECRET) as TokenPayload;
  } catch {
    return null;
  }
};

export const generateRandomToken = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

export const hashToken = (token: string): string => {
  return crypto.createHash('sha256').update(token).digest('hex');
};
