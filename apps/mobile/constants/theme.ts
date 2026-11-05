import { Platform } from 'react-native'

const PRIMARY_GLOW = '#7c3aed'
const PRIMARY = '#4c1d95'
const FRIENDLYBRAND = '#0cb000'
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

    primary: PRIMARY,
    onPrimary: '#ffffff',
    primaryAccent: PRIMARY,
    primaryText: PRIMARY,
    primarySoft: 'rgba(76, 29, 149, 0.1)',
    primarySoftStrong: 'rgba(76, 29, 149, 0.15)',
    primaryRing: 'rgba(76, 29, 149, 0.25)',

    friendlyBrand: FRIENDLYBRAND,

    surface: '#ffffff',
    border: 'rgba(76, 29, 149, 0.12)',
    muted: '#6b7280',

    chipBg: '#f3f4f6',
    chipBorder: '#e5e7eb',
    track: '#e5e7eb',
    neutralFill: 'rgba(0,0,0,0.06)',
    subtleText: '#4b5563',
    textSecondary: '#374151',
    success: '#16a34a',
    medal: '#f59e0b',

    danger: '#c2410c',
    dangerIcon: '#fb923c',
    dangerBg: 'rgba(249, 115, 22, 0.1)',
    warning: '#f59e0b',

    secondary: '#f97316',
    goalkeeper: '#f97316',
    secondaryText: '#c2410c',
    primarySubtle: 'rgba(76, 29, 149, 0.07)',
    neutralSubtle: 'rgba(0,0,0,0.03)',
    secondarySubtle: 'rgba(249, 115, 22, 0.09)',
    secondarySoft: 'rgba(249, 115, 22, 0.2)',
    shadow: PRIMARY,

    onAccent: '#ffffff',
    onAccentSoft: 'rgba(255,255,255,0.85)',
    onAccentTrack: 'rgba(255,255,255,0.3)',
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,

    primary: PRIMARY,
    onPrimary: '#ffffff',
    primaryAccent: '#e9d5ff',
    primaryText: '#a78bfa',
    primarySoft: 'rgba(76, 29, 149, 0.35)',
    primarySoftStrong: 'rgba(76, 29, 149, 0.45)',
    primaryRing: 'rgba(76, 29, 149, 0.5)',

    friendlyBrand: FRIENDLYBRAND,

    surface: '#2a2d32',
    border: 'rgba(255,255,255,0.08)',
    muted: '#9ca3af',

    chipBg: 'rgba(255,255,255,0.06)',
    chipBorder: 'rgba(255,255,255,0.1)',
    track: 'rgba(255,255,255,0.12)',
    neutralFill: 'rgba(255,255,255,0.1)',
    subtleText: '#d1d5db',
    textSecondary: '#d1d5db',
    success: '#16a34a',
    medal: '#f59e0b',

    danger: '#c2410c',
    dangerIcon: '#fb923c',
    dangerBg: 'rgba(249, 115, 22, 0.15)',

    warning: '#fbbf24',

    secondary: '#f97316',
    goalkeeper: '#f97316',
    secondaryText: '#fb923c',
    primarySubtle: 'rgba(167, 139, 250, 0.1)',
    neutralSubtle: 'rgba(0,0,0,0.03)',
    secondarySubtle: 'rgba(249, 115, 22, 0.1)',
    secondarySoft: 'rgba(249, 115, 22, 0.22)',

    shadow: '#000',

    onAccent: '#ffffff',
    onAccentSoft: 'rgba(255,255,255,0.85)',
    onAccentTrack: 'rgba(255,255,255,0.3)',
  },
} as const

export type ColorName = keyof typeof Colors.light & keyof typeof Colors.dark

export const CardColors = {
  ink: '#1f2430',
  fill: '#C8CAC5',
  gold: {
    light: '#F0DA92',
    mid: '#C9A227',
    dark: '#9A7B1A',
  },
  glow: '#E7CE7A',
  avatarBorder: 'rgba(255,255,255,0.1)',
  avatarShadow: '#000',
  avatarEmptyBg: '#ffffff',
  nameBandBg: 'rgba(255,255,255,0.32)',
  statDivider: 'rgba(31,36,48,0.12)',
  statLabel: '#6f6a5c',
} as const

export const PlayerCardColors = {
  goldLight: '#f6e3a1',
  gold: '#dcb75e',
  goldDark: '#b8913a',
  edge: '#8f6b1f',
  edgeSoft: 'rgba(143,107,31,0.6)',
  ink: '#2b2113',
  placeholderBg: '#f3f4f6',
  placeholderFg: '#9ca3af',
} as const

export const ChampionColors = {
  heroGradient: ['#2e1065', '#4c1d95', '#2e1065'],
  onHero: '#ffffff',
  onHeroMuted: 'rgba(255,255,255,0.8)',
  onHeroDim: 'rgba(255,255,255,0.7)',
  heroRing: 'rgba(255,255,255,0.3)',
  heroDivider: 'rgba(255,255,255,0.15)',
  goldSoft: 'rgba(201,162,39,0.12)',
} as const

export const PrimaryColors = {
  gradient: ['#39186f', '#1e103f'],
  glow: PRIMARY_GLOW,
  glowOpacity: 0.45,
  border: PRIMARY,
  onPrimary: '#ffffff',
  onPrimaryMuted: 'rgba(255,255,255,0.7)',
  chipBg: 'rgba(255,255,255,0.1)',
  chipBorder: 'rgba(255,255,255,0.2)',
  divider: 'rgba(255,255,255,0.1)',
  avatarRing: 'rgba(255,255,255,0.5)',
} as const

export const ContrastColors = {
  onColor: '#ffffff',
  onColorStrong: 'rgba(255,255,255,0.95)',
  onColorSoft: 'rgba(255,255,255,0.9)',
  onColorFaded: 'rgba(255,255,255,0.75)',
  onColorMuted: 'rgba(255,255,255,0.7)',
  onColorBorderStrong: 'rgba(255,255,255,0.6)',
  onColorBorder: 'rgba(255,255,255,0.3)',
  onColorFillBright: 'rgba(255,255,255,0.8)',
  onColorFillStrong: 'rgba(255,255,255,0.2)',
  onColorFill: 'rgba(255,255,255,0.18)',
  media: '#000000',
  shadow: '#000000',
  scrimLight: 'rgba(0,0,0,0.3)',
  scrim: 'rgba(0,0,0,0.35)',
  scrimMedium: 'rgba(0,0,0,0.5)',
  scrimStrong: 'rgba(0,0,0,0.55)',
  scrimHeavy: 'rgba(0,0,0,0.7)',
  heroScrim: 'rgba(8,3,25,0.45)',
  textShadow: 'rgba(0,0,0,0.6)',
  textShadowStrong: 'rgba(0,0,0,1)',
  dividerOnLight: 'rgba(0,0,0,0.1)',
  dividerOnLightSoft: 'rgba(0,0,0,0.08)',
} as const

export const DrawerColors = {
  backdrop: 'rgba(0,0,0,0.6)',
  sheet: '#111827',
  shadow: '#000',
  handle: 'rgba(255,255,255,0.2)',
  divider: 'rgba(255,255,255,0.08)',
  text: '#F1F5F9',
  muted: '#94A3B8',
  icon: Colors.dark.primaryText,
  iconBg: 'rgba(167, 139, 250, 0.15)',
  itemPressed: 'rgba(167, 139, 250, 0.1)',
  danger: Colors.dark.dangerIcon,
  dangerBg: 'rgba(251, 146, 60, 0.15)',
  onPrimary: '#FFFFFF',
} as const

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
        shadowColor: isDark ? '#000' : PRIMARY,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: isDark ? 0.35 : 0.08,
        shadowRadius: 12,
      },
      android: { elevation: isDark ? 2 : 3 },
      default: {},
    }),
  cta: (color: string = PRIMARY) =>
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
        shadowColor: PRIMARY,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.35,
        shadowRadius: 6,
      },
      android: { elevation: 2 },
      default: {},
    }),
  navbar: () =>
    Platform.select({
      ios: {
        shadowColor: PRIMARY,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: { elevation: 6 },
      default: {},
    }),
} as const

export const Fonts = {
  regular: 'Montserrat_400Regular',
  regularItalic: 'Montserrat_400Regular_Italic',
  medium: 'Montserrat_500Medium',
  semiBold: 'Montserrat_600SemiBold',
  bold: 'Montserrat_700Bold',
  extraBold: 'Montserrat_800ExtraBold',
  extraBoldItalic: 'Montserrat_800ExtraBold_Italic',
  black: 'Montserrat_900Black',
  blackItalic: 'Montserrat_900Black_Italic',
} as const
