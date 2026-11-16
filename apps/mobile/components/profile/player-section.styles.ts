import { StyleSheet } from 'react-native'

import { Fonts, Radii, Spacing } from '@/constants/theme'

export const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderRadius: Radii.lg,
  },
  photoColumn: {
    alignItems: 'center',
    gap: Spacing.sm,
    maxWidth: 96,
  },
  photoButton: {
    width: 80,
    height: 80,
  },
  photoFrame: {
    width: 80,
    height: 80,
    borderRadius: Radii.pill,
    borderWidth: 2,
    overflow: 'hidden',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  photoOverlay: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraBadge: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 30,
    height: 30,
    borderRadius: Radii.pill,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoError: {
    fontFamily: Fonts.medium,
    fontSize: 11,
    textAlign: 'center',
  },
  details: {
    flex: 1,
    minWidth: 0,
    gap: Spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    minHeight: 44,
  },
  identity: {
    flex: 1,
    minWidth: 0,
  },
  name: {
    fontFamily: Fonts.bold,
    fontSize: 17,
  },
  position: {
    fontFamily: Fonts.medium,
    fontSize: 13,
  },
  stats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  stat: {
    flexGrow: 1,
    flexBasis: '45%',
    borderRadius: Radii.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  statLabel: {
    fontFamily: Fonts.medium,
    fontSize: 11,
  },
  statValue: {
    fontFamily: Fonts.bold,
    fontSize: 17,
    fontVariant: ['tabular-nums'],
  },
})
