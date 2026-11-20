import type { MyMatchEntry } from '@fulbito/types'
import {
  formatMatchDate,
  getEntryPlayer,
  getEntryResult,
  getOpponentLabel,
  parseMatchDate,
  type EntryResult,
} from '@fulbito/utils'
import { Ionicons } from '@expo/vector-icons'
import { Pressable, Text, View } from 'react-native'

import { useAppTheme } from '@/hooks/use-theme'

import { styles } from './personal-matches-list.styles'

type Props = {
  entries: MyMatchEntry[]
  personalTournamentId: string
  tournamentNames: Map<string, string>
  onOpen: (entry: MyMatchEntry) => void
  onDelete: (entry: MyMatchEntry) => void
}

const RESULT_LABELS: Record<EntryResult, string> = { win: 'Ganado', loss: 'Perdido', draw: 'Empatado' }

export function PersonalMatchesList({ entries, personalTournamentId, tournamentNames, onOpen, onDelete }: Props) {
  const { colors } = useAppTheme()

  if (entries.length === 0) {
    return <Text style={[styles.empty, { color: colors.muted }]}>No hay partidos para mostrar.</Text>
  }

  return (
    <View style={styles.list}>
      {entries.map((entry) => {
        const { match } = entry
        const played = getEntryPlayer(entry)
        const resultKind = getEntryResult(entry)
        const result = RESULT_LABELS[resultKind]
        const date = formatMatchDate(parseMatchDate(match).date)
        const label =
          match.tournamentId === personalTournamentId
            ? (getOpponentLabel(match) ?? match.type)
            : `${tournamentNames.get(match.tournamentId) ?? 'Otro torneo'} · ${match.type}`
        const resultColor = resultKind === 'win' ? colors.success : resultKind === 'loss' ? colors.danger : colors.muted
        const deletable = match.tournamentId === personalTournamentId
        return (
          <View key={match.id} style={[styles.row, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Pressable
              onPress={() => onOpen(entry)}
              accessibilityRole="button"
              accessibilityLabel={`Partido del ${date}, ${match.teamAScore} a ${match.teamBScore}, ${result}. ${played?.goals ?? 0} goles, rendimiento ${played?.performance ?? 0}`}
              style={styles.rowContent}
            >
              <View style={styles.top}>
                <Text style={[styles.date, { color: colors.muted }]}>{date}</Text>
                <Text style={[styles.result, { color: resultColor }, deletable && styles.resultWithDelete]}>
                  {result.toUpperCase()}
                </Text>
              </View>
              <View style={styles.middle}>
                <Text style={[styles.score, { color: colors.text }]}>
                  {match.teamAScore} - {match.teamBScore}
                </Text>
                <Text style={[styles.label, { color: colors.textSecondary }]} numberOfLines={1}>
                  {label}
                </Text>
                <Text style={[styles.stats, { color: colors.text }]}>
                  {played?.goals ?? 0}⚽ {played?.performance ?? 0}★
                </Text>
              </View>
            </Pressable>
            {deletable && (
              <Pressable
                onPress={() => onDelete(entry)}
                accessibilityRole="button"
                accessibilityLabel={`Eliminar partido del ${date}`}
                style={styles.deleteButton}
              >
                <Ionicons name="trash-outline" size={18} color={colors.danger} />
              </Pressable>
            )}
          </View>
        )
      })}
    </View>
  )
}
