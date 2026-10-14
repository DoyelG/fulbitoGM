import { StyleSheet } from 'react-native'

import { Radii, Spacing } from '@/constants/theme'

export const styles = StyleSheet.create({
  wrap: {
    paddingVertical: Spacing.xxxl,
    paddingHorizontal: Spacing.xxl,
    alignItems: 'center',
    gap: Spacing.sm,
  },
  iconWrap: {
    width: 80,
    height: 80,
    borderRadius: Radii.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  title: {
    fontSize: 18,
    textAlign: 'center',
  },
  description: {
    textAlign: 'center',
    lineHeight: 22,
  },
  action: {
    minHeight: 44,
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: Radii.pill,
    justifyContent: 'center',
  },
  actionText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
})
