import { StyleSheet } from 'react-native'

import { Fonts, Radii, Spacing } from '@/constants/theme'

export const styles = StyleSheet.create({
  trigger: {
    minHeight: 48,
    minWidth: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    borderWidth: 1,
    borderRadius: Radii.md,
    paddingLeft: Spacing.md,
    paddingRight: Spacing.sm,
  },
  triggerText: {
    fontFamily: Fonts.semiBold,
    fontSize: 15,
  },
  disabled: {
    opacity: 0.55,
  },
  option: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  optionText: {
    fontFamily: Fonts.semiBold,
    fontSize: 15,
  },
  optionHint: {
    fontFamily: Fonts.regular,
    fontSize: 12,
  },
  optionLabel: {
    gap: 2,
  },
})
