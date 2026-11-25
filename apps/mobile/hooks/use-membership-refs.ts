import type { MembershipRef } from '@fulbito/types'
import { toMembershipRefs } from '@fulbito/utils'
import { useState } from 'react'

import { useTournaments } from '@/contexts/TournamentContext'

export function useMembershipRefs(): MembershipRef[] {
  const { myTournaments } = useTournaments()
  const refs = toMembershipRefs(myTournaments)
  const key = JSON.stringify(refs)
  const [cached, setCached] = useState({ key, refs })
  if (cached.key !== key) setCached({ key, refs })
  return cached.refs
}
