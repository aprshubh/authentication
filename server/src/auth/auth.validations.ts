import type { RequestHandler } from 'express';
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  verifyEmailSchema,
} from './auth.schemas.js';

export const validateRegister: RequestHandler = (req, res, next) => {
  const result = registerSchema.safeParse(req.body);

  if (!result.success) {
    res.status(400).json({ errors: result.error.issues });
    return;
  }

  req.body = result.data;
  next();
};

export const validateLogin: RequestHandler = (req, res, next) => {
  const result = loginSchema.safeParse(req.body);

  if (!result.success) {
    res.status(400).json({ errors: result.error.issues });
    return;
  }

  req.body = result.data;
  next();
};

export const validateForgotPassword: RequestHandler = (req, res, next) => {
  const result = forgotPasswordSchema.safeParse(req.body);

  if (!result.success) {
    res.status(400).json({ errors: result.error.issues });
    return;
  }

  req.body = result.data;
  next();
};

export const validateResetPassword: RequestHandler = (req, res, next) => {
  const result = resetPasswordSchema.safeParse(req.body);

  if (!result.success) {
    res.status(400).json({ errors: result.error.issues });
    return;
  }

  req.body = result.data;
  next();
};

export const validateVerifyEmail: RequestHandler = (req, res, next) => {
  const result = verifyEmailSchema.safeParse(req.body);

  if (!result.success) {
    res.status(400).json({ errors: result.error.issues });
    return;
  }

  req.body = result.data;
  next();
};
