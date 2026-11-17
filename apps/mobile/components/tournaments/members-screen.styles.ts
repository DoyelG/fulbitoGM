import { StyleSheet } from 'react-native'

import { Fonts, Radii, Spacing } from '@/constants/theme'

export const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  content: {
    gap: Spacing.md,
    padding: Spacing.lg,
    paddingBottom: Spacing.xxxl,
  },
  back: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  backText: {
    fontFamily: Fonts.semiBold,
    fontSize: 14,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  loading: {
    paddingVertical: Spacing.xxl,
  },
  notice: {
    padding: Spacing.md,
    borderRadius: Radii.md,
  },
  noticeText: {
    fontFamily: Fonts.regular,
    fontSize: 13,
    lineHeight: 19,
  },
  noticeStrong: {
    fontFamily: Fonts.semiBold,
  },
})
