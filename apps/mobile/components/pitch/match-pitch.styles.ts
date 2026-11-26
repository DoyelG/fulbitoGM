import { StyleSheet } from 'react-native'

import { PitchColors, Radii } from '@/constants/theme'

export const PITCH_INSET = { horizontal: 16, vertical: 8 } as const
export const GUIDE_SIZE = 36

export const styles = StyleSheet.create({
  field: {
    width: '100%',
    borderRadius: Radii.lg,
    borderWidth: 2,
    borderColor: PitchColors.line,
    backgroundColor: PitchColors.field,
  },
  players: {
    position: 'absolute',
    left: PITCH_INSET.horizontal,
    right: PITCH_INSET.horizontal,
    top: PITCH_INSET.vertical,
    bottom: PITCH_INSET.vertical,
  },
  guide: {
    position: 'absolute',
    width: GUIDE_SIZE,
    height: GUIDE_SIZE,
    borderRadius: Radii.pill,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: PitchColors.guide,
  },
})
