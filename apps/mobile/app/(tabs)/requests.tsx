import { getPlayers, resolveTournamentPlayerRequest, TournamentPlayerRequestError } from '@fulbito/firebase'
import { useEffect, useMemo, useState } from 'react'
import { FlatList, Text } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { PlayerRequestCard } from '@/components/requests/player-request-card'
import { RequestsHeader } from '@/components/requests/requests-header'
import { styles } from '@/components/requests/requests-screen.styles'
import { ThemedView } from '@/components/themed-view'
import EmptyState from '@/components/ui/empty-state/empty-state'
import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext'
import { useTournaments } from '@/contexts/TournamentContext'
import { usePendingPlayerRequests } from '@/hooks/use-pending-player-requests'
import { useAppTheme } from '@/hooks/use-theme'

export default function RequestsScreen() {
  const { user } = useFirebaseAuth()
  const { colors } = useAppTheme()
  const { activeTournament, reload: reloadTournaments } = useTournaments()
  const { reload, requests, error: loadError } = usePendingPlayerRequests()
  const [playerNameById, setPlayerNameById] = useState<Map<string, string>>(new Map())
  const [resolvingUid, setResolvingUid] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const tournamentId = activeTournament?.tournament.id ?? null
  const requestsKey = useMemo(() => requests.map((request) => request.uid).join(','), [requests])

  useEffect(() => {
    if (!tournamentId) return
    let isCurrent = true
    getPlayers(tournamentId)
      .then((players) => {
        if (isCurrent) setPlayerNameById(new Map(players.map((player) => [player.id, player.name])))
      })
      .catch(() => undefined)
    return () => {
      isCurrent = false
    }
  }, [tournamentId, requestsKey])

  const resolve = async (uid: string, action: 'accepted' | 'rejected') => {
    if (!user || !tournamentId) return
    setResolvingUid(uid)
    setErrorMessage(null)
    try {
      await resolveTournamentPlayerRequest(tournamentId, uid, action, user.uid)
      if (uid === user.uid) await reloadTournaments()
    } catch (error) {
      setErrorMessage(
        error instanceof TournamentPlayerRequestError
          ? error.message
          : 'No se pudo resolver la solicitud. Probá de nuevo más tarde.',
      )
    } finally {
      await reload()
      setResolvingUid(null)
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={[]}>
      <ThemedView style={styles.screen}>
        {(errorMessage ?? loadError) && (
          <Text style={[styles.error, { color: colors.danger }]} accessibilityLiveRegion="polite">
            {errorMessage ?? loadError}
          </Text>
        )}
        <FlatList
          data={requests}
          ListHeaderComponent={
            <RequestsHeader pendingCount={requests.length} tournamentName={activeTournament?.tournament.name} />
          }
          keyExtractor={(item) => item.uid}
          contentContainerStyle={requests.length === 0 ? styles.emptyList : styles.list}
          ListEmptyComponent={
            loadError ? undefined : (
              <EmptyState
                icon="inbox"
                title="No hay solicitudes"
                description="Cuando un miembro pida vincularse con un jugador, la vas a ver acá."
              />
            )
          }
          renderItem={({ item, index }) => (
            <PlayerRequestCard
              request={item}
              playerName={item.playerId ? (playerNameById.get(item.playerId) ?? 'Jugador desconocido') : null}
              index={index}
              disabled={resolvingUid !== null}
              onAccept={() => void resolve(item.uid, 'accepted')}
              onReject={() => void resolve(item.uid, 'rejected')}
            />
          )}
        />
      </ThemedView>
    </SafeAreaView>
  )
}
