import { StyleSheet } from 'react-native'

import { Radii, Spacing } from '@/constants/theme'

export const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
    paddingLeft: Spacing.lg,
    borderRadius: Radii.md,
  },
  textWrap: {
    flex: 1,
    paddingVertical: Spacing.md,
  },
  text: {
    fontSize: 14,
    lineHeight: 20,
  },
  link: {
    fontWeight: '600',
  },
  closeButton: {
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
