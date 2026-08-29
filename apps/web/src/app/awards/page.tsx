import '@/lib/firebase'
import { getPlayers, getMatches } from '@fulbito/firebase'
import { AwardsClient } from './awardsClient'

export default async function AwardsPage() {
  const [players, matches] = await Promise.all([getPlayers(), getMatches()])
  return <AwardsClient players={players} matches={matches} />
}
