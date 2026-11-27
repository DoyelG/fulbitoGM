import { StyleSheet } from 'react-native'

import { ContrastColors, Fonts, PitchColors, Radii, Spacing } from '@/constants/theme'

export const styles = StyleSheet.create({
  token: {
    position: 'absolute',
    alignItems: 'center',
    gap: Spacing.xxs,
    minHeight: 44,
    zIndex: 1,
  },
  tokenRaised: {
    zIndex: 2,
  },
  tokenDragging: {
    opacity: 0.9,
    transform: [{ scale: 1.08 }],
  },
  avatarWrap: {
    borderRadius: Radii.pill,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  avatarTeamA: {
    borderColor: PitchColors.teamARing,
  },
  avatarMvp: {
    borderWidth: 3,
    borderColor: PitchColors.mvpRing,
  },
  mvpStar: {
    position: 'absolute',
    top: -10,
    right: -10,
    fontSize: 15,
  },
  name: {
    width: '100%',
    textAlign: 'center',
    color: PitchColors.name,
    fontFamily: Fonts.semiBold,
    textShadowColor: ContrastColors.textShadow,
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  balls: {
    position: 'absolute',
    bottom: -6,
    left: -24,
    right: -24,
    textAlign: 'center',
    fontSize: 9,
    letterSpacing: -1,
  },
})
