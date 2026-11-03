import Feather from '@expo/vector-icons/Feather'
import { LinearGradient } from 'expo-linear-gradient'
import { Text, View } from 'react-native'

import { useAppTheme } from '@/hooks/use-theme'

import { styles } from './link-player-hero.styles'

type Props = {
  icon: keyof typeof Feather.glyphMap
  title: string
  description: string
  tone?: 'brand' | 'danger'
}

export default function LinkPlayerHero({ icon, title, description, tone = 'brand' }: Props) {
  const { colors } = useAppTheme()
  const gradientColors = tone === 'danger' ? [colors.danger, colors.danger] : [colors.shadow, colors.brand]

  return (
    <View style={styles.container}>
      <View style={styles.iconWrap}>
        <LinearGradient
          colors={gradientColors as [string, string]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.circle}
        >
          <Feather name={icon} size={36} color={colors.onAccent} accessible={false} />
        </LinearGradient>
      </View>
      <Text style={[styles.title, { color: colors.text }]} accessibilityRole="header">
        {title}
      </Text>
      <Text style={[styles.description, { color: colors.muted }]}>{description}</Text>
    </View>
  )
}
