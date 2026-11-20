import { getGoalkeeping } from '@fulbito/utils'
import { ActivityIndicator, Modal, View } from 'react-native'
import { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'

import { PlayerGoldCard } from '@/components/players/detail/player-gold-card'
import { PlayerEditForm } from '@/components/players/edit/player-edit-form'
import { ProfileButton } from '@/components/profile/profile-button'
import { useTournaments } from '@/contexts/TournamentContext'
import { usePlayerDetail } from '@/hooks/use-player-detail'
import { usePlayerEdit } from '@/hooks/use-player-edit'
import { useAppTheme } from '@/hooks/use-theme'

import { styles } from './my-player-section.styles'

export function MyPlayerSection({ playerId }: { playerId: string }) {
  const { colors } = useAppTheme()
  const { activeTournament } = useTournaments()
  const { player, catSkills, overallAvg, reload, loading } = usePlayerDetail(playerId)
  const { values, setValues, saving, save } = usePlayerEdit(player, reload)
  const [editing, setEditing] = useState(false)

  if (!player) {
    return loading ? <ActivityIndicator color={colors.primaryText} accessibilityLabel="Cargando tu jugador" /> : null
  }

  const handleSave = async () => {
    if (await save()) setEditing(false)
  }

  return (
    <View style={styles.section}>
      <PlayerGoldCard
        name={player.name}
        position={player.position}
        overall={overallAvg}
        skills={catSkills}
        goalkeeping={getGoalkeeping(player)}
        photoUrl={player.photoUrl}
        tournamentPhotoUrl={activeTournament?.tournament.photoUrl}
      />
      <ProfileButton label="Editar mi jugador" variant="secondary" onPress={() => setEditing(true)} />
      <Modal
        visible={editing}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setEditing(false)}
      >
        <SafeAreaView style={[styles.modalRoot, { backgroundColor: colors.background }]}>
          <PlayerEditForm
            values={values}
            onChange={setValues}
            saving={saving}
            onSave={() => void handleSave()}
            onCancel={() => setEditing(false)}
          />
        </SafeAreaView>
      </Modal>
    </View>
  )
}
