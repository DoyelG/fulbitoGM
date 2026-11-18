'use client'

import { useMemo, useState } from 'react'
import type { Player } from '@fulbito/types'
import { OPEN_MATCH_WAITLIST_SIZE } from '@fulbito/utils'
import type { OpenMatchController } from '@/hooks/use-open-match'
import OpenMatchSlot from './OpenMatchSlot'
import OpenMatchAddPlayerModal from './OpenMatchAddPlayerModal'

type Props = {
  controller: OpenMatchController
  playerById: Map<string, Player>
  canManage: boolean
}

function fill(ids: string[], size: number): (string | null)[] {
  return Array.from({ length: size }, (_, index) => ids[index] ?? null)
}

export default function OpenMatchSignups({ controller, playerById, canManage }: Props) {
  const { state, myPlayerId, pending, join, addPlayer, removePlayer } = controller
  const [picking, setPicking] = useState(false)

  const candidates = useMemo(() => {
    const taken = new Set([...(state?.confirmed ?? []), ...(state?.waitlist ?? [])])
    return [...playerById.values()]
      .filter((player) => !player.inactive && !taken.has(player.id))
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [playerById, state])

  if (!state) return null

  const canFill = canManage ? !state.isFull && candidates.length > 0 : state.canJoin
  const fillAction = canManage ? () => setPicking(true) : join
  const fillLabel = canManage ? 'Agregar jugador' : 'Inscribirme'
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
        onRemove={canManage && playerId ? () => removePlayer(playerId) : null}
        disabled={pending}
      />
    ))

  return (
    <div className="flex flex-col gap-5" aria-busy={pending}>
      <ol aria-label="Jugadores confirmados" className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {renderSlots(fill(state.confirmed, state.capacity), canFill && state.spotsLeft > 0)}
      </ol>

      <section aria-labelledby="open-match-waitlist-title">
        <h3 id="open-match-waitlist-title" className="mb-2 text-sm font-semibold text-gray-900">
          Lista de espera
        </h3>
        <p className="mb-2 text-xs text-gray-600">Si alguien se baja, el primero de la lista entra automáticamente.</p>
        <ol aria-label="Lista de espera" className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {renderSlots(fill(state.waitlist, OPEN_MATCH_WAITLIST_SIZE), canFill && state.spotsLeft === 0)}
        </ol>
      </section>

      {canManage && (
        <OpenMatchAddPlayerModal
          open={picking}
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
    </div>
  )
}
