import Feather from '@expo/vector-icons/Feather'
import { acceptInvitation, getMyInvitations, InvitationError, rejectInvitation, type AppUser } from '@fulbito/firebase'
import type { Invitation } from '@fulbito/types'
import { TOURNAMENT_ROLE_LABELS } from '@fulbito/utils'
import { useCallback, useEffect, useState } from 'react'
import { Text, View } from 'react-native'

import { ProfileButton } from '@/components/profile/profile-button'
import { useTournaments } from '@/contexts/TournamentContext'
import { useAppTheme } from '@/hooks/use-theme'

import { styles } from './notice.styles'

export function PendingInvitations({ user }: { user: AppUser }) {
  const { colors } = useAppTheme()
  const { reload, activeTournament, setActiveTournament } = useTournaments()
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [respondingId, setRespondingId] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const loadInvitations = useCallback(async () => {
    try {
      setInvitations(await getMyInvitations(user.email))
    } catch {
      setErrorMessage('No se pudieron cargar tus invitaciones.')
    }
  }, [user.email])

  useEffect(() => {
    void loadInvitations()
  }, [loadInvitations])

  const respond = async (invitation: Invitation, action: 'accept' | 'reject') => {
    setRespondingId(invitation.id)
    setErrorMessage(null)
    try {
      if (action === 'accept') {
        await acceptInvitation(invitation.id, user)
        if (!activeTournament) setActiveTournament(invitation.tournamentId)
        await reload()
      } else {
        await rejectInvitation(invitation.id, user.email)
      }
      await loadInvitations()
    } catch (error) {
      setErrorMessage(
        error instanceof InvitationError ? error.message : 'No se pudo responder la invitación. Intentá de nuevo.',
      )
    } finally {
      setRespondingId(null)
    }
  }

  if (invitations.length === 0 && !errorMessage) return null

  return (
    <View style={styles.section} accessibilityLiveRegion="polite">
      <View style={styles.titleRow}>
        <Feather name="mail" size={18} color={colors.primaryText} accessible={false} />
        <Text style={[styles.title, { color: colors.text }]} accessibilityRole="header">
          Invitaciones pendientes
        </Text>
      </View>
      {invitations.map((invitation) => (
        <View
          key={invitation.id}
          style={[styles.card, { backgroundColor: colors.primarySoft, borderColor: colors.primaryRing }]}
        >
          <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={2}>
            {invitation.tournamentName}
          </Text>
          <Text style={[styles.text, { color: colors.muted }]}>
            Te invitaron como {TOURNAMENT_ROLE_LABELS[invitation.role].toLowerCase()}
          </Text>
          <View style={styles.actions}>
            <ProfileButton
              label="Rechazar"
              variant="secondary"
              onPress={() => void respond(invitation, 'reject')}
              disabled={respondingId !== null}
            />
            <ProfileButton
              label={respondingId === invitation.id ? 'Aceptando...' : 'Aceptar'}
              onPress={() => void respond(invitation, 'accept')}
              disabled={respondingId !== null}
            />
          </View>
        </View>
      ))}
      {errorMessage && <Text style={[styles.text, { color: colors.danger }]}>{errorMessage}</Text>}
    </View>
  )
}
