import { StyleSheet } from 'react-native'

import { Colors, ContrastColors, Fonts, Radii, Spacing } from '@/constants/theme'

export const styles = StyleSheet.create({
  card: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
    borderRadius: Radii.xl,
    overflow: 'hidden',
    padding: Spacing.xl,
    gap: Spacing.xs,
  },
  eyebrow: {
    color: ContrastColors.onColorMuted,
    fontFamily: Fonts.bold,
    fontSize: 12,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  date: {
    color: ContrastColors.onColor,
    fontFamily: Fonts.extraBold,
    fontSize: 20,
  },
  time: {
    color: Colors.light.secondary,
  },
  location: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: 2,
    alignSelf: 'flex-start',
  },
  locationText: {
    flexShrink: 1,
    color: ContrastColors.onColorMuted,
    fontFamily: Fonts.regular,
    fontSize: 13,
  },
  locationName: {
    color: ContrastColors.onColor,
    fontFamily: Fonts.semiBold,
  },
  primaryBtn: {
    minHeight: 48,
    borderRadius: Radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.light.secondary,
    paddingHorizontal: Spacing.xl,
    marginTop: Spacing.lg,
  },
  primaryText: {
    color: ContrastColors.onSecondary,
    fontFamily: Fonts.extraBold,
    fontSize: 15,
  },
  pressed: {
    opacity: 0.85,
  },
})
