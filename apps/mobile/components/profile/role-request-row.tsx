import type { RoleRequest, RoleRequestStatus } from '@fulbito/types'
import { Text, View } from 'react-native'

import { useAppTheme } from '@/hooks/use-theme'

import { ProfileButton } from './profile-button'
import { formStyles } from './profile-form.styles'
import { styles } from './role-request-section.styles'

type Props = {
  title: string
  description: string
  request: RoleRequest | null
  detail?: string
  isSending: boolean
  onRequest: () => void
  onCancel: () => void
}

const statusLabels: Record<RoleRequestStatus, string> = {
  pending: 'Pendiente de aprobación',
  rejected: 'Solicitud rechazada',
  accepted: 'Solicitud aprobada',
}

export function RoleRequestRow({ title, description, request, detail, isSending, onRequest, onCancel }: Props) {
  const { colors } = useAppTheme()
  const status = request?.status
  const badgeColors = {
    pending: { background: colors.brandSoft, text: colors.warning },
    rejected: { background: colors.dangerBg, text: colors.danger },
    accepted: { background: colors.brandSoft, text: colors.friendlyBrand },
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
      {detail && status !== 'accepted' && <Text style={[styles.description, { color: colors.muted }]}>{detail}</Text>}
      {status === 'accepted' && (
        <Text style={[styles.description, { color: colors.muted }]}>
          Cerrá sesión y volvé a entrar para ver el cambio.
        </Text>
      )}
      {status === 'pending' && (
        <View style={formStyles.actions}>
          <ProfileButton
            label="Cancelar solicitud"
            variant="dangerousSecondary"
            onPress={onCancel}
            disabled={isSending}
          />
        </View>
      )}
      {status !== 'pending' && status !== 'accepted' && (
        <View style={formStyles.actions}>
          <ProfileButton
            label={status === 'rejected' ? 'Solicitar de nuevo' : 'Solicitar'}
            onPress={onRequest}
            disabled={isSending}
          />
        </View>
      )}
    </View>
  )
}
