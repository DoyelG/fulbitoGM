import { StyleSheet } from 'react-native'

import { Fonts, Spacing } from '@/constants/theme'

export const styles = StyleSheet.create({
  list: {
    flex: 1,
  },
  content: {
    gap: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  placeholder: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    fontFamily: Fonts.regularItalic,
    fontSize: 13,
    textAlign: 'center',
  },
  error: {
    fontFamily: Fonts.medium,
    fontSize: 13,
  },
  emptyError: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
  },
  loadingOlder: {
    paddingVertical: Spacing.md,
  },
})
