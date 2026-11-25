import type { MyTournament } from '@fulbito/types'
import { MAX_WORLD_CUP_GOAL } from '@fulbito/types'
import { isValidWorldCupGoal, worldCupProgress, type UnbeatenRun } from '@fulbito/utils'
import { useState } from 'react'
import { ActivityIndicator, Text, TextInput, View } from 'react-native'

import { ProfileButton } from '@/components/profile/profile-button'
import { formStyles } from '@/components/profile/profile-form.styles'
import { useTournaments } from '@/contexts/TournamentContext'
import { useAppTheme } from '@/hooks/use-theme'

import { styles } from './world-cup-goal-card.styles'

type Props = {
  personal: MyTournament
  run: UnbeatenRun | null
  loading: boolean
  runError: boolean
  onRetry: () => void
}

export function WorldCupGoalCard({ personal, run, loading, runError, onRetry }: Props) {
  const { colors } = useAppTheme()
  const { saveWorldCupGoal } = useTournaments()
  const goal = personal.tournament.worldCupGoal ?? null
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(goal === null ? '' : String(goal))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const isEditing = editing || goal === null
  const progress = run && goal !== null ? worldCupProgress(run, goal) : null

  const handleSave = async () => {
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
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Text accessibilityRole="header" style={[styles.title, { color: colors.text }]}>
        MI OBJETIVO DE MUNDIAL
      </Text>
      <Text style={[styles.hint, { color: colors.muted }]}>
        Partidos seguidos sin perder, sumando todos tus torneos. Los empates no cortan la racha y los amistosos no
        cuentan.
      </Text>

      {loading && <ActivityIndicator color={colors.primaryText} accessibilityLabel="Calculando tu racha" />}
      {runError && (
        <View accessibilityLiveRegion="polite">
          <Text style={[styles.error, { color: colors.danger }]}>No se pudo calcular tu racha.</Text>
          <ProfileButton label="Reintentar" variant="secondary" onPress={onRetry} />
        </View>
      )}

      {progress && !isEditing && (
        <View accessibilityLiveRegion="polite" style={styles.form}>
          <Text style={[styles.count, { color: colors.text }]}>
            {progress.current} <Text style={[styles.countOf, { color: colors.muted }]}>de {progress.goal}</Text>
          </Text>
          <View
            accessible
            accessibilityRole="progressbar"
            accessibilityLabel="Progreso hacia el objetivo de Mundial"
            accessibilityValue={{ min: 0, max: 100, now: progress.percent }}
            style={[styles.track, { backgroundColor: colors.track }]}
          >
            <View style={[styles.fill, { backgroundColor: colors.primary, width: `${progress.percent}%` }]} />
          </View>
          {progress.reached && <Text style={[styles.reached, { color: colors.success }]}>¡Objetivo cumplido!</Text>}
          {run && <Text style={[styles.meta, { color: colors.textSecondary }]}>Mejor racha: {run.best}</Text>}
          <ProfileButton label="Cambiar objetivo" variant="secondary" onPress={() => setEditing(true)} />
        </View>
      )}

      {isEditing && (
        <View style={styles.form}>
          <Text style={[formStyles.label, { color: colors.muted }]}>Partidos seguidos sin perder</Text>
          <TextInput
            value={value}
            onChangeText={setValue}
            keyboardType="number-pad"
            maxLength={4}
            accessibilityLabel="Objetivo de partidos seguidos sin perder"
            style={[
              formStyles.input,
              { backgroundColor: colors.chipBg, borderColor: colors.border, color: colors.text },
            ]}
          />
          {error && (
            <Text style={[styles.error, { color: colors.danger }]} accessibilityLiveRegion="polite">
              {error}
            </Text>
          )}
          <View style={styles.actions}>
            {goal !== null && (
              <ProfileButton label="Cancelar" variant="secondary" onPress={() => setEditing(false)} disabled={saving} />
            )}
            <ProfileButton
              label={saving ? 'Guardando...' : 'Guardar objetivo'}
              onPress={() => void handleSave()}
              disabled={saving}
            />
          </View>
        </View>
      )}
    </View>
  )
}
