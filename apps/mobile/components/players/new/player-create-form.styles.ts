import { StyleSheet } from 'react-native'

import { Spacing } from '@/constants/theme'

export const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
  },
  cardWrap: {
    marginBottom: Spacing.xl,
    alignItems: 'center',
  },
  pressed: {
    opacity: 0.85,
  },
  photoHint: {
    marginTop: Spacing.sm,
    fontSize: 13,
    textAlign: 'center',
  },
  bottomPad: { height: 32 },
})
