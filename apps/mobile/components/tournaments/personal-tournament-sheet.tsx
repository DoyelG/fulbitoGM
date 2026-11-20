import { useState } from 'react'
import { ScrollView, Text, TextInput, View } from 'react-native'

import { BottomSheet } from '@/components/match/matchForm/bottomSheet'
import { ProfileButton } from '@/components/profile/profile-button'
import { formStyles } from '@/components/profile/profile-form.styles'
import { useAppTheme } from '@/hooks/use-theme'

import { sheetFormStyles } from './sheet-form.styles'

const NAME_MAX_LENGTH = 50

type Props = {
  onSubmit: (playerName: string) => Promise<void>
  onClose: () => void
}

export function PersonalTournamentSheet({ onSubmit, onClose }: Props) {
  const { colors } = useAppTheme()
  const [name, setName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const trimmedName = name.trim()

  const handleSubmit = async () => {
    setIsSubmitting(true)
    setError(null)
    try {
      await onSubmit(trimmedName)
    } catch {
      setError('No se pudo crear tu historia personal. Intentá de nuevo.')
      setIsSubmitting(false)
    }
  }

  return (
    <BottomSheet visible title="Crear mi historia personal" closeLabel="Cerrar" onConfirm={onClose}>
      <ScrollView
        style={sheetFormStyles.scroll}
        contentContainerStyle={sheetFormStyles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={[sheetFormStyles.text, { color: colors.text }]}>
          Es un torneo solo para vos: cargás tus propios partidos, goles y clips, y seguís tu objetivo de Mundial. Podés
          tener una sola.
        </Text>
        <View>
          <Text style={[formStyles.label, { color: colors.muted }]}>Tu nombre de jugador</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            maxLength={NAME_MAX_LENGTH}
            accessibilityLabel="Tu nombre de jugador"
            placeholderTextColor={colors.muted}
            style={[
              formStyles.input,
              { backgroundColor: colors.chipBg, borderColor: colors.border, color: colors.text },
            ]}
          />
        </View>
        {error && (
          <Text style={[formStyles.error, { color: colors.danger }]} accessibilityLiveRegion="polite">
            {error}
          </Text>
        )}
        <View style={sheetFormStyles.actions}>
          <ProfileButton label="Cancelar" variant="secondary" onPress={onClose} disabled={isSubmitting} />
          <ProfileButton
            label={isSubmitting ? 'Creando...' : 'Crear mi historia'}
            onPress={() => void handleSubmit()}
            disabled={!trimmedName || isSubmitting}
          />
        </View>
      </ScrollView>
    </BottomSheet>
  )
}
