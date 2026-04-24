import { Image } from 'expo-image'
import { StyleSheet, View } from 'react-native'

import { ThemedText } from '@/components/themed-text'
import { useAppTheme } from '@/hooks/use-theme'

type Props = {
  name: string
  photoUrl?: string
  size?: number
}

export function PlayerAvatar({ name, photoUrl, size = 52 }: Props) {
  const { colors } = useAppTheme()
  const initial = name.trim().charAt(0).toUpperCase() || '?'
  const ringSize = size + 4

  if (photoUrl) {
    return (
      <View
        style={[
          styles.ring,
          { width: ringSize, height: ringSize, borderRadius: ringSize / 2, borderColor: colors.brandRing },
        ]}>
        <Image
          source={{ uri: photoUrl }}
          style={{ width: size, height: size, borderRadius: size / 2 }}
          contentFit="cover"
          transition={200}
        />
      </View>
    )
  }

  return (
    <View
      style={[
        styles.ring,
        { width: ringSize, height: ringSize, borderRadius: ringSize / 2, borderColor: colors.brandRing },
      ]}>
      <View
        style={[
          styles.placeholder,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: colors.brandSoft,
          },
        ]}>
        <ThemedText style={[styles.letter, { color: colors.brand, fontSize: size * 0.4 }]}>
          {initial}
        </ThemedText>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  ring: {
    borderWidth: 2,
    padding: 2,
  },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  letter: {
    fontWeight: '800',
  },
})
