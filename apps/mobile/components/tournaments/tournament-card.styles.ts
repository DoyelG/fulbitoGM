import { StyleSheet } from 'react-native'

import { Fonts, Radii, PrimaryColors, Spacing } from '@/constants/theme'

export const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    borderWidth: 1.5,
    borderRadius: Radii.lg,
    overflow: 'hidden',
  },
  photo: {
    width: 88,
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoImage: {
    ...StyleSheet.absoluteFill,
  },
  body: {
    flex: 1,
    minWidth: 0,
  },
  main: {
    gap: Spacing.xs,
    padding: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  pressed: {
    opacity: 0.85,
  },
  titleRow: {
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
