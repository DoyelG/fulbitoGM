import { StyleSheet } from 'react-native'

import { Fonts, Radii, Spacing } from '@/constants/theme'

export const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: Radii.lg,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.md,
  },
  rowBody: {
    flex: 1,
    gap: 2,
  },
  label: {
    fontFamily: Fonts.medium,
    fontSize: 12,
  },
  value: {
    fontFamily: Fonts.semiBold,
    fontSize: 15,
  },
  emptyValue: {
    fontFamily: Fonts.regularItalic,
    fontSize: 14,
  },
  link: {
    textDecorationLine: 'underline',
  },
  street: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    marginTop: 2,
  },
  description: {
    overflow: 'hidden',
    borderRadius: Radii.sm,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    fontFamily: Fonts.regular,
    fontSize: 14,
  },
})
