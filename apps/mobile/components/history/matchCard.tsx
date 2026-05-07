import type { Match, Player } from '@fulbito/types'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'

import { useAppTheme } from '@/hooks/use-theme'

type MatchPlayer = Match['teamA'][number]

type Props = {
  match: Match
  players: Player[]
  isAdmin: boolean
  onEdit: () => void
  onDelete: () => void
}

function formatDate(iso: string): string {
  const [yy, mm, dd] = iso.slice(0, 10).split('-')
  return `${dd}/${mm}/${yy}`
}

export function MatchCard({ match: m, players, isAdmin, onEdit, onDelete }: Props) {
  const { colors, radii, spacing, shadows, isDark } = useAppTheme()

  const winA = m.teamAScore > m.teamBScore
  const winB = m.teamBScore > m.teamAScore

  const shirtName = m.shirtsResponsibleId
    ? (players.find((p) => p.id === m.shirtsResponsibleId)?.name ?? '—')
    : null

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.surface, borderRadius: radii.md },
        shadows.card(isDark),
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          {m.name ? (
            <Text style={[styles.matchName, { color: colors.text }]}>{m.name}</Text>
          ) : null}
          <View style={styles.metaRow}>
            <Text style={[styles.date, { color: colors.text }]}>{formatDate(m.date)}</Text>
            <View style={[styles.typeBadge, { backgroundColor: colors.brand }]}>
              <Text style={styles.typeBadgeText}>{m.type}</Text>
            </View>
          </View>
        </View>
        <Text style={[styles.score, { color: colors.brand }]}>
          {m.teamAScore} – {m.teamBScore}
        </Text>
      </View>

      {/* Teams */}
      <View style={styles.teamsRow}>
        <TeamColumn
          label="Equipo A"
          players={m.teamA}
          winner={winA}
          loser={winB}
          colors={colors}
          radii={radii}
          spacing={spacing}
        />
        <TeamColumn
          label="Equipo B"
          players={m.teamB}
          winner={winB}
          loser={winA}
          colors={colors}
          radii={radii}
          spacing={spacing}
        />
      </View>

      {/* Shirts + Admin actions */}
      <View style={styles.footer}>
        {shirtName ? (
          <Text style={[styles.shirts, { color: colors.muted }]}>
            Camisetas: <Text style={{ fontWeight: '600', color: colors.text }}>{shirtName}</Text>
          </Text>
        ) : <View />}

        {isAdmin ? (
          <View style={styles.actions}>
            <TouchableOpacity onPress={onEdit} style={[styles.editBtn, { borderColor: colors.border }]}>
              <Text style={[styles.editBtnText, { color: colors.text }]}>Editar</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onDelete}>
              <Text style={[styles.deleteText, { color: colors.danger }]}>Eliminar</Text>
            </TouchableOpacity>
          </View>
        ) : null}
      </View>
    </View>
  )
}

type TeamColumnColors = { surface: string; text: string; muted: string; warning: string }
type TeamColumnRadii = { sm: number }
type TeamColumnSpacing = { xs: number; sm: number; md: number }

function TeamColumn({
  label,
  players,
  winner,
  loser,
  colors,
  radii,
  spacing,
}: {
  label: string
  players: MatchPlayer[]
  winner: boolean
  loser: boolean
  colors: TeamColumnColors
  radii: TeamColumnRadii
  spacing: TeamColumnSpacing
}) {
  const bg = winner ? 'rgba(22,163,74,0.08)' : loser ? 'rgba(220,38,38,0.08)' : 'rgba(0,0,0,0.03)'
  return (
    <View style={[styles.teamCol, { backgroundColor: bg, borderRadius: radii.sm, padding: spacing.sm }]}>
      <Text style={[styles.teamLabel, { color: colors.text }]}>{label}</Text>
      {players.map((p) => (
        <View key={p.id} style={styles.playerRow}>
          <Text style={[styles.playerName, { color: colors.text }]} numberOfLines={1}>
            {p.name}
          </Text>
          <Text style={[styles.playerStats, { color: colors.muted }]}>
            {p.goals}⚽ {p.performance}★
          </Text>
        </View>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    padding: 14,
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  headerLeft: {
    flex: 1,
    marginRight: 8,
  },
  matchName: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  date: {
    fontSize: 14,
    fontWeight: '600',
  },
  typeBadge: {
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  typeBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  score: {
    fontSize: 22,
    fontWeight: '800',
  },
  teamsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  teamCol: {
    flex: 1,
  },
  teamLabel: {
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 4,
  },
  playerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 2,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.08)',
  },
  playerName: {
    fontSize: 13,
    flex: 1,
    marginRight: 4,
  },
  playerStats: {
    fontSize: 12,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  shirts: {
    fontSize: 12,
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  editBtn: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  editBtnText: {
    fontSize: 13,
  },
  deleteText: {
    fontSize: 13,
    fontWeight: '600',
  },
})
