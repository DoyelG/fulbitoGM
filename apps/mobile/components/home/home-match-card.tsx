import { SkewedBadge } from '@/components/ui/skewed-badge'
import { ContrastColors, Fonts, Radii, Spacing } from '@/constants/theme'
import { useAppTheme } from '@/hooks/use-theme'
import type { Match } from '@fulbito/types'
import { formatMatchDate, parseMatchDate } from '@fulbito/utils'
import { useRouter } from 'expo-router'
import { Pressable, StyleSheet, Text, View } from 'react-native'

type Props = { match: Match; accentColor?: string }

export function HomeMatchCard({ match, accentColor }: Props) {
  const { colors: C, isDark, shadows } = useAppTheme()
  const accent = accentColor ?? C.secondary
  const router = useRouter()

  return (
    <Pressable
      onPress={() => router.push({ pathname: '/(tabs)/history/[id]', params: { id: match.id } })}
      style={[styles.card, { backgroundColor: C.surface }, shadows.card(isDark) as object]}
      accessibilityRole="button"
      accessibilityLabel={`Ver partido del ${formatMatchDate(parseMatchDate(match).date)}, ${match.teamAScore} a ${match.teamBScore}`}
    >
      <View style={[styles.accent, { backgroundColor: accent }]} />
      <View style={styles.content}>
        <Text style={[styles.date, { color: C.muted }]}>{formatMatchDate(parseMatchDate(match).date)}</Text>
        <View style={styles.row}>
          <Text style={[styles.team, { color: C.text }]}>EQUIPO A</Text>
          <SkewedBadge color={accent} cutColor={C.surface}>
            <Text style={styles.scoreText}>
              {match.teamAScore} - {match.teamBScore}
            </Text>
          </SkewedBadge>
          <Text style={[styles.teamRight, { color: C.text }]}>EQUIPO B</Text>
        </View>
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radii.md,
    flexDirection: 'row',
    overflow: 'hidden',
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  team: {
    fontFamily: Fonts.extraBold,
    fontSize: 13,
  },
  teamRight: {
    fontFamily: Fonts.extraBold,
    fontSize: 13,
    textAlign: 'right',
  },
  scoreText: {
    fontFamily: Fonts.black,
    color: ContrastColors.onColor,
    fontSize: 15,
    letterSpacing: 0.5,
  },
})
