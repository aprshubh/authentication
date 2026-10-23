const memoryStore: Record<string, string> = {};

export const storage = {
  setItem: async (key: string, value: string): Promise<void> => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, value);
      }
    } catch {
      // Ignore localStorage access failures
    }
    memoryStore[key] = value;
  },

  getItem: async (key: string): Promise<string | null> => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const value = window.localStorage.getItem(key);
        if (value !== null) return value;
      }
    } catch {
      // Ignore localStorage access failures
    }
    return memoryStore[key] ?? null;
  },

  removeItem: async (key: string): Promise<void> => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(key);
      }
    } catch {
      // Ignore localStorage access failures
    }
    delete memoryStore[key];
  },
};
