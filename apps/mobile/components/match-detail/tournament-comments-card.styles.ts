import { StyleSheet } from 'react-native'

import { ContrastColors, Fonts, Radii, Spacing } from '@/constants/theme'

const AVATAR_SIZE = 36

export const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: Radii.lg,
    padding: Spacing.lg,
  },
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
  list: {
    marginTop: Spacing.lg,
    gap: Spacing.lg,
  },
  retry: {
    minHeight: 44,
    justifyContent: 'center',
  },
  empty: {
    fontFamily: Fonts.regularItalic,
    fontSize: 13,
  },
  comment: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: Radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarText: {
    fontFamily: Fonts.semiBold,
    fontSize: 14,
  },
  bubble: {
    flex: 1,
    borderRadius: Radii.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  bubbleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  authorBlock: {
    flex: 1,
  },
  author: {
    fontFamily: Fonts.semiBold,
    fontSize: 13,
  },
  time: {
    fontFamily: Fonts.regular,
    fontSize: 11,
  },
  deleteBtn: {
    width: 44,
    height: 44,
    margin: -Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    marginTop: 2,
    fontFamily: Fonts.regular,
    fontSize: 14,
  },
  moreBtn: {
    minHeight: 44,
    borderRadius: Radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moreText: {
    fontFamily: Fonts.semiBold,
    fontSize: 14,
  },
})
