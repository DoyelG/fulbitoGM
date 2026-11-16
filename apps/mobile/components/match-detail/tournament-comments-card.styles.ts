import { StyleSheet } from 'react-native'

import { Fonts, Radii, Spacing } from '@/constants/theme'

const AVATAR_SIZE = 36
const UNREAD_DOT_SIZE = 8

export const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: Radii.lg,
    padding: Spacing.lg,
  },
  error: {
    marginTop: Spacing.sm,
    fontFamily: Fonts.medium,
    fontSize: 13,
  },
  listSpacing: {
    marginTop: Spacing.lg,
  },
  list: {
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
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  unreadDot: {
    width: UNREAD_DOT_SIZE,
    height: UNREAD_DOT_SIZE,
    borderRadius: Radii.pill,
  },
  author: {
    flexShrink: 1,
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
  mention: {
    fontFamily: Fonts.semiBold,
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
