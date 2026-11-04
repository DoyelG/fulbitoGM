import { TournamentMemberError } from '@fulbito/firebase'
import type { InvitationRole, TournamentMember } from '@fulbito/types'
import { useState } from 'react'
import { ScrollView, Text, View } from 'react-native'

import { BottomSheet } from '@/components/match/matchForm/bottomSheet'
import { ProfileButton } from '@/components/profile/profile-button'
import { formStyles } from '@/components/profile/profile-form.styles'
import { useAppTheme } from '@/hooks/use-theme'

import { OptionList } from './option-list'
import { roleOptions } from './role-options'
import { sheetFormStyles } from './sheet-form.styles'

type Props = {
  member: TournamentMember
  onSubmit: (role: InvitationRole) => Promise<void>
  onClose: () => void
}

export function ChangeRoleSheet({ member, onSubmit, onClose }: Props) {
  const { colors } = useAppTheme()
  const [role, setRole] = useState<InvitationRole>(member.role === 'ADMIN' ? 'ADMIN' : 'MEMBER')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    setIsSubmitting(true)
    setError(null)
    try {
      await onSubmit(role)
    } catch (submitError) {
      setError(
        submitError instanceof TournamentMemberError
          ? submitError.message
          : 'No se pudo cambiar el rol. Intentá de nuevo.',
      )
      setIsSubmitting(false)
    }
  }

  return (
    <BottomSheet visible title="Cambiar rol" closeLabel="Cerrar" onConfirm={onClose}>
      <ScrollView style={sheetFormStyles.scroll} contentContainerStyle={sheetFormStyles.content}>
        <Text style={[sheetFormStyles.text, { color: colors.text }]}>
          Elegí el rol de <Text style={sheetFormStyles.strong}>{member.email}</Text> en este torneo.
        </Text>
        <OptionList options={roleOptions} value={role} onChange={setRole} label="Rol" />
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
            disabled={isSubmitting || role === member.role}
          />
        </View>
      </ScrollView>
    </BottomSheet>
  )
}
