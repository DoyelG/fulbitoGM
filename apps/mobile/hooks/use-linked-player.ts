import { getPlayer } from '@fulbito/firebase'
import type { Player } from '@fulbito/types'
import { useEffect, useState } from 'react'

export function useLinkedPlayer(linkedPlayerId?: string): Player | null {
  const [player, setPlayer] = useState<Player | null>(null)

  useEffect(() => {
    if (!linkedPlayerId) {
      setPlayer(null)
      return
    }
    getPlayer(linkedPlayerId)
      .then(setPlayer)
      .catch(() => setPlayer(null))
  }, [linkedPlayerId])

  return player
}
