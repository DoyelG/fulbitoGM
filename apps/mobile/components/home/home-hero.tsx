import { useAppTheme } from '@/hooks/use-theme'
import { LinearGradient } from 'expo-linear-gradient'
import { Image, Text, View } from 'react-native'

import { styles } from './home-hero.styles'

export function HomeHero() {
  const { colors: C, isDark } = useAppTheme()
  const bg = C.background

  return (
    <View style={styles.hero}>
      <Image
        source={require('@/assets/images/hero-banner.png')}
        style={styles.backgroundImage}
        resizeMode="cover"
        accessible={false}
      />
      <View style={styles.overlay} />
      <LinearGradient colors={['transparent', bg]} locations={[0.35, 1]} style={styles.fade} />

      <View style={styles.content}>
        <View style={styles.brandRow}>
          <View style={[styles.brandDot, { backgroundColor: C.secondary }]} />
          <Text style={[styles.brandLabel, { color: C.secondary }]}>TU LIGA TUS REGLAS</Text>
        </View>

        <Text style={styles.line2}>FULBITO</Text>
        <Text style={[styles.line3, { color: C.secondary }]}>APP</Text>

        <Text style={[styles.sub, !isDark && styles.subLight]}>Organiza, compite y gestiona{'\n'}tus partidos.</Text>
      </View>
    </View>
  )
}
