import { LinearGradient } from 'expo-linear-gradient'
import { useEffect } from 'react'
import { Pressable, Text } from 'react-native'
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated'

import { useAppTheme } from '@/hooks/use-theme'

import { HIT_SLOP, styles, TRAVEL } from './toggleFriendlyMatch.styles'
import { FormLabel } from './formLabel'

type ToggleFriendlyMatchProps = {
  isMatchFriendly: boolean
  setIsMatchFriendly: (value: boolean) => void
}

export function ToggleFriendlyMatch({ isMatchFriendly, setIsMatchFriendly }: ToggleFriendlyMatchProps) {
  const { colors } = useAppTheme()
  const progress = useSharedValue(isMatchFriendly ? 1 : 0)

  useEffect(() => {
    progress.value = withTiming(isMatchFriendly ? 1 : 0, { duration: 400 })
  }, [isMatchFriendly, progress])

  const slideStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: progress.value * TRAVEL }],
  }))

  const gradientColors = isMatchFriendly
    ? (['#4ade80', colors.friendlyBrand] as const)
    : ([colors.brand, colors.secondary] as const)

  return (
    <>
      <FormLabel text="Tipo de partido" />
      <Pressable
        onPress={() => setIsMatchFriendly(!isMatchFriendly)}
        hitSlop={HIT_SLOP}
        accessibilityRole="switch"
        accessibilityState={{ checked: isMatchFriendly }}
        accessibilityLabel="Partido amistoso"
        accessibilityHint="Alterna entre partido competitivo y amistoso"
        style={styles.track}
      >
        <LinearGradient colors={gradientColors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.gradient}>
          <Animated.Text style={[styles.label, styles.competitivoLabel, slideStyle]} numberOfLines={1}>
            Competitivo
          </Animated.Text>
          <Animated.Text style={[styles.label, styles.amistosoLabel, slideStyle]} numberOfLines={1}>
            Amistoso
          </Animated.Text>
          <Animated.View style={[styles.thumb, slideStyle]}>
            <Text style={styles.thumbEmoji}>{isMatchFriendly ? '🤝' : '⚔️'}</Text>
          </Animated.View>
        </LinearGradient>
      </Pressable>
    </>
  )
}
