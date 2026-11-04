import { StyleSheet } from 'react-native'

import { ContrastColors, Radii } from '@/constants/theme'

export const styles = StyleSheet.create({
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: Radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: ContrastColors.onColorFillStrong,
  },
})
