import { StyleSheet } from 'react-native'

import { ContrastColors, Fonts, Radii, Spacing } from '@/constants/theme'

const PHOTO_SIZE = 24
export const TRIGGER_HEIGHT = 34

export const styles = StyleSheet.create({
  trigger: {
    flexShrink: 1,
    height: TRIGGER_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    borderWidth: 1,
    borderRadius: Radii.pill,
    paddingLeft: Spacing.xs,
    paddingRight: Spacing.md,
  },
  pressed: {
    opacity: 0.8,
  },
  photo: {
    width: PHOTO_SIZE,
    height: PHOTO_SIZE,
    borderRadius: Radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  name: {
    flexShrink: 1,
    fontFamily: Fonts.semiBold,
    fontSize: 14,
  },
  count: {
    minWidth: 20,
    height: 20,
    borderRadius: Radii.pill,
    paddingHorizontal: Spacing.xs,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countText: {
    color: ContrastColors.onColor,
    fontFamily: Fonts.bold,
    fontSize: 11,
  },
  sheetList: {
    maxHeight: 360,
  },
  sheetContent: {
    gap: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xxl,
  },
  option: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    borderRadius: Radii.md,
    paddingHorizontal: Spacing.md,
  },
  optionName: {
    flex: 1,
    fontFamily: Fonts.semiBold,
    fontSize: 15,
  },
})
