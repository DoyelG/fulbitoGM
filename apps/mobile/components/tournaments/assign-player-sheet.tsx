import { TournamentMemberError } from '@fulbito/firebase'
import type { Player } from '@fulbito/types'
import { useState } from 'react'
import { ScrollView, Text, View } from 'react-native'

import { BottomSheet } from '@/components/match/matchForm/bottomSheet'
import { ProfileButton } from '@/components/profile/profile-button'
import { formStyles } from '@/components/profile/profile-form.styles'
import { useAppTheme } from '@/hooks/use-theme'

import { OptionList, type Option } from './option-list'
import { sheetFormStyles } from './sheet-form.styles'

type Props = {
  title: string
  description: string
  players: Player[]
  currentPlayerId: string | null
  isLoading?: boolean
  onSubmit: (playerId: string | null) => Promise<void>
  onClose: () => void
}

export function AssignPlayerSheet({
  title,
  description,
  players,
  currentPlayerId,
  isLoading = false,
  onSubmit,
  onClose,
}: Props) {
  const { colors } = useAppTheme()
  const [playerId, setPlayerId] = useState<string | null>(currentPlayerId)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const options: Option<string | null>[] = [
    { value: null, label: 'Sin jugador' },
    ...players.map((player) => ({ value: player.id, label: player.name })),
  ]

  const handleSubmit = async () => {
    setIsSubmitting(true)
    setError(null)
    try {
      await onSubmit(playerId)
    } catch (submitError) {
      setError(
        submitError instanceof TournamentMemberError
          ? submitError.message
          : 'No se pudo asignar el jugador. Intentá de nuevo.',
      )
      setIsSubmitting(false)
    }
  }

  return (
    <BottomSheet visible title={title} closeLabel="Cerrar" onConfirm={onClose}>
      <ScrollView style={sheetFormStyles.scroll} contentContainerStyle={sheetFormStyles.content}>
        <Text style={[sheetFormStyles.text, { color: colors.text }]}>{description}</Text>
        {isLoading ? (
          <Text style={[sheetFormStyles.text, { color: colors.muted }]} accessibilityLiveRegion="polite">
            Cargando jugadores...
          </Text>
        ) : (
          <OptionList options={options} value={playerId} onChange={setPlayerId} label="Jugador" maxHeight={260} />
        )}
        {error && (
          <Text style={[formStyles.error, { color: colors.danger }]} accessibilityLiveRegion="polite">
            {error}
          </Text>
        )}
        <View style={sheetFormStyles.actions}>
          <ProfileButton label="Cancelar" variant="secondary" onPress={onClose} disabled={isSubmitting} />
          <ProfileButton
            label={isSubmitting ? 'Guardando...' : 'Guardar'}
            onPress={() => void handleSubmit()}
            disabled={isLoading || isSubmitting || playerId === currentPlayerId}
          />
        </View>
      </ScrollView>
    </BottomSheet>
  )
}
