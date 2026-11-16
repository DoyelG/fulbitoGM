import { StyleSheet } from 'react-native'

import { Fonts, Radii, PrimaryColors, Shadows, Spacing } from '@/constants/theme'

export const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.sm,
    zIndex: 1,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: PrimaryColors.divider,
    ...Shadows.navbar(),
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    minHeight: 44,
  },
  brandLogo: {
    width: 30,
    height: 30,
  },
  primaryText: {
    fontSize: 20,
    fontFamily: Fonts.extraBold,
    color: PrimaryColors.onPrimary,
    letterSpacing: -0.3,
  },
  actions: {
    flexShrink: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  tournamentChip: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderRadius: Radii.pill,
    borderWidth: 1,
    backgroundColor: PrimaryColors.chipBg,
    borderColor: PrimaryColors.chipBorder,
  },
  tournamentChipActive: {
    borderWidth: 2,
    backgroundColor: PrimaryColors.glow,
    borderColor: PrimaryColors.onPrimary,
  },
  tournamentChipPressed: {
    opacity: 0.75,
  },
  tournamentPhoto: {
    width: '100%',
    height: '100%',
  },
  enterBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: Radii.xs,
    borderWidth: 1.5,
    backgroundColor: PrimaryColors.chipBg,
    borderColor: PrimaryColors.chipBorder,
  },
  enterText: {
    fontSize: 13,
    fontFamily: Fonts.bold,
    color: PrimaryColors.onPrimary,
    letterSpacing: 1.5,
  },
  badge: {
    position: 'absolute',
    top: -8,
    right: -8,
  },
})
