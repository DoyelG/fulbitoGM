import { StyleSheet } from 'react-native'

import { Fonts, Radii, Spacing } from '@/constants/theme'

export const styles = StyleSheet.create({
  section: {
    borderRadius: Radii.lg,
    padding: Spacing.xl,
    marginTop: Spacing.lg,
    marginBottom: Spacing.md,
    overflow: 'hidden',
  },
  label: {
    fontFamily: Fonts.extraBold,
    fontSize: 11,
    letterSpacing: 2,
    marginBottom: Spacing.md,
  },
  emptyText: {
    fontFamily: Fonts.medium,
    fontSize: 14,
    lineHeight: 20,
  },
  championRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  avatarRing: {
    borderRadius: Radii.pill,
    borderWidth: 3,
    padding: 2,
  },
  championText: {
    flex: 1,
  },
  name: {
    fontFamily: Fonts.blackItalic,
    fontSize: 22,
  },
  meta: {
    fontFamily: Fonts.bold,
    fontSize: 12,
    marginTop: 4,
    letterSpacing: 0.5,
  },
  divider: {
    height: 1,
    marginVertical: Spacing.xl,
  },
})
