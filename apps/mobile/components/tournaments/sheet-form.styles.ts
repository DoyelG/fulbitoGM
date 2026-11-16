import { StyleSheet } from 'react-native'

import { Fonts, Spacing } from '@/constants/theme'

export const sheetFormStyles = StyleSheet.create({
  scroll: {
    flexGrow: 0,
  },
  content: {
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  text: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    lineHeight: 20,
  },
  strong: {
    fontFamily: Fonts.semiBold,
  },
  hint: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    marginTop: Spacing.xs,
  },
  multiline: {
    minHeight: 88,
    paddingTop: Spacing.sm,
    textAlignVertical: 'top',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.sm,
  },
})
