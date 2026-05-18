import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router'
import { useCallback, useEffect, useLayoutEffect, useState } from 'react'
import { Alert, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { PlayerEditForm, type PlayerEditFormValues } from '@/components/players/edit/player-edit-form'
import { useIsAdmin } from '@/hooks/use-is-admin'
import { usePlayersData } from '@/hooks/use-players-data'
import { updatePlayerRequest } from '@/lib/api'
import { useAppTheme } from '@/hooks/use-theme'

export default function EditPlayerScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const navigation = useNavigation()
  const router = useRouter()
  const isAdmin = useIsAdmin()
  const { colors } = useAppTheme()

  const { players, reload } = usePlayersData()
  const player = players.find((p) => p.id === id) ?? null

  const [values, setValues] = useState<PlayerEditFormValues>({
    name: '',
    position: 'PLAYER',
    physical: 5,
    technical: 5,
    tactical: 5,
    psychological: 5,
  })
  const [saving, setSaving] = useState(false)

  useLayoutEffect(() => {
    navigation.setOptions({ title: 'Editar jugador' })
  }, [navigation])

  useEffect(() => {
    if (!isAdmin) {
      Alert.alert('Sin permisos', 'Solo los administradores pueden editar jugadores.', [
        { text: 'Volver', onPress: () => router.back() },
      ])
    }
  }, [isAdmin, router])

  useEffect(() => {
    if (player) {
      const base = player.skill ?? 5
      setValues({
        name: player.name,
        position: player.position,
        physical: Number(player.skills?.physical ?? base),
        technical: Number(player.skills?.technical ?? base),
        tactical: Number(player.skills?.tactical ?? base),
        psychological: Number(player.skills?.psychological ?? base),
      })
    }
  }, [player])

  const handleSave = useCallback(async () => {
    if (!id) return
    setSaving(true)
    try {
      const skills = {
        physical: values.physical,
        technical: values.technical,
        tactical: values.tactical,
        psychological: values.psychological,
      }
      const skill = (skills.physical + skills.technical + skills.tactical + skills.psychological) / 4
      await updatePlayerRequest(id, {
        name: values.name.trim(),
        position: values.position,
        skills,
        skill,
      })
      await reload()
      router.back()
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'No se pudo actualizar el jugador.')
    } finally {
      setSaving(false)
    }
  }, [id, values, reload, router])

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: colors.background }]}
      edges={['bottom']}>
      <PlayerEditForm
        values={values}
        onChange={setValues}
        saving={saving}
        onSave={() => void handleSave()}
        onCancel={() => router.back()}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
})
