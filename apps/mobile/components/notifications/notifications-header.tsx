import Feather from '@expo/vector-icons/Feather'
import { LinearGradient } from 'expo-linear-gradient'
import { Text, View } from 'react-native'

import { useAppTheme } from '@/hooks/use-theme'

import { styles } from './notifications-header.styles'

type Props = {
  pendingCount: number
}

export function NotificationsHeader({ pendingCount }: Props) {
  const { colors } = useAppTheme()
  const subtitle =
    pendingCount === 0 ? 'Estás al día' : `${pendingCount} ${pendingCount === 1 ? 'pendiente' : 'pendientes'}`

  return (
    <LinearGradient
      colors={[colors.shadow, colors.brand]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.banner}
    >
      <View style={styles.iconWrap}>
        <Feather name="bell" size={28} color="#fff" />
      </View>
      <View>
        <Text style={styles.title} accessibilityRole="header">
          Notificaciones
        </Text>
        <Text style={styles.subtitle} accessibilityLiveRegion="polite">
          {subtitle}
        </Text>
      </View>
    </LinearGradient>
  )
}
