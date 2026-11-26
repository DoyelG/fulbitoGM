import type { ReactNode } from 'react'
import { View, type StyleProp, type ViewStyle } from 'react-native'

import { PrimaryGradient } from '@/components/primary-gradient'

import { styles } from './pitch-card.styles'

export function PitchCard({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[styles.card, style]}>
      <PrimaryGradient />
      {children}
    </View>
  )
}
