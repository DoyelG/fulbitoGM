import { getPlayers } from '@fulbito/firebase'
import type { Player, TournamentComment } from '@fulbito/types'
import { buildMentionCandidates, isPersonalTournament, isTournamentAdminRole } from '@fulbito/utils'
import { useMemo, useRef, useState, type ComponentRef } from 'react'
import { FlatList, KeyboardAvoidingView, Platform, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { CommentComposer } from '@/components/match-detail/comment-composer'
import { styles } from '@/components/messages/messages-screen.styles'
import { MessagesThread } from '@/components/messages/messages-thread'
import { TournamentPicker } from '@/components/messages/tournament-picker'
import EmptyState from '@/components/ui/empty-state/empty-state'
import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext'
import { useTournaments } from '@/contexts/TournamentContext'
import { useUnreadComments } from '@/contexts/UnreadCommentsContext'
import { useCommentsUnreadSince } from '@/hooks/use-comments-unread-since'
import { useAppTheme } from '@/hooks/use-theme'
import { useTournamentComments } from '@/hooks/use-tournament-comments'
import { useTournamentMembers } from '@/hooks/use-tournament-members'
import { useTournamentResource } from '@/hooks/use-tournament-resource'

const NO_PLAYERS: Player[] = []

export default function MessagesScreen() {
  const { colors } = useAppTheme()
  const { user } = useFirebaseAuth()
  const { myTournaments: allTournaments, activeTournament: currentTournament } = useTournaments()
  const myTournaments = useMemo(
    () => allTournaments.filter(({ tournament }) => !isPersonalTournament(tournament)),
    [allTournaments],
  )
  const activeTournament = isPersonalTournament(currentTournament?.tournament) ? null : currentTournament
  const { unreadByTournament, markSeen } = useUnreadComments()
  const [chosenId, setChosenId] = useState<string | null>(null)
  const rootRef = useRef<ComponentRef<typeof View>>(null)
  const [keyboardOffset, setKeyboardOffset] = useState(0)
  const threadRef = useRef<FlatList<TournamentComment>>(null)

  const selected =
    myTournaments.find(({ tournament }) => tournament.id === chosenId) ?? activeTournament ?? myTournaments[0] ?? null
  const tournamentId = selected?.tournament.id ?? null

  const comments = useTournamentComments(tournamentId)
  const members = useTournamentMembers(tournamentId)
  const { data: players } = useTournamentResource(tournamentId, getPlayers, NO_PLAYERS, 'Error al cargar los jugadores')
  const unreadSince = useCommentsUnreadSince(selected, comments.status === 'loaded')

  const photoByUid = useMemo(() => {
    const photoByPlayerId = new Map(players.map((player) => [player.id, player.photoUrl]))
    const photos = new Map<string, string>()
    for (const member of members) {
      const photoUrl = member.playerId ? photoByPlayerId.get(member.playerId) : undefined
      if (photoUrl) photos.set(member.uid, photoUrl)
    }
    return photos
  }, [members, players])
  const mentionCandidates = useMemo(() => buildMentionCandidates(players, members), [players, members])

  if (!user || !selected || !tournamentId) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={[]}>
        <View style={styles.empty}>
          <EmptyState
            icon="message-circle"
            title="Sin mensajes"
            description="Cuando te sumes a un torneo vas a ver sus mensajes acá."
            action={{ label: 'Ver torneos', href: '/tournaments' }}
          />
        </View>
      </SafeAreaView>
    )
  }

  const linkedPlayerId = selected.membership.playerId
  const linkedName = linkedPlayerId ? players.find((player) => player.id === linkedPlayerId)?.name : undefined
  const authorName = linkedName || user.email.split('@')[0]

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={[]}>
      <View
        ref={rootRef}
        style={styles.flex}
        onLayout={() => rootRef.current?.measureInWindow((_x, y) => setKeyboardOffset(y))}
      >
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={keyboardOffset}
        >
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]} accessibilityRole="header">
              Mensajes
            </Text>
            <TournamentPicker
              tournaments={myTournaments}
              selectedId={tournamentId}
              unreadByTournament={unreadByTournament}
              onSelect={setChosenId}
            />
          </View>
          <MessagesThread
            key={tournamentId}
            ref={threadRef}
            state={comments}
            photoByUid={photoByUid}
            mentionCandidates={mentionCandidates}
            canModerate={isTournamentAdminRole(selected.membership.role)}
            unreadSince={unreadSince}
            currentUid={user.uid}
          />
          <View style={[styles.composerBar, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
            <CommentComposer
              key={tournamentId}
              variant="bar"
              mentionCandidates={mentionCandidates}
              onSubmit={async (text) => {
                await comments.addComment(text, { uid: user.uid, name: authorName })
                markSeen(tournamentId)
                threadRef.current?.scrollToOffset({ offset: 0, animated: true })
              }}
            />
          </View>
        </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  )
}
