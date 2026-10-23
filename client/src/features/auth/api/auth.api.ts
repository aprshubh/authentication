import { apiClient } from '@/lib/api-client';
import {
  AuthResponse,
  ForgotPasswordPayload,
  ForgotPasswordResponse,
  LoginPayload,
  RegisterPayload,
  ResetPasswordPayload,
  ResetPasswordResponse,
  VerificationResponse,
  VerifyEmailPayload,
} from '../types';

export const authApi = {
  login: async (payload: LoginPayload): Promise<AuthResponse> => {
    return apiClient.post<AuthResponse>('/auth/login', payload);
  },

  register: async (payload: RegisterPayload): Promise<AuthResponse> => {
    return apiClient.post<AuthResponse>('/auth/register', payload);
  },

  forgotPassword: async (payload: ForgotPasswordPayload): Promise<ForgotPasswordResponse> => {
    return apiClient.post<ForgotPasswordResponse>('/auth/forgot-password', payload);
  },

  resetPassword: async (payload: ResetPasswordPayload): Promise<ResetPasswordResponse> => {
    return apiClient.post<ResetPasswordResponse>('/auth/reset-password', payload);
  },

  sendVerificationEmail: async (): Promise<VerificationResponse> => {
    return apiClient.post<VerificationResponse>('/auth/send-verification');
  },

  verifyEmail: async (payload: VerifyEmailPayload): Promise<VerificationResponse> => {
    return apiClient.post<VerificationResponse>('/auth/verify-email', payload);
  },

  refreshToken: async (refreshToken?: string): Promise<{ accessToken: string; refreshToken?: string }> => {
    return apiClient.post<{ accessToken: string; refreshToken?: string }>('/auth/refresh-token', {
      refreshToken,
    });
  },

  logout: async (refreshToken?: string): Promise<void> => {
    return apiClient.post<void>('/auth/logout', { refreshToken });
  },
};
