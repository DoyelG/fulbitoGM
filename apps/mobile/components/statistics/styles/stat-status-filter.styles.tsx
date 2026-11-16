import { StyleSheet } from 'react-native'

import { Fonts } from '@/constants/theme'

export const styles = StyleSheet.create({
  select: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 36,
    borderWidth: 1,
  },
  selectText: {
    fontSize: 12,
    fontWeight: '700',
    fontFamily: Fonts.bold,
  },
  icon: {
    marginRight: 6,
  },
  check: {
    fontSize: 16,
    fontWeight: '700',
  },
})
