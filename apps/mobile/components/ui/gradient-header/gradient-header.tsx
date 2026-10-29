import { LinearGradient } from 'expo-linear-gradient'
import type { ReactNode } from 'react'
import { Text, View } from 'react-native'

import { useAppTheme } from '@/hooks/use-theme'

import { styles } from './gradient-header.styles'

type Props = {
  leading: ReactNode
  title: string
  subtitle: string
  centered?: boolean
  children?: ReactNode
}

export default function GradientHeader({ leading, title, subtitle, centered = false, children }: Props) {
  const { colors } = useAppTheme()

  return (
    <LinearGradient
      colors={[colors.shadow, colors.brand]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.banner, centered && styles.bannerCentered]}
    >
      {leading}
      <View style={centered ? styles.textWrap : styles.textWrapRow}>
        <Text style={styles.title} accessibilityRole="header">
          {title}
        </Text>
        <Text style={styles.subtitle} accessibilityLiveRegion="polite">
          {subtitle}
        </Text>
      </View>
      {children}
    </LinearGradient>
  )
}
