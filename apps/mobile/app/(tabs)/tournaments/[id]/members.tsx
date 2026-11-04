import Feather from '@expo/vector-icons/Feather'
import type { InvitationRole, TournamentMember } from '@fulbito/types'
import { getAssignablePlayers } from '@fulbito/utils'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useMemo, useState } from 'react'
import { ActivityIndicator, Alert, RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { ProfileButton } from '@/components/profile/profile-button'
import { ThemedView } from '@/components/themed-view'
import { AssignPlayerSheet } from '@/components/tournaments/assign-player-sheet'
import { ChangeRoleSheet } from '@/components/tournaments/change-role-sheet'
import { InvitationsSection } from '@/components/tournaments/invitations-section'
import { InviteMemberSheet } from '@/components/tournaments/invite-member-sheet'
import { MemberRow } from '@/components/tournaments/member-row'
import { styles } from '@/components/tournaments/members-screen.styles'
import EmptyState from '@/components/ui/empty-state/empty-state'
import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext'
import { useTournaments } from '@/contexts/TournamentContext'
import { useTournamentMembersData, type InvitationInput } from '@/hooks/use-tournament-members-data'
import { useAppTheme } from '@/hooks/use-theme'

export default function MembersScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { myTournaments, status: tournamentsStatus } = useTournaments()
  const item = myTournaments.find(({ tournament }) => tournament.id === id) ?? null

  if (tournamentsStatus === 'loading') return null
  if (!item) {
    return (
      <ThemedView style={styles.safe}>
        <EmptyState
          icon="award"
          title="No encontramos este torneo"
          description="Puede que lo hayan eliminado o que no seas miembro."
          action={{ label: 'Ver mis torneos', href: '/tournaments' }}
        />
      </ThemedView>
    )
  }

  return <MembersContent key={item.tournament.id} tournamentId={item.tournament.id} />
}

function MembersContent({ tournamentId }: { tournamentId: string }) {
  const router = useRouter()
  const { colors } = useAppTheme()
  const { user, isAdmin } = useFirebaseAuth()
  const { myTournaments, reload: reloadTournaments } = useTournaments()
  const item = myTournaments.find(({ tournament }) => tournament.id === tournamentId)
  const role = item?.membership.role ?? 'MEMBER'
  const canManage = isAdmin || role !== 'MEMBER'
  const data = useTournamentMembersData(tournamentId, canManage)
  const [assigning, setAssigning] = useState<TournamentMember | null>(null)
  const [changingRole, setChangingRole] = useState<TournamentMember | null>(null)
  const [isInviting, setIsInviting] = useState(false)
  const [invitedEmail, setInvitedEmail] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  const { members, players, invitations } = data
  const playerNameById = useMemo(() => new Map(players.map((player) => [player.id, player.name])), [players])
  const invitablePlayers = useMemo(() => {
    const linkedPlayerIds = new Set(members.map((member) => member.playerId))
    const invitedPlayerIds = new Set(invitations.map((invitation) => invitation.playerId))
    return players
      .filter((player) => !player.inactive && !linkedPlayerIds.has(player.id) && !invitedPlayerIds.has(player.id))
      .sort((a, b) => a.name.localeCompare(b.name, 'es'))
  }, [members, players, invitations])

  if (!user || !item) return null

  const isLoaded = data.status === 'loaded'

  const handleRefresh = async () => {
    setRefreshing(true)
    await data.reload()
    setRefreshing(false)
  }

  const handleAssign = async (playerId: string | null) => {
    if (!assigning) return
    await data.assignPlayer(assigning.uid, playerId)
    if (assigning.uid === user.uid) await reloadTournaments()
    setAssigning(null)
  }

  const handleChangeRole = async (nextRole: InvitationRole) => {
    if (!changingRole) return
    await data.changeRole(changingRole.uid, nextRole)
    setChangingRole(null)
  }

  const handleInvite = async (input: InvitationInput) => {
    await data.invite(input, user.uid)
    setIsInviting(false)
    setInvitedEmail(input.email.trim().toLowerCase())
  }

  const handleRemove = (member: TournamentMember) => {
    Alert.alert(
      'Eliminar miembro',
      `¿Seguro que querés eliminar a ${member.email} del torneo? Va a perder el acceso, pero su jugador y sus estadísticas se mantienen.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            data
              .remove(member.uid, user.uid)
              .catch(() => Alert.alert('Error', 'No se pudo eliminar al miembro. Intentá de nuevo.'))
          },
        },
      ],
    )
  }

  return (
    <SafeAreaView style={styles.safe} edges={[]}>
      <ThemedView style={styles.safe}>
        <ScrollView
          contentContainerStyle={styles.content}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void handleRefresh()} />}
        >
          <View style={styles.topRow}>
            <TouchableOpacity
              onPress={() => (router.canGoBack() ? router.back() : router.replace('/tournaments'))}
              accessibilityRole="button"
              accessibilityLabel="Volver a mis torneos"
              style={styles.back}
            >
              <Feather name="arrow-left" size={18} color={colors.primaryText} accessible={false} />
              <Text style={[styles.backText, { color: colors.primaryText }]}>Mis torneos</Text>
            </TouchableOpacity>
            {canManage && (
              <ProfileButton label="Agregar miembro" onPress={() => setIsInviting(true)} disabled={!isLoaded} />
            )}
          </View>

          {invitedEmail && (
            <View style={[styles.notice, { backgroundColor: colors.primarySoft }]} accessibilityLiveRegion="polite">
              <Text style={[styles.noticeText, { color: colors.text }]}>
                Invitamos a <Text style={styles.noticeStrong}>{invitedEmail}</Text>. Va a aparecer en la lista cuando
                acepte la invitación.
              </Text>
            </View>
          )}

          {data.status === 'loading' && (
            <ActivityIndicator
              color={colors.primaryText}
              accessibilityLabel="Cargando miembros"
              style={styles.loading}
            />
          )}

          {data.status === 'error' && (
            <View style={[styles.notice, { backgroundColor: colors.dangerBg }]} accessibilityLiveRegion="polite">
              <Text style={[styles.noticeText, { color: colors.danger }]}>
                No se pudieron cargar los miembros del torneo.
              </Text>
            </View>
          )}

          {isLoaded &&
            members.map((member) => (
              <MemberRow
                key={member.uid}
                member={member}
                currentUid={user.uid}
                currentRole={role}
                canManage={canManage}
                playerName={member.playerId ? (playerNameById.get(member.playerId) ?? null) : null}
                onAssignPlayer={setAssigning}
                onChangeRole={setChangingRole}
                onRemove={handleRemove}
              />
            ))}

          {isLoaded && canManage && (
            <InvitationsSection invitations={invitations} playerNameById={playerNameById} onRevoke={data.revoke} />
          )}
        </ScrollView>
      </ThemedView>

      {assigning && (
        <AssignPlayerSheet
          key={assigning.uid}
          title="Cambiar jugador"
          description={`Elegí el jugador de ${assigning.email} en este torneo.`}
          players={getAssignablePlayers(players, members, assigning)}
          currentPlayerId={assigning.playerId}
          onSubmit={handleAssign}
          onClose={() => setAssigning(null)}
        />
      )}
      {changingRole && (
        <ChangeRoleSheet
          key={changingRole.uid}
          member={changingRole}
          onSubmit={handleChangeRole}
          onClose={() => setChangingRole(null)}
        />
      )}
      {isInviting && (
        <InviteMemberSheet
          availablePlayers={invitablePlayers}
          onSubmit={handleInvite}
          onClose={() => setIsInviting(false)}
        />
      )}
    </SafeAreaView>
  )
}
