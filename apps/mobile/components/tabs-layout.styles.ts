import { StyleSheet } from 'react-native'

import { Spacing } from '@/constants/theme'

export const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  tabBarItem: {
    paddingVertical: Spacing.sm,
  },
  hiddenTabBar: {
    display: 'none',
  },
  hiddenTabItem: {
    display: 'none',
  },
  overlay: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
