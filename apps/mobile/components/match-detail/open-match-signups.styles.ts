import { StyleSheet } from 'react-native'

import { Fonts, Radii, Spacing } from '@/constants/theme'

export const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: Radii.md,
    padding: Spacing.md,
    gap: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: Spacing.md,
  },
  headerText: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 160,
    gap: Spacing.xs,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  message: {
    fontFamily: Fonts.regular,
    fontSize: 12,
  },
  summary: {
    fontFamily: Fonts.regular,
    fontSize: 13,
  },
  summaryStrong: {
    fontFamily: Fonts.bold,
  },
  list: {
    gap: Spacing.sm,
  },
  slot: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    borderRadius: Radii.sm,
    paddingHorizontal: Spacing.md,
  },
  slotEmpty: {
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  position: {
    width: 22,
    textAlign: 'right',
    fontFamily: Fonts.bold,
    fontSize: 12,
  },
  name: {
    flex: 1,
    fontFamily: Fonts.semiBold,
    fontSize: 14,
  },
  meBadge: {
    overflow: 'hidden',
    borderRadius: Radii.pill,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    fontFamily: Fonts.bold,
    fontSize: 11,
  },
  removeBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontFamily: Fonts.bold,
    fontSize: 14,
  },
  sectionHint: {
    fontFamily: Fonts.regular,
    fontSize: 12,
  },
})
