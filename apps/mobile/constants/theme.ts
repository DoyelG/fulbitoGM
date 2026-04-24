

import { Platform } from 'react-native'

const BRAND = '#7c3aed'
const tintColorLight = '#0a7ea4'
const tintColorDark = '#fff'

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,

    brand: BRAND,
    brandAccent: BRAND,
    brandSoft: 'rgba(124, 58, 237, 0.12)',
    brandSoftStrong: 'rgba(124, 58, 237, 0.12)',
    brandRing: 'rgba(124, 58, 237, 0.25)',

    surface: '#ffffff',
    border: 'rgba(124, 58, 237, 0.12)',
    muted: '#6b7280',

    chipBg: '#f3f4f6',
    chipBorder: '#e5e7eb',

    danger: '#dc2626',
    dangerIcon: '#f87171',
    dangerBg: 'rgba(220, 38, 38, 0.1)',
    warning: '#f97316',

    shadow: '#4c1d95',
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,

    brand: BRAND,
    brandAccent: '#e9d5ff',
    brandSoft: 'rgba(124, 58, 237, 0.2)',
    brandSoftStrong: 'rgba(124, 58, 237, 0.28)',
    brandRing: 'rgba(124, 58, 237, 0.25)',

    surface: '#2a2d32',
    border: 'rgba(255,255,255,0.08)',
    muted: '#9ca3af',

    chipBg: 'rgba(255,255,255,0.06)',
    chipBorder: 'rgba(255,255,255,0.1)',

    danger: '#dc2626',
    dangerIcon: '#f87171',
    dangerBg: 'rgba(220, 38, 38, 0.15)',
    warning: '#f97316',

    shadow: '#000',
  },
} as const

export type ColorName = keyof typeof Colors.light & keyof typeof Colors.dark

export const Radii = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  pill: 999,
} as const

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const

export const Shadows = {
  card: (isDark: boolean) =>
    Platform.select({
      ios: {
        shadowColor: isDark ? '#000' : '#4c1d95',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: isDark ? 0.35 : 0.08,
        shadowRadius: 12,
      },
      android: { elevation: isDark ? 2 : 3 },
      default: {},
    }),
  cta: (color: string = BRAND) =>
    Platform.select({
      ios: {
        shadowColor: color,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.35,
        shadowRadius: 8,
      },
      android: { elevation: 4 },
      default: {},
    }),
  pill: () =>
    Platform.select({
      ios: {
        shadowColor: '#7c3aed',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.35,
        shadowRadius: 6,
      },
      android: { elevation: 2 },
      default: {},
    }),
} as const

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
})
