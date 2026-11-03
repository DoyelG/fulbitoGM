import { useEffect } from 'react'
import { Text, View } from 'react-native'
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated'

import { styles } from './notification-badge.styles'

type Props = {
  count: number
  pulse?: boolean
}

export default function NotificationBadge({ count, pulse = false }: Props) {
  const progress = useSharedValue(0)

  useEffect(() => {
    if (!pulse) return
    progress.value = withRepeat(withTiming(1, { duration: 1400, easing: Easing.out(Easing.ease) }), -1, false)
  }, [pulse, progress])

  const pulseStyle = useAnimatedStyle(() => ({
    opacity: 0.6 * (1 - progress.value),
    transform: [{ scale: 1 + progress.value * 0.9 }],
  }))

  if (count <= 0) return null

  return (
    <View style={styles.wrap} accessible accessibilityLabel={`${count} notificaciones pendientes`}>
      {pulse && <Animated.View style={[styles.pulse, pulseStyle]} />}
      <View style={styles.badge}>
        <Text style={styles.text}>{count}</Text>
      </View>
    </View>
  )
}
