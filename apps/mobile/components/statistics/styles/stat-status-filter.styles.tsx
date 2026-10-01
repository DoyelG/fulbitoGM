import { StyleSheet } from 'react-native'

import { Fonts, Spacing } from '@/constants/theme'

export const styles = StyleSheet.create({
  select: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
  },
  selectText: {
    fontSize: 13,
    fontWeight: '700',
    fontFamily: Fonts.bold,
  },
  wrapper: {
    marginBottom: 4,
  },
})