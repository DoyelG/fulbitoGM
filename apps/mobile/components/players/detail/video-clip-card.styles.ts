import { StyleSheet } from 'react-native'
import { ContrastColors, Fonts, Radii, Spacing } from '@/constants/theme'

export const styles = StyleSheet.create({
  card: {
    width: 128,
    borderWidth: 1,
    borderRadius: Radii.md,
    overflow: 'hidden',
  },
  pressable: {
    minHeight: 44,
  },
  thumbnail: {
    height: 96,
    width: '100%',
    backgroundColor: ContrastColors.media,
  },
  video: {
    width: '100%',
    height: '100%',
  },
  categoryBadge: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ContrastColors.scrimHeavy,
    borderRadius: Radii.sm,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  categoryBadgeIcon: {
    fontSize: 12,
  },
  labelBlock: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.sm,
  },
  label: {
    fontSize: 11,
    fontFamily: Fonts.semiBold,
    textAlign: 'center',
  },
  date: {
    fontSize: 10,
    fontFamily: Fonts.medium,
    textAlign: 'center',
    marginTop: 2,
  },
  deleteBtn: {
    backgroundColor: ContrastColors.scrimStrong,
    position: 'absolute',
    top: 0,
    right: 0,
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
