'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { MatchInput, MatchLocation, MatchType } from '@fulbito/types'
import { buildMatchSchedule, onlyFinalMatches } from '@fulbito/utils'
import type { Player } from '@/store/usePlayerStore'
import { useMatchStore } from '@/store/useMatchStore'
import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext'
import {
  buildPlayedBeforeSet,
  computeLeastAssignedPoolIds,
  getEligiblePlayerIds,
  getShirtDutiesByPlayerId,
} from '@/lib/shirtDuty'
import type { PlayerInfo, TeamResult } from '@/lib/teamUtils'
import { Card } from '@/components/Card'
import Button from '@/components/Button'
import FriendlySwitch from '@/components/FriendlySwitch'
import HourField from '@/components/HourField'
import AddressPicker from '@/components/AddressPicker'
import { FiRefreshCw } from 'react-icons/fi'
import { LuDices } from 'react-icons/lu'
import Chevron from '../shared/Icons/Chevron'
import TeamCard from './teamCard'

function pickRandomId(pool: PlayerInfo[]): string | null {
  if (pool.length === 0) return null
  return pool[Math.floor(Math.random() * pool.length)].id
}

export type DraftForm = {
  date: string
  hour: number | null
  name: string
  location: MatchLocation | null
  description: string
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
  const router = useRouter()
  const { isAdmin } = useFirebaseAuth()
  const { matches, addMatch } = useMatchStore()

  const [isCreatingDraft, setIsCreatingDraft] = useState(false)

  const finalMatches = useMemo(() => onlyFinalMatches(matches), [matches])
  const playedBefore = useMemo(() => buildPlayedBeforeSet(finalMatches), [finalMatches])
  const dutiesById = useMemo(() => getShirtDutiesByPlayerId(finalMatches), [finalMatches])

  const teamPlayers = useMemo(() => [...teamA.players, ...teamB.players], [teamA, teamB])

  const dutyPool: PlayerInfo[] = useMemo(() => {
    const consideredIds = getEligiblePlayerIds(
      teamPlayers.map((player) => player.id),
      playedBefore,
    )
    const { poolIds } = computeLeastAssignedPoolIds(consideredIds, dutiesById)
    return teamPlayers.filter((player) => poolIds.includes(player.id))
  }, [teamPlayers, playedBefore, dutiesById])

  const [shirtsResponsibleId, setShirtsResponsibleId] = useState<string | null>(() => pickRandomId(dutyPool))

  const combinedSkill = teamA.totalSkill + teamB.totalSkill
  const probA = combinedSkill > 0 ? Math.round((teamA.totalSkill / combinedSkill) * 100) : 50
  const probB = combinedSkill > 0 ? 100 - probA : 50

  const eligibleExists = teamPlayers.some((player) => playedBefore.has(player.id))

  const playerName = (playerId: string) => players.find((player) => player.id === playerId)?.name ?? '—'

  const getShirtsResponsibleLabel = () => {
    if (shirtsResponsibleId) return playerName(shirtsResponsibleId)
    if (dutyPool.length === 0) return 'Seleccione jugadores y genere equipos'
    return `${playerName(dutyPool[0].id)} (entre ${dutyPool.length} con menos asignaciones)`
  }

  const createDraft = async () => {
    if (isCreatingDraft) return
    setIsCreatingDraft(true)
    try {
      const newMatch: MatchInput = {
        ...buildMatchSchedule(draft.date, draft.hour),
        type: matchType,
        location: draft.location || undefined,
        status: 'draft',
        teamAScore: 0,
        teamBScore: 0,
        teamA: teamA.players.map((player) => ({ id: player.id, name: player.name, goals: 0, performance: 0 })),
        teamB: teamB.players.map((player) => ({ id: player.id, name: player.name, goals: 0, performance: 0 })),
        name: draft.name.trim() || undefined,
        shirtsResponsibleId: shirtsResponsibleId ?? null,
        description: draft.description.trim() || undefined,
        mvpId: null,
        isFriendly,
      }
      await addMatch(newMatch)
      router.push('/history')
    } catch (err) {
      console.error(err)
      alert('Error al crear el partido')
    } finally {
      setIsCreatingDraft(false)
    }
  }

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

      <div className="pt-4">
        <div className="flex flex-col md:flex-row gap-3 md:items-center">
          <div className="text-sm">
            <div className="font-semibold">Encargado de camisetas</div>
            <div className="text-black">{getShirtsResponsibleLabel()}</div>
          </div>
          <div className="flex-1">
            <div className="relative">
              <select
                aria-label="Encargado de camisetas"
                className="h-10 appearance-none border border-gray-300 rounded pl-3 pr-8 w-full"
                value={shirtsResponsibleId ?? ''}
                onChange={(event) => setShirtsResponsibleId(event.target.value || null)}
              >
                <option value="">(aleatorio entre elegibles con menos asignaciones)</option>
                {teamPlayers.map((player) => {
                  const isNew = eligibleExists && !playedBefore.has(player.id)
                  return (
                    <option key={player.id} value={player.id} disabled={isNew}>
                      {player.name} (#{dutiesById.get(player.id) ?? 0}){isNew ? ' — nuevo' : ''}
                    </option>
                  )
                })}
              </select>
              <Chevron select />
            </div>
          </div>
          <div>
            <Button
              variant="soft"
              className="h-10 whitespace-nowrap"
              onClick={() => setShirtsResponsibleId((currentId) => pickRandomId(dutyPool) ?? currentId)}
            >
              <LuDices size={16} aria-hidden="true" />
              Elegir aleatorio
            </Button>
          </div>
        </div>
        <div className="py-2">
          <label htmlFor="match-description" className="block text-sm font-semibold mb-1">
            Crónica
          </label>
          <textarea
            id="match-description"
            value={draft.description}
            onChange={(event) => onDraftChange({ description: event.target.value })}
            placeholder="Escribí la crónica del partido"
            className="border border-gray-300 rounded px-3 py-2 w-full"
          />
        </div>
      </div>

      {isAdmin && (
        <div className="mt-6 border-t pt-4">
          <h4 className="font-semibold mb-3">Crear partido</h4>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:items-end lg:grid-cols-[auto_auto_minmax(0,2fr)_minmax(0,1.5fr)_auto_auto]">
            <div>
              <label htmlFor="draft-date" className="block text-sm mb-1">
                Fecha
              </label>
              <input
                id="draft-date"
                type="date"
                value={draft.date}
                onChange={(event) => onDraftChange({ date: event.target.value })}
                className="h-10 border border-gray-300 rounded px-3 w-full"
              />
            </div>
            <HourField
              id="draft-hour"
              value={draft.hour}
              onChange={(hour) => onDraftChange({ hour })}
              labelClassName="block text-sm"
            />
            <div>
              <label htmlFor="draft-location" className="block text-sm mb-1">
                Cancha
              </label>
              <AddressPicker
                id="draft-location"
                value={draft.location}
                onChange={(location) => onDraftChange({ location })}
              />
            </div>
            <div>
              <label htmlFor="draft-name" className="block text-sm mb-1">
                Nombre (opcional)
              </label>
              <input
                id="draft-name"
                type="text"
                value={draft.name}
                onChange={(event) => onDraftChange({ name: event.target.value })}
                placeholder="Ej: Partido del miércoles"
                className="h-10 border border-gray-300 rounded px-3 w-full"
              />
            </div>
            <FriendlySwitch isFriendly={isFriendly} onToggle={onFriendlyToggle} />
            <Button
              onClick={createDraft}
              disabled={isCreatingDraft}
              className="h-10 w-full sm:col-span-2 lg:col-span-1 lg:w-auto whitespace-nowrap"
            >
              {isCreatingDraft ? 'Creando...' : 'Crear partido'}
            </Button>
          </div>
          <p className="mt-2 text-xs text-gray-500">
            Se guarda como borrador en el historial. Más tarde podés completar el resultado.
          </p>
        </div>
      )}
    </Card>
  )
}
