import { getPlayersByIds } from '@fulbito/firebase'
import type { MyTournament } from '@fulbito/types'
import { useEffect, useState } from 'react'

export function useLinkedPlayerNames(myTournaments: MyTournament[]): Map<string, string> {
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
