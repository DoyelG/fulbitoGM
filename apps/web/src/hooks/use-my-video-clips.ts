'use client'

import { useEffect, useState } from 'react'
import type { MyTournament, VideoClip } from '@fulbito/types'
import { getMyVideoClips } from '@fulbito/firebase'
import { useMembershipRefs } from './use-membership-refs'

const NO_CLIPS: VideoClip[] = []

export function useMyVideoClips(myTournaments: MyTournament[], enabled: boolean): VideoClip[] {
  const refs = useMembershipRefs(myTournaments)
  const [clips, setClips] = useState<VideoClip[]>(NO_CLIPS)

  useEffect(() => {
    if (!enabled) return
    let isCurrent = true
    getMyVideoClips(refs)
      .then((loaded) => {
        if (isCurrent) setClips(loaded)
      })
      .catch(() => {
        if (isCurrent) setClips(NO_CLIPS)
      })
    return () => {
      isCurrent = false
    }
  }, [enabled, refs])

  return enabled ? clips : NO_CLIPS
}
