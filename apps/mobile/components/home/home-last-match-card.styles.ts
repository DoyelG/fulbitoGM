import { StyleSheet } from 'react-native'

import { ContrastColors, Fonts, PitchColors, Radii, Spacing } from '@/constants/theme'

export const styles = StyleSheet.create({
  heading: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'baseline',
    justifyContent: 'center',
    columnGap: Spacing.sm,
    rowGap: Spacing.xs,
  },
  kicker: {
    color: PitchColors.kicker,
    fontFamily: Fonts.bold,
    fontSize: 12,
    letterSpacing: 1.7,
  },
  longDate: {
    color: PitchColors.kickerDate,
    fontFamily: Fonts.regular,
    fontSize: 14,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
  },
  team: {
    flex: 1,
    textAlign: 'center',
    color: ContrastColors.onColor,
    fontFamily: Fonts.bold,
    fontSize: 15,
  },
  winner: {
    color: PitchColors.teamARing,
  },
  score: {
    color: ContrastColors.onColor,
    fontFamily: Fonts.black,
    fontSize: 48,
    lineHeight: 52,
    fontVariant: ['tabular-nums'],
    textShadowColor: PitchColors.scoreGlow,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 18,
  },
  scoreSeparator: {
    color: PitchColors.scoreSeparator,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    maxWidth: '100%',
    paddingVertical: Spacing.xs,
    paddingLeft: Spacing.xs,
    paddingRight: Spacing.md,
    borderRadius: Radii.pill,
    backgroundColor: PitchColors.badgeBg,
  },
  badgeText: {
    flexShrink: 1,
    color: ContrastColors.onColorSoft,
    fontFamily: Fonts.semiBold,
    fontSize: 13,
  },
  cta: {
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.md,
    borderRadius: Radii.md,
  },
  ctaText: {
    color: ContrastColors.onSecondary,
    fontFamily: Fonts.extraBold,
    fontSize: 15,
  },
})
