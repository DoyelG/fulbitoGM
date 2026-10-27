import { StyleSheet } from 'react-native'

import { Radii } from '@/constants/theme'

export const styles = StyleSheet.create({
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: Radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
})
