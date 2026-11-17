import { StyleSheet } from 'react-native'

import { ContrastColors, Fonts, Radii, Spacing } from '@/constants/theme'

const BAR_CONTROL_HEIGHT = 44

export const styles = StyleSheet.create({
  input: {
    minHeight: 80,
    borderWidth: 1,
    borderRadius: Radii.md,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.md,
    fontFamily: Fonts.regular,
    fontSize: 14,
    textAlignVertical: 'top',
  },
  formFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.sm,
  },
  counter: {
    fontFamily: Fonts.regular,
    fontSize: 12,
  },
  sendBtn: {
    overflow: 'hidden',
    minHeight: 44,
    minWidth: 112,
    borderRadius: Radii.pill,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    opacity: 0.5,
  },
  sendText: {
    color: ContrastColors.onColor,
    fontFamily: Fonts.semiBold,
    fontSize: 14,
  },
  error: {
    marginTop: Spacing.sm,
    fontFamily: Fonts.medium,
    fontSize: 13,
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing.sm,
  },
  barInput: {
    flex: 1,
    minHeight: BAR_CONTROL_HEIGHT,
    maxHeight: 120,
    borderWidth: 1,
    borderRadius: Radii.xl,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.md,
    fontFamily: Fonts.regular,
    fontSize: 14,
    textAlignVertical: 'top',
  },
  barSendBtn: {
    overflow: 'hidden',
    width: BAR_CONTROL_HEIGHT,
    height: BAR_CONTROL_HEIGHT,
    borderRadius: Radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
