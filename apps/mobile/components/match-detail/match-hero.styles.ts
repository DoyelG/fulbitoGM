import { StyleSheet } from 'react-native'

import { ContrastColors, Fonts, PrimaryColors, Radii, Spacing } from '@/constants/theme'

export const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
    borderRadius: Radii.lg,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    gap: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  title: {
    color: ContrastColors.onColor,
    fontFamily: Fonts.extraBold,
    fontSize: 24,
    lineHeight: 30,
    textAlign: 'center',
    flex: 1,
  },
  badge: {
    borderRadius: Radii.pill,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    backgroundColor: ContrastColors.onColorFill,
  },
  badgeText: {
    color: ContrastColors.onColor,
    fontFamily: Fonts.bold,
    fontSize: 11,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  team: {
    flex: 1,
    color: ContrastColors.onColor,
    fontFamily: Fonts.bold,
    fontSize: 15,
    textAlign: 'center',
  },
  teamDim: {
    color: PrimaryColors.onPrimaryMuted,
  },
  scoreBox: {
    borderRadius: Radii.md,
    backgroundColor: PrimaryColors.chipBg,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xs,
  },
  score: {
    color: ContrastColors.onColor,
    fontFamily: Fonts.extraBold,
    fontSize: 28,
    fontVariant: ['tabular-nums'],
  },
})
