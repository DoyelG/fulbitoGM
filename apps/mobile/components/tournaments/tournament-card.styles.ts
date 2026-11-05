import { StyleSheet } from 'react-native'

import { Fonts, Radii, PrimaryColors, Spacing } from '@/constants/theme'

const PHOTO_SIZE = 80

export const styles = StyleSheet.create({
  card: {
    borderWidth: 1.5,
    borderRadius: Radii.lg,
    overflow: 'hidden',
  },
  photo: {
    width: PHOTO_SIZE,
    height: PHOTO_SIZE,
    borderRadius: Radii.md,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoImage: {
    ...StyleSheet.absoluteFill,
  },
  main: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  info: {
    flex: 1,
    minWidth: 0,
    alignItems: 'flex-start',
    gap: Spacing.xs,
  },
  pressed: {
    opacity: 0.85,
  },
  titleRow: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  name: {
    flex: 1,
    fontFamily: Fonts.extraBold,
    fontSize: 17,
  },
  activeBadge: {
    borderRadius: Radii.pill,
    borderWidth: 1,
    borderColor: PrimaryColors.border,
    overflow: 'hidden',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
  },
  activeText: {
    fontFamily: Fonts.black,
    fontSize: 10,
    letterSpacing: 0.5,
  },
  description: {
    fontFamily: Fonts.regular,
    fontSize: 13,
    lineHeight: 18,
  },
  stats: {
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  stat: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: Radii.sm,
    borderWidth: StyleSheet.hairlineWidth,
  },
  statText: {
    flexShrink: 1,
    fontFamily: Fonts.semiBold,
    fontSize: 13,
  },
  statMuted: {
    fontFamily: Fonts.regularItalic,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  action: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
