import { StyleSheet } from 'react-native'

import { Radii, Spacing } from '@/constants/theme'

export const styles = StyleSheet.create({
  card: {
    gap: Spacing.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderRadius: Radii.lg,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: Radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
  },
})
