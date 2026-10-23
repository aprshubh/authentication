import { Platform } from 'react-native';
import { storage } from '@/utils/storage';

const getBaseUrl = (): string => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:5000/api';
  }
  return 'http://localhost:5000/api';
};

export const API_BASE_URL = getBaseUrl();

let authToken: string | null = null;
let onSessionExpired: (() => void) | null = null;
let isRefreshing = false;
let refreshSubscribers: Array<(token: string | null) => void> = [];

const onTokenRefreshed = (token: string | null) => {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
};

const addRefreshSubscriber = (callback: (token: string | null) => void) => {
  refreshSubscribers.push(callback);
};

export const setAuthToken = (token: string | null) => {
  authToken = token;
};

export const setOnSessionExpired = (callback: (() => void) | null) => {
  onSessionExpired = callback;
};

export const getAuthToken = (): string | null => {
  return authToken;
};

export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean>;
  _retry?: boolean;
}

const refreshAccessTokenSilent = async (): Promise<string | null> => {
  try {
    const storedRefreshToken = await storage.getItem('auth_refresh_token');
    const response = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ refreshToken: storedRefreshToken }),
    });

    if (!response.ok) {
      await storage.removeItem('auth_refresh_token');
      await storage.removeItem('auth_user');
      setAuthToken(null);
      onSessionExpired?.();
      return null;
    }

    const data = (await response.json()) as { accessToken: string; refreshToken?: string };
    setAuthToken(data.accessToken);

    if (data.refreshToken) {
      await storage.setItem('auth_refresh_token', data.refreshToken);
    }

    return data.accessToken;
  } catch {
    return null;
  }
};

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { params, headers, _retry = false, ...customConfig } = options;

  let url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  if (params) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      query.append(key, String(value));
    });
    url += `?${query.toString()}`;
  }

  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };

  if (authToken) {
    defaultHeaders.Authorization = `Bearer ${authToken}`;
  }

  const config: RequestInit = {
    credentials: 'include',
    ...customConfig,
    headers: {
      ...defaultHeaders,
      ...headers,
    },
  };

  let response: Response;
  try {
    response = await fetch(url, config);
  } catch (error) {
    throw new ApiError(
      error instanceof Error ? error.message : 'Unable to connect to server',
      0
    );
  }

  // Handle 401 Unauthorized for automatic silent token refresh
  if (response.status === 401 && !_retry && !endpoint.includes('/auth/login') && !endpoint.includes('/auth/refresh-token')) {
    if (!isRefreshing) {
      isRefreshing = true;
      const newToken = await refreshAccessTokenSilent();
      isRefreshing = false;
      onTokenRefreshed(newToken);

      if (newToken) {
        return request<T>(endpoint, { ...options, _retry: true });
      }
    } else {
      // Queue requests while token is refreshing
      return new Promise<T>((resolve, reject) => {
        addRefreshSubscriber((newToken) => {
          if (newToken) {
            resolve(request<T>(endpoint, { ...options, _retry: true }));
          } else {
            reject(new ApiError('Session expired. Please sign in again.', 401));
          }
        });
      });
    }
  }

  let data: unknown = null;
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    try {
      data = await response.json();
    } catch {
      data = null;
    }
  }

  if (!response.ok) {
    let errorMessage = `Request failed with status ${response.status}`;

    if (data && typeof data === 'object') {
      if ('message' in data && typeof (data as { message: unknown }).message === 'string') {
        errorMessage = (data as { message: string }).message;
      } else if ('errors' in data && Array.isArray((data as { errors: unknown }).errors)) {
        const firstError = (data as { errors: Array<{ message?: string }> }).errors[0];
        if (firstError?.message) {
          errorMessage = firstError.message;
        }
      }
    }

    throw new ApiError(errorMessage, response.status, data);
  }

  return data as T;
}

export const apiClient = {
  get: <T>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: 'GET' }),
  post: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    }),
  put: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    }),
  delete: <T>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: 'DELETE' }),
};
