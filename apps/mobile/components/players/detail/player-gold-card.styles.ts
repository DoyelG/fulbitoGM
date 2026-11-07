import { StyleSheet } from 'react-native'

import { Fonts, PlayerCardColors, Spacing } from '@/constants/theme'

export const CARD_WIDTH = 240
export const CARD_HEIGHT = 310
export const PHOTO_SIZE = 160
export const PLACEHOLDER_SIZE = 112
export const BADGE_SIZE = 32

export const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    alignSelf: 'center',
  },
  shape: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: 32,
  },
  ratingBox: {
    position: 'absolute',
    top: 44,
    left: 20,
    zIndex: 1,
    alignItems: 'center',
  },
  rating: {
    color: PlayerCardColors.ink,
    fontFamily: Fonts.extraBold,
    fontSize: 36,
    lineHeight: 38,
  },
  position: {
    color: PlayerCardColors.ink,
    fontFamily: Fonts.extraBold,
    fontSize: 14,
    lineHeight: 16,
  },
  badge: {
    position: 'absolute',
    top: 48,
    right: 20,
    zIndex: 1,
    width: BADGE_SIZE,
    height: BADGE_SIZE,
    borderRadius: BADGE_SIZE / 2,
    borderWidth: 1,
    borderColor: PlayerCardColors.edgeSoft,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeImage: {
    width: BADGE_SIZE,
    height: BADGE_SIZE,
  },
  placeholder: {
    marginTop: 20,
  },
  name: {
    marginTop: Spacing.md,
    maxWidth: '100%',
    color: PlayerCardColors.ink,
    fontFamily: Fonts.extraBold,
    fontSize: 22,
    lineHeight: 28,
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginTop: Spacing.xs,
  },
  stat: {
    alignItems: 'center',
  },
  statLabel: {
    color: PlayerCardColors.ink,
    fontFamily: Fonts.bold,
    fontSize: 12,
    lineHeight: 15,
    letterSpacing: 0.4,
  },
  statValue: {
    color: PlayerCardColors.ink,
    fontFamily: Fonts.extraBold,
    fontSize: 22,
    lineHeight: 26,
  },
})
