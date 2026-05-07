import { Image } from 'expo-image'
import { StyleSheet, View } from 'react-native'

import { ThemedText } from '@/components/themed-text'
import { useAppTheme } from '@/hooks/use-theme'

type Props = {
  name: string
  photoUrl?: string
  size?: number
}

/** Avatar circular. Muestra la foto ajustada al círculo o la inicial como fallback. */
export function PlayerAvatar({ name, photoUrl, size = 48 }: Props) {
  const { colors } = useAppTheme()
  const initial = name.trim().charAt(0).toUpperCase() || '?'
  const dim = { width: size, height: size, borderRadius: size / 2 }

  if (photoUrl) {
    return (
      <Image
        source={{ uri: photoUrl }}
        style={dim}
        contentFit="cover"
        transition={200}
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
