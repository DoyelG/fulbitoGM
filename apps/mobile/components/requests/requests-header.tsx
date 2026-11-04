import Feather from '@expo/vector-icons/Feather'
import { View } from 'react-native'

import GradientHeader from '@/components/ui/gradient-header/gradient-header'

import { styles } from './requests-header.styles'

type Props = {
  pendingCount: number
  tournamentName?: string
}

export function RequestsHeader({ pendingCount, tournamentName }: Props) {
  const status =
    pendingCount === 0 ? 'Estás al día' : `${pendingCount} ${pendingCount === 1 ? 'pendiente' : 'pendientes'}`
  const subtitle = tournamentName ? `${status} · ${tournamentName}` : status

  return (
    <GradientHeader
      leading={
        <View style={styles.iconWrap}>
          <Feather name="inbox" size={28} color="#fff" />
        </View>
      }
      title="Solicitudes"
      subtitle={subtitle}
    />
  )
}
