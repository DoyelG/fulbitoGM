'use client'

import { useState } from 'react'
import type { MembershipRef, MyTournament } from '@fulbito/types'
import { toMembershipRefs } from '@fulbito/utils'

export function useMembershipRefs(myTournaments: MyTournament[]): MembershipRef[] {
  const refs = toMembershipRefs(myTournaments)
  const key = JSON.stringify(refs)
  const [cached, setCached] = useState({ key, refs })
  if (cached.key !== key) setCached({ key, refs })
  return cached.refs
}
