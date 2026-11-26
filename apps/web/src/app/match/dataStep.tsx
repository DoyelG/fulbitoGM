'use client'

import { useMemo, useState } from 'react'
import type { MatchPlayer, MatchType, PitchPosition } from '@fulbito/types'
import { defaultTeamFormation, withPitchPositions } from '@fulbito/utils'
import type { Player } from '@/store/usePlayerStore'
import type { TeamResult } from '@/lib/teamUtils'
import { Card } from '@/components/Card'
import Button from '@/components/Button'
import { FiRefreshCw } from 'react-icons/fi'
import CreateDraftForm, { type DraftForm } from './draftForm'
import TeamCard from './teamCard'
import PitchCanvas from '@/components/matches/PitchCanvas'

function toPitchPlayers(team: TeamResult, positions: Record<string, PitchPosition>): MatchPlayer[] {
  return withPitchPositions(
    team.players.map((player) => ({ id: player.id, name: player.name, goals: 0, performance: 0 })),
    positions,
  )
}

type Props = {
  teamA: TeamResult
  teamB: TeamResult
  matchType: MatchType
  players: Player[]
  goalkeeperIds: Set<string>
  manualIds: Set<string>
  streakSeparated: boolean
  isFriendly: boolean
  onFriendlyToggle: () => void
  draft: DraftForm
  onDraftChange: (changes: Partial<DraftForm>) => void
  onRegenerate: () => void
}

export default function DataStep({
  teamA,
  teamB,
  matchType,
  players,
  goalkeeperIds,
  manualIds,
  streakSeparated,
  isFriendly,
  onFriendlyToggle,
  draft,
  onDraftChange,
  onRegenerate,
}: Props) {
  const combinedSkill = teamA.totalSkill + teamB.totalSkill
  const probA = combinedSkill > 0 ? Math.round((teamA.totalSkill / combinedSkill) * 100) : 50
  const probB = combinedSkill > 0 ? 100 - probA : 50
  const goalkeeperList = useMemo(() => [...goalkeeperIds], [goalkeeperIds])
  const [positions, setPositions] = useState<Record<string, PitchPosition>>(() => {
    const roleById = Object.fromEntries(
      [...teamA.players, ...teamB.players].map((player) => [player.id, player.position]),
    )
    return {
      ...defaultTeamFormation(
        teamA.players.map((player) => player.id),
        goalkeeperList,
        'A',
        roleById,
      ),
      ...defaultTeamFormation(
        teamB.players.map((player) => player.id),
        goalkeeperList,
        'B',
        roleById,
      ),
    }
  })

  return (
    <Card className="mt-6">
      <div className="mb-4 flex justify-center">
        <Button variant="soft" size="sm" onClick={onRegenerate}>
          <FiRefreshCw size={16} aria-hidden="true" />
          Regenerar equipos
        </Button>
      </div>

      {streakSeparated && (
        <div className="mb-4 px-3 py-2 rounded bg-orange-50 border border-orange-200 text-orange-800 text-sm">
          🔥 Jugadores en racha de 4+ victorias fueron distribuidos en equipos distintos
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        <TeamCard
          title="Equipo A"
          team={teamA}
          color="primary"
          winProbability={probA}
          goalkeeperIds={goalkeeperIds}
          manualIds={manualIds}
        />
        <TeamCard
          title="Equipo B"
          team={teamB}
          color="secondary"
          winProbability={probB}
          goalkeeperIds={goalkeeperIds}
          manualIds={manualIds}
        />
      </div>

      <div className="mt-6">
        <h3 className="mb-1 text-lg font-semibold">Posiciones en la cancha</h3>
        <PitchCanvas
          teamA={toPitchPlayers(teamA, positions)}
          teamB={toPitchPlayers(teamB, positions)}
          goalkeeperIds={goalkeeperList}
          editable
          onPlayerMove={(playerId, position) => setPositions((previous) => ({ ...previous, [playerId]: position }))}
          showMatchStats={false}
          hint="Arrastrá las fichas, o enfocalas y usá las flechas, para elegir dónde arranca cada jugador"
        />
      </div>

      <CreateDraftForm
        positions={positions}
        teamAPlayers={teamA.players}
        teamBPlayers={teamB.players}
        matchType={matchType}
        players={players}
        isFriendly={isFriendly}
        onFriendlyToggle={onFriendlyToggle}
        draft={draft}
        onDraftChange={onDraftChange}
      />
    </Card>
  )
}
