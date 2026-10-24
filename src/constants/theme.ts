/**
 * Visual Theme & Design System
 * Polished typography, colors (light & dark mode), spacing and radius tokens.
 */

export interface ThemeColors {
  primary: string;
  primaryLight: string;
  primaryDark: string;
  secondary: string;
  background: string;
  surface: string;
  surfaceSubtle: string;
  surfaceElevated: string;
  border: string;
  borderSubtle: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  accent: string;
  accentLight: string;
  success: string;
  successBg: string;
  warning: string;
  warningBg: string;
  error: string;
  errorBg: string;
  cardShadow: string;
  indicatorBg: string;
}

export const lightColors: ThemeColors = {
  primary: '#3B82F6', // Vibrant modern blue
  primaryLight: '#EFF6FF',
  primaryDark: '#1D4ED8',
  secondary: '#8B5CF6',
  background: '#F8FAFC',
  surface: '#FFFFFF',
  surfaceSubtle: '#F1F5F9',
  surfaceElevated: '#FFFFFF',
  border: '#E2E8F0',
  borderSubtle: '#EDF2F7',
  textPrimary: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#94A3B8',
  accent: '#F59E0B',
  accentLight: '#FEF3C7',
  success: '#10B981',
  successBg: '#ECFDF5',
  warning: '#F59E0B',
  warningBg: '#FFFBEB',
  error: '#EF4444',
  errorBg: '#FEF2F2',
  cardShadow: 'rgba(0, 0, 0, 0.05)',
  indicatorBg: '#E0F2FE',
};

export const darkColors: ThemeColors = {
  primary: '#60A5FA',
  primaryLight: '#1E293B',
  primaryDark: '#3B82F6',
  secondary: '#A78BFA',
  background: '#0B0F19',
  surface: '#151D2C',
  surfaceSubtle: '#1E293B',
  surfaceElevated: '#243048',
  border: '#2A374E',
  borderSubtle: '#1E293B',
  textPrimary: '#F8FAFC',
  textSecondary: '#CBD5E1',
  textMuted: '#64748B',
  accent: '#FBBF24',
  accentLight: '#78350F',
  success: '#34D399',
  successBg: '#064E3B',
  warning: '#FBBF24',
  warningBg: '#78350F',
  error: '#F87171',
  errorBg: '#7F1D1D',
  cardShadow: 'rgba(0, 0, 0, 0.35)',
  indicatorBg: '#1E3A8A',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const radius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
};

export const typography = {
  fontSizes: {
    xs: 11,
    sm: 13,
    md: 15,
    lg: 17,
    xl: 20,
    xxl: 24,
    xxxl: 30,
  },
  lineHeights: {
    xs: 14,
    sm: 18,
    md: 22,
    lg: 24,
    xl: 28,
    xxl: 32,
    xxxl: 38,
  },
  fontWeights: {
    regular: '400' as const,
    medium: '500' as const,
    semiBold: '600' as const,
    bold: '700' as const,
    extraBold: '800' as const,
  },
};
