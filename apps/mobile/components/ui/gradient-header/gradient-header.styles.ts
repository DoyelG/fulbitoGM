import { StyleSheet } from 'react-native'

import { Radii, Spacing } from '@/constants/theme'

export const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
    padding: Spacing.xl,
    marginBottom: Spacing.lg,
    borderRadius: Radii.xl,
    overflow: 'hidden',
  },
  bannerCentered: {
    flexDirection: 'column',
    gap: Spacing.sm,
  },
  textWrap: {
    alignItems: 'center',
    gap: Spacing.xs,
  },
  textWrapRow: {
    alignItems: 'flex-start',
    gap: 0,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
  },
})
