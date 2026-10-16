import { StyleSheet } from 'react-native'
import { Fonts, Radii, Spacing } from '@/constants/theme'

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
    backgroundColor: '#000',
  },
  categoryBadge: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
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
    position: 'absolute',
    top: 0,
    right: 0,
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
