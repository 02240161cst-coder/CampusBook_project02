/**
 * Light palette = Project I colours.xml (unchanged).
 * Dark palette  = Project II dark theme (same blue brand, slate surfaces).
 *
 * `white` is ONLY for text/icons that sit on a blue or green fill.
 * Card / sheet / bar backgrounds use `surface` so they can turn dark.
 */
export interface Palette {
  primaryBlue: string;
  primaryBlueDark: string;
  lightBlue: string;
  secondaryBlue: string;
  backgroundPage: string;
  surface: string;
  surfaceVariant: string;
  white: string;
  black: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  successGreen: string;
  successBg: string;
  errorRed: string;
  errorBg: string;
  exclusiveRed: string;
  exclusiveBg: string;
  dividerGrey: string;
  photoFrameGrey: string;
  /** Material outline colour for text fields / outlined buttons */
  outline: string;
}

export const lightColors: Palette = {
  primaryBlue: '#2563EB',
  primaryBlueDark: '#1E40AF',
  lightBlue: '#DBEAFE',
  secondaryBlue: '#EFF6FF',
  backgroundPage: '#F8FAFC',
  surface: '#FFFFFF',
  surfaceVariant: '#F1F5F9',
  white: '#FFFFFF',
  black: '#000000',
  textPrimary: '#1E293B',
  textSecondary: '#64748B',
  textMuted: '#94A3B8',
  successGreen: '#10B981',
  successBg: '#ECFDF5',
  errorRed: '#EF4444',
  errorBg: '#FEF2F2',
  exclusiveRed: '#DC2626',
  exclusiveBg: '#FEE2E2',
  dividerGrey: '#E2E8F0',
  photoFrameGrey: '#F1F5F9',
  outline: '#79747E',
};

export const darkColors: Palette = {
  primaryBlue: '#3B82F6',
  primaryBlueDark: '#2563EB',
  lightBlue: '#1E3A5F',
  secondaryBlue: '#172A4D',
  backgroundPage: '#0F172A',
  surface: '#1E293B',
  surfaceVariant: '#273449',
  white: '#FFFFFF',
  black: '#000000',
  textPrimary: '#F1F5F9',
  textSecondary: '#A3B1C6',
  textMuted: '#7C8CA3',
  successGreen: '#34D399',
  successBg: '#064E3B',
  errorRed: '#F87171',
  errorBg: '#450A0A',
  exclusiveRed: '#FCA5A5',
  exclusiveBg: '#4C1D1D',
  dividerGrey: '#334155',
  photoFrameGrey: '#1E293B',
  outline: '#8B94A5',
};

/** @deprecated static LIGHT palette – kept so untouched files (Splash) still compile. Use useColors(). */
export const colors = lightColors;
export const outline = lightColors.outline;
