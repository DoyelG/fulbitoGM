import { StyleSheet } from 'react-native'

import { Spacing } from '@/constants/theme'

export const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  screen: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
  },
  list: {
    gap: Spacing.md,
    paddingBottom: Spacing.xxxl,
  },
  emptyList: {
    flexGrow: 1,
  },
  error: {
    fontSize: 14,
    marginBottom: Spacing.md,
  },
})
