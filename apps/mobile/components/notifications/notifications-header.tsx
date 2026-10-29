import Feather from '@expo/vector-icons/Feather'
import { View } from 'react-native'

import GradientHeader from '@/components/ui/gradient-header/gradient-header'

import { styles } from './notifications-header.styles'

type Props = {
  pendingCount: number
}

export function NotificationsHeader({ pendingCount }: Props) {
  const subtitle =
    pendingCount === 0 ? 'Estás al día' : `${pendingCount} ${pendingCount === 1 ? 'pendiente' : 'pendientes'}`

  return (
    <GradientHeader
      leading={
        <View style={styles.iconWrap}>
          <Feather name="bell" size={28} color="#fff" />
        </View>
      }
      title="Notificaciones"
      subtitle={subtitle}
    />
  )
}
