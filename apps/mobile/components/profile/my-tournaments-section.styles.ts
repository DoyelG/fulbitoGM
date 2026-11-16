import { StyleSheet } from 'react-native'

import { Fonts, Radii, Spacing } from '@/constants/theme'

const PHOTO_SIZE = 48

export const styles = StyleSheet.create({
  list: {
    gap: Spacing.sm,
  },
  empty: {
    fontFamily: Fonts.regular,
    fontSize: 14,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    minHeight: 44,
    paddingVertical: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  pressed: {
    opacity: 0.7,
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
    width: '100%',
    height: '100%',
  },
  info: {
    flex: 1,
    minWidth: 0,
    gap: Spacing.xs,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  name: {
    flexShrink: 1,
    fontFamily: Fonts.bold,
    fontSize: 15,
  },
  activeBadge: {
    borderRadius: Radii.pill,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
  },
  activeText: {
    fontFamily: Fonts.black,
    fontSize: 10,
    letterSpacing: 0.5,
  },
  unread: {
    fontFamily: Fonts.bold,
    fontSize: 12,
  },
  player: {
    fontFamily: Fonts.regular,
    fontSize: 13,
  },
})
