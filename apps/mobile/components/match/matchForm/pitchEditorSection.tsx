import type { PitchPosition, Player } from '@fulbito/types'
import { withPitchPositions, type PitchSide } from '@fulbito/utils'
import { Text, View } from 'react-native'

import { MatchPitch } from '@/components/pitch/match-pitch'
import { PitchCard } from '@/components/pitch/pitch-card'
import { useAppTheme } from '@/hooks/use-theme'

import { FormLabel } from './formLabel'
import { styles } from './pitchEditorSection.styles'
import type { RecordingPlayer } from './types'

type Props = {
  teamA: RecordingPlayer[]
  teamB: RecordingPlayer[]
  positions: Record<string, PitchPosition>
  goalkeeperIds: string[]
  players: Player[]
  onPlayerMove: (playerId: string, side: PitchSide, position: PitchPosition) => void
  onDraggingChange: (dragging: boolean) => void
}

function toPitchTeam(team: RecordingPlayer[], positions: Record<string, PitchPosition>) {
  return withPitchPositions(
    team.map((player) => ({ ...player, goals: 0, performance: 0 })),
    positions,
  )
}

export function PitchEditorSection({
  teamA,
  teamB,
  positions,
  goalkeeperIds,
  players,
  onPlayerMove,
  onDraggingChange,
}: Props) {
  const { colors } = useAppTheme()
  return (
    <View style={styles.section}>
      <FormLabel text="Posiciones en la cancha" />
      <Text style={[styles.hint, { color: colors.muted }]}>
        Arrastrá las fichas para elegir dónde arranca cada jugador
      </Text>
      <PitchCard>
        <MatchPitch
          teamA={toPitchTeam(teamA, positions)}
          teamB={toPitchTeam(teamB, positions)}
          players={players}
          goalkeeperIds={goalkeeperIds}
          showMatchStats={false}
          onPlayerMove={onPlayerMove}
          onDraggingChange={onDraggingChange}
        />
      </PitchCard>
    </View>
  )
}
