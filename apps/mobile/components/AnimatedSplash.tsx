import { useEffect } from 'react'
import { View } from 'react-native'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated'
import { scheduleOnRN } from 'react-native-worklets'
import { useAppTheme } from '@/hooks/use-theme'
import { styles } from './AnimatedSplash.styles'

type AnimatedSplashProps = {
  ready: boolean
  onFinish: () => void
}

export default function AnimatedSplash({ ready, onFinish }: AnimatedSplashProps) {
  const theme = useAppTheme()
  const containerOpacity = useSharedValue(1)
  const wordmarkOpacity = useSharedValue(0)
  const wordmarkScale = useSharedValue(0.85)
  const underlineWidth = useSharedValue(0)

  useEffect(() => {
    wordmarkOpacity.value = withTiming(1, { duration: 500 })
    wordmarkScale.value = withSpring(1, { damping: 13, stiffness: 120 })
    underlineWidth.value = withDelay(250, withTiming(1, { duration: 450 }))
  }, [underlineWidth, wordmarkOpacity, wordmarkScale])

  useEffect(() => {
    if (!ready) return
    containerOpacity.value = withTiming(0, { duration: 400 }, finished => {
      if (finished) scheduleOnRN(onFinish)
    })
  }, [ready, containerOpacity, onFinish])

  const containerStyle = useAnimatedStyle(() => ({ opacity: containerOpacity.value }))
  const wordmarkStyle = useAnimatedStyle(() => ({
    opacity: wordmarkOpacity.value,
    transform: [{ scale: wordmarkScale.value }],
  }))
  const underlineStyle = useAnimatedStyle(() => ({ transform: [{ scaleX: underlineWidth.value }] }))

  return (
    <Animated.View
      style={[styles.container, { backgroundColor: theme.colors.brand }, containerStyle]}
      pointerEvents="none"
      accessibilityLiveRegion="polite"
      accessibilityLabel="Cargando FulbitoApp"
    >
      <View accessible accessibilityRole="header">
        <Animated.Text style={[styles.wordmark, wordmarkStyle]}>FulbitoApp</Animated.Text>
      </View>
      <Animated.View style={[styles.underline, underlineStyle]} />
    </Animated.View>
  )
}
