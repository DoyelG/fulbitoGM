import { StyleSheet } from 'react-native'

import { Radii, Spacing } from '@/constants/theme'

export const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
  },
  preview: {
    width: 64,
    height: 64,
    borderRadius: Radii.md,
    borderWidth: 1,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  actions: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
})
