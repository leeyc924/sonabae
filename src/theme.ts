import type { TextStyle, ViewStyle } from 'react-native';

export const colors = {
  primary: '#1F8A70',
  primaryDark: '#146356',
  primaryLight: '#E8F7F2',
  accent: '#FFC857',
  accentSoft: '#FFF4D6',
  background: '#F7FAF9',
  surface: '#FFFFFF',
  surfaceGlass: 'rgba(255, 255, 255, 0.72)',
  textPrimary: '#17201D',
  textSecondary: '#66736F',
  textMuted: '#98A29F',
  win: '#2EAD5B',
  loss: '#E85D75',
  warning: '#F59E0B',
  info: '#3B82F6',
  border: '#E3EAE7',
  divider: '#EEF2F0',
};

export const spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 40,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  pill: 999,
};

export const shadow = {
  card: {
    shadowColor: '#0D1B18',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  } satisfies ViewStyle,
  floating: {
    shadowColor: '#0D1B18',
    shadowOpacity: 0.16,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 8,
  } satisfies ViewStyle,
};

export const typography = {
  display: {
    fontSize: 34,
    lineHeight: 42,
    fontWeight: '700',
  } satisfies TextStyle,
  h1: {
    fontSize: 28,
    lineHeight: 36,
    fontWeight: '700',
  } satisfies TextStyle,
  h2: {
    fontSize: 22,
    lineHeight: 30,
    fontWeight: '700',
  } satisfies TextStyle,
  title: {
    fontSize: 18,
    lineHeight: 26,
    fontWeight: '600',
  } satisfies TextStyle,
  body: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
  } satisfies TextStyle,
  caption: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '400',
  } satisfies TextStyle,
  statNumber: {
    fontSize: 36,
    lineHeight: 44,
    fontWeight: '800',
  } satisfies TextStyle,
};

export const levelOptions = ['초심', 'D조', 'C조', 'B조', 'A조', 'S조', '기타'];
