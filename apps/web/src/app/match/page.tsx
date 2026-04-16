export const dynamic = 'force-dynamic'

import { shapeStorePlayers } from '@/lib/shape'
import { getBackendBaseUrl } from '@/lib/backend'
import MatchClient from './matchClient'

export default async function MatchPage() {
  const res = await fetch(`${getBackendBaseUrl()}/api/players`, { cache: 'no-store' })
  const players = await res.json()
  const shaped = shapeStorePlayers(players)
  return <MatchClient players={shaped} />
}