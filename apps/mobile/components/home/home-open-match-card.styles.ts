import { StyleSheet } from 'react-native'

import { ContrastColors, Fonts, Radii, Spacing } from '@/constants/theme'

export const openStyles = StyleSheet.create({
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  summary: {
    color: ContrastColors.onColorSoft,
    fontFamily: Fonts.semiBold,
    fontSize: 13,
  },
  count: {
    overflow: 'hidden',
    borderRadius: Radii.pill,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    backgroundColor: ContrastColors.onColorBorder,
    color: ContrastColors.onColor,
    fontFamily: Fonts.bold,
    fontSize: 12,
  },
  actions: {
    gap: Spacing.sm,
    marginTop: Spacing.lg,
  },
  secondaryBtn: {
    minHeight: 48,
    borderRadius: Radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: ContrastColors.onColorBorderStrong,
  },
  secondaryText: {
    color: ContrastColors.onColor,
    fontFamily: Fonts.extraBold,
    fontSize: 15,
  },
})
