import { isPersonalTournament } from '@fulbito/utils'
import { NewMatch } from '@/components/match/newMatch'
import { PersonalMatchForm } from '@/components/personal/personal-match-form'
import { useTournaments } from '@/contexts/TournamentContext'

export default function MatchScreen() {
  const { activeTournament } = useTournaments()
  return isPersonalTournament(activeTournament?.tournament) ? <PersonalMatchForm /> : <NewMatch />
}
