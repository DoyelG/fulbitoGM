import Feather from '@expo/vector-icons/Feather'
import type { Invitation } from '@fulbito/types'
import { TOURNAMENT_ROLE_LABELS } from '@fulbito/utils'
import { useState } from 'react'
import { Text, View } from 'react-native'

import { ProfileButton } from '@/components/profile/profile-button'
import { useAppTheme } from '@/hooks/use-theme'

import { styles } from './invitations-section.styles'

type Props = {
  invitations: Invitation[]
  playerNameById: Map<string, string>
  onRevoke: (invitationId: string) => Promise<void>
}

export function InvitationsSection({ invitations, playerNameById, onRevoke }: Props) {
  const { colors } = useAppTheme()
  const [revokingId, setRevokingId] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  if (invitations.length === 0) return null

  const handleRevoke = async (invitationId: string) => {
    setRevokingId(invitationId)
    setErrorMessage(null)
    try {
      await onRevoke(invitationId)
    } catch {
      setErrorMessage('No se pudo revocar la invitación. Intentá de nuevo.')
    } finally {
      setRevokingId(null)
    }
  }

  return (
    <View style={styles.section}>
      <View style={styles.titleRow}>
        <Feather name="mail" size={16} color={colors.primaryText} accessible={false} />
        <Text style={[styles.title, { color: colors.text }]} accessibilityRole="header">
          Invitaciones pendientes
        </Text>
      </View>
      {invitations.map((invitation) => {
        const playerName = invitation.playerId ? playerNameById.get(invitation.playerId) : undefined
        return (
          <View
            key={invitation.id}
            style={[styles.row, { backgroundColor: colors.surface, borderColor: colors.border }]}
          >
            <View style={styles.info}>
              <Text style={[styles.email, { color: colors.text }]} numberOfLines={1}>
                {invitation.email}
              </Text>
              <Text style={[styles.detail, { color: colors.muted }]} numberOfLines={1}>
                {TOURNAMENT_ROLE_LABELS[invitation.role]}
                {playerName ? ` · ${playerName}` : ''}
              </Text>
            </View>
            <ProfileButton
              label={revokingId === invitation.id ? 'Revocando...' : 'Revocar'}
              variant="dangerousSecondary"
              onPress={() => void handleRevoke(invitation.id)}
              disabled={revokingId !== null}
            />
          </View>
        )
      })}
      {errorMessage && (
        <Text style={[styles.detail, { color: colors.danger }]} accessibilityLiveRegion="polite">
          {errorMessage}
        </Text>
      )}
    </View>
  )
}
