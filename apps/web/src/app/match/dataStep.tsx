'use client'

import type { MatchType } from '@fulbito/types'
import type { Player } from '@/store/usePlayerStore'
import type { TeamResult } from '@/lib/teamUtils'
import { Card } from '@/components/Card'
import Button from '@/components/Button'
import { FiRefreshCw } from 'react-icons/fi'
import CreateDraftForm, { type DraftForm } from './draftForm'
import TeamCard from './teamCard'

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
          color="brand"
          winProbability={probA}
          goalkeeperIds={goalkeeperIds}
          manualIds={manualIds}
        />
        <TeamCard
          title="Equipo B"
          team={teamB}
          color="accent"
          winProbability={probB}
          goalkeeperIds={goalkeeperIds}
          manualIds={manualIds}
        />
      </div>

      <CreateDraftForm
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
