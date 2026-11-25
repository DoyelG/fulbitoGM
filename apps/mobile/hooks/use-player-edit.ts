import { updatePlayer } from '@fulbito/firebase'
import type { Player } from '@fulbito/types'
import { getGoalkeeping, getPlayerSkillSummary } from '@fulbito/utils'
import { useCallback, useEffect, useState } from 'react'
import { Alert } from 'react-native'

import type { PlayerEditFormValues } from '@/components/players/edit/player-edit-form'

const DEFAULT_VALUES: PlayerEditFormValues = {
  name: '',
  position: 'PLAYER',
  physical: 5,
  technical: 5,
  tactical: 5,
  psychological: 5,
  goalkeeping: 5,
  inactive: false,
}

function toValues(player: Player): PlayerEditFormValues {
  const { catSkills } = getPlayerSkillSummary(player)
  return {
    name: player.name,
    position: player.position,
    ...catSkills,
    goalkeeping: getGoalkeeping(player),
    inactive: player.inactive ?? false,
  }
}

export function usePlayerEdit(player: Player | null, reload: () => Promise<void>) {
  const [values, setValues] = useState<PlayerEditFormValues>(DEFAULT_VALUES)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (player) setValues(toValues(player))
  }, [player])

  const save = useCallback(async (): Promise<boolean> => {
    if (!player) return false
    setSaving(true)
    try {
      const skills = {
        physical: values.physical,
        technical: values.technical,
        tactical: values.tactical,
        psychological: values.psychological,
      }
      const skill = (skills.physical + skills.technical + skills.tactical + skills.psychological) / 4
      await updatePlayer(player.id, {
        name: values.name.trim(),
        position: values.position,
        skills,
        skill,
        goalkeeping: values.goalkeeping,
        inactive: values.inactive,
      })
      await reload()
      return true
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'No se pudo actualizar el jugador.')
      return false
    } finally {
      setSaving(false)
    }
  }, [player, values, reload])

  return { values, setValues, saving, save }
}
