import { StyleSheet } from 'react-native'
import { ContrastColors, Spacing } from '@/constants/theme'

export const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: ContrastColors.media,
  },
  closeBtn: {
    padding: Spacing.md,
  },
  videoView: {
    flex: 1,
  },
})
