import { StyleSheet } from 'react-native'

import { Fonts, Radii, Spacing } from '@/constants/theme'

export const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  content: {
    gap: Spacing.lg,
    padding: Spacing.lg,
    paddingBottom: Spacing.xxxl,
  },
  createRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  loading: {
    paddingVertical: Spacing.xxl,
  },
  errorCard: {
    gap: Spacing.md,
    padding: Spacing.lg,
    borderRadius: Radii.lg,
  },
  errorText: {
    fontFamily: Fonts.semiBold,
    fontSize: 14,
  },
})
