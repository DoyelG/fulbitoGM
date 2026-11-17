import { StyleSheet } from 'react-native'

import { Fonts, Radii, Spacing } from '@/constants/theme'

export const styles = StyleSheet.create({
  below: {
    marginTop: Spacing.xs,
  },
  above: {
    marginBottom: Spacing.sm,
  },
  list: {
    borderWidth: 1,
    borderRadius: Radii.md,
    padding: Spacing.xs,
  },
  option: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.md,
    borderRadius: Radii.sm,
    paddingHorizontal: Spacing.md,
  },
  name: {
    flexShrink: 1,
    fontFamily: Fonts.medium,
    fontSize: 14,
  },
  handle: {
    fontFamily: Fonts.regular,
    fontSize: 12,
  },
})
