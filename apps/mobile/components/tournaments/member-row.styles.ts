import { StyleSheet } from 'react-native'

import { Fonts, Radii, Spacing } from '@/constants/theme'

export const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderWidth: 1,
    borderRadius: Radii.lg,
  },
  info: {
    flex: 1,
    gap: Spacing.xs,
  },
  email: {
    fontFamily: Fonts.semiBold,
    fontSize: 14,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  player: {
    flexShrink: 1,
    fontFamily: Fonts.medium,
    fontSize: 12,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  action: {
    width: 44,
    height: 44,
    borderRadius: Radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
