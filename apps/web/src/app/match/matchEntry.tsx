'use client'

import { isPersonalTournament } from '@fulbito/utils'
import { selectActiveTournament, useTournamentStore } from '@/store/useTournamentStore'
import PersonalMatchForm from '@/components/personal/PersonalMatchForm'
import MatchClient from './matchClient'

export default function MatchEntry() {
  const isPersonal = isPersonalTournament(useTournamentStore(selectActiveTournament)?.tournament)
  return isPersonal ? <PersonalMatchForm /> : <MatchClient players={[]} />
}
