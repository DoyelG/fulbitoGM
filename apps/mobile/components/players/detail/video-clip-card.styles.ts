import { StyleSheet } from 'react-native'
import { Fonts, Radii, Spacing } from '@/constants/theme'

export const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: '30%',
    borderWidth: 1,
    borderRadius: Radii.md,
    overflow: 'hidden',
  },
  pressable: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    minHeight: 44,
  },
  icon: {
    fontSize: 28,
  },
  label: {
    fontSize: 11,
    fontFamily: Fonts.semiBold,
    textAlign: 'center',
    marginTop: Spacing.xs,
  },
  date: {
    fontSize: 10,
    fontFamily: Fonts.medium,
    marginTop: 2,
  },
  deleteBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 24,
    height: 24,
    borderRadius: Radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
