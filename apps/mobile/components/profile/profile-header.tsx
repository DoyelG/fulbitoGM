import { Image } from 'expo-image'
import { Text, View } from 'react-native'

import GradientHeader from '@/components/ui/gradient-header/gradient-header'

import { styles } from './profile-header.styles'

type Props = {
  email: string
  badges: string[]
  photoUrl?: string | null
}

export function ProfileHeader({ email, badges, photoUrl }: Props) {
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
        {badges.map((badge) => (
          <View key={badge} style={styles.role}>
            <Text style={styles.roleText}>{badge}</Text>
          </View>
        ))}
      </View>
    </GradientHeader>
  )
}
