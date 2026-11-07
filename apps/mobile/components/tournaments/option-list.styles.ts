import { StyleSheet } from 'react-native'

import { Fonts, Radii, Spacing } from '@/constants/theme'

export const styles = StyleSheet.create({
  list: {
    borderWidth: 1,
    borderRadius: Radii.md,
    flexGrow: 0,
  },
  option: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  optionText: {
    flex: 1,
    gap: 2,
  },
  label: {
    fontFamily: Fonts.semiBold,
    fontSize: 14,
  },
  description: {
    fontFamily: Fonts.regular,
    fontSize: 12,
  },
})
