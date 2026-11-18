import type { Player } from '@fulbito/types'
import { OPEN_MATCH_WAITLIST_SIZE, openMatchLockMessage } from '@fulbito/utils'
import { useMemo, useState } from 'react'
import { Text, View } from 'react-native'

import type { OpenMatchController } from '@/hooks/use-open-match'
import { useAppTheme } from '@/hooks/use-theme'

import { OpenMatchAddPlayerSheet } from './open-match-add-player-sheet'
import { OpenMatchSignupButton } from './open-match-signup-button'
import { OpenMatchSlot } from './open-match-slot'
import { OpenMatchTypePicker } from './open-match-type-picker'
import { styles } from './open-match-signups.styles'

type Props = {
  controller: OpenMatchController
  playerById: Map<string, Player>
  canManage: boolean
}

function fill(ids: string[], size: number): (string | null)[] {
  return Array.from({ length: size }, (_, index) => ids[index] ?? null)
}

export function OpenMatchSignups({ controller, playerById, canManage }: Props) {
  const { colors } = useAppTheme()
  const [picking, setPicking] = useState(false)
  const { state, myPlayerId, pending, error, join, addPlayer, removePlayer } = controller

  const candidates = useMemo(() => {
    const taken = new Set([...(state?.confirmed ?? []), ...(state?.waitlist ?? [])])
    return [...playerById.values()]
      .filter((player) => !player.inactive && !taken.has(player.id))
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [playerById, state])

  if (!state) return null

  const canFill = canManage ? !state.isFull && candidates.length > 0 : state.canJoin
  const fillAction = canManage ? () => setPicking(true) : () => void join()
  const fillLabel = canManage ? 'Agregar jugador' : 'Inscribirme'
  const message = myPlayerId
    ? (error ?? openMatchLockMessage(state.lockReason))
    : 'Para inscribirte tenés que tener un jugador vinculado en este torneo.'
  const nameOf = (playerId: string) => playerById.get(playerId)?.name ?? 'Jugador'
  const renderSlots = (ids: (string | null)[], fillable: boolean) =>
    ids.map((playerId, index) => (
      <OpenMatchSlot
        key={playerId ?? `empty-${index}`}
        position={index + 1}
        name={playerId ? nameOf(playerId) : null}
        isMe={playerId !== null && playerId === myPlayerId}
        onSelect={fillable ? fillAction : null}
        selectLabel={fillLabel}
        onRemove={canManage && playerId ? () => void removePlayer(playerId) : null}
        disabled={pending}
      />
    ))

  return (
    <View style={[styles.card, { borderColor: colors.border, backgroundColor: colors.surface }]}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={[styles.summary, { color: colors.subtleText }]} accessibilityLiveRegion="polite">
            <Text style={[styles.summaryStrong, { color: colors.text }]}>
              {state.confirmed.length}/{state.capacity}
            </Text>{' '}
            confirmados · {state.waitlist.length}/{OPEN_MATCH_WAITLIST_SIZE} en lista de espera
          </Text>
          {message && (
            <Text style={[styles.message, { color: colors.danger }]} accessibilityLiveRegion="polite">
              {message}
            </Text>
          )}
        </View>
        <View style={styles.headerActions}>
          <OpenMatchSignupButton controller={controller} tone="light" showHint={false} />
          {canManage && <OpenMatchTypePicker controller={controller} />}
        </View>
      </View>

      <View style={styles.list} accessibilityLabel="Jugadores confirmados">
        {renderSlots(fill(state.confirmed, state.capacity), canFill && state.spotsLeft > 0)}
      </View>

      <Text style={[styles.sectionTitle, { color: colors.text }]} accessibilityRole="header">
        Lista de espera
      </Text>
      <Text style={[styles.sectionHint, { color: colors.muted }]}>
        Si alguien se baja, el primero de la lista entra automáticamente.
      </Text>
      <View style={styles.list} accessibilityLabel="Lista de espera">
        {renderSlots(fill(state.waitlist, OPEN_MATCH_WAITLIST_SIZE), canFill && state.spotsLeft === 0)}
      </View>

      {canManage && (
        <OpenMatchAddPlayerSheet
          visible={picking}
          title={state.spotsLeft > 0 ? 'Agregar jugador' : 'Agregar a la lista de espera'}
          candidates={candidates}
          myPlayerId={myPlayerId}
          onClose={() => setPicking(false)}
          onPick={(playerId) => {
            setPicking(false)
            void addPlayer(playerId)
          }}
        />
      )}
    </View>
  )
}
