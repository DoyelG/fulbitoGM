import { useState } from 'react'
import { ScrollView, Text, TextInput, View } from 'react-native'

import { BottomSheet } from '@/components/match/matchForm/bottomSheet'
import { ProfileButton } from '@/components/profile/profile-button'
import { formStyles } from '@/components/profile/profile-form.styles'
import type { TournamentInput } from '@/contexts/TournamentContext'
import { useAppTheme } from '@/hooks/use-theme'

import { sheetFormStyles } from './sheet-form.styles'
import { TournamentPhotoField } from './tournament-photo-field'

const NAME_MAX_LENGTH = 60
const DESCRIPTION_MAX_LENGTH = 280

type Props = {
  title: string
  initial?: TournamentInput
  initialPhotoUrl?: string
  submitLabel: string
  errorMessage: string
  onSubmit: (input: TournamentInput) => Promise<void>
  onClose: () => void
}

export function TournamentFormSheet({
  title,
  initial,
  initialPhotoUrl,
  submitLabel,
  errorMessage,
  onSubmit,
  onClose,
}: Props) {
  const { colors } = useAppTheme()
  const [name, setName] = useState(initial?.name ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [photoUri, setPhotoUri] = useState<string | null | undefined>(undefined)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const trimmedName = name.trim()
  const inputStyle = [
    formStyles.input,
    { backgroundColor: colors.chipBg, borderColor: colors.border, color: colors.text },
  ]

  const handleSubmit = async () => {
    setIsSubmitting(true)
    setError(null)
    try {
      await onSubmit({ name: trimmedName, description: description.trim() || undefined, photoUri })
    } catch {
      setError(errorMessage)
      setIsSubmitting(false)
    }
  }

  return (
    <BottomSheet visible title={title} closeLabel="Cerrar" onConfirm={onClose}>
      <ScrollView
        style={sheetFormStyles.scroll}
        contentContainerStyle={sheetFormStyles.content}
        keyboardShouldPersistTaps="handled"
      >
        <TournamentPhotoField
          currentUrl={initialPhotoUrl}
          value={photoUri}
          onChange={setPhotoUri}
          disabled={isSubmitting}
        />
        <View>
          <Text style={[formStyles.label, { color: colors.muted }]}>Nombre</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            maxLength={NAME_MAX_LENGTH}
            placeholder="Ej: Fulbito de los martes"
            placeholderTextColor={colors.muted}
            accessibilityLabel="Nombre del torneo"
            style={inputStyle}
          />
        </View>
        <View>
          <Text style={[formStyles.label, { color: colors.muted }]}>Descripción (opcional)</Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            maxLength={DESCRIPTION_MAX_LENGTH}
            multiline
            placeholder="Dónde y cuándo juegan, reglas, etc."
            placeholderTextColor={colors.muted}
            accessibilityLabel="Descripción del torneo"
            style={[inputStyle, sheetFormStyles.multiline]}
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
            label={isSubmitting ? 'Guardando...' : submitLabel}
            onPress={() => void handleSubmit()}
            disabled={!trimmedName || isSubmitting}
          />
        </View>
      </ScrollView>
    </BottomSheet>
  )
}
