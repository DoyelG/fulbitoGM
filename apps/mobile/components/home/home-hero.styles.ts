import { StyleSheet } from 'react-native'

import { ContrastColors, Fonts } from '@/constants/theme'

export const styles = StyleSheet.create({
  hero: {
    height: 340,
    overflow: 'hidden',
  },

  backgroundImage: {
    ...StyleSheet.absoluteFill,
    width: '100%',
    height: '100%',
  },

  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: ContrastColors.heroScrim,
  },

  fade: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 260,
  },

  content: {
    position: 'absolute',
    bottom: 28,
    left: 20,
    right: 20,
  },

  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  brandDot: {
    width: 7,
    height: 7,
    borderRadius: 2,
  },
  brandLabel: {
    fontFamily: Fonts.semiBold,
    fontSize: 11,
    letterSpacing: 2.5,
  },

  line2: {
    fontFamily: Fonts.blackItalic,
    fontSize: 48,
    color: ContrastColors.onColor,
    lineHeight: 50,
    letterSpacing: -1,
  },
  line3: {
    fontFamily: Fonts.blackItalic,
    fontSize: 48,
    lineHeight: 56,
    marginBottom: 14,
  },

  sub: {
    fontFamily: Fonts.bold,
    fontSize: 13,
    lineHeight: 19,
    color: ContrastColors.onColorFaded,
    textShadowColor: ContrastColors.textShadow,
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
  },
  subLight: {
    color: ContrastColors.onColorStrong,
    textShadowColor: ContrastColors.textShadowStrong,
    textShadowRadius: 10,
  },
})
