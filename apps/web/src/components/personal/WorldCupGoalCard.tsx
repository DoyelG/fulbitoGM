'use client'

import { useState, type FormEvent } from 'react'
import { MAX_WORLD_CUP_GOAL, type MyTournament } from '@fulbito/types'
import { isValidWorldCupGoal, worldCupProgress, type UnbeatenRun } from '@fulbito/utils'
import { useTournamentStore } from '@/store/useTournamentStore'
import Button from '@/components/Button'
import { Card } from '@/components/Card'
import { fieldClassName } from '@/lib/field-styles'

type Props = {
  personal: MyTournament
  run: UnbeatenRun
}

export default function WorldCupGoalCard({ personal, run }: Props) {
  const saveWorldCupGoal = useTournamentStore((state) => state.saveWorldCupGoal)
  const goal = personal.tournament.worldCupGoal ?? null
  const [editing, setEditing] = useState(false)
  const isEditing = editing || goal === null
  const [value, setValue] = useState(goal === null ? '' : String(goal))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const progress = goal === null ? null : worldCupProgress(run, goal)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const parsed = Number(value)
    if (!isValidWorldCupGoal(parsed)) {
      setError(`Ingresá un número entero de 1 a ${MAX_WORLD_CUP_GOAL}`)
      return
    }
    setSaving(true)
    setError(null)
    try {
      await saveWorldCupGoal(personal.tournament.id, parsed)
      setEditing(false)
    } catch {
      setError('No se pudo guardar tu objetivo. Intentá de nuevo.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card padding={4} as="section" className="mb-6">
      <h2 className="text-base font-bold">Mi objetivo de Mundial</h2>
      <p className="mt-0.5 text-xs text-gray-700">
        Partidos seguidos sin perder en todos tus torneos. Empates no cortan la racha; amistosos no cuentan.
      </p>

      {progress && !isEditing && (
        <div className="mt-3" aria-live="polite">
          <div className="flex items-baseline justify-between">
            <p className="text-xl font-black">
              {progress.current} <span className="text-sm font-medium text-gray-700">de {progress.goal}</span>
            </p>
            {progress.reached && <p className="text-sm font-semibold text-primary">¡Objetivo cumplido! 🏆</p>}
          </div>
          <div
            role="progressbar"
            aria-label="Progreso hacia el objetivo de Mundial"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progress.percent}
            className="mt-2 h-2 overflow-hidden rounded-full bg-gray-200"
          >
            <div className="h-full bg-primary-gradient" style={{ width: `${progress.percent}%` }} />
          </div>
          <p className="mt-2 text-xs text-gray-700">Mejor racha: {run.best}</p>
          <Button variant="secondary" size="sm" className="mt-3" onClick={() => setEditing(true)}>
            Cambiar objetivo
          </Button>
        </div>
      )}

      {isEditing && (
        <form onSubmit={handleSubmit} noValidate className="mt-4 flex flex-wrap items-end gap-3">
          <div>
            <label htmlFor="world-cup-goal" className="block text-sm font-medium mb-1">
              Partidos seguidos sin perder
            </label>
            <input
              id="world-cup-goal"
              type="number"
              inputMode="numeric"
              min={1}
              max={MAX_WORLD_CUP_GOAL}
              value={value}
              onChange={(event) => setValue(event.target.value)}
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? 'world-cup-goal-error' : undefined}
              className={fieldClassName}
            />
          </div>
          <Button type="submit" disabled={saving}>
            {saving ? 'Guardando...' : 'Guardar objetivo'}
          </Button>
          {goal !== null && (
            <Button variant="secondary" onClick={() => setEditing(false)} disabled={saving}>
              Cancelar
            </Button>
          )}
          {error && (
            <p id="world-cup-goal-error" role="alert" className="w-full text-sm text-orange-700">
              {error}
            </p>
          )}
        </form>
      )}
    </Card>
  )
}
