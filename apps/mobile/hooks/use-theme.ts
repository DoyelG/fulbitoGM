import { Colors, Radii, Shadows, Spacing } from '@/constants/theme'
import { useColorScheme } from '@/hooks/use-color-scheme'

type ThemeColors = { [K in keyof typeof Colors.light]: string }

export type AppTheme = {
  scheme: 'light' | 'dark'
  isDark: boolean
  colors: ThemeColors
  radii: typeof Radii
  spacing: typeof Spacing
  shadows: typeof Shadows
}

export function useAppTheme(): AppTheme {
  const scheme = useColorScheme() ?? 'light'
  return {
    scheme,
    isDark: scheme === 'dark',
    colors: Colors[scheme],
    radii: Radii,
    spacing: Spacing,
    shadows: Shadows,
  }
}
