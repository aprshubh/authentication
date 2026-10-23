import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const memoryStore: Record<string, string> = {};

export const storage = {
  setItem: async (key: string, value: string): Promise<void> => {
    if (Platform.OS !== 'web') {
      try {
        await SecureStore.setItemAsync(key, value);
        return;
      } catch {
        // Keep the session usable for this process if secure storage is unavailable.
        memoryStore[key] = value;
        return;
      }
    }

    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, value);
        return;
      }
    } catch {
      // Fall back to in-memory storage when browser storage is blocked.
    }
    memoryStore[key] = value;
  },

  getItem: async (key: string): Promise<string | null> => {
    if (Platform.OS !== 'web') {
      try {
        const value = await SecureStore.getItemAsync(key);
        if (value !== null) return value;
      } catch {
        // Fall back to in-memory storage when secure storage is unavailable.
      }
      return memoryStore[key] ?? null;
    }

    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const value = window.localStorage.getItem(key);
        if (value !== null) return value;
      }
    } catch {
      // Fall back to in-memory storage when browser storage is blocked.
    }
    return memoryStore[key] ?? null;
  },

  removeItem: async (key: string): Promise<void> => {
    if (Platform.OS !== 'web') {
      try {
        await SecureStore.deleteItemAsync(key);
      } catch {
        // Continue clearing the in-memory fallback.
      }
      delete memoryStore[key];
      return;
    }

    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(key);
      }
    } catch {
      // Continue clearing the in-memory fallback.
    }
    delete memoryStore[key];
  },
};
