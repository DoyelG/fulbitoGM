import { StyleSheet, Text, TextInput, View } from 'react-native'

import { useAppTheme } from '@/hooks/use-theme'

import type { RecordingPlayer } from './types'

type Props = {
  label: string
  players: RecordingPlayer[]
  score: string
  total: number
  goals: Record<string, string>
  perf: Record<string, string>
  onScoreChange: (v: string) => void
  onGoalChange: (id: string, v: string) => void
  onPerfChange: (id: string, v: string) => void
}

export function TeamScoreSection({
  label,
  players,
  score,
  total,
  goals,
  perf,
  onScoreChange,
  onGoalChange,
  onPerfChange,
}: Props) {
  const { colors, radii } = useAppTheme()
  const scoreNum = parseInt(score) || 0
  const matches = scoreNum === total

  return (
    <View style={[styles.section, { backgroundColor: 'rgba(0,0,0,0.03)', borderRadius: radii.sm }]}>
      <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
      <TextInput
        value={score}
        onChangeText={onScoreChange}
        placeholder="Goles totales"
        keyboardType="number-pad"
        placeholderTextColor={colors.muted}
        style={[
          styles.scoreInput,
          { borderColor: colors.border, borderRadius: radii.sm, color: colors.text },
        ]}
      />
      {players.map((p) => (
        <View key={p.id} style={[styles.playerRow, { borderBottomColor: colors.border }]}>
          <Text style={[styles.playerName, { color: colors.text }]} numberOfLines={1}>
            {p.name}
          </Text>
          <View style={styles.inputs}>
            <TextInput
              value={goals[p.id] ?? '0'}
              onChangeText={(v) => onGoalChange(p.id, v)}
              keyboardType="number-pad"
              placeholder="G"
              placeholderTextColor={colors.muted}
              style={[
                styles.smallInput,
                { borderColor: colors.border, borderRadius: radii.sm, color: colors.text },
              ]}
            />
            <TextInput
              value={perf[p.id] ?? '5'}
              onChangeText={(v) => onPerfChange(p.id, v)}
              keyboardType="decimal-pad"
              placeholder="★"
              placeholderTextColor={colors.muted}
              style={[
                styles.smallInput,
                { borderColor: colors.border, borderRadius: radii.sm, color: colors.text },
              ]}
            />
          </View>
        </View>
      ))}
      <View
        style={[
          styles.totalPill,
          { backgroundColor: matches ? 'rgba(22,163,74,0.12)' : 'rgba(220,38,38,0.12)' },
        ]}
      >
        <Text style={{ color: matches ? '#166534' : '#991b1b', fontWeight: '600', fontSize: 12 }}>
          Total: {total} goles {matches ? '✓' : '✗'}
        </Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  section: {
    flex: 1,
    padding: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 6,
  },
  scoreInput: {
    borderWidth: 1,
    textAlign: 'center',
    paddingVertical: 6,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 8,
  },
  playerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingVertical: 4,
    gap: 4,
  },
  playerName: {
    flex: 1,
    fontSize: 11,
  },
  inputs: {
    flexDirection: 'row',
    gap: 4,
  },
  smallInput: {
    borderWidth: 1,
    width: 38,
    textAlign: 'center',
    paddingVertical: 3,
    fontSize: 12,
  },
  totalPill: {
    marginTop: 6,
    borderRadius: 4,
    padding: 4,
    alignItems: 'center',
  },
})
