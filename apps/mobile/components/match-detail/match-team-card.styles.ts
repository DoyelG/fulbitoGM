import { StyleSheet } from 'react-native'

import { Fonts, Radii, Spacing } from '@/constants/theme'

export const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: Radii.md,
    padding: Spacing.md,
    gap: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  title: {
    fontFamily: Fonts.bold,
    fontSize: 16,
  },
  result: {
    overflow: 'hidden',
    borderRadius: Radii.pill,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    fontFamily: Fonts.bold,
    fontSize: 11,
  },
  empty: {
    textAlign: 'center',
    fontFamily: Fonts.regularItalic,
    fontSize: 14,
  },
  list: {
    gap: Spacing.sm,
  },
  row: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    borderRadius: Radii.sm,
    paddingHorizontal: Spacing.md,
  },
  rowCentered: {
    justifyContent: 'center',
  },
  name: {
    flex: 1,
    fontFamily: Fonts.bold,
    fontSize: 14,
  },
  nameCentered: {
    flex: 0,
    textAlign: 'center',
  },
  stats: {
    fontFamily: Fonts.medium,
    fontSize: 13,
    fontVariant: ['tabular-nums'],
  },
  footer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    columnGap: Spacing.lg,
    rowGap: Spacing.xs,
    borderRadius: Radii.sm,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  footerStat: {
    fontFamily: Fonts.semiBold,
    fontSize: 14,
    fontVariant: ['tabular-nums'],
  },
})
