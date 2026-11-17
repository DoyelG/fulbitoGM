import { StyleSheet } from 'react-native'

import { Fonts, Radii, Spacing } from '@/constants/theme'

export const styles = StyleSheet.create({
  section: {
    gap: Spacing.sm,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  title: {
    fontFamily: Fonts.blackItalic,
    fontSize: 16,
    letterSpacing: 0.3,
  },
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
    gap: 2,
  },
  email: {
    fontFamily: Fonts.semiBold,
    fontSize: 14,
  },
  detail: {
    fontFamily: Fonts.regular,
    fontSize: 12,
  },
})
