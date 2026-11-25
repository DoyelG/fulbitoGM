import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router'
import { useEffect, useLayoutEffect } from 'react'
import { Alert, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { PlayerEditForm } from '@/components/players/edit/player-edit-form'
import { useCanManageTournament } from '@/hooks/use-can-manage-tournament'
import { usePlayerEdit } from '@/hooks/use-player-edit'
import { usePlayersData } from '@/hooks/use-players-data'
import { useAppTheme } from '@/hooks/use-theme'

export default function EditPlayerScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const navigation = useNavigation()
  const router = useRouter()
  const canManage = useCanManageTournament()
  const { colors } = useAppTheme()

  const { players, reload } = usePlayersData()
  const player = players.find((p) => p.id === id) ?? null
  const { values, setValues, saving, save } = usePlayerEdit(player, reload)

  useLayoutEffect(() => {
    navigation.setOptions({ title: 'Editar jugador' })
  }, [navigation])

  useEffect(() => {
    if (!canManage) {
      Alert.alert('Sin permisos', 'Solo los administradores pueden editar jugadores.', [
        { text: 'Volver', onPress: () => router.back() },
      ])
    }
  }, [canManage, router])

  const handleSave = async () => {
    if (await save()) router.back()
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={[]}>
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
