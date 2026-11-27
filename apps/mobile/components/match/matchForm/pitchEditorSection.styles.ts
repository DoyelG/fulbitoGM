import { StyleSheet } from 'react-native'

import { Fonts, Spacing } from '@/constants/theme'

export const styles = StyleSheet.create({
  section: {
    marginTop: Spacing.lg,
    gap: Spacing.sm,
  },
  hint: {
    fontFamily: Fonts.medium,
    fontSize: 13,
  },
})
