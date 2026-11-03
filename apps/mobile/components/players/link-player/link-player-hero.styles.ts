import { StyleSheet } from 'react-native'

import { Radii, Spacing } from '@/constants/theme'

export const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: Spacing.sm,
  },
  iconWrap: {
    width: 80,
    height: 80,
    marginBottom: Spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circle: {
    width: 80,
    height: 80,
    borderRadius: Radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
})
