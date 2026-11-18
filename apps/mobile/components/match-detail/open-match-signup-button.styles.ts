import { StyleSheet } from 'react-native'

import { Colors, ContrastColors, Fonts, Radii, Spacing } from '@/constants/theme'

export const styles = StyleSheet.create({
  wrap: {
    gap: Spacing.xs,
  },
  button: {
    minHeight: 48,
    minWidth: 44,
    borderRadius: Radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
    overflow: 'hidden',
  },
  joinDark: {
    backgroundColor: Colors.light.secondary,
  },
  leaveDark: {
    borderWidth: 1,
    borderColor: ContrastColors.onColorBorderStrong,
  },
  leaveLight: {
    borderWidth: 1,
    borderColor: Colors.light.danger,
  },
  disabled: {
    opacity: 0.55,
  },
  pressed: {
    opacity: 0.85,
  },
  textJoinDark: {
    color: ContrastColors.onSecondary,
    fontFamily: Fonts.extraBold,
    fontSize: 15,
  },
  textOnColor: {
    color: ContrastColors.onColor,
    fontFamily: Fonts.extraBold,
    fontSize: 15,
  },
  textLeaveLight: {
    color: Colors.light.danger,
    fontFamily: Fonts.extraBold,
    fontSize: 15,
  },
  hint: {
    fontFamily: Fonts.regular,
    fontSize: 12,
  },
})
