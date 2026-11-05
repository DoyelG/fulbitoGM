import { StyleSheet } from 'react-native'

import { Fonts, Radii, Spacing } from '@/constants/theme'

export const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: Radii.lg,
    padding: Spacing.lg,
  },
  mvp: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    borderRadius: Radii.md,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  mvpBody: {
    flex: 1,
  },
  mvpLabel: {
    fontFamily: Fonts.bold,
    fontSize: 11,
    letterSpacing: 0.6,
  },
  mvpName: {
    fontFamily: Fonts.bold,
    fontSize: 16,
  },
  subtitle: {
    fontFamily: Fonts.semiBold,
    fontSize: 14,
    marginBottom: Spacing.xs,
  },
  empty: {
    fontFamily: Fonts.regularItalic,
    fontSize: 14,
    marginBottom: Spacing.md,
  },
  scorer: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  scorerName: {
    flex: 1,
    fontFamily: Fonts.semiBold,
    fontSize: 14,
  },
  scorerTeam: {
    fontFamily: Fonts.regular,
    fontSize: 12,
  },
  scorerGoals: {
    fontFamily: Fonts.bold,
    fontSize: 14,
    fontVariant: ['tabular-nums'],
  },
})
