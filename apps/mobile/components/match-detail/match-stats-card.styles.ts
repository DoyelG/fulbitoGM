import { StyleSheet } from 'react-native'

import { Fonts, Radii, Spacing } from '@/constants/theme'

export const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: Radii.lg,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.md,
  },
  teamsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  team: {
    fontFamily: Fonts.semiBold,
    fontSize: 13,
  },
  label: {
    fontFamily: Fonts.bold,
    fontSize: 13,
    textAlign: 'center',
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginTop: Spacing.xxs,
  },
  value: {
    width: 40,
    textAlign: 'center',
    fontFamily: Fonts.semiBold,
    fontSize: 15,
    fontVariant: ['tabular-nums'],
  },
  track: {
    flex: 1,
    flexDirection: 'row',
    height: 6,
    borderRadius: Radii.pill,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
  },
})
