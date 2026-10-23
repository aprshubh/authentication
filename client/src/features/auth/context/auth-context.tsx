import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { setAuthToken, setOnSessionExpired } from '@/lib/api-client';
import { storage } from '@/utils/storage';
import { authApi } from '../api/auth.api';
import {
  AuthResponse,
  ForgotPasswordPayload,
  ForgotPasswordResponse,
  LoginPayload,
  RegisterPayload,
  ResetPasswordPayload,
  ResetPasswordResponse,
  User,
  VerificationResponse,
  VerifyEmailPayload,
} from '../types';

interface AuthContextValue {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (payload: LoginPayload) => Promise<AuthResponse>;
  register: (payload: RegisterPayload) => Promise<AuthResponse>;
  forgotPassword: (payload: ForgotPasswordPayload) => Promise<ForgotPasswordResponse>;
  resetPassword: (payload: ResetPasswordPayload) => Promise<ResetPasswordResponse>;
  sendVerificationEmail: () => Promise<VerificationResponse>;
  verifyEmail: (payload: VerifyEmailPayload) => Promise<VerificationResponse>;
  updateAvatar: (avatarUrl: string) => void;
  logout: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const STORAGE_KEYS = {
  REFRESH_TOKEN: 'auth_refresh_token',
  USER: 'auth_user',
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  useEffect(() => {
    setOnSessionExpired(() => {
      setUser(null);
      setToken(null);
      setRefreshToken(null);
      setError('Your session expired or was used on another device. Please sign in again.');
      void storage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
      void storage.removeItem(STORAGE_KEYS.USER);
    });
    return () => setOnSessionExpired(null);
  }, []);

  // Restore saved session on app mount
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const storedRefreshToken = await storage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
        const storedUser = await storage.getItem(STORAGE_KEYS.USER);

        if (storedRefreshToken && storedUser) {
          const parsedUser = JSON.parse(storedUser) as User;
          setUser(parsedUser);
          setRefreshToken(storedRefreshToken);

          try {
            const refreshRes = await authApi.refreshToken(storedRefreshToken);
            setToken(refreshRes.accessToken);
            setAuthToken(refreshRes.accessToken);
            if (refreshRes.refreshToken) {
              setRefreshToken(refreshRes.refreshToken);
              await storage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshRes.refreshToken);
            }
          } catch {
            await storage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
            await storage.removeItem(STORAGE_KEYS.USER);
            setUser(null);
            setRefreshToken(null);
          }
        }
      } catch {
        // Ignore initialization error
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();
  }, []);

  const login = useCallback(async (payload: LoginPayload): Promise<AuthResponse> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authApi.login(payload);
      setUser(response.user);
      setToken(response.accessToken);
      setAuthToken(response.accessToken);

      if (response.refreshToken) {
        setRefreshToken(response.refreshToken);
        await storage.setItem(STORAGE_KEYS.REFRESH_TOKEN, response.refreshToken);
      }
      await storage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.user));

      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed. Please try again.';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (payload: RegisterPayload): Promise<AuthResponse> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authApi.register(payload);
      setUser(response.user);
      setToken(response.accessToken);
      setAuthToken(response.accessToken);

      if (response.refreshToken) {
        setRefreshToken(response.refreshToken);
        await storage.setItem(STORAGE_KEYS.REFRESH_TOKEN, response.refreshToken);
      }
      await storage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.user));

      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Registration failed. Please try again.';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const forgotPassword = useCallback(async (payload: ForgotPasswordPayload): Promise<ForgotPasswordResponse> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authApi.forgotPassword(payload);
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Password reset request failed. Please try again.';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const resetPassword = useCallback(async (payload: ResetPasswordPayload): Promise<ResetPasswordResponse> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authApi.resetPassword(payload);
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Password reset failed. Please try again.';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const sendVerificationEmail = useCallback(async (): Promise<VerificationResponse> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authApi.sendVerificationEmail();
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to send verification email.';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const verifyEmail = useCallback(async (payload: VerifyEmailPayload): Promise<VerificationResponse> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authApi.verifyEmail(payload);
      if (user) {
        const verifiedUser = { ...user, isEmailVerified: true };
        setUser(verifiedUser);
        await storage.setItem(STORAGE_KEYS.USER, JSON.stringify(verifiedUser));
      } else {
        setUser((prev) => (prev ? { ...prev, isEmailVerified: true } : null));
      }
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Email verification failed.';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const updateAvatar = useCallback((avatarUrl: string) => {
    setUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, avatar: avatarUrl };
      storage.setItem(STORAGE_KEYS.USER, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      const currentRefreshToken = refreshToken || (await storage.getItem(STORAGE_KEYS.REFRESH_TOKEN)) || undefined;
      await authApi.logout(currentRefreshToken);
    } catch {
      // Ignore network failure on logout
    } finally {
      await storage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
      await storage.removeItem(STORAGE_KEYS.USER);
      setUser(null);
      setToken(null);
      setRefreshToken(null);
      setAuthToken(null);
      setError(null);
      setIsLoading(false);
    }
  }, [refreshToken]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      refreshToken,
      isAuthenticated: Boolean(token && user),
      isLoading,
      error,
      login,
      register,
      forgotPassword,
      resetPassword,
      sendVerificationEmail,
      verifyEmail,
      updateAvatar,
      logout,
      clearError,
    }),
    [user, token, refreshToken, isLoading, error, login, register, forgotPassword, resetPassword, sendVerificationEmail, verifyEmail, updateAvatar, logout, clearError]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
