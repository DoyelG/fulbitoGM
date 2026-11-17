import type { TournamentPlayerRequestStatus } from '@fulbito/types'
import { Text, View } from 'react-native'

import { useAppTheme } from '@/hooks/use-theme'

import { ProfileButton } from './profile-button'
import { formStyles } from './profile-form.styles'
import { styles } from './request-row.styles'

type Props = {
  title: string
  description: string
  status?: TournamentPlayerRequestStatus
  detail?: string
  isSending: boolean
  onRequest: () => void
  onCancel: () => void
}

const statusLabels: Record<TournamentPlayerRequestStatus, string> = {
  pending: 'Pendiente de aprobación',
  rejected: 'Solicitud rechazada',
}

export function RequestRow({ title, description, status, detail, isSending, onRequest, onCancel }: Props) {
  const { colors } = useAppTheme()
  const badgeColors = {
    pending: { background: colors.primarySoft, text: colors.warning },
    rejected: { background: colors.dangerBg, text: colors.danger },
  }

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.description, { color: colors.muted }]}>{description}</Text>
      {status && (
        <View style={[styles.badge, { backgroundColor: badgeColors[status].background }]}>
          <Text style={[styles.badgeText, { color: badgeColors[status].text }]}>{statusLabels[status]}</Text>
        </View>
      )}
      {detail && <Text style={[styles.description, { color: colors.muted }]}>{detail}</Text>}
      <View style={formStyles.actions}>
        {status === 'pending' ? (
          <ProfileButton
            label="Cancelar solicitud"
            variant="dangerousSecondary"
            onPress={onCancel}
            disabled={isSending}
          />
        ) : (
          <ProfileButton
            label={status === 'rejected' ? 'Solicitar de nuevo' : 'Solicitar'}
            onPress={onRequest}
            disabled={isSending}
          />
        )}
      </View>
    </View>
  )
}
