import { StyleSheet } from 'react-native'

import { Fonts, Radii, Spacing } from '@/constants/theme'

export const styles = StyleSheet.create({
  list: {
    marginTop: Spacing.md,
    gap: Spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    borderRadius: Radii.md,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  position: {
    width: 22,
    fontFamily: Fonts.extraBold,
    fontSize: 13,
  },
  name: {
    flex: 1,
    fontFamily: Fonts.semiBold,
    fontSize: 14,
  },
  value: {
    fontFamily: Fonts.bold,
    fontSize: 14,
  },
  unit: {
    fontFamily: Fonts.semiBold,
    fontSize: 10,
    letterSpacing: 0.5,
  },
})
