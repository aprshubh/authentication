// Light theme tokens
export const lightColors = {
  background: '#FFFFFF',
  backgroundSecondary: '#F5F5F5',
  card: '#FFFFFF',
  surface: '#F7F7F7',
  cardBorder: 'rgba(0,0,0,0.06)',

  inputBackground: '#F5F5F5',
  inputBorder: 'rgba(0,0,0,0.0)',
  inputBorderFocused: 'rgba(0,0,0,0.0)',
  inputPlaceholder: '#BBBBBB',

  textPrimary: '#111111',
  textSecondary: '#777777',
  textMuted: '#AAAAAA',
  textHighlight: '#111111',

  primary: '#111111',
  primaryLight: '#333333',
  secondary: '#555555',
  success: '#22C55E',
  error: '#EF4444',
  warning: '#F59E0B',

  gradientPrimary: ['#6366F1', '#8B5CF6'] as const,

  divider: '#EFEFEF',
  switchTrackOff: '#E5E5E5',
  switchTrackOn: '#111111',
  switchThumbOn: '#FFFFFF',
  switchThumbOff: '#FFFFFF',
};

// Dark theme tokens
export const darkColors = {
  background: '#0A0A0A',
  backgroundSecondary: '#111111',
  card: '#111111',
  surface: '#1A1A1A',
  cardBorder: 'rgba(255,255,255,0.06)',

  inputBackground: '#1A1A1A',
  inputBorder: 'rgba(255,255,255,0.0)',
  inputBorderFocused: 'rgba(255,255,255,0.0)',
  inputPlaceholder: '#444444',

  textPrimary: '#FFFFFF',
  textSecondary: '#888888',
  textMuted: '#555555',
  textHighlight: '#FFFFFF',

  primary: '#FFFFFF',
  primaryLight: '#CCCCCC',
  secondary: '#AAAAAA',
  success: '#22C55E',
  error: '#EF4444',
  warning: '#F59E0B',

  gradientPrimary: ['#4F46E5', '#7C3AED'] as const,

  divider: '#1E1E1E',
  switchTrackOff: '#2A2A2A',
  switchTrackOn: '#FFFFFF',
  switchThumbOn: '#000000',
  switchThumbOff: '#666666',
};

export type AppColors = Omit<typeof lightColors, 'gradientPrimary'> & {
  gradientPrimary: readonly [string, string];
};

export const theme = {
  borderRadius: {
    sm: 6,
    md: 12,
    lg: 16,
    xl: 20,
    full: 9999,
  },
  shadows: {
    card: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
      elevation: 2,
    },
    glowPrimary: {
      shadowColor: '#6366F1',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.45,
      shadowRadius: 16,
      elevation: 8,
    },
  },
  // fallback (dark)  — screens should use useTheme() hook instead
  colors: darkColors,
};
