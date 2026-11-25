import { StyleSheet } from 'react-native'

import { Fonts, Radii, Spacing } from '@/constants/theme'

export const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: Radii.lg,
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  title: {
    fontFamily: Fonts.extraBold,
    fontSize: 16,
  },
  hint: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    lineHeight: 17,
  },
  count: {
    fontFamily: Fonts.black,
    fontSize: 32,
  },
  countOf: {
    fontFamily: Fonts.medium,
    fontSize: 14,
  },
  track: {
    height: 12,
    borderRadius: Radii.pill,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: Radii.pill,
  },
  reached: {
    fontFamily: Fonts.semiBold,
    fontSize: 13,
  },
  meta: {
    fontFamily: Fonts.regular,
    fontSize: 13,
  },
  form: {
    gap: Spacing.sm,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    justifyContent: 'flex-end',
  },
  error: {
    fontFamily: Fonts.regular,
    fontSize: 13,
  },
})
