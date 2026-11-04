import { InvitationError } from '@fulbito/firebase'
import type { InvitationRole, Player } from '@fulbito/types'
import { useState } from 'react'
import { ScrollView, Text, TextInput, View } from 'react-native'

import { BottomSheet } from '@/components/match/matchForm/bottomSheet'
import { ProfileButton } from '@/components/profile/profile-button'
import { formStyles } from '@/components/profile/profile-form.styles'
import type { InvitationInput } from '@/hooks/use-tournament-members-data'
import { useAppTheme } from '@/hooks/use-theme'

import { roleOptions } from './role-options'
import { OptionList, type Option } from './option-list'
import { sheetFormStyles } from './sheet-form.styles'

type Props = {
  availablePlayers: Player[]
  onSubmit: (input: InvitationInput) => Promise<void>
  onClose: () => void
}

export function InviteMemberSheet({ availablePlayers, onSubmit, onClose }: Props) {
  const { colors } = useAppTheme()
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<InvitationRole>('MEMBER')
  const [playerId, setPlayerId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const playerOptions: Option<string | null>[] = [
    { value: null, label: 'Sin jugador' },
    ...availablePlayers.map((player) => ({ value: player.id, label: player.name })),
  ]

  const handleSubmit = async () => {
    setIsSubmitting(true)
    setError(null)
    try {
      await onSubmit({ email, role, playerId: playerId ?? undefined })
    } catch (submitError) {
      setError(
        submitError instanceof InvitationError
          ? submitError.message
          : 'No se pudo enviar la invitación. Intentá de nuevo.',
      )
      setIsSubmitting(false)
    }
  }

  return (
    <BottomSheet visible title="Agregar miembro" closeLabel="Cerrar" onConfirm={onClose}>
      <ScrollView
        style={sheetFormStyles.scroll}
        contentContainerStyle={sheetFormStyles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View>
          <Text style={[formStyles.label, { color: colors.muted }]}>Email</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="off"
            keyboardType="email-address"
            placeholder="nombre@ejemplo.com"
            placeholderTextColor={colors.muted}
            accessibilityLabel="Email"
            style={[
              formStyles.input,
              { backgroundColor: colors.chipBg, borderColor: colors.border, color: colors.text },
            ]}
          />
        </View>
        <View>
          <Text style={[formStyles.label, { color: colors.muted }]}>Rol</Text>
          <OptionList options={roleOptions} value={role} onChange={setRole} label="Rol" />
        </View>
        <View>
          <Text style={[formStyles.label, { color: colors.muted }]}>Jugador (opcional)</Text>
          <OptionList options={playerOptions} value={playerId} onChange={setPlayerId} label="Jugador" maxHeight={200} />
          <Text style={[sheetFormStyles.hint, { color: colors.muted }]}>
            Si no le asignás uno, va a poder pedirlo cuando entre al torneo.
          </Text>
        </View>
        {error && (
          <Text style={[formStyles.error, { color: colors.danger }]} accessibilityLiveRegion="polite">
            {error}
          </Text>
        )}
        <View style={sheetFormStyles.actions}>
          <ProfileButton label="Cancelar" variant="secondary" onPress={onClose} disabled={isSubmitting} />
          <ProfileButton
            label={isSubmitting ? 'Enviando...' : 'Invitar'}
            onPress={() => void handleSubmit()}
            disabled={isSubmitting || !email.trim()}
          />
        </View>
      </ScrollView>
    </BottomSheet>
  )
}
