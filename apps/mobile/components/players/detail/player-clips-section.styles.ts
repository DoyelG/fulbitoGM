import { StyleSheet } from 'react-native'

import { Fonts, Radii, Spacing } from '@/constants/theme'

export const styles = StyleSheet.create({
  filterScroll: {
    marginBottom: Spacing.md,
  },
  filterRow: {
    gap: Spacing.sm,
    paddingRight: Spacing.lg,
  },
  filterChip: {
    borderWidth: 1,
    borderRadius: Radii.pill,
    paddingHorizontal: Spacing.lg,
    minHeight: 36,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  filterChipText: {
    fontFamily: Fonts.bold,
    fontSize: 12,
  },
  uploadButton: {
    overflow: 'hidden',
    borderRadius: Radii.sm,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    marginBottom: Spacing.md,
    minHeight: 44,
    justifyContent: 'center',
  },
  uploadButtonText: {
    color: '#fff',
    fontFamily: Fonts.semiBold,
    fontSize: 14,
  },
  emptyCard: {
    borderWidth: 1,
    borderRadius: Radii.lg,
    paddingVertical: Spacing.xxxl,
    alignItems: 'center',
    gap: Spacing.sm,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: Fonts.medium,
  },
})
