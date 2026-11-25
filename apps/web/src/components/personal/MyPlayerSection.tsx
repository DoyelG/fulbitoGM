'use client'

import { useEffect, useState } from 'react'
import { getGoalkeeping, getPlayerSkillSummary } from '@fulbito/utils'
import PlayerForm from '@/app/players/PlayerForm'
import Button from '@/components/Button'
import { Card } from '@/components/Card'
import Modal from '@/components/Modal'
import PlayerCard from '@/components/PlayerCard'
import RadarChart from '@/components/RadarChart'
import SkillBadge from '@/components/SkillBadge'
import { usePlayerStore } from '@/store/usePlayerStore'
import { selectActiveTournament, useTournamentStore } from '@/store/useTournamentStore'

type Props = { playerId: string }

export default function MyPlayerSection({ playerId }: Props) {
  const player = usePlayerStore((state) => state.players.find((item) => item.id === playerId))
  const playersInit = usePlayerStore((state) => state.playersInit)
  const initPlayers = usePlayerStore((state) => state.initLoad)
  const tournamentPhotoUrl = useTournamentStore(selectActiveTournament)?.tournament.photoUrl ?? null
  const [editing, setEditing] = useState(false)

  useEffect(() => {
    if (playersInit === 'idle') void initPlayers()
  }, [playersInit, initPlayers])

  if (!player) {
    return <div className="mb-6 h-64 rounded-2xl bg-gray-200 animate-pulse" aria-hidden />
  }

  const { catSkills, overallAvg } = getPlayerSkillSummary(player)

  return (
    <Card padding={6} as="section" className="mb-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold">Mi jugador</h2>
          <span className="flex items-center gap-2 text-sm text-gray-700">
            General: <SkillBadge skill={overallAvg} />
          </span>
        </div>
        <Button variant="secondary" onClick={() => setEditing(true)}>
          Editar mi jugador
        </Button>
      </div>
      <div className="grid items-center gap-8 md:grid-cols-[auto_1fr]">
        <div className="flex justify-center">
          <PlayerCard
            name={player.name}
            position={player.position}
            overall={overallAvg}
            photoUrl={player.photoUrl}
            skills={catSkills}
            goalkeeping={getGoalkeeping(player)}
            tournamentPhotoUrl={tournamentPhotoUrl}
          />
        </div>
        <div className="flex justify-center">
          <RadarChart
            labels={['Físico', 'Técnico', 'Táctico', 'Mental']}
            values={[catSkills.physical, catSkills.technical, catSkills.tactical, catSkills.psychological]}
            baseline={5}
            width={250}
            height={180}
            labelSize={11}
          />
        </div>
      </div>

      <Modal open={editing} onClose={() => setEditing(false)} title="Editar mi jugador">
        <PlayerForm
          mode="edit"
          playerId={playerId}
          embedded
          onDone={() => setEditing(false)}
          onCancel={() => setEditing(false)}
        />
      </Modal>
    </Card>
  )
}
