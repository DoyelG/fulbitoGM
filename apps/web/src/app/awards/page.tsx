'use client'

import { usePlayerStore } from '@/store/usePlayerStore'
import { useMatchStore } from '@/store/useMatchStore'
import Loading from '@/app/loading'
import { AwardsClient } from './awardsClient'

export default function AwardsPage() {
  const { players, playersInit } = usePlayerStore()
  const { matches, matchesInit } = useMatchStore()

  if (playersInit !== 'loaded' || matchesInit !== 'loaded') return <Loading />
  return <AwardsClient players={players} matches={matches} />
}
