import { StyleSheet } from 'react-native'

import { Fonts, Radii, Spacing } from '@/constants/theme'

export const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  cell: {
    flexBasis: '31%',
    flexGrow: 1,
    borderWidth: 1,
    borderRadius: Radii.md,
    padding: Spacing.md,
    gap: Spacing.xs,
  },
  label: {
    fontFamily: Fonts.medium,
    fontSize: 11,
  },
  value: {
    fontFamily: Fonts.black,
    fontSize: 20,
  },
})
