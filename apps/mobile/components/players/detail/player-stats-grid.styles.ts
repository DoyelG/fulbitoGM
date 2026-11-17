import { StyleSheet } from 'react-native'

import { Fonts, Radii, Spacing } from '@/constants/theme'

export const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  box: {
    flex: 1,
    minWidth: '45%',
    borderWidth: 1,
    borderRadius: Radii.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    gap: Spacing.xs,
  },
  label: {
    fontSize: 12,
    fontFamily: Fonts.extraBold,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    flexWrap: 'wrap',
    columnGap: Spacing.sm,
  },
  value: {
    fontSize: 26,
    lineHeight: 32,
    fontFamily: Fonts.extraBold,
    letterSpacing: -0.5,
  },
  sub: {
    fontSize: 13,
    fontFamily: Fonts.semiBold,
  },
})
