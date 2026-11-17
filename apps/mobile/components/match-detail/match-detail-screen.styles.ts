import { StyleSheet } from 'react-native'

import { ContrastColors, Fonts, Radii, Spacing } from '@/constants/theme'

export const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.xxl,
  },
  message: {
    fontFamily: Fonts.medium,
    fontSize: 15,
    textAlign: 'center',
  },
  retryBtn: {
    overflow: 'hidden',
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
    borderRadius: Radii.pill,
  },
  retryText: {
    color: ContrastColors.onColor,
    fontFamily: Fonts.semiBold,
    fontSize: 15,
  },
  scroll: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xxxl,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },
  iconBtn: {
    width: 44,
    height: 44,
    paddingHorizontal: 0,
    borderRadius: Radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtn: {
    overflow: 'hidden',
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radii.pill,
  },
  actionText: {
    color: ContrastColors.onColor,
    fontFamily: Fonts.semiBold,
    fontSize: 14,
  },
  sectionTitle: {
    fontFamily: Fonts.blackItalic,
    fontSize: 13,
    letterSpacing: 0.8,
    marginTop: Spacing.xl,
    marginBottom: Spacing.sm,
  },
  teams: {
    gap: Spacing.md,
  },
})
