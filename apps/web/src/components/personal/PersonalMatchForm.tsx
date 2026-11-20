'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { MATCH_TYPES, type MatchInput, type MatchType } from '@fulbito/types'
import { toLocalDay } from '@fulbito/utils'
import { useMatchStore } from '@/store/useMatchStore'
import { selectActiveTournament, selectMyPlayerId, useTournamentStore } from '@/store/useTournamentStore'
import Button from '@/components/Button'
import { Card } from '@/components/Card'
import FriendlySwitch from '@/components/FriendlySwitch'
import PageTitle from '@/components/PageTitle'
import { fieldClassName, selectClassName } from '@/lib/field-styles'

const MAX_SCORE = 99
const MAX_OPPONENT_LENGTH = 60

function toScore(value: string): number {
  const parsed = Number.parseInt(value, 10)
  return Number.isNaN(parsed) ? 0 : Math.min(MAX_SCORE, Math.max(0, parsed))
}

export default function PersonalMatchForm() {
  const router = useRouter()
  const addMatch = useMatchStore((state) => state.addMatch)
  const playerId = useTournamentStore(selectMyPlayerId)
  const playerName = useTournamentStore(selectActiveTournament)?.tournament.name ?? ''
  const [date, setDate] = useState(() => toLocalDay(new Date()))
  const [type, setType] = useState<MatchType>('5v5')
  const [myScore, setMyScore] = useState('0')
  const [opponentScore, setOpponentScore] = useState('0')
  const [opponentName, setOpponentName] = useState('')
  const [goals, setGoals] = useState('0')
  const [performance, setPerformance] = useState('5')
  const [isFriendly, setIsFriendly] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!playerId) {
      setError('Tu jugador personal todavía no está listo. Recargá la página.')
      return
    }
    if (!date) {
      setError('La fecha es obligatoria')
      return
    }
    setSubmitting(true)
    setError(null)
    const match: MatchInput = {
      date: new Date(`${date}T12:00:00`).toISOString(),
      type,
      status: 'final',
      teamAScore: toScore(myScore),
      teamBScore: toScore(opponentScore),
      teamA: [
        {
          id: playerId,
          name: playerName,
          goals: toScore(goals),
          performance: Math.min(10, Math.max(1, toScore(performance))),
        },
      ],
      teamB: [],
      opponentName: opponentName.trim() || undefined,
      isFriendly,
    }
    try {
      const matchId = await addMatch(match)
      router.push(`/history/${matchId}`)
    } catch {
      setError('No se pudo guardar el partido. Intentá de nuevo.')
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <PageTitle>Registrar partido</PageTitle>
      <Card padding={6}>
        <form onSubmit={handleSubmit} noValidate aria-busy={submitting} className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="personal-date" className="block text-sm font-medium mb-1">
              Fecha
            </label>
            <input
              id="personal-date"
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              className={fieldClassName}
            />
          </div>
          <div>
            <label htmlFor="personal-type" className="block text-sm font-medium mb-1">
              Formato
            </label>
            <select
              id="personal-type"
              value={type}
              onChange={(event) => setType(event.target.value as MatchType)}
              className={selectClassName}
            >
              {MATCH_TYPES.map((matchType) => (
                <option key={matchType} value={matchType}>
                  {matchType}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="personal-my-score" className="block text-sm font-medium mb-1">
              Goles de mi equipo
            </label>
            <input
              id="personal-my-score"
              type="number"
              inputMode="numeric"
              min={0}
              max={MAX_SCORE}
              value={myScore}
              onChange={(event) => setMyScore(event.target.value)}
              className={fieldClassName}
            />
          </div>
          <div>
            <label htmlFor="personal-opponent-score" className="block text-sm font-medium mb-1">
              Goles del rival
            </label>
            <input
              id="personal-opponent-score"
              type="number"
              inputMode="numeric"
              min={0}
              max={MAX_SCORE}
              value={opponentScore}
              onChange={(event) => setOpponentScore(event.target.value)}
              className={fieldClassName}
            />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="personal-opponent" className="block text-sm font-medium mb-1">
              Rival (opcional)
            </label>
            <input
              id="personal-opponent"
              value={opponentName}
              maxLength={MAX_OPPONENT_LENGTH}
              onChange={(event) => setOpponentName(event.target.value)}
              className={fieldClassName}
            />
          </div>
          <div>
            <label htmlFor="personal-goals" className="block text-sm font-medium mb-1">
              Mis goles
            </label>
            <input
              id="personal-goals"
              type="number"
              inputMode="numeric"
              min={0}
              max={MAX_SCORE}
              value={goals}
              onChange={(event) => setGoals(event.target.value)}
              className={fieldClassName}
            />
          </div>
          <div>
            <label htmlFor="personal-performance" className="block text-sm font-medium mb-1">
              Mi rendimiento (1 a 10)
            </label>
            <input
              id="personal-performance"
              type="number"
              inputMode="numeric"
              min={1}
              max={10}
              value={performance}
              onChange={(event) => setPerformance(event.target.value)}
              className={fieldClassName}
            />
          </div>
          <div className="sm:col-span-2">
            <FriendlySwitch
              id="personal-friendly"
              isFriendly={isFriendly}
              onToggle={() => setIsFriendly((wasFriendly) => !wasFriendly)}
            />
          </div>
          {error && (
            <p role="alert" className="sm:col-span-2 text-sm text-orange-700">
              {error}
            </p>
          )}
          <div className="sm:col-span-2 flex justify-end">
            <Button type="submit" disabled={submitting || !playerId}>
              {submitting ? 'Guardando...' : 'Guardar partido'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
