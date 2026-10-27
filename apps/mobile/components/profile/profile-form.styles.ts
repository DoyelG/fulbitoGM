import { StyleSheet } from 'react-native'

import { Radii, Spacing } from '@/constants/theme'

export const formStyles = StyleSheet.create({
  form: {
    gap: Spacing.md,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: Spacing.xs,
  },
  input: {
    minHeight: 44,
    borderWidth: 1,
    borderRadius: Radii.md,
    paddingHorizontal: Spacing.md,
    fontSize: 15,
  },
  error: {
    fontSize: 13,
  },
  success: {
    fontSize: 13,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
})
