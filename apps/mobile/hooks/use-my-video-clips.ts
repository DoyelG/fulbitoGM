import { getMyVideoClips } from '@fulbito/firebase'
import type { VideoClip } from '@fulbito/types'
import { useEffect, useState } from 'react'

import { useMembershipRefs } from '@/hooks/use-membership-refs'

const NO_CLIPS: VideoClip[] = []

export function useMyVideoClips(enabled: boolean): VideoClip[] {
  const refs = useMembershipRefs()
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
