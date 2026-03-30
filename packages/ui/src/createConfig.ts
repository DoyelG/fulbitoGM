import { createTamagui, createTokens } from 'tamagui'
import { getDefaultTamaguiConfig } from '@tamagui/config-default'

export function createFulbitoTamagui(platform: 'web' | 'native' = 'web') {
  const base = getDefaultTamaguiConfig(platform === 'native' ? 'native' : 'web')

  const fulbitoTokens = createTokens({
    color: {
      white: '#ffffff',
      black: '#171717',
      brand: '#7c3aed',
      brandHover: '#6d28d9',
      accent: '#f97316',
      sheet: '#f9fafb',
      card: '#ffffff',
      border: '#e5e7eb',
      muted: '#6b7280',
      textSecondary: '#374151',
      success: '#16a34a',
      successBg: '#dcfce7',
      winColumnBg: '#f0fdf4',
      loseColumnBg: '#fef2f2',
      warn: '#ca8a04',
      warnBg: '#fef9c3',
      danger: '#dc2626',
      dangerBg: '#fee2e2',
      indigo: '#6366f1',
      score: '#4f46e5',
      subtle: '#9ca3af',
    },
    space: base.tokens.space,
    size: base.tokens.size,
    radius: base.tokens.radius,
    zIndex: base.tokens.zIndex,
  })

  return createTamagui({
    ...base,
    media: base.media,
    shorthands: base.shorthands,
    fonts: base.fonts,
    animations: base.animations,
    tokens: fulbitoTokens,
    themes: {
      ...base.themes,
      light: {
        ...base.themes.light,
        background: fulbitoTokens.color.sheet,
        color: fulbitoTokens.color.black,
        borderColor: fulbitoTokens.color.border,
      },
      dark: {
        ...base.themes.dark,
        background: '#0c0a09',
        color: '#fafaf9',
        borderColor: '#27272a',
      },
    },
  })
}

export type FulbitoTamaguiConfig = ReturnType<typeof createFulbitoTamagui>
