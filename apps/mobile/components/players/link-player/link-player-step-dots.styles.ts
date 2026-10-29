import { StyleSheet } from 'react-native'

import { Spacing } from '@/constants/theme'

export const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
})
