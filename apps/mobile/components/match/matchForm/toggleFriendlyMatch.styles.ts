import { StyleSheet } from 'react-native'

export const TRACK_WIDTH = 120
export const TRACK_HEIGHT = 32
export const TRACK_PADDING = 3
export const THUMB_SIZE = TRACK_HEIGHT - TRACK_PADDING * 2
export const TRAVEL = TRACK_WIDTH - TRACK_PADDING * 2 - THUMB_SIZE
export const HIT_SLOP = { top: 6, bottom: 6, left: 6, right: 6 }

export const styles = StyleSheet.create({
  track: {
    alignSelf: 'flex-start',
    width: TRACK_WIDTH,
    height: TRACK_HEIGHT,
    borderRadius: TRACK_HEIGHT / 2,
    overflow: 'hidden',
  },
  gradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: TRACK_PADDING,
  },
  label: {
    position: 'absolute',
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
  },
  competitivoLabel: {
    left: THUMB_SIZE + TRACK_PADDING * 2,
  },
  amistosoLabel: {
    left: -68,
  },
  thumb: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  thumbEmoji: {
    fontSize: 16,
    marginTop: -2,
  },
})
