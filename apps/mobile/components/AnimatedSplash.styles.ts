import { StyleSheet } from 'react-native'

import { Fonts, Radii, Spacing } from '@/constants/theme'

export const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
    elevation: 999,
  },
  wordmark: {
    fontFamily: Fonts.black,
    fontSize: 44,
    letterSpacing: 0.5,
    color: '#ffffff',
  },
  underline: {
    height: 4,
    width: 64,
    marginTop: Spacing.md,
    borderRadius: Radii.pill,
    backgroundColor: '#ffffff',
  },
})
