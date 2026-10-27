import Feather from '@expo/vector-icons/Feather'
import type { ComponentProps, ReactNode } from 'react'
import { Text, View } from 'react-native'
import Animated, { FadeInDown } from 'react-native-reanimated'

import { useAppTheme } from '@/hooks/use-theme'

import { styles } from './profile-section.styles'

type Props = {
  icon: ComponentProps<typeof Feather>['name']
  title: string
  index: number
  children: ReactNode
}

export function ProfileSection({ icon, title, index, children }: Props) {
  const { colors } = useAppTheme()

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 80).duration(400)}
      style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
    >
      <View style={styles.titleRow}>
        <View style={[styles.iconWrap, { backgroundColor: colors.brandSoft }]}>
          <Feather name={icon} size={18} color={colors.brand} />
        </View>
        <Text style={[styles.title, { color: colors.text }]} accessibilityRole="header">
          {title}
        </Text>
      </View>
      {children}
    </Animated.View>
  )
}
