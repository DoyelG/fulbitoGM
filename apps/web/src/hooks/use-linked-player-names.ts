'use client'

import { useEffect, useState } from 'react'
import type { MyTournament } from '@fulbito/types'
import { getPlayersByIds } from '@fulbito/firebase'

export function useLinkedPlayerNames(myTournaments: MyTournament[]): Map<string, string> {
  const [playerNameById, setPlayerNameById] = useState<Map<string, string>>(new Map())

  const linkedPlayerIdsKey = myTournaments
    .flatMap(({ membership }) => (membership.playerId ? [membership.playerId] : []))
    .join(',')

  useEffect(() => {
    if (!linkedPlayerIdsKey) return
    let isCurrent = true
    getPlayersByIds(linkedPlayerIdsKey.split(',')).then((linkedPlayers) => {
      if (isCurrent) setPlayerNameById(new Map(linkedPlayers.map((player) => [player.id, player.name])))
    })
    return () => {
      isCurrent = false
    }
  }, [linkedPlayerIdsKey])

  return playerNameById
}
