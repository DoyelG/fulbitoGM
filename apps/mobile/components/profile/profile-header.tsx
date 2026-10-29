import type { Role } from '@fulbito/types'
import { roleLabels } from '@fulbito/utils'
import { Image } from 'expo-image'
import { Text, View } from 'react-native'

import GradientHeader from '@/components/ui/gradient-header/gradient-header'

import { styles } from './profile-header.styles'

type Props = {
  email: string
  roles: Role[]
  photoUrl?: string | null
}

export function ProfileHeader({ email, roles, photoUrl }: Props) {
  const avatar = (
    <View style={styles.avatar}>
      {photoUrl ? (
        <Image
          source={{ uri: photoUrl }}
          contentFit="cover"
          style={styles.avatarImage}
          accessibilityLabel="Foto de perfil"
        />
      ) : (
        <Text style={styles.avatarText}>{email.charAt(0)}</Text>
      )}
    </View>
  )

  return (
    <GradientHeader leading={avatar} title={email.split('@')[0]} subtitle={email} centered>
      <View style={styles.roles}>
        {roles.map((role) => (
          <View key={role} style={styles.role}>
            <Text style={styles.roleText}>{roleLabels[role]}</Text>
          </View>
        ))}
      </View>
    </GradientHeader>
  )
}
