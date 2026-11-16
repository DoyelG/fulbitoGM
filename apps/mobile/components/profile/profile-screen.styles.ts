import { StyleSheet } from 'react-native'

import { Fonts, Spacing } from '@/constants/theme'

export const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  content: {
    gap: Spacing.lg,
    padding: Spacing.lg,
    paddingBottom: Spacing.xxxl,
  },
  groupTitle: {
    marginTop: Spacing.sm,
    fontFamily: Fonts.bold,
    fontSize: 13,
    letterSpacing: 0.5,
  },
})
