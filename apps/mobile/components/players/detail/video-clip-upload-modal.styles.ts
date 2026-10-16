import { StyleSheet } from 'react-native'
import { Fonts, Radii, Spacing } from '@/constants/theme'

export const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: {
    padding: Spacing.lg,
    gap: Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  title: {
    fontSize: 18,
    fontFamily: Fonts.extraBold,
  },
  closeBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fieldLabel: {
    fontSize: 13,
    fontFamily: Fonts.semiBold,
    marginBottom: Spacing.xs,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: Radii.sm,
    borderWidth: 1,
    marginBottom: Spacing.xs,
    minHeight: 44,
  },
  optionText: {
    fontSize: 14,
    fontFamily: Fonts.medium,
    flex: 1,
  },
  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: Radii.pill,
    borderWidth: 1,
    minHeight: 44,
  },
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
    minHeight: 44,
  },
  input: {
    borderWidth: 1,
    borderRadius: Radii.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: 14,
    fontFamily: Fonts.regular,
    minHeight: 44,
  },
  pickBtn: {
    borderWidth: 1,
    borderRadius: Radii.sm,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    minHeight: 44,
    justifyContent: 'center',
  },
  submitBtn: {
    borderRadius: Radii.sm,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    minHeight: 44,
    justifyContent: 'center',
  },
  submitText: {
    color: '#fff',
    fontFamily: Fonts.semiBold,
    fontSize: 15,
  },
})
