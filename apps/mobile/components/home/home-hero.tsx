import { Fonts } from "@/constants/theme"
import { useAppTheme } from "@/hooks/use-theme"
import { LinearGradient } from "expo-linear-gradient"
import { ImageBackground, StyleSheet, Text, View } from "react-native"

export function HomeHero() {
  const { colors: C, isDark } = useAppTheme()
  const bg = C.background

  return (
    <ImageBackground
      source={require("@/assets/images/hero-banner.png")}
      style={styles.hero}
      resizeMode="cover"
    >
      <View style={styles.overlay} />
      <LinearGradient
        colors={["transparent", bg]}
        locations={[0.35, 1]}
        style={styles.fade}
      />

      <View style={styles.content}>
        <View style={styles.brandRow}>
          <View style={[styles.brandDot, { backgroundColor: C.secondary }]} />
          <Text style={[styles.brandLabel, { color: C.secondary }]}>
            TU LIGA TUS REGLAS
          </Text>
        </View>

        <Text style={styles.line2}>FULBITO</Text>
        <Text style={[styles.line3, { color: C.secondary }]}>APP</Text>

        <Text style={[styles.sub, !isDark && styles.subLight]}>
          Organiza, compite y gestiona{"\n"}tus partidos.
        </Text>
      </View>
    </ImageBackground>
  )
}

const styles = StyleSheet.create({
  hero: {
    height: 340,
    overflow: "hidden",
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(8,3,25,0.45)",
  },

  fade: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 260,
  },

  content: {
    position: "absolute",
    bottom: 28,
    left: 20,
    right: 20,
  },

  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 14,
  },
  brandDot: {
    width: 7,
    height: 7,
    borderRadius: 2,
  },
  brandLabel: {
    fontFamily: Fonts.semiBold,
    fontSize: 11,
    letterSpacing: 2.5,
  },

  line2: {
    fontFamily: Fonts.blackItalic,
    fontSize: 48,
    color: "#fff",
    lineHeight: 50,
    letterSpacing: -1,
  },
  line3: {
    fontFamily: Fonts.blackItalic,
    fontSize: 48,
    lineHeight: 56,
    marginBottom: 14,
  },

  sub: {
    fontFamily: Fonts.bold,
    fontSize: 13,
    lineHeight: 19,
    color: "rgba(255,255,255,0.75)",
    textShadowColor: "rgba(0,0,0,0.6)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
  },
  subLight: {
    color: "rgba(255,255,255,0.95)",
    textShadowColor: "rgba(0,0,0,1)",
    textShadowRadius: 10,
  },
})
