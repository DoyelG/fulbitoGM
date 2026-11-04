import { StyleSheet } from 'react-native'

import { Fonts, Radii, Spacing } from '@/constants/theme'

export const styles = StyleSheet.create({
  section: {
    gap: Spacing.sm,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  title: {
    fontFamily: Fonts.blackItalic,
    fontSize: 16,
    letterSpacing: 0.3,
  },
  card: {
    gap: Spacing.sm,
    padding: Spacing.lg,
    borderWidth: 1,
    borderRadius: Radii.lg,
  },
  cardTitle: {
    flexShrink: 1,
    fontFamily: Fonts.bold,
    fontSize: 15,
  },
  text: {
    fontFamily: Fonts.regular,
    fontSize: 13,
    lineHeight: 19,
  },
  strong: {
    fontFamily: Fonts.semiBold,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    gap: Spacing.sm,
  },
})
