import { StyleSheet } from 'react-native'

import { Fonts, Radii, Spacing } from '@/constants/theme'

export const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  content: {
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  title: {
    fontFamily: Fonts.extraBold,
    fontSize: 20,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  cell: {
    flex: 1,
  },
  friendlyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 52,
    borderWidth: 1,
    borderRadius: Radii.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  friendlySwitch: {
    alignSelf: 'center',
  },
  friendlyLabel: {
    fontFamily: Fonts.medium,
    fontSize: 14,
  },
  error: {
    fontFamily: Fonts.regular,
    fontSize: 13,
  },
})
