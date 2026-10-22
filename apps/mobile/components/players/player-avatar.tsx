import { Image } from 'expo-image'
import { useEffect, useState } from 'react'
import { StyleSheet, View } from 'react-native'

import { ThemedText } from '@/components/themed-text'
import { useAppTheme } from '@/hooks/use-theme'

type Props = {
  name: string
  photoUrl?: string | null
  size?: number
}

export function PlayerAvatar({ name, photoUrl, size = 48 }: Props) {
  const { colors } = useAppTheme()
  const [failed, setFailed] = useState(false)
  useEffect(() => setFailed(false), [photoUrl])
  const initial = name.trim().charAt(0).toUpperCase() || '?'
  const dim = { width: size, height: size, borderRadius: size / 2 }

  if (photoUrl && !failed) {
    return (
      <Image
        source={{ uri: photoUrl }}
        style={dim}
        contentFit="cover"
        transition={200}
        recyclingKey={photoUrl}
        onError={() => setFailed(true)}
      />
    )
  }

  return (
    <View
      style={[
        styles.placeholder,
        dim,
        { backgroundColor: colors.brandSoft },
      ]}>
      <ThemedText
        style={[
          styles.letter,
          { color: colors.brand, fontSize: size * 0.4, lineHeight: size * 0.5 },
        ]}>
        {initial}
      </ThemedText>
    </View>
  )
}

const styles = StyleSheet.create({
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  letter: {
    fontWeight: '800',
  },
})
