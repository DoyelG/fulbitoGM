import { SkewedBadge } from "@/components/ui/skewed-badge"
import { Fonts, Radii, Spacing } from "@/constants/theme"
import { useAppTheme } from "@/hooks/use-theme"
import { StyleSheet, Text, View } from "react-native"

export type Match = {
  date: string
  teamA: string
  teamB: string
  scoreA: number
  scoreB: number
}

type Props = { match: Match; accentColor?: string }

export function HomeMatchCard({ match, accentColor }: Props) {
  const { colors: C, isDark, shadows } = useAppTheme()
  const accent = accentColor ?? C.secondary

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: C.surface },
        shadows.card(isDark) as object,
      ]}
    >
      <View style={[styles.accent, { backgroundColor: accent }]} />
      <View style={styles.content}>
        <Text style={[styles.date, { color: C.muted }]}>{match.date}</Text>
        <View style={styles.row}>
          <Text style={[styles.team, { color: C.text }]}>{match.teamA}</Text>
          <SkewedBadge color={accent} cutColor={C.surface}>
            <Text style={styles.scoreText}>
              {match.scoreA} - {match.scoreB}
            </Text>
          </SkewedBadge>
          <Text style={[styles.teamRight, { color: C.text }]}>
            {match.teamB}
          </Text>
        </View>
      </View>
    </View>
  )
} 

const styles = StyleSheet.create({
  card: {
    borderRadius: Radii.md,
    flexDirection: "row",
    overflow: "hidden",
  },
  accent: {
    width: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    paddingRight: Spacing.lg,
  },
  date: {
    fontFamily: Fonts.semiBold,
    fontSize: 11,
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.md,
  },
  team: {
    fontFamily: Fonts.extraBold,
    fontSize: 13,
  },
  teamRight: {
    fontFamily: Fonts.extraBold,
    fontSize: 13,
    textAlign: "right",
  },
  scoreText: {
    fontFamily: Fonts.black,
    color: "#fff",
    fontSize: 15,
    letterSpacing: 0.5,
  },
})
