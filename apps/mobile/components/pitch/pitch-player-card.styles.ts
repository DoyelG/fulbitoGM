import { StyleSheet } from 'react-native'

import { Fonts, PitchColors, Radii, Spacing } from '@/constants/theme'

export const CARD_MAX_WIDTH = 248
export const CARD_EDGE = Spacing.xs

export const styles = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 5,
  },
  card: {
    position: 'absolute',
    zIndex: 6,
    gap: 2,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    borderRadius: Radii.md,
    backgroundColor: PitchColors.cardBg,
    shadowColor: PitchColors.cardShadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  name: {
    flex: 1,
    color: PitchColors.cardText,
    fontFamily: Fonts.bold,
    fontSize: 15,
    lineHeight: 20,
  },
  profileBtn: {
    width: 44,
    height: 44,
    marginTop: -Spacing.md,
    marginRight: -Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radii.pill,
  },
  profileBtnPressed: {
    backgroundColor: PitchColors.cardIconPressed,
  },
  subtitle: {
    marginTop: -Spacing.sm,
    color: PitchColors.cardSubtle,
    fontFamily: Fonts.medium,
    fontSize: 12,
  },
  label: {
    marginTop: Spacing.xs,
    color: PitchColors.cardLabel,
    fontFamily: Fonts.bold,
    fontSize: 10,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  value: {
    color: PitchColors.cardText,
    fontFamily: Fonts.semiBold,
    fontSize: 12,
  },
  divider: {
    marginTop: Spacing.xs,
    height: StyleSheet.hairlineWidth,
    backgroundColor: PitchColors.cardDivider,
  },
})
