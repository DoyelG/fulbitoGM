import { StyleSheet } from 'react-native'

import { Fonts, Radii, Spacing } from '@/constants/theme'

export const styles = StyleSheet.create({
  intro: {
    marginBottom: Spacing.xl,
  },
  title: {
    fontFamily: Fonts.blackItalic,
    fontSize: 22,
  },
  subtitle: {
    fontFamily: Fonts.medium,
    fontSize: 14,
    lineHeight: 20,
    marginTop: Spacing.xs,
  },
  empty: {
    borderWidth: 1,
    borderRadius: Radii.lg,
    padding: Spacing.xxl,
  },
  emptyText: {
    fontFamily: Fonts.semiBold,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
  yearLabel: {
    fontFamily: Fonts.extraBold,
    fontSize: 12,
    letterSpacing: 2,
    marginTop: Spacing.xl,
    marginBottom: Spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    borderWidth: 1,
    borderRadius: Radii.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  avatarRing: {
    borderRadius: Radii.pill,
    borderWidth: 2,
    padding: 2,
  },
  name: {
    flex: 1,
    fontFamily: Fonts.bold,
    fontSize: 16,
  },
  meta: {
    fontFamily: Fonts.bold,
    fontSize: 12,
    textAlign: 'right',
    maxWidth: 96,
  },
})
