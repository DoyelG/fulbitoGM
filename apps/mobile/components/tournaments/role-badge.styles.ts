import { StyleSheet } from 'react-native'

import { Fonts, Radii, Spacing } from '@/constants/theme'

export const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    borderRadius: Radii.pill,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
  },
  text: {
    fontFamily: Fonts.bold,
    fontSize: 11,
    letterSpacing: 0.3,
  },
})
