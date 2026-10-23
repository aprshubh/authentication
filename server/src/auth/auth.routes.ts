import { Router } from "express";
import {
  forgotPassword,
  getCurrentUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerUser,
  resetPassword,
  sendVerificationEmailHandler,
  verifyEmailHandler,
} from "./auth.controllers.js";
import { authenticate, authenticateAllowUnverified } from "./auth.middleware.js";
import { authLimiter, forgotPasswordLimiter, refreshTokenLimiter, sendVerificationLimiter, verificationLimiter } from "./auth.rate-limiter.js";
import {
  validateForgotPassword,
  validateLogin,
  validateRegister,
  validateResetPassword,
  validateVerifyEmail,
} from "./auth.validations.js";

const authRouter = Router();

authRouter.post("/register", authLimiter, validateRegister, registerUser);
authRouter.post("/login", authLimiter, validateLogin, loginUser);
authRouter.post("/logout", logoutUser);
authRouter.post("/refresh-token", refreshTokenLimiter, refreshAccessToken);
authRouter.post("/forgot-password",forgotPasswordLimiter,validateForgotPassword,forgotPassword,);

authRouter.post("/reset-password",authLimiter,validateResetPassword,resetPassword,);

authRouter.get("/me", authenticate, getCurrentUser);
authRouter.post("/send-verification", sendVerificationLimiter, authenticateAllowUnverified, sendVerificationEmailHandler);
authRouter.post("/verify-email", verificationLimiter, authenticateAllowUnverified, validateVerifyEmail, verifyEmailHandler);

export default authRouter;
