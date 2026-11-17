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
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  title: {
    flexShrink: 1,
    fontFamily: Fonts.blackItalic,
    fontSize: 18,
    letterSpacing: 0.5,
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
