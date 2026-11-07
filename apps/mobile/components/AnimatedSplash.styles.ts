import { StyleSheet } from 'react-native'

import { ContrastColors, Fonts, Radii, Spacing } from '@/constants/theme'

export const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
    elevation: 999,
  },
  wordmark: {
    fontFamily: Fonts.black,
    fontSize: 44,
    letterSpacing: 0.5,
    color: ContrastColors.onColor,
  },
  underline: {
    height: 4,
    width: 64,
    marginTop: Spacing.md,
    borderRadius: Radii.pill,
    backgroundColor: ContrastColors.onColor,
  },
})
