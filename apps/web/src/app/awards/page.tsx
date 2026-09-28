import '@/lib/firebase'
import { getPlayersServer, getMatchesServer } from '@fulbito/firebase'
import { AwardsClient } from './awardsClient'

export const dynamic = 'force-dynamic'

export default async function AwardsPage() {
  const [players, matches] = await Promise.all([getPlayersServer(), getMatchesServer()])
  return <AwardsClient players={players} matches={matches} />
}
