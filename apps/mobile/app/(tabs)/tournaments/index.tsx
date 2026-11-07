import { getDraftMatches, getPlayersByIds } from '@fulbito/firebase'
import type { MyTournament } from '@fulbito/types'
import { pickNextMatch, toLocalDay } from '@fulbito/utils'
import { useRouter } from 'expo-router'
import { useEffect, useState } from 'react'
import { ActivityIndicator, Alert, RefreshControl, ScrollView, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { ProfileButton } from '@/components/profile/profile-button'
import { ThemedView } from '@/components/themed-view'
import { LinkMyPlayerSheet } from '@/components/tournaments/link-my-player-sheet'
import { PendingInvitations } from '@/components/tournaments/pending-invitations'
import { TournamentCard, type NextMatchSummary } from '@/components/tournaments/tournament-card'
import { TournamentFormSheet } from '@/components/tournaments/tournament-form-sheet'
import { styles } from '@/components/tournaments/tournaments-screen.styles'
import { VerifyEmailNotice } from '@/components/tournaments/verify-email-notice'
import EmptyState from '@/components/ui/empty-state/empty-state'
import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext'
import { useTournaments, type TournamentInput } from '@/contexts/TournamentContext'
import { useAppTheme } from '@/hooks/use-theme'

function useLinkedPlayerNames(myTournaments: MyTournament[]): Map<string, string> {
  const [names, setNames] = useState<Map<string, string>>(new Map())
  const playerIdsKey = myTournaments
    .flatMap(({ membership }) => (membership.playerId ? [membership.playerId] : []))
    .join(',')

  useEffect(() => {
    if (!playerIdsKey) return
    let isCurrent = true
    getPlayersByIds(playerIdsKey.split(',')).then((players) => {
      if (isCurrent) setNames(new Map(players.map((player) => [player.id, player.name])))
    })
    return () => {
      isCurrent = false
    }
  }, [playerIdsKey])

  return names
}

function useNextMatches(myTournaments: MyTournament[], reloadKey: number): Map<string, NextMatchSummary> {
  const [nextMatches, setNextMatches] = useState<Map<string, NextMatchSummary>>(new Map())
  const tournamentIdsKey = myTournaments.map(({ tournament }) => tournament.id).join(',')

  useEffect(() => {
    if (!tournamentIdsKey) return
    let isCurrent = true
    const today = toLocalDay(new Date())
    const tournamentIds = tournamentIdsKey.split(',')
    Promise.allSettled(tournamentIds.map((tournamentId) => getDraftMatches(tournamentId))).then((results) => {
      if (!isCurrent) return
      const entries = results.flatMap((result, index) => {
        const next = result.status === 'fulfilled' ? pickNextMatch(result.value, today) : null
        return next ? [[tournamentIds[index], next] as const] : []
      })
      setNextMatches(new Map(entries))
    })
    return () => {
      isCurrent = false
    }
  }, [tournamentIdsKey, reloadKey])

  return nextMatches
}

export default function TournamentsScreen() {
  const router = useRouter()
  const { colors } = useAppTheme()
  const { user } = useFirebaseAuth()
  const {
    myTournaments,
    status,
    activeTournament,
    reload,
    setActiveTournament,
    createTournament,
    editTournament,
    deleteTournament,
    leaveTournament,
  } = useTournaments()
  const playerNames = useLinkedPlayerNames(myTournaments)
  const [nextMatchesReloadKey, setNextMatchesReloadKey] = useState(0)
  const nextMatches = useNextMatches(myTournaments, nextMatchesReloadKey)
  const [isCreating, setIsCreating] = useState(false)
  const [editing, setEditing] = useState<MyTournament | null>(null)
  const [linking, setLinking] = useState<MyTournament | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  if (!user) return null

  const activeTournamentId = activeTournament?.tournament.id ?? null

  const handleRefresh = async () => {
    setRefreshing(true)
    setNextMatchesReloadKey((key) => key + 1)
    await reload()
    setRefreshing(false)
  }

  const handleOpen = (item: MyTournament) => {
    setActiveTournament(item.tournament.id)
    router.navigate('/home')
  }

  const handleOpenMatch = (item: MyTournament, matchId: string) => {
    if (item.tournament.id !== activeTournamentId) setActiveTournament(item.tournament.id)
    router.push({ pathname: '/(tabs)/history/[id]', params: { id: matchId } })
  }

  const handleMembers = (item: MyTournament) => {
    router.push({ pathname: '/tournaments/[id]/members', params: { id: item.tournament.id } })
  }

  const handleLinkPlayer = (item: MyTournament) => {
    if (item.tournament.id !== activeTournamentId) setActiveTournament(item.tournament.id)
    setLinking(item)
  }

  const handleCreate = async (input: TournamentInput) => {
    const { photoSaved } = await createTournament(input)
    setIsCreating(false)
    if (!photoSaved) {
      Alert.alert('Torneo creado', 'No se pudo subir la imagen. Podés agregarla editando el torneo.')
    }
  }

  const handleEdit = async (input: TournamentInput) => {
    if (!editing) return
    await editTournament(editing.tournament.id, input)
    setEditing(null)
  }

  const confirmAction = (title: string, message: string, confirmLabel: string, action: () => Promise<void>) => {
    Alert.alert(title, message, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: confirmLabel,
        style: 'destructive',
        onPress: () => {
          action().catch(() =>
            Alert.alert('Error', `No se pudo ${confirmLabel.toLowerCase()} el torneo. Intentá de nuevo.`),
          )
        },
      },
    ])
  }

  const handleDelete = (item: MyTournament) =>
    confirmAction(
      'Eliminar torneo',
      `¿Seguro que querés eliminar ${item.tournament.name}? Nadie va a poder verlo ni editarlo, incluido vos.`,
      'Eliminar',
      () => deleteTournament(item.tournament.id),
    )

  const handleLeave = (item: MyTournament) =>
    confirmAction(
      'Abandonar torneo',
      `¿Seguro que querés abandonar ${item.tournament.name}? Vas a dejar de verlo y para volver te tienen que invitar de nuevo.`,
      'Abandonar',
      () => leaveTournament(item.tournament.id),
    )

  return (
    <SafeAreaView style={styles.safe} edges={[]}>
      <ThemedView style={styles.safe}>
        <ScrollView
          contentContainerStyle={styles.content}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void handleRefresh()} />}
        >
          {user.emailVerified ? (
            <>
              <View style={styles.createRow}>
                <ProfileButton label="Crear torneo" onPress={() => setIsCreating(true)} />
              </View>

              <PendingInvitations key={user.uid} user={user} />

              {status === 'loading' && (
                <ActivityIndicator
                  color={colors.primaryText}
                  accessibilityLabel="Cargando torneos"
                  style={styles.loading}
                />
              )}

              {status === 'error' && (
                <View style={[styles.errorCard, { backgroundColor: colors.dangerBg }]} accessibilityLiveRegion="polite">
                  <Text style={[styles.errorText, { color: colors.danger }]}>No se pudieron cargar tus torneos.</Text>
                  <ProfileButton label="Reintentar" variant="secondary" onPress={() => void reload()} />
                </View>
              )}

              {status === 'loaded' && myTournaments.length === 0 && (
                <EmptyState
                  icon="award"
                  title="Todavía no tenés torneos"
                  description="Creá un torneo para organizar a tus jugadores, partidos y estadísticas, o esperá a que te inviten a uno."
                  action={{ label: 'Crear torneo', onPress: () => setIsCreating(true) }}
                />
              )}

              {status === 'loaded' &&
                myTournaments.map((item) => (
                  <TournamentCard
                    key={item.tournament.id}
                    item={item}
                    active={item.tournament.id === activeTournamentId}
                    playerName={item.membership.playerId ? (playerNames.get(item.membership.playerId) ?? null) : null}
                    nextMatch={nextMatches.get(item.tournament.id) ?? null}
                    onOpen={handleOpen}
                    onOpenMatch={handleOpenMatch}
                    onLinkPlayer={handleLinkPlayer}
                    onMembers={handleMembers}
                    onEdit={setEditing}
                    onDelete={handleDelete}
                    onLeave={handleLeave}
                  />
                ))}
            </>
          ) : (
            <VerifyEmailNotice email={user.email} />
          )}
        </ScrollView>
      </ThemedView>

      {isCreating && (
        <TournamentFormSheet
          title="Crear torneo"
          submitLabel="Crear torneo"
          errorMessage="No se pudo crear el torneo. Intentá de nuevo."
          onSubmit={handleCreate}
          onClose={() => setIsCreating(false)}
        />
      )}
      {editing && (
        <TournamentFormSheet
          key={editing.tournament.id}
          title="Editar torneo"
          initial={{ name: editing.tournament.name, description: editing.tournament.description }}
          initialPhotoUrl={editing.tournament.photoUrl}
          submitLabel="Guardar cambios"
          errorMessage="No se pudo guardar el torneo. Intentá de nuevo."
          onSubmit={handleEdit}
          onClose={() => setEditing(null)}
        />
      )}
      {linking && (
        <LinkMyPlayerSheet key={linking.tournament.id} user={user} item={linking} onClose={() => setLinking(null)} />
      )}
    </SafeAreaView>
  )
}
