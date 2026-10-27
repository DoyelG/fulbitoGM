import { StyleSheet } from 'react-native'

import { Radii, Spacing } from '@/constants/theme'

export const styles = StyleSheet.create({
  button: {
    borderWidth: 1,
    minHeight: 44,
    paddingHorizontal: Spacing.xl,
    borderRadius: Radii.pill,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    fontSize: 15,
    fontWeight: '700',
  },
})
