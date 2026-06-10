import type { Player } from '@fulbito/types'
import { useState } from 'react'
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'

import { useAppTheme } from '@/hooks/use-theme'

import { BottomSheet } from './bottomSheet'
import { FormLabel } from './formLabel'
import type { TeamStats } from './helpers'
import { sheetStyles } from './sharedStyles'
import type { RecordingPlayer, TeamSide } from './types'

type Props = {
  playersPerTeam: number
  poolPlayers: Player[]
  teamA: RecordingPlayer[]
  teamB: RecordingPlayer[]
  pinnedA: Set<string>
  pinnedB: Set<string>
  goalkeeperIds: Set<string>
  stats: TeamStats
  onConfirmTeam: (side: TeamSide, players: RecordingPlayer[]) => void
  onRemoveFromTeam: (side: TeamSide, id: string) => void
}

export function TeamAssignmentSection({
  playersPerTeam,
  poolPlayers,
  teamA,
  teamB,
  pinnedA,
  pinnedB,
  goalkeeperIds,
  stats,
  onConfirmTeam,
  onRemoveFromTeam,
}: Props) {
  const [selectingTeam, setSelectingTeam] = useState<TeamSide | null>(null)

  return (
    <>
      <FormLabel text={`Equipos (${playersPerTeam} por equipo)`} />
      <View style={styles.row}>
        <TeamColumn
          side="a"
          team={teamA}
          pinned={pinnedA}
          goalkeeperIds={goalkeeperIds}
          playersPerTeam={playersPerTeam}
          stats={{ skill: stats.skillA, phys: stats.physA, winPct: stats.winPctA }}
          onAdd={() => setSelectingTeam('a')}
          onRemove={(id) => onRemoveFromTeam('a', id)}
        />
        <TeamColumn
          side="b"
          team={teamB}
          pinned={pinnedB}
          goalkeeperIds={goalkeeperIds}
          playersPerTeam={playersPerTeam}
          stats={{ skill: stats.skillB, phys: stats.physB, winPct: stats.winPctB }}
          onAdd={() => setSelectingTeam('b')}
          onRemove={(id) => onRemoveFromTeam('b', id)}
        />
      </View>

      {selectingTeam !== null && (
        <TeamPickerModal
          side={selectingTeam}
          playersPerTeam={playersPerTeam}
          poolPlayers={poolPlayers}
          currentTeam={selectingTeam === 'a' ? teamA : teamB}
          otherTeam={selectingTeam === 'a' ? teamB : teamA}
          onClose={() => setSelectingTeam(null)}
          onConfirm={(players) => {
            onConfirmTeam(selectingTeam, players)
            setSelectingTeam(null)
          }}
        />
      )}
    </>
  )
}

function TeamColumn({
  side,
  team,
  pinned,
  goalkeeperIds,
  playersPerTeam,
  stats,
  onAdd,
  onRemove,
}: {
  side: TeamSide
  team: RecordingPlayer[]
  pinned: Set<string>
  goalkeeperIds: Set<string>
  playersPerTeam: number
  stats: { skill: number; phys: number; winPct: number }
  onAdd: () => void
  onRemove: (id: string) => void
}) {
  const { colors, radii } = useAppTheme()
  const bg = side === 'a' ? 'rgba(22,163,74,0.07)' : 'rgba(59,130,246,0.07)'
  const label = side === 'a' ? 'Equipo A' : 'Equipo B'

  return (
    <View style={[styles.col, { backgroundColor: bg, borderRadius: radii.sm }]}>
      <Text style={[styles.title, { color: colors.text }]}>
        {label} ({team.length}/{playersPerTeam})
      </Text>
      {team.map((p) => (
        <View key={p.id} style={[styles.playerRow, { borderColor: colors.border }]}>
          <Text style={[styles.playerName, { color: colors.text }]} numberOfLines={1}>
            {goalkeeperIds.has(p.id) ? '🧤 ' : ''}
            {p.name}
            {pinned.has(p.id) ? ' ⭐' : ''}
          </Text>
          <TouchableOpacity onPress={() => onRemove(p.id)}>
            <Text style={{ color: colors.danger, fontWeight: '700', fontSize: 14 }}>✕</Text>
          </TouchableOpacity>
        </View>
      ))}
      <TouchableOpacity
        onPress={onAdd}
        style={[styles.addBtn, { borderColor: colors.brand, borderRadius: radii.sm }]}
      >
        <Text style={{ color: colors.brand, fontWeight: '600', fontSize: 13 }}>+ Agregar</Text>
      </TouchableOpacity>
      {team.length > 0 && (
        <View style={[styles.statBox, { borderTopColor: colors.border }]}>
          <Text style={[styles.statText, { color: colors.muted }]}>🧠 {stats.skill.toFixed(1)}</Text>
          <Text style={[styles.statText, { color: colors.muted }]}>💪 {stats.phys.toFixed(1)}</Text>
          <Text style={[styles.statText, { color: colors.brand }]}>🏆 {stats.winPct}%</Text>
        </View>
      )}
    </View>
  )
}

function TeamPickerModal({
  side,
  playersPerTeam,
  poolPlayers,
  currentTeam,
  otherTeam,
  onClose,
  onConfirm,
}: {
  side: TeamSide
  playersPerTeam: number
  poolPlayers: Player[]
  currentTeam: RecordingPlayer[]
  otherTeam: RecordingPlayer[]
  onClose: () => void
  onConfirm: (players: RecordingPlayer[]) => void
}) {
  const { colors } = useAppTheme()
  const [draft, setDraft] = useState<Set<string>>(new Set(currentTeam.map((p) => p.id)))

  const otherIds = new Set(otherTeam.map((p) => p.id))
  const available = poolPlayers.filter((p) => !otherIds.has(p.id))

  const toggle = (id: string) => {
    setDraft((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else if (next.size < playersPerTeam) next.add(id)
      return next
    })
  }

  const confirm = () => {
    const selected = available
      .filter((p) => draft.has(p.id))
      .map((p) => ({ id: p.id, name: p.name }))
    onConfirm(selected)
  }

  return (
    <BottomSheet
      visible
      title={`Equipo ${side === 'a' ? 'A' : 'B'} (${draft.size}/${playersPerTeam})`}
      onConfirm={confirm}
      onDismiss={onClose}
    >
      {available.length === 0 ? (
        <Text style={{ color: colors.muted, textAlign: 'center', padding: 24 }}>
          No hay jugadores disponibles
        </Text>
      ) : (
        <ScrollView keyboardShouldPersistTaps="handled">
          {available.map((p) => {
            const selected = draft.has(p.id)
            return (
              <TouchableOpacity
                key={p.id}
                style={[sheetStyles.option, { borderBottomColor: colors.border }]}
                onPress={() => toggle(p.id)}
              >
                <Text style={[sheetStyles.optionText, { color: colors.text }]}>{p.name}</Text>
                {selected && (
                  <Text style={{ color: colors.brand, fontWeight: '700', fontSize: 16 }}>✓</Text>
                )}
              </TouchableOpacity>
            )
          })}
        </ScrollView>
      )}
    </BottomSheet>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  col: {
    flex: 1,
    padding: 8,
    minHeight: 80,
    gap: 4,
  },
  title: {
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 4,
  },
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingVertical: 4,
    paddingHorizontal: 2,
  },
  playerName: {
    fontSize: 12,
    flex: 1,
    marginRight: 4,
  },
  addBtn: {
    borderWidth: 1,
    borderStyle: 'dashed',
    paddingVertical: 6,
    alignItems: 'center',
    marginTop: 4,
  },
  statBox: {
    borderTopWidth: StyleSheet.hairlineWidth,
    marginTop: 6,
    paddingTop: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statText: {
    fontSize: 11,
    fontWeight: '600',
  },
})
