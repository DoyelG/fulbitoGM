import { StyleSheet } from 'react-native'

import { Fonts, Radii, PrimaryColors, Spacing } from '@/constants/theme'

export const styles = StyleSheet.create({
  card: {
    borderWidth: 1.5,
    borderRadius: Radii.lg,
    overflow: 'hidden',
  },
  main: {
    flexDirection: 'row',
    gap: Spacing.md,
    padding: Spacing.lg,
  },
  pressed: {
    opacity: 0.85,
  },
  photo: {
    width: 56,
    height: 56,
    borderRadius: Radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  photoImage: {
    width: '100%',
    height: '100%',
  },
  info: {
    flex: 1,
    gap: Spacing.xs,
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
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  stat: {
    flex: 1,
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: Radii.md,
  },
  statText: {
    flexShrink: 1,
    fontFamily: Fonts.semiBold,
    fontSize: 13,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.sm,
    padding: Spacing.md,
  },
  action: {
    width: 44,
    height: 44,
    borderRadius: Radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
