import { StyleSheet } from 'react-native'

import { Fonts, Radii, Spacing } from '@/constants/theme'

export const styles = StyleSheet.create({
  list: {
    gap: Spacing.sm,
  },
  row: {
    borderWidth: 1,
    borderRadius: Radii.md,
    minHeight: 44,
  },
  rowContent: {
    padding: Spacing.md,
    gap: Spacing.xs,
  },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  resultWithDelete: {
    marginRight: 44,
  },
  deleteButton: {
    position: 'absolute',
    top: 0,
    right: 0,
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  date: {
    fontFamily: Fonts.semiBold,
    fontSize: 11,
    letterSpacing: 0.5,
  },
  result: {
    fontFamily: Fonts.bold,
    fontSize: 11,
  },
  middle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  score: {
    fontFamily: Fonts.black,
    fontSize: 18,
  },
  label: {
    flex: 1,
    fontFamily: Fonts.regular,
    fontSize: 13,
  },
  stats: {
    fontFamily: Fonts.semiBold,
    fontSize: 13,
  },
  empty: {
    fontFamily: Fonts.regular,
    fontSize: 13,
  },
})
