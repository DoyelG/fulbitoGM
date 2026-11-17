import { StyleSheet } from 'react-native'

import { ContrastColors, Fonts, PrimaryColors, Radii, Spacing } from '@/constants/theme'

const LOGO_SIZE = 40

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
  side: {
    flex: 1,
  },
  logo: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
    borderRadius: Radii.pill,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: PrimaryColors.chipBg,
    borderWidth: 1,
    borderColor: ContrastColors.onColorBorder,
  },
  logoImage: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
  },
  title: {
    color: ContrastColors.onColor,
    fontFamily: Fonts.extraBold,
    fontSize: 20,
    textAlign: 'center',
    flexShrink: 1,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: Spacing.xs,
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
