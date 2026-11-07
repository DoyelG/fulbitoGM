import { StyleSheet } from 'react-native'

import { ContrastColors, Radii, Spacing } from '@/constants/theme'

export const styles = StyleSheet.create({
  avatar: {
    width: 96,
    height: 96,
    borderRadius: Radii.pill,
    borderWidth: 4,
    borderColor: ContrastColors.onColorBorderStrong,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: ContrastColors.onColorFillStrong,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarText: {
    fontSize: 40,
    fontWeight: '700',
    color: ContrastColors.onColor,
    textTransform: 'uppercase',
  },
  roles: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  role: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radii.pill,
    backgroundColor: ContrastColors.onColorFillStrong,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '700',
    color: ContrastColors.onColor,
  },
})
