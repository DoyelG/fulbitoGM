import { StyleSheet } from 'react-native'

import { ContrastColors, Fonts, Radii, Spacing } from '@/constants/theme'

export const styles = StyleSheet.create({
  container: {
    marginTop: Spacing.sm,
    gap: Spacing.xs,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  button: {
    overflow: 'hidden',
    minHeight: 44,
    minWidth: 44,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
    borderRadius: Radii.pill,
  },
  outlined: {
    borderWidth: 1,
  },
  disabled: {
    opacity: 0.5,
  },
  joinText: {
    color: ContrastColors.onColor,
    fontFamily: Fonts.semiBold,
    fontSize: 14,
  },
  buttonText: {
    fontFamily: Fonts.semiBold,
    fontSize: 14,
  },
  status: {
    fontFamily: Fonts.semiBold,
    fontSize: 13,
  },
  error: {
    fontFamily: Fonts.regular,
    fontSize: 12,
  },
})
